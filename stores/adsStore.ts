import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AdsContext = 'quick_log_coins' | 'post_workout_2x_xp' | 'streak_rescue' | 'store_discount';
type ContextViews = Record<AdsContext, number>;

function toIsoDay(date = new Date()): string {
  return date.toISOString().split('T')[0] ?? '';
}

function emptyContextViews(): ContextViews {
  return {
    quick_log_coins: 0,
    post_workout_2x_xp: 0,
    streak_rescue: 0,
    store_discount: 0,
  };
}

interface AdsState {
  rewardedLoaded: boolean;
  interstitialLoaded: boolean;
  bannerVisible: boolean;
  isInitialized: boolean;
  isPremium: boolean;
  adsDate: string;
  adsShownToday: number;
  contextViews: ContextViews;
  lastInterstitialAt: number;
  lastAchievementAt: number;
  setRewardedLoaded: (loaded: boolean) => void;
  setInterstitialLoaded: (loaded: boolean) => void;
  setBannerVisible: (visible: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setIsPremium: (premium: boolean) => void;
  syncDay: (date?: string) => void;
  markRewardedShown: (context: AdsContext, at?: number) => void;
  markInterstitialShown: (at?: number) => void;
  markAchievementSeen: (at?: number) => void;
}

export const useAdsStore = create<AdsState>()(
  persist(
    (set, get) => ({
      rewardedLoaded: false,
      interstitialLoaded: false,
      bannerVisible: false,
      isInitialized: false,
      isPremium: false,
      adsDate: toIsoDay(),
      adsShownToday: 0,
      contextViews: emptyContextViews(),
      lastInterstitialAt: 0,
      lastAchievementAt: 0,

      setRewardedLoaded: (rewardedLoaded) => set({ rewardedLoaded }),
      setInterstitialLoaded: (interstitialLoaded) => set({ interstitialLoaded }),
      setBannerVisible: (bannerVisible) => set({ bannerVisible }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      setIsPremium: (isPremium) => set({ isPremium }),

      syncDay: (date = toIsoDay()) => {
        if (get().adsDate === date) return;
        set({
          adsDate: date,
          adsShownToday: 0,
          contextViews: emptyContextViews(),
        });
      },

      markRewardedShown: (context, at = Date.now()) =>
        set((state) => {
          const currentDate = toIsoDay(new Date(at));
          const baseState = state.adsDate === currentDate
            ? state
            : {
                ...state,
                adsDate: currentDate,
                adsShownToday: 0,
                contextViews: emptyContextViews(),
              };

          return {
            adsDate: baseState.adsDate,
            adsShownToday: baseState.adsShownToday + 1,
            contextViews: {
              ...baseState.contextViews,
              [context]: (baseState.contextViews[context] ?? 0) + 1,
            },
          };
        }),

      markInterstitialShown: (at = Date.now()) =>
        set((state) => {
          const currentDate = toIsoDay(new Date(at));
          const baseState = state.adsDate === currentDate
            ? state
            : {
                ...state,
                adsDate: currentDate,
                adsShownToday: 0,
                contextViews: emptyContextViews(),
              };

          return {
            adsDate: baseState.adsDate,
            adsShownToday: baseState.adsShownToday + 1,
            contextViews: baseState.contextViews,
            lastInterstitialAt: at,
          };
        }),

      markAchievementSeen: (at = Date.now()) => set({ lastAchievementAt: at }),
    }),
    {
      name: 'vyra-ads-state',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        adsDate: state.adsDate,
        adsShownToday: state.adsShownToday,
        contextViews: state.contextViews,
        lastInterstitialAt: state.lastInterstitialAt,
        lastAchievementAt: state.lastAchievementAt,
      }),
    },
  ),
);
