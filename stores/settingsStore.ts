// ============================================================
// VYRA FITNESS — Settings Store (Zustand)
// Configuración de la app (no persiste en Supabase — solo local)
// ============================================================

import { create } from 'zustand';

interface SettingsState {
  // Apariencia
  colorScheme: 'dark' | 'light' | 'system';

  // Unidades
  weightUnit:  'kg' | 'lb';
  heightUnit:  'cm' | 'ft';
  distUnit:    'km' | 'mi';
  volumeUnit:  'ml' | 'oz';

  // Notificaciones locales
  notificationsEnabled: boolean;
  notifWater:         boolean;
  notifSteps:         boolean;
  notifFasting:       boolean;
  notifStreak:        boolean;
  notifCoach:         boolean;
  notifSummary:       boolean;
  maxNotifsPerDay:    number;

  // Háptica
  hapticsEnabled:     boolean;

  // Acciones
  setColorScheme: (scheme: 'dark' | 'light' | 'system') => void;
  setWeightUnit:  (unit: 'kg' | 'lb') => void;
  setHeightUnit:  (unit: 'cm' | 'ft') => void;
  setDistUnit:    (unit: 'km' | 'mi') => void;
  setVolumeUnit:  (unit: 'ml' | 'oz') => void;
  setNotificationsEnabled:(enabled: boolean) => void;
  setHapticsEnabled:(enabled: boolean) => void;
  toggleNotif:    (key: NotifKey) => void;
}

type NotifKey = 'notifWater' | 'notifSteps' | 'notifFasting' | 'notifStreak' | 'notifCoach' | 'notifSummary';

export const useSettingsStore = create<SettingsState>((set) => ({
  // Defaults
  colorScheme:     'dark',
  weightUnit:      'kg',
  heightUnit:      'cm',
  distUnit:        'km',
  volumeUnit:      'ml',
  notificationsEnabled: true,
  notifWater:      true,
  notifSteps:      true,
  notifFasting:    true,
  notifStreak:     true,
  notifCoach:      true,
  notifSummary:    true,
  maxNotifsPerDay: 5,
  hapticsEnabled:  true,

  setColorScheme: (colorScheme) => set({ colorScheme }),
  setWeightUnit:  (weightUnit) => set({ weightUnit }),
  setHeightUnit:  (heightUnit) => set({ heightUnit }),
  setDistUnit:    (distUnit) => set({ distUnit }),
  setVolumeUnit:  (volumeUnit) => set({ volumeUnit }),
  setNotificationsEnabled:(notificationsEnabled) => set({ notificationsEnabled }),
  setHapticsEnabled:(hapticsEnabled) => set({ hapticsEnabled }),
  toggleNotif: (key) => set((state) => ({ [key]: !state[key] })),
}));