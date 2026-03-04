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

// TODO (F7): implementar WatermelonDB schemas y sync engine completo