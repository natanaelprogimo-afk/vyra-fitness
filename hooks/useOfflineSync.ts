import { useCallback, useEffect, useMemo, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getDatabase, isDatabaseLayerEnabled, syncPendingChanges } from '@/database';
import { captureError } from '@/lib/sentry';

const SYNC_TABLES = [
  'water_logs',
  'step_logs',
  'meals',
  'sleep_logs',
  'weight_logs',
  'workout_sessions',
  'mental_checkins',
  'fasting_sessions',
] as const;

const PARTIAL_OFFLINE_MODULES = ['water', 'sleep', 'weight', 'nutrition'] as const;
const LOCAL_FIRST_MODULES = ['workout'] as const;

interface SyncableRow {
  id?: string | number | null;
}

function isOnlineState(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export function useOfflineSync() {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.id ?? '';
  const queueEnabled = isDatabaseLayerEnabled();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshPendingCount = useCallback(async () => {
    if (!queueEnabled) {
      setPendingCount(0);
      return;
    }

    try {
      const db = getDatabase();
      const queue = await db.get('sync_queue').query().fetch();
      setPendingCount(queue.length);
    } catch {
      setPendingCount(0);
    }
  }, [queueEnabled]);

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

      const ids = ((data ?? []) as SyncableRow[]).map((row) => row.id).filter(Boolean);
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
    let active = true;

    void NetInfo.fetch().then((state) => {
      if (!active) return;
      const online = isOnlineState(state);
      setIsOnline(online);

      if (online) {
        void triggerSync();
      }
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = isOnlineState(state);
      setIsOnline(online);

      if (online) {
        void triggerSync();
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshPendingCount, triggerSync]);

  const status = useMemo(() => {
    if (syncing) return 'syncing';
    if (!isOnline) return 'offline';
    if (!queueEnabled) return 'limited';
    if (pendingCount > 0) return 'pending';
    return 'idle';
  }, [isOnline, pendingCount, queueEnabled, syncing]);

  const syncModeLabel = queueEnabled ? 'global' : 'parcial';
  const syncModeDescription = queueEnabled
    ? 'La cola offline global esta disponible y puede vaciar cambios pendientes.'
    : 'La cola offline global sigue en reconstruccion. Agua, sueno, peso y nutricion usan persistencia local por modulo, mientras workout sigue siendo local-first.';

  return {
    isOnline,
    syncing,
    queueEnabled,
    pendingCount,
    lastSyncedAt,
    error,
    status,
    syncModeLabel,
    syncModeDescription,
    supportedOfflineModules: PARTIAL_OFFLINE_MODULES,
    localFirstModules: LOCAL_FIRST_MODULES,
    triggerSync,
    refreshPendingCount,
  };
}

export default useOfflineSync;
