export function formatWorkoutSessionTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(
    safeSeconds % 60,
  ).padStart(2, '0')}`;
}

export function parseWorkoutSetInput(repsValue: string, weightValue: string) {
  const reps = parseInt(repsValue, 10);
  const weight = parseFloat(weightValue.replace(',', '.'));

  return {
    reps,
    weight,
    isValid: Number.isFinite(reps) && Number.isFinite(weight) && reps >= 1 && weight >= 0,
  };
}

export function adjustRepsValue(value: string, delta: number) {
  const current = parseInt(value, 10);
  const safeCurrent = Number.isFinite(current) ? current : 1;
  return String(Math.max(1, safeCurrent + delta));
}

export function adjustWeightValue(value: string, delta: number) {
  const current = parseFloat(value.replace(',', '.'));
  const safeCurrent = Number.isFinite(current) ? current : 0;
  return Math.max(0, safeCurrent + delta).toFixed(1);
}

export interface WorkoutPersonalRecordSnapshot {
  maxWeight: number;
  maxReps: number;
  maxVolume?: number;
}

export interface WorkoutWarmupMove {
  title: string;
  seconds: number;
}

export interface WorkoutWarmupPlan {
  label: string;
  totalMinutes: number;
  moves: WorkoutWarmupMove[];
}

export interface WorkoutLoadSuggestionInput {
  plannedWeightKg?: number | null;
  repsTarget?: number | null;
  exerciseType?: string | null;
  personalRecord?: WorkoutPersonalRecordSnapshot | null;
}

export interface WorkoutLoadSuggestion {
  recommendedWeightKg: number | null;
  progressionWeightKg: number | null;
  helperText: string;
  strategy: 'bodyweight' | 'planned' | 'progression' | 'baseline';
}

function roundWeight(value: number, step = 2.5) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value / step) * step;
}

export function getWorkoutLoadSuggestion({
  plannedWeightKg,
  repsTarget,
  exerciseType,
  personalRecord,
}: WorkoutLoadSuggestionInput): WorkoutLoadSuggestion {
  if (exerciseType === 'bodyweight' || exerciseType === 'cardio') {
    return {
      recommendedWeightKg: 0,
      progressionWeightKg: null,
      helperText: 'Este ejercicio se apoya en ritmo, técnica o peso corporal.',
      strategy: 'bodyweight',
    };
  }

  const prWeight = personalRecord?.maxWeight ?? 0;
  const targetReps = repsTarget ?? 8;

  if (typeof plannedWeightKg === 'number' && plannedWeightKg > 0) {
    const recommendedWeightKg = roundWeight(plannedWeightKg);
    const progressionWeightKg =
      prWeight > recommendedWeightKg
        ?  roundWeight(Math.min(prWeight, recommendedWeightKg + 2.5))
        : roundWeight(recommendedWeightKg + 2.5);

    return {
      recommendedWeightKg,
      progressionWeightKg:
        progressionWeightKg > recommendedWeightKg ? progressionWeightKg : null,
      helperText:
        prWeight > 0
          ?  `Plan de hoy ${recommendedWeightKg.toFixed(1)} kg. Tu mejor peso fue ${prWeight.toFixed(1)} kg.`
          : `Empieza con el peso objetivo del plan y ajusta según técnica.`,
      strategy: prWeight > recommendedWeightKg ? 'progression' : 'planned',
    };
  }

  if (prWeight > 0) {
    const intensity =
      targetReps >= 12 ? 0.78 :
      targetReps >= 9 ? 0.84 :
      targetReps >= 6 ? 0.9 :
      0.94;
    const recommendedWeightKg = roundWeight(prWeight * intensity);
    const progressionWeightKg = roundWeight(recommendedWeightKg + 2.5);

    return {
      recommendedWeightKg,
      progressionWeightKg:
        progressionWeightKg > recommendedWeightKg ? progressionWeightKg : null,
      helperText: `Basado en tu mejor peso registrado de ${prWeight.toFixed(1)} kg.`,
      strategy: 'progression',
    };
  }

  return {
    recommendedWeightKg: null,
    progressionWeightKg: null,
    helperText: 'Arranca conservador, cuida la técnica y ajusta después del primer set.',
    strategy: 'baseline',
  };
}

export function getWorkoutPrHighlights(
  weightKg: number,
  reps: number,
  personalRecord?: WorkoutPersonalRecordSnapshot | null,
) {
  const highlights: string[] = [];
  const previousMaxWeight = personalRecord?.maxWeight ?? 0;
  const previousMaxReps = personalRecord?.maxReps ?? 0;
  const previousMaxVolume = personalRecord?.maxVolume ?? 0;
  const nextVolume = weightKg * reps;

  if (weightKg > previousMaxWeight) {
    highlights.push(`Peso ${weightKg.toFixed(1)} kg`);
  }
  if (reps > previousMaxReps) {
    highlights.push(`Reps ${reps}`);
  }
  if (nextVolume > previousMaxVolume) {
    highlights.push(`Volumen ${Math.round(nextVolume)} kg`);
  }

  return highlights;
}

function inferWarmupBucket(exerciseNames: string[]) {
  const haystack = exerciseNames.join(' ').toLowerCase();
  if (/(sentadilla|prensa|zancada|peso muerto|glute|hip thrust|curl femoral|cuadr)/.test(haystack)) {
    return 'lower';
  }
  if (/(press|banca|hombro|dominada|remo|jalón|tricep|bicep|pecho|espalda)/.test(haystack)) {
    return 'upper';
  }
  return 'full';
}

export function getWorkoutWarmupPlan(exerciseNames: string[]): WorkoutWarmupPlan {
  const bucket = inferWarmupBucket(exerciseNames);

  if (bucket === 'lower') {
    return {
      label: '5 minutos · activar cadera y tobillo',
      totalMinutes: 5,
      moves: [
        { title: 'Movilidad de cadera', seconds: 60 },
        { title: 'Sentadilla al aire con pausa', seconds: 60 },
        { title: 'Activacion de gluteos', seconds: 60 },
      ],
    };
  }

  if (bucket === 'upper') {
    return {
      label: '5 minutos · abrir hombros y espalda',
      totalMinutes: 5,
      moves: [
        { title: 'Movilidad de hombros', seconds: 60 },
        { title: 'Cat-cow', seconds: 60 },
        { title: 'Activacion escapular', seconds: 60 },
      ],
    };
  }

  return {
    label: '5 minutos · entrar en ritmo',
    totalMinutes: 5,
    moves: [
      { title: 'Movilidad general', seconds: 60 },
      { title: 'Bisagra de cadera suave', seconds: 60 },
      { title: 'Respiracion y activacion de core', seconds: 60 },
    ],
  };
}

export function getWorkoutExerciseMainGroup(muscleGroup?: string | null) {
  const value = (muscleGroup ?? '').toLowerCase();
  if (/(pecho)/.test(value)) return 'Pecho';
  if (/(espalda)/.test(value)) return 'Espalda';
  if (/(hombro)/.test(value)) return 'Hombros';
  if (/(bicep|tricep|brazo)/.test(value)) return 'Brazos';
  if (/(cuad|isquio|glute|pantorr|pierna)/.test(value)) return 'Piernas';
  if (/(core|ab|oblic)/.test(value)) return 'Core';
  return 'Todos';
}

export function getWorkoutExerciseSubtype(name?: string | null) {
  const value = (name ?? '').toLowerCase();
  if (/(press|empuje)/.test(value)) return 'Press';
  if (/(remo|jalón|dominada|pull)/.test(value)) return 'Traccion';
  if (/(apertura|fly)/.test(value)) return 'Apertura';
  if (/(fondo)/.test(value)) return 'Fondos';
  if (/(curl)/.test(value)) return 'Curl';
  if (/(extension|pushdown)/.test(value)) return 'Extension';
  if (/(sentadilla|prensa|zancada)/.test(value)) return 'Rodilla';
  if (/(peso muerto|bisagra|hip thrust|glute bridge)/.test(value)) return 'Bisagra';
  if (/(plancha|core|ab|oblic)/.test(value)) return 'Estabilidad';
  return 'Todos';
}
