// ============================================================
// VYRA FITNESS - WatermelonDB migrations
// ============================================================

import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'female_health_logs',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'phase', type: 'string', isOptional: true },
            { name: 'phase_encrypted', type: 'string', isOptional: true },
            { name: 'symptoms_json', type: 'string' },
            { name: 'notes', type: 'string', isOptional: true },
            { name: 'logged_at', type: 'number' },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'supplements',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'dose', type: 'number', isOptional: true },
            { name: 'unit', type: 'string', isOptional: true },
            { name: 'frequency', type: 'string', isOptional: true },
            { name: 'reminder_times_json', type: 'string', isOptional: true },
            { name: 'active', type: 'boolean' },
            { name: 'catalog_id', type: 'string', isOptional: true },
            { name: 'notes', type: 'string', isOptional: true },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'supplement_logs',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'supplement_id', type: 'string' },
            { name: 'taken_at', type: 'number' },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'mental_checkins',
          columns: [
            { name: 'mood_encrypted', type: 'string', isOptional: true },
            { name: 'energy_encrypted', type: 'string', isOptional: true },
            { name: 'stress_encrypted', type: 'string', isOptional: true },
            { name: 'motivation_encrypted', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'meals',
          columns: [
            { name: 'sodium_mg', type: 'number', isOptional: true },
          ],
        }),
        addColumns({
          table: 'weight_logs',
          columns: [
            { name: 'muscle_mass_kg', type: 'number', isOptional: true },
            { name: 'weight_kg_encrypted', type: 'string', isOptional: true },
            { name: 'body_fat_pct_encrypted', type: 'string', isOptional: true },
            { name: 'photo_url', type: 'string', isOptional: true },
            { name: 'photo_path', type: 'string', isOptional: true },
          ],
        }),
        createTable({
          name: 'recovery_logs',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'date', type: 'string' },
            { name: 'score', type: 'number' },
            { name: 'factors_json', type: 'string' },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'exercise_prs',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'exercise_id', type: 'string' },
            { name: 'weight_kg', type: 'number' },
            { name: 'reps', type: 'number' },
            { name: 'volume_kg', type: 'number' },
            { name: 'achieved_at', type: 'number' },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'nutrition_logs',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'meal_type', type: 'string' },
            { name: 'food_items_json', type: 'string' },
            { name: 'total_kcal', type: 'number' },
            { name: 'protein_g', type: 'number' },
            { name: 'carbs_g', type: 'number' },
            { name: 'fat_g', type: 'number' },
            { name: 'date', type: 'string' },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'female_cycle_logs',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'date', type: 'string' },
            { name: 'cycle_day', type: 'number' },
            { name: 'phase', type: 'string' },
            { name: 'symptoms_json', type: 'string' },
            { name: 'flow_intensity', type: 'number', isOptional: true },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'gamification',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'xp', type: 'number' },
            { name: 'coins', type: 'number' },
            { name: 'level', type: 'number' },
            { name: 'streaks_json', type: 'string' },
            { name: 'badges_json', type: 'string' },
            { name: 'last_updated', type: 'number' },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'user_profile',
          columns: [
            { name: 'server_id', type: 'string', isOptional: true },
            { name: 'user_id', type: 'string' },
            { name: 'name', type: 'string', isOptional: true },
            { name: 'age', type: 'number', isOptional: true },
            { name: 'weight_kg', type: 'number', isOptional: true },
            { name: 'height_cm', type: 'number', isOptional: true },
            { name: 'goal', type: 'string', isOptional: true },
            { name: 'nutrition_mode', type: 'string', isOptional: true },
            { name: 'active_modules_json', type: 'string' },
            { name: 'premium', type: 'boolean' },
            { name: 'cycle_active', type: 'boolean' },
            { name: 'synced', type: 'boolean' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'profiles',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'water_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'step_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'fasting_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'sleep_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'mental_checkins',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'female_health_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'supplements',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'supplement_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'meals',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'weight_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'recovery_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'exercise_prs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'nutrition_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'female_cycle_logs',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'gamification',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'user_profile',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'workout_sessions',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'workout_sets',
          columns: [
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: 'step_logs',
          columns: [
            { name: 'distance_km', type: 'number', isOptional: true },
            { name: 'date', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'fasting_logs',
          columns: [
            { name: 'duration_h', type: 'number', isOptional: true },
          ],
        }),
        addColumns({
          table: 'sleep_logs',
          columns: [
            { name: 'sleep_score', type: 'number', isOptional: true },
          ],
        }),
        addColumns({
          table: 'mental_checkins',
          columns: [
            { name: 'date', type: 'string', isOptional: true },
            { name: 'note', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'supplements',
          columns: [
            { name: 'times_of_day', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'supplement_logs',
          columns: [
            { name: 'taken', type: 'boolean', isOptional: true },
            { name: 'date', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'weight_logs',
          columns: [
            { name: 'photo_uri', type: 'string', isOptional: true },
            { name: 'note', type: 'string', isOptional: true },
            { name: 'date', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'recovery_logs',
          columns: [
            { name: 'factors', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'nutrition_logs',
          columns: [
            { name: 'food_items', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'female_cycle_logs',
          columns: [
            { name: 'symptoms', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'gamification',
          columns: [
            { name: 'streaks', type: 'string', isOptional: true },
            { name: 'badges', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'user_profile',
          columns: [
            { name: 'active_modules', type: 'string', isOptional: true },
          ],
        }),
        addColumns({
          table: 'workout_sessions',
          columns: [
            { name: 'start_time', type: 'number', isOptional: true },
            { name: 'end_time', type: 'number', isOptional: true },
            { name: 'exercises', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});

export default migrations;
