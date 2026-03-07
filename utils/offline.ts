// ============================================================
// VYRA FITNESS — Utilidades offline (WatermelonDB)
// Cola de sync, resolución de conflictos, estado de red
// Se implementa completo en F7 (Offline + Sync)
// ============================================================

import NetInfo from '@/shims/netinfo';

/** Verificar si hay conexión a internet */
export async function checkIsOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

/** Item en la cola de sincronización offline */
export interface SyncQueueItem {
  id:         string;                  // UUID local
  table:      string;                  // Nombre de la tabla de Supabase
  operation:  'insert' | 'update' | 'delete';
  data:       Record<string, unknown>; // Payload a sincronizar
  createdAt:  string;                  // ISO timestamp
  retries:    number;
}

/** Resolución de conflictos: gana el timestamp más reciente */
export function resolveConflict<T extends { updated_at?: string; logged_at?: string }>(
  local: T,
  remote: T
): T {
  const getTs = (r: T) => new Date(r.updated_at ?? r.logged_at ?? 0).getTime();
  return getTs(local) >= getTs(remote) ? local : remote;
}

// Simple offline queue utilities (lightweight placeholders for F7)
const syncQueue: SyncQueueItem[] = [];

export function enqueueSync(item: SyncQueueItem) {
  item.retries = item.retries ?? 0;
  item.createdAt = item.createdAt ?? new Date().toISOString();
  syncQueue.push(item);
}

export function peekQueue(): SyncQueueItem | null {
  return syncQueue.length > 0 ? syncQueue[0] : null;
}

export async function processQueueOnce(sendFunc: (item: SyncQueueItem) => Promise<boolean>) {
  if (syncQueue.length === 0) return;
  const item = syncQueue[0];
  try {
    const ok = await sendFunc(item);
    if (ok) {
      syncQueue.shift();
    } else {
      item.retries = (item.retries ?? 0) + 1;
      // backoff or move to dead-letter after N retries — keep simple here
      if (item.retries > 3) syncQueue.shift();
    }
  } catch {
    item.retries = (item.retries ?? 0) + 1;
    if (item.retries > 3) syncQueue.shift();
  }
}

export function drainQueue() {
  return syncQueue.splice(0, syncQueue.length);
}

// Note: This is a minimal placeholder implementation. A complete F7 implementation
// should integrate WatermelonDB local writes, change tracking, conflict resolution,
// batched sync with headers and JWT, and exponential backoff.