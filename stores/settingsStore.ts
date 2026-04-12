// ============================================================

// VYRA FITNESS — Settings Store (Zustand)

// Configuración de la app (no persiste en Supabase — solo local)

// ============================================================



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



interface SettingsState {

  // Apariencia

  colorScheme: 'dark' | 'light' | 'system';

  language: 'system' | 'es' | 'en';

  focusMode: boolean;

  highContrast: boolean;



  // Unidades

  weightUnit:  'kg' | 'lb';

  heightUnit:  'cm' | 'ft';

  distUnit:    'km' | 'mi';

  volumeUnit:  'ml' | 'oz';

  waterReminderMode: 'smart' | 'fixed';
  waterAutoHeatAdjustment: boolean;
  waterAutoExerciseAdjustment: boolean;
  waterReminderHeat: boolean;
  waterReminderExercise: boolean;



  // Notificaciones locales

  notificationsEnabled: boolean;

  notifWater:         boolean;

  notifSteps:         boolean;

  notifStepsMovement: boolean;

  notifStepsNearGoal: boolean;

  notifFasting:       boolean;

  notifStreak:        boolean;

  notifCoach:         boolean;

  notifSummary:       boolean;

  maxNotifsPerDay:    number;



  // Háptica

  hapticsEnabled:     boolean;

  progressPhotoBackupEnabled: boolean;
  femaleDisclaimerAccepted: boolean;
  femalePeriodDuration: number;


  // Acciones

  setColorScheme: (scheme: 'dark' | 'light' | 'system') => void;

  setLanguage: (language: 'system' | 'es' | 'en') => void;

  setFocusMode: (enabled: boolean) => void;

  setHighContrast: (enabled: boolean) => void;

  setWeightUnit:  (unit: 'kg' | 'lb') => void;

  setHeightUnit:  (unit: 'cm' | 'ft') => void;

  setDistUnit:    (unit: 'km' | 'mi') => void;

  setVolumeUnit:  (unit: 'ml' | 'oz') => void;

  setWaterReminderMode: (mode: 'smart' | 'fixed') => void;
  setWaterAutoHeatAdjustment: (enabled: boolean) => void;
  setWaterAutoExerciseAdjustment: (enabled: boolean) => void;
  setWaterReminderHeat: (enabled: boolean) => void;
  setWaterReminderExercise: (enabled: boolean) => void;

  setNotificationsEnabled:(enabled: boolean) => void;

  setMaxNotifsPerDay:(value: number) => void;

  setHapticsEnabled:(enabled: boolean) => void;

  toggleNotif:    (key: NotifKey) => void;

  setProgressPhotoBackupEnabled: (enabled: boolean) => void;
  setFemaleDisclaimerAccepted: (accepted: boolean) => void;
  setFemalePeriodDuration: (days: number) => void;
}


type NotifKey = 'notifWater' | 'notifSteps' | 'notifStepsMovement' | 'notifStepsNearGoal' | 'notifFasting' | 'notifStreak' | 'notifCoach' | 'notifSummary';



export const useSettingsStore = create<SettingsState>()(

  persist(

    (set) => ({

      // Defaults

      colorScheme:     'dark',

      language:        'system',

      focusMode:       false,

      highContrast:    false,

      weightUnit:      USE_IMPERIAL ? 'lb' : 'kg',

      heightUnit:      USE_IMPERIAL ? 'ft' : 'cm',

      distUnit:        USE_IMPERIAL ? 'mi' : 'km',

      volumeUnit:      USE_IMPERIAL ? 'oz' : 'ml',
      waterReminderMode: 'smart',
      waterAutoHeatAdjustment: true,
      waterAutoExerciseAdjustment: true,
      waterReminderHeat: true,
      waterReminderExercise: true,

      notificationsEnabled: true,

      notifWater:      true,

      notifSteps:      true,

      notifStepsMovement: true,

      notifStepsNearGoal: true,

      notifFasting:    true,

      notifStreak:     true,

      notifCoach:      true,

      notifSummary:    true,

      maxNotifsPerDay: 2,

      hapticsEnabled:  true,
      progressPhotoBackupEnabled: false,
      femaleDisclaimerAccepted: false,
      femalePeriodDuration: 5,


      setColorScheme: (colorScheme) => set({ colorScheme }),

      setLanguage: (language) => set({ language }),

      setFocusMode: (focusMode) => set({ focusMode }),

      setHighContrast: (highContrast) => set({ highContrast }),

      setWeightUnit:  (weightUnit) => set({ weightUnit }),

      setHeightUnit:  (heightUnit) => set({ heightUnit }),

      setDistUnit:    (distUnit) => set({ distUnit }),

      setVolumeUnit:  (volumeUnit) => set({ volumeUnit }),
      setWaterReminderMode: (waterReminderMode) => set({ waterReminderMode }),
      setWaterAutoHeatAdjustment: (waterAutoHeatAdjustment) => set({ waterAutoHeatAdjustment }),
      setWaterAutoExerciseAdjustment: (waterAutoExerciseAdjustment) => set({ waterAutoExerciseAdjustment }),
      setWaterReminderHeat: (waterReminderHeat) => set({ waterReminderHeat }),
      setWaterReminderExercise: (waterReminderExercise) => set({ waterReminderExercise }),

      setNotificationsEnabled:(notificationsEnabled) => set({ notificationsEnabled }),

      setMaxNotifsPerDay:(maxNotifsPerDay) => set({ maxNotifsPerDay: Math.max(1, Math.min(3, Math.round(maxNotifsPerDay))) }),

      setHapticsEnabled:(hapticsEnabled) => set({ hapticsEnabled }),

      toggleNotif: (key) => set((state) => ({ [key]: !state[key] })),
      setProgressPhotoBackupEnabled: (progressPhotoBackupEnabled) => set({ progressPhotoBackupEnabled }),
      setFemaleDisclaimerAccepted: (femaleDisclaimerAccepted) => set({ femaleDisclaimerAccepted }),
      setFemalePeriodDuration: (femalePeriodDuration) =>
        set({ femalePeriodDuration: Math.max(3, Math.min(8, Math.round(femalePeriodDuration))) }),
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
      }),
    },

  ),

);

