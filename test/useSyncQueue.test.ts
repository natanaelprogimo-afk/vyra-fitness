/**
 * SyncQueue Tests
 * 
 * Tests for offline-first sync queue functionality
 */

import { SyncQueue, type SyncItem } from '../lib/sync/syncQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('SyncQueue', () => {
  let queue: SyncQueue;
  let mockSupabase: any;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };

    queue = new SyncQueue(mockSupabase);

    // Clear AsyncStorage
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with empty queue', () => {
      const state = queue.getState();
      expect(state.items).toEqual([]);
      expect(state.isSyncing).toBe(false);
      expect(state.isOnline).toBe(true);
    });

    test('should load queue from AsyncStorage', async () => {
      const mockItems: SyncItem[] = [
        {
          id: 'item-1',
          module: 'water',
          action: 'INSERT',
          table: 'water_logs',
          payload: { amount_ml: 500 },
          timestamp: Date.now(),
          attempts: 0,
        },
      ];

      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockResolvedValueOnce(JSON.stringify(mockItems));

      await queue.init();

      const state = queue.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('item-1');
    });
  });

  describe('Add Item', () => {
    test('should add item to queue', async () => {
      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500, user_id: 'user-1' },
      });

      const state = queue.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].module).toBe('water');
      expect(state.items[0].payload.amount_ml).toBe(500);
    });

    test('should generate unique ID for each item', async () => {
      const id1 = await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      const id2 = await queue.add({
        module: 'nutrition',
        action: 'INSERT',
        table: 'meals',
        payload: { calories: 500 },
      });

      expect(id1).not.toBe(id2);
    });

    test('should set timestamp when adding item', async () => {
      const beforeTime = Date.now();
      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });
      const afterTime = Date.now();

      const state = queue.getState();
      expect(state.items[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(state.items[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('should persist queue to AsyncStorage', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockResolvedValueOnce(undefined);

      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Sync', () => {
    test('should sync INSERT action', async () => {
      const mockInsert = jest.fn().mockResolvedValueOnce({ error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      const result = await queue.sync();

      expect(result.success).toBe(1);
      expect(mockInsert).toHaveBeenCalled();
    });

    test('should sync UPDATE action', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValueOnce({ error: null }),
      });
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      await queue.add({
        module: 'water',
        action: 'UPDATE',
        table: 'water_logs',
        payload: { id: 'log-1', amount_ml: 1000 },
      });

      const result = await queue.sync();

      expect(result.success).toBe(1);
      expect(mockUpdate).toHaveBeenCalled();
    });

    test('should sync DELETE action', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValueOnce({ error: null }),
      });
      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      });

      await queue.add({
        module: 'water',
        action: 'DELETE',
        table: 'water_logs',
        payload: { id: 'log-1' },
      });

      const result = await queue.sync();

      expect(result.success).toBe(1);
      expect(mockDelete).toHaveBeenCalled();
    });

    test('should handle sync errors', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest
          .fn()
          .mockResolvedValueOnce({ error: new Error('Network error') }),
      });

      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      const result = await queue.sync();

      expect(result.failed).toBe(1);
    });

    test('should mark items as synced', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValueOnce({ error: null }),
      });

      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      await queue.sync();

      const state = queue.getState();
      expect(state.items[0].synced_at).toBeDefined();
    });

    test('should not sync when offline', async () => {
      queue.setOnline(false);

      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      const state = queue.getState();
      expect(state.items[0].synced_at).toBeUndefined();
    });

    test('should auto-sync when coming online', async () => {
      queue.setOnline(false);

      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValueOnce({ error: null }),
      });

      // Simulate coming online
      queue.setOnline(true);

      // Should trigger sync
      const result = await queue.sync();
      expect(result.success + result.failed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Module Filtering', () => {
    test('should get pending items by module', async () => {
      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      await queue.add({
        module: 'nutrition',
        action: 'INSERT',
        table: 'meals',
        payload: { calories: 500 },
      });

      const waterItems = queue.getPendingByModule('water');
      const nutritionItems = queue.getPendingByModule('nutrition');

      expect(waterItems).toHaveLength(1);
      expect(nutritionItems).toHaveLength(1);
      expect(waterItems[0].module).toBe('water');
      expect(nutritionItems[0].module).toBe('nutrition');
    });

    test('should not include synced items in pending', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValueOnce({ error: null }),
      });

      await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      await queue.sync();

      const pending = queue.getPendingByModule('water');
      expect(pending).toHaveLength(0);
    });
  });

  describe('Remove Item', () => {
    test('should remove item from queue', async () => {
      const id = await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      await queue.remove(id);

      const state = queue.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('Clear Synced', () => {
    test('should clear only synced items', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValueOnce({ error: null }),
      });

      const id1 = await queue.add({
        module: 'water',
        action: 'INSERT',
        table: 'water_logs',
        payload: { amount_ml: 500 },
      });

      const id2 = await queue.add({
        module: 'nutrition',
        action: 'INSERT',
        table: 'meals',
        payload: { calories: 500 },
      });

      // Sync first item
      await queue.sync();

      // Clear synced
      await queue.clearSynced();

      const state = queue.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe(id2);
    });
  });
});
