import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const DEFAULT_REQUEST_TIMEOUT_MS = 12000;

export function getBackendUrl() {
  return BACKEND_URL;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? useAuthStore.getState().session?.access_token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? useAuthStore.getState().user?.id ?? null;
}

export interface JsonRequestInit extends RequestInit {
  timeoutMs?: number;
}

export async function requestJson(
  path: string,
  init: JsonRequestInit,
): Promise<{ ok: boolean; status: number; data: unknown; text: string }> {
  const { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, signal, ...requestInit } = init;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...requestInit,
      signal: controller.signal,
    });
    const text = await response.text();

    let data: unknown = null;
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      text,
    };
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}
