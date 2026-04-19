import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';

type ExpoLocationModule = typeof import('expo-location');

export const STEPS_ROUTE_TASK = 'VYRA_STEPS_ROUTE_TASK';
export const STEPS_PASSIVE_ROUTE_TASK = 'VYRA_STEPS_PASSIVE_ROUTE_TASK';
export const STEPS_ROUTES_KEY = '@vyra_steps_routes_v1';
export const STEPS_ACTIVE_ROUTE_KEY = '@vyra_steps_active_route_v1';
export const STEPS_PASSIVE_ACTIVE_ROUTE_KEY = '@vyra_steps_passive_active_route_v1';
export const STEPS_PASSIVE_ENABLED_KEY = '@vyra_steps_passive_enabled_v1';

export type RoutePoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type StepsRoute = {
  id: string;
  startedAt: string;
  endedAt?: string;
  distanceKm: number;
  points: RoutePoint[];
  source?: 'manual' | 'passive';
};

let cachedLocationModule: ExpoLocationModule | null = null;

function getLocationModule(): ExpoLocationModule {
  if (!cachedLocationModule) {
    cachedLocationModule = require('expo-location') as ExpoLocationModule;
  }

  return cachedLocationModule;
}

function haversineKm(a: RoutePoint, b: RoutePoint): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return 6371 * c;
}

