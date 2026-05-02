import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { isQaBridgeRuntimeModeEnabled } from '@/lib/qa-auth-bridge';

export async function syncQaBackgroundFetchTask(taskName: string): Promise<boolean> {
  if (!isQaBridgeRuntimeModeEnabled()) return false;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName).catch((e) => {
    console.debug?.('[qa-background-fetch] isTaskRegisteredAsync failed', e);
    return false;
  });
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(taskName).catch((e) => {
      console.debug?.('[qa-background-fetch] unregisterTaskAsync failed', e);
    });
  }

  return true;
}

export async function syncQaBackgroundFetchTasks(taskNames: string[]): Promise<boolean> {
  if (!isQaBridgeRuntimeModeEnabled()) return false;

  await Promise.all(taskNames.map((taskName) => syncQaBackgroundFetchTask(taskName)));
  return true;
}
