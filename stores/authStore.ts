// ============================================================
// VYRA FITNESS — Auth Store (Zustand)
// Estado global de autenticación y perfil del usuario
// ============================================================

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';

interface AuthState {
  // Estado
  session:        Session | null;
  user:           User | null;
  profile:        UserProfile | null;
  isLoading:      boolean;
  isInitialized:  boolean;

  // Acciones
  setSession:    (session: Session | null) => void;
  setUser:       (user: User | null) => void;
  setProfile:    (profile: UserProfile | null) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setLoading:    (loading: boolean) => void;
  setInitialized:(initialized: boolean) => void;
  reset:         () => void;
  signOut:       () => Promise<void>;
  logout:        () => Promise<void>;

  // Computed helpers
  isAuthenticated:  () => boolean;
  isPremium:        () => boolean;
  isOnboarded:      () => boolean;
}

const initialState = {
  session:       null,
  user:          null,
  profile:       null,
  isLoading:     true,
  isInitialized: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setSession: (session) => set({ session }),

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  updateProfile: (partial) => {
    const current = get().profile;
    if (!current) return;
    set({ profile: { ...current, ...partial } });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  reset: () => set({ ...initialState, isLoading: false, isInitialized: true }),

  signOut: async () => {
    set({ ...initialState, isLoading: false, isInitialized: true });
  },

  logout: async () => {
    set({ ...initialState, isLoading: false, isInitialized: true });
  },

  // Computed: retorna función para que siempre lea el estado actual
  isAuthenticated: () => get().session !== null && get().user !== null,

  isPremium: () => {
    const profile = get().profile;
    if (!profile) return false;
    if (!profile.is_premium) return false;
    if (!profile.premium_expires_at) return true;
    return new Date(profile.premium_expires_at) > new Date();
  },

  isOnboarded: () => get().profile?.onboarding_completed ?? false,
}));