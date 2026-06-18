import { DRINK_TYPES } from '@/constants/modules';
import type { DrinkTypeId } from '@/types/modules';

export const WATER_GOAL_LINE_HEIGHT = 120;
export const WATER_DEFAULT_GLASS_ML = 250;
export const WATER_DEFAULT_LARGE_GLASS_ML = 350;
export const WATER_DEFAULT_BOTTLE_ML = 500;
export const WATER_AFTERNOON_HOUR = 15;
export const WATER_CATCH_UP_THRESHOLD = 30;

export const WATER_DRINK_CHOICES: Array<{ id: DrinkTypeId; label: string; emoji: string }> = [
  { id: 'water', label: 'Agua', emoji: '💧' },
  { id: 'tea', label: 'Te', emoji: '🍵' },
  { id: 'coffee', label: 'Cafe', emoji: '☕' },
  { id: 'juice', label: 'Jugo', emoji: '🍊' },
  { id: 'soda', label: 'Coca o soda', emoji: '🥤' },
  { id: 'electrolyte', label: 'Electrolitos', emoji: '⚡' },
  { id: 'sports', label: 'Isotonica', emoji: '🏃' },
  { id: 'milk', label: 'Leche', emoji: '🥛' },
  { id: 'other', label: 'Otra', emoji: '🧃' },
];

export function getWaterDrinkLabel(drinkType: string) {
  const directChoice = WATER_DRINK_CHOICES.find((item) => item.id === drinkType);
  if (directChoice) return directChoice.label;

  if (drinkType === 'electrolyte_water') return 'Electrolitos';
  if (drinkType === 'sports_drink') return 'Isotonica';
  if (drinkType === 'other') return 'Otra bebida';

  return DRINK_TYPES.find((item) => item.id === drinkType)?.label ?? 'Agua';
}

export function getWaterGoalOffsetPx(goal: number, maxValue: number, height = WATER_GOAL_LINE_HEIGHT) {
  if (maxValue <= 0) return 0;
  return Math.max(0, Math.min(height, (goal / maxValue) * height));
}

export function getWaterDefaultCustomAmount(volumeUnit: 'ml' | 'oz') {
  return volumeUnit === 'oz' ? '8' : '250';
}

export function getWaterContainerHint(kind: 'glass' | 'largeGlass' | 'bottle') {
  if (kind === 'glass') return 'Entre 100ml y 1000ml.';
  if (kind === 'largeGlass') return 'Entre 150ml y 1500ml.';
  return 'Entre 200ml y 2000ml.';
}

export function validateWaterContainerAmount(kind: 'glass' | 'largeGlass' | 'bottle', value: number) {
  if (!Number.isFinite(value)) return 'Ingresa una cantidad valida.';
  if (kind === 'glass') {
    return value < 100 || value > 1000 ? 'El vaso debe quedar entre 100ml y 1000ml.' : null;
  }
  if (kind === 'largeGlass') {
    return value < 150 || value > 1500 ? 'El vaso grande debe quedar entre 150ml y 1500ml.' : null;
  }
  return value < 200 || value > 2000 ? 'La botella debe quedar entre 200ml y 2000ml.' : null;
}
