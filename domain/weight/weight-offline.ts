import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface OfflineWeightLogSyncPayload {
  weight_kg: number | null;
  body_fat_pct: number | null;
  weight_kg_encrypted: string | null;
  body_fat_pct_encrypted: string | null;
  note: string | null;
  logged_at: string;
  profile_weight_current_kg: number | null;
}

export interface OfflineWeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  photo_url: string | null;
  note: string | null;
  logged_at: string;
  deleted: boolean;
  synced: boolean;
  pending_operation: 'insert' | 'delete' | null;
  remote_id: string | null;
  sync_payload: OfflineWeightLogSyncPayload | null;
}

type CachedWeightLogInput = Pick<
  OfflineWeightLog,
  'id' | 'user_id' | 'weight_kg' | 'body_fat_pct' | 'photo_url' | 'note' | 'logged_at'
>;

function storageKey(userId: string) {
  return `@vyra/weight/offline/${userId}`;
}

function sortLogs(logs: OfflineWeightLog[]) {
  return [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );
}

function normalizeRemoteLog(log: CachedWeightLogInput): OfflineWeightLog {
  return {
    ...log,
    deleted: false,
    synced: true,
    pending_operation: null,
    remote_id: log.id,
    sync_payload: null,
  };
}

async function readLogs(userId: string): Promise<OfflineWeightLog[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is OfflineWeightLog => Boolean(row && typeof row === 'object'));
  } catch {
    return [];
  }
}

async function writeLogs(userId: string, logs: OfflineWeightLog[]) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(sortLogs(logs)));
}

export async function cacheRemoteWeightLogs(userId: string, logs: CachedWeightLogInput[]) {
  const existing = await readLogs(userId);
  const pendingDeleteIds = new Set(
    existing
      .filter((row) => row.pending_operation === 'delete')
      .map((row) => row.remote_id ?? row.id),
  );
  const pendingDeletes = existing.filter((row) => row.pending_operation === 'delete');
  const pendingLocal = existing.filter(
    (row) => !row.deleted && row.pending_operation === 'insert' && !row.remote_id,
  );

  const remoteRows = logs
    .map(normalizeRemoteLog)
    .filter((row) => !pendingDeleteIds.has(row.remote_id ?? row.id));

  const merged = [...remoteRows, ...pendingDeletes, ...pendingLocal];
  await writeLogs(userId, merged);
  return sortLogs(merged);
}

export async function getOfflineWeightLogs(userId: string) {
  const rows = await readLogs(userId);
  return sortLogs(rows.filter((row) => !row.deleted));
}

export async function queueOfflineWeightLog(
  userId: string,
  input: Omit<
    OfflineWeightLog,
    'id' | 'user_id' | 'deleted' | 'synced' | 'pending_operation' | 'remote_id'
  >,
) {
  const rows = await readLogs(userId);
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: OfflineWeightLog = {
    id,
    user_id: userId,
    weight_kg: input.weight_kg,
    body_fat_pct: input.body_fat_pct,
    photo_url: input.photo_url,
    note: input.note,
    logged_at: input.logged_at,
    deleted: false,
    synced: false,
    pending_operation: 'insert',
    remote_id: null,
    sync_payload: input.sync_payload,
  };

  await writeLogs(userId, [...rows, record]);
  return id;
}

export async function deleteOfflineWeightLog(userId: string, logId: string) {
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
    .filter((row): row is OfflineWeightLog => Boolean(row));

  await writeLogs(userId, next);
}

export async function flushOfflineWeightLogs(userId: string) {
  const rows = await readLogs(userId);
  if (!rows.length) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const nextRows: OfflineWeightLog[] = [];

  for (const row of rows) {
    try {
      if (row.pending_operation === 'insert' && row.sync_payload) {
        let insertPayload: Record<string, unknown> = {
          user_id: userId,
          weight_kg: row.sync_payload.weight_kg,
          body_fat_pct: row.sync_payload.body_fat_pct,
          weight_kg_encrypted: row.sync_payload.weight_kg_encrypted,
          body_fat_pct_encrypted: row.sync_payload.body_fat_pct_encrypted,
          note: row.sync_payload.note,
          logged_at: row.sync_payload.logged_at,
        };

        let { data, error } = await supabase
          .from('weight_logs')
          .insert(insertPayload)
          .select('id')
          .single();

        if (error) {
          const message = String((error as { message?: unknown }).message ?? '');
          const missingSecureColumns =
            message.includes('weight_kg_encrypted') || message.includes('body_fat_pct_encrypted');

          if (missingSecureColumns) {
            insertPayload = {
              user_id: userId,
              weight_kg: row.sync_payload.weight_kg,
              body_fat_pct: row.sync_payload.body_fat_pct,
              note: row.sync_payload.note,
              logged_at: row.sync_payload.logged_at,
            };
            const fallback = await supabase
              .from('weight_logs')
              .insert(insertPayload)
              .select('id')
              .single();
            data = fallback.data;
            error = fallback.error;
          }
        }

        if (error) throw error;

        if (row.sync_payload.profile_weight_current_kg !== null) {
          await supabase
            .from('profiles')
            .update({ weight_current_kg: row.sync_payload.profile_weight_current_kg })
            .eq('id', userId);
        }

        if (!data?.id) {
          throw new Error('No se pudo confirmar el id del registro de peso sincronizado.');
        }

        nextRows.push({
          ...row,
          id: data.id,
          remote_id: data.id,
          synced: true,
          pending_operation: null,
          sync_payload: null,
        });
        synced += 1;
        continue;
      }

      if (row.pending_operation === 'delete') {
        const remoteId = row.remote_id ?? row.id;
        const { error } = await supabase
          .from('weight_logs')
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

  await writeLogs(userId, nextRows);
  return { synced, failed };
}
