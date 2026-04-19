import type { Routine, WorkoutHistory, WorkoutProgram } from '@/lib/workout-types';

export type WorkoutPlanSource = 'scheduled' | 'sequence' | 'suggested' | 'recovery' | 'none';

export interface WorkoutPlanSnapshot {
  dayLabel: string;
  todayRoutine: Routine | null;
  nextRoutine: Routine | null;
  completedToday: boolean;
  isRestDay: boolean;
  source: WorkoutPlanSource;
}

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'] as const;
const SCHEDULE_ALIASES: Record<string, string> = {
  domingo: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miercoles',
  miércoles: 'Miercoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sabado',
  sábado: 'Sabado',
  flexible: 'Flexible',
};

function isoDay(value: string) {
  return value.slice(0, 10);
}

function normalizeScheduleDay(value?: string | null) {
  if (!value) return null;
  return SCHEDULE_ALIASES[value.trim().toLowerCase()] ?? null;
}

function weekdayDistance(current: string, target: string) {
  const currentIndex = DAY_LABELS.indexOf(current as (typeof DAY_LABELS)[number]);
  const targetIndex = DAY_LABELS.indexOf(target as (typeof DAY_LABELS)[number]);
  if (currentIndex < 0 || targetIndex < 0) return Number.POSITIVE_INFINITY;
  const delta = (targetIndex - currentIndex + 7) % 7;
  return delta === 0 ? 7 : delta;
}

export function getWorkoutPlanSnapshot({
  date = new Date(),
  routines,
  history,
  activeProgram,
  fallbackRoutine = null,
}: {
  date?: Date;
  routines: Routine[];
  history: WorkoutHistory[];
  activeProgram: WorkoutProgram | null;
  fallbackRoutine?: Routine | null;
}): WorkoutPlanSnapshot {
  const dayLabel = DAY_LABELS[date.getDay()] ?? 'Hoy';
  const todayKey = date.toISOString().slice(0, 10);
  const completedToday = history.some((entry) => isoDay(entry.started_at) === todayKey);

  if (!activeProgram?.routine_ids?.length) {
    return {
      dayLabel,
      todayRoutine: completedToday ? null : fallbackRoutine,
      nextRoutine: fallbackRoutine,
      completedToday,
      isRestDay: !fallbackRoutine,
      source: fallbackRoutine ? 'suggested' : 'none',
    };
  }

  const programRoutines = activeProgram.routine_ids
    .map((routineId) => routines.find((item) => item.id === routineId) ?? null)
    .filter((routine): routine is Routine => Boolean(routine));

  if (!programRoutines.length) {
    return {
      dayLabel,
      todayRoutine: completedToday ? null : fallbackRoutine,
      nextRoutine: fallbackRoutine,
      completedToday,
      isRestDay: !fallbackRoutine,
      source: fallbackRoutine ? 'suggested' : 'none',
    };
  }

  const scheduledRoutines = programRoutines.filter((routine) => {
    const normalized = normalizeScheduleDay(routine.schedule_day);
    return normalized && normalized !== 'Flexible';
  });

  const exactToday = programRoutines.find(
    (routine) => normalizeScheduleDay(routine.schedule_day) === dayLabel,
  ) ?? null;

  if (exactToday) {
    const nextRoutine = scheduledRoutines.length
      ? [...scheduledRoutines]
          .filter((routine) => routine.id !== exactToday.id)
          .sort((left, right) => {
            const leftDistance = weekdayDistance(
              dayLabel,
              normalizeScheduleDay(left.schedule_day) ?? dayLabel,
            );
            const rightDistance = weekdayDistance(
              dayLabel,
              normalizeScheduleDay(right.schedule_day) ?? dayLabel,
            );
            return leftDistance - rightDistance;
          })[0] ?? exactToday
      : programRoutines[1] ?? programRoutines[0] ?? null;

    return {
      dayLabel,
      todayRoutine: completedToday ? null : exactToday,
      nextRoutine,
      completedToday,
      isRestDay: false,
      source: 'scheduled',
    };
  }

  if (scheduledRoutines.length) {
    const nextRoutine = [...scheduledRoutines]
      .sort((left, right) => {
        const leftDistance = weekdayDistance(
          dayLabel,
          normalizeScheduleDay(left.schedule_day) ?? dayLabel,
        );
        const rightDistance = weekdayDistance(
          dayLabel,
          normalizeScheduleDay(right.schedule_day) ?? dayLabel,
        );
        return leftDistance - rightDistance;
      })[0] ?? null;

    return {
      dayLabel,
      todayRoutine: null,
      nextRoutine,
      completedToday,
      isRestDay: !completedToday,
      source: completedToday ? 'scheduled' : 'recovery',
    };
  }

  const weekdayIndex = ((date.getDay() + 6) % 7);
  const sequenceRoutine = programRoutines[weekdayIndex % programRoutines.length] ?? null;
  const nextRoutine = programRoutines[(weekdayIndex + 1) % programRoutines.length] ?? sequenceRoutine;

  return {
    dayLabel,
    todayRoutine: completedToday ? null : sequenceRoutine,
    nextRoutine,
    completedToday,
    isRestDay: !sequenceRoutine,
    source: sequenceRoutine ? 'sequence' : 'none',
  };
}
