import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  instructions: string | null;
  is_global: boolean;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface RoutineExercise {
  exercise_id: string;
  exercise_name: string;
  sets_target: number;
  reps_target: number;
  weight_suggestion_kg: number | null;
  order: number;
}

export interface WorkoutSet {
  id?: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  is_pr: boolean;
  completed_at: string;
}

export interface ActiveSession {
  session_id: string | null;
  name: string;
  sets: WorkoutSet[];
  startedAt: Date;
  timerStart: Date | null; // Para el timer de descanso
}

export interface WorkoutHistory {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  total_volume_kg: number;
  sets_count: number;
  muscles_worked: string[];
}

export function useWorkout() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Cargar datos ─────────────────────────────────────────────────────────────

  const fetchRoutines = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          id, name,
          routine_exercises (
            exercise_id, sets_target, reps_target, weight_suggestion_kg, order,
            exercises ( name )
          )
        `)
        .or(`user_id.eq.${userId},is_global.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Routine[] = (data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        exercises: (r.routine_exercises ?? [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((re: any) => ({
            exercise_id: re.exercise_id,
            exercise_name: re.exercises?.name ?? '—',
            sets_target: re.sets_target,
            reps_target: re.reps_target,
            weight_suggestion_kg: re.weight_suggestion_kg,
            order: re.order,
          })),
      }));

      setRoutines(mapped);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.fetchRoutines" });
    }
  }, [userId]);

  const fetchExercises = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`is_global.eq.true,created_by.eq.${userId}`)
        .order('name');
      if (error) throw error;
      setExercises(data ?? []);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.fetchExercises" });
    }
  }, [userId]);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, name, started_at, ended_at, total_volume_kg, muscles_worked_json')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      const mapped: WorkoutHistory[] = (data ?? []).map((s: any) => {
        const muscles = s.muscles_worked_json
          ? JSON.parse(s.muscles_worked_json)
          : [];
        // Contar sets separado (join en otra query si se necesita)
        return {
          id: s.id,
          name: s.name ?? 'Entreno libre',
          started_at: s.started_at,
          ended_at: s.ended_at,
          total_volume_kg: s.total_volume_kg ?? 0,
          sets_count: 0,
          muscles_worked: muscles,
        };
      });

      setHistory(mapped);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.fetchHistory" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ── Sesión activa ─────────────────────────────────────────────────────────────

  const startSession = useCallback(
    async (name: string, routineId?: string): Promise<void> => {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: userId,
            name,
            routine_id: routineId ?? null,
            started_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;

        setActiveSession({
          session_id: data.id,
          name,
          sets: [],
          startedAt: new Date(),
          timerStart: null,
        });
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.startSession" });
      }
    },
    [userId],
  );

  const addSet = useCallback(
    async (
      exerciseId: string,
      exerciseName: string,
      reps: number,
      weightKg: number,
    ): Promise<{ isPr: boolean }> => {
      if (!activeSession?.session_id || !userId) return { isPr: false };
      setSaving(true);

      try {
        const setNumber =
          activeSession.sets.filter((s) => s.exercise_id === exerciseId).length + 1;

        const { data, error } = await supabase
          .from('workout_sets')
          .insert({
            session_id: activeSession.session_id,
            exercise_id: exerciseId,
            set_number: setNumber,
            reps,
            weight_kg: weightKg,
            completed_at: new Date().toISOString(),
          })
          .select('id, is_pr')
          .single();

        if (error) throw error;

        const newSet: WorkoutSet = {
          id: data.id,
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          set_number: setNumber,
          reps,
          weight_kg: weightKg,
          is_pr: data.is_pr ?? false,
          completed_at: new Date().toISOString(),
        };

        setActiveSession((prev) =>
          prev ? { ...prev, sets: [...prev.sets, newSet], timerStart: new Date() } : prev,
        );

        return { isPr: data.is_pr ?? false };
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.addSet" });
        return { isPr: false };
      } finally {
        setSaving(false);
      }
    },
    [activeSession, userId],
  );

  const finishSession = useCallback(async (): Promise<WorkoutSummaryData | null> => {
    if (!activeSession?.session_id || !userId) return null;
    setSaving(true);

    try {
      const endedAt = new Date().toISOString();
      const totalVolume = activeSession.sets.reduce(
        (sum, s) => sum + s.weight_kg * s.reps,
        0,
      );

      // Músculos trabajados
      const muscleSet = new Set<string>();
      for (const set of activeSession.sets) {
        const ex = exercises.find((e) => e.id === set.exercise_id);
        if (ex) muscleSet.add(ex.muscle_group);
      }

      const { error } = await supabase
        .from('workout_sessions')
        .update({
          ended_at: endedAt,
          total_volume_kg: Math.round(totalVolume),
          muscles_worked_json: JSON.stringify([...muscleSet]),
        })
        .eq('id', activeSession.session_id);

      if (error) throw error;

      const durationMin = Math.round(
        (new Date().getTime() - activeSession.startedAt.getTime()) / 60000,
      );

      const prs = activeSession.sets.filter((s) => s.is_pr);
      const summary: WorkoutSummaryData = {
        sessionId: activeSession.session_id,
        name: activeSession.name,
        durationMin,
        totalVolume: Math.round(totalVolume),
        setsCount: activeSession.sets.length,
        prs,
        musclesWorked: [...muscleSet],
      };

      setActiveSession(null);
      await fetchHistory();
      return summary;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.finishSession" });
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession, exercises, userId, fetchHistory]);

  const cancelSession = useCallback(async () => {
    if (!activeSession?.session_id) {
      setActiveSession(null);
      return;
    }
    try {
      await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', activeSession.session_id);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.cancelSession" });
    } finally {
      setActiveSession(null);
    }
  }, [activeSession]);

  // PR histórico por ejercicio
  const getPersonalRecord = useCallback(
    async (exerciseId: string): Promise<{ maxWeight: number; maxReps: number } | null> => {
      if (!userId) return null;
      try {
        const { data, error } = await supabase
          .from('workout_sets')
          .select('weight_kg, reps, workout_sessions!inner(user_id)')
          .eq('workout_sessions.user_id', userId)
          .eq('exercise_id', exerciseId)
          .order('weight_kg', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (!data || data.length === 0) return null;
        return { maxWeight: data[0].weight_kg, maxReps: data[0].reps };
      } catch (err) {
        return null;
      }
    },
    [userId],
  );

  // Stats semanales
  function getWeeklyStats(): { sessions: number; volume: number; muscles: string[] } {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekHistory = history.filter(
      (h) => new Date(h.started_at) >= weekAgo,
    );
    const allMuscles = new Set<string>();
    weekHistory.forEach((h) => h.muscles_worked.forEach((m) => allMuscles.add(m)));
    return {
      sessions: weekHistory.length,
      volume: weekHistory.reduce((s, h) => s + h.total_volume_kg, 0),
      muscles: [...allMuscles],
    };
  }

  useEffect(() => {
    Promise.all([fetchRoutines(), fetchExercises(), fetchHistory()]);
  }, []);

  return {
    routines,
    exercises,
    history,
    activeSession,
    loading,
    saving,
    startSession,
    addSet,
    completeSession: finishSession,
    getExercisePR: getPersonalRecord,
    getHistory: () => history,
    finishSession,
    cancelSession,
    getPersonalRecord,
    getWeeklyStats,
    refresh: () => Promise.all([fetchRoutines(), fetchHistory()]),
  };
}

export interface WorkoutSummaryData {
  sessionId: string;
  name: string;
  durationMin: number;
  totalVolume: number;
  setsCount: number;
  prs: WorkoutSet[];
  musclesWorked: string[];
}

