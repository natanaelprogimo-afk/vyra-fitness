// ============================================================
// VYRA FITNESS — WatermelonDB Models
// Modelos para cada tabla local. Extienden Model de WDB.
// ============================================================

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

// ─── WaterLog ─────────────────────────────────────────────

export class WaterLog extends Model {
  static table = 'water_logs';

  @field('server_id')              server_id!:               string | null;
  @field('user_id')                user_id!:                 string;
  @field('amount_ml')              amount_ml!:               number;
  @field('drink_type')             drink_type!:              string;
  @field('hydration_equivalent_ml')hydration_equivalent_ml!: number;
  @field('logged_at')              logged_at!:               number;
  @field('synced')                 synced!:                  boolean;
  @field('deleted')                deleted!:                 boolean;
  @readonly @date('created_at')    created_at!:              Date;
}

// ─── StepLog ──────────────────────────────────────────────

export class StepLog extends Model {
  static table = 'step_logs';

  @field('server_id')      server_id!:      string | null;
  @field('user_id')        user_id!:        string;
  @field('steps')          steps!:          number;
  @field('distance_m')     distance_m!:     number;
  @field('calories')       calories!:       number;
  @field('active_minutes') active_minutes!: number;
  @field('source')         source!:         string;
  @field('logged_date')    logged_date!:    string;
  @field('synced')         synced!:         boolean;
  @readonly @date('created_at') created_at!: Date;
}

// ─── FastingLog ───────────────────────────────────────────

export class FastingLog extends Model {
  static table = 'fasting_logs';

  @field('server_id')              server_id!:             string | null;
  @field('user_id')                user_id!:               string;
  @field('protocol')               protocol!:              string;
  @field('start_time')             start_time!:            number;
  @field('end_time')               end_time!:              number | null;
  @field('completed')              completed!:             boolean;
  @field('abandoned')              abandoned!:             boolean;
  @field('max_phase_reached')      max_phase_reached!:     string | null;
  @field('total_hours')            total_hours!:           number | null;
  @field('phases_timestamps_json') phases_timestamps_json!:string;
  @field('notes')                  notes!:                 string | null;
  @field('synced')                 synced!:                boolean;
  @readonly @date('created_at')    created_at!:            Date;
}

// ─── SleepLog ────────────────────────────────────────────

export class SleepLog extends Model {
  static table = 'sleep_logs';

  @field('server_id')   server_id!:    string | null;
  @field('user_id')     user_id!:      string;
  @field('start_time')  start_time!:   number;
  @field('end_time')    end_time!:     number;
  @field('duration_min')duration_min!: number;
  @field('quality_score')quality_score!:number;
  @field('deep_min')    deep_min!:     number;
  @field('rem_min')     rem_min!:      number;
  @field('light_min')   light_min!:    number;
  @field('awake_min')   awake_min!:    number;
  @field('source')      source!:       string;
  @field('notes')       notes!:        string | null;
  @field('synced')      synced!:       boolean;
  @readonly @date('created_at') created_at!: Date;
}

// ─── MentalCheckin ────────────────────────────────────────

export class MentalCheckin extends Model {
  static table = 'mental_checkins';

  @field('server_id')  server_id!:  string | null;
  @field('user_id')    user_id!:    string;
  @field('mood')       mood!:       number;
  @field('energy')     energy!:     number;
  @field('stress')     stress!:     number;
  @field('motivation') motivation!: number;
  @field('notes')      notes!:      string | null;
  @field('check_date') check_date!: string;
  @field('synced')     synced!:     boolean;
  @readonly @date('created_at') created_at!: Date;
}

// ─── Meal ─────────────────────────────────────────────────

export class Meal extends Model {
  static table = 'meals';

  @field('server_id') server_id!: string | null;
  @field('user_id')   user_id!:   string;
  @field('meal_type') meal_type!: string;
  @field('food_name') food_name!: string;
  @field('food_id')   food_id!:   string | null;
  @field('calories')  calories!:  number;
  @field('protein_g') protein_g!: number;
  @field('carbs_g')   carbs_g!:   number;
  @field('fat_g')     fat_g!:     number;
  @field('fiber_g')   fiber_g!:   number;
  @field('amount_g')  amount_g!:  number;
  @field('source')    source!:    string;
  @field('logged_at') logged_at!: number;
  @field('synced')    synced!:    boolean;
  @field('deleted')   deleted!:   boolean;
  @readonly @date('created_at') created_at!: Date;
}

// ─── WeightLog ────────────────────────────────────────────

export class WeightLog extends Model {
  static table = 'weight_logs';

  @field('server_id')    server_id!:    string | null;
  @field('user_id')      user_id!:      string;
  @field('weight_kg')    weight_kg!:    number;
  @field('body_fat_pct') body_fat_pct!: number | null;
  @field('notes')        notes!:        string | null;
  @field('logged_at')    logged_at!:    number;
  @field('synced')       synced!:       boolean;
  @readonly @date('created_at') created_at!: Date;
}

// ─── WorkoutSession ───────────────────────────────────────

export class WorkoutSession extends Model {
  static table = 'workout_sessions';

  @field('server_id')          server_id!:          string | null;
  @field('user_id')            user_id!:            string;
  @field('routine_id')         routine_id!:         string | null;
  @field('name')               name!:               string;
  @field('started_at')         started_at!:         number;
  @field('ended_at')           ended_at!:           number | null;
  @field('total_volume_kg')    total_volume_kg!:    number;
  @field('total_sets')         total_sets!:         number;
  @field('total_reps')         total_reps!:         number;
  @field('estimated_calories') estimated_calories!: number;
  @field('muscles_worked')     muscles_worked!:     string;
  @field('notes')              notes!:              string | null;
  @field('synced')             synced!:             boolean;
  @readonly @date('created_at') created_at!:        Date;
}

// ─── WorkoutSet ───────────────────────────────────────────

export class WorkoutSet extends Model {
  static table = 'workout_sets';

  @field('server_id')   server_id!:    string | null;
  @field('session_id')  session_id!:   string;
  @field('exercise_id') exercise_id!:  string;
  @field('set_number')  set_number!:   number;
  @field('reps')        reps!:         number;
  @field('weight_kg')   weight_kg!:    number;
  @field('duration_sec')duration_sec!: number | null;
  @field('rest_sec')    rest_sec!:     number;
  @field('is_warmup')   is_warmup!:    boolean;
  @field('is_pr')       is_pr!:        boolean;
  @field('synced')      synced!:       boolean;
  @readonly @date('created_at') created_at!: Date;
}

// ─── SyncQueue ────────────────────────────────────────────

export class SyncQueueItem extends Model {
  static table = 'sync_queue';

  @field('table_name')   table_name!:   string;
  @field('operation')    operation!:    string;
  @field('record_id')    record_id!:    string;
  @field('server_id')    server_id!:    string | null;
  @field('payload_json') payload_json!: string;
  @field('retries')      retries!:      number;
  @field('last_error')   last_error!:   string | null;
  @readonly @date('created_at') created_at!: Date;
}
