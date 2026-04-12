import { useWorkoutStore } from '@/stores/workoutStore';

export function useWorkoutSettings() {
  const settings = useWorkoutStore((state) => state.settings);
  const updateSettings = useWorkoutStore((state) => state.updateSettings);

  return {
    settings,
    updateSettings,
  };
}

export default useWorkoutSettings;
