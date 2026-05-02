import AsyncStorage from '@react-native-async-storage/async-storage';

export type AdConsent = 'personalized' | 'non_personalized' | 'unknown';

const CONSENT_KEY = '@vyra.ads.consent';

export async function getAdConsent(): Promise<AdConsent> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    if (!raw) return 'unknown';
    if (raw === 'personalized' || raw === 'non_personalized') return raw;
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function setAdConsent(value: AdConsent): Promise<void> {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, value);
  } catch {
    // best-effort
  }
}

export async function clearAdConsent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
}

export default { getAdConsent, setAdConsent, clearAdConsent };
