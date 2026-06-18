import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SupportedLanguage } from '@/lib/language';
import type { TextScalePreference } from '@/lib/text-scale';

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
  // Hydration flag
  isHydrated: boolean;

  colorScheme: 'dark' | 'light' | 'system' | 'midnight' | 'pastel' | 'forest' | 'ocean' | 'sunset';
  language: 'system' | SupportedLanguage;
  focusMode: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
  textScale: TextScalePreference;
  hideVyraBalance: boolean;
  biometricUnlockEnabled: boolean;

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
  sleepSmartAlarmEnabled: boolean;
  sleepSmartAlarmWindowStart: number;
  sleepSmartAlarmWindowEnd: number;
  femalePredictionAlertsEnabled: boolean;

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
  notificationQuietHoursEnabled: boolean;
  notificationQuietHoursStart: number;
  notificationQuietHoursEnd: number;

  hapticsEnabled: boolean;
  progressPhotoBackupEnabled: boolean;
  femaleDisclaimerAccepted: boolean;
  femalePeriodDuration: number;
  supplementsDisclaimerAccepted: boolean;
  supplementCycleStarts: Record<string, string>;

  // Readiness score custom weights (default: 0.2, 0.2, 0.25, 0.15, 0.2)
  hydrationWeight: number;
  activityWeight: number;
  sleepWeight: number;
  nutritionWeight: number;
  mentalWeight: number;
  readinessGoal: 'gain_muscle' | 'lose_fat' | 'athletic_performance' | 'general_health';

  // Hydration flag
  setIsHydrated: (hydrated: boolean) => void;

  setColorScheme: (scheme: 'dark' | 'light' | 'system' | 'midnight' | 'pastel' | 'forest' | 'ocean' | 'sunset') => void;
  setLanguage: (language: 'system' | SupportedLanguage) => void;
  setFocusMode: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setTextScale: (value: TextScalePreference) => void;
  setHideVyraBalance: (enabled: boolean) => void;
  setBiometricUnlockEnabled: (enabled: boolean) => void;

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
  setSleepSmartAlarmEnabled: (enabled: boolean) => void;
  setSleepSmartAlarmWindowStart: (minutes: number) => void;
  setSleepSmartAlarmWindowEnd: (minutes: number) => void;
  setFemalePredictionAlertsEnabled: (enabled: boolean) => void;

  setNotificationsEnabled: (enabled: boolean) => void;
  setMaxNotifsPerDay: (value: number) => void;
  setNotificationQuietHoursEnabled: (enabled: boolean) => void;
  setNotificationQuietHoursStart: (hour: number) => void;
  setNotificationQuietHoursEnd: (hour: number) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  toggleNotif: (key: NotifKey) => void;

  setProgressPhotoBackupEnabled: (enabled: boolean) => void;
  setFemaleDisclaimerAccepted: (accepted: boolean) => void;
  setFemalePeriodDuration: (days: number) => void;
  setSupplementsDisclaimerAccepted: (accepted: boolean) => void;
  setSupplementCycleStart: (supplementId: string, isoDate: string) => void;
  clearSupplementCycleStart: (supplementId: string) => void;

  // Readiness custom weights
  setHydrationWeight: (value: number) => void;
  setActivityWeight: (value: number) => void;
  setSleepWeight: (value: number) => void;
  setNutritionWeight: (value: number) => void;
  setMentalWeight: (value: number) => void;
  setReadinessGoal: (goal: 'gain_muscle' | 'lose_fat' | 'athletic_performance' | 'general_health') => void;
  // Auto-adjust weights based on goal
  applyReadinessGoal: (goal: 'gain_muscle' | 'lose_fat' | 'athletic_performance' | 'general_health') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isHydrated: false,
      colorScheme: 'system',
      language: 'es',
      focusMode: false,
      highContrast: false,
      reduceMotion: false,
      screenReaderMode: false,
      textScale: 'normal',
      hideVyraBalance: false,
      biometricUnlockEnabled: false,

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
      sleepSmartAlarmEnabled: false,
      sleepSmartAlarmWindowStart: 390,
      sleepSmartAlarmWindowEnd: 420,
      femalePredictionAlertsEnabled: true,

      notificationsEnabled: false,
      notifWater: true,
      notifSteps: false,
      notifStepsMovement: false,
      notifStepsNearGoal: false,
      notifFasting: false,
      notifStreak: false,
      notifCoach: false,
      notifSummary: true,
      maxNotifsPerDay: 1,
      notificationQuietHoursEnabled: true,
      notificationQuietHoursStart: 22,
      notificationQuietHoursEnd: 7,

      hapticsEnabled: true,
      progressPhotoBackupEnabled: false,
      femaleDisclaimerAccepted: false,
      femalePeriodDuration: 5,
      supplementsDisclaimerAccepted: false,
      supplementCycleStarts: {},

      // Readiness defaults
      hydrationWeight: 0.2,
      activityWeight: 0.2,
      sleepWeight: 0.25,
      nutritionWeight: 0.15,
      mentalWeight: 0.2,
      readinessGoal: 'general_health',

      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLanguage: (language) => set({ language }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setScreenReaderMode: (screenReaderMode) => set({ screenReaderMode }),
      setTextScale: (textScale) => set({ textScale }),
      setHideVyraBalance: (hideVyraBalance) => set({ hideVyraBalance }),
      setBiometricUnlockEnabled: (biometricUnlockEnabled) => set({ biometricUnlockEnabled }),

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
      setSleepSmartAlarmEnabled: (sleepSmartAlarmEnabled) => set({ sleepSmartAlarmEnabled }),
      setSleepSmartAlarmWindowStart: (sleepSmartAlarmWindowStart) =>
        set({
          sleepSmartAlarmWindowStart: Math.max(0, Math.min(1439, Math.round(sleepSmartAlarmWindowStart))),
        }),
      setSleepSmartAlarmWindowEnd: (sleepSmartAlarmWindowEnd) =>
        set({
          sleepSmartAlarmWindowEnd: Math.max(0, Math.min(1439, Math.round(sleepSmartAlarmWindowEnd))),
        }),
      setFemalePredictionAlertsEnabled: (femalePredictionAlertsEnabled) =>
        set({ femalePredictionAlertsEnabled }),

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setMaxNotifsPerDay: (maxNotifsPerDay) =>
        set({ maxNotifsPerDay: Math.max(1, Math.min(1, Math.round(maxNotifsPerDay))) }),
      setNotificationQuietHoursEnabled: (notificationQuietHoursEnabled) =>
        set({ notificationQuietHoursEnabled }),
      setNotificationQuietHoursStart: (notificationQuietHoursStart) =>
        set({
          notificationQuietHoursStart: Math.max(0, Math.min(23, Math.round(notificationQuietHoursStart))),
        }),
      setNotificationQuietHoursEnd: (notificationQuietHoursEnd) =>
        set({
          notificationQuietHoursEnd: Math.max(0, Math.min(23, Math.round(notificationQuietHoursEnd))),
        }),
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

      // Readiness weight setters
      setHydrationWeight: (hydrationWeight) =>
        set({ hydrationWeight: Math.max(0, Math.min(1, hydrationWeight)) }),
      setActivityWeight: (activityWeight) =>
        set({ activityWeight: Math.max(0, Math.min(1, activityWeight)) }),
      setSleepWeight: (sleepWeight) =>
        set({ sleepWeight: Math.max(0, Math.min(1, sleepWeight)) }),
      setNutritionWeight: (nutritionWeight) =>
        set({ nutritionWeight: Math.max(0, Math.min(1, nutritionWeight)) }),
      setMentalWeight: (mentalWeight) =>
        set({ mentalWeight: Math.max(0, Math.min(1, mentalWeight)) }),
      setReadinessGoal: (readinessGoal) => set({ readinessGoal }),
      applyReadinessGoal: (goal) => {
        const presets: Record<string, { h: number; a: number; s: number; n: number; m: number }> = {
          gain_muscle: { h: 0.15, a: 0.25, s: 0.30, n: 0.20, m: 0.10 },
          lose_fat: { h: 0.20, a: 0.25, s: 0.25, n: 0.20, m: 0.10 },
          athletic_performance: { h: 0.15, a: 0.30, s: 0.25, n: 0.20, m: 0.10 },
          general_health: { h: 0.20, a: 0.20, s: 0.25, n: 0.15, m: 0.20 },
        };
        const preset = presets[goal] || presets.general_health;
        set({
          readinessGoal: goal,
          hydrationWeight: preset.h,
          activityWeight: preset.a,
          sleepWeight: preset.s,
          nutritionWeight: preset.n,
          mentalWeight: preset.m,
        });
      },

      setIsHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: 'vyra-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setIsHydrated(true);
        }
      },
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        language: state.language,
        focusMode: state.focusMode,
        highContrast: state.highContrast,
        reduceMotion: state.reduceMotion,
        screenReaderMode: state.screenReaderMode,
        textScale: state.textScale,
        hideVyraBalance: state.hideVyraBalance,
        biometricUnlockEnabled: state.biometricUnlockEnabled,
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
        sleepSmartAlarmEnabled: state.sleepSmartAlarmEnabled,
        sleepSmartAlarmWindowStart: state.sleepSmartAlarmWindowStart,
        sleepSmartAlarmWindowEnd: state.sleepSmartAlarmWindowEnd,
        femalePredictionAlertsEnabled: state.femalePredictionAlertsEnabled,
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
        notificationQuietHoursEnabled: state.notificationQuietHoursEnabled,
        notificationQuietHoursStart: state.notificationQuietHoursStart,
        notificationQuietHoursEnd: state.notificationQuietHoursEnd,
        hapticsEnabled: state.hapticsEnabled,
        progressPhotoBackupEnabled: state.progressPhotoBackupEnabled,
        femaleDisclaimerAccepted: state.femaleDisclaimerAccepted,
        femalePeriodDuration: state.femalePeriodDuration,
        supplementsDisclaimerAccepted: state.supplementsDisclaimerAccepted,
        supplementCycleStarts: state.supplementCycleStarts,
        hydrationWeight: state.hydrationWeight,
        activityWeight: state.activityWeight,
        sleepWeight: state.sleepWeight,
        nutritionWeight: state.nutritionWeight,
        mentalWeight: state.mentalWeight,
        readinessGoal: state.readinessGoal,
      }),
    },
  ),
);
