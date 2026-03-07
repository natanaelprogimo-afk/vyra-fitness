import { useCallback, useEffect, useRef, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

export const PEDOMETER_TASK = 'PEDOMETER_TASK';

if (!TaskManager.isTaskDefined(PEDOMETER_TASK)) {
  TaskManager.defineTask(PEDOMETER_TASK, async () => {
    try {
      // Expo does not expose background step streaming, but this task
      // keeps periodic background wakeups enabled for sync/checks.
      return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

async function registerPedometerTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(PEDOMETER_TASK);
  if (isRegistered) return;

  await BackgroundFetch.registerTaskAsync(PEDOMETER_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export function usePedometer() {
  const [steps, setSteps] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  const watcherRef = useRef<{ remove: () => void } | null>(null);

  const stop = useCallback(() => {
    watcherRef.current?.remove();
    watcherRef.current = null;
    setIsTracking(false);
  }, []);

  const recheckAvailability = useCallback(async () => {
    const available = await Pedometer.isAvailableAsync().catch(() => false);
    setIsAvailable(available);
    setIsManualMode(!available);
    return available;
  }, []);

  const start = useCallback(async () => {
    const available = await recheckAvailability();

    if (!available) {
      setIsManualMode(true);
      setIsTracking(false);
      return;
    }

    stop();

    watcherRef.current = Pedometer.watchStepCount((result) => {
      setSteps((prev) => Math.max(0, prev + (result.steps ?? 0)));
    });

    setIsTracking(true);
  }, [recheckAvailability, stop]);

  const addManualSteps = useCallback((amount: number) => {
    if (!isManualMode) return;
    setSteps((prev) => Math.max(0, prev + Math.max(0, Math.round(amount))));
  }, [isManualMode]);

  const reset = useCallback(() => {
    setSteps(0);
  }, []);

  useEffect(() => {
    void recheckAvailability();
    void registerPedometerTask();

    return () => {
      stop();
    };
  }, [recheckAvailability, stop]);

  return {
    steps,
    isAvailable,
    isManualMode,
    isTracking,
    start,
    stop,
    reset,
    addManualSteps,
    recheckAvailability,
    setSteps,
  };
}

export default usePedometer;
