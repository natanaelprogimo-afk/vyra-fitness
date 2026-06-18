// VYRA FITNESS - useWater Hook
// Logica completa del modulo de hidratacion.
// Cache local + sincronizacion diferida para hidratar sin internet.
// Calcula hidratacion equivalente segun tipo de bebida.


import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import initSyncService from '@/services/sync';
import { captureError } from '@/lib/sentry';
import { todayISO } from '@/utils/dates';
import { calculateHydrationEquivalent } from '@/utils/calculations';
import { trackLogCreated, trackWaterLogged } from '@/lib/analytics';
import type { WaterLog, DrinkTypeId } from '@/types/modules';
import { ErrorMessages } from '@/constants/strings';
import { DRINK_TYPES } from '@/constants/modules';
import { resolveFemalePhaseFromRecord } from '@/lib/female-phase';
import { getWaterDrinkLabel } from '@/lib/water';
import { getWaterContext } from '@/lib/water-context';
import {
  buildCustomWaterLogMetaKey,
  listCustomWaterDrinks,
  listCustomWaterLogMeta,
  saveCustomWaterDrinkPreset,
  saveCustomWaterLogMeta,
  type CustomWaterDrinkPreset,
  type CustomWaterLogMeta,
} from '@/lib/water-custom';
import { fetchAutoWaterClimate, type WaterWeatherSnapshot } from '@/lib/water-weather';
import { isRecoverableOfflineError } from '@/lib/offline-errors';
import {
  cacheRemoteWaterLogs,
  deleteOfflineWaterLog,
  flushOfflineWaterLogs,
  getOfflineWaterHistory,
  getOfflineWaterLogsForDay,
  queueOfflineWaterLog,
} from '@/lib/water-offline';

interface HydrationGoalAdjustment {
  source: 'steps' | 'fasting' | 'female_phase' | 'climate';
  delta: number;
  reason: string;
}

interface HydrationStreakInfo {
  streakDays: number;
  metToday: boolean;
}

interface BeverageCompositionItem {
  key: string;
  drinkType: DrinkTypeId | string;
  label: string;
  amountMl: number;
  hydrationMl: number;
  hydrationFactor: number | null;
  isCustom: boolean;
}

interface WaterHourlyBucket {
  label: string;
  totalMl: number;
}

function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().split('T')[0] ?? day;
}

function computeHydrationStreak(
  dailyTotals: Array<{ date: string; total: number }>,
  goal: number,
): HydrationStreakInfo {
  if (!dailyTotals.length) return { streakDays: 0, metToday: false };

  const byDate = new Map<string, number>();
  for (const row of dailyTotals) {
    byDate.set(row.date, row.total);
  }

  let streak = 0;
  let day = todayISO();

  for (let i = 0; i < 60; i += 1) {
    const total = byDate.get(day) ?? 0;
    if (total >= goal) {
      streak += 1;
      day = addDays(day, -1);
      continue;
    }
    break;
  }

  return {
    streakDays: streak,
    metToday: (byDate.get(todayISO()) ?? 0) >= goal,
  };
}

function computeBeverageComposition(
  rows: Array<{ drink_type: string; amount_ml: number; hydration_equivalent_ml: number; logged_at: string }>,
  customLogMeta: Record<string, CustomWaterLogMeta>,
): BeverageCompositionItem[] {
  const from = new Date();
  from.setDate(from.getDate() - 6);
  const fromMs = from.getTime();

  const map = new Map<string, BeverageCompositionItem>();
  for (const row of rows) {
    const loggedMs = new Date(row.logged_at).getTime();
    if (Number.isNaN(loggedMs) || loggedMs < fromMs) continue;

    const logKey = buildCustomWaterLogMetaKey(row);
    const meta = row.drink_type === 'other' ? customLogMeta[logKey] ?? null : null;
    const key = meta
      ? `custom:${meta.name.toLowerCase()}:${Math.round(meta.hydrationFactor * 100)}`
      : (row.drink_type || 'water');
    const current = map.get(key) ?? {
      key,
      drinkType: key,
      label: meta?.name ?? getWaterDrinkLabel(row.drink_type || 'water'),
      amountMl: 0,
      hydrationMl: 0,
      hydrationFactor: meta?.hydrationFactor ?? null,
      isCustom: Boolean(meta),
    };
    current.amountMl += row.amount_ml ?? 0;
    current.hydrationMl += row.hydration_equivalent_ml ?? 0;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.hydrationMl - a.hydrationMl);
}

