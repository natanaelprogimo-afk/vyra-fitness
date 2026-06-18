// ============================================================
// VYRA FITNESS - useSleep Hook
// Manual logging + Health Connect import + offline cache/sync.
// ============================================================

import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';
import { resolveSupportedLanguage, type SupportedLanguage } from '@/lib/language';
import { daysAgoISO } from '@/utils/dates';
import { calculateSleepScore } from '@/utils/calculations';
import { trackSleepLogged } from '@/lib/analytics';
import { normalizeSleepRange } from '@/lib/sleep-module';
import {
  syncSleepSessionsFromHealthConnect,
  type HealthConnectSleepSyncResult,
} from '@/lib/health-connect-sleep';
import {
  cacheRemoteSleepEntries,
  deleteOfflineSleepEntry,
  flushOfflineSleepEntries,
  getOfflineSleepHistory,
  queueOfflineSleepEntry,
  updateOfflineSleepEntry,
} from '@/lib/sleep-offline';

export interface SleepLogInput {
  bedtime: Date;
  wakeTime: Date;
  quality: number;
  deepSleep: number;
  remSleep: number;
  notes?: string;
}

export interface SleepEntry {
  id: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  quality_score: number;
  deep_min: number;
  rem_min: number;
  light_min: number;
  awake_min: number;
  source: 'health_connect' | 'manual' | string;  // NEW: Track source to avoid duplicates
  notes: string | null;
  created_at: string;
}

type RemoteSleepEntryRow = SleepEntry & {
  user_id: string;
};

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

