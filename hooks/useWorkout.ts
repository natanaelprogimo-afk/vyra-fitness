import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { decryptSensitiveText } from '@/lib/sensitive-crypto';
import { resolveFemalePhaseFromRecord } from '@/lib/female-phase';
import { useModuleRewards } from '@/hooks/useModuleRewards';

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

export interface WorkoutFatigueRisk {
  level: 'low' | 'moderate' | 'high';
  message: string | null;
  reasons: string[];
  recommendRecoveryDay: boolean;
  consecutiveTrainingDays: number;
  avgSleepHoursLast3: number | null;
  avgStressLast3: number | null;
  cyclePhase: string | null;
  cycleAdjustedRecommendation: string | null;
  cycleLoadProfile: {
    intensityCapRpe: number;
    volumeMultiplier: number;
    stepGoalAdjustmentPct: number;
    preferredFocus: string;
    avoidFocus: string;
  } | null;
}

function normalizeDay(value: string): string {
  return new Date(value).toISOString().split('T')[0] ?? '';
}

function isPreviousCalendarDay(previousDay: string, currentDay: string): boolean {
  const prev = new Date(`${previousDay}T00:00:00`);
  const current = new Date(`${currentDay}T00:00:00`);
  return prev.getTime() - current.getTime() === 24 * 60 * 60 * 1000;
}

