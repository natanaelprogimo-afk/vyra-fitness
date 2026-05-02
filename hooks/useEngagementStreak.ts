import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { createActiveDateSet } from '@/lib/engagement-streak';
import { captureError } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { daysAgoISO } from '@/utils/dates';

interface DateRow {
  logged_at?: string | null;
  logged_date?: string | null;
  end_time?: string | null;
}

export function useEngagementStreak(days: number = 60) {
  const userId = useAuthStore((state) => state.profile?.id ?? state.user?.id ?? null);
  const workoutHistory = useWorkoutStore((state) => state.history);
  const startDate = daysAgoISO(Math.max(0, days - 1));

  const { data: remoteDates = [], isLoading, refetch } = useQuery<string[]>({
    queryKey: ['engagement_streak_dates', userId, days],
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    queryFn: async () => {
      if (!userId) return [];

      try {
        const startStamp = `${startDate}T00:00:00`;
        const [waterRes, stepsRes, mealsRes, sleepRes] = await Promise.all([
          supabase
            .from('water_logs')
            .select('logged_at')
            .eq('user_id', userId)
            .gte('logged_at', startStamp),
          supabase
            .from('step_logs')
            .select('logged_date, steps')
            .eq('user_id', userId)
            .gte('logged_date', startDate)
            .gt('steps', 0),
          supabase
            .from('meals')
            .select('logged_at')
            .eq('user_id', userId)
            .gte('logged_at', startStamp),
          supabase
            .from('sleep_logs')
            .select('end_time')
            .eq('user_id', userId)
            .gte('end_time', startStamp),
        ]);

        if (waterRes.error) throw waterRes.error;
        if (stepsRes.error) throw stepsRes.error;
        if (mealsRes.error) throw mealsRes.error;
        if (sleepRes.error) throw sleepRes.error;

        return [
          ...createActiveDateSet([
            ((waterRes.data ?? []) as DateRow[]).map((row) => row.logged_at ?? null),
            ((stepsRes.data ?? []) as DateRow[]).map((row) => row.logged_date ?? null),
            ((mealsRes.data ?? []) as DateRow[]).map((row) => row.logged_at ?? null),
            ((sleepRes.data ?? []) as DateRow[]).map((row) => row.end_time ?? null),
          ]),
        ];
      } catch (error) {
        captureError(error instanceof Error ? error : new Error(String(error)), {
          action: 'useEngagementStreak.query',
        });
        return [];
      }
    },
  });

  const workoutDates = useMemo(
    () =>
      workoutHistory
        .filter((entry) => entry.started_at.slice(0, 10) >= startDate)
        .map((entry) => entry.started_at.slice(0, 10)),
    [startDate, workoutHistory],
  );

  const activeDates = useMemo(
    () => createActiveDateSet([remoteDates, workoutDates]),
    [remoteDates, workoutDates],
  );

  return {
    activeDates,
    loading: isLoading,
    refresh: refetch,
  };
}

export default useEngagementStreak;
