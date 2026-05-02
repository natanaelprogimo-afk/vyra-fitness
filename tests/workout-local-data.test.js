const {
  buildLocalWorkoutExportData,
  mergeWorkoutExportData,
  mergeWorkoutSessionsForTimeline,
} = require('../lib/workout-local-data');

describe('workout local data helpers', () => {
  const snapshot = {
    history: [
      {
        id: 'local-session-1',
        name: 'Push Day',
        started_at: '2026-04-26T10:00:00.000Z',
        ended_at: '2026-04-26T10:48:00.000Z',
        total_volume_kg: 4200,
        sets_count: 12,
        muscles_worked: ['pecho', 'triceps'],
        routine_id: 'routine-1',
        notes: 'Buen dia',
        total_reps: 96,
        estimated_calories: 298,
        duration_min: 48,
      },
      {
        id: 'local-session-2',
        name: 'Leg Day',
        started_at: '2026-04-26T18:00:00.000Z',
        ended_at: '2026-04-26T18:52:00.000Z',
        total_volume_kg: 5600,
        sets_count: 14,
        muscles_worked: ['piernas'],
        routine_id: 'routine-2',
        notes: null,
        total_reps: 102,
        estimated_calories: 340,
        duration_min: 52,
      },
    ],
    sessionDetails: {
      'local-session-1': {
        session: null,
        sets: [
          {
            id: 'set-1',
            exercise_id: 'bench',
            exercise_name: 'Bench Press',
            set_number: 1,
            reps: 8,
            weight_kg: 60,
            is_pr: true,
            completed_at: '2026-04-26T10:08:00.000Z',
          },
        ],
        exerciseBreakdown: [],
        durationMin: 48,
      },
    },
  };

  test('builds local workout export rows from persisted workout store state', () => {
    const data = buildLocalWorkoutExportData(snapshot);

    expect(data.workout_sessions).toHaveLength(2);
    expect(data.workout_sessions[0]).toMatchObject({
      id: 'local-session-1',
      total_sets: 12,
      total_volume_kg: 4200,
      source: 'local_store',
    });
    expect(data.workout_sets).toHaveLength(1);
    expect(data.workout_sets[0]).toMatchObject({
      session_id: 'local-session-1',
      exercise_name: 'Bench Press',
      is_pr: true,
      source: 'local_store',
    });
  });

  test('merges local workout sessions and sets into export bundles', () => {
    const merged = mergeWorkoutExportData(
      {
        workout_sessions: [
          {
            id: 'remote-session-1',
            name: 'Remote Workout',
            started_at: '2026-04-25T08:00:00.000Z',
            ended_at: '2026-04-25T08:35:00.000Z',
            duration_min: 35,
            total_volume_kg: 2200,
          },
        ],
        workout_sets: [],
      },
      snapshot,
    );

    expect(merged.workout_sessions).toHaveLength(3);
    expect(merged.workout_sessions.map((row) => row.id)).toEqual([
      'remote-session-1',
      'local-session-1',
      'local-session-2',
    ]);
    expect(merged.workout_sets).toHaveLength(1);
  });

  test('dedupes timeline sessions by signature while preserving local-only workouts', () => {
    const merged = mergeWorkoutSessionsForTimeline(
      [
        {
          id: 'remote-session-1',
          name: 'Push Day',
          started_at: '2026-04-26T10:00:00.000Z',
          total_sets: 12,
        },
      ],
      {
        day: '2026-04-26',
        localHistory: snapshot.history,
      },
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe('remote-session-1');
    expect(merged[1].id).toBe('local-session-2');
  });
});
