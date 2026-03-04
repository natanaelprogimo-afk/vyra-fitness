// ============================================================
// VYRA FITNESS — WatermelonDB Database Instance
// Conexión a la base de datos local con WatermelonDB
// ============================================================

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { WaterLog } from './models';
import { StepLog } from './models';
import { FastingLog } from './models';
import { SleepLog } from './models';
import { MentalCheckin } from './models';
import { Meal } from './models';
import { WeightLog } from './models';
import { WorkoutSession } from './models';
import { WorkoutSet } from './models';

import schema from './schema';

export const adapter = new SQLiteAdapter({
  schema,
});

export const database = new Database({
  adapter,
  modelClasses: [
    WaterLog,
    StepLog,
    FastingLog,
    SleepLog,
    MentalCheckin,
    Meal,
    WeightLog,
    WorkoutSession,
    WorkoutSet,
  ],
});

export default database;
