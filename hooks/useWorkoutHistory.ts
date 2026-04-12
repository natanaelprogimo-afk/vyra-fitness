import { useWorkoutStore } from '@/stores/workoutStore';

export function useWorkoutHistory() {
  const history = useWorkoutStore((state) => state.history);
  const summary = useWorkoutStore((state) => state.summary);
  const getSessionDetail = useWorkoutStore((state) => state.getSessionDetail);
  const updateSessionNotes = useWorkoutStore((state) => state.updateSessionNotes);
  const deleteSessionRecord = useWorkoutStore((state) => state.deleteSessionRecord);
  const clearSummary = useWorkoutStore((state) => state.clearSummary);

  return {
    history,
    summary,
    getSessionDetail,
    updateSessionNotes,
    deleteSessionRecord,
    clearSummary,
  };
}

export default useWorkoutHistory;
