import type { UserGoal, UserProfile } from '@/types/user';

export type NotificationPreferenceKey =
  | 'water'
  | 'sleep'
  | 'mental'
  | 'dailySummary'
  | 'streakAtRisk'
  | 'supplements'
  | 'workout';

type CoachProfileHint = Pick<
  UserProfile,
  | 'goal'
  | 'primary_goal'
  | 'water_goal_ml'
  | 'sleep_goal_hours'
  | 'step_goal'
  | 'fasting_protocol'
  | 'female_health_enabled'
>;

const GOAL_FALLBACK: UserGoal = 'general_health';

function resolveGoal(profile?: Partial<CoachProfileHint> | null): UserGoal {
  const raw = profile?.primary_goal ?? profile?.goal;
  if (
    raw === 'lose_fat' ||
    raw === 'gain_muscle' ||
    raw === 'health' ||
    raw === 'general_health' ||
    raw === 'performance' ||
    raw === 'sport_performance' ||
    raw === 'mental' ||
    raw === 'mental_wellbeing'
  ) {
    return raw;
  }
  return GOAL_FALLBACK;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(1);
}

export const NOTIFICATION_PREFERENCE_COPY: Record<
  NotificationPreferenceKey,
  { emoji: string; label: string; description: string }
> = {
  water: {
    emoji: '\u{1F4A7}',
    label: 'Recordatorios de agua',
    description: 'Hidratacion corta y util segun tu ritmo reciente.',
  },
  mental: {
    emoji: '\u{1F9E0}',
    label: 'Check-in mental',
    description: 'Pulso breve para ordenar foco, energia y ruido.',
  },
  sleep: {
    emoji: '\u{1F634}',
    label: 'Hora de dormir',
    description: 'Cierre suave antes de tu horario objetivo de sueno.',
  },
  dailySummary: {
    emoji: '\u{1F4CA}',
    label: 'Resumen del dia',
    description: 'Lectura corta para cerrar score, retorno y accion siguiente.',
  },
  streakAtRisk: {
    emoji: '\u{1F525}',
    label: 'Racha en riesgo',
    description: 'Ultimo aviso tactico si el dia se esta enfriando.',
  },
  supplements: {
    emoji: '\u{1F48A}',
    label: 'Recordatorios de suplementos',
    description: 'Tomas segun el horario real de tu stack.',
  },
  workout: {
    emoji: '\u{1F3CB}\u{FE0F}',
    label: 'Recordatorio de entreno',
    description: 'Empuje puntual si hace dias que no vuelves al bloque.',
  },
};

const GOAL_PROMPTS: Record<UserGoal, string[]> = {
  lose_fat: [
    'Ordename comida y entreno para perder grasa sin romper el dia',
    'Que me conviene comer hoy para cerrar limpio?',
  ],
  gain_muscle: [
    'Que entreno y comida sostienen mejor este bloque?',
    'Ayudame a cerrar proteina sin meter ruido',
  ],
  health: [
    'Dame una accion simple para sostener el dia',
    'Que modulo me conviene abrir primero hoy?',
  ],
  general_health: [
    'Dame una accion simple para sostener el dia',
    'Que modulo me conviene abrir primero hoy?',
  ],
  performance: [
    'Que me conviene empujar hoy y que conviene bajar?',
    'Ayudame a proteger rendimiento sin pasarme',
  ],
  sport_performance: [
    'Que me conviene empujar hoy y que conviene bajar?',
    'Ayudame a proteger rendimiento sin pasarme',
  ],
  mental: [
    'Necesito bajar ruido y volver al foco',
    'Que me ayuda a ordenar el dia sin saturarme?',
  ],
  mental_wellbeing: [
    'Necesito bajar ruido y volver al foco',
    'Que me ayuda a ordenar el dia sin saturarme?',
  ],
};

export function getCoachSuggestedPrompts(profile?: Partial<CoachProfileHint> | null): string[] {
  const goal = resolveGoal(profile);
  const contextual: string[] = [];

  if ((profile?.water_goal_ml ?? 0) > 0) {
    contextual.push('Cuanta agua me falta y como la cierro?');
  }
  if ((profile?.sleep_goal_hours ?? 0) > 0) {
    contextual.push('Como cierro mejor la noche de hoy?');
  }
  if ((profile?.step_goal ?? 0) > 0) {
    contextual.push('Como cierro pasos sin meter friccion?');
  }
  if (profile?.fasting_protocol) {
    contextual.push('Como uso mi ayuno sin romper el dia?');
  }
  if (profile?.female_health_enabled) {
    contextual.push('Como ajusto carga y energia hoy?');
  }

  return unique([
    'Ordename el dia con lo que viste hoy',
    'Que accion chica me devuelve mas retorno ahora?',
    ...GOAL_PROMPTS[goal],
    ...contextual,
  ]).slice(0, 6);
}

