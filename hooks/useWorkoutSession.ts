import { useWorkoutStore, useWorkoutActiveSession } from '@/stores/workoutStore';

export function useWorkoutSession() {
  const activeSession = useWorkoutActiveSession();
  const startSession = useWorkoutStore((state) => state.startSession);
  const addSet = useWorkoutStore((state) => state.addSet);
  const finishSession = useWorkoutStore((state) => state.finishSession);
  const cancelSession = useWorkoutStore((state) => state.cancelSession);
  const setCurrentExerciseIndex = useWorkoutStore((state) => state.setCurrentExerciseIndex);
  const goToNextExercise = useWorkoutStore((state) => state.goToNextExercise);
  const goToPreviousExercise = useWorkoutStore((state) => state.goToPreviousExercise);

  return {
    activeSession,
    startSession,
    addSet,
    finishSession,
    cancelSession,
    setCurrentExerciseIndex,
    goToNextExercise,
    goToPreviousExercise,
  };
}

export default useWorkoutSession;
