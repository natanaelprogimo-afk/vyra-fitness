import { Q } from '@nozbe/watermelondb';
import { database } from '@/database/watermelon';
import { captureError } from '@/lib/sentry';
import { useAuthStore } from '@/stores/authStore';

function parsePayloadUserId(payloadJson: string | null | undefined): string {
  if (!payloadJson) return '';

  try {
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    const userId = payload.user_id;
    return typeof userId === 'string' && userId.trim().length > 0 ? userId : '';
  } catch {
    return '';
  }
}

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

  try {
    const queuedItems = await database
      .get('sync_queue')
      .query(Q.sortBy('created_at', Q.desc))
      .fetch();

    for (const item of queuedItems as any[]) {
      const queuedUserId = parsePayloadUserId(item.payload_json);
      if (queuedUserId) {
        return queuedUserId;
      }
    }
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      action: 'resolveBestEffortSyncUserId.syncQueue',
    });
  }

  try {
    const localProfiles = await database
      .get('profiles')
      .query(Q.sortBy('updated_at', Q.desc))
      .fetch();

    const freshestProfile = (localProfiles as any[])[0];
    const localUserId =
      typeof freshestProfile?.server_id === 'string' ? freshestProfile.server_id : '';

    if (localUserId) {
      return localUserId;
    }
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      action: 'resolveBestEffortSyncUserId.localProfiles',
    });
  }

  return '';
}
