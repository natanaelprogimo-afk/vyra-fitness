import type { PaywallTrigger } from '@/types/navigation';

export interface FastingWorkoutWeightInsight {
  title: string;
  body: string;
  tone: 'positive' | 'neutral' | 'warning';
}

export function buildFastingWorkoutWeightInsight(input: {
  fastingInsight?: string | null;
  weeklyWeightDeltaKg?: number | null;
  sessionsThisWeek: number;
  fatigueLevel: 'low' | 'moderate' | 'high';
  recommendRecoveryDay?: boolean;
  currentProtocol?: string | null;
}): FastingWorkoutWeightInsight {
  if (input.fatigueLevel === 'high' || input.recommendRecoveryDay) {
    return {
      title: 'Cruce ayuno + entreno',
      body:
        'Tu carga de entreno viene alta. Si mantienes ayuno hoy, conviene bajar intensidad y usar la sesión para técnica, movilidad o caminata.',
      tone: 'warning',
    };
  }

  if ((input.weeklyWeightDeltaKg ?? 0) < -0.2 && input.sessionsThisWeek >= 2) {
    return {
      title: 'Ayuno, peso y entreno alineados',
      body:
        input.fastingInsight ??
        'La tendencia semanal de peso acompana y ya sostienes entrenos suficientes como para priorizar consistencia sobre agresividad.',
      tone: 'positive',
    };
  }

  return {
    title: 'Ayuno util cuando acompana recuperación',
    body:
      `Con ${input.sessionsThisWeek} sesiónes esta semana, usa ${input.currentProtocol ?? 'tu protocolo actual'} para sumar adherencia sin comprometer el rendimiento del bloque.`,
    tone: 'neutral',
  };
}

export interface FemaleReadinessInsight {
  title: string;
  body: string;
  tone: 'positive' | 'neutral' | 'warning';
}

export function buildFemaleReadinessInsight(input: {
  phaseName: string;
  readinessScore?: number | null;
  trainingGuidance: string;
  nutritionGuidance: string;
  fatigueLevel?: 'low' | 'moderate' | 'high';
}): FemaleReadinessInsight {
  if ((input.readinessScore ?? 0) < 60 || input.fatigueLevel === 'high') {
    return {
      title: `Fase ${input.phaseName} con calma primero`,
      body: `${input.trainingGuidance} Hoy conviene simplificar el esfuerzo y dejar que nutrición haga soporte: ${input.nutritionGuidance}`,
      tone: 'warning',
    };
  }

  if ((input.readinessScore ?? 0) >= 80) {
    return {
      title: `Ventana fuerte en fase ${input.phaseName}`,
      body: `${input.trainingGuidance} Si la técnica está limpia, hoy es buen día para una sesión con intención y una comida de soporte clara después.`,
      tone: 'positive',
    };
  }

  return {
    title: `Fase ${input.phaseName} en modo consistencia`,
    body: `${input.trainingGuidance} La prioridad es sostener ritmo y acompañar con ${input.nutritionGuidance.toLowerCase()}`,
    tone: 'neutral',
  };
}

export interface SupplementNutritionInsight {
  title: string;
  body: string;
  tone: 'positive' | 'neutral' | 'warning';
}

