import { Platform } from 'react-native';
import UnityAdsNative, { UnityBannerView as NativeUnityBannerView } from 'react-native-unity-ads';

export type UnityResult = 'completed' | 'skipped' | 'failed';
export type UnityBannerSize = 'standard' | 'leaderboard';

function getGameId() {
  return process.env.EXPO_PUBLIC_UNITY_GAME_ID_ANDROID ?? process.env.EXPO_PUBLIC_UNITY_GAME_ID ?? '';
}

function getPlacement(kind: 'rewarded' | 'interstitial') {
  if (kind === 'rewarded') {
    return process.env.EXPO_PUBLIC_UNITY_REWARDED_PLACEMENT ?? 'vyra_rewarded';
  }

  return process.env.EXPO_PUBLIC_UNITY_INTERSTITIAL_PLACEMENT ?? 'vyra_interstitial';
}

export function getUnityBannerPlacement() {
  return process.env.EXPO_PUBLIC_UNITY_BANNER_PLACEMENT ?? '';
}

function isNativeAvailable() {
  return Platform.OS === 'android' && Boolean(UnityAdsNative);
}

function getTestMode() {
  return process.env.EXPO_PUBLIC_UNITY_TEST_MODE === 'true' || __DEV__;
}

export async function initUnityAds(gameId?: string): Promise<boolean> {
  if (!isNativeAvailable()) return false;

  const resolvedGameId = gameId ?? getGameId();
  if (!resolvedGameId) return false;

  try {
    await UnityAdsNative.initialize(resolvedGameId, getTestMode());
    return true;
  } catch {
    return false;
  }
}

export async function isUnityAdsInitialized(): Promise<boolean> {
  if (!isNativeAvailable()) return false;

  try {
    return await UnityAdsNative.isInitialized();
  } catch {
    return false;
  }
}

async function loadPlacement(placementId: string): Promise<boolean> {
  if (!isNativeAvailable() || !placementId) return false;

  try {
    await UnityAdsNative.load(placementId);
    return true;
  } catch {
    return false;
  }
}

export async function preloadRewarded(): Promise<boolean> {
  return loadPlacement(getPlacement('rewarded'));
}

export async function preloadInterstitial(): Promise<boolean> {
  return loadPlacement(getPlacement('interstitial'));
}

async function showPlacement(placementId: string): Promise<UnityResult> {
  if (!isNativeAvailable() || !placementId) return 'failed';

  const loaded = await loadPlacement(placementId);
  if (!loaded) return 'failed';

  try {
    const result = await UnityAdsNative.show(placementId);
    const normalized = String(result).toUpperCase();

    if (normalized === 'COMPLETED') return 'completed';
    if (normalized === 'SKIPPED') return 'skipped';
    return 'failed';
  } catch {
    return 'failed';
  }
}

export async function showRewarded(): Promise<UnityResult> {
  return showPlacement(getPlacement('rewarded'));
}

export async function showInterstitial(): Promise<UnityResult> {
  return showPlacement(getPlacement('interstitial'));
}

export const UnityBannerView = NativeUnityBannerView;
