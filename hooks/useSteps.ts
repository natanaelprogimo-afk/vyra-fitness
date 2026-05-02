// ============================================================
// VYRA FITNESS - useSteps Hook
// Native pedometer + Health Connect + local background snapshot.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';
import { trackLogCreated } from '@/lib/analytics';
import { todayISO, daysAgoISO } from '@/utils/dates';
import {
  calculateStepsCalories,
  calculateStepsDistance,
  metersToKm,
} from '@/utils/calculations';
import {
  readTodayStepsFromHealthConnect,
  type HealthConnectStepsStatus,
} from '@/lib/health-connect-steps';
import { readStepsBackgroundSnapshot } from '@/lib/steps-background-sync';

const STEP_MILESTONES = [
  { steps: 5000, label: '5.000 pasos' },
  { steps: 10000, label: '10.000 pasos' },
  { steps: 15000, label: '15.000 pasos' },
  { steps: 20000, label: '20.000 pasos' },
];

type ActivityZone = {
  key: 'sedentary' | 'active' | 'very_active';
  label: string;
  range: string;
  color: string;
};

type StepLogRow = {
  steps?: number | null;
  active_minutes?: number | null;
  logged_date?: string | null;
};

type WeeklyStepRow = {
  logged_date: string;
  steps: number;
  distance_m: number | null;
  calories: number | null;
};

function getActivityZone(totalSteps: number): ActivityZone {
  if (totalSteps < 4000) {
    return { key: 'sedentary', label: 'Sedentario', range: '0-3.999', color: '#EF4444' };
  }
  if (totalSteps < 8000) {
    return { key: 'active', label: 'Activo', range: '4.000-7.999', color: '#F59E0B' };
  }
  return { key: 'very_active', label: 'Muy activo', range: '8.000+', color: '#10B981' };
}

