jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const { useWorkoutStore } = require('../stores/workoutStore');

function replaceStoreState(partial) {
  useWorkoutStore.setState(
    {
      ...useWorkoutStore.getInitialState(),
      ...partial,
    },
    true,
  );
}

describe('workout store ownership', () => {
  afterEach(() => {
    replaceStoreState({});
  });

  test('adopts legacy local workout data for the first authenticated owner', () => {
    replaceStoreState({
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
      ],
    });

    useWorkoutStore.getState().bindOwner('user-a');

    expect(useWorkoutStore.getState().ownerUserId).toBe('user-a');
    expect(useWorkoutStore.getState().history).toHaveLength(1);
    expect(useWorkoutStore.getState().history[0].id).toBe('local-session-1');
  });

  test('resets workout data when a different account signs in on the device', () => {
    replaceStoreState({
      ownerUserId: 'user-a',
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
      ],
      sessionDetails: {
        'local-session-1': {
          session: {
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
          sets: [],
          exerciseBreakdown: [],
          durationMin: 48,
          exerciseNotes: {},
        },
      },
      activeSession: {
        session_id: 'active-session',
        routine_id: 'routine-1',
        name: 'Push Day',
        sets: [],
        startedAt: '2026-04-26T10:00:00.000Z',
        timerStart: null,
        exercises: [],
        currentExerciseIndex: 0,
        notes: null,
        exerciseNotes: {},
        isQuickSession: false,
      },
      favoriteExerciseIds: ['bench_press'],
    });

    useWorkoutStore.getState().bindOwner('user-b');

    const next = useWorkoutStore.getState();
    expect(next.ownerUserId).toBe('user-b');
    expect(next.history).toEqual([]);
    expect(next.sessionDetails).toEqual({});
    expect(next.activeSession).toBeNull();
    expect(next.favoriteExerciseIds).toEqual([]);
  });
});