async function readActiveRoute(): Promise<StepsRoute | null> {
  try {
    const raw = await AsyncStorage.getItem(STEPS_ACTIVE_ROUTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StepsRoute;
    if (!parsed?.id) return null;
    return { ...parsed, source: parsed.source ?? 'manual' };
  } catch {
    return null;
  }
}

async function writeActiveRoute(route: StepsRoute | null): Promise<void> {
  try {
    if (!route) {
      await AsyncStorage.removeItem(STEPS_ACTIVE_ROUTE_KEY);
      return;
    }
    await AsyncStorage.setItem(STEPS_ACTIVE_ROUTE_KEY, JSON.stringify(route));
  } catch {}
}

async function readPassiveRoute(): Promise<StepsRoute | null> {
  try {
    const raw = await AsyncStorage.getItem(STEPS_PASSIVE_ACTIVE_ROUTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StepsRoute;
    if (!parsed?.id) return null;
    return { ...parsed, source: parsed.source ?? 'passive' };
  } catch {
    return null;
  }
}

async function writePassiveRoute(route: StepsRoute | null): Promise<void> {
  try {
    if (!route) {
      await AsyncStorage.removeItem(STEPS_PASSIVE_ACTIVE_ROUTE_KEY);
      return;
    }
    await AsyncStorage.setItem(STEPS_PASSIVE_ACTIVE_ROUTE_KEY, JSON.stringify(route));
  } catch {}
}

async function readRoutes(): Promise<StepsRoute[]> {
  try {
    const raw = await AsyncStorage.getItem(STEPS_ROUTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StepsRoute[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((route) => ({
      ...route,
      source: route?.source ?? 'manual',
    }));
  } catch {
    return [];
  }
}

async function writeRoutes(routes: StepsRoute[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STEPS_ROUTES_KEY, JSON.stringify(routes));
  } catch {}
}

async function storeRoute(route: StepsRoute): Promise<void> {
  const stored = await readRoutes();
  const nextRoutes = [route, ...stored].slice(0, 20);
  await writeRoutes(nextRoutes);
}

if (!TaskManager.isTaskDefined(STEPS_ROUTE_TASK)) {
  TaskManager.defineTask(STEPS_ROUTE_TASK, async ({ data, error }) => {
    if (error) {
      return;
    }

    const locations = (data as any)?.locations ?? [];
    if (!locations.length) return;

    let route = await readActiveRoute();
    if (!route) {
      route = {
        id: `route_${Date.now()}`,
        startedAt: new Date().toISOString(),
        distanceKm: 0,
        points: [],
      };
    }

    const nextPoints = [...route.points];
    let distanceKm = route.distanceKm ?? 0;
    let lastPoint = nextPoints[nextPoints.length - 1] ?? null;

    for (const location of locations) {
      if (!location?.coords) continue;
      const point: RoutePoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(location.timestamp ?? Date.now()).toISOString(),
      };
      if (lastPoint) {
        distanceKm += haversineKm(lastPoint, point);
      }
      nextPoints.push(point);
      lastPoint = point;
    }

    const trimmedPoints = nextPoints.slice(-500);
    await writeActiveRoute({
      ...route,
      distanceKm: Math.round(distanceKm * 100) / 100,
      points: trimmedPoints,
    });
  });
}

if (!TaskManager.isTaskDefined(STEPS_PASSIVE_ROUTE_TASK)) {
  TaskManager.defineTask(STEPS_PASSIVE_ROUTE_TASK, async ({ data, error }) => {
    if (error) {
      return;
    }

    const locations = (data as any)?.locations ?? [];
    if (!locations.length) return;

    let route = await readPassiveRoute();
    let distanceKm = route?.distanceKm ?? 0;
    let points = route?.points ?? [];
    let lastPoint: RoutePoint | null = points[points.length - 1] ?? null;

    for (const location of locations) {
      if (!location?.coords) continue;
      const timestamp = new Date(location.timestamp ?? Date.now()).toISOString();
      const point: RoutePoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp,
      };

      const pointDay = timestamp.split('T')[0];
      const routeDay = route?.startedAt ? route.startedAt.split('T')[0] : null;

      if (!route || !routeDay || routeDay !== pointDay) {
        if (route && route.points.length >= 2) {
          await storeRoute({
            ...route,
            endedAt: lastPoint?.timestamp ?? timestamp,
            distanceKm: Math.round(distanceKm * 100) / 100,
            source: 'passive',
          });
        }

        route = {
          id: `passive_${pointDay}`,
          startedAt: timestamp,
          distanceKm: 0,
          points: [],
          source: 'passive',
        };
        distanceKm = 0;
        points = [];
        lastPoint = null;
      }

      if (lastPoint) {
        distanceKm += haversineKm(lastPoint, point);
      }
      points = [...points, point].slice(-300);
      lastPoint = point;
    }

    await writePassiveRoute({
      ...(route ?? {
        id: `passive_${Date.now()}`,
        startedAt: new Date().toISOString(),
        distanceKm: 0,
        points: [],
        source: 'passive',
      }),
      distanceKm: Math.round(distanceKm * 100) / 100,
      points,
      source: 'passive',
    });
  });
}

export async function getStoredStepsRoutes(): Promise<StepsRoute[]> {
  return readRoutes();
}

export async function getActiveStepsRoute(): Promise<StepsRoute | null> {
  return readActiveRoute();
}

export async function getActivePassiveStepsRoute(): Promise<StepsRoute | null> {
  return readPassiveRoute();
}

export async function isStepsRouteTracking(): Promise<boolean> {
  try {
    const Location = getLocationModule();
    return await Location.hasStartedLocationUpdatesAsync(STEPS_ROUTE_TASK);
  } catch {
    return false;
  }
}

export async function isPassiveStepsRouteTracking(): Promise<boolean> {
  try {
    const Location = getLocationModule();
    return await Location.hasStartedLocationUpdatesAsync(STEPS_PASSIVE_ROUTE_TASK);
  } catch {
    return false;
  }
}

export async function getPassiveStepsRouteEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STEPS_PASSIVE_ENABLED_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function startPassiveStepsRouteTracking(): Promise<{ ok: boolean; error?: string }> {
  try {
    const Location = getLocationModule();
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (!foreground.granted) {
      return { ok: false, error: 'Permiso de ubicación denegado.' };
    }

    const background = await Location.requestBackgroundPermissionsAsync().catch(() => ({
      granted: false,
    }));
    if (!background.granted) {
      return { ok: false, error: 'Necesitas permiso de ubicación en segundo plano.' };
    }

    const already = await Location.hasStartedLocationUpdatesAsync(STEPS_PASSIVE_ROUTE_TASK);
    if (already) {
      await AsyncStorage.setItem(STEPS_PASSIVE_ENABLED_KEY, 'true');
      return { ok: true };
    }

    const now = new Date().toISOString();
    await writePassiveRoute({
      id: `passive_${now.split('T')[0] ?? Date.now()}`,
      startedAt: now,
      distanceKm: 0,
      points: [],
      source: 'passive',
    });

    await Location.startLocationUpdatesAsync(STEPS_PASSIVE_ROUTE_TASK, {
      accuracy: Location.Accuracy.Low,
      timeInterval: 180000,
      distanceInterval: 50,
      deferredUpdatesInterval: 180000,
      deferredUpdatesDistance: 100,
      pausesUpdatesAutomatically: true,
      activityType: Location.ActivityType.Fitness,
      showsBackgroundLocationIndicator: false,
      foregroundService: {
        notificationTitle: 'Vyra registra tu movimiento',
        notificationBody: 'Tracking pasivo activo para mapa de pasos.',
      },
    });

    await AsyncStorage.setItem(STEPS_PASSIVE_ENABLED_KEY, 'true');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'No se pudo iniciar el tracking pasivo.',
    };
  }
}

