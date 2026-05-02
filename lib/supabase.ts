// ============================================================
// VYRA FITNESS - Cliente Supabase
// Singleton configurado para React Native + Expo Secure Store
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[Vyra] Faltan variables de entorno de Supabase. Verifica EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(key);
      } catch (e) {
        console.debug?.('[Vyra/SecureStore] getItemAsync failed', e);
        return null;
      }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('[Vyra/SecureStore] Error guardando item:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('[Vyra/SecureStore] Error eliminando item:', error);
    }
  },
};

function resolveSupabaseStorageKey(url: string) {
  try {
    return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
  } catch {
    return 'sb-vyra-auth-token';
  }
}

export const SUPABASE_STORAGE_KEY = resolveSupabaseStorageKey(supabaseUrl);

function parseSecureStoreJson<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function isPersistedSupabaseSession(value: unknown): value is Partial<Session> & {
  access_token: string;
  refresh_token: string;
} {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.access_token === 'string' &&
    candidate.access_token.length > 0 &&
    typeof candidate.refresh_token === 'string' &&
    candidate.refresh_token.length > 0
  );
}

function extractPersistedUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;

  if ('id' in (value as Record<string, unknown>)) {
    return value as User;
  }

  const nested = (value as { user?: unknown }).user;
  if (nested && typeof nested === 'object' && 'id' in (nested as Record<string, unknown>)) {
    return nested as User;
  }

  return null;
}

export async function getPersistedSupabaseSessionSnapshot(): Promise<Session | null> {
  const rawSession = parseSecureStoreJson<unknown>(
    await SecureStore.getItemAsync(SUPABASE_STORAGE_KEY).catch((e) => {
      console.debug?.('[supabase] SecureStore.getItemAsync session failed', e);
      return null;
    }),
  );
  if (!isPersistedSupabaseSession(rawSession)) {
    return null;
  }

  const inlineUser = extractPersistedUser(rawSession);
  if (inlineUser) {
    return {
      ...(rawSession as Session),
      user: inlineUser,
    };
  }

  const rawUser = parseSecureStoreJson<unknown>(
    await SecureStore.getItemAsync(`${SUPABASE_STORAGE_KEY}-user`).catch((e) => {
      console.debug?.('[supabase] SecureStore.getItemAsync user failed', e);
      return null;
    }),
  );
  const persistedUser = extractPersistedUser(rawUser);
  if (!persistedUser) {
    return null;
  }

  return {
    ...(rawSession as Session),
    user: persistedUser,
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user?.id) {
    throw new Error('[Vyra] No hay sesión activa. El usuario no está autenticado.');
  }

  return session.user.id;
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

export default supabase;
