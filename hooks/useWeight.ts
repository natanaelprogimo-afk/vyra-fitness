import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { decryptSensitiveText, encryptSensitiveText } from '@/lib/sensitive-crypto';

export interface WeightLog {
  id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  photo_url: string | null;
  note: string | null;
  logged_at: string;
}

function parseEncryptedNumeric(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function roundForAnalytics(value: number, step: number): number {
  if (!Number.isFinite(value) || step <= 0) return value;
  return Math.round(value / step) * step;
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
  weeklyAverageCurrent: number | null;
  weeklyAveragePrevious: number | null;
  weeklyDelta: number | null;
  dailyDelta: number | null;
  variationContext: string | null;
  projectedGoalDate: string | null;
  plateauDetected: boolean;
  plateauMessage: string | null;
}

export function useWeight() {
  const { profile } = useAuthStore();
  const userId = profile?.id;
  const coachMemory =
    profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
      ? (profile.coach_memory_json as Record<string, unknown>)
      : {};
  const strictSensitiveMode = Boolean(coachMemory.privacy_strict_sensitive_mode);

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
    weeklyAverageCurrent: null,
    weeklyAveragePrevious: null,
    weeklyDelta: null,
    dailyDelta: null,
    variationContext: null,
    projectedGoalDate: null,
    plateauDetected: false,
    plateauMessage: null,
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
      const normalized = await Promise.all(
        (data ?? []).map(async (entry: any) => {
          const [decryptedNote, decryptedWeightRaw, decryptedBodyFatRaw] = await Promise.all([
            decryptSensitiveText(entry.note ?? null),
            decryptSensitiveText(entry.weight_kg_encrypted ?? null),
            decryptSensitiveText(entry.body_fat_pct_encrypted ?? null),
          ]);

          const decryptedWeight = parseEncryptedNumeric(decryptedWeightRaw);
          const decryptedBodyFat = parseEncryptedNumeric(decryptedBodyFatRaw);

          return {
            ...entry,
            weight_kg: decryptedWeight ?? Number(entry.weight_kg ?? 0),
            body_fat_pct:
              decryptedBodyFat !== null
                ? decryptedBodyFat
                : entry.body_fat_pct !== null && entry.body_fat_pct !== undefined
                  ? Number(entry.body_fat_pct)
                  : null,
            note: decryptedNote,
          };
        }),
      );
      setLogs(normalized as WeightLog[]);
      computeStats(normalized as WeightLog[]);
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
    const previous = data[1]?.weight_kg ?? null;
    const dailyDelta =
      current !== null && previous !== null
        ? Math.round((current - previous) * 10) / 10
        : null;

    const currentWeekValues = data.slice(0, 7).map((item) => item.weight_kg);
    const previousWeekValues = data.slice(7, 14).map((item) => item.weight_kg);
    const weeklyAverageCurrent = currentWeekValues.length
      ? Math.round((currentWeekValues.reduce((sum, val) => sum + val, 0) / currentWeekValues.length) * 10) / 10
      : current;
    const weeklyAveragePrevious = previousWeekValues.length
      ? Math.round((previousWeekValues.reduce((sum, val) => sum + val, 0) / previousWeekValues.length) * 10) / 10
      : null;
    const weeklyDelta =
      weeklyAverageCurrent !== null && weeklyAveragePrevious !== null
        ? Math.round((weeklyAverageCurrent - weeklyAveragePrevious) * 10) / 10
        : null;

    const bmi = current ? Math.round((current / (heightM * heightM)) * 10) / 10 : null;
    const bmiCategory = bmi ? getBmiCategory(bmi) : '';

    const totalLost =
      startKg && current ? Math.round((startKg - current) * 10) / 10 : null;
    const toGoal =
      goalKg && current ? Math.round((current - goalKg) * 10) / 10 : null;

    // Tendencia semanal como default (menos ruido que el peso diario)
    let trend: WeightStats['trend'] = null;
    if (weeklyDelta !== null) {
      if (weeklyDelta < -0.2) trend = 'down';
      else if (weeklyDelta > 0.2) trend = 'up';
      else trend = 'stable';
    }

    let variationContext: string | null = null;
    if (dailyDelta !== null && Math.abs(dailyDelta) <= 1.2) {
      if (dailyDelta > 0.3) {
        variationContext =
          'La subida diaria puede ser agua o digestión. Mirá el promedio semanal para evaluar progreso real.';
      } else if (dailyDelta < -0.3) {
        variationContext =
          'La baja diaria es positiva, pero seguí enfocándote en la tendencia semanal para evitar ansiedad.';
      } else {
        variationContext = 'Variación diaria normal. Tu progreso real se mide mejor por promedio semanal.';
      }
    }

    const referenceForProjection = weeklyAverageCurrent ?? current;
    const projectedGoalDate = calculateProjectedGoalDate({
      goalKg,
      currentKg: referenceForProjection,
      weeklyDelta,
    });

    const recent21 = data.slice(0, 21).map((item) => item.weight_kg);
    const plateauDetected =
      recent21.length >= 12 &&
      Math.max(...recent21) - Math.min(...recent21) <= 0.3 &&
      (profile.goal === 'lose_fat' || (toGoal !== null && toGoal > 0));
    const plateauMessage = plateauDetected
      ? 'Tu peso viene estable hace ~3 semanas. Probemos ajustar calorias, pasos o carga de entrenamiento para destrabar.'
      : null;

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
      weeklyAverageCurrent,
      weeklyAveragePrevious,
      weeklyDelta,
      dailyDelta,
      variationContext,
      projectedGoalDate,
      plateauDetected,
      plateauMessage,
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

        const encryptedNote = await encryptSensitiveText(note ?? null);
        const encryptedWeight = await encryptSensitiveText(String(weightKg));
        const encryptedBodyFat =
          bodyFatPct !== undefined && bodyFatPct !== null
            ? await encryptSensitiveText(String(bodyFatPct))
            : null;

        const analyticsWeight = roundForAnalytics(weightKg, strictSensitiveMode ? 2 : 0.5);
        const analyticsBodyFat =
          bodyFatPct !== undefined && bodyFatPct !== null
            ? roundForAnalytics(bodyFatPct, strictSensitiveMode ? 5 : 1)
            : null;

        const securePayload = {
          user_id: userId,
          weight_kg: strictSensitiveMode ? null : analyticsWeight,
          body_fat_pct: strictSensitiveMode ? null : analyticsBodyFat,
          weight_kg_encrypted: encryptedWeight,
          body_fat_pct_encrypted: encryptedBodyFat,
          note: encryptedNote,
          logged_at: new Date().toISOString(),
        };

        let { error } = await supabase.from('weight_logs').insert(securePayload);
        if (error) {
          const message = String((error as any).message ?? '');
          const missingSecureColumns =
            message.includes('weight_kg_encrypted') || message.includes('body_fat_pct_encrypted');

          if (missingSecureColumns) {
            if (strictSensitiveMode) {
              throw new Error('El modo estricto requiere las columnas cifradas en weight_logs.');
            }
            const fallback = await supabase.from('weight_logs').insert({
              user_id: userId,
              weight_kg: analyticsWeight,
              body_fat_pct: analyticsBodyFat,
              note: encryptedNote,
              logged_at: new Date().toISOString(),
            });
            error = fallback.error;
          }
        }

        if (error) throw error;

        // Actualizar peso actual en perfil
        if (!strictSensitiveMode) {
          await supabase
            .from('profiles')
            .update({ weight_current_kg: analyticsWeight })
            .eq('id', userId);
        }

        await fetchLogs();
        return { isNewMin };
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWeight.logWeight" });
        return { isNewMin: false };
      } finally {
        setSaving(false);
      }
    },
    [strictSensitiveMode, userId, logs, fetchLogs],
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
    if (!stats.weeklyDelta || stats.weeklyDelta === 0 || !stats.toGoal) return null;
    if ((stats.toGoal > 0 && stats.weeklyDelta >= 0) || (stats.toGoal < 0 && stats.weeklyDelta <= 0)) {
      return null;
    }

    const weeks = Math.abs(stats.toGoal / stats.weeklyDelta);
    if (!Number.isFinite(weeks)) return null;
    return Math.max(0, Math.round(weeks));
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
    getBMI: () => stats.bmi,
    isNewHistoricalMinimum: () => stats.isNewMin,
    getHistory: () => logs,
    deleteLog,
    getChartData,
    getProjectionWeeks,
    refresh: fetchLogs,
    strictSensitiveMode,
  };
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

function calculateProjectedGoalDate({
  goalKg,
  currentKg,
  weeklyDelta,
}: {
  goalKg: number | null;
  currentKg: number | null;
  weeklyDelta: number | null;
}): string | null {
  if (goalKg === null || currentKg === null || weeklyDelta === null || weeklyDelta === 0) return null;

  const diffToGoal = currentKg - goalKg;
  if (diffToGoal === 0) return new Date().toISOString();

  // Para bajar peso necesitamos delta semanal negativa; para subir, positiva.
  if ((diffToGoal > 0 && weeklyDelta >= 0) || (diffToGoal < 0 && weeklyDelta <= 0)) return null;

  const weeks = Math.abs(diffToGoal / weeklyDelta);
  if (!Number.isFinite(weeks) || weeks <= 0) return null;

  const projected = new Date();
  projected.setDate(projected.getDate() + Math.round(weeks * 7));
  return projected.toISOString();
}
