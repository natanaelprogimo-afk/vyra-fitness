// ============================================================
// VYRA FITNESS — Ads Store (Zustand)
// Estado de Unity Ads: frecuencia, disponibilidad, cooldowns
// ============================================================

import { create } from 'zustand';

interface AdsState {
  // Disponibilidad de ad units
  rewardedLoaded:      boolean;
  interstitialLoaded:  boolean;
  bannerVisible:       boolean;

  // Control de frecuencia diaria
  rewardedCountToday:  number;           // máx 5/día
  interstitialLastAt:  Date | null;      // máx 1/hora

  // Estado general
  isInitialized:       boolean;
  isPremium:           boolean;          // copia del premiumStore para no importarlo

  // Acciones
  setRewardedLoaded:     (loaded: boolean) => void;
  setInterstitialLoaded: (loaded: boolean) => void;
  setBannerVisible:      (visible: boolean) => void;
  incrementRewardedCount:() => void;
  setInterstitialLastAt: (date: Date) => void;
  setInitialized:        (init: boolean) => void;
  setIsPremium:          (premium: boolean) => void;
  resetDailyCounts:      () => void;

  // Computed
  canShowRewarded:     () => boolean;
  canShowInterstitial: () => boolean;
  canShowAds:          () => boolean;     // false si isPremium
}

export const useAdsStore = create<AdsState>((set, get) => ({
  rewardedLoaded:      false,
  interstitialLoaded:  false,
  bannerVisible:       false,
  rewardedCountToday:  0,
  interstitialLastAt:  null,
  isInitialized:       false,
  isPremium:           false,

  setRewardedLoaded:     (rewardedLoaded) => set({ rewardedLoaded }),
  setInterstitialLoaded: (interstitialLoaded) => set({ interstitialLoaded }),
  setBannerVisible:      (bannerVisible) => set({ bannerVisible }),

  incrementRewardedCount: () =>
    set((state) => ({ rewardedCountToday: state.rewardedCountToday + 1 })),

  setInterstitialLastAt: (interstitialLastAt) => set({ interstitialLastAt }),
  setInitialized:        (isInitialized) => set({ isInitialized }),
  setIsPremium:          (isPremium) => set({ isPremium }),
  resetDailyCounts:      () => set({ rewardedCountToday: 0 }),

  canShowRewarded: () => {
    const { isPremium, rewardedLoaded, rewardedCountToday } = get();
    if (isPremium) return false;
    if (!rewardedLoaded) return false;
    return rewardedCountToday < 5;
  },

  canShowInterstitial: () => {
    const { isPremium, interstitialLoaded, interstitialLastAt } = get();
    if (isPremium) return false;
    if (!interstitialLoaded) return false;
    if (!interstitialLastAt) return true;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return interstitialLastAt < oneHourAgo;
  },

  canShowAds: () => !get().isPremium,
}));