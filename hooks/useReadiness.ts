import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { captureError } from '@/lib/sentry';

export interface ScoreBreakdown {
  hydration: number;
  activity: number;
  sleep: number;
  nutrition: number;
  mental: number;
}

export interface DailyScore {
  score: number;
  breakdown: ScoreBreakdown;
  date: string;
  meta: {
    stressCapped: boolean;
    hasWaterLog: boolean;
    hasSleepLog: boolean;
    hasMentalCheckin: boolean;
    hasMealsLog: boolean;
    steps: number;
    totalMl: number;
    totalCalories: number;
  };
}

export interface ScoreHistory {
  date: string;
  total_score: number;
  hydration_pct: number;
  sleep_pct: number;
  activity_pct: number;
  nutrition_pct: number;
  mental_pct: number;
}

export interface ScoreReason {
  text: string;
  impact: number;
  type: 'positive' | 'negative';
}

export interface SimilarDayComparison {
  message: string;
  delta: number;
}

export interface FocusAction {
  title: string;
  route: string;
  metric: keyof ScoreBreakdown;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

function normalizeDailyScorePayload(raw: any, date: string): DailyScore {
  if (typeof raw?.score === 'number' && raw?.breakdown) {
    return raw as DailyScore;
  }

  return {
    score: Number(raw?.total ?? raw?.total_score ?? 0),
    date: raw?.date ?? date,
    breakdown: {
      hydration: Number(raw?.hydration ?? raw?.hydration_pct ?? 0),
      activity: Number(raw?.activity ?? raw?.activity_pct ?? 0),
      sleep: Number(raw?.sleep ?? raw?.sleep_pct ?? 0),
      nutrition: Number(raw?.nutrition ?? raw?.nutrition_pct ?? 0),
      mental: Number(raw?.mental ?? raw?.mental_pct ?? 0),
    },
    meta: {
      stressCapped: Boolean(raw?.cappedByStress ?? raw?.stressCapped ?? false),
      hasWaterLog: Boolean(raw?.meta?.hasWaterLog ?? false),
      hasSleepLog: Boolean(raw?.meta?.hasSleepLog ?? false),
      hasMentalCheckin: Boolean(raw?.meta?.hasMentalCheckin ?? false),
      hasMealsLog: Boolean(raw?.meta?.hasMealsLog ?? false),
      steps: Number(raw?.meta?.steps ?? 0),
      totalMl: Number(raw?.meta?.totalMl ?? 0),
      totalCalories: Number(raw?.meta?.totalCalories ?? 0),
    },
  };
}

function buildScoreReasons(score: DailyScore | null): ScoreReason[] {
  if (!score) return [];

  const weights: Record<keyof ScoreBreakdown, number> = {
    hydration: 0.2,
    activity: 0.2,
    sleep: 0.25,
    nutrition: 0.15,
    mental: 0.2,
  };
  const labels: Record<keyof ScoreBreakdown, string> = {
    hydration: 'Hidratación',
    activity: 'Pasos',
    sleep: 'Sueño',
    nutrition: 'Nutrición',
    mental: 'Mental',
  };

  const baseReasons = (Object.keys(score.breakdown) as Array<keyof ScoreBreakdown>)
    .map((key) => {
      const value = score.breakdown[key];
      const impact = Math.round(((value - 65) * weights[key]) / 5);
      return {
        text: `${labels[key]} ${impact >= 0 ? 'suma' : 'resta'} (${impact >= 0 ? '+' : ''}${impact})`,
        impact,
        type: impact >= 0 ? 'positive' : 'negative',
      } as ScoreReason;
    })
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  if (!score.meta.hasMentalCheckin) {
    baseReasons.push({ text: 'Sin check-in mental hoy', impact: -4, type: 'negative' });
  }
  if (!score.meta.hasSleepLog) {
    baseReasons.push({ text: 'Sin registro de sueño', impact: -5, type: 'negative' });
  }

  return baseReasons.slice(0, 3);
}

function predictEndOfDayScore(score: DailyScore | null): number | null {
  if (!score) return null;

  const weights: Record<keyof ScoreBreakdown, number> = {
    hydration: 0.2,
    activity: 0.2,
    sleep: 0.25,
    nutrition: 0.15,
    mental: 0.2,
  };

  let potentialGain = 0;
  (Object.keys(score.breakdown) as Array<keyof ScoreBreakdown>).forEach((key) => {
    const current = score.breakdown[key];
    if (current < 80) {
      potentialGain += (80 - current) * weights[key];
    }
  });

  const estimated = Math.round(score.score + potentialGain * 0.35);
  const cap = score.meta.stressCapped ? 75 : 100;
  return Math.max(score.score, Math.min(cap, estimated));
}

function buildMorningNarrative(score: DailyScore | null): string | null {
  if (!score) return null;
  const entries = Object.entries(score.breakdown) as Array<[keyof ScoreBreakdown, number]>;
  if (!entries.length) return null;

  const best = [...entries].sort((a, b) => b[1] - a[1])[0];
  const lowest = [...entries].sort((a, b) => a[1] - b[1])[0];

  const labels: Record<keyof ScoreBreakdown, string> = {
    hydration: 'hidratación',
    activity: 'actividad',
    sleep: 'sueño',
    nutrition: 'nutrición',
    mental: 'estado mental',
  };

  return `Tu punto fuerte hoy es ${labels[best[0]]} (${best[1]}). Oportunidad principal: ${labels[lowest[0]]} (${lowest[1]}).`;
}

function averageScore(rows: ScoreHistory[]): number | null {
  if (!rows.length) return null;
  return Math.round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / rows.length);
}

function normalizeDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function isNextCalendarDay(previous: string, current: string): boolean {
  const prev = normalizeDateOnly(previous);
  const cur = normalizeDateOnly(current);
  const diffMs = prev.getTime() - cur.getTime();
  return diffMs === 24 * 60 * 60 * 1000;
}

function buildSimilarDayComparison(
  history: ScoreHistory[],
  todayScore: DailyScore | null,
): SimilarDayComparison | null {
  if (!todayScore) return null;
  const todayDate = todayScore.date;
  const weekday = normalizeDateOnly(todayDate).getDay();
  const sameWeekdayPast = history.filter((row) => row.date !== todayDate && normalizeDateOnly(row.date).getDay() === weekday);
  if (sameWeekdayPast.length < 3) return null;

  const avg = Math.round(
    sameWeekdayPast.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / sameWeekdayPast.length,
  );
  const delta = todayScore.score - avg;
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const dayName = dayNames[weekday] ?? 'día';
  const trendText =
    delta > 0
      ? `por encima de tu promedio`
      : delta < 0
        ? `por debajo de tu promedio`
        : `igual a tu promedio`;

  return {
    delta,
    message: `Los ${dayName}s solés promediar ${avg}. Hoy estás en ${todayScore.score}, ${trendText}.`,
  };
}

function buildQualityStreak(history: ScoreHistory[]): number {
  if (!history.length) return 0;
  const sortedDesc = [...history].sort((a, b) => normalizeDateOnly(b.date).getTime() - normalizeDateOnly(a.date).getTime());
  let streak = 0;
  let previousDate: string | null = null;

  for (const row of sortedDesc) {
    const score = Number(row.total_score ?? 0);
    if (score < 60) break;

    if (previousDate !== null && !isNextCalendarDay(previousDate, row.date)) {
      break;
    }

    streak += 1;
    previousDate = row.date;
  }

  return streak;
}

function buildFocusActions(score: DailyScore | null): FocusAction[] {
  if (!score) return [];
  const shouldFocus = score.score < 60 || score.breakdown.mental < 45;
  if (!shouldFocus) return [];

  const moduleByMetric: Record<keyof ScoreBreakdown, { title: string; route: string }> = {
    hydration: { title: 'Tomá un vaso de agua', route: '/modules/water' },
    activity: { title: 'Hacé una caminata corta', route: '/modules/steps' },
    sleep: { title: 'Planificá tu sueño de hoy', route: '/modules/sleep' },
    nutrition: { title: 'Registrá una comida simple', route: '/modules/nutrition' },
    mental: { title: 'Hacé un check-in mental', route: '/modules/mental' },
  };

  return (Object.entries(score.breakdown) as Array<[keyof ScoreBreakdown, number]>)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([metric]) => ({
      metric,
      title: moduleByMetric[metric].title,
      route: moduleByMetric[metric].route,
    }));
}

