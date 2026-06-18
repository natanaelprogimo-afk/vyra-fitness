import { useCallback, useEffect, useMemo, useState } from 'react';
import { isGuestAuthUser } from '@/lib/guest-auth';
import { useAuthStore } from '@/stores/authStore';
import { captureError } from '@/lib/sentry';
import {
  averageScore,
  buildCrossModuleInsights,
  buildFocusActions,
  buildMorningNarrative,
  buildQualityStreak,
  buildScoreHistoryRow,
  buildSimilarDayComparison,
  normalizeDailyScorePayload,
  predictEndOfDayScore,
  type DailyScore,
  type FocusAction,
  type ScoreBreakdown,
  type ScoreHistory,
  type SimilarDayComparison,
} from '@/lib/readiness-score';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_BACKEND_URL ??
  '';

type CalculateResponse = {
  success?: boolean;
  data?: unknown;
  error?: string;
};

type HistoryResponse = {
  success?: boolean;
  data?: Array<Record<string, unknown>>;
};

function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Día excepcional';
  if (score >= 80) return 'Muy buen día';
  if (score >= 70) return 'Buen día';
  if (score >= 60) return 'Día regular';
  if (score >= 40) return 'Podes mejorar';
  return 'Empieza por un paso pequeno';
}

function normalizeHistoryRows(rows: Array<Record<string, unknown>>): ScoreHistory[] {
  return rows.map((row) => {
    const date =
      typeof row.date === 'string' && row.date.trim().length > 0
        ? row.date
        : todayIsoDate();
    const normalized = normalizeDailyScorePayload(row, date);
    return buildScoreHistoryRow(normalized);
  });
}

export type { DailyScore, ScoreBreakdown, ScoreHistory, SimilarDayComparison, FocusAction };

export function useReadiness() {
  const { session } = useAuthStore();

  const [dailyScore, setDailyScore] = useState<DailyScore | null>(null);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!session?.access_token) return {};

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };
  }, [session?.access_token]);

  const calculate = useCallback(
    async (date: string = todayIsoDate(), silent = false): Promise<DailyScore | null> => {
      if (!session?.access_token || isGuestAuthUser(session.user)) {
        setDailyScore(null);
        setError(null);
        return null;
      }

      if (!silent) setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/scores/calculate`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ date }),
        });

        if (!res.ok) {
          setDailyScore(null);
          setError(null);
          return null;
        }

        const payload = (await res.json()) as CalculateResponse;
        if (!payload.success || !payload.data) {
          setDailyScore(null);
          setError(null);
          return null;
        }

        const normalized = normalizeDailyScorePayload(
          { ...(payload.data as Record<string, unknown>), date },
          date,
        );

        setDailyScore(normalized);
        setHistory((prev) => {
          const row = buildScoreHistoryRow(normalized);
          const existingIndex = prev.findIndex((entry) => entry.date === row.date);
          if (existingIndex === -1) {
            return [...prev, row];
          }

          return prev.map((entry, index) => (index === existingIndex ? row : entry));
        });

        return normalized;
      } catch (err: unknown) {
        setError('No pudimos calcular tu puntuacion. Intenta mas tarde.');
        const resolvedError = err instanceof Error ? err : new Error(String(err));
        captureError(resolvedError, {
          action: 'useReadiness.calculate',
          context: { date },
        });
        return null;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [getAuthHeaders, session?.access_token],
  );

  const fetchHistory = useCallback(
    async (days: number = 30) => {
      if (!session?.access_token || isGuestAuthUser(session.user)) {
        setDailyScore(null);
        setHistory([]);
        setError(null);
        return [];
      }

      try {
        const res = await fetch(
          `${BACKEND_URL}/api/scores/history?days=${Math.min(days, 365)}`,
          { headers: getAuthHeaders() },
        );

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setDailyScore(null);
            setHistory([]);
            setError(null);
            return [];
          }

          throw new Error(`HTTP ${res.status}`);
        }

        const payload = (await res.json()) as HistoryResponse;
        if (!payload.success || !Array.isArray(payload.data)) {
          return [];
        }

        const normalized = normalizeHistoryRows(payload.data);
        setHistory(normalized);
        return normalized;
      } catch (err: unknown) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useReadiness.fetchHistory',
        });
        return [];
      }
    },
    [getAuthHeaders, session?.access_token],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const today = todayIsoDate();
      await Promise.all([
        calculate(today, true),
        fetchHistory(30),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [calculate, fetchHistory]);

  useEffect(() => {
    if (!session?.access_token) {
      setDailyScore(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    const today = todayIsoDate();
    void Promise.all([
      calculate(today),
      fetchHistory(30),
    ]);
  }, [session?.access_token, calculate, fetchHistory]);

  const predictedScore = useMemo(() => predictEndOfDayScore(dailyScore), [dailyScore]);
  const weeklyAverage = useMemo(() => averageScore(history), [history]);
  const similarDayComparison = useMemo<SimilarDayComparison | null>(
    () => buildSimilarDayComparison(history, dailyScore),
    [history, dailyScore],
  );
  const focusActions = useMemo<FocusAction[]>(
    () => buildFocusActions(dailyScore),
    [dailyScore],
  );
  const morningNarrative = useMemo(() => buildMorningNarrative(dailyScore), [dailyScore]);
  const crossModuleInsights = useMemo(() => buildCrossModuleInsights(history), [history]);
  const qualityScoreStreak = useMemo(() => buildQualityStreak(history), [history]);

  return {
    score: dailyScore,
    dailyScore,
    loading,
    error,
    history,
    calculate,
    fetchHistory,
    refresh,
    refreshing,
    predictedScore,
    weeklyAverage,
    similarDayComparison,
    focusActions,
    morningNarrative,
    crossModuleInsights,
    qualityScoreStreak,
    scoreColor: (value: number) => getScoreColor(value),
    scoreLabel: (value: number) => getScoreLabel(value),
  };
}
