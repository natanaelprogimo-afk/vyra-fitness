import type { UserProfile } from '@/types/user';

export type NutritionMode = 'athlete' | 'competition' | 'simple' | 'awareness';

export interface NutritionModeOption {
  id: NutritionMode;
  title: string;
  shortTitle: string;
  description: string;
}

export const NUTRITION_MODE_OPTIONS: NutritionModeOption[] = [
  {
    id: 'athlete',
    title: 'Modo atleta',
    shortTitle: 'Atleta',
    description: 'Macros, calorias y precision para rendimiento o recomposicion.',
  },
  {
    id: 'competition',
    title: 'Modo competicion',
    shortTitle: 'Competicion',
    description: 'Control mas fino para etapas exigentes: peso, tendencia, refeeds y ventanas de ajuste.',
  },
  {
    id: 'simple',
    title: 'Modo simple',
    shortTitle: 'Simple',
    description: 'Menos friccion: foco en calorias, proteina y consistencia.',
  },
  {
    id: 'awareness',
    title: 'Modo consciencia',
    shortTitle: 'Consciencia',
    description: 'Mas presencia y adherencia, menos presion por cada gramo.',
  },
];

function getCoachMemory(profile: UserProfile | null): Record<string, unknown> {
  if (profile?.coach_memory_json && typeof profile.coach_memory_json === 'object') {
    return profile.coach_memory_json as Record<string, unknown>;
  }
  return {};
}

function inferModeFromGoal(profile: UserProfile | null): NutritionMode {
  const goal = profile?.primary_goal ?? profile?.goal ?? 'general_health';
  if (goal === 'performance' || goal === 'sport_performance') {
    return 'competition';
  }
  if (goal === 'gain_muscle') {
    return 'athlete';
  }
  if (goal === 'lose_fat') {
    return 'simple';
  }
  return 'simple';
}

export function getNutritionMode(profile: UserProfile | null): NutritionMode {
  const raw = getCoachMemory(profile).nutrition_mode;
  if (raw === 'athlete' || raw === 'competition' || raw === 'simple' || raw === 'awareness') {
    return raw;
  }
  return inferModeFromGoal(profile);
}

export function withNutritionMode(
  memory: Record<string, unknown> | null | undefined,
  mode: NutritionMode,
): Record<string, unknown> {
  return {
    ...(memory ?? {}),
    nutrition_mode: mode,
  };
}

export function getNutritionModeOption(mode: NutritionMode): NutritionModeOption {
  return NUTRITION_MODE_OPTIONS.find((option) => option.id === mode) ?? NUTRITION_MODE_OPTIONS[0];
}
