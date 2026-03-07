// ============================================================
// VYRA FITNESS — useWater Hook
// Lógica completa del módulo de hidratación.
// Escribe en WatermelonDB (offline-first) + sincroniza a Supabase.
// Calcula hidratación equivalente según tipo de bebida.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { database } from '@/database/watermelon';
import { writeLocalAndSync } from '@/database';
import initSyncService from '@/services/sync';
import { captureError } from '@/lib/sentry';
import { todayISO } from '@/utils/dates';
import { calculateHydrationEquivalent } from '@/utils/calculations';
import { addCoins } from '@/services/supabase/profiles';
import { trackLogCreated } from '@/lib/analytics';
import type { WaterLog, DrinkTypeId } from '@/types/modules';
import { ErrorMessages } from '@/constants/strings';
import { DRINK_TYPES } from '@/constants/modules';
import { resolveFemalePhaseFromRecord } from '@/lib/female-phase';

const FIRST_WATER_REWARD_DESC = 'Primer log de agua del dia';

interface HydrationGoalAdjustment {
  source: 'steps' | 'fasting' | 'female_phase';
  delta: number;
  reason: string;
}

interface HydrationSleepCorrelation {
  highHydrationAvgSleep: number | null;
  lowHydrationAvgSleep: number | null;
  sampleHigh: number;
  sampleLow: number;
  insight: string | null;
}

interface HydrationStreakInfo {
  streakDays: number;
  metToday: boolean;
}

interface BeverageCompositionItem {
  drinkType: DrinkTypeId | string;
  amountMl: number;
  hydrationMl: number;
}

function isoDay(value: string): string {
  return value.split('T')[0] ?? value;
}

function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().split('T')[0] ?? day;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((sum, item) => sum + item, 0) / values.length) * 10) / 10;
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

function computeHydrationSleepCorrelation(
  waterRows: Array<{ logged_at: string; hydration_equivalent_ml: number }>,
  sleepRows: Array<{ end_time: string; quality_score: number }>,
): HydrationSleepCorrelation {
  if (!waterRows.length || !sleepRows.length) {
    return {
      highHydrationAvgSleep: null,
      lowHydrationAvgSleep: null,
      sampleHigh: 0,
      sampleLow: 0,
      insight: null,
    };
  }

  const hydrationByDay = new Map<string, number>();
  for (const row of waterRows) {
    const day = isoDay(row.logged_at);
    hydrationByDay.set(day, (hydrationByDay.get(day) ?? 0) + (row.hydration_equivalent_ml ?? 0));
  }

  const highScores: number[] = [];
  const lowScores: number[] = [];

  for (const sleep of sleepRows) {
    const sleepDay = isoDay(sleep.end_time);
    const hydrationDay = addDays(sleepDay, -1);
    const hydration = hydrationByDay.get(hydrationDay);
    if (hydration === undefined) continue;

    if (hydration >= 2000) {
      highScores.push(sleep.quality_score);
    } else if (hydration < 1500) {
      lowScores.push(sleep.quality_score);
    }
  }

  const highAvg = average(highScores);
  const lowAvg = average(lowScores);

  let insight: string | null = null;
  if (highAvg !== null && lowAvg !== null && highScores.length >= 2 && lowScores.length >= 2) {
    const diff = Math.round((highAvg - lowAvg) * 10) / 10;
    if (diff > 0.8) {
      insight = `En tus dias con 2L+ de hidratacion, tu sueno promedio sube a ${highAvg}/100 (vs ${lowAvg}/100).`;
    } else if (diff < -0.8) {
      insight = `No se ve mejora de sueno con hidratacion alta por ahora (${highAvg}/100 vs ${lowAvg}/100).`;
    } else {
      insight = `Tu sueno se mantiene parecido con hidratacion alta o baja (${highAvg}/100 vs ${lowAvg}/100).`;
    }
  }

  return {
    highHydrationAvgSleep: highAvg,
    lowHydrationAvgSleep: lowAvg,
    sampleHigh: highScores.length,
    sampleLow: lowScores.length,
    insight,
  };
}

function computeBeverageComposition(
  rows: Array<{ drink_type: string; amount_ml: number; hydration_equivalent_ml: number; logged_at: string }>,
): BeverageCompositionItem[] {
  const from = new Date();
  from.setDate(from.getDate() - 6);
  const fromMs = from.getTime();

  const map = new Map<string, BeverageCompositionItem>();
  for (const row of rows) {
    const loggedMs = new Date(row.logged_at).getTime();
    if (Number.isNaN(loggedMs) || loggedMs < fromMs) continue;

    const key = row.drink_type || 'water';
    const current = map.get(key) ?? {
      drinkType: key,
      amountMl: 0,
      hydrationMl: 0,
    };
    current.amountMl += row.amount_ml ?? 0;
    current.hydrationMl += row.hydration_equivalent_ml ?? 0;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.hydrationMl - a.hydrationMl);
}

