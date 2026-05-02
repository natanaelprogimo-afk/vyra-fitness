// ============================================================
// VYRA FITNESS - useSync Hook
// Solo dispara la cola global cuando esa capa existe de verdad.
// ============================================================

import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { isDatabaseLayerEnabled, syncPendingChanges } from '@/database';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';

export function useSync() {
  const setIsOnline = useUIStore((s) => s.setIsOnline);
  const isOnline = useUIStore((s) => s.isOnline);
  const lastSyncRef = useRef<number>(0);
  const queueEnabled = isDatabaseLayerEnabled();

  const MIN_SYNC_INTERVAL = 30 * 1000;

  const triggerSync = async () => {
    if (!queueEnabled) {
      return { synced: 0, failed: 0, skipped: true as const };
    }

    const now = Date.now();
    if (now - lastSyncRef.current < MIN_SYNC_INTERVAL) {
      return { synced: 0, failed: 0, skipped: true as const };
    }
    lastSyncRef.current = now;

    try {
      const result = await syncPendingChanges();
      if (result.synced > 0) {
        console.log(`[Sync] ${result.synced} items sincronizados`);
      }
      if (result.failed > 0) {
        console.warn(`[Sync] ${result.failed} items fallaron`);
      }
      return { ...result, skipped: false as const };
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { context: 'useSync' });
      return { synced: 0, failed: 0, skipped: false as const };
    }
  };

  useEffect(() => {
    let active = true;
    void NetInfo.fetch().then((state) => {
      if (!active) return;
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      if (online && queueEnabled) {
        setTimeout(() => {
          void triggerSync();
        }, 1500);
      }
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      if (online && queueEnabled) {
        setTimeout(() => {
          void triggerSync();
        }, 1500);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [queueEnabled, setIsOnline]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && isOnline && queueEnabled) {
        void triggerSync();
      }
    });
    return () => subscription.remove();
  }, [isOnline, queueEnabled]);

  return { triggerSync, queueEnabled };
}

export default useSync;
