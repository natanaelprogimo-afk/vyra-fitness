// ============================================================
// VYRA FITNESS — useSleep Hook
// Log de sueño manual + calidad calculada, readiness score,
// correlaciones con otros módulos, historial
// ============================================================

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';
import { daysAgoISO } from '@/utils/dates';
import { calculateSleepScore } from '@/utils/calculations';
import {
  syncSleepSessionsFromHealthConnect,
  type HealthConnectSleepSyncResult,
} from '@/lib/health-connect-sleep';

export interface SleepLogInput {
  bedtime:       Date;   // hora de acostarse
  wakeTime:      Date;   // hora de despertar
  quality:       number; // 1-5 (subjetivo)
  deepSleep:     number; // % (estimado)
  remSleep:      number; // % (estimado)
  notes?:        string;
}

export interface SleepEntry {
  id:            string;
  start_time:    string;
  end_time:      string;
  duration_min:  number;
  quality_score: number;
  deep_min:      number;
  rem_min:       number;
  light_min:     number;
  awake_min:     number;
  source:        string;
  notes:         string | null;
  created_at:    string;
}

interface SleepIrregularity {
  isIrregular: boolean;
  stdDevMinutes: number;
  message: string | null;
}

interface PhysicalDayState {
  state: 'recovery' | 'normal' | 'high';
  avgLast3Hours: number;
  stepGoalAdjustmentPct: number;
  workoutRecommendation: 'recovery' | 'moderate' | 'intense';
  message: string;
}

