// ============================================================
// VYRA FITNESS - WatermelonDB facade
// Exposes the local DB instance and validates required tables.
// ============================================================

import { database, adapter } from '@/database/watermelon';
import schema from '@/database/schema';

export const REQUIRED_OFFLINE_TABLES = [
  'water_logs',
  'step_logs',
  'meals',
  'sleep_logs',
  'weight_logs',
  'workout_sessions',
  'mental_checkins',
  'fasting_logs',
] as const;

export type RequiredOfflineTable = (typeof REQUIRED_OFFLINE_TABLES)[number];

export function assertRequiredTables(): { ok: boolean; missing: string[] } {
  const schemaTables = new Set(
    Object.keys((schema as any).tables ?? {})
  );
  const missing = REQUIRED_OFFLINE_TABLES.filter((table) => !schemaTables.has(table));

  return {
    ok: missing.length === 0,
    missing,
  };
}

export { database, adapter, schema };

export default database;
