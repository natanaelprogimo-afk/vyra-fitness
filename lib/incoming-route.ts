import { Routes } from '@/constants/routes';

const INCOMING_ROUTE_ALIASES: Record<string, string> = {
  '/home': Routes.tabs.home,
  '/index': Routes.tabs.home,
  '/(tabs)': Routes.tabs.home,
  '/(tabs)/index': Routes.tabs.home,
  '/explore': Routes.tabs.explore,
  '/(tabs)/explore': Routes.tabs.explore,
  '/progress': Routes.tabs.progress,
  '/(tabs)/progress': Routes.tabs.progress,
  '/onboarding/step-ready': Routes.auth.onboarding.ready,
  '/onboarding/step-modules': Routes.auth.onboarding.modules,
};

function normalizeQueryValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (entry == null ? '' : String(entry)))
      .filter((entry) => entry.length > 0);
  }

  if (value == null) {
    return [];
  }

  const normalized = String(value);
  return normalized.length > 0 ? [normalized] : [];
}

function normalizeIncomingPath(path: string): string {
  const normalized = path.replace(/\/{2,}/g, '/').trim();
  if (normalized.length <= 1) {
    return normalized;
  }

  return normalized.replace(/\/+$/, '');
}

function decodeIncomingRoute(route: string): string {
  let normalized = route.trim();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const decoded = decodeURIComponent(normalized);
      if (!decoded || decoded === normalized) break;
      normalized = decoded.trim();
    } catch {
      break;
    }
  }

  return normalized;
}

export function normalizeIncomingRoute(route: string | null | undefined): string | null {
  if (!route) return null;

  const decodedRoute = decodeIncomingRoute(route);
  if (!decodedRoute) return null;

  const [rawPath, ...queryParts] = decodedRoute.split('?');
  const normalizedPath = normalizeIncomingPath(rawPath.startsWith('/') ? rawPath : `/${rawPath}`);
  if (!normalizedPath || normalizedPath === '/') {
    return null;
  }

  const canonicalPath = INCOMING_ROUTE_ALIASES[normalizedPath] ?? normalizedPath;
  const query = queryParts.join('?').trim();
  return query ? `${canonicalPath}?${query}` : canonicalPath;
}

export function extractRouteFromIncomingUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.toLowerCase();
    if (scheme === 'http:' || scheme === 'https:') {
      return null;
    }

    const routePath = parsed.host
      ? `/${parsed.host}${parsed.pathname || ''}`
      : parsed.pathname || '';
    const normalizedPath = routePath.replace(/\/{2,}/g, '/').trim();
    if (!normalizedPath || normalizedPath === '/') {
      return null;
    }

    const params = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      normalizeQueryValue(value).forEach((entry) => params.append(key, entry));
    });

    const query = params.toString();
    return normalizeIncomingRoute(query ? `${normalizedPath}?${query}` : normalizedPath);
  } catch {
    return null;
  }
}
