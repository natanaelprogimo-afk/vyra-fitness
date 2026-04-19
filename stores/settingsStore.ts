import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

function detectLocale(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale && typeof locale === 'string') return locale;
  } catch {
    // ignore
  }
  return 'es';
}

function isImperialLocale(locale: string): boolean {
  const upper = locale.toUpperCase();
  return upper.includes('US') || upper.includes('LR') || upper.includes('MM');
}

const LOCALE = detectLocale();
const USE_IMPERIAL = isImperialLocale(LOCALE);

type NotifKey =
  | 'notifWater'
  | 'notifSteps'
  | 'notifStepsMovement'
  | 'notifStepsNearGoal'
  | 'notifFasting'
  | 'notifStreak'
  | 'notifCoach'
  | 'notifSummary';

interface SettingsState {
  colorScheme: 'dark' | 'light' | 'system';
  language: 'system' | 'es' | 'en';
  focusMode: boolean;
  highContrast: boolean;

  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'ft';
  distUnit: 'km' | 'mi';
  volumeUnit: 'ml' | 'oz';

  waterReminderMode: 'smart' | 'fixed';
  waterGlassMl: number;
  waterLargeGlassMl: number;
  waterBottleMl: number;
  waterAutoHeatAdjustment: boolean;
  waterAutoExerciseAdjustment: boolean;
  waterReminderHeat: boolean;
  waterReminderExercise: boolean;

  notificationsEnabled: boolean;
  notifWater: boolean;
  notifSteps: boolean;
  notifStepsMovement: boolean;
  notifStepsNearGoal: boolean;
  notifFasting: boolean;
  notifStreak: boolean;
  notifCoach: boolean;
  notifSummary: boolean;
  maxNotifsPerDay: number;

  hapticsEnabled: boolean;
  progressPhotoBackupEnabled: boolean;
  femaleDisclaimerAccepted: boolean;
  femalePeriodDuration: number;
  supplementsDisclaimerAccepted: boolean;
  supplementCycleStarts: Record<string, string>;
  moduleIntroSeen: Record<string, boolean>;

  setColorScheme: (scheme: 'dark' | 'light' | 'system') => void;
  setLanguage: (language: 'system' | 'es' | 'en') => void;
  setFocusMode: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;

  setWeightUnit: (unit: 'kg' | 'lb') => void;
  setHeightUnit: (unit: 'cm' | 'ft') => void;
  setDistUnit: (unit: 'km' | 'mi') => void;
  setVolumeUnit: (unit: 'ml' | 'oz') => void;

  setWaterReminderMode: (mode: 'smart' | 'fixed') => void;
  setWaterGlassMl: (value: number) => void;
  setWaterLargeGlassMl: (value: number) => void;
  setWaterBottleMl: (value: number) => void;
  setWaterAutoHeatAdjustment: (enabled: boolean) => void;
  setWaterAutoExerciseAdjustment: (enabled: boolean) => void;
  setWaterReminderHeat: (enabled: boolean) => void;
  setWaterReminderExercise: (enabled: boolean) => void;

  setNotificationsEnabled: (enabled: boolean) => void;
  setMaxNotifsPerDay: (value: number) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  toggleNotif: (key: NotifKey) => void;

