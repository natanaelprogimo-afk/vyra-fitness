import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface OfflineMealLogSyncPayload {
  meal_type: string;
  food_name: string;
  food_id: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  amount_g: number;
  logged_at: string;
  source: string;
}

export interface OfflineMealEntry extends OfflineMealLogSyncPayload {
  id: string;
  user_id: string;
  synced: boolean;
  pending_operation: 'insert' | 'update' | 'delete' | null;
  remote_id: string | null;
  sync_payload: OfflineMealLogSyncPayload | null;
}

type CachedMealEntryInput = Pick<
  OfflineMealEntry,
  | 'id'
  | 'user_id'
  | 'meal_type'
  | 'food_name'
  | 'food_id'
  | 'calories'
  | 'protein_g'
  | 'carbs_g'
  | 'fat_g'
  | 'fiber_g'
  | 'amount_g'
  | 'logged_at'
  | 'source'
>;

function storageKey(userId: string) {
  return `@vyra/nutrition/offline/${userId}`;
}

function sortEntries(entries: OfflineMealEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
  );
}

function normalizeRemoteEntry(entry: CachedMealEntryInput): OfflineMealEntry {
  return {
    ...entry,
    synced: true,
    pending_operation: null,
    remote_id: entry.id,
    sync_payload: null,
  };
}

async function readEntries(userId: string): Promise<OfflineMealEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is OfflineMealEntry => Boolean(row && typeof row === 'object'));
  } catch {
    return [];
  }
}

async function writeEntries(userId: string, entries: OfflineMealEntry[]) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(sortEntries(entries)));
}

export async function cacheRemoteMealEntries(userId: string, entries: CachedMealEntryInput[]) {
  const existing = await readEntries(userId);
  const pendingLocal = existing.filter(
    (row) => row.pending_operation === 'insert' && !row.remote_id,
  );
  const pendingUpdates = existing.filter(
    (row) => row.pending_operation === 'update' && row.remote_id,
  );
  const pendingDeletes = existing.filter(
    (row) => row.pending_operation === 'delete' && row.remote_id,
  );
  const deletedRemoteIds = new Set(
    pendingDeletes.map((row) => row.remote_id).filter((value): value is string => Boolean(value)),
  );
  const updatedRemoteIds = new Set(
    pendingUpdates.map((row) => row.remote_id).filter((value): value is string => Boolean(value)),
  );

  const merged = [
    ...entries
      .filter((entry) => !deletedRemoteIds.has(entry.id) && !updatedRemoteIds.has(entry.id))
      .map(normalizeRemoteEntry),
    ...pendingUpdates,
    ...pendingLocal,
    ...pendingDeletes,
  ];

  await writeEntries(userId, merged);
  return sortEntries(merged);
}

export async function getOfflineMealEntries(userId: string) {
  const rows = await readEntries(userId);
  return sortEntries(rows.filter((row) => row.pending_operation !== 'delete'));
}

export async function queueOfflineMealEntry(
  userId: string,
  input: Omit<OfflineMealEntry, 'id' | 'user_id' | 'synced' | 'pending_operation' | 'remote_id'>,
) {
  const rows = await readEntries(userId);
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: OfflineMealEntry = {
    id,
    user_id: userId,
    meal_type: input.meal_type,
    food_name: input.food_name,
    food_id: input.food_id,
    calories: input.calories,
    protein_g: input.protein_g,
    carbs_g: input.carbs_g,
    fat_g: input.fat_g,
    fiber_g: input.fiber_g,
    amount_g: input.amount_g,
    logged_at: input.logged_at,
    source: input.source,
    synced: false,
    pending_operation: 'insert',
    remote_id: null,
    sync_payload: input.sync_payload,
  };

  await writeEntries(userId, [...rows, record]);
  return id;
}

export async function deleteOfflineMealEntry(userId: string, entryId: string) {
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

export async function updateOfflineMealEntry(
  userId: string,
  entryId: string,
  payload: OfflineMealLogSyncPayload,
) {
  const rows = await readEntries(userId);
  let updated = false;

  const nextRows = rows.map((row) => {
    const matches = row.id === entryId || row.remote_id === entryId;
    if (!matches) return row;

    updated = true;

    if (row.pending_operation === 'insert' && !row.remote_id) {
      return {
        ...row,
        ...payload,
        synced: false,
        pending_operation: 'insert' as const,
        sync_payload: payload,
      };
    }

    return {
      ...row,
      ...payload,
      synced: false,
      pending_operation: 'update' as const,
      remote_id: row.remote_id ?? row.id,
      sync_payload: payload,
    };
  });

  if (!updated) {
    return false;
  }

  await writeEntries(userId, nextRows);
  return true;
}

export async function flushOfflineMealEntries(userId: string) {
  const rows = await readEntries(userId);
  if (!rows.length) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const nextRows: OfflineMealEntry[] = [];

  for (const row of rows) {
    try {
      if (row.pending_operation === 'insert' && row.sync_payload) {
        const { data, error } = await supabase
          .from('meals')
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

      if (row.pending_operation === 'update' && row.remote_id) {
        const payload = row.sync_payload ?? {
          meal_type: row.meal_type,
          food_name: row.food_name,
          food_id: row.food_id,
          calories: row.calories,
          protein_g: row.protein_g,
          carbs_g: row.carbs_g,
          fat_g: row.fat_g,
          fiber_g: row.fiber_g,
          amount_g: row.amount_g,
          logged_at: row.logged_at,
          source: row.source,
        };
        const { error } = await supabase
          .from('meals')
          .update(payload)
          .eq('id', row.remote_id)
          .eq('user_id', userId);

        if (error) throw error;

        nextRows.push({
          ...row,
          ...payload,
          synced: true,
          pending_operation: null,
          sync_payload: null,
        });
        synced += 1;
        continue;
      }

      if (row.pending_operation === 'delete' && row.remote_id) {
        const { error } = await supabase
          .from('meals')
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