function buildCrossModuleInsights(history: ScoreHistory[]): string[] {
  if (history.length < 10) return [];
  const insights: string[] = [];

  const highHydration = history.filter((row) => Number(row.hydration_pct ?? 0) >= 80);
  const lowHydration = history.filter((row) => Number(row.hydration_pct ?? 0) < 60);
  if (highHydration.length >= 4 && lowHydration.length >= 4) {
    const avgSleepHighHydration = Math.round(
      highHydration.reduce((sum, row) => sum + Number(row.sleep_pct ?? 0), 0) / highHydration.length,
    );
    const avgSleepLowHydration = Math.round(
      lowHydration.reduce((sum, row) => sum + Number(row.sleep_pct ?? 0), 0) / lowHydration.length,
    );
    const diff = avgSleepHighHydration - avgSleepLowHydration;
    if (Math.abs(diff) >= 6) {
      insights.push(
        diff > 0
          ? `En tus días con hidratación alta, tu sueño sube ~${diff} puntos.`
          : `Cuando hidratás menos, tu sueño cae ~${Math.abs(diff)} puntos.`,
      );
    }
  }

  const highSleep = history.filter((row) => Number(row.sleep_pct ?? 0) >= 75);
  const lowSleep = history.filter((row) => Number(row.sleep_pct ?? 0) < 55);
  if (highSleep.length >= 4 && lowSleep.length >= 4) {
    const avgScoreHighSleep = Math.round(
      highSleep.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / highSleep.length,
    );
    const avgScoreLowSleep = Math.round(
      lowSleep.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / lowSleep.length,
    );
    const diff = avgScoreHighSleep - avgScoreLowSleep;
    if (Math.abs(diff) >= 6) {
      insights.push(
        diff > 0
          ? `Cuando dormís mejor, tu score total mejora ~${diff} puntos.`
          : `Tus días de poco sueño suelen impactar ~${Math.abs(diff)} puntos en el score.`,
      );
    }
  }

  const highNutrition = history.filter((row) => Number(row.nutrition_pct ?? 0) >= 70);
  const lowNutrition = history.filter((row) => Number(row.nutrition_pct ?? 0) < 50);
  if (highNutrition.length >= 4 && lowNutrition.length >= 4) {
    const avgMentalHighNutrition = Math.round(
      highNutrition.reduce((sum, row) => sum + Number(row.mental_pct ?? 0), 0) / highNutrition.length,
    );
    const avgMentalLowNutrition = Math.round(
      lowNutrition.reduce((sum, row) => sum + Number(row.mental_pct ?? 0), 0) / lowNutrition.length,
    );
    const diff = avgMentalHighNutrition - avgMentalLowNutrition;
    if (Math.abs(diff) >= 6) {
      insights.push(
        diff > 0
          ? `Con mejor nutrición, tu métrica mental sube ~${diff} puntos.`
          : `Tus días de nutrición baja suelen impactar ~${Math.abs(diff)} puntos en lo mental.`,
      );
    }
  }

  return insights.slice(0, 2);
}

export function useReadiness() {
  const { session } = useAuthStore();
  const [dailyScore, setDailyScore] = useState<DailyScore | null>(null);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0] ?? '';
  const lastCalculatedDate = useRef<string | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!session?.access_token) return {};
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };
  }, [session?.access_token]);

  const calculate = useCallback(
    async (date: string = today, silent = false): Promise<DailyScore | null> => {
      if (!session?.access_token) return null;
      if (!silent) setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BACKEND_URL}/scores/calculate`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ date }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const data = normalizeDailyScorePayload(payload, date);

        setDailyScore(data);
        lastCalculatedDate.current = date;
        return data;
      } catch (err: any) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useReadiness.calculate',
        });
        setError('Sin conexión por ahora. Mostramos tu último estado disponible.');
        return null;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [getAuthHeaders, session?.access_token, today],
  );

  const fetchHistory = useCallback(
    async (days: number = 35) => {
      if (!session?.access_token) return;
      try {
        const res = await fetch(`${BACKEND_URL}/scores/history?days=${days}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data as ScoreHistory[]);
        } else {
          setHistory((data.history ?? []) as ScoreHistory[]);
        }
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useReadiness.fetchHistory',
        });
      }
    },
    [getAuthHeaders, session?.access_token],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([calculate(today, true), fetchHistory(35)]);
    setRefreshing(false);
  }, [calculate, fetchHistory, today]);

  const recalculate = useCallback(() => {
    void calculate(today, true);
  }, [calculate, today]);

  function scoreColor(score: number): string {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  }

  function scoreLabel(score: number): string {
    if (score >= 90) return 'Día excepcional';
    if (score >= 80) return 'Muy buen día';
    if (score >= 70) return 'Buen día';
    if (score >= 60) return 'Día regular';
    if (score >= 40) return 'Podés mejorar';
    return 'Empezá por un paso pequeño';
  }

  useEffect(() => {
    void Promise.all([calculate(today), fetchHistory(35)]);
  }, [calculate, fetchHistory, today]);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0] ?? '';
    if (lastCalculatedDate.current && lastCalculatedDate.current !== currentDate) {
      void calculate(currentDate);
    }
  }, [calculate]);

  const momentum14 = [...history]
    .slice(-14)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weeklyAverage = averageScore(sortedHistory.slice(-7));
  const monthlyAverage = averageScore(sortedHistory.slice(-30));
  const similarDayComparison = buildSimilarDayComparison(sortedHistory, dailyScore);
  const qualityScoreStreak = buildQualityStreak(sortedHistory);
  const focusActions = buildFocusActions(dailyScore);
  const crossModuleInsights = buildCrossModuleInsights(sortedHistory);

  return {
    dailyScore,
    history,
    loading,
    refreshing,
    error,
    refresh,
    recalculate,
    scoreColor,
    scoreLabel,
    calculate,
    scoreReasons: buildScoreReasons(dailyScore),
    predictedScore: predictEndOfDayScore(dailyScore),
    momentum14,
    morningNarrative: buildMorningNarrative(dailyScore),
    weeklyAverage,
    monthlyAverage,
    similarDayComparison,
    qualityScoreStreak,
    focusActions,
    crossModuleInsights,
  };
}
