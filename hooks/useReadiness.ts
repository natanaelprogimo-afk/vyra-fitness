import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  averageScore,
  applyLocalWorkoutToDailyScore,
  buildCrossModuleInsights,
  buildFocusActions,
  buildMorningNarrative,
  buildScoreReasons,
  buildQualityStreak,
  buildSimilarDayComparison,
  normalizeDailyScorePayload,
  predictEndOfDayScore,
  upsertScoreHistoryRow,
} from '@/lib/readiness-score';
import type { DailyScore, ScoreHistory } from '@/lib/readiness-score';
import { captureError } from '@/lib/sentry';
import { useWorkoutStore } from '@/stores/workoutStore';

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
  const workoutHistory = useWorkoutStore((state) => state.history);
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
      } catch (err: unknown) {
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
    async (days: number = 95) => {
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
    await Promise.all([calculate(today, true), fetchHistory(95)]);
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
    if (score >= 40) return 'Podes mejorar';
    return 'Empieza por un paso pequeño';
  }

  useEffect(() => {
    void Promise.all([calculate(today), fetchHistory(95)]);
  }, [calculate, fetchHistory, today]);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0] ?? '';
    if (lastCalculatedDate.current && lastCalculatedDate.current !== currentDate) {
      void calculate(currentDate);
    }
  }, [calculate]);

  const hasLocalWorkoutToday = useMemo(
    () => workoutHistory.some((entry) => entry.started_at.slice(0, 10) === today),
    [today, workoutHistory],
  );
  const resolvedDailyScore = useMemo(
    () => applyLocalWorkoutToDailyScore(dailyScore, hasLocalWorkoutToday),
    [dailyScore, hasLocalWorkoutToday],
  );
  const resolvedHistory = useMemo(
    () => upsertScoreHistoryRow(history, resolvedDailyScore),
    [history, resolvedDailyScore],
  );

  const momentum14 = [...resolvedHistory]
    .slice(-14)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedHistory = [...resolvedHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weeklyAverage = averageScore(sortedHistory.slice(-7));
  const monthlyAverage = averageScore(sortedHistory.slice(-30));
  const similarDayComparison = buildSimilarDayComparison(sortedHistory, resolvedDailyScore);
  const qualityScoreStreak = buildQualityStreak(sortedHistory);
  const focusActions = buildFocusActions(resolvedDailyScore);
  const crossModuleInsights = buildCrossModuleInsights(sortedHistory);

  return {
    dailyScore: resolvedDailyScore,
    history: resolvedHistory,
    loading,
    refreshing,
    error,
    refresh,
    recalculate,
    scoreColor,
    scoreLabel,
    calculate,
    scoreReasons: buildScoreReasons(resolvedDailyScore),
    predictedScore: predictEndOfDayScore(resolvedDailyScore),
    momentum14,
    morningNarrative: buildMorningNarrative(resolvedDailyScore),
    weeklyAverage,
    monthlyAverage,
    similarDayComparison,
    qualityScoreStreak,
    focusActions,
    crossModuleInsights,
  };
}
