import { useCallback, useEffect, useState } from 'react';
import {
  getActivePassiveStepsRoute,
  getActiveStepsRoute,
  getPassiveStepsRouteEnabled,
  getStoredStepsRoutes,
  isPassiveStepsRouteTracking,
  isStepsRouteTracking,
  setPassiveStepsRouteEnabled,
  startStepsRouteTracking,
  stopStepsRouteTracking,
  type StepsRoute,
} from '@/lib/steps-route-task';

export function useStepsRoutes(refreshIntervalMs = 0) {
  const [storedRoutes, setStoredRoutes] = useState<StepsRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState<StepsRoute | null>(null);
  const [passiveRoute, setPassiveRoute] = useState<StepsRoute | null>(null);
  const [manualTracking, setManualTracking] = useState(false);
  const [passiveTracking, setPassiveTracking] = useState(false);
  const [passiveEnabled, setPassiveEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [stored, active, passive, manualStarted, passiveStarted, passiveEnabledValue] =
      await Promise.all([
        getStoredStepsRoutes(),
        getActiveStepsRoute(),
        getActivePassiveStepsRoute(),
        isStepsRouteTracking(),
        isPassiveStepsRouteTracking(),
        getPassiveStepsRouteEnabled(),
      ]);

    setStoredRoutes(stored);
    setActiveRoute(active);
    setPassiveRoute(passive);
    setManualTracking(manualStarted);
    setPassiveTracking(passiveStarted);
    setPassiveEnabled(passiveEnabledValue);
    setIsLoading(false);
  }, []);

  const startManualRoute = useCallback(async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const result = await startStepsRouteTracking();
      if (!result.ok) {
        setActionError(result.error ?? 'No se pudo iniciar la ruta.');
      }
      await refresh();
      return result;
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  const stopManualRoute = useCallback(async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const route = await stopStepsRouteTracking();
      await refresh();
      return route;
    } catch (error) {
      setActionError(
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'No se pudo cerrar la ruta activa.',
      );
      await refresh();
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  const setPassiveRouteEnabled = useCallback(
    async (enabled: boolean) => {
      setActionLoading(true);
      setActionError(null);
      try {
        const result = await setPassiveStepsRouteEnabled(enabled);
        if (!result.ok) {
          setActionError(result.error ?? 'No se pudo actualizar el tracking pasivo.');
        }
        await refresh();
        return result;
      } finally {
        setActionLoading(false);
      }
    },
    [refresh],
  );

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
    passiveEnabled,
    isLoading,
    actionLoading,
    actionError,
    startManualRoute,
    stopManualRoute,
    setPassiveRouteEnabled,
    refresh,
  };
}
