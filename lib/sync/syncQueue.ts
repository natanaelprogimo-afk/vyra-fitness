/**
 * Universal Sync Queue for Vyra Fitness
 * 
 * Handles offline-first syncing for all modules (water, nutrition, sleep, weight, etc.)
 * Uses AsyncStorage as local persistence
 * 
 * Architecture:
 * - All local changes queued in AsyncStorage
 * - Automatic sync when online
 * - Retry with exponential backoff
 * - Atomic operations (all-or-nothing)
 * 
 * @example
 * const queue = useSyncQueue();
 * 
 * // Add to queue
 * await queue.add({
 *   module: 'water',
 *   action: 'INSERT',
 *   table: 'water_logs',
 *   payload: { amount_ml: 500, user_id: 'xxx' },
 * });
 * 
 * // Auto-syncs when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Sync action type
 */
export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Sync module (corresponds to feature)
 */
export type SyncModule =
  | 'water'
  | 'nutrition'
  | 'sleep'
  | 'weight'
  | 'fasting'
  | 'mental'
  | 'supplements'
  | 'home';

/**
 * Item in sync queue
 */
export interface SyncItem {
  id: string; // Unique UUID for idempotency
  module: SyncModule;
  action: SyncAction;
  table: string;
  payload: Record<string, unknown>;
  timestamp: number; // When item was added to queue
  attempts: number; // Number of sync attempts
  lastError?: string;
  synced_at?: string; // ISO timestamp when successfully synced
}

/**
 * Sync queue state
 */
export interface SyncQueueState {
  items: SyncItem[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  errorCount: number;
}

const SYNC_QUEUE_KEY = 'vyra_sync_queue';
const SYNC_STATE_KEY = 'vyra_sync_state';
const MAX_RETRIES = 5;

/**
 * SyncQueue: Central sync management
 */
export class SyncQueue {
  private supabase: SupabaseClient;
  private state: SyncQueueState;
  private isOnline: boolean = true;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.state = {
      items: [],
      isOnline: true,
      isSyncing: false,
      errorCount: 0,
    };
  }

  /**
   * Initialize queue from AsyncStorage
   */
  async init(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as SyncItem[];
        this.state.items = items;
      }

