// DEPRECATED: Sync service (WatermelonDB removed)
// For offline-first sync, use SyncQueue from lib/sync/syncQueue.ts
let initialized = false;

export function initSyncService() {
  if (initialized) return;
  initialized = true;
  // Network monitoring only, actual sync via SyncQueue
}

export default initSyncService;
