import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface OfflineSleepLogSyncPayload {
  start_time: string;
  end_time: string;
  duration_min: number;
  quality_score: number;
  deep_min: number;
  rem_min: number;
  light_min: number;
  awake_min: number;
  source: string;
  notes: string | null;
}

export interface OfflineSleepEntry {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  quality_score: number;
  deep_min: number;
  rem_min: number;
  light_min: number;
  awake_min: number;
  source: string;
  notes: string | null;
  created_at: string;
  synced: boolean;
  pending_operation: 'insert' | 'delete' | null;
  remote_id: string | null;
  sync_payload: OfflineSleepLogSyncPayload | null;
}

type CachedSleepEntryInput = Pick<
  OfflineSleepEntry,
  | 'id'
  | 'user_id'
  | 'start_time'
  | 'end_time'
  | 'duration_min'
  | 'quality_score'
  | 'deep_min'
  | 'rem_min'
  | 'light_min'
  | 'awake_min'
  | 'source'
  | 'notes'
  | 'created_at'
>;

function storageKey(userId: string) {
  return `@vyra/sleep/offline/${userId}`;
}

function sortEntries(entries: OfflineSleepEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime(),
  );
}

function normalizeRemoteEntry(entry: CachedSleepEntryInput): OfflineSleepEntry {
  return {
    ...entry,
    synced: true,
    pending_operation: null,
    remote_id: entry.id,
    sync_payload: null,
  };
}

async function readEntries(userId: string): Promise<OfflineSleepEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is OfflineSleepEntry => Boolean(row && typeof row === 'object'));
  } catch {
    return [];
  }
}

async function writeEntries(userId: string, entries: OfflineSleepEntry[]) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(sortEntries(entries)));
}

export async function cacheRemoteSleepEntries(userId: string, entries: CachedSleepEntryInput[]) {
  const existing = await readEntries(userId);
  const pendingLocal = existing.filter(
    (row) => row.pending_operation === 'insert' && !row.remote_id,
  );
  const pendingDeletes = existing.filter(
    (row) => row.pending_operation === 'delete' && row.remote_id,
  );
  const deletedRemoteIds = new Set(
    pendingDeletes.map((row) => row.remote_id).filter((value): value is string => Boolean(value)),
  );

  const merged = [
    ...entries
      .filter((entry) => !deletedRemoteIds.has(entry.id))
      .map(normalizeRemoteEntry),
    ...pendingLocal,
    ...pendingDeletes,
  ];
  await writeEntries(userId, merged);
  return sortEntries(merged);
}

export async function getOfflineSleepHistory(userId: string) {
  const rows = await readEntries(userId);
  return sortEntries(rows.filter((row) => row.pending_operation !== 'delete'));
}

export async function queueOfflineSleepEntry(
  userId: string,
  input: Omit<
    OfflineSleepEntry,
    'id' | 'user_id' | 'created_at' | 'synced' | 'pending_operation' | 'remote_id'
  >,
) {
  const rows = await readEntries(userId);
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: OfflineSleepEntry = {
    id,
    user_id: userId,
    start_time: input.start_time,
    end_time: input.end_time,
    duration_min: input.duration_min,
    quality_score: input.quality_score,
    deep_min: input.deep_min,
    rem_min: input.rem_min,
    light_min: input.light_min,
    awake_min: input.awake_min,
    source: input.source,
    notes: input.notes,
    created_at: new Date().toISOString(),
    synced: false,
    pending_operation: 'insert',
    remote_id: null,
    sync_payload: input.sync_payload,
  };

  await writeEntries(userId, [...rows, record]);
  return id;
}

export async function deleteOfflineSleepEntry(userId: string, entryId: string) {
  const rows = await readEntries(userId);
  const nextRows = rows.flatMap((row) => {
    const matches = row.id === entryId || row.remote_id === entryId;
    if (!matches) return [row];

    if (row.pending_operation === 'insert' && !row.remote_id) {
      return [];
    }

    if (row.remote_id) {
      return [
        {
          ...row,
          synced: false,
          pending_operation: 'delete' as const,
          sync_payload: null,
        },
      ];
    }

    return [];
  });

  await writeEntries(userId, nextRows);
}

export async function flushOfflineSleepEntries(userId: string) {
  const rows = await readEntries(userId);
  if (!rows.length) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const nextRows: OfflineSleepEntry[] = [];

  for (const row of rows) {
    try {
      if (row.pending_operation === 'insert' && row.sync_payload) {
        const { data, error } = await supabase
          .from('sleep_logs')
          .insert({
            user_id: userId,
            ...row.sync_payload,
          })
          .select('id')
          .single();

        if (error) throw error;

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

      if (row.pending_operation === 'delete' && row.remote_id) {
        const { error } = await supabase
          .from('sleep_logs')
          .delete()
          .eq('id', row.remote_id)
          .eq('user_id', userId);

        if (error) throw error;

        synced += 1;
        continue;
      }

      nextRows.push(row);
    } catch {
      failed += 1;
      nextRows.push(row);
    }
  }

  await writeEntries(userId, nextRows);
  return { synced, failed };
}
