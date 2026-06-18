/**
 * DEPRECATED: Score-related calculations
 * 
 * MIGRATION: All score calculations now live in backend ScoreCalculator
 * 
 * Use instead:
 * - useReadiness() hook → calls POST /api/scores/calculate
 * - ScoreCalculator service (backend only)
 * 
 * These functions are deprecated and will be removed in v2.0:
 * - calculateDailyScore ❌ Use backend API
 * - buildScoreReasons ❌ Use backend API
 * - buildMorningNarrative ❌ Use backend API
 * - buildFocusActions ❌ Use backend API
 * - predictEndOfDayScore ❌ Use backend API
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { BmiCategories } from '@/constants/strings';

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * Required for calorie goal recommendation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female' | 'other',
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'female') return base - 161;
  return base + 5;
}

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<number, number> = {
  0: 1.2,  // Sedentary
  1: 1.375, // Light activity
  2: 1.55, // Moderate activity
  3: 1.725, // Very active
  4: 1.9, // Extremely active
  5: 1.9,
};

/**
 * Calculate Total Daily Energy Expenditure
 * = BMR × Activity Level Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: number): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate macronutrient targets based on TDEE and goal
 */
export function calculateMacros(
  tdee: number,
  goal: 'lose_fat' | 'gain_muscle' | 'health' | 'performance' | 'mental',
): { protein: number; carbs: number; fat: number; calories: number } {
  let calories = tdee;
  if (goal === 'lose_fat') calories = tdee - 400;
  if (goal === 'gain_muscle') calories = tdee + 300;

  let proteinPct = 0.3;
  let fatPct = 0.25;

  if (goal === 'lose_fat') {
    proteinPct = 0.35;
    fatPct = 0.3;
  }

  if (goal === 'gain_muscle') {
    proteinPct = 0.3;
    fatPct = 0.25;
  }

  const protein = Math.round((calories * proteinPct) / 4);
  const fat = Math.round((calories * fatPct) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return {
    protein,
    carbs,
    fat,
    calories: Math.round(calories),
  };
}

/**
 * Calculate BMI value
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export function getBmiCategoryLabel(category: BMICategory): string {
  const labels: Record<BMICategory, string> = {
    underweight: BmiCategories.underweight,
    normal: BmiCategories.normal,
    overweight: BmiCategories.overweight,
    obese: BmiCategories.obesity,
  };
  return labels[category];
}

export const BMI_CATEGORY_LABELS: Record<BMICategory, string> = {
  underweight: BmiCategories.underweight,
  normal: BmiCategories.normal,
  overweight: BmiCategories.overweight,
  obese: BmiCategories.obesity,
};

export const BMI_CATEGORY_COLORS: Record<BMICategory, string> = {
  underweight: '#60A5FA',
  normal: '#10B981',
  overweight: '#F59E0B',
  obese: '#EF4444',
};

export interface BMICategoryInfo {
  category: BMICategory;
  label: string;
  color: string;
}

export function getBMICategory(bmi: number): BMICategoryInfo {
  let category: BMICategory;
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';

  return {
    category,
    label: BMI_CATEGORY_LABELS[category],
    color: BMI_CATEGORY_COLORS[category],
  };
}

/**
 * Hydration factors for different drink types
 */
export const HYDRATION_FACTORS: Record<string, number> = {
  water: 1.0,
  electrolyte_water: 1.05,
  sports_drink: 1.0,
  electrolyte: 1.05,
  sports: 1.0,
  tea: 0.85,
  coffee: 0.75,
  juice: 0.9,
  soda: 0.7,
  milk: 0.9,
  alcohol: 0.0,
};

/**
 * Calculate hydration-equivalent for a drink
 */
export function calculateHydrationEquivalent(
  amountMl: number,
  drinkType: string,
  factorOverride?: number | null,
): number {
  const factor =
    typeof factorOverride === 'number' && Number.isFinite(factorOverride)
      ? factorOverride
      : (HYDRATION_FACTORS[drinkType] ?? 1.0);
  return Math.round(amountMl * factor);
}

/**
 * Calculate recommended daily water goal based on weight
 */
export function calculateWaterGoal(weightKg: number): number {
  return Math.round(weightKg * 35);
}

/**
 * Calculate distance from steps (using stride length)
 */
export function calculateStepsDistance(steps: number, heightCm: number): number {
  const strideM = heightCm * 0.00415;
  return parseFloat((steps * strideM).toFixed(2));
}

/**
 * Estimate calories burned from steps
 */
export function calculateStepsCalories(steps: number, weightKg: number): number {
  return Math.round((steps * weightKg * 0.04) / 1000);
}

export function calculateSleepScore(durationMin: number, quality: number): number {
  const durationHours = durationMin / 60;
  const durationComponent = Math.max(0, Math.min(100, (durationHours / 8) * 100));
  const qualityComponent = Math.max(0, Math.min(100, quality * 10));
  return Math.round(durationComponent * 0.55 + qualityComponent * 0.45);
}

export function calculateMentalScore(
  mood: number,
  energy: number,
  stress: number,
  motivation: number,
): number {
  const moodPct = Math.max(0, Math.min(100, (mood / 5) * 100));
  const energyPct = Math.max(0, Math.min(100, (energy / 10) * 100));
  const stressPct = Math.max(0, Math.min(100, ((10 - stress) / 9) * 100));
  const motivationPct = Math.max(0, Math.min(100, (motivation / 10) * 100));

  return Math.round(
    moodPct * 0.3 +
      energyPct * 0.25 +
      stressPct * 0.25 +
      motivationPct * 0.2,
  );
}

/**
 * Format meters as km or m
 */
export function metersToKm(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Fasting phase labels and durations
 */
export type FastingPhase =
  | 'digestion'
  | 'glycolysis'
  | 'early_ketosis'
  | 'active_ketosis'
  | 'autophagy'
  | 'ampk_mtor';

export function getFastingPhase(hoursElapsed: number): FastingPhase {
  if (hoursElapsed < 4) return 'digestion';
  if (hoursElapsed < 8) return 'glycolysis';
  if (hoursElapsed < 12) return 'early_ketosis';
  if (hoursElapsed < 18) return 'active_ketosis';
  if (hoursElapsed < 24) return 'autophagy';
  return 'ampk_mtor';
}

export const FASTING_PHASE_LABELS: Record<FastingPhase, string> = {
  digestion: 'Digestion activa',
  glycolysis: 'Glucolisis',
  early_ketosis: 'Ketosis temprana',
  active_ketosis: 'Ketosis activa',
  autophagy: 'Autofagia',
  ampk_mtor: 'AMPK / mTOR',
};

export const FASTING_PHASE_HOURS: Record<FastingPhase, string> = {
  digestion: '0-4h',
  glycolysis: '4-8h',
  early_ketosis: '8-12h',
  active_ketosis: '12-18h',
  autophagy: '18-24h',
  ampk_mtor: '24h+',
};

/**
 * Estimate weeks to reach weight goal
 */
export function estimateWeeksToGoal(
  currentKg: number,
  goalKg: number,
  weeklyDeficitKcal: number,
): number | null {
  if (weeklyDeficitKcal <= 0) return null;
  const totalKgDiff = Math.abs(currentKg - goalKg);
  const weeksNeeded = (totalKgDiff * 7700) / weeklyDeficitKcal;
  return Math.round(weeksNeeded);
}

/**
 * ===== DEPRECATED FUNCTIONS (Moved to Backend) =====
 * 
 * These functions have been migrated to vyra-backend/src/services/scoreCalculator.ts
 * The frontend now fetches scores via useReadiness() hook
 * 
 * DO NOT USE THESE - they throw errors directing to backend
 */

/**
 * ❌ DEPRECATED: Use backend API instead
 * @deprecated Use POST /api/scores/calculate instead
 */
export function calculateDailyScore(): never {
  throw new Error(
    'calculateDailyScore is deprecated. Use useReadiness() hook and POST /api/scores/calculate instead.'
  );
}

/**
 * ❌ DEPRECATED
 * @deprecated Not needed with backend scoring
 */
export interface DailyScoreInputs {
  waterMl: number;
  waterGoalMl: number;
  steps: number;
  stepsGoal: number;
  sleepQuality: number;
  caloriesIn: number;
  tdee: number;
  mood: number;
  stress: number;
  energy: number;
  motivation: number;
}

/**
 * ❌ DEPRECATED
 * @deprecated Not needed with backend scoring
 */
export interface DailyScoreResult {
  total: number;
  hydration: number;
  activity: number;
  sleep: number;
  nutrition: number;
  mental: number;
  cappedByStress: boolean;
}
