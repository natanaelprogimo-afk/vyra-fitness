// ============================================================
// VYRA FITNESS — Cliente Supabase
// Singleton configurado para React Native + Expo Secure Store
// ============================================================

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[Vyra] Faltan variables de entorno de Supabase. ' +
    'Verificá EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu .env'
  );
}

// ─── Storage adapter usando expo-secure-store ─────────────────
// Los tokens de sesión se almacenan de forma segura en el Keystore de Android
// NUNCA en AsyncStorage plano (que es vulnerable)
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
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

// ─── Cliente Supabase ─────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage:          ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ─── Auto-refresh al volver a foreground ─────────────────────
// Supabase necesita que le avisemos cuando la app vuelve al frente
// para refrescar el token si venció mientras la app estaba en background
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// ─── Helpers tipados ─────────────────────────────────────────

/**
 * Obtener el user_id del usuario autenticado actualmente.
 * Lanza error si no hay sesión — usar solo en rutas protegidas.
 */
export async function getCurrentUserId(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user?.id) {
    throw new Error('[Vyra] No hay sesión activa. El usuario no está autenticado.');
  }
  return session.user.id;
}

/**
 * Obtener la sesión completa actual.
 * Retorna null si no hay sesión (sin lanzar error).
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Verificar si el usuario está autenticado.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

export default supabase;