export function useSteps() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((state) => state.profile);
  const showToast = useUIStore((state) => state.showToast);
  const isOnline = useUIStore((state) => state.isOnline);
  const userId = profile?.id ?? '';
  const goal = profile?.step_goal ?? 10000;
  const weight = profile?.weight_start_kg ?? 70;
  const height = profile?.height_cm ?? 170;

  const [isAvailable, setIsAvailable] = useState(false);
  const [liveSteps, setLiveSteps] = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [healthConnectSteps, setHealthConnectSteps] = useState(0);
  const [healthConnectStatus, setHealthConnectStatus] = useState<HealthConnectStepsStatus>(
    Platform.OS === 'android' ? 'unavailable' : 'unsupported',
  );
  const [healthConnectOrigins, setHealthConnectOrigins] = useState<string[]>([]);
  const [backgroundSnapshotSteps, setBackgroundSnapshotSteps] = useState(0);

  const milestoneHitRef = useRef<Set<number>>(new Set());
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const activeLiveRef = useRef(0);
  const passiveLiveRef = useRef(0);
  const lastTickMsRef = useRef<number | null>(null);
  const lastReportedStepsRef = useRef(0);
  const cadenceRef = useRef(0);

  const refreshExternalSources = useCallback(async (promptForPermissions = false) => {
    if (!userId) {
      setHealthConnectSteps(0);
      setBackgroundSnapshotSteps(0);
      setHealthConnectOrigins([]);
      setHealthConnectStatus(Platform.OS === 'android' ? 'unavailable' : 'unsupported');
      return null;
    }

    const snapshot = await readStepsBackgroundSnapshot(userId).catch((e) => {
      console.debug?.('[useSteps] readStepsBackgroundSnapshot failed', e);
      return null;
    });
    setBackgroundSnapshotSteps(snapshot?.steps ?? 0);

    if (Platform.OS !== 'android') {
      setHealthConnectSteps(0);
      setHealthConnectOrigins([]);
      setHealthConnectStatus('unsupported');
      return null;
    }

    const result = await readTodayStepsFromHealthConnect({
      promptForPermissions,
    });
    setHealthConnectSteps(result.steps);
    setHealthConnectOrigins(result.dataOrigins);
    setHealthConnectStatus(result.status);
    return result;
  }, [userId]);

  const { data: todayLog, isLoading, refetch } = useQuery<StepLogRow | null>({
    queryKey: ['step_logs', userId, todayISO()],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('step_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('logged_date', todayISO())
        .single();

      if (error) {
        const message = String((error as { message?: unknown }).message ?? '');
        if (message.toLowerCase().includes('no rows')) {
          return null;
        }
        throw error;
      }

      return (data ?? null) as StepLogRow | null;
    },
    enabled: !!userId && isOnline,
    staleTime: 60 * 1000,
  });

  const savedSteps = todayLog?.steps ?? 0;
  const savedActiveSteps = Math.min(savedSteps, Math.max(0, (todayLog?.active_minutes ?? 0) * 100));
  const savedPassiveSteps = Math.max(0, savedSteps - savedActiveSteps);
  const sensorTotalSteps = savedSteps + liveSteps;
  const externalBaselineSteps = Math.max(healthConnectSteps, backgroundSnapshotSteps);
  const totalSteps = Math.max(sensorTotalSteps, externalBaselineSteps);
  const knownLiveSplit = activeLiveRef.current + passiveLiveRef.current;
  const unknownLive = Math.max(0, liveSteps - knownLiveSplit);
  const externalOnlySteps = Math.max(0, totalSteps - sensorTotalSteps);
  const activeSteps = savedActiveSteps + activeLiveRef.current;
  const passiveSteps = savedPassiveSteps + passiveLiveRef.current + unknownLive + externalOnlySteps;
  const activityZone = getActivityZone(totalSteps);
  const activeRatio = totalSteps > 0 ? Math.round((activeSteps / totalSteps) * 100) : 0;
  const progressPct = Math.min(100, (totalSteps / goal) * 100);
  const distanceKm = metersToKm(calculateStepsDistance(totalSteps, height));
  const calories = calculateStepsCalories(totalSteps, weight);
  const remaining = Math.max(0, goal - totalSteps);

  const checkMilestones = useCallback((total: number) => {
    for (const milestone of STEP_MILESTONES) {
      if (!milestoneHitRef.current.has(milestone.steps) && total >= milestone.steps) {
        milestoneHitRef.current.add(milestone.steps);
        if (userId && isOnline) {
          showToast(`${milestone.label} alcanzados`, 'success');
        }
      }
    }
  }, [isOnline, showToast, userId]);

  const saveSteps = useCallback(async (total: number) => {
    if (!userId || total === 0) return;

    const finalTotal = Math.max(total, externalBaselineSteps);

    try {
      const activeTotal = Math.min(finalTotal, savedActiveSteps + activeLiveRef.current);
      const activeMinutes = Math.round(activeTotal / 100);
      await supabase.from('step_logs').upsert({
        user_id: userId,
        steps: finalTotal,
        distance_m: calculateStepsDistance(finalTotal, height),
        calories: calculateStepsCalories(finalTotal, weight),
        active_minutes: activeMinutes,
        source: healthConnectSteps >= finalTotal ? 'health_connect' : 'sensor',
        logged_date: todayISO(),
      }, { onConflict: 'user_id,logged_date' });

      await queryClient.invalidateQueries({ queryKey: ['step_logs'] });
      await queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      if (isOnline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), { action: 'saveSteps' });
    }
  }, [
    externalBaselineSteps,
    healthConnectSteps,
    height,
    isOnline,
    queryClient,
    savedActiveSteps,
    userId,
    weight,
  ]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await refreshExternalSources(false);

      const available = await Pedometer.isAvailableAsync().catch((e) => {
        console.debug?.('[useSteps] Pedometer.isAvailableAsync failed', e);
        return false;
      });
      if (!mounted) return;
      setIsAvailable(available);

      activeLiveRef.current = 0;
      passiveLiveRef.current = 0;
      lastTickMsRef.current = null;
      lastReportedStepsRef.current = 0;
      cadenceRef.current = 0;

      if (!available) {
        setSessionStart(null);
        return;
      }

      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);

      try {
        const past = await Pedometer.getStepCountAsync(dayStart, new Date());
        const nativeTotal = Math.max(0, past?.steps ?? 0);
        if (nativeTotal > savedSteps && mounted) {
          setLiveSteps(nativeTotal - savedSteps);
        }
      } catch (e) {
        console.debug?.('[useSteps] Pedometer.getStepCountAsync failed', e);
      }

      setSessionStart(new Date());
      subscriptionRef.current = Pedometer.watchStepCount((result) => {
        const reported = Math.max(0, result.steps ?? 0);
        const delta = reported >= lastReportedStepsRef.current
          ? reported - lastReportedStepsRef.current
          : reported;
        lastReportedStepsRef.current = reported;
        if (delta <= 0) return;

        const now = Date.now();
        const previousTick = lastTickMsRef.current;
        const deltaMin = previousTick ? Math.max((now - previousTick) / 60000, 1 / 60) : 1;
        lastTickMsRef.current = now;
        const cadence = delta / deltaMin;
        cadenceRef.current = cadence;

        if (cadence >= 80) activeLiveRef.current += delta;
        else passiveLiveRef.current += delta;

        setLiveSteps((previous) => {
          const next = previous + delta;
          checkMilestones(Math.max(savedSteps + next, externalBaselineSteps));
          return next;
        });
      });
    };

    void init();
    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, [checkMilestones, externalBaselineSteps, refreshExternalSources, savedSteps]);

  useEffect(() => {
    activeLiveRef.current = 0;
    passiveLiveRef.current = 0;
    lastTickMsRef.current = null;
    lastReportedStepsRef.current = 0;
    cadenceRef.current = 0;
  }, [userId, todayLog?.logged_date]);

  useEffect(() => {
    if (!userId) return;

    const sub = AppState.addEventListener('change', async (state: AppStateStatus) => {
      if (state === 'background') {
        const totalToSave = Math.max(savedSteps + liveSteps, externalBaselineSteps);
        if (totalToSave > 0) {
          await saveSteps(totalToSave);
        }
        return;
      }

      if (state === 'active') {
        await refreshExternalSources(false);
        if (isOnline) {
          await refetch();
        }
      }
    });

    return () => sub.remove();
  }, [externalBaselineSteps, isOnline, liveSteps, refetch, refreshExternalSources, saveSteps, savedSteps, userId]);

  const manualSave = useCallback(async () => {
    const totalToSave = Math.max(savedSteps + liveSteps, externalBaselineSteps);
    if (totalToSave === 0) return;

    await saveSteps(totalToSave);
    setLiveSteps(0);
    activeLiveRef.current = 0;
    passiveLiveRef.current = 0;
    lastTickMsRef.current = null;
    lastReportedStepsRef.current = 0;
    showToast(`Pasos guardados: ${totalToSave.toLocaleString('es')}`, 'success');
    trackLogCreated('steps', healthConnectSteps > sensorTotalSteps ? 'health_connect' : 'sensor', Date.now());
  }, [externalBaselineSteps, healthConnectSteps, liveSteps, saveSteps, savedSteps, sensorTotalSteps, showToast]);

  const { data: weeklyData = [] } = useQuery<WeeklyStepRow[]>({
    queryKey: ['steps_history', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('step_logs')
        .select('logged_date, steps, distance_m, calories')
        .eq('user_id', userId)
        .gte('logged_date', daysAgoISO(6))
        .order('logged_date');

      if (error) throw error;
      return (data ?? []) as WeeklyStepRow[];
    },
    enabled: !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  const weeklyAvg = weeklyData.length
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.steps, 0) / weeklyData.length)
    : 0;
  const bestDaySteps = weeklyData.length ? Math.max(...weeklyData.map((day) => day.steps)) : 0;
  const daysMetGoal = weeklyData.filter((day) => day.steps >= goal).length;

  return {
    isAvailable,
    liveSteps,
    savedSteps,
    totalSteps,
    goal,
    progressPct,
    distanceKm,
    calories,
    remaining,
    activeSteps,
    passiveSteps,
    activeRatio,
    activityZone,
    cadence: cadenceRef.current,
    sessionStart,
    isLoading,
    weeklyData,
    weeklyAvg,
    bestDaySteps,
    daysMetGoal,
    manualSave,
    refetch,
    healthConnectStatus,
    healthConnectSteps,
    healthConnectOrigins,
    backgroundSnapshotSteps,
    refreshHealthConnect: refreshExternalSources,
  };
}