export function buildSupplementNutritionInsight(input: {
  supplementCount: number;
  takenToday: number;
  proteinGrams: number;
  calories: number;
  hasBreakfast: boolean;
  hasLunch: boolean;
  hasDinner: boolean;
  hasWarnings: boolean;
}): SupplementNutritionInsight {
  if (input.hasWarnings) {
    return {
      title: 'Timing a revisar',
      body:
        'Hay una posible interacción en tu stack. Mejor separa tomas sensibles y aprovecha comidas completas para reducir fricción digestiva.',
      tone: 'warning',
    };
  }

  if (input.supplementCount > 0 && input.takenToday < input.supplementCount && !input.hasBreakfast && !input.hasLunch) {
    return {
      title: 'Stack aún sin ventana clara',
      body:
        'Todavía no hay una comida principal registrada. Si algunos suplementos van con comida, usa nutrición para fijar esa primera ventana y tomar menos decisiones después.',
      tone: 'neutral',
    };
  }

  if (input.proteinGrams >= 90 || input.calories >= 1200) {
    return {
      title: 'Nutrición y adherencia bien acopladas',
      body:
        'Ya hay base alimentaria suficiente para sostener el stack del día. Prioriza completar lo pendiente alrededor de tus comidas principales.',
      tone: 'positive',
    };
  }

  return {
    title: 'Usa comidas como ancla del stack',
    body:
      'Cuando la ingesta viene corta, el mejor atajo es pegar tus suplementos a desayuno, almuerzo o cena para que la adherencia no dependa de memoria suelta.',
    tone: 'neutral',
  };
}

export interface SleepReadinessInsight {
  title: string;
  body: string;
  tone: 'positive' | 'neutral' | 'warning';
}

export function buildSleepReadinessInsight(input: {
  sleepDebtHours: number;
  avgLast3Hours: number;
  readinessScore?: number | null;
  workoutRecommendation: 'recovery' | 'moderate' | 'intense';
  fatigueLevel?: 'low' | 'moderate' | 'high';
  sleepStreakDays?: number;
}): SleepReadinessInsight {
  if (
    input.sleepDebtHours >= 1.5 ||
    (input.readinessScore ?? 100) < 60 ||
    input.fatigueLevel === 'high' ||
    input.workoutRecommendation === 'recovery'
  ) {
    return {
      title: 'Sueño primero, carga después',
      body:
        `Con ${input.sleepDebtHours.toFixed(1)}h de deuda y una recomendación de ${input.workoutRecommendation}, hoy conviene proteger energía antes de exigir más al entrenamiento.`,
      tone: 'warning',
    };
  }

  if (
    input.avgLast3Hours >= 7.5 &&
    (input.readinessScore ?? 0) >= 78
  ) {
    return {
      title: 'Descanso alineado con rendimiento',
      body:
        `Promedias ${input.avgLast3Hours.toFixed(1)}h en las últimas noches y tu estado acompaña. Si la técnica está limpia, hoy es una buena ventana para apretar un poco más.`,
      tone: 'positive',
    };
  }

  return {
    title: 'Consistencia de sueño para sostener el bloque',
    body:
      `Tu mejor palanca hoy es repetir una noche sólida. ${input.sleepStreakDays ?? 0} noches cumpliendo meta ya empiezan a construir inercia real para el estado del día y la recuperación.`,
    tone: 'neutral',
  };
}

export interface DailyContextBrief {
  title: string;
  summary: string;
  bullets: string[];
  prompt: string;
}

