import { useMemo, useCallback } from 'react';
import { useWorkoutStore, useWorkoutActiveSession } from '@/stores/workoutStore';

export type {
  ActiveSession,
  CreateRoutineInput,
  Exercise,
  MuscleRecoveryEntry,
  RecommendedRoutine,
  Routine,
  RoutineExercise,
  WorkoutConsistencyStats,
  WorkoutFatigueRisk,
  WorkoutHistory,
  WorkoutMonthlyProgress,
  WorkoutProgram,
  WorkoutProgramPhase,
  WorkoutSessionDetail,
  WorkoutSet,
  WorkoutSettings,
  WorkoutSummaryData,
} from '@/lib/workout-types';

export function useWorkout() {
  const exercises = useWorkoutStore((state) => state.exercises);
  const routines = useWorkoutStore((state) => state.routines);
  const routineTemplates = useWorkoutStore((state) => state.routineTemplates);
  const programs = useWorkoutStore((state) => state.programs);
  const history = useWorkoutStore((state) => state.history);
  const personalRecords = useWorkoutStore((state) => state.personalRecords);
  const summary = useWorkoutStore((state) => state.summary);
  const settings = useWorkoutStore((state) => state.settings);
  const favoriteExerciseIds = useWorkoutStore((state) => state.favoriteExerciseIds);
  const loading = useWorkoutStore((state) => state.loading);
  const loadError = useWorkoutStore((state) => state.loadError);
  const saving = useWorkoutStore((state) => state.saving);
  const startSession = useWorkoutStore((state) => state.startSession);
  const rawAddSet = useWorkoutStore((state) => state.addSet);
  type AddSetInput = Parameters<typeof rawAddSet>[0];
  type LegacyAddSetArgs = [exerciseId: string, exerciseName: string | null | undefined, reps: number, weightKg: number];
  const addSet = useCallback(async (...args: [AddSetInput] | LegacyAddSetArgs) => {
    // Backwards-compat: callers sometimes pass positional args (exerciseId, exerciseName, reps, weightKg)
    if (
      args.length === 1 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      'reps' in args[0] &&
      'weightKg' in args[0]
    ) {
      return rawAddSet(args[0]);
    }
    const [exerciseId, , reps, weightKg] = args as LegacyAddSetArgs;
    return rawAddSet({ exerciseId, reps, weightKg });
  }, [rawAddSet]);
  const finishSession = useWorkoutStore((state) => state.finishSession);
  const cancelSession = useWorkoutStore((state) => state.cancelSession);
  const updateSessionNotes = useWorkoutStore((state) => state.updateSessionNotes);
  const updateExerciseNote = useWorkoutStore((state) => state.updateExerciseNote);
  const deleteSessionRecord = useWorkoutStore((state) => state.deleteSessionRecord);
  const createRoutine = useWorkoutStore((state) => state.createRoutine);
  const updateRoutine = useWorkoutStore((state) => state.updateRoutine);
  const createExercise = useWorkoutStore((state) => state.createExercise);
  const cloneTemplateAsRoutine = useWorkoutStore((state) => state.cloneTemplateAsRoutine);
  const toggleFavoriteExercise = useWorkoutStore((state) => state.toggleFavoriteExercise);
  const setActiveProgram = useWorkoutStore((state) => state.setActiveProgram);
  const getActiveProgram = useWorkoutStore((state) => state.getActiveProgram);
  const getProgramPhase = useWorkoutStore((state) => state.getProgramPhase);
  const getPersonalRecord = useWorkoutStore((state) => state.getPersonalRecord);
  const getWeeklyStats = useWorkoutStore((state) => state.getWeeklyStats);
  const getConsistencyStats = useWorkoutStore((state) => state.getConsistencyStats);
  const getMonthlyProgress = useWorkoutStore((state) => state.getMonthlyProgress);
  const getRecommendedRoutine = useWorkoutStore((state) => state.getRecommendedRoutine);
  const getMuscleRecovery = useWorkoutStore((state) => state.getMuscleRecovery);
  const getSessionDetail = useWorkoutStore((state) => state.getSessionDetail);
  const getFatigueRisk = useWorkoutStore((state) => state.getFatigueRisk);
  const updateSettings = useWorkoutStore((state) => state.updateSettings);
  const setCurrentExerciseIndex = useWorkoutStore((state) => state.setCurrentExerciseIndex);
  const startRestTimer = useWorkoutStore((state) => state.startRestTimer);
  const clearRestTimer = useWorkoutStore((state) => state.clearRestTimer);
  const adjustRestTimer = useWorkoutStore((state) => state.adjustRestTimer);
  const goToNextExercise = useWorkoutStore((state) => state.goToNextExercise);
  const goToPreviousExercise = useWorkoutStore((state) => state.goToPreviousExercise);
  const refresh = useWorkoutStore((state) => state.refresh);
  const clearSummary = useWorkoutStore((state) => state.clearSummary);
  const activeSession = useWorkoutActiveSession();

  const fatigueRisk = useMemo(() => getFatigueRisk(), [getFatigueRisk, history]);

  return {
    programs,
    routines,
    routineTemplates,
    exercises,
    history,
    personalRecords,
    summary,
    settings,
    favoriteExerciseIds,
    activeSession,
    loading,
    loadError,
    saving,
    startSession,
    addSet,
    completeSession: finishSession,
    finishSession,
    cancelSession,
    updateSessionNotes,
    updateExerciseNote,
    deleteSessionRecord,
    getActiveProgram,
    getProgramPhase,
    setActiveProgram,
    getExercisePR: getPersonalRecord,
    getPersonalRecord,
    getWeeklyStats,
    getConsistencyStats,
    getMonthlyProgress,
    getRecommendedRoutine,
    getMuscleRecovery,
    createRoutine,
    updateRoutine,
    createExercise,
    cloneTemplateAsRoutine,
    toggleFavoriteExercise,
    updateSettings,
    setCurrentExerciseIndex,
    startRestTimer,
    clearRestTimer,
    adjustRestTimer,
    goToNextExercise,
    goToPreviousExercise,
    getSessionDetail,
    getFatigueRisk,
    fatigueRisk,
    refresh,
    clearSummary,
  };
}

export default useWorkout;


