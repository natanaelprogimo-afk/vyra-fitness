import type { ActivityLevel, PrimaryGoal } from '@/types/user';
import { Modules, type ModuleId } from '@/constants/modules';

export const ONBOARDING_STEP_TOTAL = 4;

export const GOAL_OPTIONS: Array<{
  id: PrimaryGoal;
  label: string;
  subtitle: string;
  emoji: string;
}> = [
  { id: 'lose_fat', label: 'Perder peso', subtitle: 'Definir y moverte', emoji: '🔥' },
  { id: 'gain_muscle', label: 'Ganar musculo', subtitle: 'Fuerza y volumen', emoji: '💪' },
  { id: 'general_health', label: 'Estar en forma', subtitle: 'Base simple y constante', emoji: '⚡' },
  { id: 'sport_performance', label: 'Recuperar el habito', subtitle: 'Volver a entrenar seguido', emoji: '🧱' },
] as const;

export const EQUIPMENT_OPTIONS = [
  {
    id: 'gym_full',
    label: 'Gimnasio completo',
    subtitle: 'Barras, mancuernas, maquinas',
    emoji: '🏋️',
  },
  {
    id: 'home_basic',
    label: 'Casa con material basico',
    subtitle: 'Mancuernas, gomas, esterilla',
    emoji: '🏠',
  },
  {
    id: 'bodyweight',
    label: 'Sin material',
    subtitle: 'Solo peso corporal',
    emoji: '🤸',
  },
] as const;

export const ACTIVITY_OPTIONS: Array<{
  id: ActivityLevel;
  label: string;
  subtitle: string;
}> = [
  { id: 0, label: 'Sedentaria', subtitle: 'Casi todo el dia quieto' },
  { id: 1, label: 'Suave', subtitle: 'Algo de movimiento' },
  { id: 2, label: 'Moderada', subtitle: 'Base equilibrada' },
  { id: 3, label: 'Activa', subtitle: 'Te mueves bastante' },
  { id: 4, label: 'Muy activa', subtitle: 'Entreno o trabajo fisico' },
  { id: 5, label: 'Atleta', subtitle: 'Carga alta y frecuente' },
] as const;

export const DEFAULT_ACTIVE_MODULES: ModuleId[] = ['workout'];
export const ONBOARDING_MODULES = Modules.filter((module) => module.id !== 'supplements');

export function getGoalLabel(goal: PrimaryGoal | undefined | null) {
  return GOAL_OPTIONS.find((option) => option.id === goal)?.label ?? 'Salud general';
}

export function getSuggestedStepGoal(activityLevel: ActivityLevel | undefined | null) {
  switch (activityLevel) {
    case 0:
      return 6000;
    case 1:
      return 7500;
    case 2:
      return 9000;
    case 5:
      return 12000;
    case 3:
    case 4:
    default:
      return 10000;
  }
}
