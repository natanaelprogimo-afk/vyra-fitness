import type { FemalePhase } from '@/lib/female-phase';
import type { UserProfile } from '@/types/user';

export type WorkoutCycleLoadProfile = {
  intensityCapRpe: number;
  volumeMultiplier: number;
  stepGoalAdjustmentPct: number;
  preferredFocus: string;
  avoidFocus: string;
};

export type WorkoutCycleGuidance = {
  phase: FemalePhase;
  label: string;
  cardColor: string;
  recommendation: string;
  sessionAdjustment: string;
  recoveryBias: boolean;
  performanceBias: boolean;
  preferredDurationMax: number;
  preferredKeywords: string[];
  avoidKeywords: string[];
  hydrationBoostMl: number;
  loadProfile: WorkoutCycleLoadProfile;
};

export type WorkoutCycleContext = WorkoutCycleGuidance & {
  dayInCycle: number;
  cycleLength: number;
};

type ProfileLike =
  | Pick<UserProfile, 'female_health_enabled' | 'female_cycle_length' | 'female_last_period_date'>
  | null
  | undefined;

const PHASE_GUIDANCE: Record<FemalePhase, WorkoutCycleGuidance> = {
  menstrual: {
    phase: 'menstrual',
    label: 'Fase menstrual',
    cardColor: '#F87171',
    recommendation: 'Hoy conviene bajar intensidad, alargar descansos y quedarte con tecnica limpia.',
    sessionAdjustment: 'conviene bajar intensidad, alargar descansos y quedarte con tecnica limpia',
    recoveryBias: true,
    performanceBias: false,
    preferredDurationMax: 40,
    preferredKeywords: ['movilidad', 'reset', 'recovery', 'recovery day', 'home', 'casa', 'core', 'express'],
    avoidKeywords: ['fuerza', 'strength', 'power', 'max', 'heavy', 'lower strength'],
    hydrationBoostMl: 300,
    loadProfile: {
      intensityCapRpe: 7,
      volumeMultiplier: 0.8,
      stepGoalAdjustmentPct: -15,
      preferredFocus: 'Movilidad, tecnica y recuperacion',
      avoidFocus: 'Fallo, saltos duros o volumen acumulado',
    },
  },
  follicular: {
    phase: 'follicular',
    label: 'Fase folicular',
    cardColor: '#D8B4FE',
    recommendation: 'Hoy suele haber buen margen para progresar carga o sumar una serie util si te sientes bien.',
    sessionAdjustment: 'suele haber buen margen para empujar carga o sumar una serie mas si te sientes bien',
    recoveryBias: false,
    performanceBias: true,
    preferredDurationMax: 60,
    preferredKeywords: ['full body', 'cuerpo completo', 'hypertrophy', 'hipertrofia', 'strength', 'fuerza', 'upper', 'lower'],
    avoidKeywords: ['reset', 'recovery day'],
    hydrationBoostMl: 0,
    loadProfile: {
      intensityCapRpe: 8.5,
      volumeMultiplier: 1.05,
      stepGoalAdjustmentPct: 10,
      preferredFocus: 'Progresion y volumen util',
      avoidFocus: 'Sesiones caoticas o sin estructura',
    },
  },
  ovulation: {
    phase: 'ovulation',
    label: 'Fase ovulatoria',
    cardColor: '#EC4899',
    recommendation: 'Esta suele ser una buena ventana para la sesion fuerte de la semana si el resto acompana.',
    sessionAdjustment: 'esta suele ser tu mejor ventana para la sesion fuerte de la semana si el resto acompana',
    recoveryBias: false,
    performanceBias: true,
    preferredDurationMax: 70,
    preferredKeywords: ['strength', 'fuerza', 'power', 'potencia', 'upper', 'lower', 'full body', 'cuerpo completo'],
    avoidKeywords: ['reset', 'recovery day', 'mobility', 'movilidad'],
    hydrationBoostMl: 150,
    loadProfile: {
      intensityCapRpe: 9,
      volumeMultiplier: 1.1,
      stepGoalAdjustmentPct: 12,
      preferredFocus: 'Fuerza, potencia e intensidad alta',
      avoidFocus: 'Fatiga acumulada sin control',
    },
  },
  luteal: {
    phase: 'luteal',
    label: 'Fase lutea',
    cardColor: '#A855F7',
    recommendation: 'Hoy sirve mas sostener ritmo, no irte al fallo temprano y dejar un poco mas de recuperacion.',
    sessionAdjustment: 'sirve mas sostener ritmo, no irte al fallo temprano y dejar un poco mas de recuperacion',
    recoveryBias: true,
    performanceBias: false,
    preferredDurationMax: 50,
    preferredKeywords: ['home', 'casa', 'gluteos', 'gluteo', 'full body', 'cuerpo completo', 'hypertrophy', 'hipertrofia'],
    avoidKeywords: ['power', 'potencia', 'max', 'heavy'],
    hydrationBoostMl: 250,
    loadProfile: {
      intensityCapRpe: 8,
      volumeMultiplier: 0.9,
      stepGoalAdjustmentPct: -5,
      preferredFocus: 'Consistencia y control de fatiga',
      avoidFocus: 'Fallo temprano o maratones de volumen',
    },
  },
};

function clampCycleLength(value: number | null | undefined) {
  if (!Number.isFinite(value)) return 28;
  return Math.max(21, Math.min(35, Math.round(value as number)));
}

function getCycleDay(lastPeriodDate: string, cycleLength: number, now: Date) {
  const start = new Date(`${lastPeriodDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 0;
  const diffDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
  return diffDays % cycleLength;
}

function resolvePhase(dayInCycle: number): FemalePhase {
  if (dayInCycle < 5) return 'menstrual';
  if (dayInCycle < 13) return 'follicular';
  if (dayInCycle < 16) return 'ovulation';
  return 'luteal';
}

export function getWorkoutCycleGuidance(phase: FemalePhase): WorkoutCycleGuidance {
  return PHASE_GUIDANCE[phase];
}

export function getWorkoutCycleContext(profile: ProfileLike, now = new Date()): WorkoutCycleContext | null {
  if (!profile?.female_health_enabled || !profile.female_last_period_date) {
    return null;
  }

  const cycleLength = clampCycleLength(profile.female_cycle_length);
  const dayInCycle = getCycleDay(profile.female_last_period_date, cycleLength, now);
  const phase = resolvePhase(dayInCycle);
  const guidance = getWorkoutCycleGuidance(phase);

  return {
    ...guidance,
    cycleLength,
    dayInCycle,
  };
}