export function buildDailyContextBrief(input: {
  readinessScore?: number | null;
  sleepHours?: number | null;
  calories?: number | null;
  proteinGrams?: number | null;
  fatigueLevel?: 'low' | 'moderate' | 'high';
  activeFast?: boolean;
  mentalScore?: number | null;
}): DailyContextBrief {
  const readiness = input.readinessScore ?? null;
  const sleepHours = input.sleepHours ?? null;
  const calories = input.calories ?? 0;
  const protein = input.proteinGrams ?? 0;
  const mentalScore = input.mentalScore ?? null;

  if (
    input.fatigueLevel === 'high' ||
    (readiness !== null && readiness < 60) ||
    (sleepHours !== null && sleepHours < 6)
  ) {
    return {
      title: 'Día para simplificar',
      summary:
        'Hoy conviene bajar ruido: entreno mas liviano, comida facil y decisiones cortas.',
      bullets: [
        `Estado ${readiness ?? '--'} y fatiga ${input.fatigueLevel ?? 'sin dato'}.`,
        `Sueño reciente: ${sleepHours != null ? `${sleepHours.toFixed(1)}h` : 'sin registro'}.`,
        input.activeFast
          ?  'Hay ayuno activo, asi que la estrategia necesita menos improvisacion todavía.'
          : 'Conviene asegurar una comida simple antes de perseguir volumen o intensidad.',
      ],
      prompt: 'Ajústame el día con foco en recuperación.',
    };
  }

  if (
    (readiness !== null && readiness >= 78) &&
    (sleepHours !== null && sleepHours >= 7) &&
    protein >= 80
  ) {
    return {
      title: 'Buen contexto para rendir',
      summary:
        'Ya hay suficiente señal para proponerte un día con intención, no solo mantenimiento.',
      bullets: [
        `Estado ${readiness} con sueño de ${sleepHours.toFixed(1)}h.`,
        `Proteina registrada: ${protein}g.`,
        calories > 0 ? `Calorias del día: ${calories}.` : 'Todavía falta cerrar la ingesta del día.',
      ],
      prompt: 'Dame el mejor plan para aprovechar este día.',
    };
  }

  return {
    title: 'Día de consistencia',
    summary:
      'La lectura actual aporta mas valor si convierte tu contexto en una accion clara para las proximas horas.',
    bullets: [
      `Estado ${readiness ?? '--'} y mental ${mentalScore ?? '--'}.`,
      `Proteina ${protein}g${calories > 0 ? ` y ${calories} kcal` : ''}.`,
      input.activeFast
        ? 'Ayuno activo detectado: el timing importa mas que sumar decisiones sueltas.'
        : 'Sin ayuno activo: prioriza la siguiente accion que mas score te devuelve.',
    ],
    prompt:
      protein < 70
        ?  'Ayudame a cerrar nutrición sin complicarme.'
        : 'Resume mi día y dime que priorizar ahora.',
  };
}

export interface PaywallContextCopy {
  eyebrow: string;
  title: string;
  body: string;
  highlights: string[];
}

const DEFAULT_PAYWALL_CONTEXT: PaywallContextCopy = {
  eyebrow: 'Premium con cobro inmedíato',
  title: 'Activa Premium desde PayPal',
  body: 'Confirmas en PayPal y VYRA habilita menos friccion, historial profundo y lecturas avanzadas en tu cuenta.',
  highlights: ['Historial avanzado', 'Correlaciones premium', 'Barcode ilimitado'],
};

export function getPaywallContextCopy(trigger?: PaywallTrigger | string | null): PaywallContextCopy {
  switch (trigger) {
    case 'progress_trends':
      return {
        eyebrow: 'Correlaciones premium',
        title: 'Desbloquea la lectura completa de tu progreso',
        body: 'Cruza peso, sueño, estado diario y entrenamiento para entender qué te está moviendo de verdad, no solo ver curvas sueltas.',
        highlights: ['Correlaciones peso + estado', 'Lectura premium del progreso', 'Menos ruido al decidir'],
      };
    case 'barcode_limit':
      return {
        eyebrow: 'Nutrición sin friccion',
        title: 'Escanea y registra sin limite',
        body: 'Premium quita el tope díario del scanner y acelera el log cuando mas lo necesitas.',
        highlights: ['Barcode ilimitado', 'Log mas rapido', 'Menos pasos por comida'],
      };
    case 'context_limit':
      return {
        eyebrow: 'Analisis extendido',
        title: 'Mantiene el contexto sin cortes',
        body: 'Cuando VYRA ya tiene suficiente señal de tus módulos, Premium evita topes innecesarios y sostiene mejor la lectura del día.',
        highlights: ['Mas contexto cruzado', 'Seguimiento continuo', 'Lecturas mas profundas'],
      };
    case 'sleep_insights':
      return {
        eyebrow: 'Sueño con mas contexto',
        title: 'Lee como tu descanso impacta el resto del sistema',
        body: 'Premium abre una lectura más profunda entre sueño, estado diario y rendimiento para tomar mejores decisiones diarias.',
        highlights: ['Impacto en el estado diario', 'Cruces con rendimiento', 'Insights más profundos'],
      };
    default:
      return DEFAULT_PAYWALL_CONTEXT;
  }
}




