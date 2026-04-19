import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import { Pedometer } from 'expo-sensors';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { STEPS_BG_TASK } from '@/lib/background-task-ids';
import { syncQaBackgroundFetchTask } from '@/lib/qa-background-fetch';
const STEPS_BG_USER_KEY = '@vyra_steps_bg_user_v1';
const STEPS_BG_LATEST_PREFIX = '@vyra_steps_bg_latest_v1';
const STEPS_BG_SNAPSHOT_PREFIX = '@vyra_steps_bg_snapshot_v1';

type PedometerPermissionsApi = typeof Pedometer & {
  getPermissionsAsync?: () => Promise<{ granted?: boolean; status?: string }>;
};

export interface StepsBackgroundSnapshot {
  userId: string;
  dayKey: string;
  steps: number;
  capturedAt: string;
  source: 'pedometer';
}

function getLocalDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSnapshotKey(userId: string, dayKey = getLocalDayKey()) {
  return `${STEPS_BG_SNAPSHOT_PREFIX}_${userId}_${dayKey}`;
}

function getLatestKey(userId: string) {
  return `${STEPS_BG_LATEST_PREFIX}_${userId}`;
}

async function getCurrentNativeStepTotal(): Promise<number | null> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return null;

  const pedometerApi = Pedometer as PedometerPermissionsApi;
  const permission = pedometerApi.getPermissionsAsync
    ?  await pedometerApi.getPermissionsAsync().catch(() => null)
    : null;

  if (permission && !permission.granted) return null;

  const available = await Pedometer.isAvailableAsync().catch(() => false);
  if (!available) return null;

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const result = await Pedometer.getStepCountAsync(dayStart, new Date()).catch(() => null);
  if (!result) return null;
  return Math.max(0, Math.round(result.steps ?? 0));
}

export async function setStepsBackgroundSyncUser(userId: string | null): Promise<void> {
  if (!userId) {
    await AsyncStorage.removeItem(STEPS_BG_USER_KEY).catch(() => {});
    return;
  }
  await AsyncStorage.setItem(STEPS_BG_USER_KEY, userId).catch(() => {});
}

export async function captureStepsBackgroundSnapshotNow(
  userIdOverride?: string | null,
): Promise<StepsBackgroundSnapshot | null> {
  const userId = userIdOverride ?? (await AsyncStorage.getItem(STEPS_BG_USER_KEY).catch(() => null));
  if (!userId) return null;

  const steps = await getCurrentNativeStepTotal();
  if (steps === null) return null;

  const snapshot: StepsBackgroundSnapshot = {
    userId,
    dayKey: getLocalDayKey(),
    steps,
    capturedAt: new Date().toISOString(),
    source: 'pedometer',
  };

  await AsyncStorage.multiSet([
    [getSnapshotKey(userId, snapshot.dayKey), JSON.stringify(snapshot)],
    [getLatestKey(userId), JSON.stringify(snapshot)],
  ]).catch(() => {});

  return snapshot;
}

export async function readStepsBackgroundSnapshot(
  userId: string,
  dayKey = getLocalDayKey(),
): Promise<StepsBackgroundSnapshot | null> {
  const direct = await AsyncStorage.getItem(getSnapshotKey(userId, dayKey)).catch(() => null);
  if (direct) {
    try {
      return JSON.parse(direct) as StepsBackgroundSnapshot;
    } catch {
      return null;
    }
  }

  const latest = await AsyncStorage.getItem(getLatestKey(userId)).catch(() => null);
  if (!latest) return null;

  try {
    const parsed = JSON.parse(latest) as StepsBackgroundSnapshot;
    return parsed.dayKey === dayKey ? parsed : null;
  } catch {
    return null;
  }
}

if (!TaskManager.isTaskDefined(STEPS_BG_TASK)) {
  TaskManager.defineTask(STEPS_BG_TASK, async () => {
    try {
      const snapshot = await captureStepsBackgroundSnapshotNow();
      return snapshot
        ?  BackgroundFetch.BackgroundFetchResult.NewData
        : BackgroundFetch.BackgroundFetchResult.NoData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export async function registerStepsBackgroundSync(): Promise<void> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;
  if (await syncQaBackgroundFetchTask(STEPS_BG_TASK)) return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(STEPS_BG_TASK).catch(() => false);
  if (isRegistered) return;

  await BackgroundFetch.registerTaskAsync(STEPS_BG_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  }).catch(() => {});
}

export { STEPS_BG_TASK };
