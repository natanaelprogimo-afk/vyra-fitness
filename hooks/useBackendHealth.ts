import { useCallback, useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';

export type BackendHealthStatus = 'checking' | 'ok' | 'down';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const HEALTH_TIMEOUT_MS = 12000;
const HEALTH_POLL_MS = 120000;
const HEALTH_RETRY_DELAY_MS = 1000;
const LAST_HEALTHY_GRACE_MS = 15 * 60 * 1000;

async function fetchHealth(signal: AbortSignal): Promise<{ ok: boolean; status?: number }> {
  if (!BACKEND_URL) return { ok: true };

  const res = await fetch(`${BACKEND_URL}/health`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
    },
    signal,
  });

  return { ok: res.ok, status: res.status };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientHealthError(error: string | null): boolean {
  if (!error) return false;
  const normalized = error.toLowerCase();
  return (
    normalized.includes('abort') ||
    normalized.includes('timeout') ||
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('socket') ||
    normalized.includes('econn') ||
    normalized.includes('unreachable')
  );
}

export function useBackendHealth() {
  const isOnline = useUIStore((s) => s.isOnline);
  const [status, setStatus] = useState<BackendHealthStatus>('checking');
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const lastHealthyAt = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!BACKEND_URL || !isOnline) {
      setStatus('ok');
      setError(null);
      return;
    }

    if (inFlight.current) return;
    inFlight.current = true;

    try {
      let finalError: string | null = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

        try {
          const result = await fetchHealth(controller.signal);
          if (result.ok) {
            lastHealthyAt.current = Date.now();
            setStatus('ok');
            setError(null);
            return;
          }

          finalError = `HTTP ${result.status ?? 0}`;
        } catch (err) {
          finalError = err instanceof Error ? err.message : 'network';
        } finally {
          clearTimeout(timeout);
        }

        if (attempt === 0) {
          await wait(HEALTH_RETRY_DELAY_MS);
        }
      }

      const hadRecentHealthyCheck =
        lastHealthyAt.current !== null && Date.now() - lastHealthyAt.current < LAST_HEALTHY_GRACE_MS;

      if (hadRecentHealthyCheck || isTransientHealthError(finalError)) {
        setStatus('ok');
        setError(finalError);
      } else {
        setStatus('down');
        setError(finalError);
      }
    } finally {
      setLastCheckedAt(Date.now());
      inFlight.current = false;
    }
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) {
      setStatus('ok');
      setError(null);
      return;
    }

    void refresh();
    const interval = setInterval(() => {
      if (isOnline) void refresh();
    }, HEALTH_POLL_MS);

    return () => clearInterval(interval);
  }, [isOnline, refresh]);

  return {
    status,
    lastCheckedAt,
    error,
    refresh,
    isOnline,
  };
}

export default useBackendHealth;
