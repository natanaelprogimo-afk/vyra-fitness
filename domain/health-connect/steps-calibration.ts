import AsyncStorage from '@react-native-async-storage/async-storage';

const STRIDE_LENGTH_KEY = '@vyra_steps_stride_cm_v1';

export type StrideLengthResult = {
  strideCm: number;
  isCustom: boolean;
};

export function estimateStrideLengthCm(heightCm: number): number {
  const safeHeight = Number.isFinite(heightCm) && heightCm > 0 ? heightCm : 170;
  return Math.max(40, safeHeight * 0.414);
}

export async function getStrideLengthCm(heightCm: number): Promise<StrideLengthResult> {
  try {
    const raw = await AsyncStorage.getItem(STRIDE_LENGTH_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed > 30) {
      return { strideCm: parsed, isCustom: true };
    }
  } catch {
    // fallback to estimation
  }

  return { strideCm: estimateStrideLengthCm(heightCm), isCustom: false };
}

export async function setStrideLengthCm(
  value: number | null,
  heightCm: number,
): Promise<StrideLengthResult> {
  const numeric = value !== null && Number.isFinite(value) ? Number(value) : NaN;
  if (!Number.isFinite(numeric) || numeric <= 30) {
    try {
      await AsyncStorage.removeItem(STRIDE_LENGTH_KEY);
    } catch {
      // ignore
    }
    return { strideCm: estimateStrideLengthCm(heightCm), isCustom: false };
  }

  const safe = Math.min(Math.max(numeric, 35), 120);
  try {
    await AsyncStorage.setItem(STRIDE_LENGTH_KEY, safe.toString());
  } catch {
    // ignore
  }
  return { strideCm: safe, isCustom: true };
}