// Metas de alerta por rango horario
function getHydrationAlert(current: number, goal: number, hour: number): string | null {
  const pct = current / goal;
  if (pct >= 1)    return null;
  if (hour >= 18 && pct < 0.5) return '¡Tomaste menos de la mitad! Intentá tomar 2 vasos ahora 💧';
  if (hour >= 14 && pct < 0.3) return 'Ya es la tarde y tomaste poco. Acordate de hidratarte 💧';
  return null;
}

export function useWater() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const showAchievement = useUIStore((s) => s.showAchievement);
  const isOnline    = useUIStore((s) => s.isOnline);
  const userId      = profile?.id ?? '';
  const baseGoal    = profile?.water_goal_ml ?? 2500;

  // ─── Logs del día (desde Supabase cuando hay conexión, WDB offline) ──
  const { data: logs = [], isLoading, refetch } = useQuery<WaterLog[]>({
    queryKey: ['water_logs', userId, todayISO()],
    queryFn:  async () => {
      if (!userId) return [];

      if (isOnline) {
        const { data, error } = await supabase
          .from('water_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', `${todayISO()}T00:00:00`)
          .order('logged_at', { ascending: true });

        if (error) throw error;
        return data ?? [];
      }

      // Offline: leer de WatermelonDB
      const localLogs = await database.get('water_logs').query().fetch();
      return (localLogs as any[])
        .filter((l: any) => !l.deleted && l.user_id === userId && l.logged_date === todayISO())
        .map((l: any) => ({
          id:                       l.id,
          user_id:                  l.user_id,
          amount_ml:                l.amount_ml,
          drink_type:               l.drink_type,
          hydration_equivalent_ml:  l.hydration_equivalent_ml,
          logged_at:                new Date(l.logged_at).toISOString(),
          created_at:               new Date(l.created_at).toISOString(),
        }));
    },
    enabled:        !!userId,
    staleTime:      30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // ─── Totales del día ─────────────────────────────────────
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
        .from('fasting_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('completed', false)
        .eq('abandoned', false)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
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

  const goal = baseGoal + goalAdjustments.reduce((sum, item) => sum + item.delta, 0);
  const progressPct = Math.min(100, (totalHydro / goal) * 100);
  const remaining   = Math.max(0, goal - totalHydro);

  // ─── Alerta según hora del día ───────────────────────────
  const hydrationAlert = getHydrationAlert(totalHydro, goal, new Date().getHours());

  // ─── Log de agua ─────────────────────────────────────────
  const { mutate: logWater, isPending: isLogging } = useMutation({
    mutationFn: async ({
      amountMl,
      drinkType = 'water',
    }: {
      amountMl:  number;
      drinkType?: DrinkTypeId;
    }) => {
      if (!userId) throw new Error('No user');
      if (amountMl <= 0 || amountMl > 5000) throw new Error('Cantidad inválida');

      const hydrationEquivalent = calculateHydrationEquivalent(amountMl, drinkType);
      const loggedAt            = Date.now();

      const payload = {
        amount_ml:               amountMl,
        drink_type:              drinkType,
        hydration_equivalent_ml: hydrationEquivalent,
        logged_at:               loggedAt,
        logged_date:             todayISO(),
        deleted:                 false,
      };

      if (isOnline) {
        // Escribir directo a Supabase
        const { data, error } = await supabase
          .from('water_logs')
          .insert({
            user_id:                 userId,
            amount_ml:               amountMl,
            drink_type:              drinkType,
            hydration_equivalent_ml: hydrationEquivalent,
            logged_at:               new Date(loggedAt).toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        return data.id;
      } else {
        // Offline: escribir local + encolar sync (writeLocalAndSync usa DB y cola)
        const localId = await writeLocalAndSync('water_logs', payload, userId);
        return localId;
      }
    },

    onSuccess: async (_, { amountMl, drinkType = 'water' }) => {
      queryClient.invalidateQueries({ queryKey: ['water_logs'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      const hydro = calculateHydrationEquivalent(amountMl, drinkType);
      const newTotal = totalHydro + hydro;
      const isFirstLogToday = logs.length === 0;

      // Feedback positivo
      const drink = DRINK_TYPES[drinkType];
      showToast(`+${amountMl}ml ${drink?.emoji ?? '💧'} — ${Math.round(newTotal)}/${goal}ml`, 'success');

      if (isFirstLogToday) {
        const { count } = await supabase
          .from('coin_transactions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('type', 'water_log')
          .eq('description', FIRST_WATER_REWARD_DESC);

        if ((count ?? 0) === 0) {
          const rewarded = await addCoins(userId, 20, 'water_log', FIRST_WATER_REWARD_DESC);
          if (rewarded !== null) {
            showAchievement({
              type: 'streak',
              title: 'Primer paso',
              subtitle: 'Ya sumaste 20 monedas por arrancar tu dia con agua.',
              coins: 20,
              xp: 0,
            });
          }
        }
      }

      // Coins por primera vez que alcanza la meta del día
      if (totalHydro < goal && newTotal >= goal) {
        const newBalance = await addCoins(userId, 10, 'hydration_goal', 'Meta de hidratación del día');
        if (newBalance !== null) {
          showToast('¡Meta de hidratación! +10 🪙', 'coins');
        }
      }

      trackLogCreated('water', 'manual', Date.now());

      // Recalcular score
      if (isOnline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }
    },

    onError: (err) => {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'logWater'" });
      showToast(ErrorMessages.saveFailed, 'error');
    },
  });

  // ─── Eliminar log ─────────────────────────────────────────
  const { mutate: deleteLog, isPending: isDeleting } = useMutation({
    mutationFn: async (logId: string) => {
      if (!userId) throw new Error('No user');

      if (isOnline) {
        const { error } = await supabase
          .from('water_logs')
          .delete()
          .eq('id', logId)
          .eq('user_id', userId); // RLS extra check

        if (error) throw error;
      } else {
        // Soft delete en WDB
        await database.write(async () => {
          const record = await database.get('water_logs').find(logId);
          await (record as any).update((r: any) => { r.deleted = true; r.synced = false; });
        });
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water_logs'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      showToast('Registro eliminado', 'info');
    },

    onError: () => {
      showToast(ErrorMessages.generic, 'error');
    },
  });

  // ─── Historial (últimos 30 días) ──────────────────────────
  const { data: history = [] } = useQuery({
    queryKey: ['water_history', userId],
    queryFn:  async () => {
      if (!userId || !isOnline) return [];
      const { data } = await supabase
        .from('water_logs')
        .select('logged_at, hydration_equivalent_ml, drink_type, amount_ml')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(500);
      return data ?? [];
    },
    enabled:   !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sleepRowsForCorrelation = [] } = useQuery({
    queryKey: ['water_sleep_correlation', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const { data } = await supabase
        .from('sleep_logs')
        .select('end_time, quality_score')
        .eq('user_id', userId)
        .gte('end_time', from.toISOString())
        .order('end_time', { ascending: true });
      return data ?? [];
    },
    enabled: !!userId && isOnline,
    staleTime: 10 * 60 * 1000,
  });

  // Agrupar historial por día para el gráfico
  const weeklyData = groupByDay(history, 7);
  const monthData = groupByDay(history, 30);
  const hydrationStreak = computeHydrationStreak(monthData, baseGoal);
  const hydrationSleepCorrelation = computeHydrationSleepCorrelation(
    history as Array<{ logged_at: string; hydration_equivalent_ml: number }>,
    sleepRowsForCorrelation as Array<{ end_time: string; quality_score: number }>,
  );
  const beverageComposition = computeBeverageComposition(
    history as Array<{ drink_type: string; amount_ml: number; hydration_equivalent_ml: number; logged_at: string }>,
  );

  const morningContext = (() => {
    if (logs.length > 0) return null;

    const hour = new Date().getHours();
    if (hour > 11) return null;

    const lastLog = history
      .slice()
      .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())[0];

    if (!lastLog) {
      return 'Arranca con agua ahora: hidratarte temprano mejora energia y foco para todo el dia.';
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

  useEffect(() => {
    // Start background sync service (idempotent)
    try { initSyncService(); } catch (_) { /* ignore */ }
  }, []);

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
    hydrationSleepCorrelation,
    beverageComposition,
    weeklyData,
    history,
    isLoading,
    isLogging,
    isDeleting,
    addWaterLog: (amount_ml: number, drink_type: DrinkTypeId = 'water') =>
      logWater({ amountMl: amount_ml, drinkType: drink_type }),
    getDailyTotal: () => totalHydro,
    getWeeklyHistory: () => weeklyData,
    logWater:   (amountMl: number, drinkType?: DrinkTypeId) => logWater({ amountMl, drinkType }),
    deleteLog,
    refetch,
  };
}

// ─── Helper: agrupar por día ──────────────────────────────
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
