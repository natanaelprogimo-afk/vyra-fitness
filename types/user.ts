// types/user.ts — COMPLETO (Bug 3 fix: fasting_protocol agregado)

// ─── PERFIL DE USUARIO ───────────────────────────────────────────────────────

// Tipos de alias para onboarding y formularios
export type PrimaryGoal = UserGoal;
export type Gender = BiologicalSex;

export type UserGoal =
  | 'lose_fat'
  | 'gain_muscle'
  | 'health'
  | 'general_health'
  | 'performance'
  | 'sport_performance'
  | 'mental'
  | 'mental_wellbeing';

export type ActivityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type BiologicalSex = 'male' | 'female' | 'other' | 'non_binary' | 'prefer_not_to_say';

// Datos recolectados durante onboarding
export interface OnboardingData {
  name: string;
  age: number;
  goal: PrimaryGoal;
  gender: Gender;
  height_cm: number;
  weight_start_kg: number;
  weight_goal_kg?: number;
  activity_level: ActivityLevel;
  water_goal_ml: number;
  step_goal: number;
  sleep_goal_hours?: number;
  equipment?: string;
  wake_time_minutes?: number;
  sleep_time_minutes?: number;
  fasting_protocol?: string | null;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

// Para actualizar campo de usuario (subset)
export type UserProfileUpdate = Partial<UserProfile> & { id?: string };

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;

  // Datos corporales
  height_cm: number;
  weight_start_kg: number;
  weight_goal_kg: number | null;
  biological_sex: BiologicalSex;
  birth_year: number;

  // Objetivos y actividad
  goal: UserGoal;
  primary_goal?: UserGoal;  // Alias for goal or overrides
  activity_level: ActivityLevel;
  tdee: number | null;
  calorie_goal?: number | null;  // User's calorie target

  // Metas diarias
  water_goal_ml: number;
  step_goal: number;
  sleep_goal_hours: number;

  // ─── BUG 3 FIX ────────────────────────────────────────────────────────────
  fasting_protocol: string | null; // e.g. '16_8', '18_6', 'omad', 'custom'
  // ──────────────────────────────────────────────────────────────────────────

  // Horarios
  wake_time_minutes: number;   // minutos desde medianoche, e.g. 420 = 7:00am
  sleep_time_minutes: number;  // e.g. 1380 = 23:00

  // Premium
  is_premium: boolean;
  premium_expires_at: string | null;
  paypal_subscription_id: string | null;

  // Gamificación
  coins: number;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;

  // Notificaciones
  push_token: string | null;

  // Features opcionales
  female_health_enabled: boolean;
  coach_name_preference: string;
  onboarding_completed: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Subset para crear un perfil durante el onboarding
export type CreateProfilePayload = Omit<
  UserProfile,
  | 'id'
  | 'email'
  | 'coins'
  | 'xp'
  | 'level'
  | 'current_streak'
  | 'longest_streak'
  | 'push_token'
  | 'is_premium'
  | 'premium_expires_at'
  | 'paypal_subscription_id'
  | 'created_at'
  | 'updated_at'
>;

// ─── AGUA ────────────────────────────────────────────────────────────────────

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  drink_type: string;
  hydration_equivalent_ml: number;
  logged_at: string;
  synced_at: string | null;
}

// ─── PASOS ───────────────────────────────────────────────────────────────────

export type StepSource = 'pedometer' | 'manual' | 'calibrated';

export interface StepLog {
  id: string;
  user_id: string;
  steps: number;
  distance_m: number;
  calories: number;
  source: StepSource;
  logged_date: string; // YYYY-MM-DD
  synced_at: string | null;
}

// ─── AYUNO ───────────────────────────────────────────────────────────────────

export type FastingPhase =
  | 'digestion'
  | 'glycolysis'
  | 'early_ketosis'
  | 'active_ketosis'
  | 'autophagy'
  | 'ampk_mtor';

