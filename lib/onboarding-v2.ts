import type { ActivityLevel, PrimaryGoal } from '@/types/user';
import { Colors } from '@/constants/colors';
import { Modules, type ModuleId } from '@/constants/modules';

export const ONBOARDING_STEP_TOTAL = 7;

export const GOAL_OPTIONS: Array<{
  id: PrimaryGoal;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
}> = [
  { id: 'lose_fat', label: 'Perder grasa', subtitle: 'Definir + moverse', icon: 'flame-outline', color: Colors.fasting },
  { id: 'gain_muscle', label: 'Ganar musculo', subtitle: 'Fuerza + nutricion', icon: 'barbell-outline', color: Colors.brand },
  { id: 'general_health', label: 'Salud general', subtitle: 'Balance diario', icon: 'sparkles-outline', color: Colors.sleep },
  { id: 'sport_performance', label: 'Rendimiento', subtitle: 'Subir tu nivel', icon: 'flash-outline', color: Colors.steps },
  { id: 'mental_wellbeing', label: 'Bienestar mental', subtitle: 'Suavizar la cabeza', icon: 'leaf-outline', color: Colors.recovery },
];

export const GENDER_OPTIONS: Array<{
  id: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';
  label: string;
}> = [
  { id: 'female', label: 'Femenino' },
  { id: 'male', label: 'Masculino' },
  { id: 'non_binary', label: 'No binario' },
  { id: 'prefer_not_to_say', label: 'Prefiero no decir' },
];

export const ACTIVITY_OPTIONS: Array<{
  id: ActivityLevel;
  label: string;
  subtitle: string;
}> = [
  { id: 0, label: 'Sedentaria', subtitle: 'Casi todo el dia quieto' },
  { id: 1, label: 'Suave', subtitle: 'Algo de movimiento' },
  { id: 2, label: 'Moderada', subtitle: 'Base equilibrada' },
  { id: 3, label: 'Activa', subtitle: 'Te moves bastante' },
  { id: 4, label: 'Muy activa', subtitle: 'Entreno o trabajo fisico' },
  { id: 5, label: 'Atleta', subtitle: 'Carga alta y frecuente' },
];

export const STEP_GOAL_PRESETS = [5000, 10000, 15000] as const;
export const DEFAULT_ACTIVE_MODULES: ModuleId[] = ['water', 'steps', 'sleep'];

export const ONBOARDING_MODULES = Modules.filter((module) => module.id !== 'female');

export function kgToLb(value: number) {
  return value * 2.20462;
}

export function lbToKg(value: number) {
  return value / 2.20462;
}

export function cmToFeetInches(value: number) {
  const totalInches = value / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number) {
  return (feet * 12 + inches) * 2.54;
}

export function getGoalLabel(goal: PrimaryGoal | undefined | null) {
  return GOAL_OPTIONS.find((option) => option.id === goal)?.label ?? 'Salud general';
}

