// ============================================================
// VYRA FITNESS - UI Store (Zustand)
// Estado global de la interfaz: toasts, modales, loading global
// ============================================================

import { create } from 'zustand';
import { announceAccessibility } from '@/lib/accessibility';
import { trackQuickLogOpened } from '@/lib/analytics';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface WorkoutSummarySnapshot {
  sessionId: string;
  name: string;
  durationMin: number;
  totalVolume: number;
  setsCount: number;
  estimatedCalories: number;
  endedAt: string;
  prs: Array<{
    exercise_name: string;
    weight_kg: number;
    reps: number;
  }>;
  musclesWorked: string[];
  plannedExercises: Array<{
    exercise_id: string;
    exercise_name: string;
    targetSets: number;
    targetReps: number;
  }>;
}

export type QuickLogMode = 'menu' | 'water' | 'sleep' | 'weight' | 'fasting';

interface UIState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;

  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  isWorkoutActive: boolean;
  setWorkoutActive: (active: boolean) => void;

  lastWorkoutSummary: WorkoutSummarySnapshot | null;
  setLastWorkoutSummary: (summary: WorkoutSummarySnapshot | null) => void;

  isFastingScreenActive: boolean;
  setFastingScreenActive: (active: boolean) => void;

  notificationsRefreshKey: number;
  bumpNotificationsRefresh: () => void;

  isQuickLogOpen: boolean;
  quickLogMode: QuickLogMode;
  openQuickLog: (mode?: QuickLogMode) => void;
  closeQuickLog: () => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],

  showToast: (message, type = 'info', duration) => {
    const id = `toast_${++toastIdCounter}`;
    const resolvedDuration =
      typeof duration === 'number'
        ? duration
        : type === 'error'
          ? 5000
          : 3000;
    const toast: Toast = { id, message, type, duration: resolvedDuration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    void announceAccessibility(message);
    setTimeout(() => {
      get().dismissToast(id);
    }, resolvedDuration);
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  clearAllToasts: () => set({ toasts: [] }),

  isGlobalLoading: false,
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),

  isWorkoutActive: false,
  setWorkoutActive: (isWorkoutActive) => set({ isWorkoutActive }),

  lastWorkoutSummary: null,
  setLastWorkoutSummary: (summary) => set({ lastWorkoutSummary: summary }),

  isFastingScreenActive: false,
  setFastingScreenActive: (isFastingScreenActive) => set({ isFastingScreenActive }),

  notificationsRefreshKey: 0,
  bumpNotificationsRefresh: () =>
    set((state) => ({ notificationsRefreshKey: state.notificationsRefreshKey + 1 })),

  isQuickLogOpen: false,
  quickLogMode: 'menu',
  openQuickLog: (mode = 'menu') => {
    trackQuickLogOpened(mode, 'home');
    set({ isQuickLogOpen: true, quickLogMode: mode });
  },
  closeQuickLog: () => set({ isQuickLogOpen: false, quickLogMode: 'menu' }),
}));