// Rangos de calidad de sueño según duración + edad
function getSleepQualityLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Muy reparador', color: '#7BC67E' };
  if (score >= 70) return { label: 'Bastante bien', color: '#82C91E' };
  if (score >= 55) return { label: 'Intermedio', color: '#FFD43B' };
  if (score >= 40) return { label: 'Algo corto', color: '#FF922B' };
  return { label: 'Muy corto', color: '#FF6B6B' };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function stdDeviation(values: number[]): number {
  if (!values.length) return 0;
  const avg = average(values);
  const variance = values.reduce((sum, item) => sum + (item - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function useSleep() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const isOnline    = useUIStore((s) => s.isOnline);
  const userId      = profile?.id ?? '';
  const goalHours   = profile?.sleep_goal_hours ?? 8;

  // ─── Sueño de anoche (rango: 12h antes hasta 12h después del objetivo wake) ──
  const { data: lastSleep, isLoading, refetch } = useQuery<SleepEntry | null>({
    queryKey: ['sleep_last', userId],
    queryFn:  async () => {
      if (!userId) return null;
      const yesterday = daysAgoISO(1);
      const { data }  = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('end_time', `${yesterday}T12:00:00`)
        .order('end_time', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled:   !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Historial 14 días ────────────────────────────────────
  const { data: history = [] } = useQuery<SleepEntry[]>({
    queryKey: ['sleep_history', userId],
    queryFn:  async () => {
      if (!userId || !isOnline) return [];
      const { data } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('end_time', `${daysAgoISO(13)}T00:00:00`)
        .order('end_time', { ascending: true });
      return data ?? [];
    },
    enabled:   !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Métricas derivadas ──────────────────────────────────
  const lastDurationHours = lastSleep ? lastSleep.duration_min / 60 : 0;
  const lastScore         = lastSleep?.quality_score ?? 0;
  const qualityInfo       = getSleepQualityLabel(lastScore);

  const avgHours = history.length
    ? history.reduce((s, h) => s + h.duration_min / 60, 0) / history.length : 0;
  const avgScore = history.length
    ? history.reduce((s, h) => s + h.quality_score, 0) / history.length : 0;
  const daysWithGoal = history.filter(h => h.duration_min / 60 >= goalHours).length;

  // Deuda de sueño acumulada (últimos 7 días)
  const last7 = history.slice(-7);
  const sleepDebt = last7.reduce((debt, h) => {
    return debt + Math.max(0, goalHours * 60 - h.duration_min);
  }, 0) / 60;

  const bedtimeMinutes = history.slice(-28).map((entry) => {
    const start = new Date(entry.start_time);
    const minutes = start.getHours() * 60 + start.getMinutes();
    // Normaliza horarios de madrugada para que no distorsionen la variabilidad.
    return minutes < 12 * 60 ? minutes + 1440 : minutes;
  });
  const bedtimeStdDev = Math.round(stdDeviation(bedtimeMinutes));
  const sleepIrregularity: SleepIrregularity = {
    isIrregular: bedtimeStdDev > 90,
    stdDevMinutes: bedtimeStdDev,
    message: bedtimeStdDev > 90
      ?  'Tu horario de sueño es irregular. Acostarte en una franja más estable puede mejorar la calidad.'
      : null,
  };

  const last3 = history.slice(-3);
  const avgLast3Hours = last3.length
    ?  average(last3.map((item) => item.duration_min / 60))
    : 0;
  const physicalDayState: PhysicalDayState = avgLast3Hours < 6
    ?  {
        state: 'recovery',
        avgLast3Hours: Math.round(avgLast3Hours * 10) / 10,
        stepGoalAdjustmentPct: -20,
        workoutRecommendation: 'recovery',
        message: 'Vienes corto de sueño. Hoy conviene un día más liviano y recuperar margen.',
      }
    : avgLast3Hours > 8
      ?  {
          state: 'high',
          avgLast3Hours: Math.round(avgLast3Hours * 10) / 10,
          stepGoalAdjustmentPct: 0,
          workoutRecommendation: 'intense',
          message: 'Dormiste bien estos últimos días. Hoy hay margen para empujar un poco más.',
        }
      : {
          state: 'normal',
          avgLast3Hours: Math.round(avgLast3Hours * 10) / 10,
          stepGoalAdjustmentPct: 0,
          workoutRecommendation: 'moderate',
          message: 'Tu sueño viene bastante estable. Hoy encaja mejor una carga moderada y consistente.',
        };

  // Backwards compatibility: expose a simple action plan for consumers expecting
  // `{ title, focus }` (used by intelligence/why-vyra and similar views).
  const sleepActionPlan = physicalDayState
    ?  {
        title: physicalDayState.message,
        focus:
          physicalDayState.workoutRecommendation === 'recovery'
            ?  'Día más liviano'
            : physicalDayState.workoutRecommendation === 'moderate'
              ?  'Carga moderada'
              : 'Entrenamiento intenso',
      }
    : null;

  const compensationHours = Math.min(9.5, goalHours + Math.min(2, sleepDebt));
  const sleepDebtMessage = sleepDebt > 0.5
    ? `Deuda acumulada: ${sleepDebt.toFixed(1)}h. Objetivo de compensación: una noche de ~${compensationHours.toFixed(1)}h.`
    : null;

  // Consecutive nights meeting goal (streak) — computed from the most recent history entries
  const sleepStreakDays = (() => {
    if (!history || !history.length) return 0;
    let streak = 0;
    let prevDay: string | null = null;
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const entry = history[i];
      const day = entry.end_time ? entry.end_time.split('T')[0] : null;
      if (!day) continue;
      const meets = (entry.duration_min / 60) >= goalHours;
      if (!meets) break;
      if (streak === 0) {
        streak = 1;
        prevDay = day;
      } else {
        const prevDate = new Date(`${prevDay}T00:00:00`);
        prevDate.setDate(prevDate.getDate() - 1);
        const expected = prevDate.toISOString().split('T')[0];
        if (day === expected) {
          streak += 1;
          prevDay = day;
        } else {
          break;
        }
      }
    }
    return streak;
  })();

  // ─── Guardar sueño ───────────────────────────────────────
  const { mutate: logSleep, mutateAsync: logSleepAsync, isPending: isLogging } = useMutation({
    mutationFn: async (input: SleepLogInput) => {
      if (!userId) throw new Error('No user');

      const durationMin = Math.round(
        (input.wakeTime.getTime() - input.bedtime.getTime()) / 60000
      );

      if (durationMin < 60 || durationMin > 720) {
        throw new Error('La duración del sueño parece incorrecta. Revisá los horarios.');
      }

      // Calcular score compuesto
      const score = calculateSleepScore(
        durationMin,
        input.quality
      );

      const deepMin  = Math.round(durationMin * (input.deepSleep / 100));
      const remMin   = Math.round(durationMin * (input.remSleep  / 100));
      const lightMin = Math.round(durationMin * 0.50);
      const awakeMin = Math.max(0, durationMin - deepMin - remMin - lightMin);

      const { data, error } = await supabase.from('sleep_logs').insert({
        user_id:       userId,
        start_time:    input.bedtime.toISOString(),
        end_time:      input.wakeTime.toISOString(),
        duration_min:  durationMin,
        quality_score: score,
        deep_min:      deepMin,
        rem_min:       remMin,
        light_min:     lightMin,
        awake_min:     awakeMin,
        source:        'manual',
        notes:         input.notes ?? null,
      }).select('id').single();

      if (error) throw error;
      return { id: data.id, score, durationMin };
    },

    onSuccess: async ({ score, durationMin }) => {
      queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
      queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      showToast(`Sueño guardado. Score: ${score}/100 · ${(durationMin / 60).toFixed(1)}h.`, 'success');

      if (isOnline) void supabase.rpc('calculate_daily_score', { p_user_id: userId });
    },

    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Error guardando sueño.';
      showToast(msg, 'error');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'logSleep'" });
    },
  });

  // ─── Calcular ventana de alarma óptima ───────────────────
  // El sueño tiene ciclos de ~90 min. La alarma debe sonar en fin de ciclo.
  const getOptimalAlarmTimes = useCallback((bedtime: Date): Date[] => {
    const cycles = [4, 5, 6]; // 6h, 7.5h, 9h
    return cycles.map((n) => {
      const alarm = new Date(bedtime);
      alarm.setMinutes(alarm.getMinutes() + n * 90 + 14); // +14 min para conciliar el sueño
      return alarm;
    });
  }, []);

  const importHealthConnectSessions = useCallback(async (): Promise<HealthConnectSleepSyncResult> => {
    if (!userId) {
      return {
        status: 'error',
        permissionsGranted: false,
        records: [],
        message: 'Necesitas sesión para importar sueño.',
      };
    }

    const result = await syncSleepSessionsFromHealthConnect({
      promptForPermissions: true,
      daysBack: 14,
    });

    if (result.status !== 'ready') {
      if (result.message) {
        showToast(result.message, result.status === 'permissions_missing' ? 'warning' : 'error');
      }
      return result;
    }

    if (!result.records.length) {
      showToast('No encontramos sesiones nuevas para importar.', 'info');
      return result;
    }

    const rows = result.records.map((record) => ({
      user_id: userId,
      start_time: record.startTime,
      end_time: record.endTime,
      duration_min: record.durationMin,
      quality_score: record.qualityScore,
      deep_min: record.deepMin,
      rem_min: record.remMin,
      light_min: record.lightMin,
      awake_min: record.awakeMin,
      source: record.source,
      source_record_id: record.sourceRecordId,
      source_origin: record.sourceOrigin,
      source_device: record.sourceDevice,
      synced_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('sleep_logs')
      .upsert(rows, { onConflict: 'user_id,source,source_record_id' });

    if (error) {
      showToast('No pudimos guardar las sesiones importadas.', 'error');
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'useSleep.importHealthConnectSessions',
      });
      return {
        status: 'error',
        permissionsGranted: true,
        records: result.records,
        message: 'No pudimos guardar las sesiones importadas.',
      };
    }

    queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
    queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
    queryClient.invalidateQueries({ queryKey: ['today_summary'] });
    queryClient.invalidateQueries({ queryKey: ['daily_score'] });
    void (async () => {
      try {
        await supabase.rpc('calculate_daily_score', { p_user_id: userId });
      } catch {
        // Best effort: the import is still useful even if score recalculation fails.
      }
    })();

    showToast(
      `Importamos ${result.records.length} sesión${result.records.length === 1 ? '' : 'es'} de sueño.`,
      'success',
    );

    return result;
  }, [queryClient, showToast, userId]);

  return {
    lastSleep,
    lastDurationHours,
    lastScore,
    qualityInfo,
    goalHours,
    history,
    avgHours,
    avgScore,
    daysWithGoal,
    sleepDebt,
    sleepDebtMessage,
    sleepIrregularity,
    physicalDayState,
    isLoading,
    isLogging,
    logSleep,
    logSleepAsync,
    getLastNight: () => lastSleep,
    getWeeklyAverage: () => avgHours,
    getOptimalAlarmTimes,
    refetch,
    sleepActionPlan,
    sleepStreakDays,
    importHealthConnectSessions,
  };
}
