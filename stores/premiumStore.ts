// ============================================================
// VYRA FITNESS — Premium Store (Zustand)
// Estado del plan Premium y feature flags
// ============================================================

import { create } from 'zustand';
import type { SubscriptionPlan, SubscriptionStatus } from '@/types/user';

interface PremiumState {
  isPremium:         boolean;
  plan:              SubscriptionPlan | null;
  status:            SubscriptionStatus | null;
  expiresAt:         Date | null;
  trialEndsAt:       Date | null;
  trialUsed:         boolean;
  isCheckingStatus:  boolean;

  // Feature flags (sincronizados desde Supabase)
  flags: {
    femaleHealthEnabled:     boolean;
    proactiveContextEnabled: boolean;
    rewardedAdStreakRescue:  boolean;
    morningCheckinEnabled:   boolean;
    voiceLogEnabled:         boolean;
    photoAiEnabled:          boolean;
    sleepPhasesEnabled:      boolean;
  };

  // Acciones
  setPremium:       (isPremium: boolean, plan?: SubscriptionPlan | null, expiresAt?: Date | null) => void;
  setIsPremium:     (isPremium: boolean) => void;  // Alias for setPremium for single boolean
  setStatus:        (status: SubscriptionStatus) => void;
  setTrialInfo:     (used: boolean, endsAt: Date | null) => void;
  setFlags:         (flags: Partial<PremiumState['flags']>) => void;
  setChecking:      (checking: boolean) => void;
  reset:            () => void;

  // Computed
  isTrialActive:    () => boolean;
  canUsePremiumFeature: (feature: PremiumFeature) => boolean;
}

export type PremiumFeature =
  | 'ai_context_unlimited'
  | 'photo_log'
  | 'voice_log'
  | 'sleep_phases'
  | 'weight_projection'
  | 'weight_correlations'
  | 'unlimited_history'
  | 'fasting_advanced'
  | 'gps_cardio'
  | 'barcode_unlimited'
  | 'no_ads'
  | 'context_briefs'
  | 'cycle_phases'
  | 'progress_photos_unlimited'
  | 'export_csv';

const defaultFlags = {
  femaleHealthEnabled:     true,
  proactiveContextEnabled: false,
  rewardedAdStreakRescue:  true,
  morningCheckinEnabled:   true,
  voiceLogEnabled:         true,
  photoAiEnabled:          true,
  sleepPhasesEnabled:      true,
};

export const usePremiumStore = create<PremiumState>((set, get) => ({
  isPremium:        false,
  plan:             null,
  status:           null,
  expiresAt:        null,
  trialEndsAt:      null,
  trialUsed:        false,
  isCheckingStatus: false,
  flags:            defaultFlags,

  setPremium: (isPremium, plan = null, expiresAt = null) =>
    set({ isPremium, plan, expiresAt }),

  setIsPremium: (isPremium) =>
    set({ isPremium }),

  setStatus: (status) => set({ status }),

  setTrialInfo: (trialUsed, trialEndsAt) => set({ trialUsed, trialEndsAt }),

  setFlags: (flags) =>
    set((state) => ({ flags: { ...state.flags, ...flags } })),

  setChecking: (isCheckingStatus) => set({ isCheckingStatus }),

  reset: () =>
    set({
      isPremium:        false,
      plan:             null,
      status:           null,
      expiresAt:        null,
      trialEndsAt:      null,
      trialUsed:        false,
      isCheckingStatus: false,
      flags:            defaultFlags,
    }),

  isTrialActive: () => {
    const { trialEndsAt, status } = get();
    if (status !== 'trial') return false;
    if (!trialEndsAt) return false;
    return trialEndsAt > new Date();
  },

  canUsePremiumFeature: (feature) => {
    const { isPremium } = get();
    if (isPremium) return true;

    // Features disponibles sin Premium (límites aplican)
    const freeFeatures: PremiumFeature[] = [];
    return freeFeatures.includes(feature);
  },
}));
