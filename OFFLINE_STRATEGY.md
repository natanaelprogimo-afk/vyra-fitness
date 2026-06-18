# VYRA FITNESS - OFFLINE-FIRST STRATEGY

**Status**: WatermelonDB removed, SyncQueue pending implementation  
**Date**: May 9, 2026  
**Version**: 1.0.0

---

## Overview

Vyra Fitness uses a **hybrid synchronization** approach:
- **Direct Supabase CRUD**: Water, sleep, nutrition, weight, fasting, mental checks (synchronized on demand)
- **Local-First Modules**: Workout data persists locally via AsyncStorage + workoutStore
- **Unified SyncQueue** (implementing in Phase 2): Central offline queue for all modules

### Current State (Post Phase 1)

After removing WatermelonDB:
- ✅ Workout remains local-first (AsyncStorage + workoutStore)
- 🟠 Water, nutrition, sleep, weight offline capability: **ONLINE-ONLY** (temporary)
- 🟠 SyncQueue implementation: **PENDING** (Phase 2)

---

## Architecture

### 1. Local-First Modules (NOW)

**Workout Module**: Fully offline-capable
- **Storage**: AsyncStorage + Zustand workoutStore
- **Sync Trigger**: Manual sync button or app resume
- **Implementation**: `lib/sync/workoutStore.ts`, `hooks/useWorkout.ts`

```
User Action
  ↓
useWorkout() → Zustand store update → AsyncStorage persist
  ↓
{isLoading, data, error}
  ↓
On Network Resume → Auto-sync to Supabase (future: SyncQueue)
```

### 2. Online Modules (TEMPORARY, until SyncQueue)

**Water, Nutrition, Sleep, Weight, Fasting, Mental** 
- **Storage**: Supabase only (no local cache)
- **Sync**: Direct insert/update on action
- **Offline**: ❌ Data enters "pending" state if network fails (TEMPORARY)

```
User Action
  ↓
useWater() → Direct Supabase insert
  ↓
Success: Data saved
Failure: Error toast (no retry)
```

### 3. Unified SyncQueue (PENDING - Phase 2)

Will add offline-first to all modules:

```
User Action
  ↓
SyncQueue.add(table, action, data) → AsyncStorage queue
  ↓
If Online:
  └→ Immediate sync to Supabase
If Offline:
  └→ Queue pending, sync on resume

App Resume / Network Change
  ↓
SyncQueue.processPending(supabase)
  ↓
Retry all pending items in order
```

---

## Implementation Roadmap

### Phase 1: ✅ COMPLETE
- [x] Remove WatermelonDB
- [x] Migrate offline references
- [x] Keep workout local-first intact
- [x] typecheck passing

### Phase 2: PENDING (1 week)
- [ ] Create `lib/sync/syncQueue.ts` class
- [ ] Create `useSyncQueue()` hook
- [ ] Integrate with `useWater()` hook
- [ ] Integrate with `useNutrition()` hook
- [ ] Integrate with `useSleep()` hook
- [ ] Integrate with `useWeight()` hook
- [ ] Tests for offline/online transitions

### Phase 3: PENDING (optional, 1 week)
- [ ] Add `sync_state` column to tables (pending|synced|failed|conflicted)
- [ ] Implement retry logic with backoff
- [ ] Conflict resolution (last-write-wins)

---

## Module Implementation Guide

### How to add offline-first to a module (e.g., Water)

**Step 1**: Create module sync handler

```typescript
// lib/sync/handlers/waterSyncHandler.ts
import { SyncQueue } from './syncQueue';

export async function syncWaterLog(
  userId: string,
  logData: WaterLogInput
): Promise<{ id: string; synced: boolean }> {
  const optimisticId = await SyncQueue.add('water_logs', 'insert', {
    user_id: userId,
    ...logData,
  });

  return { id: optimisticId, synced: false };
}
```

**Step 2**: Update useWater hook

```typescript
// hooks/useWater.ts
import { syncWaterLog } from '@/lib/sync/handlers/waterSyncHandler';

export function useWater() {
  const addWater = useCallback(
    async (amount: number, type: string) => {
      // Offline: Add to SyncQueue
      // Online: Sync immediately
      const { id } = await syncWaterLog(userId, { amount, drink_type: type });
      // Update local state immediately (optimistic)
      setWaterLogs([...waterLogs, { id, amount, drink_type: type }]);
    },
    [userId, waterLogs]
  );

  return { addWater, waterLogs };
}
```

**Step 3**: Sync on app resume

```typescript
// hooks/useSyncQueue.ts
useEffect(() => {
  const subscription = AppState.addEventListener('change', async (state) => {
    if (state === 'active') {
      await SyncQueue.processPending(supabase); // Sync all queued items
    }
  });
  return () => subscription.remove();
}, [supabase]);
```

---

## Data Structures

### SyncQueue Item

