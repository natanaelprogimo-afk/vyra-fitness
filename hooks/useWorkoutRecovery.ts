import { useMemo } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';

export function useWorkoutRecovery() {
  const history = useWorkoutStore((state) => state.history);
  const getFatigueRisk = useWorkoutStore((state) => state.getFatigueRisk);
  const getMuscleRecovery = useWorkoutStore((state) => state.getMuscleRecovery);
  const getRecommendedRoutine = useWorkoutStore((state) => state.getRecommendedRoutine);

  const fatigueRisk = useMemo(() => getFatigueRisk(), [getFatigueRisk, history]);
  const muscleRecovery = useMemo(() => getMuscleRecovery(), [getMuscleRecovery, history]);
  const recommendedRoutine = useMemo(() => getRecommendedRoutine(), [getRecommendedRoutine, history]);

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
