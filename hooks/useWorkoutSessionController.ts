import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Exercise, WorkoutPersonalRecord } from '@/lib/workout-types';
import { useWorkout } from '@/hooks/useWorkout';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getProfileContextMemory } from '@/lib/profile-context';
import { triggerImpactHaptic } from '@/lib/haptics';
import {
  cancelWorkoutRestCompleteNotification,
  scheduleWorkoutRestCompleteNotification,
} from '@/lib/notifications';

export type DraftRow = {
  reps: string;
  weight: string;
};

// Helper functions
export function formatDaysAgo(iso: string) {
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'hace 1 día';
  return `hace ${diff} días`;
}

export function formatRestClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatWeightValue(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--';
  return value % 1 === 0 ? `${value.toFixed(0)}kg` : `${value.toFixed(1)}kg`;
}

export function formatPreviousSet(weight: number | null | undefined, reps: number | null | undefined) {
  if (typeof reps !== 'number' || !Number.isFinite(reps)) return '--';
  return `${formatWeightValue(weight)} x ${Math.round(reps)}`;
}

export function parseDraftValue(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function getSetTypeGuidance(setType?: string | null) {
  const normalized = (setType ?? '').trim().toLowerCase();
  if (!normalized || normalized === 'normal' || normalized === 'work') return null;
  if (normalized.includes('superserie')) {
    return 'Bloque encadenado: termina este ejercicio y pasa rápido al siguiente del mismo bloque.';
  }
  if (normalized.includes('drop')) {
    return 'Drop set: al cerrar la serie baja carga y sigue sin descansar demasiado.';
  }
  if (normalized.includes('amrap')) {
    return 'AMRAP: busca reps limpias hasta donde la técnica siga sólida.';
  }
  if (normalized.includes('emom')) {
    return 'EMOM: sostén el ritmo de trabajo por minuto sin irte al fallo temprano.';
  }
  if (normalized.includes('tiempo')) {
    return 'Trabajo por tiempo: piensa más en ritmo y control que en perseguir un número exacto.';
  }
  return null;
}

export function buildInitialDraftRows(
  targetSets: number,
  targetReps: number,
  weightSuggestion: number | null | undefined,
  previousSets: Array<{ reps: number; weight_kg: number }>,
  currentSets: Array<{ reps: number; weight_kg: number }>,
): DraftRow[] {
  return Array.from({ length: targetSets }, (_, index) => {
    const current = currentSets[index] ?? null;
    const previous = previousSets[index] ?? null;
    const draftWeight =
      current?.weight_kg ??
      previous?.weight_kg ??
      (typeof weightSuggestion === 'number' ? weightSuggestion : 0);
    const draftReps = current?.reps ?? previous?.reps ?? targetReps;

    return {
      weight: draftWeight > 0 ? draftWeight.toFixed(draftWeight % 1 === 0 ? 0 : 1) : '0',
      reps: String(Math.max(1, draftReps)),
    };
  });
}

interface UseWorkoutSessionControllerReturn {
  // State
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  prBanner: string | null;
  setPrBanner: (value: string | null) => void;
  elapsedSeconds: number;
  draftRows: DraftRow[];
  setDraftRows: (updater: (current: DraftRow[]) => DraftRow[]) => void;
  noteDraft: string;
  setNoteDraft: (value: string) => void;
  confirmAction: 'cancel' | 'finish' | null;
  setConfirmAction: (value: 'cancel' | 'finish' | null) => void;
  actionBusy: 'cancel' | 'finish' | null;
  setActionBusy: (value: 'cancel' | 'finish' | null) => void;
  bottomCardHeight: number;
  setBottomCardHeight: (value: number) => void;

  // Handlers
  handleCancel: () => void;
  handleFinish: () => void;
  handleUpdateDraft: (index: number, field: keyof DraftRow, value: string) => void;
  adjustDraftRow: (index: number, field: keyof DraftRow, delta: number) => void;
  saveNote: () => void;
  handleCompleteSet: (index: number) => Promise<void>;
  executeCancel: () => Promise<void>;
  executeFinish: () => Promise<void>;

  // Computations
  equipmentType: string | null;
  previousSets: Array<{ reps: number; weight_kg: number }>;
  previousSessionLabel: string;
  currentRecord: WorkoutPersonalRecord | null;
  currentExerciseMeta: Exercise | null;
  recentExerciseIds: string[];
  activeExerciseIds: string[];
  supersetTransition: string | null;
  currentSetTypeGuidance: string | null;
  progressWidth: string;
  restDurationSeconds: number;
  restRemaining: number;
  targetSets: number;
  targetReps: number;
  activeSetIndex: number;
  currentSetsKey: string;
  currentNote: string;
}

export function useWorkoutSessionController(): UseWorkoutSessionControllerReturn {
  const profile = useAuthStore((state) => state.profile);
  const showToast = useUIStore((state) => state.showToast);
  const {
    activeSession,
    exercises,
    history,
    addSet,
    clearRestTimer,
    finishSession,
    cancelSession,
    getPersonalRecord,
    getSessionDetail,
    setCurrentExerciseIndex,
    settings,
    updateExerciseNote,
  } = useWorkout();

  const contextMemory = getProfileContextMemory(profile);
  const equipmentType =
    typeof contextMemory.equipment_type === 'string' ? contextMemory.equipment_type : null;

  // State
  const [fullscreen, setFullscreen] = useState(false);
  const [prBanner, setPrBanner] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [draftRows, setDraftRows] = useState<DraftRow[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'finish' | null>(null);
  const [actionBusy, setActionBusy] = useState<'cancel' | 'finish' | null>(null);
  const [bottomCardHeight, setBottomCardHeight] = useState(0);

  // Effects: elapsed time
  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  // Computed values
  const exerciseIndex = activeSession?.currentExerciseIndex ?? 0;
  const currentExercise = activeSession?.exercises[exerciseIndex] ?? null;
  const currentSets =
    activeSession?.sets.filter((set) => set.exercise_id === currentExercise?.exercise_id) ?? [];
  const nextExercise = activeSession?.exercises[exerciseIndex + 1] ?? null;
  const targetSets = currentExercise?.sets_target ?? 3;
  const targetReps = currentExercise?.reps_target ?? 8;
  const activeSetIndex = Math.min(currentSets.length, Math.max(0, targetSets - 1));
  const currentSetsKey = currentSets
    .map((set) => `${set.set_number}:${set.reps}:${set.weight_kg}`)
    .join('|');
  const currentNote =
    currentExercise && activeSession?.exerciseNotes
      ? activeSession.exerciseNotes[currentExercise.exercise_id] ?? ''
      : '';

  const restDurationSeconds =
    typeof activeSession?.timerDurationSec === 'number' &&
    Number.isFinite(activeSession.timerDurationSec)
      ? Math.max(5, Math.round(activeSession.timerDurationSec))
      : settings.defaultRestSeconds;

  const restRemaining =
    activeSession?.timerStart && restDurationSeconds > 0
      ? Math.max(
          0,
          Math.ceil(
            (new Date(activeSession.timerStart).getTime() +
              restDurationSeconds * 1000 -
              Date.now()) /
              1000,
          ),
        )
      : 0;

  // Effects: clear timer when rest expires
  useEffect(() => {
    if (activeSession?.timerStart && restRemaining <= 0) {
      clearRestTimer();
    }
  }, [activeSession?.timerStart, clearRestTimer, restRemaining]);

  // Effects: schedule notification
  useEffect(() => {
    if (!activeSession?.timerStart || restRemaining <= 0) {
      void cancelWorkoutRestCompleteNotification();
      return;
    }

    const triggerDate = new Date(
      new Date(activeSession.timerStart).getTime() + restDurationSeconds * 1000,
    );
    void scheduleWorkoutRestCompleteNotification(triggerDate, {
      exerciseName: currentExercise?.exercise_name ?? null,
      nextExerciseName: nextExercise?.exercise_name ?? null,
    });
  }, [
    activeSession?.timerStart,
    currentExercise?.exercise_name,
    nextExercise?.exercise_name,
    restDurationSeconds,
    restRemaining,
  ]);

  // Memoized computations: previous session data
  const previousSets = useMemo(() => {
    if (!currentExercise) return [];

    for (const session of history) {
      const detail = getSessionDetail(session.id);
      const sets =
        detail?.sets
          .filter((set) => set.exercise_id === currentExercise.exercise_id)
          .sort((left, right) => left.set_number - right.set_number) ?? [];
      if (sets.length) return sets;
    }

    return [];
  }, [currentExercise, getSessionDetail, history]);

  const previousSessionLabel = useMemo(() => {
    if (!currentExercise) return 'Primera vez con este ejercicio';

    for (const session of history) {
      const detail = getSessionDetail(session.id);
      const sets = detail?.sets.filter((set) => set.exercise_id === currentExercise.exercise_id) ?? [];
      if (!sets.length) continue;
      const latestSet = sets[sets.length - 1] ?? null;
      return `Última vez: ${sets.length} series · ${formatPreviousSet(latestSet?.weight_kg, latestSet?.reps)} · ${formatDaysAgo(session.started_at)}`;
    }

    return 'Primera vez con este ejercicio';
  }, [currentExercise, getSessionDetail, history]);

  // Effects: initialize draft rows
  useEffect(() => {
    if (!currentExercise) return;
    setDraftRows(
      buildInitialDraftRows(
        targetSets,
        targetReps,
        currentExercise.weight_suggestion_kg,
        previousSets,
        currentSets,
      ),
    );
  }, [
    currentExercise?.exercise_id,
    currentExercise?.weight_suggestion_kg,
    currentSetsKey,
    previousSets,
    targetReps,
    targetSets,
  ]);

  // Effects: update note draft
  useEffect(() => {
    setNoteDraft(currentNote);
  }, [currentNote]);

  // Memoized: record and meta
  const currentRecord = useMemo(
    () => (currentExercise ? getPersonalRecord(currentExercise.exercise_id) : null),
    [currentExercise, getPersonalRecord],
  );

  const currentExerciseMeta = useMemo(
    () => exercises.find((item) => item.id === currentExercise?.exercise_id) ?? null,
    [currentExercise?.exercise_id, exercises],
  );

  // Memoized: recent and active exercise IDs
  const recentExerciseIds = useMemo(() => {
    const ids: string[] = [];
    for (const session of history) {
      const detail = getSessionDetail(session.id);
      for (const set of detail?.sets ?? []) {
        if (ids.includes(set.exercise_id)) continue;
        ids.push(set.exercise_id);
        if (ids.length >= 12) return ids;
      }
    }
    return ids;
  }, [getSessionDetail, history]);

  const activeExerciseIds = useMemo(
    () => activeSession?.exercises.map((exercise) => exercise.exercise_id) ?? [],
    [activeSession?.exercises],
  );

  // Memoized: superset transition
  const supersetTransition = useMemo(() => {
    if (!currentExercise || !nextExercise) return null;
    const currentGroup = currentExercise.group_label?.trim().toLowerCase();
    const nextGroup = nextExercise.group_label?.trim().toLowerCase();
    const setType = (currentExercise.set_type ?? '').trim().toLowerCase();
    if (!setType.includes('superserie') || !currentGroup || currentGroup !== nextGroup) return null;
    return `${currentExercise.group_label}: ${currentExercise.exercise_name} → ${nextExercise.exercise_name}`;
  }, [currentExercise, nextExercise]);

  // Memoized: set type guidance
  const currentSetTypeGuidance: string | null = useMemo(
    () => getSetTypeGuidance(currentExercise?.set_type) ?? null,
    [currentExercise?.set_type],
  );

  // Progress calculation
  const progressWidth: string = activeSession
    ? `${(
        ((exerciseIndex +
          Math.min(1, currentSets.length / Math.max(1, targetSets))) /
          Math.max(1, activeSession.exercises.length)) *
        100
      ).toFixed(1)}%`
    : '0%';

  // Handlers
  const handleCancel = useCallback(() => {
    setConfirmAction('cancel');
  }, []);

  const handleFinish = useCallback(() => {
    setConfirmAction('finish');
  }, []);

  const handleUpdateDraft = (index: number, field: keyof DraftRow, value: string) => {
    setDraftRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]:
                field === 'reps'
                  ? value.replace(/[^\d]/g, '')
                  : value.replace(/[^0-9.,]/g, ''),
            }
          : row,
      ),
    );
  };

  const adjustDraftRow = (index: number, field: keyof DraftRow, delta: number) => {
    setDraftRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const parsed = parseDraftValue(row[field]);
        const currentValue = Number.isFinite(parsed) ? parsed : 0;
        const nextValue = Math.max(0, currentValue + delta);

        if (field === 'reps') {
          return {
            ...row,
            reps: String(Math.max(0, Math.round(nextValue))),
          };
        }

        const rounded = Math.round(nextValue * 10) / 10;
        return {
          ...row,
          weight: rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1),
        };
      }),
    );
  };

  const saveNote = () => {
    if (!currentExercise) return;
    updateExerciseNote(currentExercise.exercise_id, noteDraft);
    setNoteDraft('');
  };

  const handleCompleteSet = async (index: number) => {
    if (!currentExercise || index !== currentSets.length) return;
    const row = draftRows[index] ?? null;
    if (!row) return;

    const reps = Math.round(parseDraftValue(row.reps));
    const weight = parseDraftValue(row.weight);
    if (!Number.isFinite(reps) || reps <= 0 || !Number.isFinite(weight) || weight < 0) return;

    const nextRestSeconds = currentExercise.rest_seconds ?? settings.defaultRestSeconds;
    const result = await addSet({
      exerciseId: currentExercise.exercise_id,
      reps,
      weightKg: weight,
      restSec: nextRestSeconds,
      notes: currentNote || null,
      setType: currentExercise.set_type ?? 'work',
    });

    await triggerImpactHaptic('medium');

    const normalizedSetType = (currentExercise.set_type ?? '').trim().toLowerCase();
    const isDropSet = normalizedSetType.includes('drop');
    const isSuperset = normalizedSetType.includes('superserie');
    const sameSupersetBlock =
      Boolean(currentExercise.group_label?.trim()) &&
      currentExercise.group_label?.trim().toLowerCase() ===
        nextExercise?.group_label?.trim().toLowerCase();

    if (isDropSet && index + 1 < targetSets) {
      const suggestedWeight = Math.max(0, Math.round(Math.max(0, weight * 0.85) * 10) / 10);
      setDraftRows((current) =>
        current.map((draft, draftIndex) =>
          draftIndex === index + 1
            ? {
                ...draft,
                weight:
                  suggestedWeight % 1 === 0
                    ? suggestedWeight.toFixed(0)
                    : suggestedWeight.toFixed(1),
              }
            : draft,
        ),
      );
      showToast('Drop set listo: dejamos la siguiente serie con carga reducida.', 'success');
    }

    if (result.isPr) {
      const bannerText = `Nuevo PR en ${currentExercise.exercise_name}`;
      setPrBanner(bannerText);
      setTimeout(() => {
        setPrBanner((current) => (current === bannerText ? null : current));
      }, 2600);
    }

    const completedExercise = index + 1 >= targetSets;
    if (completedExercise && exerciseIndex < (activeSession?.exercises.length ?? 1) - 1) {
      if (isSuperset && sameSupersetBlock && nextExercise) {
        clearRestTimer();
        showToast(`Superserie activa: sigue con ${nextExercise.exercise_name}.`, 'success');
      }
      setCurrentExerciseIndex(exerciseIndex + 1);
    }
  };

  const executeCancel = useCallback(async () => {
    setActionBusy('cancel');
    try {
      await cancelSession();
      setConfirmAction(null);
    } finally {
      setActionBusy(null);
    }
  }, [cancelSession]);

  const executeFinish = useCallback(async () => {
    setActionBusy('finish');
    try {
      await finishSession();
      setConfirmAction(null);
    } finally {
      setActionBusy(null);
    }
  }, [finishSession]);

  return {
    // State
    fullscreen,
    setFullscreen,
    prBanner,
    setPrBanner,
    elapsedSeconds,
    draftRows,
    setDraftRows,
    noteDraft,
    setNoteDraft,
    confirmAction,
    setConfirmAction,
    actionBusy,
    setActionBusy,
    bottomCardHeight,
    setBottomCardHeight,

    // Handlers
    handleCancel,
    handleFinish,
    handleUpdateDraft,
    adjustDraftRow,
    saveNote,
    handleCompleteSet,
    executeCancel,
    executeFinish,

    // Computations
    equipmentType,
    previousSets,
    previousSessionLabel,
    currentRecord,
    currentExerciseMeta,
    recentExerciseIds,
    activeExerciseIds,
    supersetTransition,
    currentSetTypeGuidance,
    progressWidth,
    restDurationSeconds,
    restRemaining,
    targetSets,
    targetReps,
    activeSetIndex,
    currentSetsKey,
    currentNote,
  };
}