```typescript
interface SyncItem {
  id: string;           // UUID: `${table}_${timestamp}_${random}`
  table: string;        // 'water_logs', 'meals', etc.
  action: 'insert' | 'update' | 'delete';
  data: Record<string, any>;
  timestamp: number;    // When queued (ms)
  status: 'pending' | 'synced' | 'failed';
}
```

### AsyncStorage Format

```json
{
  "vyra_sync_queue": [
    {
      "id": "water_logs_1715207145000_0.123",
      "table": "water_logs",
      "action": "insert",
      "data": { "user_id": "user-123", "amount_ml": 500, "drink_type": "water" },
      "timestamp": 1715207145000,
      "status": "pending"
    }
  ]
}
```

---

## Testing Offline Scenarios

### Manual Testing

**Scenario 1: Offline Add Water**
```bash
1. Open app, go to Water module
2. Turn off WiFi + cellular (iOS: Settings → Airplane Mode)
3. Add water log
4. Verify: Log appears locally with "pending" badge
5. Turn on WiFi
6. Verify: Log syncs to Supabase
```

**Scenario 2: Offline Multiple Actions**
```bash
1. Airplane mode ON
2. Add 3 water logs, 2 meals, 1 weight entry
3. Verify: 6 items in SyncQueue
4. Airplane mode OFF
5. Verify: All 6 sync in order
```

**Scenario 3: Network Failure During Sync**
```bash
1. Queue 5 items (offline)
2. Turn on WiFi, sync starts
3. Immediately turn off WiFi while syncing
4. Verify: Retry logic backs off (1s, 2s, 4s delays)
5. Turn on WiFi again
6. Verify: Sync resumes from failed item
```

### Automated Testing

```typescript
// tests/sync/syncQueue.integration.test.ts
describe('SyncQueue offline/online transitions', () => {
  test('should queue items while offline', async () => {
    const queue = await SyncQueue.getQueue();
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].status).toBe('pending');
  });

  test('should sync items when going online', async () => {
    // Mock network transition
    const queue = await SyncQueue.getQueue();
    const pending = queue.filter((item) => item.status === 'pending');
    
    await SyncQueue.processPending(mockSupabase);
    
    const updated = await SyncQueue.getQueue();
    const synced = updated.filter((item) => item.status === 'synced');
    expect(synced.length).toEqual(pending.length);
  });

  test('should retry failed items with backoff', async () => {
    // Simulate Supabase error
    mockSupabase.from = jest.fn().mockRejectedValueOnce(new Error('Network error'));
    
    await SyncQueue.processPending(mockSupabase);
    
    const queue = await SyncQueue.getQueue();
    expect(queue[0].status).toBe('failed');
  });
});
```

---

## Migration Path: Online → Offline-First

### For each module (water, nutrition, sleep, weight, fasting, mental):

1. **Week N: Create SyncHandler**
   - File: `lib/sync/handlers/${module}SyncHandler.ts`
   - Exports: `sync${Module}()` function

2. **Week N: Update Hook**
   - File: `hooks/use${Module}.ts`
   - Changes: 
     - Call SyncHandler instead of direct Supabase
     - Optimistic updates
     - Handle pending status

3. **Week N: Integration Tests**
   - File: `tests/sync/${module}.offline.test.ts`
   - Offline scenarios, network transitions

4. **Week N: Feature Flag (Optional)**
   - Allow gradual rollout
   - Old code path: `if (useNewSyncQueue) { ... }`

5. **Week N: Monitor & Remove Old Path**
   - After 2 weeks in production
   - Verify sync success rate > 99.5%
   - Remove old direct-Supabase code

---

## Known Limitations (Until SyncQueue)

- ❌ Water, nutrition, sleep, weight data lost if network fails before sync
- ❌ No retry logic for failed syncs
- ❌ No conflict resolution if same record modified offline + online
- ❌ No analytics on sync failures

---

## Deployment Notes

### Phase 1 (WatermelonDB Removal)
- **Risk**: LOW
- **Rollback**: Remove database/ folder reinstatement (not recommended long-term)
- **Monitoring**: Watch for broken imports in Sentry
- **Users Affected**: None (already not using WatermelonDB)

### Phase 2 (SyncQueue Implementation)
- **Risk**: MEDIUM (new offline logic)
- **Rollback**: Feature flag to disable SyncQueue, return to online-only
- **Monitoring**: SyncQueue.getStats() → {"total": N, "pending": M, "synced": X, "failed": Y}
- **Success Metric**: Sync success rate > 99%, <100ms avg sync time

---

## References

- Zustand: https://github.com/pmndrs/zustand (state management)
- AsyncStorage: https://react-native-async-storage.github.io/ (persistence)
- Supabase JS Client: https://supabase.com/docs/reference/javascript/introduction

---

**Next Review**: After Phase 2 implementation (1 week)  
**Owner**: Frontend Team  
**Last Updated**: May 9, 2026
