import { useMemo } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';

export function useWorkoutAnalytics() {
  const history = useWorkoutStore((state) => state.history);
  const getWeeklyStats = useWorkoutStore((state) => state.getWeeklyStats);
  const getConsistencyStats = useWorkoutStore((state) => state.getConsistencyStats);
  const getMonthlyProgress = useWorkoutStore((state) => state.getMonthlyProgress);
  const getPersonalRecord = useWorkoutStore((state) => state.getPersonalRecord);

  const weeklyStats = useMemo(() => getWeeklyStats(), [getWeeklyStats, history]);
  const consistency = useMemo(() => getConsistencyStats(), [getConsistencyStats, history]);
  const monthlyProgress = useMemo(() => getMonthlyProgress(), [getMonthlyProgress, history]);

  return {
    history,
    weeklyStats,
    consistency,
    monthlyProgress,
    getWeeklyStats,
    getConsistencyStats,
    getMonthlyProgress,
    getPersonalRecord,
  };
}

export default useWorkoutAnalytics;