function getConsecutiveTrainingDays(history: WorkoutHistory[]): number {
  const uniqueDays = [...new Set(
    history
      .map((entry) => normalizeDay(entry.started_at))
      .filter((day) => day.length > 0),
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (!uniqueDays.length) return 0;

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    if (isPreviousCalendarDay(uniqueDays[index - 1]!, uniqueDays[index]!)) {
      streak += 1;
      continue;
    }
    break;
  }
  return streak;
}

function buildCycleLoadProfile(phase: string | null) {
  if (phase === 'menstrual') {
    return {
      intensityCapRpe: 6.5,
      volumeMultiplier: 0.7,
      stepGoalAdjustmentPct: -20,
      preferredFocus: 'movilidad, tecnica, fuerza liviana y recuperacion activa',
      avoidFocus: 'PRs, intervalos duros y volumen alto',
    };
  }
  if (phase === 'follicular') {
    return {
      intensityCapRpe: 8.5,
      volumeMultiplier: 1.05,
      stepGoalAdjustmentPct: 5,
      preferredFocus: 'progresion de carga, fuerza e hipertrofia',
      avoidFocus: 'subestimar la recuperacion cuando sube la energia',
    };
  }
  if (phase === 'ovulation') {
    return {
      intensityCapRpe: 9,
      volumeMultiplier: 1.1,
      stepGoalAdjustmentPct: 10,
      preferredFocus: 'sesiones intensas, potencia y PRs controlados',
      avoidFocus: 'gestos explosivos sin buen calentamiento',
    };
  }
  if (phase === 'luteal') {
    return {
      intensityCapRpe: 7.5,
      volumeMultiplier: 0.85,
      stepGoalAdjustmentPct: -5,
      preferredFocus: 'fuerza estable, accesorios y tecnica limpia',
      avoidFocus: 'volumen basura y deficit de recuperacion',
    };
  }
  return null;
}

export function useWorkout() {
  const { profile } = useAuthStore();
  const userId = profile?.id;
  const { reward } = useModuleRewards();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avgSleepHoursLast3, setAvgSleepHoursLast3] = useState<number | null>(null);
  const [avgStressLast3, setAvgStressLast3] = useState<number | null>(null);
  const [cyclePhase, setCyclePhase] = useState<string | null>(null);

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

  const fetchRecoverySignals = useCallback(async () => {
    if (!userId) return;
    try {
      const [sleepRes, mentalRes, femaleRes] = await Promise.all([
        supabase
          .from('sleep_logs')
          .select('duration_min')
          .eq('user_id', userId)
          .order('end_time', { ascending: false })
          .limit(3),
        supabase
          .from('mental_checkins')
          .select('*')
          .eq('user_id', userId)
          .order('check_date', { ascending: false })
          .limit(3),
        profile?.female_health_enabled
          ? supabase
              .from('female_health_logs')
              .select('*')
              .eq('user_id', userId)
              .order('logged_at', { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null as Record<string, unknown> | null }),
      ]);

      const sleepRows = sleepRes.data ?? [];
      const stressRowsRaw = mentalRes.data ?? [];
      const stressRows = await Promise.all(
        stressRowsRaw.map(async (row) => {
          const decryptedStress = await decryptSensitiveText(
            typeof row.stress_encrypted === 'string' ? row.stress_encrypted : null,
          );
          return {
            ...row,
            stress: Number(decryptedStress ?? row.stress ?? 0),
          };
        }),
      );
      const sleepAvg = sleepRows.length
        ? sleepRows.reduce((sum, row) => sum + Number(row.duration_min ?? 0), 0) / sleepRows.length / 60
        : null;
      const stressAvg = stressRows.length
        ? stressRows.reduce((sum, row) => sum + Number(row.stress ?? 0), 0) / stressRows.length
        : null;
      const resolvedFemalePhase = await resolveFemalePhaseFromRecord(
        femaleRes.data as Record<string, unknown> | null | undefined,
      );

      setAvgSleepHoursLast3(sleepAvg !== null ? Math.round(sleepAvg * 10) / 10 : null);
      setAvgStressLast3(stressAvg !== null ? Math.round(stressAvg * 10) / 10 : null);
      setCyclePhase(resolvedFemalePhase);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useWorkout.fetchRecoverySignals' });
    }
  }, [profile?.female_health_enabled, userId]);

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
      await Promise.all([
        fetchHistory(),
        fetchRecoverySignals(),
        reward('workout_completed'),
        ...prs.map(() => reward('pr_achieved')),
      ]);
      return summary;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useWorkout.finishSession" });
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession, exercises, userId, fetchHistory, fetchRecoverySignals, reward]);

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

  function getFatigueRisk(): WorkoutFatigueRisk {
    const consecutiveTrainingDays = getConsecutiveTrainingDays(history);
    const reasons: string[] = [];
    let riskScore = 0;
    const cycleLoadProfile = buildCycleLoadProfile(cyclePhase);

    if (consecutiveTrainingDays >= 5) {
      riskScore += 2;
      reasons.push(`${consecutiveTrainingDays} dias seguidos de entrenamiento.`);
    } else if (consecutiveTrainingDays >= 4) {
      riskScore += 1;
      reasons.push(`${consecutiveTrainingDays} dias consecutivos entrenando.`);
    }

    if (typeof avgSleepHoursLast3 === 'number' && avgSleepHoursLast3 < 6) {
      riskScore += 2;
      reasons.push(`Sueno corto reciente (${avgSleepHoursLast3}h promedio).`);
    } else if (typeof avgSleepHoursLast3 === 'number' && avgSleepHoursLast3 < 6.8) {
      riskScore += 1;
      reasons.push(`Sueno ajustado (${avgSleepHoursLast3}h promedio).`);
    }

    if (typeof avgStressLast3 === 'number' && avgStressLast3 >= 7) {
      riskScore += 2;
      reasons.push(`Estres alto (${avgStressLast3}/10).`);
    } else if (typeof avgStressLast3 === 'number' && avgStressLast3 >= 6) {
      riskScore += 1;
      reasons.push(`Estres en subida (${avgStressLast3}/10).`);
    }

    if (cyclePhase === 'luteal' || cyclePhase === 'menstrual') {
      riskScore += 1;
      reasons.push('Fase del ciclo con mayor fatiga potencial.');
    }

    let cycleAdjustedRecommendation: string | null = null;
    if (cyclePhase === 'menstrual') {
      cycleAdjustedRecommendation = 'Fase menstrual: conviene movilidad o fuerza liviana con foco en recuperacion.';
    } else if (cyclePhase === 'luteal') {
      cycleAdjustedRecommendation = 'Fase lutea: prioriza carga moderada y volumen estable para sostener adherencia.';
    } else if (cyclePhase === 'follicular') {
      cycleAdjustedRecommendation = 'Fase folicular: buena ventana para progresar intensidad y volumen.';
    } else if (cyclePhase === 'ovulation') {
      cycleAdjustedRecommendation = 'Fase ovulatoria: energia alta, ideal para sesiones exigentes y PRs controlados.';
    }

    const level: WorkoutFatigueRisk['level'] = riskScore >= 5 ? 'high' : riskScore >= 3 ? 'moderate' : 'low';
    const message =
      level === 'high'
        ? 'Fatiga acumulada alta. Hoy conviene un dia de recuperacion activa.'
        : level === 'moderate'
          ? 'Hay senales de fatiga. Baja volumen/intensidad para sostener progreso.'
          : null;

    return {
      level,
      message,
      reasons,
      recommendRecoveryDay: level === 'high',
      consecutiveTrainingDays,
      avgSleepHoursLast3,
      avgStressLast3,
      cyclePhase,
      cycleAdjustedRecommendation,
      cycleLoadProfile,
    };
  }

  useEffect(() => {
    void Promise.all([fetchRoutines(), fetchExercises(), fetchHistory(), fetchRecoverySignals()]);
  }, [fetchExercises, fetchHistory, fetchRecoverySignals, fetchRoutines]);

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
    getFatigueRisk,
    fatigueRisk: getFatigueRisk(),
    refresh: () => Promise.all([fetchRoutines(), fetchHistory(), fetchRecoverySignals()]),
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
