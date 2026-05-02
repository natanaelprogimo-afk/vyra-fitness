import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutHistory, WorkoutSessionDetail } from '@/lib/workout-types';

type WorkoutStoreSnapshotLike = {
  history: WorkoutHistory[];
  sessionDetails: Record<string, WorkoutSessionDetail | undefined>;
};

export type WorkoutExportSessionRow = {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  duration_min: number | null;
  total_volume_kg: number;
  total_sets: number;
  sets_count: number;
  routine_id?: string | null;
  notes?: string | null;
  total_reps?: number;
  estimated_calories?: number;
  source: 'local_store';
};

export type WorkoutExportSetRow = {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  is_pr: boolean;
  completed_at: string;
  rir?: number | null;
  rpe?: number | null;
  rest_sec?: number | null;
  notes?: string | null;
  set_type?: string;
  source: 'local_store';
};

export type TimelineWorkoutSessionLike = {
  id: string;
  name?: string | null;
  started_at: string;
  total_sets?: number | null;
  sets_count?: number | null;
};

function getDefaultSnapshot(): WorkoutStoreSnapshotLike {
  const state = useWorkoutStore.getState();
  return {
    history: state.history ?? [],
    sessionDetails: state.sessionDetails ?? {},
  };
}

function byStartedAtAscending<T extends { started_at: string }>(left: T, right: T) {
  return new Date(left.started_at).getTime() - new Date(right.started_at).getTime();
}

function getTimelineSignature(session: TimelineWorkoutSessionLike) {
  const minuteKey = new Date(session.started_at).toISOString().slice(0, 16);
  const name = (session.name ?? 'Entreno').trim().toLowerCase();
  const sets = Number(session.total_sets ?? session.sets_count ?? 0);
  return `${minuteKey}|${name}|${sets}`;
}

function getSetMergeKey(set: Record<string, unknown>) {
  const id = typeof set.id === 'string' ? set.id : '';
  if (id) return `id:${id}`;
  return [
    'composite',
    String(set.session_id ?? ''),
    String(set.exercise_id ?? ''),
    String(set.set_number ?? ''),
    String(set.completed_at ?? ''),
  ].join('|');
}

function mergeById<T extends { id: string }>(remote: T[], local: T[]) {
  const merged = new Map<string, T>();

  for (const localRow of local) {
    merged.set(localRow.id, localRow);
  }

  for (const remoteRow of remote) {
    const existing = merged.get(remoteRow.id);
    if (!existing) {
      merged.set(remoteRow.id, remoteRow);
      continue;
    }

    const next = { ...existing, ...remoteRow } as T;
    for (const [key, value] of Object.entries(existing)) {
      if ((next as Record<string, unknown>)[key] == null && value != null) {
        (next as Record<string, unknown>)[key] = value;
      }
    }
    merged.set(remoteRow.id, next);
  }

  return [...merged.values()];
}

export function buildLocalWorkoutExportData(
  snapshot: WorkoutStoreSnapshotLike = getDefaultSnapshot(),
): { workout_sessions: WorkoutExportSessionRow[]; workout_sets: WorkoutExportSetRow[] } {
  const sessions = (snapshot.history ?? []).map<WorkoutExportSessionRow>((session) => ({
    id: session.id,
    name: session.name,
    started_at: session.started_at,
    ended_at: session.ended_at ?? null,
    duration_min: session.duration_min ?? null,
    total_volume_kg: Number(session.total_volume_kg ?? 0),
    total_sets: Number(session.sets_count ?? 0),
    sets_count: Number(session.sets_count ?? 0),
    routine_id: session.routine_id ?? null,
    notes: session.notes ?? null,
    total_reps: session.total_reps ?? 0,
    estimated_calories: session.estimated_calories ?? 0,
    source: 'local_store',
  }));

  const sets = (snapshot.history ?? []).flatMap<WorkoutExportSetRow>((session) => {
    const detail = snapshot.sessionDetails?.[session.id];
    return (detail?.sets ?? []).map((set) => ({
      id: set.id ?? `${session.id}_${set.exercise_id}_${set.set_number}`,
      session_id: session.id,
      exercise_id: set.exercise_id,
      exercise_name: set.exercise_name,
      set_number: set.set_number,
      reps: set.reps,
      weight_kg: set.weight_kg,
      is_pr: Boolean(set.is_pr),
      completed_at: set.completed_at,
      rir: set.rir ?? null,
      rpe: set.rpe ?? null,
      rest_sec: set.rest_sec ?? null,
      notes: set.notes ?? null,
      set_type: set.set_type ?? 'work',
      source: 'local_store',
    }));
  });

  return {
    workout_sessions: [...sessions].sort(byStartedAtAscending),
    workout_sets: sets,
  };
}

export function mergeWorkoutExportData(
  exportData: Record<string, unknown[]>,
  snapshot: WorkoutStoreSnapshotLike = getDefaultSnapshot(),
) {
  if (!('workout_sessions' in exportData) && !('workout_sets' in exportData)) {
    return exportData;
  }

  const local = buildLocalWorkoutExportData(snapshot);
  const next = { ...exportData };

  if ('workout_sessions' in next) {
    const remoteSessions = (next.workout_sessions ?? []) as WorkoutExportSessionRow[];
    next.workout_sessions = mergeById(remoteSessions, local.workout_sessions).sort(byStartedAtAscending);
  }

  if ('workout_sets' in next) {
    const mergedSets = new Map<string, Record<string, unknown>>();
    for (const localSet of local.workout_sets) {
      mergedSets.set(getSetMergeKey(localSet as unknown as Record<string, unknown>), localSet);
    }
    for (const remoteSet of (next.workout_sets ?? []) as Array<Record<string, unknown>>) {
      mergedSets.set(getSetMergeKey(remoteSet), remoteSet);
    }
    next.workout_sets = [...mergedSets.values()];
  }

  return next;
}

export function mergeWorkoutSessionsForTimeline(
  remoteSessions: TimelineWorkoutSessionLike[],
  options: {
    day?: string;
    localHistory?: WorkoutHistory[];
  } = {},
) {
  const day = options.day;
  const localHistory = options.localHistory ?? getDefaultSnapshot().history;
  const normalizedLocal = localHistory
    .filter((session) => (day ? (session.started_at.split('T')[0] ?? '') === day : true))
    .map<TimelineWorkoutSessionLike>((session) => ({
      id: session.id,
      name: session.name,
      started_at: session.started_at,
      total_sets: session.sets_count,
      sets_count: session.sets_count,
    }));

  const seenIds = new Set(remoteSessions.map((session) => session.id));
  const seenSignatures = new Set(remoteSessions.map(getTimelineSignature));
  const merged = [...remoteSessions];

  for (const localSession of normalizedLocal) {
    const signature = getTimelineSignature(localSession);
    if (seenIds.has(localSession.id) || seenSignatures.has(signature)) {
      continue;
    }
    merged.push(localSession);
    seenIds.add(localSession.id);
    seenSignatures.add(signature);
  }

  return merged.sort(byStartedAtAscending);
}
