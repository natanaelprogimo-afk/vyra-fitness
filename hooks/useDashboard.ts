// ============================================================
// VYRA FITNESS - useDashboard Hook
// Agrega datos del dia: score, streaks, modulos e insights visibles
// ============================================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { todayISO, daysAgoISO } from '@/utils/dates';

type DailyScoreRow = {
  date?: string | null;
  total_score?: number | null;
  activity_pct?: number | null;
  workout_pct?: number | null;
};

function reconcileWorkoutRow<T extends DailyScoreRow | null>(
  row: T,
  params: { today: string; hasLocalWorkoutToday: boolean },
): T {
  if (!row || !params.hasLocalWorkoutToday) return row;
  const rowDate = typeof row.date === 'string' ? row.date : '';
  const remoteWorkoutPct = Number(row.workout_pct ?? 0);
  if (rowDate !== params.today || remoteWorkoutPct > 0) return row;

  return {
    ...row,
    total_score: Math.min(100, Number(row.total_score ?? 0) + 20),
    activity_pct: Math.max(Number(row.activity_pct ?? 0), 100),
    workout_pct: 100,
  } as T;
}

export function useDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const workoutHistory = useWorkoutStore((state) => state.history);
  const userId = profile?.id;
  const today = todayISO();
  const hasLocalWorkoutToday = useMemo(
    () => workoutHistory.some((entry) => entry.started_at.slice(0, 10) === today),
    [today, workoutHistory],
  );

  const { data: dailyScore, isLoading: scoreLoading } = useQuery({
    queryKey: ['daily_score', userId, today],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();
      return data;
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['today_summary', userId, today],
    queryFn: async () => {
      if (!userId) return null;
      const yesterday = daysAgoISO(1);

      const [waterRes, stepsRes, fastingRes, sleepRes, mentalRes] = await Promise.all([
        supabase.from('water_logs').select('hydration_equivalent_ml').eq('user_id', userId).gte('logged_at', `${today}T00:00:00`),
        supabase.from('step_logs').select('steps, distance_m, calories').eq('user_id', userId).eq('logged_date', today).single(),
        supabase.from('fasting_sessions').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle(),
        supabase.from('sleep_logs').select('duration_min, quality_score').eq('user_id', userId).gte('end_time', `${yesterday}T18:00:00`).lte('end_time', `${today}T18:00:00`).order('end_time', { ascending: false }).limit(1),
        supabase.from('mental_checkins').select('id').eq('user_id', userId).eq('check_date', today).single(),
      ]);

      const totalWater = (waterRes.data ?? []).reduce((sum, r) => sum + (r.hydration_equivalent_ml ?? 0), 0);

      return {
        water: { total: totalWater, goal: profile?.water_goal_ml ?? 2500 },
        steps: stepsRes.data ?? { steps: 0, distance_m: 0, calories: 0 },
        fasting: fastingRes.data ?? null,
        sleep: sleepRes.data?.[0] ?? null,
        mental: mentalRes.data ?? null,
        stepGoal: profile?.step_goal ?? 10000,
      };
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: weekScores } = useQuery({
    queryKey: ['week_scores', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('daily_scores')
        .select('date, total_score, activity_pct, workout_pct')
        .eq('user_id', userId)
        .gte('date', daysAgoISO(6))
        .order('date');
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const resolvedDailyScore = useMemo(
    () => reconcileWorkoutRow(dailyScore as DailyScoreRow | null, { today, hasLocalWorkoutToday }),
    [dailyScore, hasLocalWorkoutToday, today],
  );
  const resolvedWeekScores = useMemo(
    () =>
      (weekScores ?? []).map((row) =>
        reconcileWorkoutRow(row as DailyScoreRow, { today, hasLocalWorkoutToday }),
      ),
    [hasLocalWorkoutToday, today, weekScores],
  );
  const mentalDoneToday = !!todayData?.mental;
  const recentScores = resolvedWeekScores.slice(-3);

  return {
    profile,
    dailyScore: resolvedDailyScore,
    todayData,
    weekScores: resolvedWeekScores,
    recentScores,
    mentalDoneToday,
    isLoading: scoreLoading || todayLoading,
  };
}
