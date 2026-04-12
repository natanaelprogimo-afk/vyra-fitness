import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FastingSettings {
  defaultStartTime: string | null; // HH:MM
  notifyStart: boolean;
  notifyPhase: boolean;
  notifyComplete: boolean;
  showPhaseLabels: boolean;
  showPredictions: boolean;
}

const STORAGE_KEY = 'vyra_fasting_settings_v1';

const DEFAULT_SETTINGS: FastingSettings = {
  defaultStartTime: null,
  notifyStart: true,
  notifyPhase: true,
  notifyComplete: true,
  showPhaseLabels: true,
  showPredictions: true,
};

export function parseTimeInput(value: string): { hour: number; minute: number } | null {
  const parts = value.trim().split(':');
  if (parts.length !== 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  return { hour: Math.floor(hour), minute: Math.floor(minute) };
}

export async function loadFastingSettings(): Promise<FastingSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<FastingSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveFastingSettings(
  next: Partial<FastingSettings>,
): Promise<FastingSettings> {
  const current = await loadFastingSettings();
  const payload: FastingSettings = {
    ...current,
    ...next,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}
