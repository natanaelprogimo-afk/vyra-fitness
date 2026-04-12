import { useWorkoutStore } from '@/stores/workoutStore';

export function useWorkoutRoutines() {
  const routines = useWorkoutStore((state) => state.routines);
  const routineTemplates = useWorkoutStore((state) => state.routineTemplates);
  const createRoutine = useWorkoutStore((state) => state.createRoutine);
  const updateRoutine = useWorkoutStore((state) => state.updateRoutine);
  const cloneTemplateAsRoutine = useWorkoutStore((state) => state.cloneTemplateAsRoutine);

  return {
    routines,
    routineTemplates,
    createRoutine,
    updateRoutine,
    cloneTemplateAsRoutine,
  };
}

export default useWorkoutRoutines;
