import { create } from 'zustand';

function normalizeRoute(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

interface NavigationState {
  postAuthRoute: string | null;
  setPostAuthRoute: (route: string | null | undefined) => void;
  clearPostAuthRoute: () => void;
  consumePostAuthRoute: () => string | null;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  postAuthRoute: null,

  setPostAuthRoute: (route) => {
    set({ postAuthRoute: normalizeRoute(route) });
  },

  clearPostAuthRoute: () => {
    set({ postAuthRoute: null });
  },

  consumePostAuthRoute: () => {
    const next = get().postAuthRoute;
    set({ postAuthRoute: null });
    return next;
  },
}));
