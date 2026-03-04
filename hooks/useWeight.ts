import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

export interface WeightLog {
  id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  photo_url: string | null;
  note: string | null;
  logged_at: string;
}

export interface WeightStats {
  current: number | null;
  start: number | null;
  goal: number | null;
  bmi: number | null;
  bmiCategory: string;
  totalLost: number | null;
  toGoal: number | null;
  trend: 'down' | 'up' | 'stable' | null;
  isNewMin: boolean;
}

export function useWeight() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<WeightStats>({
    current: null,
    start: null,
    goal: null,
    bmi: null,
    bmiCategory: '',
    totalLost: null,
    toGoal: null,
    trend: null,
    isNewMin: false,
  });

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(90);

      if (error) throw error;
      setLogs(data ?? []);
      computeStats(data ?? []);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWeight.fetchLogs" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  function computeStats(data: WeightLog[]) {
    if (!profile) return;

    const heightM = (profile.height_cm ?? 170) / 100;
    const goalKg = profile.weight_goal_kg ?? null;
    const startKg = profile.weight_start_kg ?? null;

    const current = data[0]?.weight_kg ?? null;
    const bmi = current ? Math.round((current / (heightM * heightM)) * 10) / 10 : null;
    const bmiCategory = bmi ? getBmiCategory(bmi) : '';

    const totalLost =
      startKg && current ? Math.round((startKg - current) * 10) / 10 : null;
    const toGoal =
      goalKg && current ? Math.round((current - goalKg) * 10) / 10 : null;

    // Tendencia: comparar último vs promedio de los 7 anteriores
    let trend: WeightStats['trend'] = null;
    if (data.length >= 3) {
      const recent = data.slice(0, 3).reduce((a, b) => a + b.weight_kg, 0) / 3;
      const older = data.slice(3, 8);
      if (older.length > 0) {
        const olderAvg = older.reduce((a, b) => a + b.weight_kg, 0) / older.length;
        const diff = recent - olderAvg;
        if (diff < -0.2) trend = 'down';
        else if (diff > 0.2) trend = 'up';
        else trend = 'stable';
      }
    }

    // Nuevo mínimo histórico
    const allWeights = data.map((l) => l.weight_kg);
    const isNewMin =
      current !== null &&
      allWeights.length > 1 &&
      current === Math.min(...allWeights);

    setStats({
      current,
      start: startKg,
      goal: goalKg,
      bmi,
      bmiCategory,
      totalLost,
      toGoal,
      trend,
      isNewMin,
    });
  }

  const logWeight = useCallback(
    async (
      weightKg: number,
      bodyFatPct?: number,
      note?: string,
    ): Promise<{ isNewMin: boolean }> => {
      if (!userId) return { isNewMin: false };
      setSaving(true);
      try {
        const allWeights = logs.map((l) => l.weight_kg);
        const isNewMin = allWeights.length > 0 && weightKg < Math.min(...allWeights);

        const { error } = await supabase.from('weight_logs').insert({
          user_id: userId,
          weight_kg: weightKg,
          body_fat_pct: bodyFatPct ?? null,
          note: note ?? null,
          logged_at: new Date().toISOString(),
        });

        if (error) throw error;

        // Actualizar peso actual en perfil
        await supabase
          .from('profiles')
          .update({ weight_current_kg: weightKg })
          .eq('id', userId);

        await fetchLogs();
        return { isNewMin };
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWeight.logWeight" });
        return { isNewMin: false };
      } finally {
        setSaving(false);
      }
    },
    [userId, logs, fetchLogs],
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      if (!userId) return;
      try {
        const { error } = await supabase
          .from('weight_logs')
          .delete()
          .eq('id', logId)
          .eq('user_id', userId);
        if (error) throw error;
        await fetchLogs();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWeight.deleteLog" });
      }
    },
    [userId, fetchLogs],
  );

  // Datos para gráfico de línea (últimos N días)
  function getChartData(days: 30 | 60 | 90 = 30): { date: string; weight: number }[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return logs
      .filter((l) => new Date(l.logged_at) >= cutoff)
      .map((l) => ({
        date: new Date(l.logged_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        weight: l.weight_kg,
      }))
      .reverse();
  }

  // Proyección IA (cálculo simple de tendencia)
  function getProjectionWeeks(): number | null {
    if (!stats.goal || !stats.current || stats.trend !== 'down') return null;
    if (logs.length < 5) return null;

    const recent5 = logs.slice(0, 5);
    const oldest = recent5[recent5.length - 1];
    const newest = recent5[0];
    const daysDiff =
      (new Date(newest.logged_at).getTime() - new Date(oldest.logged_at).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysDiff === 0) return null;

    const kgPerDay = (oldest.weight_kg - newest.weight_kg) / daysDiff;
    if (kgPerDay <= 0) return null;

    const remaining = newest.weight_kg - stats.goal;
    if (remaining <= 0) return 0;

    const daysNeeded = remaining / kgPerDay;
    return Math.round(daysNeeded / 7);
  }

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    stats,
    loading,
    saving,
    logWeight,
    deleteLog,
    getChartData,
    getProjectionWeeks,
    refresh: fetchLogs,
  };
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}


