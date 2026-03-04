// ============================================================
// VYRA FITNESS — useSteps Hook
// Pedómetro nativo (expo-sensors), pasos en tiempo real,
// historial, cálculo de calorías y distancia
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { addCoins, addXP } from '@/services/supabase/profiles';
import { captureError } from '@/lib/sentry';
import { trackLogCreated } from '@/lib/analytics';
import { todayISO, daysAgoISO } from '@/utils/dates';
import {
  calculateStepsCalories,
  calculateStepsDistance,
  metersToKm,
} from '@/utils/calculations';

const STEP_MILESTONES = [
  { steps: 5000,  coins: 5,  xp: 50,  label: '5.000 pasos'  },
  { steps: 10000, coins: 10, xp: 100, label: '10.000 pasos' },
  { steps: 15000, coins: 15, xp: 150, label: '15.000 pasos' },
  { steps: 20000, coins: 20, xp: 200, label: '20.000 pasos' },
];

export function useSteps() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const isOnline    = useUIStore((s) => s.isOnline);
  const userId      = profile?.id ?? '';
  const goal        = profile?.step_goal ?? 10000;
  const weight      = profile?.weight_start_kg ?? 70;
  const height      = profile?.height_cm ?? 170;

  const [isAvailable,  setIsAvailable]  = useState(false);
  const [liveSteps,    setLiveSteps]    = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const milestoneHitRef = useRef<Set<number>>(new Set());
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  // ─── Datos del día desde Supabase ────────────────────────
  const { data: todayLog, isLoading, refetch } = useQuery({
    queryKey: ['step_logs', userId, todayISO()],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('step_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('logged_date', todayISO())
        .single();
      return data;
    },
    enabled:   !!userId,
    staleTime: 60 * 1000,
  });

  const savedSteps  = todayLog?.steps ?? 0;
  const totalSteps  = savedSteps + liveSteps;
  const progressPct = Math.min(100, (totalSteps / goal) * 100);
  const distanceKm  = metersToKm(calculateStepsDistance(totalSteps, height));
  const calories    = calculateStepsCalories(totalSteps, weight);
  const remaining   = Math.max(0, goal - totalSteps);

  // ─── Check milestones ────────────────────────────────────
  const checkMilestones = useCallback((total: number) => {
    for (const m of STEP_MILESTONES) {
      if (!milestoneHitRef.current.has(m.steps) && total >= m.steps) {
        milestoneHitRef.current.add(m.steps);
        if (userId && isOnline) {
          addCoins(userId, m.coins, 'step_milestone', `${m.label} alcanzados`).catch(() => {});
          addXP(userId, m.xp).catch(() => {});
          showToast(`${m.label} 🚶 +${m.coins} 🪙`, 'coins');
        }
      }
    }
  }, [userId, isOnline, showToast]);

  // ─── Iniciar pedómetro ────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const available = await Pedometer.isAvailableAsync().catch(() => false);
      if (!mounted) return;
      setIsAvailable(available);
      if (!available) return;

      // Pasos acumulados desde las 00:00 (nativo)
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      try {
        const past = await Pedometer.getStepCountAsync(dayStart, new Date());
        const nativeTotal = past?.steps ?? 0;
        if (nativeTotal > savedSteps && mounted) {
          setLiveSteps(nativeTotal - savedSteps);
        }
      } catch {
        // Algunos dispositivos no lo soportan — continuamos con watchStepCount
      }

      setSessionStart(new Date());
      subscriptionRef.current = Pedometer.watchStepCount((result) => {
        setLiveSteps((prev) => {
          const next = prev + result.steps;
          checkMilestones(savedSteps + next);
          return next;
        });
      });
    };

    init();
    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, [savedSteps]);

  // ─── Guardar en background ────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state: AppStateStatus) => {
      if (state === 'background' && liveSteps > 0 && userId) {
        await _saveSteps(savedSteps + liveSteps);
      }
    });
    return () => sub.remove();
  }, [liveSteps, savedSteps, userId]);

  const _saveSteps = async (total: number) => {
    if (!userId || total === 0) return;
    try {
      await supabase.from('step_logs').upsert({
        user_id:        userId,
        steps:          total,
        distance_m:     calculateStepsDistance(total, height),
        calories:       calculateStepsCalories(total, weight),
        active_minutes: Math.round(total / 100),
        source:         'sensor',
        logged_date:    todayISO(),
      }, { onConflict: 'user_id,logged_date' });

      queryClient.invalidateQueries({ queryKey: ['step_logs'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      if (isOnline) void supabase.rpc('calculate_daily_score', { p_user_id: userId });
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'saveSteps'" });
    }
  };

  const manualSave = useCallback(async () => {
    if (liveSteps === 0 && savedSteps === 0) return;
    await _saveSteps(savedSteps + liveSteps);
    setLiveSteps(0);
    showToast(`Pasos guardados: ${(savedSteps + liveSteps).toLocaleString('es')}`, 'success');
    trackLogCreated('steps', 'sensor', Date.now());
  }, [liveSteps, savedSteps]);

  // ─── Historial ────────────────────────────────────────────
  const { data: weeklyData = [] } = useQuery({
    queryKey: ['steps_history', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const { data } = await supabase
        .from('step_logs')
        .select('logged_date, steps, distance_m, calories')
        .eq('user_id', userId)
        .gte('logged_date', daysAgoISO(6))
        .order('logged_date');
      return data ?? [];
    },
    enabled:   !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  const weeklyAvg    = weeklyData.length
    ? Math.round(weeklyData.reduce((s, d) => s + d.steps, 0) / weeklyData.length) : 0;
  const bestDaySteps = weeklyData.length ? Math.max(...weeklyData.map(d => d.steps)) : 0;
  const daysMetGoal  = weeklyData.filter(d => d.steps >= goal).length;

  return {
    isAvailable, liveSteps, savedSteps, totalSteps,
    goal, progressPct, distanceKm, calories, remaining,
    sessionStart, isLoading, weeklyData,
    weeklyAvg, bestDaySteps, daysMetGoal,
    manualSave, refetch,
  };
}