function getSleepQualityLabel(score: number, language: SupportedLanguage): { label: string; color: string } {
  if (language === 'en') {
    if (score >= 85) return { label: 'Very restorative', color: '#7BC67E' };
    if (score >= 70) return { label: 'Quite good', color: '#82C91E' };
    if (score >= 55) return { label: 'In between', color: '#FFD43B' };
    if (score >= 40) return { label: 'A bit short', color: '#FF922B' };
    return { label: 'Very short', color: '#FF6B6B' };
  }

  if (language === 'pt') {
    if (score >= 85) return { label: 'Muito reparador', color: '#7BC67E' };
    if (score >= 70) return { label: 'Bem bom', color: '#82C91E' };
    if (score >= 55) return { label: 'Intermediario', color: '#FFD43B' };
    if (score >= 40) return { label: 'Um pouco curto', color: '#FF922B' };
    return { label: 'Muito curto', color: '#FF6B6B' };
  }

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

// NEW: Deduplicate sleep entries by date + source
// Keeps only 1 entry per date, preferring manual logs over Health Connect (more accurate user input)
function deduplicateSleepEntries(entries: SleepEntry[]): SleepEntry[] {
  const dateMap = new Map<string, SleepEntry[]>();

  // Group entries by date (using start_time date)
  for (const entry of entries) {
    const date = entry.start_time.split('T')[0] ?? '';
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)?.push(entry);
  }

  // For each date, keep best entry (manual > health_connect)
  const deduplicated: SleepEntry[] = [];
  for (const [, dailyEntries] of dateMap.entries()) {
    if (dailyEntries.length === 1) {
      deduplicated.push(dailyEntries[0]!);
    } else {
      // Prefer manual logs, then health_connect
      const manual = dailyEntries.find((e) => e.source === 'manual');
      const healthConnect = dailyEntries.find((e) => e.source?.includes('health_connect'));
      deduplicated.push(manual ?? healthConnect ?? dailyEntries[0]!);
    }
  }

  return deduplicated.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

function stdDeviation(values: number[]): number {
  if (!values.length) return 0;
  const avg = average(values);
  const variance = values.reduce((sum, item) => sum + (item - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
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

function buildSleepPayload(input: SleepLogInput) {
  const normalizedRange = normalizeSleepRange(input.bedtime, input.wakeTime);
  if (!normalizedRange) {
    throw new Error('Faltan horarios para registrar el sueño.');
  }

  const { bedtime: normalizedBedtime, wakeTime: normalizedWakeTime } = normalizedRange;
  const durationMin = Math.round((normalizedWakeTime.getTime() - normalizedBedtime.getTime()) / 60000);
  if (durationMin < 60 || durationMin > 720) {
    throw new Error('La duración del sueño parece incorrecta. Revisa los horarios.');
  }

  const score = calculateSleepScore(durationMin, input.quality);
  const deepMin = Math.round(durationMin * (input.deepSleep / 100));
  const remMin = Math.round(durationMin * (input.remSleep / 100));
  const lightMin = Math.round(durationMin * 0.5);
  const awakeMin = Math.max(0, durationMin - deepMin - remMin - lightMin);

  return {
    payload: {
      start_time: normalizedBedtime.toISOString(),
      end_time: normalizedWakeTime.toISOString(),
      duration_min: durationMin,
      quality_score: score,
      deep_min: deepMin,
      rem_min: remMin,
      light_min: lightMin,
      awake_min: awakeMin,
      source: 'manual',
      notes: input.notes ?? null,
    },
    score,
    durationMin,
  };
}

export function useSleep() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const profile = useAuthStore((state) => state.profile);
  const showToast = useUIStore((state) => state.showToast);
  const isOnline = useUIStore((state) => state.isOnline);
  const userId = profile?.id ?? '';
  const goalHours = profile?.sleep_goal_hours ?? 8;
  const language = resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language);

  const sleepHistoryQuery = useQuery<SleepEntry[]>({
    queryKey: ['sleep_history', userId, isOnline],
    queryFn: async () => {
      if (!userId) return [];

      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('sleep_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('end_time', `${daysAgoISO(13)}T00:00:00`)
            .order('end_time', { ascending: true });

          if (error) throw error;

          await cacheRemoteSleepEntries(userId, (data ?? []) as RemoteSleepEntryRow[]);
          // NEW: Deduplicate before returning
          return deduplicateSleepEntries((data ?? []) as SleepEntry[]);
        } catch (error) {
          captureError(error instanceof Error ? error : new Error(String(error)), {
            action: 'useSleep.fetchHistoryRemote',
          });
        }
      }

      const offlineData = await getOfflineSleepHistory(userId);
      // NEW: Deduplicate offline data too
      return deduplicateSleepEntries(offlineData);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const history = sleepHistoryQuery.data ?? [];
  const lastSleep = history.length ? history[history.length - 1] ?? null : null;
  const isLoading = sleepHistoryQuery.isLoading;
  const refetch = sleepHistoryQuery.refetch;

  const lastDurationHours = lastSleep ? lastSleep.duration_min / 60 : 0;
  const lastScore = lastSleep?.quality_score ?? 0;
  const qualityInfo = getSleepQualityLabel(lastScore, language);

  const avgHours = history.length
    ? history.reduce((sum, entry) => sum + entry.duration_min / 60, 0) / history.length
    : 0;
  const avgScore = history.length
    ? history.reduce((sum, entry) => sum + entry.quality_score, 0) / history.length
    : 0;
  const daysWithGoal = history.filter((entry) => entry.duration_min / 60 >= goalHours).length;

  const last7 = history.slice(-7);
  const sleepDebt = last7.reduce((debt, entry) => {
    return debt + Math.max(0, goalHours * 60 - entry.duration_min);
  }, 0) / 60;

  const bedtimeMinutes = history.slice(-28).map((entry) => {
    const start = new Date(entry.start_time);
    const minutes = start.getHours() * 60 + start.getMinutes();
    return minutes < 12 * 60 ? minutes + 1440 : minutes;
  });
  const bedtimeStdDev = Math.round(stdDeviation(bedtimeMinutes));
  const sleepIrregularity: SleepIrregularity = {
    isIrregular: bedtimeStdDev > 90,
    stdDevMinutes: bedtimeStdDev,
    message: bedtimeStdDev > 90
      ? 'Tu horario de sueño es irregular. Acostarte en una franja más estable puede mejorar la calidad.'
      : null,
  };

  const last3 = history.slice(-3);
  const avgLast3Hours = last3.length ? average(last3.map((item) => item.duration_min / 60)) : 0;
  const physicalDayState: PhysicalDayState = avgLast3Hours < 6
    ? {
        state: 'recovery',
        avgLast3Hours: Math.round(avgLast3Hours * 10) / 10,
        stepGoalAdjustmentPct: -20,
        workoutRecommendation: 'recovery',
        message: 'Vienes corto de sueño. Hoy conviene un día más liviano y recuperar margen.',
      }
    : avgLast3Hours > 8
      ? {
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

  const sleepActionPlan = physicalDayState
    ? {
        title: physicalDayState.message,
        focus:
          physicalDayState.workoutRecommendation === 'recovery'
            ? 'Día más liviano'
            : physicalDayState.workoutRecommendation === 'moderate'
              ? 'Carga moderada'
              : 'Entrenamiento intenso',
      }
    : null;

  const compensationHours = Math.min(9.5, goalHours + Math.min(2, sleepDebt));
  const sleepDebtMessage = sleepDebt > 0.5
    ? `Deuda acumulada: ${sleepDebt.toFixed(1)}h. Objetivo de compensación: una noche de ~${compensationHours.toFixed(1)}h.`
    : null;

  const sleepStreakDays = (() => {
    if (!history.length) return 0;

    let streak = 0;
    let prevDay: string | null = null;

    for (let index = history.length - 1; index >= 0; index -= 1) {
      const entry = history[index];
      const day = entry?.end_time ? entry.end_time.split('T')[0] : null;
      if (!day) continue;

      const meetsGoal = entry.duration_min / 60 >= goalHours;
      if (!meetsGoal) break;

      if (streak === 0) {
        streak = 1;
        prevDay = day;
        continue;
      }

      const prevDate = new Date(`${prevDay}T00:00:00`);
      prevDate.setDate(prevDate.getDate() - 1);
      const expected = prevDate.toISOString().split('T')[0];

      if (day === expected) {
        streak += 1;
        prevDay = day;
        continue;
      }

      break;
    }

    return streak;
  })();

  const { mutate: logSleep, mutateAsync: logSleepAsync, isPending: isLogging } = useMutation({
    mutationFn: async (input: SleepLogInput) => {
      if (!userId) throw new Error('No user');

      const { payload, score, durationMin } = buildSleepPayload(input);

      if (isOnline) {
        const { data, error } = await supabase
          .from('sleep_logs')
          .insert({
            user_id: userId,
            ...payload,
          })
          .select('id')
          .single();

        if (!error) {
          return { id: data.id, score, durationMin, isOffline: false };
        }

        if (!isRecoverableOfflineError(error)) {
          throw error;
        }
      }

      const id = await queueOfflineSleepEntry(userId, {
        ...payload,
        sync_payload: payload,
      });

      return { id, score, durationMin, isOffline: true };
    },

    onSuccess: async ({ score, durationMin, isOffline }) => {
      await queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
      await queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
      await queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      await queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      showToast(
        isOffline
          ? `Sueño guardado sin internet. Score: ${score}/100 - ${(durationMin / 60).toFixed(1)}h.`
          : `Sueño guardado. Score: ${score}/100 - ${(durationMin / 60).toFixed(1)}h.`,
        'success',
      );
      trackSleepLogged({
        duration_hours: durationMin / 60,
        score,
        source: isOffline ? 'manual_offline' : 'manual',
        is_offline: isOffline,
      });

      if (!isOffline && isOnline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }
    },

    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error guardando sueño.';
      showToast(message, 'error');
      captureError(error instanceof Error ? error : new Error(String(error)), { action: 'logSleep' });
    },
  });

  const {
    mutate: updateSleep,
    mutateAsync: updateSleepAsync,
    isPending: isUpdatingSleep,
  } = useMutation({
    mutationFn: async (input: SleepLogInput & { entryId: string }) => {
      if (!userId) throw new Error('No user');
      const { payload, score, durationMin } = buildSleepPayload(input);

      if (isOnline) {
        const { error } = await supabase
          .from('sleep_logs')
          .update(payload)
          .eq('id', input.entryId)
          .eq('user_id', userId);

        if (!error) {
          return { isOffline: false, score, durationMin };
        }

        if (!isRecoverableOfflineError(error)) {
          throw error;
        }
      }

      const updated = await updateOfflineSleepEntry(userId, input.entryId, payload);
      if (!updated) {
        throw new Error('No encontramos ese registro para actualizarlo.');
      }

      return { isOffline: true, score, durationMin };
    },
    onSuccess: async ({ isOffline, score, durationMin }) => {
      await queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
      await queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
      await queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      await queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      showToast(
        isOffline
          ? `Sueño actualizado sin internet. Score: ${score}/100 - ${(durationMin / 60).toFixed(1)}h.`
          : `Sueño actualizado. Score: ${score}/100 - ${(durationMin / 60).toFixed(1)}h.`,
        'success',
      );
      trackSleepLogged({
        duration_hours: durationMin / 60,
        score,
        source: isOffline ? 'manual_offline' : 'manual',
        is_offline: isOffline,
      });

      if (!isOffline && isOnline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error actualizando sueño.';
      showToast(message, 'error');
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'useSleep.updateSleep',
      });
    },
  });

  const deleteSleepEntry = useCallback(async (entryId: string) => {
    if (!userId) return false;

    try {
      let deletedOffline = !isOnline;

      if (isOnline) {
        const { error } = await supabase
          .from('sleep_logs')
          .delete()
          .eq('id', entryId)
          .eq('user_id', userId);

        if (error) {
          if (!isRecoverableOfflineError(error)) {
            throw error;
          }

          await deleteOfflineSleepEntry(userId, entryId);
          deletedOffline = true;
        }
      } else {
        await deleteOfflineSleepEntry(userId, entryId);
      }

      queryClient.setQueryData<SleepEntry[]>(
        ['sleep_history', userId, isOnline],
        (current) => current?.filter((entry) => entry.id !== entryId) ?? [],
      );
      await queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
      await queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
      await queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      await queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      if (isOnline && !deletedOffline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }

      showToast(
        deletedOffline
          ? 'Registro de sueño quitado sin internet. Lo sincronizaremos cuando vuelvas.'
          : 'Registro de sueño eliminado.',
        'success',
      );
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos borrar ese registro de sueño.';
      showToast(message, 'error');
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'useSleep.deleteSleepEntry',
      });
      return false;
    }
  }, [isOnline, queryClient, showToast, userId]);

  useEffect(() => {
    if (!userId || !isOnline) return;

    let cancelled = false;

    const syncPending = async () => {
      const result = await flushOfflineSleepEntries(userId);
      if (cancelled || result.synced === 0) return;

      await queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
      await queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
      await queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      await queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      showToast(
        result.failed > 0
          ? `Sincronizamos ${result.synced} cambios de sueño. ${result.failed} siguen pendientes.`
          : `Sincronizamos ${result.synced} cambios de sueño.`,
        'success',
      );

      void supabase.rpc('calculate_daily_score', { p_user_id: userId });
    };

    void syncPending();
    return () => {
      cancelled = true;
    };
  }, [isOnline, queryClient, showToast, userId]);

  const getOptimalAlarmTimes = useCallback((bedtime: Date): Date[] => {
    const cycles = [4, 5, 6];
    return cycles.map((cycleCount) => {
      const alarm = new Date(bedtime);
      alarm.setMinutes(alarm.getMinutes() + cycleCount * 90 + 14);
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

    await queryClient.invalidateQueries({ queryKey: ['sleep_last'] });
    await queryClient.invalidateQueries({ queryKey: ['sleep_history'] });
    await queryClient.invalidateQueries({ queryKey: ['today_summary'] });
    await queryClient.invalidateQueries({ queryKey: ['daily_score'] });

    void (async () => {
      try {
        await supabase.rpc('calculate_daily_score', { p_user_id: userId });
      } catch {
        // Best effort only.
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
    isUpdatingSleep,
    logSleep,
    logSleepAsync,
    updateSleep,
    updateSleepAsync,
    getLastNight: () => lastSleep,
    getWeeklyAverage: () => avgHours,
    getOptimalAlarmTimes,
    refetch,
    sleepActionPlan,
    sleepStreakDays,
    importHealthConnectSessions,
    deleteSleepEntry,
  };
}
