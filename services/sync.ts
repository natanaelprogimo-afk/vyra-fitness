// Minimal sync service: listens to NetInfo and triggers syncPendingChanges
import NetInfo from '@react-native-community/netinfo';
import { syncPendingChanges } from '@/database';
import { captureError } from '@/lib/sentry';

let initialized = false;

export function initSyncService() {
  if (initialized) return;
  initialized = true;

  NetInfo.addEventListener((state) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;
    if (online) {
      setTimeout(() => {
        void syncPendingChanges().catch((err) => captureError(err instanceof Error ? err : new Error(String(err)), { context: 'syncService' }));
      }, 1200);
    }
  });
}

export default initSyncService;
