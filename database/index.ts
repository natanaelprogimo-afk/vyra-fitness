// ============================================================
// VYRA FITNESS — Database Setup + Sync Engine
// Inicializa WatermelonDB SQLite y maneja sincronización
// con Supabase cuando hay conexión.
// ============================================================

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import {
  WaterLog, StepLog, FastingLog, SleepLog,
  MentalCheckin, Meal, WeightLog,
  WorkoutSession, WorkoutSet, SyncQueueItem,
} from './models';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

// ─── Instancia global del DB ─────────────────────────────

let _database: Database | null = null;

export function getDatabase(): Database {
  if (_database) return _database;

  const adapter = new SQLiteAdapter({
    schema,
    dbName: 'vyra_fitness',
    jsi:    true,  // JSI para máxima performance en Android
    onSetUpError: (error) => {
      captureError(error, { context: 'WatermelonDB setup' });
    },
  });

  _database = new Database({
    adapter,
    modelClasses: [
      WaterLog, StepLog, FastingLog, SleepLog,
      MentalCheckin, Meal, WeightLog,
      WorkoutSession, WorkoutSet, SyncQueueItem,
    ],
  });

  return _database;
}

// ─── Sync Engine ────────────────────────────────────────
// Procesa la cola de sync: envía items pendientes a Supabase.
// Se llama cuando la app recupera conexión o al hacer pull-to-refresh.

const TABLE_MAP: Record<string, string> = {
  water_logs:       'water_logs',
  step_logs:        'step_logs',
  fasting_logs:     'fasting_logs',
  sleep_logs:       'sleep_logs',
  mental_checkins:  'mental_checkins',
  meals:            'meals',
  weight_logs:      'weight_logs',
  workout_sessions: 'workout_sessions',
  workout_sets:     'workout_sets',
};

const MAX_RETRIES = 3;
let   isSyncing   = false;

export async function syncPendingChanges(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  const db    = getDatabase();
  let synced  = 0;
  let failed  = 0;

  try {
    const queue = db.get<SyncQueueItem>('sync_queue');
    const items = await queue.query().fetch();

    for (const item of items) {
      if (item.retries >= MAX_RETRIES) {
        // Descartar después de MAX_RETRIES intentos
        await db.write(async () => { await item.destroyPermanently(); });
        failed++;
        continue;
      }

      try {
        const payload = JSON.parse(item.payload_json);
        const supabaseTable = TABLE_MAP[item.table_name];
        if (!supabaseTable) continue;

        if (item.operation === 'insert') {
          const { data, error } = await supabase
            .from(supabaseTable)
            .insert(payload)
            .select('id')
            .single();

          if (error) throw error;

          // Actualizar server_id en el modelo local
          const localRecord = await db.get(item.table_name).find(item.record_id);
          await db.write(async () => {
            await (localRecord as any).update((r: any) => {
              r.server_id = data.id;
              r.synced    = true;
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
            await (localRecord as any).update((r: any) => { r.synced = true; });
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
          await db.write(async () => { await item.destroyPermanently(); });
        }

        synced++;

      } catch (err) {
        // Incrementar retries
        await db.write(async () => {
          await item.update((r) => {
            r.retries   = r.retries + 1;
            r.last_error = err instanceof Error ? err.message : String(err);
          });
        });
        failed++;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

// ─── Helper: encolar operación offline ─────────────────

export async function enqueueSync(
  tableName: string,
  operation: 'insert' | 'update' | 'delete',
  recordId:  string,
  payload:   Record<string, unknown>,
  serverId?: string
): Promise<void> {
  const db = getDatabase();
  await db.write(async () => {
    await db.get<SyncQueueItem>('sync_queue').create((item) => {
      item.table_name   = tableName;
      item.operation    = operation;
      item.record_id    = recordId;
      item.server_id    = serverId ?? null;
      item.payload_json = JSON.stringify(payload);
      item.retries      = 0;
      item.last_error   = null;
    });
  });
}

// ─── Helper: escribir local + encolar sync ──────────────

export async function writeLocalAndSync<T extends { id: string }>(
  tableName: string,
  data:      Record<string, unknown>,
  userId:    string
): Promise<string> {
  const db = getDatabase();
  let localId = '';

  await db.write(async () => {
    const record = await db.get(tableName).create((r: any) => {
      Object.assign(r, data);
      r.user_id    = userId;
      r.synced     = false;
      r.created_at = Date.now();
    });
    localId = record.id;

    // Encolar sync
    await db.get<SyncQueueItem>('sync_queue').create((item) => {
      item.table_name   = tableName;
      item.operation    = 'insert';
      item.record_id    = record.id;
      item.server_id    = null;
      item.payload_json = JSON.stringify({ ...data, user_id: userId });
      item.retries      = 0;
      item.last_error   = null;
    });
  });

  return localId;
}
