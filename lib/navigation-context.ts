import { Routes } from '@/constants/routes';

export type OriginParam = string | string[] | undefined;
export type RouteIntentParams = Record<string, string | string[] | undefined>;

export type QuickLogSuccessKey =
  | 'water'
  | 'nutrition'
  | 'sleep'
  | 'weight'
  | 'mental';

export function resolveParamValue(value: OriginParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function isQuickLogOrigin(origin: OriginParam): boolean {
  return resolveParamValue(origin) === 'quick-log';
}

export function getQuickLogSuccessRoute(success: QuickLogSuccessKey): string {
  return `${Routes.log}?success=${success}`;
}

export function getWorkoutSummaryRoute(origin: OriginParam): string {
  return isQuickLogOrigin(origin)
    ? `${Routes.workout.summary}?origin=quick-log`
    : Routes.workout.summary;
}

export function buildRouteWithParams(pathname: string, params?: RouteIntentParams): string {
  if (!params) return pathname;

  const search = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(params)) {
    if (!key || key.startsWith('$')) continue;

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      if (value === undefined || value === null) continue;
      const normalized = String(value).trim();
      if (!normalized || normalized === 'undefined' || normalized === 'null') continue;
      search.append(key, normalized);
    }
  }

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}
