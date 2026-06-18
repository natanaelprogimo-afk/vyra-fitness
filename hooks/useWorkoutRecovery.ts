import { useMemo } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuthStore } from '@/stores/authStore';

export function useWorkoutRecovery() {
  const workoutCycleKey = useAuthStore((state) =>
    [
      state.profile?.female_health_enabled ? '1' : '0',
      state.profile?.female_last_period_date ?? '',
      state.profile?.female_cycle_length ?? '',
      state.profile?.gender ?? '',
    ].join('|'),
  );
  const history = useWorkoutStore((state) => state.history);
  const getFatigueRisk = useWorkoutStore((state) => state.getFatigueRisk);
  const getMuscleRecovery = useWorkoutStore((state) => state.getMuscleRecovery);
  const getRecommendedRoutine = useWorkoutStore((state) => state.getRecommendedRoutine);

  const fatigueRisk = useMemo(() => getFatigueRisk(), [getFatigueRisk, history, workoutCycleKey]);
  const muscleRecovery = useMemo(() => getMuscleRecovery(), [getMuscleRecovery, history]);
  const recommendedRoutine = useMemo(
    () => getRecommendedRoutine(),
    [getRecommendedRoutine, history, workoutCycleKey],
  );

  return {
    fatigueRisk,
    muscleRecovery,
    recommendedRoutine,
    getFatigueRisk,
    getMuscleRecovery,
    getRecommendedRoutine,
  };
}

export default useWorkoutRecovery;
