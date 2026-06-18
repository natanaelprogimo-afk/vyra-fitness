// DEPRECATED: WatermelonDB removed in favor of AsyncStorage + SyncQueue
// This function now only uses auth store (WatermelonDB path removed)
import { useAuthStore } from '@/stores/authStore';

export async function resolveBestEffortSyncUserId(): Promise<string> {
  const authState = useAuthStore.getState();
  const directUserId =
    authState.profile?.id ??
    authState.user?.id ??
    authState.session?.user?.id ??
    '';

  if (directUserId) {
    return directUserId;
  }

  return '';
}

export default resolveBestEffortSyncUserId;
