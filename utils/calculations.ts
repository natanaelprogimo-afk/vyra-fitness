// utils/calculations.ts — COMPLETO (fusiona calculations_additions + calculations_patch)

// ─── TDEE & MACROS ─────────────────────────────────────────────────────────

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female' | 'other'
): number {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'female') return base - 161;
  return base + 5; // male y other usan la misma base masculina
}

const ACTIVITY_MULTIPLIERS: Record<number, number> = {
  0: 1.2,  // sedentario
  1: 1.375,
  2: 1.375,
  3: 1.55,
  4: 1.725,
  5: 1.9,
};

export function calculateTDEE(
  bmr: number,
  activityLevel: number // 0–5
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateMacros(
  tdee: number,
  goal: 'lose_fat' | 'gain_muscle' | 'health' | 'performance' | 'mental'
): { protein: number; carbs: number; fat: number; calories: number } {
  let calories = tdee;
  if (goal === 'lose_fat') calories = tdee - 400;
  if (goal === 'gain_muscle') calories = tdee + 300;

  // Distribución estándar según objetivo
  let proteinPct = 0.3;
  let fatPct = 0.25;
  if (goal === 'lose_fat') { proteinPct = 0.35; fatPct = 0.3; }
  if (goal === 'gain_muscle') { proteinPct = 0.3; fatPct = 0.25; }

  const protein = Math.round((calories * proteinPct) / 4);
  const fat = Math.round((calories * fatPct) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { protein, carbs, fat, calories: Math.round(calories) };
}

// ─── BMI ────────────────────────────────────────────────────────────────────

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export type BMICategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese';

export const BMI_CATEGORY_LABELS: Record<BMICategory, string> = {
  underweight: 'Bajo peso',
  normal:      'Peso normal',
  overweight:  'Sobrepeso',
  obese:       'Obesidad',
};

export const BMI_CATEGORY_COLORS: Record<BMICategory, string> = {
  underweight: '#60A5FA', // azul
  normal:      '#10B981', // verde
  overweight:  '#F59E0B', // naranja
  obese:       '#EF4444', // rojo
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

// ─── HIDRATACIÓN ────────────────────────────────────────────────────────────

export const HYDRATION_FACTORS: Record<string, number> = {
  water:       1.0,
  electrolyte: 1.05,
  sports:      1.0,
  tea:         0.85,
  coffee:      0.75,
  juice:       0.90,
  milk:        0.90,
  alcohol:     0.0,
};

export function calculateHydrationEquivalent(
  amountMl: number,
  drinkType: string
): number {
  const factor = HYDRATION_FACTORS[drinkType] ?? 1.0;
  return Math.round(amountMl * factor);
}

export function calculateWaterGoal(weightKg: number): number {
  // Fórmula estándar: 35ml por kg de peso
  return Math.round(weightKg * 35);
}

// ─── DAILY SCORE ─────────────────────────────────────────────────────────────

export interface DailyScoreInputs {
  waterMl: number;
  waterGoalMl: number;
  steps: number;
  stepsGoal: number;
  sleepQuality: number; // 0–100 (viene de sleep_logs.quality_score)
  caloriesIn: number;
  tdee: number;
  mood: number;       // 1–5
  stress: number;     // 1–10
  energy: number;     // 1–10
  motivation: number; // 1–10
}

export interface DailyScoreResult {
  total: number;
  hydration: number;
  activity: number;
  sleep: number;
  nutrition: number;
  mental: number;
  cappedByStress: boolean;
}

export function calculateDailyScore(inputs: DailyScoreInputs): DailyScoreResult {
  const hydration = Math.min(100, (inputs.waterMl / inputs.waterGoalMl) * 100);
  const activity  = Math.min(100, (inputs.steps / inputs.stepsGoal) * 100);
  const sleep     = Math.min(100, inputs.sleepQuality);

  const calDiff   = Math.abs(inputs.caloriesIn - inputs.tdee);
  const nutrition = Math.max(0, 100 - (calDiff / inputs.tdee) * 100);

  const mental =
    (inputs.mood / 5) * 100 * 0.15 +
    ((11 - inputs.stress) / 10) * 100 * 0.35 +
    (inputs.energy / 10) * 100 * 0.25 +
    (inputs.motivation / 10) * 100 * 0.25;

  let total =
    hydration * 0.2 +
    activity  * 0.2 +
    sleep     * 0.25 +
    nutrition * 0.15 +
    mental    * 0.2;

  const cappedByStress = inputs.stress >= 8;
  if (cappedByStress) total = Math.min(75, total);

  return {
    total:      Math.round(total),
    hydration:  Math.round(hydration),
    activity:   Math.round(activity),
    sleep:      Math.round(sleep),
    nutrition:  Math.round(nutrition),
    mental:     Math.round(mental),
    cappedByStress,
  };
}

// ─── SUEÑO (de calculations_additions) ──────────────────────────────────────

export function calculateSleepScore(
  durationMin: number,
  qualityRaw: number // slider 1–10 del usuario
): number {
  // Duración óptima: 420–540 min (7–9h)
  let durationScore = 0;
  if (durationMin >= 420 && durationMin <= 540) {
    durationScore = 100;
  } else if (durationMin >= 360 && durationMin < 420) {
    durationScore = 70 + ((durationMin - 360) / 60) * 30;
  } else if (durationMin > 540 && durationMin <= 600) {
    durationScore = 100 - ((durationMin - 540) / 60) * 20;
  } else if (durationMin < 360) {
    durationScore = Math.max(0, (durationMin / 360) * 70);
  } else {
    durationScore = Math.max(0, 80 - ((durationMin - 600) / 60) * 20);
  }

  const qualityScore = (qualityRaw / 10) * 100;
  return Math.round(durationScore * 0.6 + qualityScore * 0.4);
}

// ─── PASOS (de calculations_additions) ──────────────────────────────────────

export function calculateStepsDistance(
  steps: number,
  heightCm: number
): number {
  // Longitud de zancada estimada: 0.413 * altura para hombres, usamos valor neutro
  const strideM = heightCm * 0.00415;
  return parseFloat((steps * strideM).toFixed(2)); // km
}

export function calculateStepsCalories(
  steps: number,
  weightKg: number
): number {
  // Aprox: 0.04 kcal por paso por kg / 1000
  return Math.round(steps * weightKg * 0.04 / 1000);
}

export function metersToKm(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(2)}km`;
}

// ─── MENTAL (de calculations_patch) ─────────────────────────────────────────

export function calculateMentalScore(
  mood: number,       // 1–5
  energy: number,     // 1–10
  stress: number,     // 1–10
  motivation: number  // 1–10
): number {
  const moodScore       = (mood / 5) * 100;
  const energyScore     = (energy / 10) * 100;
  const stressScore     = ((11 - stress) / 10) * 100; // invertido
  const motivationScore = (motivation / 10) * 100;

  return Math.round(
    moodScore       * 0.15 +
    energyScore     * 0.25 +
    stressScore     * 0.35 +
    motivationScore * 0.25
  );
}

// ─── AYUNO ──────────────────────────────────────────────────────────────────

export type FastingPhase =
  | 'digestion'
  | 'glycolysis'
  | 'early_ketosis'
  | 'active_ketosis'
  | 'autophagy'
  | 'ampk_mtor';

export function getFastingPhase(hoursElapsed: number): FastingPhase {
  if (hoursElapsed < 4)  return 'digestion';
  if (hoursElapsed < 8)  return 'glycolysis';
  if (hoursElapsed < 12) return 'early_ketosis';
  if (hoursElapsed < 18) return 'active_ketosis';
  if (hoursElapsed < 24) return 'autophagy';
  return 'ampk_mtor';
}

export const FASTING_PHASE_LABELS: Record<FastingPhase, string> = {
  digestion:      'Digestión activa',
  glycolysis:     'Glucólisis',
  early_ketosis:  'Ketosis temprana',
  active_ketosis: 'Ketosis activa',
  autophagy:      'Autofagia',
  ampk_mtor:      'AMPK / mTOR',
};

export const FASTING_PHASE_HOURS: Record<FastingPhase, string> = {
  digestion:      '0–4h',
  glycolysis:     '4–8h',
  early_ketosis:  '8–12h',
  active_ketosis: '12–18h',
  autophagy:      '18–24h',
  ampk_mtor:      '24h+',
};

export function calculateFastingCoins(totalHours: number): number {
  return 20 + Math.floor(Math.max(0, totalHours - 16)) * 5;
}

// ─── PESO / PROYECCIÓN ───────────────────────────────────────────────────────

export function estimateWeeksToGoal(
  currentKg: number,
  goalKg: number,
  weeklyDeficitKcal: number // déficit semanal promedio
): number | null {
  if (weeklyDeficitKcal <= 0) return null;
  const totalKgDiff = Math.abs(currentKg - goalKg);
  // 7700 kcal ≈ 1 kg de grasa
  const weeksNeeded = (totalKgDiff * 7700) / weeklyDeficitKcal;
  return Math.round(weeksNeeded);
}

// ─── MONEDAS / GAMIFICACIÓN ──────────────────────────────────────────────────

export const DAILY_COINS_CAP = 200;

export function capCoinsEarned(
  earned: number,
  alreadyEarnedToday: number
): number {
  const remaining = DAILY_COINS_CAP - alreadyEarnedToday;
  return Math.max(0, Math.min(earned, remaining));
}

// ─── XP / NIVELES ───────────────────────────────────────────────────────────

export const XP_PER_LEVEL = 1000;

export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

export function xpToNextLevel(totalXp: number): number {
  return XP_PER_LEVEL - (totalXp % XP_PER_LEVEL);
}

export function xpProgressPct(totalXp: number): number {
  return ((totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
}