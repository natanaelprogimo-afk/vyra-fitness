// ============================================================
// VYRA FITNESS — Tipos de módulos de salud
// ============================================================

// ─── Hidratación ─────────────────────────────────────────────
export interface WaterLog {
  id:                     string;
  user_id:                string;
  amount_ml:              number;
  drink_type:             string;
  hydration_equivalent_ml:number;
  logged_at:              string;
  synced_at:              string | null;
}

export type DrinkTypeId =
  | 'water' | 'electrolyte_water' | 'sports_drink'
  | 'electrolyte' | 'sports'
  | 'tea' | 'coffee' | 'juice' | 'soda' | 'milk' | 'alcohol' | 'other';

// ─── Pasos ────────────────────────────────────────────────────
export interface StepLog {
  id:               string;
  user_id:          string;
  steps:            number;
  distance_m:       number;
  calories:         number;
  active_minutes:   number;
  sensitivity_mode: string;
  source:           'sensor' | 'health' | 'manual';
  logged_date:      string;                     // ISO date
  synced_at:        string | null;
}

export interface CardioSession {
  id:          string;
  user_id:     string;
  type:        'run' | 'cycle' | 'swim' | 'elliptical' | 'jump_rope' | 'other';
  started_at:  string;
  ended_at:    string | null;
  distance_m:  number;
  duration_sec:number;
  avg_hr:      number | null;
  max_hr:      number | null;
  calories:    number;
  pace_json:   Record<string, number> | null;
  splits_json: unknown | null;
  route_json:  unknown | null;
  notes:       string | null;
  synced_at:   string | null;
}

// ─── Ayuno ────────────────────────────────────────────────────
export type FastingProtocol = '16:8' | '18:6' | '20:4' | 'OMAD' | '24h' | '36h' | '5:2' | 'custom';

export type FastingPhase =
  | 'digestion'
  | 'glycolysis'
  | 'early_ketosis'
  | 'active_ketosis'
  | 'autophagy'
  | 'ampk_mtor';

export interface FastingLog {
  id:                     string;
  user_id:                string;
  protocol:               FastingProtocol;
  start_time:             string;
  end_time:               string | null;
  completed:              boolean;
  abandoned:              boolean;
  max_phase_reached:      FastingPhase | null;
  total_hours:            number | null;
  phases_timestamps_json: Record<FastingPhase, string> | null;
  notes:                  string | null;
  synced_at:              string | null;
}

// Estado local del ayuno activo (store)
export interface ActiveFastingState {
  isActive:      boolean;
  protocol:      FastingProtocol | null;
  startTime:     Date | null;
  currentPhase:  FastingPhase | null;
  elapsedHours:  number;
  logId:         string | null;
}

// ─── Sueño ────────────────────────────────────────────────────
export interface SleepLog {
  id:                   string;
  user_id:              string;
  start_time:           string;
  end_time:             string;
  duration_min:         number;
  quality_score:        number | null;           // 0-100
  deep_min:             number;
  rem_min:              number;
  light_min:            number;
  awake_min:            number;
  hrv_morning:          number | null;
  source:               'manual' | 'apple_health' | 'google_fit' | 'wearable';
  readiness_contribution:number | null;
  notes:                string | null;
  synced_at:            string | null;
}

// ─── Salud mental ─────────────────────────────────────────────
export interface MentalCheckin {
  id:         string;
  user_id:    string;
  mood:       1 | 2 | 3 | 4 | 5;
  energy:     number;                            // 1-10
  stress:     number;                            // 1-10
  motivation: number;                            // 1-10
  notes:      string | null;
  check_date: string;                            // ISO date
  synced_at:  string | null;
}

export interface MentalScore {
  total:       number;                           // 0-100
  moodScore:   number;
  energyScore: number;
  stressScore: number;
  motivScore:  number;
}

