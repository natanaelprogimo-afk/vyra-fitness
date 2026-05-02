// ============================================================
// VYRA FITNESS - WatermelonDB placeholder
// La capa offline fue retirada temporalmente.
// ============================================================

import { database, adapter } from '@/database/watermelon';

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

export { database, adapter };

export default database;
