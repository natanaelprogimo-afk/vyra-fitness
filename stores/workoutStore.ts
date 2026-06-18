import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  type ActiveSession,
  type CreateRoutineInput,
  type Exercise,
  type MuscleRecoveryEntry,
  type RecommendedRoutine,
  type Routine,
  type WorkoutConsistencyStats,
  type WorkoutFatigueRisk,
  type WorkoutHistory,
  type WorkoutMonthlyProgress,
  type WorkoutPersonalRecord,
  type WorkoutProgram,
  type WorkoutProgramAssignment,
  type WorkoutProgramPhase,
  type WorkoutSessionDetail,
  type WorkoutSet,
  type WorkoutSettings,
  type WorkoutSummaryData,
} from '@/lib/workout-types';
import {
  WORKOUT_DEFAULT_SETTINGS,
  WORKOUT_SEED_EXERCISES,
  WORKOUT_SEED_FAVORITES,
  WORKOUT_SEED_PROGRAMS,
  WORKOUT_SEED_ROUTINES,
  WORKOUT_SEED_VERSION,
  WORKOUT_TEMPLATE_ROUTINES,
} from '@/lib/workout-data';
import {
  trackWorkoutCompleted,
  trackWorkoutSetLogged,
  trackWorkoutStarted,
} from '@/lib/analytics';

interface StoredActiveSession extends Omit<ActiveSession, 'startedAt' | 'timerStart'> {
  startedAt: string;
  timerStart: string | null;
}

interface AddSetInput {
  exerciseId?: string;
  reps: number;
  weightKg: number;
  rir?: number | null;
  rpe?: number | null;
  restSec?: number | null;
  notes?: string | null;
  setType?: string;
}

interface CreateExerciseInput {
  name: string;
  muscle_group: string;
  equipment: string;
  instructions?: string | null;
  description?: string | null;
  movement_pattern?: string | null;
  difficulty_level?: string | null;
  cues?: string[];
  mistakes?: string[];
  muscles_secondary?: string[];
  aliases?: string[];
  variations?: string[];
  video_url?: string | null;
  gif_url?: string | null;
  type?: string | null;
}