export interface FastingLog {
  id: string;
  user_id: string;
  protocol: string;
  start_time: string;
  end_time: string | null;
  completed: boolean;
  max_phase_reached: FastingPhase;
  total_hours: number;
  synced_at: string | null;
}

// ─── SUEÑO ───────────────────────────────────────────────────────────────────

export type SleepSource = 'manual' | 'google_fit' | 'wearable';

export interface SleepLog {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  quality_score: number; // 0–100 (calculado de slider 1–10)
  deep_min: number | null;
  rem_min: number | null;
  hrv_morning: number | null;
  source: SleepSource;
  synced_at: string | null;
}

// ─── MENTAL ──────────────────────────────────────────────────────────────────

export interface MentalCheckin {
  id: string;
  user_id: string;
  mood: number;       // 1–5
  energy: number;     // 1–10
  stress: number;     // 1–10
  motivation: number; // 1–10
  check_date: string; // YYYY-MM-DD
  synced_at: string | null;
}

// ─── NUTRICIÓN ───────────────────────────────────────────────────────────────

export type MealSource = 'manual' | 'barcode' | 'photo_ai' | 'voice' | 'recipe';

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_global: boolean;
  created_by: string | null;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  food_id: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  amount_g: number;
  logged_at: string;
  source: MealSource;
  synced_at: string | null;
}

// ─── PESO ────────────────────────────────────────────────────────────────────

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  photo_url: string | null;
  note: string | null;
  logged_at: string;
  synced_at: string | null;
}

// ─── ENTRENAMIENTOS ──────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  description: string;
  gif_url: string | null; // Premium only
  is_global: boolean;
  created_by: string | null;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  is_pr: boolean;
  synced_at: string | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  started_at: string;
  ended_at: string | null;
  total_volume_kg: number;
  muscles_worked_json: string[];
  sets: WorkoutSet[];
  synced_at: string | null;
}

// ─── SUPLEMENTOS ─────────────────────────────────────────────────────────────

export type SupplementFrequency = 'daily' | 'weekly' | 'as_needed';
export type SupplementUnit = 'mg' | 'g' | 'ml' | 'caps' | 'tablets';

export interface Supplement {
  id: string;
  user_id: string;
  name: string;
  dose: number;
  unit: SupplementUnit;
  frequency: SupplementFrequency;
  reminder_times_json: string[]; // e.g. ["08:00", "20:00"]
  active: boolean;
  created_at: string;
}

// ─── DAILY SCORE ─────────────────────────────────────────────────────────────

export interface DailyScore {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  total_score: number;
  hydration_pct: number;
  sleep_pct: number;
  activity_pct: number;
  nutrition_pct: number;
  mental_pct: number;
}

// ─── GAMIFICACIÓN ────────────────────────────────────────────────────────────

export type CoinTransactionType =
  | 'earn_water'
  | 'earn_steps'
  | 'earn_sleep'
  | 'earn_nutrition'
  | 'earn_workout'
  | 'earn_fasting'
  | 'earn_mental'
  | 'earn_daily_score'
  | 'earn_streak_milestone'
  | 'earn_badge'
  | 'earn_ad_reward'
  | 'earn_onboarding'
  | 'earn_referral'
  | 'spend_store';

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number; // positivo = ganó, negativo = gastó
  type: CoinTransactionType;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
  coins_earned: number;
}

// ─── SUSCRIPCIÓN ─────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'trial';

export type SubscriptionPlan = 'monthly' | 'yearly';

export interface UserSubscription {
  id: string;
  user_id: string;
  paypal_subscription_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  trial_ends_at: string | null;
}

// ─── CICLO FEMENINO ──────────────────────────────────────────────────────────

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface FemaleCycleLog {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string | null;
  cycle_length_est: number | null;
  symptoms_json: string[];
  phase_override: CyclePhase | null;
}

// ─── PRIMERA SEMANA ──────────────────────────────────────────────────────────

export interface FirstWeekTask {
  day: number;         // 1–7
  module: string;
  title: string;
  description: string;
  action: string;      // ruta Expo Router
  coinReward: number;
  xpReward: number;
  completed: boolean;
}