export function buildWaterReminderCopy(input: {
  displayName?: string | null;
  totalMl?: number;
  waterGoalMl?: number | null;
  hoursSinceWater?: number | null;
}): { title: string; body: string } {
  const displayName = input.displayName?.trim() || 'Tu dia';
  const totalMl = Math.max(0, input.totalMl ?? 0);
  const goalMl = Math.max(1, input.waterGoalMl ?? 2200);

  if (input.hoursSinceWater && input.hoursSinceWater >= 3) {
    return {
      title: 'Volvamos a hidratar el dia',
      body: `${displayName}, llevas ${input.hoursSinceWater}h sin registrar agua y hoy vas ${formatLiters(totalMl)}L/${formatLiters(goalMl)}L.`,
    };
  }

  return {
    title: 'Un vaso ahora ya mueve el dia',
    body: `${displayName}, hoy vas ${formatLiters(totalMl)}L/${formatLiters(goalMl)}L. Un registro corto te devuelve ritmo.`,
  };
}

export function buildStreakAtRiskCopy(input: {
  displayName?: string | null;
  streak?: number | null;
  hasNoLogsToday?: boolean;
}): { title: string; body: string } {
  const displayName = input.displayName?.trim() || 'Tu racha';
  const streak = Math.max(0, input.streak ?? 0);

  if (input.hasNoLogsToday) {
    return {
      title: 'No dejes caer la racha',
      body: `${displayName}, con un log corto hoy sostienes ${streak} dias vivos y no dejas que el dia se enfrie.`,
    };
  }

  return {
    title: 'Te falta un cierre chico',
    body: `${displayName}, un ultimo registro util protege la racha de ${streak} dias sin meter mas ruido.`,
  };
}

export function buildSleepReminderCopy(input: {
  displayName?: string | null;
  sleepGoalHours?: number | null;
}): { title: string; body: string } {
  const displayName = input.displayName?.trim() || 'Tu descanso';
  const goal = input.sleepGoalHours && input.sleepGoalHours > 0 ? `${input.sleepGoalHours}h` : 'tu meta';
  return {
    title: 'Hora de bajar el ritmo',
    body: `${displayName}, en 30 min toca cerrar pantallas y cuidar ${goal} de sueno mas limpio.`,
  };
}

export function buildMentalCheckinReminderCopy(input: {
  displayName?: string | null;
  goal?: UserGoal | null;
}): { title: string; body: string } {
  const displayName = input.displayName?.trim() || 'Tu foco';
  const goal = input.goal ?? GOAL_FALLBACK;
  const body =
    goal === 'mental' || goal === 'mental_wellbeing'
      ? `${displayName}, dos minutos ahora ayudan a bajar ruido y volver al foco antes de que el dia se cargue.`
      : `${displayName}, un check-in breve ahora ordena energia, foco y decision para el resto del dia.`;

  return {
    title: 'Chequea como llegas hoy',
    body,
  };
}

export function buildDailySummaryReminderCopy(input: {
  displayName?: string | null;
  score?: number | null;
}): { title: string; body: string } {
  const displayName = input.displayName?.trim() || 'Tu cierre';
  const scoreFragment =
    typeof input.score === 'number' ? `Tu score viene en ${Math.round(input.score)}.` : 'Tu score ya esta listo.';

  return {
    title: 'Cierra el dia con criterio',
    body: `${displayName}, ${scoreFragment} Mira el resumen y deja una accion corta para manana.`,
  };
}

export function buildSupplementReminderCopy(input: {
  supplementName: string;
}): { title: string; body: string } {
  return {
    title: `Toca ${input.supplementName}`,
    body: `Haz un check rapido de ${input.supplementName} y sigue con el dia sin friccion.`,
  };
}

export function buildOnboardingWelcomeCopy(input: {
  displayName?: string | null;
  goal?: UserGoal | null;
}): { title: string; body: string } {
  const displayName = input.displayName?.trim() || 'Tu racha';
  const goal = input.goal ?? GOAL_FALLBACK;

  if (goal === 'lose_fat') {
    return {
      title: 'Tu base empieza hoy',
      body: `${displayName}, un log corto de agua o comida alcanza para arrancar limpio y sin ansiedad.`,
    };
  }

  if (goal === 'gain_muscle' || goal === 'performance' || goal === 'sport_performance') {
    return {
      title: 'Tu bloque ya puede empezar',
      body: `${displayName}, un log corto hoy deja al sistema listo para entreno, recovery y cierre del dia.`,
    };
  }

  return {
    title: 'Tu primer paso cuenta',
    body: `${displayName}, un log corto hoy deja el dia abierto para volver manana con traccion real.`,
  };
}
