import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

type RemoteWaterLog = {
  id: string;
  user_id: string;
  amount_ml: number;
  drink_type: string;
  hydration_equivalent_ml: number;
  logged_at: string;
  created_at?: string | null;
};

export type OfflineWaterLog = {
  id: string;
  user_id: string;
  amount_ml: number;
  drink_type: string;
  hydration_equivalent_ml: number;
  logged_at: string;
  created_at: string;
  logged_date: string;
  deleted: boolean;
  synced: boolean;
  pending_operation: 'insert' | 'delete' | null;
  remote_id: string | null;
};

function storageKey(userId: string) {
  return `@vyra/water/offline/${userId}`;
}

function toLoggedDate(value: string) {
  return value.split('T')[0] ?? value;
}

function normalizeRemoteLog(row: RemoteWaterLog): OfflineWaterLog {
  return {
    id: row.id,
    user_id: row.user_id,
    amount_ml: row.amount_ml,
    drink_type: row.drink_type,
    hydration_equivalent_ml: row.hydration_equivalent_ml,
    logged_at: row.logged_at,
    created_at: row.created_at ?? row.logged_at,
    logged_date: toLoggedDate(row.logged_at),
    deleted: false,
    synced: true,
    pending_operation: null,
    remote_id: row.id,
  };
}

async function readLogs(userId: string): Promise<OfflineWaterLog[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is OfflineWaterLog => Boolean(row && typeof row === 'object'));
  } catch {
    return [];
  }
}

async function writeLogs(userId: string, logs: OfflineWaterLog[]) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(logs));
}

export async function cacheRemoteWaterLogs(userId: string, logs: RemoteWaterLog[]) {
  const existing = await readLogs(userId);
  const pendingDeleteIds = new Set(
    existing
      .filter((row) => row.pending_operation === 'delete')
      .map((row) => row.remote_id ?? row.id),
  );
  const pendingDeletes = existing.filter((row) => row.pending_operation === 'delete');
  const pendingLocal = existing.filter(
    (row) =>
      !row.deleted &&
      row.pending_operation === 'insert' &&
      !row.remote_id,
  );

  const remoteRows = logs
    .map(normalizeRemoteLog)
    .filter((row) => !pendingDeleteIds.has(row.remote_id ?? row.id));
  const merged = [...remoteRows, ...pendingDeletes];

  for (const row of pendingLocal) {
    if (row.pending_operation === 'delete') continue;
    merged.push(row);
  }

  merged.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
  await writeLogs(userId, merged);
  return merged;
}

export async function getOfflineWaterLogsForDay(userId: string, dayIso: string) {
  const rows = await readLogs(userId);
  return rows
    .filter((row) => !row.deleted && row.logged_date === dayIso)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
}

export async function getOfflineWaterHistory(userId: string) {
  const rows = await readLogs(userId);
  return rows
    .filter((row) => !row.deleted)
    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
}

export async function queueOfflineWaterLog(
  userId: string,
  input: Omit<OfflineWaterLog, 'id' | 'user_id' | 'created_at' | 'deleted' | 'synced' | 'pending_operation' | 'remote_id'>,
) {
  const rows = await readLogs(userId);
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: OfflineWaterLog = {
    id,
    user_id: userId,
    amount_ml: input.amount_ml,
    drink_type: input.drink_type,
    hydration_equivalent_ml: input.hydration_equivalent_ml,
    logged_at: input.logged_at,
    logged_date: input.logged_date,
    created_at: input.logged_at,
    deleted: false,
    synced: false,
    pending_operation: 'insert',
    remote_id: null,
  };

  const next = [...rows, record].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
  );
  await writeLogs(userId, next);
  return id;
}

export async function deleteOfflineWaterLog(userId: string, logId: string) {
  const rows = await readLogs(userId);
  const next = rows
    .map((row) => {
      if (row.id !== logId) return row;

      if (row.pending_operation === 'insert' && !row.remote_id) {
        return null;
      }

      return {
        ...row,
        deleted: true,
        synced: false,
        pending_operation: 'delete' as const,
      };
    })
    .filter((row): row is OfflineWaterLog => Boolean(row));

  await writeLogs(userId, next);
}

export async function flushOfflineWaterLogs(userId: string) {
  const rows = await readLogs(userId);
  if (!rows.length) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const nextRows: OfflineWaterLog[] = [];

  for (const row of rows) {
    try {
      if (row.pending_operation === 'insert') {
        const { data, error } = await supabase
          .from('water_logs')
          .insert({
            user_id: userId,
            amount_ml: row.amount_ml,
            drink_type: row.drink_type,
            hydration_equivalent_ml: row.hydration_equivalent_ml,
            logged_at: row.logged_at,
          })
          .select('*')
          .single();

        if (error) throw error;

        nextRows.push(normalizeRemoteLog(data as RemoteWaterLog));
        synced += 1;
        continue;
      }

      if (row.pending_operation === 'delete') {
        const remoteId = row.remote_id ?? row.id;
        const { error } = await supabase
          .from('water_logs')
          .delete()
          .eq('id', remoteId)
          .eq('user_id', userId);

        if (error) throw error;
        synced += 1;
        continue;
      }

      if (!row.deleted) {
        nextRows.push(row);
      }
    } catch {
      failed += 1;
      nextRows.push(row);
    }
  }

  nextRows.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
  await writeLogs(userId, nextRows);
  return { synced, failed };
}
