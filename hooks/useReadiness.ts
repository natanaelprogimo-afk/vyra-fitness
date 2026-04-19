import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  averageScore,
  buildCrossModuleInsights,
  buildFocusActions,
  buildMorningNarrative,
  buildScoreReasons,
  buildQualityStreak,
  buildSimilarDayComparison,
  normalizeDailyScorePayload,
  predictEndOfDayScore,
} from '@/lib/readiness-score';
import type { DailyScore, ScoreHistory } from '@/lib/readiness-score';
import { captureError } from '@/lib/sentry';

export type {
  DailyScore,
  FocusAction,
  ScoreBreakdown,
  ScoreHistory,
  ScoreReason,
  SimilarDayComparison,
} from '@/lib/readiness-score';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

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
        setError('Sin conexion por ahora. Mostramos tu ultimo estado disponible.');
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
    return 'Empieza por un paso pequeño';
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
