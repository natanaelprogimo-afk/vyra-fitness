// ============================================================
// VYRA FITNESS — Steps Store (Zustand)
// Estado del pedómetro en tiempo real
// ============================================================

import { create } from 'zustand';

interface StepsState {
  todaySteps:    number;
  todayDistance: number;             // metros
  todayCalories: number;
  isTracking:    boolean;
  lastUpdated:   Date | null;
  source:        'sensor' | 'manual';

  setSteps:      (steps: number) => void;
  setDistance:   (meters: number) => void;
  setCalories:   (cal: number) => void;
  setTracking:   (tracking: boolean) => void;
  setSource:     (source: 'sensor' | 'manual') => void;
  update:        (steps: number, distance?: number, calories?: number) => void;
  reset:         () => void;
}

export const useStepsStore = create<StepsState>((set) => ({
  todaySteps:    0,
  todayDistance: 0,
  todayCalories: 0,
  isTracking:    false,
  lastUpdated:   null,
  source:        'sensor',

  setSteps:    (steps) => set({ todaySteps: steps, lastUpdated: new Date() }),
  setDistance: (distance) => set({ todayDistance: distance }),
  setCalories: (calories) => set({ todayCalories: calories }),
  setTracking: (isTracking) => set({ isTracking }),
  setSource:   (source) => set({ source }),

  update: (steps, distance, calories) =>
    set({
      todaySteps:    steps,
      todayDistance: distance ?? 0,
      todayCalories: calories ?? 0,
      lastUpdated:   new Date(),
    }),

  reset: () =>
    set({
      todaySteps:    0,
      todayDistance: 0,
      todayCalories: 0,
      lastUpdated:   null,
    }),
}));