interface WorkoutStoreState {
  ownerUserId: string | null;
  exercises: Exercise[];
  routines: Routine[];
  routineTemplates: Routine[];
  programs: WorkoutProgram[];
  history: WorkoutHistory[];
  sessionDetails: Record<string, WorkoutSessionDetail>;
  personalRecords: Record<string, WorkoutPersonalRecord>;
  activeProgram: WorkoutProgramAssignment;
  activeSession: StoredActiveSession | null;
  summary: WorkoutSummaryData | null;
  settings: WorkoutSettings;
  favoriteExerciseIds: string[];
  loading: boolean;
  loadError: string | null;
  saving: boolean;
  startSession: (name: string, routineId?: string | null) => Promise<StoredActiveSession | null>;
  addSet: (input: AddSetInput) => Promise<{ isPr: boolean; set: WorkoutSet | null }>;
  finishSession: (opts?: { notes?: string | null }) => Promise<WorkoutSummaryData | null>;
  cancelSession: () => Promise<void>;
  updateSessionNotes: (sessionId: string, notes: string | null) => Promise<boolean>;
  updateExerciseNote: (exerciseId: string, note: string | null) => void;
  deleteSessionRecord: (sessionId: string) => Promise<boolean>;
  createRoutine: (input: CreateRoutineInput) => Promise<string | null>;
  updateRoutine: (routineId: string, input: CreateRoutineInput) => Promise<boolean>;
  cloneTemplateAsRoutine: (templateId: string) => Promise<string | null>;
  createExercise: (input: CreateExerciseInput) => Promise<string | null>;
  toggleFavoriteExercise: (exerciseId: string) => void;
  setActiveProgram: (programId: string | null) => Promise<boolean>;
  updateSettings: (patch: Partial<WorkoutSettings>) => void;
  bindOwner: (userId: string) => void;
  addExerciseToActiveSession: (exercise: Exercise) => void;
  setCurrentExerciseIndex: (index: number) => void;
  startRestTimer: () => void;
  clearRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  getActiveProgram: () => WorkoutProgram | null;
  getProgramPhase: () => WorkoutProgramPhase | null;
  getWeeklyStats: () => { sessions: number; volume: number; muscles: string[] };
  getConsistencyStats: () => WorkoutConsistencyStats;
  getMonthlyProgress: () => WorkoutMonthlyProgress;
  getPersonalRecord: (exerciseId: string) => WorkoutPersonalRecord | null;
  getSessionDetail: (sessionId: string) => WorkoutSessionDetail | null;
  getRecommendedRoutine: () => RecommendedRoutine;
  getMuscleRecovery: () => MuscleRecoveryEntry[];
  getFatigueRisk: () => WorkoutFatigueRisk;
  refresh: () => Promise<void>;
  clearSummary: () => void;
}

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toDayKey(iso: string) {
  return iso.split('T')[0] ?? iso;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toActiveSession(session: StoredActiveSession | null): ActiveSession | null {
  if (!session) return null;
  return {
    ...session,
    startedAt: new Date(session.startedAt),
    timerStart: session.timerStart ? new Date(session.timerStart) : null,
  };
}

function buildPersonalRecords(details: Record<string, WorkoutSessionDetail>) {
  const records: Record<string, WorkoutPersonalRecord> = {};
  Object.values(details).forEach((detail) => {
    detail.sets.forEach((set) => {
      const volume = set.weight_kg * set.reps;
      const current = records[set.exercise_id] ?? {
        exercise_id: set.exercise_id,
        maxWeight: 0,
        maxReps: 0,
        maxVolume: 0,
        updated_at: set.completed_at,
      };
      records[set.exercise_id] = {
        exercise_id: set.exercise_id,
        maxWeight: Math.max(current.maxWeight, set.weight_kg),
        maxReps: Math.max(current.maxReps, set.reps),
        maxVolume: Math.max(current.maxVolume, volume),
        updated_at:
          volume > current.maxVolume || set.weight_kg > current.maxWeight || set.reps > current.maxReps
            ? set.completed_at
            : current.updated_at,
      };
    });
  });
  return records;
}

function isSeedSessionId(value: string | null | undefined) {
  return typeof value === 'string' && value.startsWith('session_seed_');
}

function sanitizePersistedHistory(history: WorkoutHistory[] | undefined) {
  return (history ?? []).filter((entry) => !isSeedSessionId(entry.id));
}

function sanitizePersistedSessionDetails(details: Record<string, WorkoutSessionDetail> | undefined) {
  return Object.fromEntries(
    Object.entries(details ?? {}).filter(([sessionId, detail]) => {
      const detailSessionId = detail?.session?.id ?? sessionId;
      return !isSeedSessionId(sessionId) && !isSeedSessionId(detailSessionId);
    }),
  ) as Record<string, WorkoutSessionDetail>;
}

function matchesSeedFavorites(favorites: string[] | undefined) {
  if (!favorites?.length) return false;
  const current = [...new Set(favorites)].sort().join('|');
  const seeded = [...WORKOUT_SEED_FAVORITES].sort().join('|');
  return current === seeded;
}

function sortHistory(items: WorkoutHistory[]) {
  return [...items].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}

function getRoutineMuscles(routine: Routine, exercises: Exercise[]) {
  const set = new Set<string>();
  routine.exercises.forEach((entry) => {
    const exercise = exercises.find((item) => item.id === entry.exercise_id);
    if (exercise?.muscle_group) set.add(exercise.muscle_group);
    exercise?.muscles_secondary?.forEach((muscle) => set.add(muscle));
  });
  return [...set];
}

function calculateBreakdown(sets: WorkoutSet[]) {
  const grouped = new Map<string, { exercise_name: string; sets: number; total_volume_kg: number; prs: number }>();
  sets.forEach((set) => {
    const current = grouped.get(set.exercise_id) ?? {
      exercise_name: set.exercise_name,
      sets: 0,
      total_volume_kg: 0,
      prs: 0,
    };
    current.sets += 1;
    current.total_volume_kg += set.weight_kg * set.reps;
    current.prs += set.is_pr ? 1 : 0;
    grouped.set(set.exercise_id, current);
  });
  return [...grouped.entries()].map(([exercise_id, value]) => ({ exercise_id, ...value }));
}

function deriveCurrentStreak(history: WorkoutHistory[]) {
  const uniqueDays = [...new Set(history.map((entry) => toDayKey(entry.started_at)))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
  if (uniqueDays.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const latest = new Date(`${uniqueDays[0]}T00:00:00`);
  const firstDiff = Math.round((today.getTime() - latest.getTime()) / 86400000);
  if (firstDiff > 1) return 0;

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const prev = new Date(`${uniqueDays[index - 1]}T00:00:00`);
    const current = new Date(`${uniqueDays[index]}T00:00:00`);
    const diff = Math.round((prev.getTime() - current.getTime()) / 86400000);
    if (diff === 1) streak += 1;
    else break;
  }
  return streak;
}

function getRangeStart(days: number) {
  const limit = new Date();
  limit.setDate(limit.getDate() - days + 1);
  limit.setHours(0, 0, 0, 0);
  return limit.getTime();
}

function mergeSeedExercises(current: Exercise[]) {
  const seedIds = new Set(WORKOUT_SEED_EXERCISES.map((item) => item.id));
  const custom = current.filter((item) => !seedIds.has(item.id));
  return [...custom, ...WORKOUT_SEED_EXERCISES];
}

function mergeSeedRoutines(current: Routine[]) {
  const seedIds = new Set(WORKOUT_SEED_ROUTINES.map((item) => item.id));
  const currentById = new Map(current.map((item) => [item.id, item]));
  const mergedSeed = WORKOUT_SEED_ROUTINES.map((routine) => {
    const existing = currentById.get(routine.id);
    if (!existing) return routine;
    return {
      ...routine,
      last_used_at: existing.last_used_at ?? routine.last_used_at,
    };
  });
  const custom = current.filter((item) => !seedIds.has(item.id));
  return [...custom, ...mergedSeed];
}

function mergeSeedTemplates(current: Routine[]) {
  const seedIds = new Set(WORKOUT_TEMPLATE_ROUTINES.map((item) => item.id));
  const custom = current.filter((item) => !seedIds.has(item.id));
  return [...custom, ...WORKOUT_TEMPLATE_ROUTINES];
}

function mergeSeedPrograms(current: WorkoutProgram[]) {
  const seedIds = new Set(WORKOUT_SEED_PROGRAMS.map((item) => item.id));
  const custom = current.filter((item) => !seedIds.has(item.id));
  return [...custom, ...WORKOUT_SEED_PROGRAMS];
}

const initialState = () => ({
  ownerUserId: null,
  exercises: WORKOUT_SEED_EXERCISES,
  routines: WORKOUT_SEED_ROUTINES,
  routineTemplates: WORKOUT_TEMPLATE_ROUTINES,
  programs: WORKOUT_SEED_PROGRAMS,
  history: [],
  sessionDetails: {},
  personalRecords: {},
  activeProgram: {
    programId: null,
    startedAt: null,
    currentWeek: 1,
    currentDay: 1,
  },
  activeSession: null,
  summary: null,
  settings: WORKOUT_DEFAULT_SETTINGS,
  favoriteExerciseIds: [],
  loading: false,
  loadError: null,
  saving: false,
});

function createOwnerScopedState(ownerUserId: string | null) {
  return {
    ...initialState(),
    ownerUserId,
  };
}

export const useWorkoutStore = create<WorkoutStoreState>()(
  persist(
    (set, get) => ({
      ...initialState(),
      startSession: async (name, routineId) => {
        const existing = get().activeSession;
        if (existing) return existing;

        const routine = routineId ? get().routines.find((item) => item.id === routineId) ?? null : null;
        const fallbackRoutine = get().getRecommendedRoutine().routine ?? get().routines[0] ?? null;
        const selectedRoutine = routine ?? fallbackRoutine;
        const exercises =
          selectedRoutine?.exercises?.length
            ? selectedRoutine.exercises
            : get().exercises.slice(0, 3).map((exercise, index) => ({
                exercise_id: exercise.id,
                exercise_name: exercise.name,
                sets_target: 3,
                reps_target: exercise.type === 'cardio' ? 2 : 10,
                weight_suggestion_kg: exercise.type === 'bodyweight' || exercise.type === 'cardio' ? 0 : 20,
                order: index,
                rest_seconds: get().settings.defaultRestSeconds,
              }));

        const activeSession: StoredActiveSession = {
          session_id: createId('session'),
          routine_id: selectedRoutine?.id ?? routineId ?? null,
          name: name || selectedRoutine?.name || 'Sesión libre',
          sets: [],
          startedAt: new Date().toISOString(),
          timerStart: null,
          exercises,
          currentExerciseIndex: 0,
          notes: null,
          exerciseNotes: {},
          isQuickSession: !selectedRoutine,
        };
        set({ activeSession, summary: null });
        trackWorkoutStarted({
          session_id: activeSession.session_id,
          routine_id: activeSession.routine_id,
          session_name: activeSession.name,
          is_quick: activeSession.isQuickSession,
        });
        return activeSession;
      },
      addSet: async (input) => {
        const state = get();
        const activeSession = state.activeSession;
        if (!activeSession) return { isPr: false, set: null };

        const currentExercise = activeSession.exercises[activeSession.currentExerciseIndex];
        const exercise =
          input.exerciseId
            ? activeSession.exercises.find((item) => item.exercise_id === input.exerciseId) ?? currentExercise
            : currentExercise;
        if (!exercise) return { isPr: false, set: null };

        const previousSets = activeSession.sets.filter((item) => item.exercise_id === exercise.exercise_id);
        const nextSetNumber = previousSets.length + 1;
        const currentPr = state.personalRecords[exercise.exercise_id];
        const nextVolume = input.weightKg * input.reps;
        const isPr = Boolean(
          !currentPr ||
            input.weightKg > currentPr.maxWeight ||
            input.reps > currentPr.maxReps ||
            nextVolume > currentPr.maxVolume,
        );

        const nextSet: WorkoutSet = {
          id: createId('set'),
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.exercise_name,
          set_number: nextSetNumber,
          reps: Math.max(0, Math.round(input.reps)),
          weight_kg: Math.max(0, Number(input.weightKg)),
          is_pr: isPr,
          completed_at: new Date().toISOString(),
          rir: input.rir ?? exercise.rir_target ?? null,
          rpe: input.rpe ?? exercise.rpe_target ?? null,
          rest_sec: input.restSec ?? exercise.rest_seconds ?? state.settings.defaultRestSeconds,
          notes: input.notes ?? null,
          set_type: input.setType ?? 'work',
        };

        const nextSession: StoredActiveSession = {
          ...activeSession,
          sets: [...activeSession.sets, nextSet],
          timerStart: state.settings.autoStartRest ? new Date().toISOString() : activeSession.timerStart,
        };

        const nextRecords = {
          ...state.personalRecords,
          [exercise.exercise_id]: {
            exercise_id: exercise.exercise_id,
            maxWeight: Math.max(currentPr?.maxWeight ?? 0, nextSet.weight_kg),
            maxReps: Math.max(currentPr?.maxReps ?? 0, nextSet.reps),
            maxVolume: Math.max(currentPr?.maxVolume ?? 0, nextVolume),
            updated_at: isPr ? nextSet.completed_at : currentPr?.updated_at ?? nextSet.completed_at,
          },
        };

        set({ activeSession: nextSession, personalRecords: nextRecords });
        trackWorkoutSetLogged({
          session_id: nextSession.session_id,
          routine_id: nextSession.routine_id,
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.exercise_name,
          set_number: nextSetNumber,
          is_pr: isPr,
          rest_sec: nextSet.rest_sec,
        });
        return { isPr, set: nextSet };
      },
      finishSession: async (opts) => {
        const state = get();
        const activeSession = state.activeSession;
        if (!activeSession) return null;

        const endedAt = new Date().toISOString();
        const totalVolume = activeSession.sets.reduce((sum, item) => sum + item.weight_kg * item.reps, 0);
        const totalReps = activeSession.sets.reduce((sum, item) => sum + item.reps, 0);
        const musclesWorked = [
          ...new Set(
            activeSession.exercises.flatMap((entry) => {
              const exercise = state.exercises.find((item) => item.id === entry.exercise_id);
              return [exercise?.muscle_group, ...(exercise?.muscles_secondary ?? [])].filter(Boolean) as string[];
            }),
          ),
        ];
        const durationMin = Math.max(
          1,
          Math.round((new Date(endedAt).getTime() - new Date(activeSession.startedAt).getTime()) / 60000),
        );
        const estimatedCalories = Math.round(durationMin * (activeSession.isQuickSession ? 4.6 : 6.2));

        const historyEntry: WorkoutHistory = {
          id: activeSession.session_id ?? createId('session'),
          name: activeSession.name,
          started_at: activeSession.startedAt,
          ended_at: endedAt,
          total_volume_kg: Math.round(totalVolume),
          sets_count: activeSession.sets.length,
          muscles_worked: musclesWorked,
          routine_id: activeSession.routine_id ?? null,
          notes: opts?.notes ?? activeSession.notes ?? null,
          total_reps: totalReps,
          estimated_calories: estimatedCalories,
          duration_min: durationMin,
        };

        const detail: WorkoutSessionDetail = {
          session: historyEntry,
          sets: activeSession.sets,
          exerciseBreakdown: calculateBreakdown(activeSession.sets),
          durationMin,
          exerciseNotes: activeSession.exerciseNotes ?? {},
        };

        const summary: WorkoutSummaryData = {
          sessionId: historyEntry.id,
          name: historyEntry.name,
          durationMin,
          totalVolume: historyEntry.total_volume_kg,
          setsCount: historyEntry.sets_count,
          prs: activeSession.sets.filter((item) => item.is_pr),
          musclesWorked,
          notes: historyEntry.notes,
          totalReps,
          estimatedCalories,
        };

        set({
          history: sortHistory([historyEntry, ...state.history]),
          sessionDetails: { ...state.sessionDetails, [historyEntry.id]: detail },
          summary,
          activeSession: null,
          routines: state.activeSession?.routine_id
            ? state.routines.map((routine) =>
                routine.id === state.activeSession?.routine_id ? { ...routine, last_used_at: endedAt } : routine,
              )
            : state.routines,
        });
        trackWorkoutCompleted({
          session_id: historyEntry.id,
          routine_id: historyEntry.routine_id,
          session_name: historyEntry.name,
          duration_min: durationMin,
          prs: summary.prs.length,
          total_volume: historyEntry.total_volume_kg,
        });

        return summary;
      },
      cancelSession: async () => {
        set({ activeSession: null });
      },
      updateSessionNotes: async (sessionId, notes) => {
        const state = get();
        if (!state.history.some((item) => item.id === sessionId)) return false;

        set({
          history: state.history.map((item) => (item.id === sessionId ? { ...item, notes } : item)),
          sessionDetails: {
            ...state.sessionDetails,
            [sessionId]: state.sessionDetails[sessionId]
              ? {
                  ...state.sessionDetails[sessionId],
                  session: state.sessionDetails[sessionId]!.session
                    ? { ...state.sessionDetails[sessionId]!.session!, notes }
                    : null,
                }
              : state.sessionDetails[sessionId],
          },
        });
        return true;
      },
      updateExerciseNote: (exerciseId, note) => {
        const session = get().activeSession;
        if (!session || !exerciseId) return;

        const nextNotes = { ...(session.exerciseNotes ?? {}) };
        const cleaned = note?.trim() ?? '';

        if (cleaned.length === 0) {
          delete nextNotes[exerciseId];
        } else {
          nextNotes[exerciseId] = cleaned;
        }

        set({
          activeSession: {
            ...session,
            exerciseNotes: nextNotes,
          },
        });
      },
      deleteSessionRecord: async (sessionId) => {
        const state = get();
        if (!state.history.some((item) => item.id === sessionId)) return false;
        const nextDetails = { ...state.sessionDetails };
        delete nextDetails[sessionId];
        set({
          history: state.history.filter((item) => item.id !== sessionId),
          sessionDetails: nextDetails,
        });
        return true;
      },
      createRoutine: async (input) => {
        const id = createId('routine');
        const now = new Date().toISOString();
        const nextRoutine: Routine = {
          id,
          name: input.name.trim(),
          description: input.description ?? null,
          split_tag: input.split_tag ?? null,
          estimated_duration_min: input.estimated_duration_min ?? null,
          schedule_day: input.schedule_day ?? null,
          goal_tag: input.goal_tag ?? null,
          is_primary: Boolean(input.is_primary),
          exercises: input.exercises.map((exercise, index) => ({ ...exercise, order: index })),
          source: 'user',
          created_at: now,
          updated_at: now,
        };
        set((store) => ({ routines: [nextRoutine, ...store.routines] }));
        return id;
      },
      updateRoutine: async (routineId, input) => {
        const state = get();
        if (!state.routines.some((item) => item.id === routineId)) return false;
        set({
          routines: state.routines.map((routine) =>
            routine.id === routineId
              ? {
                  ...routine,
                  name: input.name.trim(),
                  description: input.description ?? null,
                  split_tag: input.split_tag ?? null,
                  estimated_duration_min: input.estimated_duration_min ?? null,
                  schedule_day: input.schedule_day ?? null,
                  goal_tag: input.goal_tag ?? null,
                  is_primary: Boolean(input.is_primary),
                  exercises: input.exercises.map((exercise, index) => ({ ...exercise, order: index })),
                  updated_at: new Date().toISOString(),
                }
              : routine,
          ),
        });
        return true;
      },
      cloneTemplateAsRoutine: async (templateId) => {
        const template = get().routineTemplates.find((item) => item.id === templateId);
        if (!template) return null;
        return get().createRoutine({
          name: `${template.name} copia`,
          description: template.description ?? null,
          split_tag: template.split_tag ?? null,
          estimated_duration_min: template.estimated_duration_min ?? null,
          schedule_day: template.schedule_day ?? null,
          goal_tag: template.goal_tag ?? null,
          is_primary: false,
          exercises: template.exercises,
        });
      },
      createExercise: async (input) => {
        const id = createId('exercise');
        const now = new Date().toISOString();
        const nextExercise: Exercise = {
          id,
          name: input.name.trim(),
          muscle_group: input.muscle_group.trim(),
          muscles_secondary: input.muscles_secondary ?? [],
          equipment: input.equipment.trim(),
          instructions: input.instructions ?? null,
          description: input.description ?? null,
          movement_pattern: input.movement_pattern ?? null,
          difficulty_level: input.difficulty_level ?? null,
          cues: input.cues ?? [],
          mistakes: input.mistakes ?? [],
          aliases: input.aliases ?? [],
          variations: input.variations ?? [],
          video_url: input.video_url ?? null,
          gif_url: input.gif_url ?? null,
          type: input.type ?? 'strength',
          is_global: false,
          created_at: now,
          updated_at: now,
        };
        set((store) => ({ exercises: [nextExercise, ...store.exercises] }));
        return id;
      },
      toggleFavoriteExercise: (exerciseId) => {
        const favorites = get().favoriteExerciseIds;
        set({
          favoriteExerciseIds: favorites.includes(exerciseId)
            ? favorites.filter((item) => item !== exerciseId)
            : [exerciseId, ...favorites],
        });
      },
      setActiveProgram: async (programId) => {
        set({
          activeProgram: {
            programId,
            startedAt: programId ? new Date().toISOString() : null,
            currentWeek: 1,
            currentDay: 1,
          },
        });
        return true;
      },
      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }));
      },
      bindOwner: (userId) => {
        const currentOwner = get().ownerUserId;
        if (!userId || currentOwner === userId) return;

        if (!currentOwner) {
          set({ ownerUserId: userId });
          return;
        }

        set((state) => ({
          ...createOwnerScopedState(userId),
          loading: state.loading,
          saving: state.saving,
        }));
      },
      addExerciseToActiveSession: (exercise) => {
        const session = get().activeSession;
        if (!session) return;

        const nextExercise = {
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          sets_target: exercise.type === 'cardio' ? 2 : 3,
          reps_target: exercise.type === 'cardio' ? 2 : 10,
          weight_suggestion_kg:
            exercise.type === 'bodyweight' || exercise.type === 'cardio' ? 0 : 20,
          order: session.exercises.length,
          rest_seconds: get().settings.defaultRestSeconds,
          set_type: 'Normal',
        };

        set({
          activeSession: {
            ...session,
            exercises: [...session.exercises, nextExercise],
            currentExerciseIndex: session.exercises.length,
          },
        });
      },
      startRestTimer: () => {
        const session = get().activeSession;
        if (!session) return;
        set({
          activeSession: {
            ...session,
            timerStart: new Date().toISOString(),
          },
        });
      },
      clearRestTimer: () => {
        const session = get().activeSession;
        if (!session) return;
        set({
          activeSession: {
            ...session,
            timerStart: null,
          },
        });
      },
      adjustRestTimer: (deltaSeconds) => {
        const session = get().activeSession;
        if (!session?.timerStart || !Number.isFinite(deltaSeconds) || deltaSeconds === 0) return;
        const shifted = new Date(new Date(session.timerStart).getTime() - deltaSeconds * 1000).toISOString();
        set({
          activeSession: {
            ...session,
            timerStart: shifted,
          },
        });
      },
      setCurrentExerciseIndex: (index) => {
        const session = get().activeSession;
        if (!session) return;
        set({
          activeSession: {
            ...session,
            currentExerciseIndex: clamp(index, 0, Math.max(0, session.exercises.length - 1)),
            timerStart: null,
          },
        });
      },
      goToNextExercise: () => {
        const session = get().activeSession;
        if (!session) return;
        get().setCurrentExerciseIndex(session.currentExerciseIndex + 1);
      },
      goToPreviousExercise: () => {
        const session = get().activeSession;
        if (!session) return;
        get().setCurrentExerciseIndex(session.currentExerciseIndex - 1);
      },
      getActiveProgram: () => {
        const { activeProgram, programs } = get();
        return programs.find((item) => item.id === activeProgram.programId) ?? null;
      },
      getProgramPhase: () => {
        const state = get();
        const activeProgram = state.getActiveProgram();
        if (!activeProgram || !state.activeProgram.startedAt) return null;
        const weeksElapsed = Math.max(
          0,
          Math.floor((Date.now() - new Date(state.activeProgram.startedAt).getTime()) / (7 * 86400000)),
        );
        const week = clamp(weeksElapsed + 1, 1, activeProgram.duration_weeks);
        const ratio = week / activeProgram.duration_weeks;
        const label = ratio <= 0.34 ? 'Base' : ratio <= 0.67 ? 'Construcción' : 'Consolidación';
        return {
          week,
          totalWeeks: activeProgram.duration_weeks,
          label,
          focus: activeProgram.objective ?? activeProgram.split_tag,
        };
      },
      getWeeklyStats: () => {
        const recent = get().history.filter((entry) => new Date(entry.started_at).getTime() >= getRangeStart(7));
        return {
          sessions: recent.length,
          volume: recent.reduce((sum, item) => sum + item.total_volume_kg, 0),
          muscles: [...new Set(recent.flatMap((item) => item.muscles_worked))].slice(0, 6),
        };
      },
      getConsistencyStats: () => {
        const history = get().history;
        const recent30 = history.filter((entry) => new Date(entry.started_at).getTime() >= getRangeStart(30));
        const weekStats = get().getWeeklyStats();
        const weeks = new Set<string>();
        history.forEach((entry) => {
          const date = new Date(entry.started_at);
          const monday = new Date(date);
          const day = monday.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          monday.setDate(monday.getDate() + diff);
          monday.setHours(0, 0, 0, 0);
          weeks.add(monday.toISOString().split('T')[0] ?? '');
        });
        return {
          currentStreak: deriveCurrentStreak(history),
          currentWeekSessions: weekStats.sessions,
          activeWeeksLast12: [...weeks].slice(0, 12).length,
          sessionsLast30: recent30.length,
          weeklyVolume: weekStats.volume,
          avgSessionVolume: recent30.length
            ? Math.round(recent30.reduce((sum, item) => sum + item.total_volume_kg, 0) / recent30.length)
            : 0,
        };
      },
      getMonthlyProgress: () => {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
        const currentMonth = get().history.filter((entry) => entry.started_at.startsWith(monthKey));
        const previousMonth = get().history.filter((entry) => entry.started_at.startsWith(prevKey));
        const currentVolume = currentMonth.reduce((sum, item) => sum + item.total_volume_kg, 0);
        const previousVolume = previousMonth.reduce((sum, item) => sum + item.total_volume_kg, 0);
        return {
          currentMonthSessions: currentMonth.length,
          currentMonthVolume: currentVolume,
          currentMonthAvgSets: currentMonth.length
            ? Math.round(currentMonth.reduce((sum, item) => sum + item.sets_count, 0) / currentMonth.length)
            : 0,
          volumeDeltaPct: previousVolume > 0 ? Math.round(((currentVolume - previousVolume) / previousVolume) * 100) : null,
          sessionsDelta: currentMonth.length - previousMonth.length,
        };
      },
      getPersonalRecord: (exerciseId) => {
        const record = get().personalRecords[exerciseId];
        if (!record) return null;
        return record;
      },
      getSessionDetail: (sessionId) => get().sessionDetails[sessionId] ?? null,
      getMuscleRecovery: () => {
        const exercises = get().exercises;
        const recent = get().history.filter((entry) => new Date(entry.started_at).getTime() >= getRangeStart(5));
        const muscles = new Map<string, { latestAt: number; sessions: number }>();
        recent.forEach((session) => {
          session.muscles_worked.forEach((muscle) => {
            const current = muscles.get(muscle) ?? { latestAt: 0, sessions: 0 };
            muscles.set(muscle, {
              latestAt: Math.max(current.latestAt, new Date(session.started_at).getTime()),
              sessions: current.sessions + 1,
            });
          });
        });

        const allMuscles = [
          ...new Set(exercises.flatMap((exercise) => [exercise.muscle_group, ...(exercise.muscles_secondary ?? [])])),
        ];

        return allMuscles.map((muscle) => {
          const current = muscles.get(muscle);
          if (!current) return { muscle, label: muscle, status: 'fresh' as const, sessions: 0 };
          const hoursSince = (Date.now() - current.latestAt) / 3600000;
          const status = hoursSince <= 36 || current.sessions >= 2 ? 'fatigued' : hoursSince <= 72 ? 'building' : 'fresh';
          return { muscle, label: muscle, status, sessions: current.sessions };
        });
      },
      getFatigueRisk: () => {
        const weekly = get().getWeeklyStats();
        const streak = deriveCurrentStreak(get().history);
        const muscleRecovery = get().getMuscleRecovery();
        const tired = muscleRecovery.filter((item) => item.status === 'fatigued').length;
        let level: WorkoutFatigueRisk['level'] = 'low';
        const reasons: string[] = [];

        if (streak >= 4) reasons.push(`Llevas ${streak} días seguidos entrenando.`);
        if (weekly.sessions >= 4) reasons.push(`Ya acumulaste ${weekly.sessions} sesiones esta semana.`);
        if (tired >= 3) reasons.push(`Hay ${tired} grupos musculares con carga alta reciente.`);
        if (weekly.volume >= 7000) reasons.push(`El volumen semanal ya va en ${weekly.volume} kg.`);

        if (streak >= 4 || tired >= 3 || weekly.sessions >= 5) level = 'high';
        else if (streak >= 2 || tired >= 1 || weekly.sessions >= 3) level = 'moderate';

        const message =
          level === 'high'
            ? 'Conviene bajar intensidad o elegir una sesión técnica para seguir sumando sin romper el bloque.'
            : level === 'moderate'
              ? 'Hay margen para entrenar, pero con una sesión controlada te va a rendir más.'
              : 'Tu recuperación de entreno está limpia para empujar una sesión fuerte.';

        return {
          level,
          message,
          reasons,
          recommendRecoveryDay: level === 'high',
          consecutiveTrainingDays: streak,
          avgSleepHoursLast3: null,
          avgStressLast3: null,
          cyclePhase: null,
          cycleAdjustedRecommendation: null,
          cycleLoadProfile: null,
        };
      },
      getRecommendedRoutine: () => {
        const state = get();
        const activeProgram = state.getActiveProgram();
        const fatigue = state.getFatigueRisk();
        const muscleRecovery = state
          .getMuscleRecovery()
          .filter((entry) => entry.status === 'fatigued')
          .map((entry) => entry.muscle);
        const sourceRoutines = state.routines.length ? state.routines : WORKOUT_SEED_ROUTINES;
        const ranked = sourceRoutines
          .map((routine) => {
            const muscles = getRoutineMuscles(routine, state.exercises);
            const overlap = muscles.filter((muscle) => muscleRecovery.includes(muscle)).length;
            return { routine, overlap };
          })
          .sort((a, b) => {
            if (a.overlap !== b.overlap) return a.overlap - b.overlap;
            if (a.routine.is_primary !== b.routine.is_primary) return a.routine.is_primary ? -1 : 1;
            return (a.routine.estimated_duration_min ?? 999) - (b.routine.estimated_duration_min ?? 999);
          });

        let routine = ranked[0]?.routine ?? null;
        if (activeProgram?.routine_ids?.length) {
          const completedThisWeek = state.history.filter((entry) => new Date(entry.started_at).getTime() >= getRangeStart(7))
            .length;
          const plannedId = activeProgram.routine_ids[completedThisWeek % activeProgram.routine_ids.length] ?? activeProgram.routine_ids[0];
          routine = state.routines.find((item) => item.id === plannedId) ?? routine;
        }

        const reasons = [
          activeProgram
            ? `Programa activo: ${activeProgram.name}.`
            : 'No hay programa activo, así que prioricé una rutina útil para hoy.',
          fatigue.level === 'high'
            ? 'La lectura de fatiga pide una sesión que no repita los grupos más cargados.'
            : fatigue.level === 'moderate'
              ? 'Conviene sostener ritmo sin apilar demasiada carga local.'
              : 'La recuperación está limpia para un bloque principal.',
        ];
        if (muscleRecovery.length > 0) reasons.push(`Grupos más cargados: ${muscleRecovery.slice(0, 3).join(', ')}.`);

        return {
          routine,
          reason: routine ? `La mejor siguiente sesión hoy es ${routine.name}.` : 'Todavía no tienes rutinas. Empieza con una sesión rápida.',
          reasons,
        };
      },
      refresh: async () => {
        set({ loading: true, loadError: null });
        try {
          const state = get();
          set({
            exercises: mergeSeedExercises(state.exercises),
            routines: mergeSeedRoutines(state.routines),
            routineTemplates: mergeSeedTemplates(state.routineTemplates),
            programs: mergeSeedPrograms(state.programs),
            loading: false,
          });
        } catch (err) {
          set({
            loading: false,
            loadError: err instanceof Error ? err.message : 'No se pudo refrescar el catalogo de entreno.',
          });
        }
      },
      clearSummary: () => set({ summary: null }),
    }),
    {
      name: `vyra-workout-store-v${WORKOUT_SEED_VERSION}`,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ownerUserId: state.ownerUserId,
        exercises: state.exercises,
        routines: state.routines,
        routineTemplates: state.routineTemplates,
        programs: state.programs,
        history: state.history,
        sessionDetails: state.sessionDetails,
        personalRecords: state.personalRecords,
        activeProgram: state.activeProgram,
        activeSession: state.activeSession,
        summary: state.summary,
        settings: state.settings,
        favoriteExerciseIds: state.favoriteExerciseIds,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<WorkoutStoreState>) ?? {};
        const sanitizedHistory = sanitizePersistedHistory(persisted.history);
        const sanitizedSessionDetails = sanitizePersistedSessionDetails(
          persisted.sessionDetails as Record<string, WorkoutSessionDetail> | undefined,
        );
        const hadSeedHistory = (persisted.history ?? []).some((entry) => isSeedSessionId(entry.id));
        const hadSeedSessionDetails = Object.keys(
          persisted.sessionDetails ?? {},
        ).some((sessionId) => isSeedSessionId(sessionId));
        const shouldResetSeededActiveProgram =
          (hadSeedHistory || hadSeedSessionDetails) && sanitizedHistory.length === 0;
        const sanitizedPersonalRecords = Object.keys(sanitizedSessionDetails).length
          ? buildPersonalRecords(sanitizedSessionDetails)
          : {};
        const sanitizedFavorites =
          (hadSeedHistory || hadSeedSessionDetails) && matchesSeedFavorites(persisted.favoriteExerciseIds)
            ? currentState.favoriteExerciseIds
            : persisted.favoriteExerciseIds?.length
              ? persisted.favoriteExerciseIds
              : currentState.favoriteExerciseIds;

        return {
          ...currentState,
          ...persisted,
          ownerUserId: persisted.ownerUserId ?? currentState.ownerUserId,
          exercises: persisted.exercises?.length ? persisted.exercises : currentState.exercises,
          routines: persisted.routines?.length ? persisted.routines : currentState.routines,
          routineTemplates: persisted.routineTemplates?.length ? persisted.routineTemplates : currentState.routineTemplates,
          programs: persisted.programs?.length ? persisted.programs : currentState.programs,
          history: sanitizedHistory.length ? sanitizedHistory : currentState.history,
          sessionDetails:
            Object.keys(sanitizedSessionDetails).length
              ? sanitizedSessionDetails
              : currentState.sessionDetails,
          personalRecords:
            Object.keys(sanitizedPersonalRecords).length
              ? sanitizedPersonalRecords
              : persisted.personalRecords && Object.keys(persisted.personalRecords).length
              ? persisted.personalRecords
              : currentState.personalRecords,
          activeProgram: shouldResetSeededActiveProgram
            ? currentState.activeProgram
            : persisted.activeProgram ?? currentState.activeProgram,
          activeSession: persisted.activeSession ?? currentState.activeSession,
          summary: persisted.summary ?? currentState.summary,
          settings: { ...currentState.settings, ...(persisted.settings ?? {}) },
          favoriteExerciseIds: sanitizedFavorites,
        } as WorkoutStoreState;
      },
    },
  ),
);

export function useWorkoutActiveSession() {
  const storedActiveSession = useWorkoutStore((state) => state.activeSession);
  return useMemo(() => toActiveSession(storedActiveSession), [storedActiveSession]);
}
