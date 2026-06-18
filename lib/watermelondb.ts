// ============================================================
// VYRA FITNESS - WatermelonDB DEPRECATED
// WatermelonDB was removed in favor of AsyncStorage + SyncQueue
// See: OFFLINE_STRATEGY.md for current offline-first approach
// ============================================================

// @deprecated Use AsyncStorage + SyncQueue instead
const DEPRECATED_DATABASE = null;

export const REQUIRED_OFFLINE_TABLES = [] as const;

export type RequiredOfflineTable = never;

export function assertRequiredTables(): { ok: boolean; missing: string[] } {
  return {
    ok: true,
    missing: [],
  };
}

export const schema = {
  versión: 0,
  tables: [],
} as const;

export default DEPRECATED_DATABASE;