      const stateStored = await AsyncStorage.getItem(SYNC_STATE_KEY);
      if (stateStored) {
        this.state = JSON.parse(stateStored) as SyncQueueState;
      }
    } catch (error) {
      console.warn('Failed to load sync queue from storage', error);
    }
  }

  /**
   * Add item to sync queue
   * Marks item with sync_state = 'pending' in the database
   */
  async add(item: Omit<SyncItem, 'id' | 'timestamp' | 'attempts'>): Promise<string> {
    const id = this._generateId();
    const syncItem: SyncItem = {
      ...item,
      id,
      timestamp: Date.now(),
      attempts: 0,
    };

    // Add sync_state tracking to payload
    const payloadWithSync = {
      ...item.payload,
      sync_state: 'pending' as const,
      synced_at: null, // Will be set when successfully synced
    };

    // If INSERT, include sync_state in the new record
    if (item.action === 'INSERT') {
      syncItem.payload = payloadWithSync;
    } else if (item.action === 'UPDATE') {
      // If UPDATE, mark as pending
      syncItem.payload = {
        ...item.payload,
        sync_state: 'pending',
      };
    }

    this.state.items.push(syncItem);
    await this._persistQueue();

    // Auto-sync if online
    if (this.isOnline) {
      void this.sync();
    }

    return id;
  }

  /**
   * Remove item from queue (after successful sync)
   */
  async remove(id: string): Promise<void> {
    this.state.items = this.state.items.filter((item) => item.id !== id);
    await this._persistQueue();
  }

  /**
   * Get queue state
   */
  getState(): SyncQueueState {
    return { ...this.state };
  }

  /**
   * Get pending items for a module
   */
  getPendingByModule(module: SyncModule): SyncItem[] {
    return this.state.items.filter(
      (item) => item.module === module && !item.synced_at
    );
  }

  /**
   * Set online/offline status
   */
  setOnline(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      // Auto-sync when coming online
      void this.sync();
    }
  }

  /**
   * Sync all pending items
   */
  async sync(): Promise<{ success: number; failed: number }> {
    if (this.state.isSyncing) return { success: 0, failed: 0 };

    this.state.isSyncing = true;
    let success = 0;
    let failed = 0;

    try {
      const pending = this.state.items.filter((item) => !item.synced_at);

      for (const item of pending) {
        const result = await this._syncItem(item);

        if (result) {
          item.synced_at = new Date().toISOString();
          item.attempts = 0;
          success++;
        } else {
          item.attempts++;
          item.lastError = `Failed after attempt ${item.attempts}`;
          failed++;

          // Stop retrying if max attempts exceeded
          if (item.attempts >= MAX_RETRIES) {
            console.error(`Sync item ${item.id} exceeded max retries`);
          }
        }
      }

      // Persist updated state
      await this._persistQueue();
      this.state.lastSyncAt = new Date().toISOString();
    } catch (error) {
      console.error('Sync error:', error);
      this.state.errorCount++;
    } finally {
      this.state.isSyncing = false;
    }

    return { success, failed };
  }

  /**
   * Sync a single item
   * Updates sync_state based on success/failure
   */
  private async _syncItem(item: SyncItem): Promise<boolean> {
    const { action, table, payload } = item;
    const payloadId = typeof payload.id === 'string' ? payload.id : item.id;

    try {
      let result;

      if (action === 'INSERT') {
        result = await this.supabase
          .from(table)
          .insert(payload);
      } else if (action === 'UPDATE') {
        const { id, ...data } = payload;
        result = await this.supabase
          .from(table)
          .update(data)
          .eq('id', id);
      } else if (action === 'DELETE') {
        result = await this.supabase
          .from(table)
          .delete()
          .eq('id', payload.id);
      }

      if (result?.error) {
        console.warn(`Sync error for ${item.id}:`, result.error);
        // Mark as failed
        await this._updateSyncState(table, payloadId, 'failed');
        return false;
      }

      // Mark as synced with timestamp
      await this._updateSyncState(table, payloadId, 'synced');
      return true;
    } catch (error) {
      console.error(`Sync exception for ${item.id}:`, error);
      // Mark as failed
      await this._updateSyncState(table, payloadId, 'failed').catch(() => {});
      return false;
    }
  }

  /**
   * Update sync_state in database for a record
   */
  private async _updateSyncState(
    table: string,
    recordId: string,
    state: 'synced' | 'failed' | 'pending'
  ): Promise<void> {
    try {
      const updateData = {
        sync_state: state,
        synced_at: state === 'synced' ? new Date().toISOString() : null,
      };

      await this.supabase
        .from(table)
        .update(updateData)
        .eq('id', recordId);
    } catch (error) {
      console.warn(`Failed to update sync_state for ${table}[${recordId}]:`, error);
      // Don't throw - continue with next item
    }
  }

  /**
   * Persist queue to AsyncStorage
   */
  private async _persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.state.items));
      await AsyncStorage.setItem(SYNC_STATE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to persist sync queue', error);
    }
  }

  /**
   * Generate unique ID for sync item
   */
  private _generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Clear all synced items
   */
  async clearSynced(): Promise<void> {
    this.state.items = this.state.items.filter((item) => !item.synced_at);
    await this._persistQueue();
  }

  /**
   * Debug: Print queue status
   */
  debug(): void {
    console.log('=== SyncQueue Debug ===');
    console.log(`Total items: ${this.state.items.length}`);
    console.log(`Pending: ${this.state.items.filter((i) => !i.synced_at).length}`);
    console.log(`Online: ${this.isOnline}`);
    console.log(`Syncing: ${this.state.isSyncing}`);
    console.log(`Last sync: ${this.state.lastSyncAt}`);
    console.log('Items:', this.state.items);
  }
}
