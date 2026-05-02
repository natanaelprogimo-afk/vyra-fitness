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
    return query ? `${normalizedPath}?${query}` : normalizedPath;
  } catch {
    return null;
  }
}
