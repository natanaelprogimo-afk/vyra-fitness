import { useState, useEffect, useCallback, useMemo } from 'react';
import { getProfileContextMemory } from '@/lib/profile-context';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { decryptSensitiveText, encryptSensitiveText } from '@/lib/sensitive-crypto';
import {
  cacheRemoteWeightLogs,
  deleteOfflineWeightLog,
  flushOfflineWeightLogs,
  getOfflineWeightLogs,
  queueOfflineWeightLog,
  type OfflineWeightLogSyncPayload,
} from '@/lib/weight-offline';

export interface WeightLog {
  id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  photo_url: string | null;
  note: string | null;
  logged_at: string;
}

type RemoteWeightLogRow = {
  id: string;
  user_id: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  weight_kg_encrypted: string | null;
  body_fat_pct_encrypted: string | null;
  photo_url: string | null;
  note: string | null;
  logged_at: string;
};

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

function isRecoverableOfflineError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('offline') ||
    message.includes('internet') ||
    message.includes('timeout')
  );
}

async function normalizeWeightLogRow(entry: RemoteWeightLogRow): Promise<WeightLog & { user_id: string }> {
  const [decryptedNote, decryptedWeightRaw, decryptedBodyFatRaw] = await Promise.all([
    decryptSensitiveText(entry.note ?? null),
    decryptSensitiveText(entry.weight_kg_encrypted ?? null),
    decryptSensitiveText(entry.body_fat_pct_encrypted ?? null),
  ]);

  const decryptedWeight = parseEncryptedNumeric(decryptedWeightRaw);
  const decryptedBodyFat = parseEncryptedNumeric(decryptedBodyFatRaw);

  return {
    id: entry.id,
    user_id: entry.user_id,
    photo_url: entry.photo_url,
    logged_at: entry.logged_at,
    note: decryptedNote,
    weight_kg: decryptedWeight ?? Number(entry.weight_kg ?? 0),
    body_fat_pct:
      decryptedBodyFat !== null
        ? decryptedBodyFat
        : entry.body_fat_pct !== null && entry.body_fat_pct !== undefined
          ? Number(entry.body_fat_pct)
          : null,
  };
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
  const profile = useAuthStore((state) => state.profile);
  const updateStoredProfile = useAuthStore((state) => state.updateProfile);
  const showToast = useUIStore((state) => state.showToast);
  const isOnline = useUIStore((state) => state.isOnline);
  const userId = profile?.id;
  const coachMemory = getProfileContextMemory(profile);
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

  const computeStats = useCallback((data: WeightLog[]) => {
    if (!profile) return;

    const heightM = (profile.height_cm ?? 170) / 100;
    const goalKg = profile.weight_goal_kg ?? null;
    const startKg = profile.weight_start_kg ?? null;

    const current =
      data[0]?.weight_kg ??
      profile.weight_current_kg ??
      profile.weight_start_kg ??
      null;
    const previous = data[1]?.weight_kg ?? null;
    const dailyDelta =
      current !== null && previous !== null
        ?  Math.round((current - previous) * 10) / 10
        : null;

    const currentWeekValues = data.slice(0, 7).map((item) => item.weight_kg);
    const previousWeekValues = data.slice(7, 14).map((item) => item.weight_kg);
    const weeklyAverageCurrent = currentWeekValues.length
      ?  Math.round((currentWeekValues.reduce((sum, val) => sum + val, 0) / currentWeekValues.length) * 10) / 10
      : current;
    const weeklyAveragePrevious = previousWeekValues.length
      ?  Math.round((previousWeekValues.reduce((sum, val) => sum + val, 0) / previousWeekValues.length) * 10) / 10
      : null;
    const weeklyDelta =
      weeklyAverageCurrent !== null && weeklyAveragePrevious !== null
        ?  Math.round((weeklyAverageCurrent - weeklyAveragePrevious) * 10) / 10
        : null;

    const bmi = current ? Math.round((current / (heightM * heightM)) * 10) / 10 : null;
    const bmiCategory = bmi ? getBmiCategory(bmi) : '';

    const totalLost =
      startKg !== null && current !== null ? Math.round((startKg - current) * 10) / 10 : null;
    const toGoal =
      goalKg !== null && current !== null ? Math.round((current - goalKg) * 10) / 10 : null;

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
      ?  'Tu peso viene estable hace ~3 semanas. Probemos ajustar calorías, pasos o carga de entrenamiento para destrabar.'
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
  }, [profile]);

  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setLogs([]);
      computeStats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isOnline) {
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false })
          .limit(365);

        if (error) throw error;

        const normalized = await Promise.all(
          ((data ?? []) as RemoteWeightLogRow[]).map(normalizeWeightLogRow),
        );

        await cacheRemoteWeightLogs(userId, normalized);
        setLogs(normalized);
        computeStats(normalized);
        return;
      }

      const offlineLogs = await getOfflineWeightLogs(userId);
      setLogs(offlineLogs);
      computeStats(offlineLogs);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useWeight.fetchLogs' });
      if (userId) {
        const offlineLogs = await getOfflineWeightLogs(userId).catch((e) => {
          console.debug?.('[useWeight] getOfflineWeightLogs failed', e);
          return [] as WeightLog[];
        });
        setLogs(offlineLogs);
        computeStats(offlineLogs);
      }
    } finally {
      setLoading(false);
    }
  }, [computeStats, isOnline, userId]);

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
        const loggedAtIso = new Date().toISOString();
        let savedOffline = !isOnline;

        const encryptedNote = await encryptSensitiveText(note ?? null);
        const encryptedWeight = await encryptSensitiveText(String(weightKg));
        const encryptedBodyFat =
          bodyFatPct !== undefined && bodyFatPct !== null
            ?  await encryptSensitiveText(String(bodyFatPct))
            : null;

        const analyticsWeight = roundForAnalytics(weightKg, strictSensitiveMode ? 2 : 0.5);
        const analyticsBodyFat =
          bodyFatPct !== undefined && bodyFatPct !== null
            ? roundForAnalytics(bodyFatPct, strictSensitiveMode ? 5 : 1)
            : null;

        const securePayload: OfflineWeightLogSyncPayload = {
          weight_kg: strictSensitiveMode ? null : analyticsWeight,
          body_fat_pct: strictSensitiveMode ? null : analyticsBodyFat,
          weight_kg_encrypted: encryptedWeight,
          body_fat_pct_encrypted: encryptedBodyFat,
          note: encryptedNote,
          logged_at: loggedAtIso,
          profile_weight_current_kg: strictSensitiveMode ? null : analyticsWeight,
        };

        if (isOnline) {
          let { error } = await supabase.from('weight_logs').insert({
            user_id: userId,
            ...securePayload,
          });
          if (error) {
            const message = String((error as { message?: unknown }).message ?? '');
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
                logged_at: loggedAtIso,
              });
              error = fallback.error;
            }
          }

          if (error) {
            if (isRecoverableOfflineError(error)) {
              await queueOfflineWeightLog(userId, {
                weight_kg: weightKg,
                body_fat_pct: bodyFatPct ?? null,
                photo_url: null,
                note: note ?? null,
                logged_at: loggedAtIso,
                sync_payload: securePayload,
              });
              savedOffline = true;
            } else {
              throw error;
            }
          }
        } else {
          await queueOfflineWeightLog(userId, {
            weight_kg: weightKg,
            body_fat_pct: bodyFatPct ?? null,
            photo_url: null,
            note: note ?? null,
            logged_at: loggedAtIso,
            sync_payload: securePayload,
          });
          savedOffline = true;
        }

        if (!strictSensitiveMode) {
          updateStoredProfile({ weight_current_kg: analyticsWeight });

          await supabase
            .from('profiles')
            .update({ weight_current_kg: analyticsWeight })
            .eq('id', userId);
        }

        await fetchLogs();
        showToast(
          savedOffline
            ? 'Peso guardado sin internet. Lo sincronizaremos cuando vuelvas.'
            : 'Peso guardado.',
          'success',
        );
        return { isNewMin };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No pudimos guardar el peso.';
        showToast(message, 'error');
        captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useWeight.logWeight' });
        return { isNewMin: false };
      } finally {
        setSaving(false);
      }
    },
    [fetchLogs, isOnline, logs, showToast, strictSensitiveMode, updateStoredProfile, userId],
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      if (!userId) return;
      try {
        if (isOnline) {
          const { error } = await supabase
            .from('weight_logs')
            .delete()
            .eq('id', logId)
            .eq('user_id', userId);
          if (error) throw error;
        } else {
          await deleteOfflineWeightLog(userId, logId);
        }

        await fetchLogs();
        showToast(
          isOnline
            ? 'Registro eliminado.'
            : 'Registro eliminado del dispositivo. Se sincronizara cuando vuelvas.',
          'success',
        );
      } catch (err) {
        showToast('No pudimos eliminar ese registro.', 'error');
        captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useWeight.deleteLog' });
      }
    },
    [fetchLogs, isOnline, showToast, userId],
  );

  // Datos para gráfico de línea (últimos N días)
  function getChartData(days = 30): { date: string; weight: number }[] {
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

  useEffect(() => {
    if (!userId || !isOnline) return;

    let cancelled = false;

    const syncPending = async () => {
      const result = await flushOfflineWeightLogs(userId);
      if (cancelled || result.synced === 0) return;

      showToast(
        result.failed > 0
          ? `Sincronizamos ${result.synced} registros de peso. ${result.failed} siguen pendientes.`
          : `Sincronizamos ${result.synced} registros de peso.`,
        'success',
      );
      await fetchLogs();
    };

    void syncPending();
    return () => {
      cancelled = true;
    };
  }, [fetchLogs, isOnline, showToast, userId]);

  const logStreakDays = useMemo(() => {
    const dates = new Set(logs.map((l) => new Date(l.logged_at).toISOString().split('T')[0]));
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (dates.has(key)) count += 1;
      else break;
    }
    return count;
  }, [logs]);

  return {
    logs,
    stats,
    loading,
    saving,
    logWeight,
    logStreakDays,
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