// ─── Nutrición ────────────────────────────────────────────────
export interface Food {
  id:               string;
  name:             string;
  brand:            string | null;
  barcode:          string | null;
  calories_per_100g:number;
  protein_g:        number;
  carbs_g:          number;
  fat_g:            number;
  fiber_g:          number;
  sugar_g:          number;
  sodium_mg:        number;
  is_global:        boolean;
  created_by:       string | null;
  verified:         boolean;
  image_url:        string | null;
  created_at:       string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealSource = 'manual' | 'barcode' | 'photo_ai' | 'voice' | 'recipe';

export interface Meal {
  id:         string;
  user_id:    string;
  meal_type:  MealType;
  food_name:  string;
  food_id:    string | null;
  calories:   number;
  protein_g:  number;
  carbs_g:    number;
  fat_g:      number;
  fiber_g:    number;
  sugar_g:    number;
  sodium_mg:  number;
  amount_g:   number;
  amount_unit:string;
  logged_at:  string;
  source:     MealSource;
  synced_at:  string | null;
}

export interface DailyMacros {
  calories: number;
  protein:  number;
  carbs:    number;
  fat:      number;
  fiber:    number;
}

// ─── Peso ─────────────────────────────────────────────────────
export interface WeightLog {
  id:             string;
  user_id:        string;
  weight_kg:      number;
  body_fat_pct:   number | null;
  muscle_mass_kg: number | null;
  notes:          string | null;
  photo_url:      string | null;
  logged_at:      string;
  synced_at:      string | null;
}

// ─── Entrenamientos ───────────────────────────────────────────
export interface Exercise {
  id:               string;
  name:             string;
  muscle_primary:   string;
  muscles_secondary:string[];
  equipment:        string | null;
  type:             'strength' | 'cardio' | 'flexibility' | 'balance' | null;
  instructions:     string | null;
  gif_url:          string | null;
  video_url:        string | null;
  is_global:        boolean;
  created_by:       string | null;
  created_at:       string;
}

export interface ExerciseInRoutine {
  exercise_id:    string;
  exercise_name:  string;
  sets:           number;
  reps:           number;
  rest_sec:       number;
  order:          number;
}

export interface Routine {
  id:                     string;
  user_id:                string | null;
  name:                   string;
  description:            string | null;
  exercises_json:         ExerciseInRoutine[];
  tier:                   1 | 2 | 3;
  is_premium_only:        boolean;
  estimated_duration_min: number | null;
  target_muscles_json:    string[];
  created_at:             string;
}

export interface WorkoutSession {
  id:                  string;
  user_id:             string;
  routine_id:          string | null;
  name:                string;
  started_at:          string;
  ended_at:            string | null;
  total_volume_kg:     number;
  total_sets:          number;
  total_reps:          number;
  estimated_calories:  number;
  muscles_worked_json: string[];
  notes:               string | null;
  synced_at:           string | null;
}

export interface WorkoutSet {
  id:           string;
  session_id:   string;
  exercise_id:  string;
  set_number:   number;
  reps:         number;
  weight_kg:    number;
  duration_sec: number | null;
  rest_sec:     number;
  is_warmup:    boolean;
  is_pr:        boolean;
  synced_at:    string | null;
}

// Estado local durante un entreno activo
export interface ActiveWorkoutState {
  sessionId:       string | null;
  routineId:       string | null;
  name:            string;
  startedAt:       Date | null;
  currentExercise: number;                       // índice
  currentSet:      number;
  sets:            ActiveSet[];
  isResting:       boolean;
  restSeconds:     number;
}

export interface ActiveSet {
  exerciseId:   string;
  exerciseName: string;
  setNumber:    number;
  reps:         number;
  weightKg:     number;
  isWarmup:     boolean;
  completed:    boolean;
  isPr:         boolean;
}

// ─── Suplementos ─────────────────────────────────────────────
export type SupplementUnit = 'mg' | 'g' | 'ml' | 'caps' | 'tablets' | 'scoops';
export type SupplementFrequency = 'daily' | 'weekly' | 'as_needed';

export interface Supplement {
  id:                  string;
  user_id:             string;
  name:                string;
  dose:                number | null;
  unit:                SupplementUnit | null;
  frequency:           SupplementFrequency | null;
  reminder_times_json: string[];               // Array de "HH:MM" strings
  active:              boolean;
  notes:               string | null;
  created_at:          string;
}

export interface SupplementLog {
  id:            string;
  user_id:       string;
  supplement_id: string;
  taken_at:      string;
  synced_at:     string | null;
}

// ─── Ciclo femenino ───────────────────────────────────────────
export type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL';

export interface FemaleCycleLog {
  id:               string;
  user_id:          string;
  period_start:     string;
  period_end:       string | null;
  cycle_length_est: number;
  symptoms_json:    Record<string, boolean>;
  phase_override:   CyclePhase | null;
  synced_at:        string | null;
}

export interface CycleState {
  currentPhase:    CyclePhase | null;
  currentDay:      number | null;
  nextPeriod:      Date | null;
  isActive:        boolean;
}
