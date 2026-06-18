export interface NutritionPreviewSource {
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export function parseNutritionNumber(
  value: string | number | null | undefined,
): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string') return null;
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeNutritionAmount(
  value: string | number | null | undefined,
  fallback = 100,
): number {
  const parsed = parseNutritionNumber(value);
  return parsed && parsed > 0 ? parsed : fallback;
}

export function calculateNutritionPreview(
  food: NutritionPreviewSource,
  grams: number,
) {
  const factor = Math.max(0, grams) / 100;
  return {
    calories: food.calories_per_100g * factor,
    protein: food.protein_g * factor,
    carbs: food.carbs_g * factor,
    fat: food.fat_g * factor,
    fiber: food.fiber_g * factor,
  };
}

export function canSubmitManualNutrition(input: {
  name: string;
  calories: string;
}) {
  return input.name.trim().length > 0 && parseNutritionNumber(input.calories) !== null;
}

export function getNutritionQuickAmounts(mealType: string) {
  switch (mealType) {
    case 'breakfast':
      return [40, 60, 100, 150];
    case 'lunch':
    case 'dinner':
      return [100, 150, 200, 250];
    case 'snack':
    default:
      return [25, 50, 80, 120];
  }
}

export function getNutritionQuickSearches(mealType: string) {
  switch (mealType) {
    case 'breakfast':
      return ['Avena', 'Yogur griego', 'Huevos'];
    case 'lunch':
      return ['Arroz', 'Pollo', 'Ensalada'];
    case 'dinner':
      return ['Atun', 'Papa', 'Verduras'];
    case 'snack':
    default:
      return ['Banana', 'Barra proteica', 'Yogur'];
  }
}
