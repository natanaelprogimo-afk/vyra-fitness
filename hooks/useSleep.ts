// ============================================================
// VYRA FITNESS — useSleep Hook
// Log de sueño manual + calidad calculada, readiness score,
// correlaciones con otros módulos, historial
// ============================================================

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { addCoins, addXP } from '@/services/supabase/profiles';
import { captureError } from '@/lib/sentry';
import { todayISO, daysAgoISO } from '@/utils/dates';
import { calculateSleepScore } from '@/utils/calculations';

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
  if (score >= 85) return { label: 'Excelente',  color: '#7BC67E' };
  if (score >= 70) return { label: 'Bueno',      color: '#82C91E' };
  if (score >= 55) return { label: 'Regular',    color: '#FFD43B' };
  if (score >= 40) return { label: 'Malo',       color: '#FF922B' };
  return                  { label: 'Muy malo',   color: '#FF6B6B' };
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

function minuteToLabel(totalMinutes: number): string {
  const minutes = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
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

  const wakeMinutesLast7 = last7.map((entry) => {
    const end = new Date(entry.end_time);
    return end.getHours() * 60 + end.getMinutes();
  });
  const avgWakeMinutes = wakeMinutesLast7.length ? average(wakeMinutesLast7) : null;
  const estimatedLatencyMin = 14;
  const recommendedBedtime = avgWakeMinutes !== null
    ? minuteToLabel(avgWakeMinutes - goalHours * 60 - estimatedLatencyMin)
    : null;

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
      ? 'Tu horario de sueno es irregular. Acostarte en una franja mas estable puede mejorar calidad.'
      : null,
  };

  const last3 = history.slice(-3);
  const avgLast3Hours = last3.length
    ? average(last3.map((item) => item.duration_min / 60))
    : 0;
  const physicalDayState: PhysicalDayState = avgLast3Hours < 6
    ? {
        state: 'recovery',
        avgLast3Hours: Math.round(avgLast3Hours * 10) / 10,
        stepGoalAdjustmentPct: -20,
        workoutRecommendation: 'recovery',
        message: 'Ultimas 3 noches cortas. Hoy conviene bajar carga y priorizar recuperacion.',
      }
    : avgLast3Hours > 8
      ? {
          state: 'high',
          avgLast3Hours: Math.round(avgLast3Hours * 10) / 10,
          stepGoalAdjustmentPct: 0,
          workoutRecommendation: 'intense',
          message: 'Dormiste bien los ultimos dias. Hoy es buena ventana para entrenar fuerte.',
        }
      : {
          state: 'normal',
          avgLast3Hours: Math.round(avgLast3Hours * 10) / 10,
          stepGoalAdjustmentPct: 0,
          workoutRecommendation: 'moderate',
          message: 'Sueno estable. Manten una carga moderada y consistente hoy.',
        };

  const compensationHours = Math.min(9.5, goalHours + Math.min(2, sleepDebt));
  const sleepDebtMessage = sleepDebt > 0.5
    ? `Deuda acumulada: ${sleepDebt.toFixed(1)}h. Objetivo de compensacion: una noche de ~${compensationHours.toFixed(1)}h.`
    : null;

  // ─── Guardar sueño ───────────────────────────────────────
  const { mutate: logSleep, isPending: isLogging } = useMutation({
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
      const coinsEarned = score >= 80 ? 10 : score >= 60 ? 5 : 2;
      await addCoins(userId, coinsEarned, 'sleep_log', `Sueño registrado: ${(durationMin/60).toFixed(1)}h`);
      await addXP(userId, 50);

      queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
      queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      showToast(`Sueño guardado — Score: ${score}/100 +${coinsEarned} 🪙`, 'success');

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
    recommendedBedtime,
    sleepIrregularity,
    physicalDayState,
    isLoading,
    isLogging,
    logSleep,
    getLastNight: () => lastSleep,
    getWeeklyAverage: () => avgHours,
    getOptimalAlarmTimes,
    refetch,
  };
}