function buildHourlyDistribution(
  rows: Array<{ logged_at: string; hydration_equivalent_ml: number }>,
): { buckets: WaterHourlyBucket[]; valley: WaterHourlyBucket | null } {
  const buckets = Array.from({ length: 9 }, (_, index) => {
    const start = 6 + index * 2;
    const end = start + 2;
    return {
      label: `${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')}`,
      totalMl: 0,
    };
  });

  for (const row of rows) {
    const date = new Date(row.logged_at);
    const hour = date.getHours();
    const bucketIndex = Math.floor((hour - 6) / 2);
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex]!.totalMl += row.hydration_equivalent_ml ?? 0;
    }
  }

  const nonZero = buckets.filter((bucket) => bucket.totalMl > 0);
  const valley = nonZero.length
    ? nonZero.reduce((lowest, bucket) => (bucket.totalMl < lowest.totalMl ? bucket : lowest), nonZero[0]!)
    : null;

  return { buckets, valley };
}

// Metas de alerta por rango horario
function getHydrationAlert(current: number, goal: number, hour: number): string | null {
  const pct = current / goal;
  if (pct >= 1)    return null;
  if (hour >= 18 && pct < 0.5) return 'Tomaste menos de la mitad. Intenta tomar 2 vasos ahora.';
  if (hour >= 14 && pct < 0.3) return 'Ya es la tarde y tomaste poco. Acordate de hidratarte.';
  return null;
}

// Adaptive reminder timing: analyze logging pattern and suggest next best time
interface AdaptiveReminderSuggestion {
  nextReminderHour: number;
  nextReminderMinute: number;
  reason: string;
}

function getAdaptiveReminderTime(
  logs: Array<{ logged_at: string }>,
  currentHour: number,
): AdaptiveReminderSuggestion {
  if (!logs.length) {
    // Default: every 2 hours starting from 8am
    const defaultNextHour = Math.min(currentHour + 2, 20);
    return {
      nextReminderHour: defaultNextHour,
      nextReminderMinute: 0,
      reason: 'Sin datos aún, recordatorio cada 2 horas',
    };
  }

  // Analyze logging frequency last 14 days
  const last14Days = logs.filter(log => {
    const logDate = new Date(log.logged_at);
    const now = new Date();
    const diff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 14;
  });

  if (!last14Days.length) {
    const defaultNextHour = Math.min(currentHour + 2, 20);
    return {
      nextReminderHour: defaultNextHour,
      nextReminderMinute: 0,
      reason: 'Menos de 2 semanas de datos',
    };
  }

  // Calculate average time between logs
  const hours: number[] = [];
  for (const log of last14Days) {
    hours.push(new Date(log.logged_at).getHours());
  }
  hours.sort((a, b) => a - b);

  // Find biggest gap in logging pattern
  let maxGap = 0;
  let gapStartHour = currentHour + 2;
  for (let i = 0; i < hours.length; i++) {
    const nextHour = hours[(i + 1) % hours.length];
    const gap = nextHour > hours[i] ? nextHour - hours[i] : (24 - hours[i]) + nextHour;
    if (gap > maxGap && gap <= 8) {
      maxGap = gap;
      gapStartHour = hours[i] + Math.ceil(gap / 2);
    }
  }

  if (maxGap === 0) {
    // No pattern, suggest regular intervals
    const nextHour = Math.min(currentHour + 2, 20);
    return {
      nextReminderHour: nextHour,
      nextReminderMinute: 15,
      reason: 'Recordatorio cada 2 horas',
    };
  }

  // Suggested time is in the middle of the biggest gap
  const nextHour = gapStartHour % 24;
  return {
    nextReminderHour: nextHour,
    nextReminderMinute: Math.floor(Math.random() * 60),
    reason: `Basado en tu patrón de la última quincena (brecha ~${maxGap}h)`,
  };
}

