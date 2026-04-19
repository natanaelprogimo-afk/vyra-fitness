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

const SCORE_BREAKDOWN_KEYS = ['hydration', 'activity', 'sleep', 'nutrition', 'mental'] as const;

function asObjectRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function toNumericScore(value: unknown): number {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function normalizeScoreBreakdown(raw: unknown): ScoreBreakdown {
  const source = asObjectRecord(raw);

  return {
    hydration: toNumericScore(source.hydration ?? source.hydration_pct),
    activity: toNumericScore(source.activity ?? source.activity_pct ?? source.steps),
    sleep: toNumericScore(source.sleep ?? source.sleep_pct),
    nutrition: toNumericScore(source.nutrition ?? source.nutrition_pct),
    mental: toNumericScore(source.mental ?? source.mental_pct),
  };
}

function getScoreBreakdownEntries(score: DailyScore | null): Array<[keyof ScoreBreakdown, number]> {
  if (!score) return [];
  return SCORE_BREAKDOWN_KEYS.map((key) => [key, toNumericScore(score.breakdown[key])]);
}

export function normalizeDailyScorePayload(raw: unknown, date: string): DailyScore {
  const source = asObjectRecord(raw);
  const metaSource = asObjectRecord(source.meta);

  return {
    score: toNumericScore(source.score ?? source.total ?? source.total_score),
    date: typeof source.date === 'string' && source.date.length > 0 ? source.date : date,
    breakdown: normalizeScoreBreakdown(source.breakdown ?? source),
    meta: {
      stressCapped: Boolean(metaSource.stressCapped ?? source.cappedByStress ?? source.stressCapped ?? false),
      hasWaterLog: Boolean(metaSource.hasWaterLog ?? source.hasWaterLog ?? false),
      hasSleepLog: Boolean(metaSource.hasSleepLog ?? source.hasSleepLog ?? false),
      hasMentalCheckin: Boolean(metaSource.hasMentalCheckin ?? source.hasMentalCheckin ?? false),
      hasMealsLog: Boolean(metaSource.hasMealsLog ?? source.hasMealsLog ?? false),
      steps: toNumericScore(metaSource.steps ?? source.steps),
      totalMl: toNumericScore(metaSource.totalMl ?? source.totalMl),
      totalCalories: toNumericScore(metaSource.totalCalories ?? source.totalCalories),
    },
  };
}

export function buildScoreReasons(score: DailyScore | null): ScoreReason[] {
  if (!score) return [];

  const weights: Record<keyof ScoreBreakdown, number> = {
    hydration: 0.2,
    activity: 0.2,
    sleep: 0.25,
    nutrition: 0.15,
    mental: 0.2,
  };
  const labels: Record<keyof ScoreBreakdown, string> = {
    hydration: 'Hidratacion',
    activity: 'Pasos',
    sleep: 'Sueno',
    nutrition: 'Nutricion',
    mental: 'Mental',
  };

  const baseReasons = getScoreBreakdownEntries(score)
    .map(([key, value]) => {
      const impact = Math.round(((value - 65) * weights[key]) / 5);
      const text =
        value >= 80
          ? `${labels[key]} hoy sostiene bien el dia`
          : value <= 45
            ? `${labels[key]} hoy necesita atencion`
            : `${labels[key]} esta en zona media`;

      return {
        text,
        impact,
        type: impact >= 0 ? 'positive' : 'negative',
      } as ScoreReason;
    })
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  if (!score.meta.hasMentalCheckin) {
    baseReasons.push({ text: 'Sin check-in mental hoy', impact: -4, type: 'negative' });
  }
  if (!score.meta.hasSleepLog) {
    baseReasons.push({ text: 'Sin registro de sueno', impact: -5, type: 'negative' });
  }

  return baseReasons.slice(0, 3);
}

export function predictEndOfDayScore(score: DailyScore | null): number | null {
  if (!score) return null;

  const weights: Record<keyof ScoreBreakdown, number> = {
    hydration: 0.2,
    activity: 0.2,
    sleep: 0.25,
    nutrition: 0.15,
    mental: 0.2,
  };

  let potentialGain = 0;
  getScoreBreakdownEntries(score).forEach(([key, current]) => {
    if (current < 80) {
      potentialGain += (80 - current) * weights[key];
    }
  });

  const estimated = Math.round(score.score + potentialGain * 0.35);
  const cap = score.meta.stressCapped ? 75 : 100;
  return Math.max(score.score, Math.min(cap, estimated));
}

export function buildMorningNarrative(score: DailyScore | null): string | null {
  if (!score) return null;
  const entries = getScoreBreakdownEntries(score);
  if (!entries.length) return null;

  const best = [...entries].sort((a, b) => b[1] - a[1])[0];
  const lowest = [...entries].sort((a, b) => a[1] - b[1])[0];

  const labels: Record<keyof ScoreBreakdown, string> = {
    hydration: 'hidratacion',
    activity: 'actividad',
    sleep: 'sueno',
    nutrition: 'nutricion',
    mental: 'estado mental',
  };

  if (lowest[0] === 'hydration' && !score.meta.hasWaterLog) {
    return 'Hoy no hay agua registrada. Un vaso ahora seria el mejor primer paso.';
  }

  if (lowest[0] === 'sleep' && !score.meta.hasSleepLog) {
    return 'Hoy no hay sueno registrado. Toma cualquier lectura como una estimacion.';
  }

  if (lowest[1] >= 75) {
    return `Tu base hoy se ve pareja. Lo mejor es sostener ${labels[best[0]]}.`;
  }

  return `Tu punto fuerte hoy es ${labels[best[0]]}. La mejor oportunidad ahora es ${labels[lowest[0]]}.`;
}

export function averageScore(rows: ScoreHistory[]): number | null {
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

export function buildSimilarDayComparison(
  history: ScoreHistory[],
  todayScore: DailyScore | null,
): SimilarDayComparison | null {
  if (!todayScore) return null;
  const todayDate = todayScore.date;
  const weekday = normalizeDateOnly(todayDate).getDay();
  const sameWeekdayPast = history.filter(
    (row) => row.date !== todayDate && normalizeDateOnly(row.date).getDay() === weekday,
  );
  if (sameWeekdayPast.length < 3) return null;

  const avg = Math.round(
    sameWeekdayPast.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / sameWeekdayPast.length,
  );
  const delta = todayScore.score - avg;
  const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const dayName = dayNames[weekday] ?? 'dia';
  const trendText =
    delta > 0
      ? 'por encima de tu promedio'
      : delta < 0
        ? 'por debajo de tu promedio'
        : 'igual a tu promedio';

  return {
    delta,
    message: `Los ${dayName}s sueles moverte cerca de ${avg}. Hoy estas en ${todayScore.score}, ${trendText}.`,
  };
}

export function buildQualityStreak(history: ScoreHistory[]): number {
  if (!history.length) return 0;
  const sortedDesc = [...history].sort(
    (a, b) => normalizeDateOnly(b.date).getTime() - normalizeDateOnly(a.date).getTime(),
  );
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

export function buildFocusActions(score: DailyScore | null): FocusAction[] {
  if (!score) return [];
  const shouldFocus = score.score < 60 || score.breakdown.mental < 45;
  if (!shouldFocus) return [];

  const moduleByMetric: Record<keyof ScoreBreakdown, { title: string; route: string }> = {
    hydration: { title: 'Toma un vaso de agua', route: '/modules/water' },
    activity: { title: 'Haz una caminata corta', route: '/modules/steps' },
    sleep: { title: 'Planifica el sueno de hoy', route: '/modules/sleep' },
    nutrition: { title: 'Registra una comida simple', route: '/modules/nutrition' },
    mental: { title: 'Haz un check-in mental', route: '/daily-summary' },
  };

  return getScoreBreakdownEntries(score)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([metric]) => ({
      metric,
      title: moduleByMetric[metric].title,
      route: moduleByMetric[metric].route,
    }));
}

export function buildCrossModuleInsights(history: ScoreHistory[]): string[] {
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
          ? 'En tus dias con mejor agua, el sueno suele verse mas estable.'
          : 'Cuando hidratas menos, el sueno suele caer.',
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
          ? 'Cuando duermes mejor, el dia suele salir mas estable.'
          : 'Tus dias de poco sueno suelen dejarte mas irregular.',
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
          ? 'Con mejor nutricion, tu senal mental suele verse mejor.'
          : 'Los dias de nutricion floja suelen notarse en lo mental.',
      );
    }
  }

  return insights.slice(0, 2);
}
