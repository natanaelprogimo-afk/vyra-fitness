/**
 * useSyncQueue Hook
 * 
 * Provides access to the sync queue for offline-first data operations
 * 
 * @example
 * const queue = useSyncQueue();
 * 
 * // Queue a water log
 * const id = await queue.add({
 *   module: 'water',
 *   action: 'INSERT',
 *   table: 'water_logs',
 *   payload: { amount_ml: 500, user_id: authStore.userId },
 * });
 * 
 * // Check sync status
 * useEffect(() => {
 *   const state = queue.getState();
 *   if (state.isSyncing) console.log('Syncing...');
 * }, []);
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNetwork } from './useNetwork';
import { SyncQueue, type SyncModule, type SyncItem } from '@/lib/sync/syncQueue';
import { supabase } from '@/lib/supabase';

/**
 * useSyncQueue Hook
 */
export function useSyncQueue() {
  const { session } = useAuthStore();
  const { isOnline } = useNetwork();
  const queueRef = useRef<SyncQueue | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  /**
   * Initialize queue on mount
   */
  useEffect(() => {
    if (!session?.access_token) return;

    const queue = new SyncQueue(supabase);
    queueRef.current = queue;

    void queue.init();
  }, [session?.access_token]);

  /**
   * Update online status
   */
  useEffect(() => {
    if (!queueRef.current) return;
    queueRef.current.setOnline(isOnline);
  }, [isOnline]);

  /**
   * Add item to queue
   */
  const add = useCallback(
    async (item: Omit<SyncItem, 'id' | 'timestamp' | 'attempts'>) => {
      if (!queueRef.current) {
        throw new Error('SyncQueue not initialized');
      }

      return await queueRef.current.add(item);
    },
    []
  );

  /**
   * Sync manually
   */
  const sync = useCallback(async () => {
    if (!queueRef.current) return;

    setIsSyncing(true);
    try {
      const result = await queueRef.current.sync();
      if (result.failed > 0) {
        setErrorCount(result.failed);
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Get queue state
   */
  const getState = useCallback(() => {
    if (!queueRef.current) return null;
    return queueRef.current.getState();
  }, []);

  /**
   * Get pending items for a module
   */
  const getPending = useCallback((module: SyncModule) => {
    if (!queueRef.current) return [];
    return queueRef.current.getPendingByModule(module);
  }, []);

  /**
   * Clear synced items
   */
  const clearSynced = useCallback(async () => {
    if (!queueRef.current) return;
    await queueRef.current.clearSynced();
  }, []);

  return {
    add,
    sync,
    getState,
    getPending,
    clearSynced,
    isSyncing,
    isOnline,
    errorCount,
  };
}
