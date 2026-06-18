// ============================================================
// VYRA FITNESS - useSync Hook (DEPRECATED - WatermelonDB removed)
// Network connectivity tracking only
// For actual sync, use SyncQueue (when implemented)
// ============================================================

import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useUIStore } from '@/stores/uiStore';

export function useSync() {
  const setIsOnline = useUIStore((s) => s.setIsOnline);
  const isOnline = useUIStore((s) => s.isOnline);

  const triggerSync = async () => {
    // DEPRECATED: Sync queue removed with WatermelonDB
    // Use SyncQueue from lib/sync/syncQueue.ts instead
    return { synced: 0, failed: 0, skipped: true as const };
  };

  useEffect(() => {
    let active = true;
    void NetInfo.fetch().then((state) => {
      if (!active) return;
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [setIsOnline]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && isOnline) {
        void triggerSync();
      }
    });
    return () => subscription.remove();
  }, [isOnline]);

  return { triggerSync, queueEnabled: false };
}