export async function stopPassiveStepsRouteTracking(): Promise<StepsRoute | null> {
  try {
    const Location = getLocationModule();
    const active = await readPassiveRoute();
    const hasUpdates = await Location.hasStartedLocationUpdatesAsync(STEPS_PASSIVE_ROUTE_TASK);
    if (hasUpdates) {
      await Location.stopLocationUpdatesAsync(STEPS_PASSIVE_ROUTE_TASK);
    }

    await AsyncStorage.setItem(STEPS_PASSIVE_ENABLED_KEY, 'false');

    if (!active) {
      await writePassiveRoute(null);
      return null;
    }

    if (!active.points || active.points.length < 2) {
      await writePassiveRoute(null);
      return null;
    }

    const endedAt = new Date().toISOString();
    const route: StepsRoute = {
      ...active,
      endedAt,
      distanceKm: Math.round((active.distanceKm ?? 0) * 100) / 100,
      source: 'passive',
    };

    await storeRoute(route);
    await writePassiveRoute(null);
    return route;
  } catch {
    return null;
  }
}

export async function setPassiveStepsRouteEnabled(
  enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (enabled) {
    return startPassiveStepsRouteTracking();
  }
  await stopPassiveStepsRouteTracking();
  return { ok: true };
}

export async function startStepsRouteTracking(): Promise<{ ok: boolean; error?: string }> {
  try {
    const Location = getLocationModule();
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (!foreground.granted) {
      return { ok: false, error: 'Permiso de ubicación denegado.' };
    }

    const background = await Location.requestBackgroundPermissionsAsync().catch(() => ({
      granted: false,
    }));
    if (!background.granted) {
      // Continuar igual, pero la ruta no seguirá en segundo plano.
    }

    const already = await Location.hasStartedLocationUpdatesAsync(STEPS_ROUTE_TASK);
    if (already) {
      return { ok: true };
    }

    const startedAt = new Date().toISOString();
    await writeActiveRoute({
      id: `route_${Date.now()}`,
      startedAt,
      distanceKm: 0,
      points: [],
      source: 'manual',
    });

    await Location.startLocationUpdatesAsync(STEPS_ROUTE_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 15000,
      distanceInterval: 15,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Vyra esta registrando tu ruta',
        notificationBody: 'Tu caminata sigue activa en segundo plano.',
      },
      pausesUpdatesAutomatically: true,
      activityType: Location.ActivityType.Fitness,
    });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'No se pudo iniciar la ruta.',
    };
  }
}

export async function stopStepsRouteTracking(): Promise<StepsRoute | null> {
  try {
    const Location = getLocationModule();
    const active = await readActiveRoute();
    if (!active) {
      await Location.stopLocationUpdatesAsync(STEPS_ROUTE_TASK);
      return null;
    }

    const hasUpdates = await Location.hasStartedLocationUpdatesAsync(STEPS_ROUTE_TASK);
    if (hasUpdates) {
      await Location.stopLocationUpdatesAsync(STEPS_ROUTE_TASK);
    }

    if (!active.points || active.points.length < 2) {
      await writeActiveRoute(null);
      return null;
    }

    const endedAt = new Date().toISOString();
    const route: StepsRoute = {
      ...active,
      endedAt,
      distanceKm: Math.round((active.distanceKm ?? 0) * 100) / 100,
      source: 'manual',
    };

    await storeRoute(route);
    await writeActiveRoute(null);
    return route;
  } catch {
    return null;
  }
}
