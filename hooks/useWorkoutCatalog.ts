import { useMemo } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';

export function useWorkoutCatalog() {
  const exercises = useWorkoutStore((state) => state.exercises);
  const favoriteExerciseIds = useWorkoutStore((state) => state.favoriteExerciseIds);
  const createExercise = useWorkoutStore((state) => state.createExercise);
  const toggleFavoriteExercise = useWorkoutStore((state) => state.toggleFavoriteExercise);

  const favorites = useMemo(
    () => exercises.filter((exercise) => favoriteExerciseIds.includes(exercise.id)),
    [exercises, favoriteExerciseIds],
  );

  return {
    exercises,
    favoriteExerciseIds,
    favorites,
    createExercise,
    toggleFavoriteExercise,
  };
}

export default useWorkoutCatalog;
