// ============================================================
// VYRA FITNESS — UI Store (Zustand)
// Estado global de la interfaz: toasts, modales, loading global
// ============================================================

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'coins';

export interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
  duration:number;             // ms
}

interface UIState {
  // Toasts
  toasts:           Toast[];
  showToast:        (message: string, type?: ToastType, duration?: number) => void;
  dismissToast:     (id: string) => void;
  clearAllToasts:   () => void;

  // Loading global (overlay)
  isGlobalLoading:  boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Modal de logro (badge desbloqueado, PR, level up)
  achievementModal: {
    visible:   boolean;
    type:      'badge' | 'pr' | 'levelup' | 'streak' | null;
    title:     string;
    subtitle:  string;
    coins:     number;
    xp:        number;
  };
  showAchievement: (params: Omit<UIState['achievementModal'], 'visible'>) => void;
  hideAchievement: () => void;

  // Estado de conexión
  isOnline:     boolean;
  setIsOnline:  (online: boolean) => void;

  // Workout activo (para modo no-molestar de anuncios)
  isWorkoutActive:   boolean;
  setWorkoutActive:  (active: boolean) => void;

  // Ayuno activo visible (para modo no-molestar de ads)
  isFastingScreenActive: boolean;
  setFastingScreenActive:(active: boolean) => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // Toasts
  toasts: [],

  showToast: (message, type = 'info', duration = 3000) => {
    const id = `toast_${++toastIdCounter}`;
    const toast: Toast = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    // Auto-dismiss
    setTimeout(() => {
      get().dismissToast(id);
    }, duration);
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearAllToasts: () => set({ toasts: [] }),

  // Loading global
  isGlobalLoading: false,
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  // Achievement modal
  achievementModal: {
    visible:  false,
    type:     null,
    title:    '',
    subtitle: '',
    coins:    0,
    xp:       0,
  },

  showAchievement: (params) =>
    set({ achievementModal: { visible: true, ...params } }),

  hideAchievement: () =>
    set((state) => ({
      achievementModal: { ...state.achievementModal, visible: false },
    })),

  // Conectividad
  isOnline:    true,
  setIsOnline: (isOnline) => set({ isOnline }),

  // Workout/Fasting activo (para suprimir ads)
  isWorkoutActive:    false,
  setWorkoutActive:   (isWorkoutActive) => set({ isWorkoutActive }),
  isFastingScreenActive: false,
  setFastingScreenActive:(isFastingScreenActive) => set({ isFastingScreenActive }),
}));