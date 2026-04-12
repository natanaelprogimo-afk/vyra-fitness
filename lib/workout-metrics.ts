import type { UserProfile } from '@/types/user';
import type { ActiveSession, Exercise, Routine, WorkoutHistory, WorkoutProgram, WorkoutSessionDetail } from '@/lib/workout-types';

function getProfileWeightKg(profile: UserProfile | null | undefined) {
  return profile?.weight_current_kg ?? profile?.weight_start_kg ?? 70;
}

function getProfileAge(profile: UserProfile | null | undefined) {
  if (typeof profile?.birth_year === 'number') {
    return Math.max(16, new Date().getFullYear() - profile.birth_year);
  }
  if (profile?.dob) {
    const date = new Date(profile.dob);
    if (!Number.isNaN(date.getTime())) {
      return Math.max(16, new Date().getFullYear() - date.getUTCFullYear());
    }
  }
  return 30;
}

function getProfileSexFactor(profile: UserProfile | null | undefined) {
  if (profile?.gender === 'male') return 1.04;
  if (profile?.gender === 'female') return 0.96;
  return 1;
}

function getExerciseMet(exercise: Exercise | null | undefined) {
  if (!exercise) return 5.6;
  const type = (exercise.type ?? '').toLowerCase();
  const pattern = (exercise.movement_pattern ?? '').toLowerCase();
  const muscle = exercise.muscle_group.toLowerCase();

  if (type === 'cardio' || pattern.includes('run') || pattern.includes('bike') || pattern.includes('row')) return 7.2;
  if (type === 'mobility' || type === 'stretching' || type === 'yoga' || type === 'pilates') return 3.1;
  if (muscle.includes('pierna') || muscle.includes('gl') || pattern.includes('squat') || pattern.includes('hinge')) return 6.4;
  if (type === 'bodyweight') return 5.3;
  return 5.8;
}

function getRoutineIntensityFactor(routine: Routine) {
  const split = (routine.split_tag ?? '').toLowerCase();
  if (split.includes('lower') || split.includes('legs')) return 1.08;
  if (split.includes('full')) return 1.06;
  if (split.includes('cardio')) return 1.1;
  return 1;
}

export function estimateRoutineCalories(
  routine: Routine | null | undefined,
  exercises: Exercise[],
  profile: UserProfile | null | undefined,
) {
  if (!routine) {
    return { total: 0, perMinute: 0, minutes: 0 };
  }

  const minutes = Math.max(20, routine.estimated_duration_min ?? routine.exercises.length * 12);
  const weightKg = getProfileWeightKg(profile);
  const age = getProfileAge(profile);
  const sexFactor = getProfileSexFactor(profile);
  const avgMet =
    routine.exercises.length > 0
      ? routine.exercises.reduce((sum, item) => {
          const exercise = exercises.find((entry) => entry.id === item.exercise_id) ?? null;
          return sum + getExerciseMet(exercise);
        }, 0) / routine.exercises.length
      : 5.6;
  const setVolume = routine.exercises.reduce((sum, item) => sum + item.sets_target, 0);
  const densityFactor = setVolume >= 20 ? 1.06 : setVolume >= 14 ? 1.03 : 1;
  const ageFactor = age >= 45 ? 0.97 : 1;
  const routineFactor = getRoutineIntensityFactor(routine);
  const total = Math.round(avgMet * weightKg * (minutes / 60) * sexFactor * ageFactor * densityFactor * routineFactor);

  return {
    total,
    perMinute: Number((total / minutes).toFixed(1)),
    minutes,
  };
}

export function estimateProgramCalories(
  program: WorkoutProgram,
  routines: Routine[],
  exercises: Exercise[],
  profile: UserProfile | null | undefined,
) {
  const linkedRoutines = routines.filter((routine) => program.routine_ids.includes(routine.id));
  const sessionEstimate =
    linkedRoutines.length > 0
      ? Math.round(
          linkedRoutines.reduce((sum, routine) => sum + estimateRoutineCalories(routine, exercises, profile).total, 0) /
            linkedRoutines.length,
        )
      : Math.round((program.estimated_session_min ?? 45) * 6);

  const totalSessions = Math.max(1, program.days_per_week * program.duration_weeks);
  const total = sessionEstimate * totalSessions;
  const weekly = Math.round(total / Math.max(1, program.duration_weeks));

  return {
    perSession: sessionEstimate,
    total,
    weekly,
  };
}

export function getActiveSessionProgress(activeSession: ActiveSession | null | undefined) {
  if (!activeSession) {
    return { completedSets: 0, totalSets: 0, percent: 0 };
  }

  const totalSets = activeSession.exercises.reduce((sum, exercise) => sum + Math.max(0, exercise.sets_target), 0);
  const completedSets = activeSession.sets.length;
  const percent = totalSets > 0 ? Math.min(100, Math.round((completedSets / totalSets) * 100)) : 0;

  return { completedSets, totalSets, percent };
}

export function estimateActiveSessionCalories(
  activeSession: ActiveSession | null | undefined,
  routine: Routine | null | undefined,
  exercises: Exercise[],
  profile: UserProfile | null | undefined,
) {
  if (!activeSession) {
    return { burned: 0, remaining: 0, target: 0 };
  }

  const target =
    estimateRoutineCalories(routine, exercises, profile).total ||
    Math.max(60, Math.round(((Date.now() - activeSession.startedAt.getTime()) / 60000) * 6));
  const progress = getActiveSessionProgress(activeSession);
  const elapsedMin = Math.max(1, Math.round((Date.now() - activeSession.startedAt.getTime()) / 60000));
  const burnedFromProgress = Math.round(target * (progress.percent / 100));
  const minimumByElapsed = Math.round(elapsedMin * 3.8);
  const burned = Math.min(target, Math.max(burnedFromProgress, minimumByElapsed));

  return {
    burned,
    remaining: Math.max(0, target - burned),
    target,
  };
}

export function getRoutineLastSession(routineId: string, history: WorkoutHistory[]) {
  return history.find((entry) => entry.routine_id === routineId) ?? null;
}

export function getRoutineWeeklyCompletions(routineId: string, history: WorkoutHistory[]) {
  const limit = new Date();
  limit.setDate(limit.getDate() - 6);
  limit.setHours(0, 0, 0, 0);
  return history.filter((entry) => entry.routine_id === routineId && new Date(entry.started_at).getTime() >= limit.getTime()).length;
}

export function getWorkoutDoneToday(history: WorkoutHistory[]) {
  const today = new Date().toISOString().slice(0, 10);
  return history.some((entry) => entry.started_at.slice(0, 10) === today);
}

export function getSessionPrCount(detail: WorkoutSessionDetail | null | undefined) {
  if (!detail) return 0;
  return detail.exerciseBreakdown.reduce((sum, item) => sum + item.prs, 0);
}

export function getSessionKind(name: string, splitTag?: string | null) {
  const value = `${splitTag ?? ''} ${name}`.toLowerCase();
  if (value.includes('cardio') || value.includes('hiit')) return 'cardio';
  if (value.includes('upper') || value.includes('push') || value.includes('pull')) return 'upper';
  if (value.includes('lower') || value.includes('legs') || value.includes('gl')) return 'lower';
  if (value.includes('full')) return 'full';
  return 'strength';
}

