import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FeatureUnlockState {
  advancedAnalysisUntil: string | null;
  unlockAdvancedAnalysis: (hours?: number) => void;
  clearExpired: () => void;
  hasAdvancedAnalysis: () => boolean;
}

export const useFeatureUnlockStore = create<FeatureUnlockState>()(
  persist(
    (set, get) => ({
      advancedAnalysisUntil: null,

      unlockAdvancedAnalysis: (hours = 24) => {
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        set({ advancedAnalysisUntil: expiresAt });
      },

      clearExpired: () => {
        const expiresAt = get().advancedAnalysisUntil;
        if (!expiresAt) return;
        if (new Date(expiresAt).getTime() <= Date.now()) {
          set({ advancedAnalysisUntil: null });
        }
      },

      hasAdvancedAnalysis: () => {
        const expiresAt = get().advancedAnalysisUntil;
        if (!expiresAt) return false;
        return new Date(expiresAt).getTime() > Date.now();
      },
    }),
    {
      name: 'vyra-feature-unlocks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        advancedAnalysisUntil: state.advancedAnalysisUntil,
      }),
    },
  ),
);

export default useFeatureUnlockStore;
