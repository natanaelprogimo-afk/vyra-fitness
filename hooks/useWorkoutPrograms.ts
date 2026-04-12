import { useMemo } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';

export function useWorkoutPrograms() {
  const programs = useWorkoutStore((state) => state.programs);
  const setActiveProgram = useWorkoutStore((state) => state.setActiveProgram);
  const getActiveProgram = useWorkoutStore((state) => state.getActiveProgram);
  const getProgramPhase = useWorkoutStore((state) => state.getProgramPhase);

  const activeProgram = useMemo(() => getActiveProgram(), [getActiveProgram, programs]);
  const programPhase = useMemo(() => getProgramPhase(), [getProgramPhase, programs, activeProgram]);

  return {
    programs,
    activeProgram,
    programPhase,
    setActiveProgram,
    getActiveProgram,
    getProgramPhase,
  };
}

export default useWorkoutPrograms;
