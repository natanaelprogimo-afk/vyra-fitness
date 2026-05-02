const mockStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key, value) => {
    mockStorage.set(key, value);
    return Promise.resolve();
  }),
  getItem: jest.fn((key) => Promise.resolve(mockStorage.has(key) ? mockStorage.get(key) : null)),
  removeItem: jest.fn((key) => {
    mockStorage.delete(key);
    return Promise.resolve();
  }),
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const {
  cacheRemoteMealEntries,
  getOfflineMealEntries,
  queueOfflineMealEntry,
  updateOfflineMealEntry,
} = require('../lib/nutrition-offline');

function buildPayload(overrides = {}) {
  return {
    meal_type: 'lunch',
    food_name: 'Pollo con arroz',
    food_id: null,
    calories: 540,
    protein_g: 42,
    carbs_g: 51,
    fat_g: 14,
    fiber_g: 4,
    amount_g: 280,
    logged_at: '2026-04-26T15:20:00.000Z',
    source: 'manual',
    ...overrides,
  };
}

describe('nutrition offline edits', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  test('updates a pending local insert in place', async () => {
    const userId = 'user-local';
    const original = buildPayload({ food_name: 'Avena', calories: 310 });
    const id = await queueOfflineMealEntry(userId, {
      ...original,
      sync_payload: original,
    });

    const updated = buildPayload({ food_name: 'Avena con banana', calories: 360 });
    const result = await updateOfflineMealEntry(userId, id, updated);
    const entries = await getOfflineMealEntries(userId);

    expect(result).toBe(true);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id,
      food_name: 'Avena con banana',
      calories: 360,
      pending_operation: 'insert',
      remote_id: null,
      sync_payload: expect.objectContaining({
        food_name: 'Avena con banana',
        calories: 360,
      }),
    });
  });

  test('marks cached remote meals as pending update', async () => {
    const userId = 'user-remote';
    const remote = {
      id: 'meal-remote-1',
      user_id: userId,
      ...buildPayload(),
    };
    await cacheRemoteMealEntries(userId, [remote]);

    const result = await updateOfflineMealEntry(
      userId,
      'meal-remote-1',
      buildPayload({ food_name: 'Pollo editado', calories: 480 }),
    );
    const entries = await getOfflineMealEntries(userId);

    expect(result).toBe(true);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: 'meal-remote-1',
      remote_id: 'meal-remote-1',
      food_name: 'Pollo editado',
      calories: 480,
      synced: false,
      pending_operation: 'update',
      sync_payload: expect.objectContaining({
        food_name: 'Pollo editado',
        calories: 480,
      }),
    });
  });

  test('keeps the local edited version when remote cache refreshes', async () => {
    const userId = 'user-refresh';
    const remote = {
      id: 'meal-remote-2',
      user_id: userId,
      ...buildPayload({ food_name: 'Wrap base', calories: 500 }),
    };
    await cacheRemoteMealEntries(userId, [remote]);
    await updateOfflineMealEntry(
      userId,
      'meal-remote-2',
      buildPayload({ food_name: 'Wrap ajustado', calories: 455 }),
    );

    await cacheRemoteMealEntries(userId, [
      remote,
      {
        id: 'meal-remote-3',
        user_id: userId,
        ...buildPayload({ food_name: 'Yogur', calories: 190, meal_type: 'snack' }),
      },
    ]);

    const entries = await getOfflineMealEntries(userId);

    expect(entries).toHaveLength(2);
    expect(entries.find((entry) => entry.id === 'meal-remote-2')).toMatchObject({
      food_name: 'Wrap ajustado',
      calories: 455,
      pending_operation: 'update',
    });
    expect(entries.find((entry) => entry.id === 'meal-remote-3')).toMatchObject({
      food_name: 'Yogur',
      pending_operation: null,
    });
  });
});
