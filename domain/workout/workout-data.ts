import {
  GENERATED_WORKOUT_EXERCISES,
  GENERATED_WORKOUT_FAVORITES,
  GENERATED_WORKOUT_PROGRAMS,
  GENERATED_WORKOUT_ROUTINES,
  GENERATED_WORKOUT_TEMPLATE_ROUTINES,
  WORKOUT_CATALOG_VERSION,
} from '@/lib/workout-catalog.generated';
import {
  type Exercise,
  type Routine,
  type WorkoutHistory,
  type WorkoutProgram,
  type WorkoutSessionDetail,
  type WorkoutSettings,
} from '@/lib/workout-types';

const ROUTINE_NAME_OVERRIDES: Record<string, string> = {
  foundation_full_body_a: 'Cuerpo completo · Día 1',
  foundation_full_body_b: 'Cuerpo completo · Día 2',
  foundation_full_body_c: 'Cuerpo completo · Día 3',
  upper_strength_a: 'Tren superior · Fuerza',
  lower_strength_a: 'Tren inferior · Fuerza',
  glutes_focus: 'Glúteos · Foco',
  home_bodyweight: 'En casa · Sin equipo',
  express_cardio_core: 'Cardio + core · Express',
  mobility_reset: 'Movilidad · Reset',
  template_home_reset: 'Template · Casa reset',
  template_glutes_base: 'Template · Glúteos base',
  template_mobility_day: 'Template · Movilidad',
};

const SESSION_NAME_OVERRIDES: Record<string, string> = {
  'Base total A': 'Cuerpo completo · Día 1',
  'Base total B': 'Cuerpo completo · Día 2',
  'Base total C': 'Cuerpo completo · Día 3',
  'Upper fuerza A': 'Tren superior · Fuerza',
  'Lower fuerza A': 'Tren inferior · Fuerza',
  'Glúteos foco': 'Glúteos · Foco',
  ['Gl\u00C3\u00BAteos foco']: 'Glúteos · Foco',
  'Casa sin equipo': 'En casa · Sin equipo',
  'Express cardio + core': 'Cardio + core · Express',
  'Reset de movilidad': 'Movilidad · Reset',
};

export function getWorkoutDisplayName(name: string | null | undefined) {
  if (!name) return '';
  return SESSION_NAME_OVERRIDES[name] ?? name;
}

function applyRoutineNameOverride(routine: Routine): Routine {
  const key = routine.slug ?? routine.id;
  const nextName = ROUTINE_NAME_OVERRIDES[key];
  if (!nextName || nextName === routine.name) return routine;
  return { ...routine, name: nextName };
}

