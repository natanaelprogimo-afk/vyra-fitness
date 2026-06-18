import { Colors } from '@/constants/colors';
import type { OnboardingDraft } from '@/lib/onboarding-storage';
import type { OnboardingBinaryGender, OnboardingGoalDetailId } from '@/lib/onboarding-v2';

export type OnboardingGender = OnboardingBinaryGender;

export const GENDER_OPTIONS: Array<{ id: OnboardingGender; label: string; helper: string }> = [
  { id: 'female', label: 'Mujer', helper: 'Ajusta calorías, gasto y salud femenina si la activas.' },
  { id: 'male', label: 'Hombre', helper: 'Ajusta calorías, gasto y referencias corporales base.' },
];

type GoalVisual = {
  description: string;
  accent: string;
};

type BodyFatPreset = {
  value: number;
  rangeLabel: string;
  title: string;
  body: string;
  accent: string;
};

const GOAL_VISUALS: Record<OnboardingGoalDetailId, GoalVisual> = {
  lose_fat: {
    description: 'Déficit, adherencia y movimiento con mejor estructura.',
    accent: Colors.action,
  },
  gain_muscle: {
    description: 'Progresión, fuerza y más señal anabólica.',
    accent: Colors.workout,
  },
  improve_health: {
    description: 'Base diaria más estable, menos fricción y más salud real.',
    accent: Colors.steps,
  },
  improve_appearance: {
    description: 'Composición, tono visual y cambios visibles con criterio.',
    accent: Colors.secondary,
  },
  eat_better: {
    description: 'Más control sobre comidas, hambre y decisiones del día.',
    accent: Colors.nutrition,
  },
  recover_habit: {
    description: 'Constancia primero, intensidad después.',
    accent: Colors.sleep,
  },
  perform_better: {
    description: 'Más energía, mejor rendimiento y sesiones más sólidas.',
    accent: Colors.workout,
  },
  feel_better: {
    description: 'Menos ruido mental y una rutina más sostenible.',
    accent: Colors.water,
  },
};

const BODY_FAT_PRESETS: Record<OnboardingGender, BodyFatPreset[]> = {
  male: [
    {
      value: 12,
      rangeLabel: '10% a 13%',
      title: 'Muy definido',
      body: 'Poca reserva y mucha definición visible.',
      accent: Colors.workout,
    },
    {
      value: 16,
      rangeLabel: '14% a 18%',
      title: 'Atlético',
      body: 'Buen balance entre rendimiento y estética.',
      accent: Colors.secondary,
    },
    {
      value: 22,
      rangeLabel: '19% a 24%',
      title: 'Base',
      body: 'Punto de partida común para recomposición.',
      accent: Colors.steps,
    },
    {
      value: 30,
      rangeLabel: '25% a 34%',
      title: 'Reserva media',
      body: 'Sirve para arrancar sin forzar el déficit.',
      accent: Colors.action,
    },
    {
      value: 38,
      rangeLabel: '35% +',
      title: 'Reserva alta',
      body: 'Necesita un inicio claro, gradual y sostenible.',
      accent: Colors.nutrition,
    },
  ],
  female: [
    {
      value: 20,
      rangeLabel: '18% a 22%',
      title: 'Muy definida',
      body: 'Base magra con poca reserva y alta marcación.',
      accent: Colors.workout,
    },
    {
      value: 25,
      rangeLabel: '23% a 27%',
      title: 'Atlética',
      body: 'Rango fuerte y estable para entrenar seguido.',
      accent: Colors.secondary,
    },
    {
      value: 31,
      rangeLabel: '28% a 34%',
      title: 'Base',
      body: 'Rango común para arrancar con recomposición realista.',
      accent: Colors.steps,
    },
    {
      value: 39,
      rangeLabel: '35% a 44%',
      title: 'Reserva media',
      body: 'Sirve para ajustar mejor ritmo, agua y calorías.',
      accent: Colors.action,
    },
    {
      value: 47,
      rangeLabel: '45% +',
      title: 'Reserva alta',
      body: 'Conviene arrancar con una base más amable y sostenida.',
      accent: Colors.nutrition,
    },
  ],
};

export function getGoalVisual(goalId: OnboardingGoalDetailId): GoalVisual {
  return GOAL_VISUALS[goalId];
}

export function sanitizeName(raw: string | null | undefined) {
  return raw?.trim() ?? '';
}

export function normalizeOnboardingGender(
  value: OnboardingDraft['gender'] | null | undefined,
): OnboardingGender | null {
  if (value === 'female' || value === 'male') {
    return value;
  }

  return null;
}

export function getBodyFatPresets(gender: OnboardingGender) {
  return BODY_FAT_PRESETS[gender];
}

export function getNearestBodyFatValue(gender: OnboardingGender, currentValue: number) {
  const presets = getBodyFatPresets(gender);
  return presets.reduce((closest, preset) => {
    if (Math.abs(preset.value - currentValue) < Math.abs(closest - currentValue)) {
      return preset.value;
    }

    return closest;
  }, presets[0]?.value ?? currentValue);
}

export function formatBodyFatSummary(value: number | null) {
  if (value === null) return 'Sin elegir';
  return `~${Math.round(value)}%`;
}
