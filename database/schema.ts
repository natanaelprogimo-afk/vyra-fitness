// ============================================================
// VYRA FITNESS — WatermelonDB Schema
// Base de datos local SQLite para modo offline-first
// Toda la app escribe aquí primero, luego sincroniza a Supabase
// ============================================================

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // ─── Perfil local (cache) ──────────────────────────────
    tableSchema({
      name: 'profiles',
      columns: [
        { name: 'server_id',           type: 'string'  },
        { name: 'name',                type: 'string'  },
        { name: 'email',               type: 'string'  },
        { name: 'avatar_url',          type: 'string',  isOptional: true },
        { name: 'level',               type: 'number'  },
        { name: 'xp',                  type: 'number'  },
        { name: 'coins',               type: 'number'  },
        { name: 'streak',              type: 'number'  },
        { name: 'best_streak',         type: 'number'  },
        { name: 'is_premium',          type: 'boolean' },
        { name: 'step_goal',           type: 'number'  },
        { name: 'water_goal_ml',       type: 'number'  },
        { name: 'calorie_goal',        type: 'number'  },
        { name: 'sleep_goal_hours',    type: 'number'  },
        { name: 'wake_time_minutes',   type: 'number'  },
        { name: 'sleep_time_minutes',  type: 'number'  },
        { name: 'updated_at',          type: 'number'  }, // unix timestamp
      ],
    }),

    // ─── Hidratación ──────────────────────────────────────
    tableSchema({
      name: 'water_logs',
      columns: [
        { name: 'server_id',              type: 'string',  isOptional: true },
        { name: 'user_id',                type: 'string'  },
        { name: 'amount_ml',              type: 'number'  },
        { name: 'drink_type',             type: 'string'  },
        { name: 'hydration_equivalent_ml',type: 'number'  },
        { name: 'logged_at',              type: 'number'  }, // unix ms
        { name: 'synced',                 type: 'boolean' },
        { name: 'deleted',                type: 'boolean' }, // soft delete para sync
        { name: 'created_at',             type: 'number'  },
      ],
    }),

    // ─── Pasos ────────────────────────────────────────────
    tableSchema({
      name: 'step_logs',
      columns: [
        { name: 'server_id',       type: 'string',  isOptional: true },
        { name: 'user_id',         type: 'string'  },
        { name: 'steps',           type: 'number'  },
        { name: 'distance_m',      type: 'number'  },
        { name: 'calories',        type: 'number'  },
        { name: 'active_minutes',  type: 'number'  },
        { name: 'source',          type: 'string'  },
        { name: 'logged_date',     type: 'string'  }, // YYYY-MM-DD
        { name: 'synced',          type: 'boolean' },
        { name: 'created_at',      type: 'number'  },
      ],
    }),

    // ─── Ayuno ────────────────────────────────────────────
    tableSchema({
      name: 'fasting_logs',
      columns: [
        { name: 'server_id',               type: 'string',  isOptional: true },
        { name: 'user_id',                 type: 'string'  },
        { name: 'protocol',                type: 'string'  },
        { name: 'start_time',              type: 'number'  },
        { name: 'end_time',                type: 'number',  isOptional: true },
        { name: 'completed',               type: 'boolean' },
        { name: 'abandoned',               type: 'boolean' },
        { name: 'max_phase_reached',       type: 'string',  isOptional: true },
        { name: 'total_hours',             type: 'number',  isOptional: true },
        { name: 'phases_timestamps_json',  type: 'string'  }, // JSON string
        { name: 'notes',                   type: 'string',  isOptional: true },
        { name: 'synced',                  type: 'boolean' },
        { name: 'created_at',              type: 'number'  },
      ],
    }),

    // ─── Sueño ────────────────────────────────────────────
    tableSchema({
      name: 'sleep_logs',
      columns: [
        { name: 'server_id',    type: 'string',  isOptional: true },
        { name: 'user_id',      type: 'string'  },
        { name: 'start_time',   type: 'number'  },
        { name: 'end_time',     type: 'number'  },
        { name: 'duration_min', type: 'number'  },
        { name: 'quality_score',type: 'number'  },
        { name: 'deep_min',     type: 'number'  },
        { name: 'rem_min',      type: 'number'  },
        { name: 'light_min',    type: 'number'  },
        { name: 'awake_min',    type: 'number'  },
        { name: 'source',       type: 'string'  },
        { name: 'notes',        type: 'string',  isOptional: true },
        { name: 'synced',       type: 'boolean' },
        { name: 'created_at',   type: 'number'  },
      ],
    }),

    // ─── Check-in mental ──────────────────────────────────
    tableSchema({
      name: 'mental_checkins',
      columns: [
        { name: 'server_id',  type: 'string',  isOptional: true },
        { name: 'user_id',    type: 'string'  },
        { name: 'mood',       type: 'number'  },
        { name: 'energy',     type: 'number'  },
        { name: 'stress',     type: 'number'  },
        { name: 'motivation', type: 'number'  },
        { name: 'notes',      type: 'string',  isOptional: true },
        { name: 'check_date', type: 'string'  }, // YYYY-MM-DD
        { name: 'synced',     type: 'boolean' },
        { name: 'created_at', type: 'number'  },
      ],
    }),

    // ─── Comidas ──────────────────────────────────────────
    tableSchema({
      name: 'meals',
      columns: [
        { name: 'server_id',  type: 'string',  isOptional: true },
        { name: 'user_id',    type: 'string'  },
        { name: 'meal_type',  type: 'string'  },
        { name: 'food_name',  type: 'string'  },
        { name: 'food_id',    type: 'string',  isOptional: true },
        { name: 'calories',   type: 'number'  },
        { name: 'protein_g',  type: 'number'  },
        { name: 'carbs_g',    type: 'number'  },
        { name: 'fat_g',      type: 'number'  },
        { name: 'fiber_g',    type: 'number'  },
        { name: 'amount_g',   type: 'number'  },
        { name: 'source',     type: 'string'  },
        { name: 'logged_at',  type: 'number'  },
        { name: 'synced',     type: 'boolean' },
        { name: 'deleted',    type: 'boolean' },
        { name: 'created_at', type: 'number'  },
      ],
    }),

    // ─── Peso ─────────────────────────────────────────────
    tableSchema({
      name: 'weight_logs',
      columns: [
        { name: 'server_id',    type: 'string',  isOptional: true },
        { name: 'user_id',      type: 'string'  },
        { name: 'weight_kg',    type: 'number'  },
        { name: 'body_fat_pct', type: 'number',  isOptional: true },
        { name: 'notes',        type: 'string',  isOptional: true },
        { name: 'logged_at',    type: 'number'  },
        { name: 'synced',       type: 'boolean' },
        { name: 'created_at',   type: 'number'  },
      ],
    }),

    // ─── Sesiones de entreno ──────────────────────────────
    tableSchema({
      name: 'workout_sessions',
      columns: [
        { name: 'server_id',          type: 'string',  isOptional: true },
        { name: 'user_id',            type: 'string'  },
        { name: 'routine_id',         type: 'string',  isOptional: true },
        { name: 'name',               type: 'string'  },
        { name: 'started_at',         type: 'number'  },
        { name: 'ended_at',           type: 'number',  isOptional: true },
        { name: 'total_volume_kg',    type: 'number'  },
        { name: 'total_sets',         type: 'number'  },
        { name: 'total_reps',         type: 'number'  },
        { name: 'estimated_calories', type: 'number'  },
        { name: 'muscles_worked',     type: 'string'  }, // JSON array
        { name: 'notes',              type: 'string',  isOptional: true },
        { name: 'synced',             type: 'boolean' },
        { name: 'created_at',         type: 'number'  },
      ],
    }),

    // ─── Series de entreno ────────────────────────────────
    tableSchema({
      name: 'workout_sets',
      columns: [
        { name: 'server_id',  type: 'string',  isOptional: true },
        { name: 'session_id', type: 'string'  }, // local WDB id
        { name: 'exercise_id',type: 'string'  },
        { name: 'set_number', type: 'number'  },
        { name: 'reps',       type: 'number'  },
        { name: 'weight_kg',  type: 'number'  },
        { name: 'duration_sec',type:'number',  isOptional: true },
        { name: 'rest_sec',   type: 'number'  },
        { name: 'is_warmup',  type: 'boolean' },
        { name: 'is_pr',      type: 'boolean' },
        { name: 'synced',     type: 'boolean' },
        { name: 'created_at', type: 'number'  },
      ],
    }),

    // ─── Cola de sync (para operaciones offline) ─────────
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'table_name',   type: 'string' },
        { name: 'operation',    type: 'string' }, // insert | update | delete
        { name: 'record_id',    type: 'string' }, // WDB local id
        { name: 'server_id',    type: 'string', isOptional: true },
        { name: 'payload_json', type: 'string' }, // JSON del objeto completo
        { name: 'retries',      type: 'number' },
        { name: 'last_error',   type: 'string', isOptional: true },
        { name: 'created_at',   type: 'number' },
      ],
    }),
  ],
});

export default schema;