function makeIso(daysAgo = 0, hours = 18, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function getExercise(name: string) {
  return GENERATED_WORKOUT_EXERCISES.find((item) => item.name === name) ?? null;
}

function getRoutineId(slug: string) {
  return GENERATED_WORKOUT_ROUTINES.find((item) => item.slug === slug)?.id ?? null;
}

function buildBreakdown(sets: WorkoutSessionDetail['sets']) {
  const byExercise = new Map<string, { exercise_id: string; exercise_name: string; sets: number; total_volume_kg: number; prs: number }>();
  sets.forEach((set) => {
    const current = byExercise.get(set.exercise_id) ?? {
      exercise_id: set.exercise_id,
      exercise_name: set.exercise_name,
      sets: 0,
      total_volume_kg: 0,
      prs: 0,
    };
    current.sets += 1;
    current.total_volume_kg += set.weight_kg * set.reps;
    current.prs += set.is_pr ? 1 : 0;
    byExercise.set(set.exercise_id, current);
  });
  return [...byExercise.values()];
}

export const WORKOUT_SEED_EXERCISES: Exercise[] = GENERATED_WORKOUT_EXERCISES;
export const WORKOUT_SEED_ROUTINES: Routine[] = GENERATED_WORKOUT_ROUTINES.map(applyRoutineNameOverride);
export const WORKOUT_TEMPLATE_ROUTINES: Routine[] = GENERATED_WORKOUT_TEMPLATE_ROUTINES.map(applyRoutineNameOverride);
export const WORKOUT_SEED_PROGRAMS: WorkoutProgram[] = GENERATED_WORKOUT_PROGRAMS;
export const WORKOUT_SEED_FAVORITES: string[] = GENERATED_WORKOUT_FAVORITES;
export const WORKOUT_SEED_VERSION = WORKOUT_CATALOG_VERSION;

export const WORKOUT_DEFAULT_SETTINGS: WorkoutSettings = {
  defaultRestSeconds: 90,
  autoStartRest: true,
  keepScreenAwake: true,
  hapticsEnabled: true,
  showHints: true,
  restAlertMode: 'soft',
  units: 'kg',
  restPresets: [45, 60, 90, 120],
};

const seedDetails: WorkoutSessionDetail[] = [
  {
    session: {
      id: 'session_seed_1',
      name: getWorkoutDisplayName('Base total A'),
      started_at: makeIso(5, 18, 10),
      ended_at: makeIso(5, 19, 2),
      total_volume_kg: 3705,
      sets_count: 14,
      muscles_worked: ['Piernas', 'Pecho', 'Espalda', 'Core'],
      routine_id: getRoutineId('foundation_full_body_a'),
      total_reps: 89,
      estimated_calories: 332,
      duration_min: 52,
      notes: 'Sesión prolija. La banca quedó muy estable y la sentadilla se sintió más sólida.',
    },
    durationMin: 52,
    sets: [
      { exercise_id: getExercise('Sentadilla con barra')!.id, exercise_name: 'Sentadilla con barra', set_number: 1, reps: 6, weight_kg: 60, is_pr: false, completed_at: makeIso(5, 18, 16) },
      { exercise_id: getExercise('Sentadilla con barra')!.id, exercise_name: 'Sentadilla con barra', set_number: 2, reps: 6, weight_kg: 62.5, is_pr: true, completed_at: makeIso(5, 18, 20) },
      { exercise_id: getExercise('Press de banca con barra')!.id, exercise_name: 'Press de banca con barra', set_number: 1, reps: 6, weight_kg: 45, is_pr: false, completed_at: makeIso(5, 18, 31) },
      { exercise_id: getExercise('Press de banca con barra')!.id, exercise_name: 'Press de banca con barra', set_number: 2, reps: 6, weight_kg: 47.5, is_pr: true, completed_at: makeIso(5, 18, 35) },
      { exercise_id: getExercise('Remo con barra')!.id, exercise_name: 'Remo con barra', set_number: 1, reps: 8, weight_kg: 42.5, is_pr: false, completed_at: makeIso(5, 18, 44) },
      { exercise_id: getExercise('Remo con barra')!.id, exercise_name: 'Remo con barra', set_number: 2, reps: 8, weight_kg: 45, is_pr: true, completed_at: makeIso(5, 18, 48) },
      { exercise_id: getExercise('Plancha frontal')!.id, exercise_name: 'Plancha frontal', set_number: 1, reps: 45, weight_kg: 0, is_pr: false, completed_at: makeIso(5, 18, 56) },
    ],
    exerciseBreakdown: [],
  },
  {
    session: {
      id: 'session_seed_2',
      name: getWorkoutDisplayName('Upper fuerza A'),
      started_at: makeIso(3, 19, 0),
      ended_at: makeIso(3, 19, 56),
      total_volume_kg: 2985,
      sets_count: 18,
      muscles_worked: ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps'],
      routine_id: getRoutineId('upper_strength_a'),
      total_reps: 102,
      estimated_calories: 341,
      duration_min: 56,
      notes: 'Dominadas consistentes y buen cierre de hombro con face pull.',
    },
    durationMin: 56,
    sets: [
      { exercise_id: getExercise('Press de banca con barra')!.id, exercise_name: 'Press de banca con barra', set_number: 1, reps: 5, weight_kg: 50, is_pr: false, completed_at: makeIso(3, 19, 8) },
      { exercise_id: getExercise('Dominada pronada')!.id, exercise_name: 'Dominada pronada', set_number: 1, reps: 6, weight_kg: 0, is_pr: false, completed_at: makeIso(3, 19, 16) },
      { exercise_id: getExercise('Press militar con barra')!.id, exercise_name: 'Press militar con barra', set_number: 1, reps: 6, weight_kg: 32.5, is_pr: true, completed_at: makeIso(3, 19, 25) },
      { exercise_id: getExercise('Face pull en polea alta')!.id, exercise_name: 'Face pull en polea alta', set_number: 1, reps: 15, weight_kg: 18, is_pr: false, completed_at: makeIso(3, 19, 35) },
      { exercise_id: getExercise('Curl de bíceps con barra EZ')!.id, exercise_name: 'Curl de bíceps con barra EZ', set_number: 1, reps: 10, weight_kg: 20, is_pr: false, completed_at: makeIso(3, 19, 42) },
      { exercise_id: getExercise('Pushdown de tríceps con cuerda')!.id, exercise_name: 'Pushdown de tríceps con cuerda', set_number: 1, reps: 12, weight_kg: 20, is_pr: false, completed_at: makeIso(3, 19, 48) },
    ],
    exerciseBreakdown: [],
  },
  {
    session: {
      id: 'session_seed_3',
      name: getWorkoutDisplayName('Glúteos foco'),
      started_at: makeIso(1, 7, 12),
      ended_at: makeIso(1, 7, 58),
      total_volume_kg: 4210,
      sets_count: 16,
      muscles_worked: ['Glúteos', 'Piernas', 'Core'],
      routine_id: getRoutineId('glutes_focus'),
      total_reps: 98,
      estimated_calories: 318,
      duration_min: 46,
      notes: 'Hip thrust muy firme. La cadera llegó fresca y el cierre fue prolijo.',
    },
    durationMin: 46,
    sets: [
      { exercise_id: getExercise('Hip thrust con barra')!.id, exercise_name: 'Hip thrust con barra', set_number: 1, reps: 8, weight_kg: 90, is_pr: false, completed_at: makeIso(1, 7, 19) },
      { exercise_id: getExercise('Hip thrust con barra')!.id, exercise_name: 'Hip thrust con barra', set_number: 2, reps: 8, weight_kg: 95, is_pr: true, completed_at: makeIso(1, 7, 23) },
      { exercise_id: getExercise('Patada de glúteo en polea')!.id, exercise_name: 'Patada de glúteo en polea', set_number: 1, reps: 15, weight_kg: 10, is_pr: false, completed_at: makeIso(1, 7, 33) },
      { exercise_id: getExercise('Monster walk con banda')!.id, exercise_name: 'Monster walk con banda', set_number: 1, reps: 20, weight_kg: 0, is_pr: false, completed_at: makeIso(1, 7, 40) },
      { exercise_id: getExercise('Abducción de cadera en máquina')!.id, exercise_name: 'Abducción de cadera en máquina', set_number: 1, reps: 18, weight_kg: 28, is_pr: false, completed_at: makeIso(1, 7, 47) },
      { exercise_id: getExercise('Puente de glúteo unilateral')!.id, exercise_name: 'Puente de glúteo unilateral', set_number: 1, reps: 12, weight_kg: 0, is_pr: false, completed_at: makeIso(1, 7, 53) },
    ],
    exerciseBreakdown: [],
  },
];

seedDetails.forEach((entry) => {
  entry.exerciseBreakdown = buildBreakdown(entry.sets);
});

export const WORKOUT_SEED_HISTORY: WorkoutHistory[] = seedDetails.map((entry) => entry.session!).filter(Boolean);
export const WORKOUT_SEED_DETAILS: Record<string, WorkoutSessionDetail> = Object.fromEntries(
  seedDetails.map((entry) => [entry.session!.id, entry]),
);

