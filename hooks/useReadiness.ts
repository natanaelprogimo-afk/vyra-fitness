import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { captureError } from '@/lib/sentry';

export interface ScoreBreakdown {
  hydration:  number; // 0–100
  activity:   number;
  sleep:      number;
  nutrition:  number;
  mental:     number;
}

export interface DailyScore {
  score:     number;
  breakdown: ScoreBreakdown;
  date:      string;
  meta: {
    stressCapped:     boolean;
    hasWaterLog:      boolean;
    hasSleepLog:      boolean;
    hasMentalCheckin: boolean;
    hasMealsLog:      boolean;
    steps:            number;
    totalMl:          number;
    totalCalories:    number;
  };
}

export interface ScoreHistory {
  date:          string;
  total_score:   number;
  hydration_pct: number;
  sleep_pct:     number;
  activity_pct:  number;
  nutrition_pct: number;
  mental_pct:    number;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

export function useReadiness() {
  const { session } = useAuthStore();
  const [dailyScore, setDailyScore] = useState<DailyScore | null>(null);
  const [history,    setHistory]    = useState<ScoreHistory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const lastCalculatedDate = useRef<string | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!session?.access_token) return {};
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };
  }, [session?.access_token]);

  // ── Calcular el score del día ──────────────────────────────────────
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
        const data: DailyScore = await res.json();

        setDailyScore(data);
        lastCalculatedDate.current = date;
        return data;
      } catch (err: any) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useReadiness.calculate" });
        setError('Sin señal por aquí 📡 — el score se actualiza cuando vuelva la conexión.');
        return null;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [session?.access_token, getAuthHeaders, today],
  );

  // ── Cargar historial de 7 días ─────────────────────────────────────
  const fetchHistory = useCallback(
    async (days: number = 7) => {
      if (!session?.access_token) return;
      try {
        const res = await fetch(`${BACKEND_URL}/scores/history?days=${days}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        setHistory(data.history ?? []);
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useReadiness.fetchHistory" });
      }
    },
    [session?.access_token, getAuthHeaders],
  );

  // ── Refresh manual (pull-to-refresh) ──────────────────────────────
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([calculate(today, true), fetchHistory()]);
    setRefreshing(false);
  }, [calculate, fetchHistory, today]);

  // ── Recalcular silenciosamente después de cada log ─────────────────
  // Llamar a esta función desde cualquier hook que registre un log
  const recalculate = useCallback(() => {
    calculate(today, true); // silent = no muestra spinner
  }, [calculate, today]);

  // ── Color semáforo del score ───────────────────────────────────────
  function scoreColor(score: number): string {
    if (score >= 80) return '#10B981'; // success
    if (score >= 60) return '#F59E0B'; // warning
    return '#EF4444';                  // error
  }

  function scoreLabel(score: number): string {
    if (score >= 90) return '¡Día excepcional!';
    if (score >= 80) return 'Muy buen día';
    if (score >= 70) return 'Buen día';
    if (score >= 60) return 'Día regular';
    if (score >= 40) return 'Podés mejorar';
    return 'Empezá por un paso pequeño';
  }

  useEffect(() => {
    // Calcular al montar + cargar historial
    Promise.all([calculate(today), fetchHistory()]);
  }, []);

  // Si cambia el día (el usuario usa la app en 2 días distintos), recalcular
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    if (lastCalculatedDate.current && lastCalculatedDate.current !== currentDate) {
      calculate(currentDate);
    }
  });

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
  };
}


