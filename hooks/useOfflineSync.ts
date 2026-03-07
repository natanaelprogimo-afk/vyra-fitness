import { useCallback, useEffect, useMemo, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getDatabase, syncPendingChanges } from '@/database';
import { captureError } from '@/lib/sentry';

const SYNC_TABLES = [
  'water_logs',
  'step_logs',
  'meals',
  'sleep_logs',
  'weight_logs',
  'workout_sessions',
  'mental_checkins',
  'fasting_logs',
] as const;

function isOnlineState(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export function useOfflineSync() {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.id ?? '';

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const db = getDatabase();
      const queue = await db.get('sync_queue').query().fetch();
      setPendingCount(queue.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const markSyncedAtForUnsyncedRows = useCallback(async () => {
    if (!userId) return 0;

    let touched = 0;
    const nowIso = new Date().toISOString();

    for (const table of SYNC_TABLES) {
      const { data, error: readError } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', userId)
        .is('synced_at', null)
        .limit(500);

      if (readError) {
        continue;
      }

      const ids = (data ?? []).map((row: any) => row.id).filter(Boolean);
      if (ids.length === 0) {
        continue;
      }

      const { error: updateError } = await supabase
        .from(table)
        .update({ synced_at: nowIso })
        .in('id', ids);

      if (!updateError) {
        touched += ids.length;
      }
    }

    return touched;
  }, [userId]);

  const triggerSync = useCallback(async () => {
    if (!userId || syncing) return;

    setSyncing(true);
    setError(null);

    try {
      await syncPendingChanges();
      await markSyncedAtForUnsyncedRows();
      await refreshPendingCount();
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useOfflineSync.triggerSync',
      });
    } finally {
      setSyncing(false);
    }
  }, [markSyncedAtForUnsyncedRows, refreshPendingCount, syncing, userId]);

  useEffect(() => {
    void refreshPendingCount();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = isOnlineState(state);
      setIsOnline(online);

      if (online) {
        void triggerSync();
      }
    });

    return () => unsubscribe();
  }, [refreshPendingCount, triggerSync]);

  const status = useMemo(() => {
    if (syncing) return 'syncing';
    if (!isOnline) return 'offline';
    if (pendingCount > 0) return 'pending';
    return 'idle';
  }, [isOnline, pendingCount, syncing]);

  return {
    isOnline,
    syncing,
    pendingCount,
    lastSyncedAt,
    error,
    status,
    triggerSync,
    refreshPendingCount,
  };
}

export default useOfflineSync;
