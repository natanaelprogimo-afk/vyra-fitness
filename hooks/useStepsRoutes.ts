import { useCallback, useEffect, useState } from 'react';
import {
  getActivePassiveStepsRoute,
  getActiveStepsRoute,
  getStoredStepsRoutes,
  isPassiveStepsRouteTracking,
  isStepsRouteTracking,
  type StepsRoute,
} from '@/lib/steps-route-task';

export function useStepsRoutes(refreshIntervalMs = 0) {
  const [storedRoutes, setStoredRoutes] = useState<StepsRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState<StepsRoute | null>(null);
  const [passiveRoute, setPassiveRoute] = useState<StepsRoute | null>(null);
  const [manualTracking, setManualTracking] = useState(false);
  const [passiveTracking, setPassiveTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [stored, active, passive, manualStarted, passiveStarted] = await Promise.all([
      getStoredStepsRoutes(),
      getActiveStepsRoute(),
      getActivePassiveStepsRoute(),
      isStepsRouteTracking(),
      isPassiveStepsRouteTracking(),
    ]);

    setStoredRoutes(stored);
    setActiveRoute(active);
    setPassiveRoute(passive);
    setManualTracking(manualStarted);
    setPassiveTracking(passiveStarted);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (refreshIntervalMs <= 0) return undefined;
    const id = setInterval(() => {
      void refresh();
    }, refreshIntervalMs);
    return () => clearInterval(id);
  }, [refresh, refreshIntervalMs]);

  return {
    storedRoutes,
    activeRoute,
    passiveRoute,
    manualTracking,
    passiveTracking,
    isLoading,
    refresh,
  };
}
