/**
 * Guest to User Data Migration
 * Issue #10: Migrate all guest data to registered user
 * 
 * Called after successful email verification
 * Handles transfer of all data tables from guest UUID to new user UUID
 */

import { supabase } from '@/lib/auth/supabase';

/**
 * Data migration result
 */
export interface MigrationResult {
  success: boolean;
  newUserId: string;
  totalItemsMigrated: number;
  tableResults: Record<string, number>;
  error?: string;
}

/**
 * All tables that contain user data and need migration
 */
const DATA_TABLES = [
  'water_logs',
  'sleep_logs',
  'meals',
  'weight_logs',
  'fasting_sessions',
  'mental_checkins',
  'supplement_logs',
  'female_health_logs',
  'workout_sessions',
  'daily_scores',
] as const;

/**
 * Migrate all guest data to registered user
 * 
 * This is called AFTER the new user is created in Supabase Auth
 * The backend handles the actual database migration
 * This function verifies the migration was successful
 */
export async function migrateGuestDataToUser(
  guestUserId: string,
  newUserId: string
): Promise<MigrationResult> {
  try {
    // In production, call backend endpoint to perform migration
    // The backend has more access and can do bulk operations
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL}/api/guest/migrate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestUserId,
          newUserId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Migration failed');
    }

    const data = await response.json();

    return {
      success: true,
      newUserId,
      totalItemsMigrated: data.migratedItems || 0,
      tableResults: data.details || {},
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown migration error';
    console.error('Guest data migration error:', error);

    return {
      success: false,
      newUserId,
      totalItemsMigrated: 0,
      tableResults: {},
      error: message,
    };
  }
}

/**
 * Count all guest data before migration
 * Shows user what will be migrated
 */
export async function countGuestDataBeforeMigration(
  guestUserId: string
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const table of DATA_TABLES) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', guestUserId);

      counts[table] = count || 0;
    } catch (error) {
      console.error(`Error counting ${table}:`, error);
      counts[table] = 0;
    }
  }

  return counts;
}

/**
 * Verify migration was successful
 * Check that new user has all the data
 */
export async function verifyMigrationSuccess(
  newUserId: string,
  expectedTotalItems: number
): Promise<boolean> {
  try {
    let totalItems = 0;

    for (const table of DATA_TABLES) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', newUserId);

      totalItems += count || 0;
    }

    return totalItems === expectedTotalItems;
  } catch (error) {
    console.error('Error verifying migration:', error);
    return false;
  }
}

/**
 * Get migration details and statistics
 */
export async function getMigrationStats(newUserId: string) {
  const stats: Record<string, number> = {};

  for (const table of DATA_TABLES) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', newUserId);

      stats[table] = count || 0;
    } catch (error) {
      stats[table] = 0;
    }
  }

  const totalItems = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return {
    totalItems,
    byTable: stats,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Ensure all data tables have correct sync_state after migration
 * Set to 'pending' so they get synced immediately
 */
export async function ensureSyncStateAfterMigration(newUserId: string): Promise<void> {
  for (const table of DATA_TABLES) {
    try {
      await supabase
        .from(table)
        .update({ sync_state: 'pending' })
        .eq('user_id', newUserId)
        .neq('sync_state', 'pending'); // Only update if not already pending
    } catch (error) {
      console.error(`Error updating sync_state for ${table}:`, error);
    }
  }
}

/**
 * Cleanup: Delete guest profile after successful migration
 */
export async function cleanupGuestProfile(guestUserId: string): Promise<void> {
  try {
    // Mark guest profile as migrated
    await supabase
      .from('profiles')
      .update({
        is_guest: false,
        email: null, // Clear to prevent conflicts
      })
      .eq('id', guestUserId);
  } catch (error) {
    console.error('Error cleaning up guest profile:', error);
  }
}

/**
 * Check if guest has any pending data
 * Returns true if guest has any unsync'd records
 */
export async function hasGuestPendingData(guestUserId: string): Promise<boolean> {
  for (const table of DATA_TABLES) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', guestUserId);

      if ((count || 0) > 0) {
        return true;
      }
    } catch {
      // Continue to next table
    }
  }

  return false;
}