// Offline climate fallback: Use cached data when offline
interface OfflineClimateSnapshot {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPct: number;
  isOfflineEstimate: boolean;
}

function getOfflineClimateEstimate(history: Array<{ hydration_equivalent_ml: number; logged_at: string }>): OfflineClimateSnapshot {
  // If no online data, use last 7 days pattern to estimate climate
  const last7Days = history.filter(log => {
    const logDate = new Date(log.logged_at);
    const now = new Date();
    const diff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const avgDailyMl = last7Days.length
    ? last7Days.reduce((sum, log) => sum + (log.hydration_equivalent_ml ?? 0), 0) / 7
    : 1500;

  // Estimate temperature from hydration patterns:
  // If drinking >2500ml/day on average: probably hot (~30°C)
  // If drinking 1500-2000ml/day: moderate (~20°C)
  // If drinking <1500ml/day: cool (~15°C)
  let estimatedTemp = 20;
  if (avgDailyMl > 2500) estimatedTemp = 28;
  else if (avgDailyMl < 1200) estimatedTemp = 12;

  return {
    temperatureC: estimatedTemp,
    apparentTemperatureC: estimatedTemp + 2, // Add wind chill assumption
    humidityPct: 55, // Conservative estimate
    isOfflineEstimate: true,
  };
}

function buildLocalWaterLog(
  userId: string,
  id: string,
  amountMl: number,
  drinkType: DrinkTypeId,
  hydrationEquivalent: number,
  loggedAtIso: string,
): WaterLog {
  return {
    id,
    user_id: userId,
    amount_ml: amountMl,
    drink_type: drinkType,
    hydration_equivalent_ml: hydrationEquivalent,
    logged_at: loggedAtIso,
    synced_at: null,
  };
}

interface WaterCustomDrinkInput {
  name: string;
  hydrationFactor: number;
  presetId?: string | null;
}

export function useWater() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const isOnline    = useUIStore((s) => s.isOnline);
  const waterAutoHeatAdjustment = useSettingsStore((s) => s.waterAutoHeatAdjustment);
  const userId      = profile?.id ?? '';
  const baseGoal    = profile?.water_goal_ml ?? 2500;
  const waterContext = getWaterContext(profile);
  const { data: customDrinks = [] } = useQuery<CustomWaterDrinkPreset[]>({
    queryKey: ['water_custom_drinks', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await listCustomWaterDrinks(userId);
    },
    enabled: !!userId,
    staleTime: Infinity,
  });
  const { data: customLogMeta = {} } = useQuery<Record<string, CustomWaterLogMeta>>({
    queryKey: ['water_custom_log_meta', userId],
    queryFn: async () => {
      if (!userId) return {};
      return await listCustomWaterLogMeta(userId);
    },
    enabled: !!userId,
    staleTime: Infinity,
  });

  // Logs del dia: Supabase online y cache local offline.
  const { data: logs = [], isLoading, refetch } = useQuery<WaterLog[]>({
    queryKey: ['water_logs', userId, todayISO()],
    queryFn:  async () => {
      if (!userId) return [];

      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('water_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('logged_at', `${todayISO()}T00:00:00`)
            .order('logged_at', { ascending: true });

          if (error) throw error;
          await cacheRemoteWaterLogs(userId, (data ?? []) as Array<{
            id: string;
            user_id: string;
            amount_ml: number;
            drink_type: string;
            hydration_equivalent_ml: number;
            logged_at: string;
            created_at?: string | null;
          }>);
          return data ?? [];
        } catch (error) {
          if (!isRecoverableOfflineError(error)) {
            throw error;
          }
        }
      }

      return await getOfflineWaterLogsForDay(userId, todayISO());
    },
    enabled:        !!userId,
    staleTime:      30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Totales del dia.
  const totalMl     = logs.reduce((s, l) => s + (l.amount_ml ?? 0), 0);
  const totalHydro  = logs.reduce((s, l) => s + (l.hydration_equivalent_ml ?? 0), 0);
  const { data: stepContext } = useQuery({
    queryKey: ['water_goal_context_steps', userId, todayISO()],
    queryFn: async () => {
      if (!userId || !isOnline) return null;
      const { data } = await supabase
        .from('step_logs')
        .select('steps')
        .eq('user_id', userId)
        .eq('logged_date', todayISO())
        .single();
      return data;
    },
    enabled: !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  const { data: fastingContext } = useQuery({
    queryKey: ['water_goal_context_fasting', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return null;
      const { data } = await supabase
        .from('fasting_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!userId && isOnline,
    staleTime: 2 * 60 * 1000,
  });

  const { data: femaleContext } = useQuery({
    queryKey: ['water_goal_context_female_phase', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return null;
      const { data } = await supabase
        .from('female_health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(1)
        .single();
      if (!data) return null;
      return {
        ...data,
        phase: await resolveFemalePhaseFromRecord(data as Record<string, unknown>),
      };
    },
    enabled: !!userId && isOnline,
    staleTime: 60 * 60 * 1000,
  });

  const { data: climateSnapshot } = useQuery<WaterWeatherSnapshot | null>({
    queryKey: ['water_goal_context_climate', userId, waterAutoHeatAdjustment],
    queryFn: async () => {
      if (!userId || !waterAutoHeatAdjustment) return null;
      return await fetchAutoWaterClimate();
    },
    enabled: !!userId && waterAutoHeatAdjustment,
    staleTime: 2 * 60 * 60 * 1000,
  });

  const resolvedClimate =
    climateSnapshot?.climate ??
    (waterContext.auto.enabled ? waterContext.auto.climate : null) ??
    null;

  const goalAdjustments: HydrationGoalAdjustment[] = [];
  if ((stepContext?.steps ?? 0) >= 15000) {
    goalAdjustments.push({
      source: 'steps',
      delta: 500,
      reason: 'Actividad alta hoy (+15.000 pasos).',
    });
  } else if ((stepContext?.steps ?? 0) >= 10000) {
    goalAdjustments.push({
      source: 'steps',
      delta: 300,
      reason: 'Actividad moderada-alta hoy (+10.000 pasos).',
    });
  }

  if (fastingContext?.id) {
    goalAdjustments.push({
      source: 'fasting',
      delta: 250,
      reason: 'Ayuno activo detectado.',
    });
  }

  if (femaleContext?.phase === 'menstrual' || femaleContext?.phase === 'luteal') {
    goalAdjustments.push({
      source: 'female_phase',
      delta: 200,
      reason: `Fase ${femaleContext.phase} (hidratacion reforzada).`,
    });
  }

  if (waterAutoHeatAdjustment && resolvedClimate) {
    const climateMap: Record<
      NonNullable<typeof resolvedClimate>,
      { delta: number; reason: string } | null
    > = {
      hot: {
        delta: 450,
        reason: climateSnapshot?.apparentTemperatureC
          ? `Calor fuerte detectado (${Math.round(climateSnapshot.apparentTemperatureC)} deg de sensacion).`
          : 'Calor fuerte detectado hoy.',
      },
      warm: {
        delta: 250,
        reason: climateSnapshot?.temperatureC
          ? `Clima calido detectado (${Math.round(climateSnapshot.temperatureC)} deg).`
          : 'Clima calido detectado hoy.',
      },
      humid: {
        delta: 200,
        reason: climateSnapshot?.humidityPct
          ? `Humedad alta detectada (${Math.round(climateSnapshot.humidityPct)}%).`
          : 'Humedad alta detectada hoy.',
      },
      dry: {
        delta: 150,
        reason: 'Ambiente seco detectado hoy.',
      },
      normal: null,
    };
    const climateAdjustment = climateMap[resolvedClimate];
    if (climateAdjustment) {
      goalAdjustments.push({
        source: 'climate',
        delta: climateAdjustment.delta,
        reason: climateAdjustment.reason,
      });
    }
  }

  const goal = baseGoal + goalAdjustments.reduce((sum, item) => sum + item.delta, 0);
  const progressPct = Math.min(100, (totalHydro / goal) * 100);
  const remaining   = Math.max(0, goal - totalHydro);

  // Alerta segun hora del dia.
  const hydrationAlert = getHydrationAlert(totalHydro, goal, new Date().getHours());

  // â”€â”€â”€ Log de agua â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { mutate: logWater, isPending: isLogging } = useMutation({
    mutationFn: async ({
      amountMl,
      drinkType = 'water',
      customDrink = null,
    }: {
      amountMl: number;
      drinkType?: DrinkTypeId;
      customDrink?: WaterCustomDrinkInput | null;
    }) => {
      if (!userId) throw new Error('No user');
      if (amountMl <= 0 || amountMl > 5000) throw new Error('Cantidad invalida');

      const hydrationEquivalent = calculateHydrationEquivalent(
        amountMl,
        drinkType,
        customDrink?.hydrationFactor,
      );
      const loggedAtIso         = new Date().toISOString();

      if (isOnline) {
        // Escribir directo a Supabase
        const { data, error } = await supabase
          .from('water_logs')
          .insert({
            user_id:                 userId,
            amount_ml:               amountMl,
            drink_type:              drinkType,
            hydration_equivalent_ml: hydrationEquivalent,
            logged_at:               loggedAtIso,
          })
          .select('*')
          .single();

        if (!error) {
          return {
            log: data as WaterLog,
            savedOffline: false,
          };
        }

        if (!isRecoverableOfflineError(error)) {
          throw error;
        }
      }
        // Offline: escribir local y sincronizar cuando vuelva la conexion.
      const localId = await queueOfflineWaterLog(userId, {
        amount_ml: amountMl,
        drink_type: drinkType,
        hydration_equivalent_ml: hydrationEquivalent,
        logged_at: loggedAtIso,
        logged_date: todayISO(),
      });

      return {
        log: buildLocalWaterLog(userId, localId, amountMl, drinkType, hydrationEquivalent, loggedAtIso),
        savedOffline: true,
      };
    },

    onSuccess: async ({ log, savedOffline }, { amountMl, drinkType = 'water', customDrink = null }) => {
      const waterLogsKey = ['water_logs', userId, todayISO()] as const;
      const waterHistoryKey = ['water_history', userId] as const;

      queryClient.setQueryData<WaterLog[]>(waterLogsKey, (current = []) =>
        [...current, log].sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()),
      );
      queryClient.setQueryData<WaterLog[]>(waterHistoryKey, (current = []) =>
        [...current, log].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()),
      );

      if (customDrink && userId) {
        await saveCustomWaterLogMeta(userId, buildCustomWaterLogMetaKey(log), {
          name: customDrink.name,
          hydrationFactor: customDrink.hydrationFactor,
          presetId: customDrink.presetId ?? null,
        });
        await queryClient.invalidateQueries({ queryKey: ['water_custom_log_meta', userId] });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['water_logs'] }),
        queryClient.invalidateQueries({ queryKey: ['water_history'] }),
        queryClient.invalidateQueries({ queryKey: ['today_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['daily_score'] }),
      ]);

      const hydro = calculateHydrationEquivalent(amountMl, drinkType, customDrink?.hydrationFactor);
      const updatedLogs = queryClient.getQueryData<WaterLog[]>(waterLogsKey) ?? [];
      const newTotal =
        updatedLogs.reduce((sum, item) => sum + (item.hydration_equivalent_ml ?? 0), 0) || totalHydro + hydro;
      // Feedback positivo
      const drink =
        DRINK_TYPES.find((item) => item.id === drinkType) ??
        (drinkType === 'soda'
          ? { emoji: '\uD83E\uDD64' }
          : { emoji: '\uD83D\uDCA7' });
      showToast(`+${amountMl}ml ${drink?.emoji ?? '\uD83D\uDCA7'} - ${Math.round(newTotal)}/${goal}ml`, 'success');

      if (totalHydro < goal && newTotal >= goal) {
        showToast('Meta de hidratacion alcanzada.', 'success');
      }

      trackLogCreated('water', savedOffline ? 'manual_offline' : 'manual', Date.now());
      trackWaterLogged({
        amount_ml: amountMl,
        drink_type: drinkType,
        source: savedOffline ? 'manual_offline' : 'manual',
        is_offline: savedOffline,
      });

      // Recalcular score
      if (!savedOffline && isOnline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }
    },

    onError: (err) => {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'logWater'" });
      showToast(ErrorMessages.saveFailed, 'error');
    },
  });

  // â”€â”€â”€ Eliminar log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { mutate: deleteLog, isPending: isDeleting } = useMutation({
    mutationFn: async (logId: string) => {
      if (!userId) throw new Error('No user');

      if (isOnline) {
        const { error } = await supabase
          .from('water_logs')
          .delete()
          .eq('id', logId)
          .eq('user_id', userId); // RLS extra check

        if (!error) {
          return { logId, deletedOffline: false };
        }

        if (!isRecoverableOfflineError(error)) {
          throw error;
        }
      }

      await deleteOfflineWaterLog(userId, logId);
      return { logId, deletedOffline: true };
    },

    onSuccess: async ({ logId, deletedOffline }) => {
      const waterLogsKey = ['water_logs', userId, todayISO()] as const;
      const waterHistoryKey = ['water_history', userId] as const;

      queryClient.setQueryData<WaterLog[]>(waterLogsKey, (current = []) => current.filter((entry) => entry.id !== logId));
      queryClient.setQueryData<WaterLog[]>(waterHistoryKey, (current = []) => current.filter((entry) => entry.id !== logId));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['water_logs'] }),
        queryClient.invalidateQueries({ queryKey: ['water_history'] }),
        queryClient.invalidateQueries({ queryKey: ['today_summary'] }),
      ]);
      showToast(
        deletedOffline
          ? 'Registro quitado sin internet. Lo sincronizaremos cuando vuelvas.'
          : 'Registro eliminado',
        'info',
      );
    },

    onError: () => {
      showToast(ErrorMessages.generic, 'error');
    },
  });

  // Historial: ultimos 30 dias.
  const { data: history = [] } = useQuery({
    queryKey: ['water_history', userId],
    queryFn:  async () => {
      if (!userId) return [];
      if (!isOnline) return await getOfflineWaterHistory(userId);

      try {
        const { data, error } = await supabase
          .from('water_logs')
          .select('id, user_id, logged_at, hydration_equivalent_ml, drink_type, amount_ml, created_at')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false })
          .limit(500);
        if (error) throw error;
        await cacheRemoteWaterLogs(userId, (data ?? []) as Array<{
          id: string;
          user_id: string;
          amount_ml: number;
          drink_type: string;
          hydration_equivalent_ml: number;
          logged_at: string;
          created_at?: string | null;
        }>);
        return data ?? [];
      } catch (error) {
        if (!isRecoverableOfflineError(error)) {
          throw error;
        }
        return await getOfflineWaterHistory(userId);
      }
    },
    enabled:   !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Agrupar historial por dia para el grafico.
  const weeklyData = groupByDay(history, 7);
  const monthData = groupByDay(history, 30);
  const hydrationStreak = computeHydrationStreak(monthData, baseGoal);
  const beverageComposition = computeBeverageComposition(
    history as Array<{ drink_type: string; amount_ml: number; hydration_equivalent_ml: number; logged_at: string }>,
    customLogMeta,
  );
  const hourlyDistribution = buildHourlyDistribution(
    history as Array<{ logged_at: string; hydration_equivalent_ml: number }>,
  );

  const morningContext = (() => {
    if (logs.length > 0) return null;

    const hour = new Date().getHours();
    if (hour > 11) return null;

    if (resolvedClimate === 'hot' || resolvedClimate === 'humid') {
      return 'Hoy el clima ya empuja tu hidratacion para arriba. Empieza temprano para no correr atras despues.';
    }

    const lastLog = history
      .slice()
      .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())[0];

    if (!lastLog) {
      return 'Arranca con agua ahora: hidratarte temprano mejora energía y foco para todo el día.';
    }

    const hoursSinceLastDrink = Math.max(
      0,
      (Date.now() - new Date(lastLog.logged_at).getTime()) / (1000 * 60 * 60),
    );

    if (hoursSinceLastDrink < 6) {
      return 'Buen ritmo: mantenelo con un vaso ahora para sostener energia y foco.';
    }

    const cognitiveDrop = Math.round(Math.min(25, Math.max(10, (hoursSinceLastDrink - 4) * 2.5)));
    return `Llevas ~${Math.round(hoursSinceLastDrink)}h sin hidratarte. Tu foco puede bajar ~${cognitiveDrop}% ahora mismo.`;
  })();

  const resolveDrinkLabel = (
    row: Pick<WaterLog, 'drink_type' | 'amount_ml' | 'hydration_equivalent_ml' | 'logged_at'>,
  ) => {
    const logKey = buildCustomWaterLogMetaKey(row);
    const meta = row.drink_type === 'other' ? customLogMeta[logKey] ?? null : null;
    return meta?.name ?? getWaterDrinkLabel(row.drink_type);
  };

  useEffect(() => {
    // Start background sync service (idempotent)
    try { initSyncService(); } catch (_) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!userId || !isOnline) return;

    let active = true;

    const flushPending = async () => {
      const result = await flushOfflineWaterLogs(userId);
      if (!active) return;
      if (result.synced > 0) {
        queryClient.invalidateQueries({ queryKey: ['water_logs'] });
        queryClient.invalidateQueries({ queryKey: ['water_history'] });
      }
    };

    void flushPending();

    return () => {
      active = false;
    };
  }, [isOnline, queryClient, userId]);

  return {
    logs,
    totalMl,
    totalHydro,
    goal,
    baseGoal,
    goalAdjustments,
    progressPct,
    remaining,
    hydrationAlert,
    morningContext,
    hydrationStreak,
    climateSnapshot,
    beverageComposition,
    customDrinks,
    hourlyDistribution,
    weeklyData,
    history,
    isLoading,
    isLogging,
    isDeleting,
    resolveDrinkLabel,
    saveCustomDrinkPreset: async (input: { id?: string | null; name: string; hydrationFactor: number }) => {
      if (!userId) return null;
      const preset = await saveCustomWaterDrinkPreset(userId, input);
      await queryClient.invalidateQueries({ queryKey: ['water_custom_drinks', userId] });
      return preset;
    },
    addWaterLog: (amount_ml: number, drink_type: DrinkTypeId = 'water') =>
      logWater({ amountMl: amount_ml, drinkType: drink_type }),
    getDailyTotal: () => totalHydro,
    getWeeklyHistory: () => weeklyData,
    logWater:   (amountMl: number, drinkType?: DrinkTypeId, customDrink?: WaterCustomDrinkInput | null) =>
      logWater({ amountMl, drinkType, customDrink }),
    deleteLog,
    refetch,
  };
}

// Helper: agrupar por dia.
function groupByDay(
  logs: Array<{ logged_at: string; hydration_equivalent_ml: number }>,
  days: number
): Array<{ date: string; total: number }> {
  const map: Record<string, number> = {};
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map[d.toISOString().split('T')[0]] = 0;
  }

  for (const log of logs) {
    const date = log.logged_at.split('T')[0];
    if (date in map) map[date] = (map[date] ?? 0) + log.hydration_equivalent_ml;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}
