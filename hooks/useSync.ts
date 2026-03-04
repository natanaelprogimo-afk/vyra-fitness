// ============================================================
// VYRA FITNESS — useSync Hook
// Dispara sincronización al reconectar y al pasar a foreground
// ============================================================

import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@/shims/netinfo';
import { useUIStore } from '@/stores/uiStore';
import { syncPendingChanges } from '@/database';
import { captureError } from '@/lib/sentry';

export function useSync() {
  const setIsOnline  = useUIStore((s) => s.setIsOnline);
  const isOnline     = useUIStore((s) => s.isOnline);
  const lastSyncRef  = useRef<number>(0);

  const MIN_SYNC_INTERVAL = 30 * 1000; // 30s entre syncs automáticos

  const triggerSync = async () => {
    const now = Date.now();
    if (now - lastSyncRef.current < MIN_SYNC_INTERVAL) return;
    lastSyncRef.current = now;

    try {
      const result = await syncPendingChanges();
      if (result.synced > 0) {
        console.log(`[Sync] ${result.synced} items sincronizados`);
      }
      if (result.failed > 0) {
        console.warn(`[Sync] ${result.failed} items fallaron`);
      }
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { context: 'useSync' });
    }
  };

  // Monitorear conexión
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      if (online) {
        // Pequeño delay para que la conexión se estabilice
        setTimeout(triggerSync, 1500);
      }
    });
    return unsubscribe;
  }, []);

  // Sync al volver a foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && isOnline) {
        triggerSync();
      }
    });
    return () => subscription.remove();
  }, [isOnline]);

  return { triggerSync };
}
