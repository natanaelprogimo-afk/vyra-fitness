// ============================================================
// VYRA FITNESS — Fasting Store (Zustand)
// Estado del ayuno activo — persiste durante la sesión
// ============================================================

import { create } from 'zustand';
import type { FastingProtocol, FastingPhase, ActiveFastingState } from '@/types/modules';

interface FastingStore extends ActiveFastingState {
  startFast:     (protocol: FastingProtocol, logId: string) => void;
  stopFast:      () => void;
  updatePhase:   (phase: FastingPhase, elapsedHours: number) => void;
  setElapsed:    (hours: number) => void;
  setLogId:      (id: string) => void;
}

export const useFastingStore = create<FastingStore>((set) => ({
  // Estado inicial
  isActive:     false,
  protocol:     null,
  startTime:    null,
  currentPhase: null,
  elapsedHours: 0,
  logId:        null,

  startFast: (protocol, logId) =>
    set({
      isActive:     true,
      protocol,
      startTime:    new Date(),
      currentPhase: 'digestion',
      elapsedHours: 0,
      logId,
    }),

  stopFast: () =>
    set({
      isActive:     false,
      protocol:     null,
      startTime:    null,
      currentPhase: null,
      elapsedHours: 0,
      logId:        null,
    }),

  updatePhase: (phase, elapsedHours) =>
    set({ currentPhase: phase, elapsedHours }),

  setElapsed: (hours) => set({ elapsedHours: hours }),

  setLogId: (id) => set({ logId: id }),
}));