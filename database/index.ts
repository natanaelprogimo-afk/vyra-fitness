import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { migrations } from './migrations';
import {
  FastingLog,
  Meal,
  MentalCheckin,
  Profile,
  SleepLog,
  StepLog,
  SyncQueueItem,
  WaterLog,
  WeightLog,
  WorkoutSession,
  WorkoutSet,
} from './models';
import { schema } from './schema';

let adapterInstance: SQLiteAdapter | null = null;
let databaseInstance: Database | null = null;

export function getAdapter(): SQLiteAdapter {
  if (adapterInstance) return adapterInstance;

  adapterInstance = new SQLiteAdapter({
    schema,
    migrations,
    dbName: 'vyra_fitness',
    jsi: true,
    onSetUpError: (error) => {
      captureError(error, { context: 'WatermelonDB setup' });
    },
  });

  return adapterInstance;
}

export function getDatabase(): Database {
  if (databaseInstance) return databaseInstance;

  databaseInstance = new Database({
    adapter: getAdapter(),
    modelClasses: [
      Profile,
      WaterLog,
      StepLog,
      FastingLog,
      SleepLog,
      MentalCheckin,
      Meal,
      WeightLog,
      WorkoutSession,
      WorkoutSet,
      SyncQueueItem,
    ],
  });

  return databaseInstance;
}

const TABLE_MAP: Record<string, string> = {
  water_logs: 'water_logs',
  step_logs: 'step_logs',
  fasting_logs: 'fasting_logs',
  sleep_logs: 'sleep_logs',
  mental_checkins: 'mental_checkins',
  meals: 'meals',
  weight_logs: 'weight_logs',
  workout_sessions: 'workout_sessions',
  workout_sets: 'workout_sets',
};

const MAX_RETRIES = 3;
let isSyncing = false;

export async function syncPendingChanges(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  const db = getDatabase();
  let synced = 0;
  let failed = 0;

  try {
    const queue = db.get<SyncQueueItem>('sync_queue');
    const items = await queue.query().fetch();

    for (const item of items) {
      if (item.retries >= MAX_RETRIES) {
        await db.write(async () => {
          await item.destroyPermanently();
        });
        failed += 1;
        continue;
      }

      try {
        const payload = JSON.parse(item.payload_json);
        const supabaseTable = TABLE_MAP[item.table_name];
        if (!supabaseTable) {
          await db.write(async () => {
            await item.destroyPermanently();
          });
          continue;
        }

        if (item.operation === 'insert') {
          const { data, error } = await supabase
            .from(supabaseTable)
            .insert(payload)
            .select('id')
            .single();

          if (error) throw error;

          const localRecord = await db.get(item.table_name).find(item.record_id);
          await db.write(async () => {
            await (localRecord as any).update((record: any) => {
              record.server_id = data.id;
              record.synced = true;
            });
            await item.destroyPermanently();
          });
        } else if (item.operation === 'update') {
          if (!item.server_id) throw new Error('No server_id for update');

          const { error } = await supabase
            .from(supabaseTable)
            .update(payload)
            .eq('id', item.server_id);

          if (error) throw error;

          const localRecord = await db.get(item.table_name).find(item.record_id);
          await db.write(async () => {
            await (localRecord as any).update((record: any) => {
              record.synced = true;
            });
            await item.destroyPermanently();
          });
        } else if (item.operation === 'delete') {
          if (item.server_id) {
            const { error } = await supabase
              .from(supabaseTable)
              .delete()
              .eq('id', item.server_id);

            if (error) throw error;
          }

          await db.write(async () => {
            await item.destroyPermanently();
          });
        }

        synced += 1;
      } catch (error) {
        await db.write(async () => {
          await item.update((record) => {
            record.retries = record.retries + 1;
            record.last_error = error instanceof Error ? error.message : String(error);
          });
        });
        failed += 1;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

export async function enqueueSync(
  tableName: string,
  operation: 'insert' | 'update' | 'delete',
  recordId: string,
  payload: Record<string, unknown>,
  serverId?: string,
): Promise<void> {
  const db = getDatabase();

  await db.write(async () => {
    await db.get<SyncQueueItem>('sync_queue').create((item) => {
      item.table_name = tableName;
      item.operation = operation;
      item.record_id = recordId;
      item.server_id = serverId ?? null;
      item.payload_json = JSON.stringify(payload);
      item.retries = 0;
      item.last_error = null;
    });
  });
}

export async function writeLocalAndSync<T extends { id: string }>(
  tableName: string,
  data: Record<string, unknown>,
  userId: string,
  syncPayload?: Record<string, unknown>,
): Promise<string> {
  const db = getDatabase();
  let localId = '';

  await db.write(async () => {
    const record = await db.get(tableName).create((row: any) => {
      Object.assign(row, data);
      row.user_id = userId;
      row.synced = false;
      row.created_at = Date.now();
    });

    localId = record.id;

    await db.get<SyncQueueItem>('sync_queue').create((item) => {
      item.table_name = tableName;
      item.operation = 'insert';
      item.record_id = record.id;
      item.server_id = null;
      item.payload_json = JSON.stringify({ ...(syncPayload ?? data), user_id: userId });
      item.retries = 0;
      item.last_error = null;
    });
  });

  return localId;
}

export const adapter = getAdapter();
export const database = getDatabase();

export default database;
