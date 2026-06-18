export interface Exercise {
  id: string;
  slug?: string;
  name: string;
  muscle_group: string;
  equipment: string;
  instructions: string | null;
  is_global: boolean;
  movement_pattern?: string | null;
  difficulty_level?: string | null;
  cues?: string[] | null;
  mistakes?: string[] | null;
  muscles_secondary: string[];
  gif_url?: string | null;
  video_url?: string | null;
  aliases?: string[] | null;
  variations?: string[] | null;
  contraindications?: string[] | null;
  type?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoutineExercise {
  exercise_id: string;
  exercise_name: string;
  sets_target: number;
  reps_target: number;
  weight_suggestion_kg: number | null;
  order?: number;
  group_label?: string | null;
  rest_seconds?: number | null;
  rpe_target?: number | null;
  rir_target?: number | null;
  notes?: string | null;
  set_type?: string | null;
}

export interface Routine {
  id: string;
  slug?: string;
  name: string;
  user_id?: string | null;
  description?: string | null;
  split_tag?: string | null;
  estimated_duration_min?: number | null;
  schedule_day?: string | null;
  goal_tag?: string | null;
  is_primary: boolean;
  exercises: RoutineExercise[];
  is_template?: boolean;
  source?: 'seed' | 'user' | 'template';
  last_used_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutSet {
  id?: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  is_pr: boolean;
  completed_at: string;
  rir?: number | null;
  rpe?: number | null;
  set_type?: string;
  rest_sec?: number | null;
  notes?: string | null;
}

export interface ActiveSession {
  session_id: string | null;
  routine_id?: string | null;
  name: string;
  sets: WorkoutSet[];
  startedAt: Date;
  timerStart: Date | null;
  timerDurationSec?: number | null;
  exercises: RoutineExercise[];
  currentExerciseIndex: number;
  notes?: string | null;
  exerciseNotes?: Record<string, string>;
  isQuickSession?: boolean;
}

export interface WorkoutHistory {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  total_volume_kg: number;
  sets_count: number;
  muscles_worked: string[];
  routine_id?: string | null;
  notes?: string | null;
  total_reps?: number;
  estimated_calories?: number;
  duration_min?: number;
}

export interface WorkoutFatigueRisk {
  level: 'low' | 'moderate' | 'high';
  message: string | null;
  reasons: string[];
  recommendRecoveryDay: boolean;
  consecutiveTrainingDays: number;
  avgSleepHoursLast3: number | null;
  avgStressLast3: number | null;
  cyclePhase: string | null;
  cycleAdjustedRecommendation: string | null;
  cycleLoadProfile: {
    intensityCapRpe: number;
    volumeMultiplier: number;
    stepGoalAdjustmentPct: number;
    preferredFocus: string;
    avoidFocus: string;
  } | null;
}

export interface WorkoutProgram {
  id: string;
  slug?: string;
  name: string;
  split_tag: string;
  difficulty_level: string;
  days_per_week: number;
  estimated_session_min: number;
  duration_weeks: number;
  routine_ids: string[];
  target_muscles: string[];
  is_premium_only: boolean;
  objective?: string | null;
  structure?: string | null;
  duration_label?: string | null;
  next_program_name?: string | null;
  source?: 'catalog' | 'routines';
  session_count?: number;
  exercise_count?: number;
}

export interface WorkoutProgramPhase {
  week: number;
  totalWeeks: number;
  label: string;
  focus: string;
}

export interface WorkoutConsistencyStats {
  currentStreak: number;
  currentWeekSessions: number;
  activeWeeksLast12: number;
  sessionsLast30: number;
  weeklyVolume: number;
  avgSessionVolume: number;
}

export interface WorkoutMonthlyProgress {
  currentMonthSessions: number;
  currentMonthVolume: number;
  currentMonthAvgSets: number;
  volumeDeltaPct: number | null;
  sessionsDelta?: number;
}

export interface MuscleRecoveryEntry {
  muscle: string;
  label: string;
  status: 'fresh' | 'building' | 'fatigued';
  sessions: number;
}

export interface RecommendedRoutine {
  routine: Routine | null;
  reason: string;
  reasons: string[];
}

export interface CreateRoutineInput {
  name: string;
  split_tag?: string | null;
  estimated_duration_min?: number | null;
  schedule_day?: string | null;
  goal_tag?: string | null;
  description?: string | null;
  is_primary?: boolean;
  exercises: RoutineExercise[];
}

export interface WorkoutSessionDetail {
  session: WorkoutHistory | null;
  sets: WorkoutSet[];
  exerciseBreakdown: Array<{
    exercise_id: string;
    exercise_name: string;
    sets: number;
    total_volume_kg: number;
    prs: number;
  }>;
  durationMin: number;
  exerciseNotes?: Record<string, string>;
}

export interface WorkoutSummaryData {
  sessionId: string;
  name: string;
  durationMin: number;
  totalVolume: number;
  setsCount: number;
  prs: WorkoutSet[];
  musclesWorked: string[];
  notes?: string | null;
  totalReps?: number;
  estimatedCalories?: number;
}

export interface WorkoutPersonalRecord {
  exercise_id: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  updated_at: string;
}

export interface WorkoutSettings {
  defaultRestSeconds: number;
  autoStartRest: boolean;
  keepScreenAwake: boolean;
  hapticsEnabled: boolean;
  showHints: boolean;
  restAlertMode: 'soft' | 'strong' | 'sound' | 'silent';
  units: 'kg';
  restPresets: number[];
}

export interface WorkoutProgramAssignment {
  programId: string | null;
  startedAt: string | null;
  currentWeek: number;
  currentDay: number;
}
