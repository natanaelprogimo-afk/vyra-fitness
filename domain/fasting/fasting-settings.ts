import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FastingSettings {
  defaultStartTime: string | null; // HH:MM
  notifyStart: boolean;
  notifyPhase: boolean;
  notifyComplete: boolean;
  showPhaseLabels: boolean;
  showPredictions: boolean;
  // Optional: current active protocol id (e.g. '16:8'). Persisted locally for preview.
  activeProtocol?: string | null;
  // 5:2 scheduling: array of weekday numbers (0=Sunday..6=Saturday)
  fiveTwoDays: number[];
  // HH:MM start time for 5:2 days
  fiveTwoStartTime: string | null;
  // Whether to auto-start on scheduled 5:2 days
  fiveTwoAutoStart: boolean;
}

const STORAGE_KEY = 'vyra_fasting_settings_v1';
const MUTED_SESSION_STORAGE_KEY = 'vyra_fasting_muted_session_v1';

const DEFAULT_SETTINGS: FastingSettings = {
  defaultStartTime: null,
  notifyStart: true,
  notifyPhase: true,
  notifyComplete: true,
  showPhaseLabels: true,
  showPredictions: true,
  activeProtocol: undefined,
  fiveTwoDays: [],
  fiveTwoStartTime: null,
  fiveTwoAutoStart: false,
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
  } catch (e) {
    // Log load errors to help troubleshooting in the wild
    // eslint-disable-next-line no-console
    console.warn('[fasting-settings] failed to load settings, using defaults', e);
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

export async function loadMutedFastingSessionId(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(MUTED_SESSION_STORAGE_KEY);
    return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
  } catch (e) {
    console.warn('[fasting-settings] failed to load muted session id', e);
    return null;
  }
}

export async function saveMutedFastingSessionId(sessionId: string | null): Promise<void> {
  try {
    if (!sessionId) {
      await AsyncStorage.removeItem(MUTED_SESSION_STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(MUTED_SESSION_STORAGE_KEY, sessionId);
  } catch (e) {
    console.warn('[fasting-settings] failed to save muted session id', e);
  }
}