  setProgressPhotoBackupEnabled: (enabled: boolean) => void;
  setFemaleDisclaimerAccepted: (accepted: boolean) => void;
  setFemalePeriodDuration: (days: number) => void;
  setSupplementsDisclaimerAccepted: (accepted: boolean) => void;
  setSupplementCycleStart: (supplementId: string, isoDate: string) => void;
  clearSupplementCycleStart: (supplementId: string) => void;
  markModuleIntroSeen: (moduleKey: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      colorScheme: 'dark',
      language: 'system',
      focusMode: false,
      highContrast: false,

      weightUnit: USE_IMPERIAL ? 'lb' : 'kg',
      heightUnit: USE_IMPERIAL ? 'ft' : 'cm',
      distUnit: USE_IMPERIAL ? 'mi' : 'km',
      volumeUnit: USE_IMPERIAL ? 'oz' : 'ml',

      waterReminderMode: 'smart',
      waterGlassMl: 250,
      waterLargeGlassMl: 350,
      waterBottleMl: 500,
      waterAutoHeatAdjustment: true,
      waterAutoExerciseAdjustment: true,
      waterReminderHeat: true,
      waterReminderExercise: true,

      notificationsEnabled: true,
      notifWater: true,
      notifSteps: true,
      notifStepsMovement: true,
      notifStepsNearGoal: true,
      notifFasting: true,
      notifStreak: true,
      notifCoach: true,
      notifSummary: true,
      maxNotifsPerDay: 2,

      hapticsEnabled: true,
      progressPhotoBackupEnabled: false,
      femaleDisclaimerAccepted: false,
      femalePeriodDuration: 5,
      supplementsDisclaimerAccepted: false,
      supplementCycleStarts: {},
      moduleIntroSeen: {},

      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLanguage: (language) => set({ language }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setHighContrast: (highContrast) => set({ highContrast }),

      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setHeightUnit: (heightUnit) => set({ heightUnit }),
      setDistUnit: (distUnit) => set({ distUnit }),
      setVolumeUnit: (volumeUnit) => set({ volumeUnit }),

      setWaterReminderMode: (waterReminderMode) => set({ waterReminderMode }),
      setWaterGlassMl: (waterGlassMl) =>
        set({ waterGlassMl: Math.max(100, Math.min(1000, Math.round(waterGlassMl))) }),
      setWaterLargeGlassMl: (waterLargeGlassMl) =>
        set({ waterLargeGlassMl: Math.max(150, Math.min(1500, Math.round(waterLargeGlassMl))) }),
      setWaterBottleMl: (waterBottleMl) =>
        set({ waterBottleMl: Math.max(200, Math.min(2000, Math.round(waterBottleMl))) }),
      setWaterAutoHeatAdjustment: (waterAutoHeatAdjustment) => set({ waterAutoHeatAdjustment }),
      setWaterAutoExerciseAdjustment: (waterAutoExerciseAdjustment) =>
        set({ waterAutoExerciseAdjustment }),
      setWaterReminderHeat: (waterReminderHeat) => set({ waterReminderHeat }),
      setWaterReminderExercise: (waterReminderExercise) => set({ waterReminderExercise }),

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setMaxNotifsPerDay: (maxNotifsPerDay) =>
        set({ maxNotifsPerDay: Math.max(1, Math.min(3, Math.round(maxNotifsPerDay))) }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      toggleNotif: (key) => set((state) => ({ [key]: !state[key] })),

      setProgressPhotoBackupEnabled: (progressPhotoBackupEnabled) =>
        set({ progressPhotoBackupEnabled }),
      setFemaleDisclaimerAccepted: (femaleDisclaimerAccepted) =>
        set({ femaleDisclaimerAccepted }),
      setFemalePeriodDuration: (femalePeriodDuration) =>
        set({ femalePeriodDuration: Math.max(3, Math.min(8, Math.round(femalePeriodDuration))) }),
      setSupplementsDisclaimerAccepted: (supplementsDisclaimerAccepted) =>
        set({ supplementsDisclaimerAccepted }),
      setSupplementCycleStart: (supplementId, isoDate) =>
        set((state) => ({
          supplementCycleStarts: {
            ...state.supplementCycleStarts,
            [supplementId]: isoDate,
          },
        })),
      clearSupplementCycleStart: (supplementId) =>
        set((state) => {
          const next = { ...state.supplementCycleStarts };
          delete next[supplementId];
          return { supplementCycleStarts: next };
        }),
      markModuleIntroSeen: (moduleKey) =>
        set((state) => ({
          moduleIntroSeen: {
            ...state.moduleIntroSeen,
            [moduleKey]: true,
          },
        })),
    }),
    {
      name: 'vyra-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        language: state.language,
        focusMode: state.focusMode,
        highContrast: state.highContrast,
        weightUnit: state.weightUnit,
        heightUnit: state.heightUnit,
        distUnit: state.distUnit,
        volumeUnit: state.volumeUnit,
        waterReminderMode: state.waterReminderMode,
        waterGlassMl: state.waterGlassMl,
        waterLargeGlassMl: state.waterLargeGlassMl,
        waterBottleMl: state.waterBottleMl,
        waterAutoHeatAdjustment: state.waterAutoHeatAdjustment,
        waterAutoExerciseAdjustment: state.waterAutoExerciseAdjustment,
        waterReminderHeat: state.waterReminderHeat,
        waterReminderExercise: state.waterReminderExercise,
        notificationsEnabled: state.notificationsEnabled,
        notifWater: state.notifWater,
        notifSteps: state.notifSteps,
        notifStepsMovement: state.notifStepsMovement,
        notifStepsNearGoal: state.notifStepsNearGoal,
        notifFasting: state.notifFasting,
        notifStreak: state.notifStreak,
        notifCoach: state.notifCoach,
        notifSummary: state.notifSummary,
        maxNotifsPerDay: state.maxNotifsPerDay,
        hapticsEnabled: state.hapticsEnabled,
        progressPhotoBackupEnabled: state.progressPhotoBackupEnabled,
        femaleDisclaimerAccepted: state.femaleDisclaimerAccepted,
        femalePeriodDuration: state.femalePeriodDuration,
        supplementsDisclaimerAccepted: state.supplementsDisclaimerAccepted,
        supplementCycleStarts: state.supplementCycleStarts,
        moduleIntroSeen: state.moduleIntroSeen,
      }),
    },
  ),
);
