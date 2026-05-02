import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, PixelRatio, Platform } from 'react-native';
import { getAdConsent } from '../ad-consent';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useFastingStore } from '@/stores/fastingStore';
import {
  type BannerPlacementKey,
  type InterstitialPlacementKey,
  type PlacementKey,
  type RewardedPlacementKey,
  UNITY_ADS_REQUEST_TEST_MODE,
  UNITY_GAME_ID,
  getPlacementDefinition,
  getPlacementId,
  isAdsConfigured,
} from './placements';
import { trackAdEvent } from '@/lib/analytics';

type NativeShowResult = {
  placementId: string;
  state: string;
  completed: boolean;
  clicked: boolean;
};

type NativeDebugState = {
  initializationState?: string;
  sdkInitialized?: boolean;
  testMode?: boolean;
  lastInitializationError?: string | null;
  loadedPlacements?: string[];
  bannerStatus?: string;
  bannerPlacementId?: string | null;
  bannerError?: string | null;
};

type VyraUnityAdsModule = {
  initialize?: (gameId: string, testMode: boolean) => Promise<NativeDebugState>;
  preload?: (adUnitId: string) => Promise<boolean>;
  show?: (adUnitId: string) => Promise<NativeShowResult>;
  isReady?: (adUnitId: string) => Promise<boolean>;
  showBanner?: (adUnitId: string, widthPx: number, heightPx: number) => Promise<NativeDebugState>;
  hideBanner?: () => Promise<boolean>;
  getDebugState?: () => Promise<NativeDebugState>;
  setPersonalizedAdsAllowed?: (allowed: boolean) => Promise<NativeDebugState>;
};

type FrequencyBudget = {
  shownAt: number[];
};

export type ShowPlacementResult =
  | { shown: true; result: NativeShowResult }
  | { shown: false; reason: 'unsupported' | 'not_configured' | 'capped' | 'not_ready' | 'blocked_by_timer' | 'blocked_by_consent' };

const BUDGET_KEY_PREFIX = '@vyra.ads.budget';
const unityAdsModule = (NativeModules.VyraUnityAds ?? null) as VyraUnityAdsModule | null;

let initializationPromise: Promise<NativeDebugState | null> | null = null;

function supportsUnityAds() {
  return Platform.OS === 'android' && unityAdsModule?.initialize && unityAdsModule?.preload && unityAdsModule?.show;
}

function isBlockedByUserState() {
  try {
    const fasting = useFastingStore.getState().isActive;
    const activeSession = Boolean(useWorkoutStore.getState().activeSession);
    if (fasting) return { blocked: true, reason: 'fasting' as const };
    if (activeSession) return { blocked: true, reason: 'workout' as const };
  } catch {
    // If stores are not available, default to not blocking.
  }
  return { blocked: false };
}

async function readBudget(key: PlacementKey): Promise<FrequencyBudget> {
  try {
    const raw = await AsyncStorage.getItem(`${BUDGET_KEY_PREFIX}.${key}`);
    if (!raw) return { shownAt: [] };
    const parsed = JSON.parse(raw) as Partial<FrequencyBudget>;
    return {
      shownAt: Array.isArray(parsed.shownAt)
        ? parsed.shownAt.filter((value): value is number => typeof value === 'number')
        : [],
    };
  } catch {
    return { shownAt: [] };
  }
}

async function writeBudget(key: PlacementKey, budget: FrequencyBudget) {
  try {
    await AsyncStorage.setItem(`${BUDGET_KEY_PREFIX}.${key}`, JSON.stringify(budget));
  } catch {
    // El tracking de caps nunca puede romper el flujo del anuncio.
  }
}

function applyPlacementCap(
  key: PlacementKey,
  budget: FrequencyBudget,
  now = Date.now(),
) {
  const definition = getPlacementDefinition(key);
  const dayWindowMs = 24 * 60 * 60 * 1000;
  const cleanedHistory = budget.shownAt.filter((timestamp) => now - timestamp <= dayWindowMs);
  const lastShownAt = cleanedHistory[cleanedHistory.length - 1] ?? null;

  if (
    typeof definition.minIntervalMs === 'number' &&
    lastShownAt !== null &&
    now - lastShownAt < definition.minIntervalMs
  ) {
    return { allowed: false, nextBudget: { shownAt: cleanedHistory } };
  }

  if (
    typeof definition.dailyCap === 'number' &&
    cleanedHistory.length >= definition.dailyCap
  ) {
    return { allowed: false, nextBudget: { shownAt: cleanedHistory } };
  }

  return {
    allowed: true,
    nextBudget: { shownAt: cleanedHistory },
  };
}

async function canShowPlacement(key: PlacementKey) {
  const budget = await readBudget(key);
  return applyPlacementCap(key, budget);
}

async function markPlacementShown(key: PlacementKey, shownAt = Date.now()) {
  const budget = await readBudget(key);
  const cleanedHistory = budget.shownAt.filter(
    (timestamp) => shownAt - timestamp <= 24 * 60 * 60 * 1000,
  );
  cleanedHistory.push(shownAt);
  await writeBudget(key, { shownAt: cleanedHistory });
}

export async function initializeUnityAds() {
  if (!supportsUnityAds() || !isAdsConfigured()) {
    return null;
  }
  // Respect persisted ad consent before initializing
  const consent = await getAdConsent();
  if (consent === 'unknown') {
    trackAdEvent('init_blocked', { provider: 'unity', reason: 'consent_required' });
    return null;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  // Propagate personalization choice to native module if available (best-effort)
  try {
    const personalized = consent === 'personalized';
    if (typeof unityAdsModule?.setPersonalizedAdsAllowed === 'function') {
      void unityAdsModule.setPersonalizedAdsAllowed(personalized).catch((e) => {
        console.debug?.('[ads] setPersonalizedAdsAllowed failed', e);
      });
    }
  } catch {
    // ignore
  }

  initializationPromise = unityAdsModule!
    .initialize!(UNITY_GAME_ID, UNITY_ADS_REQUEST_TEST_MODE)
    .then((state) => {
      trackAdEvent('init_ready', {
        provider: 'unity',
        test_mode: Boolean(state.testMode),
      });
      return state;
    })
    .catch((error) => {
      initializationPromise = null;
      trackAdEvent('init_failed', {
        provider: 'unity',
        reason: error instanceof Error ? error.message : String(error),
      });
      throw error;
    });

  trackAdEvent('init_started', { provider: 'unity' });
  return initializationPromise;
}

export async function preloadPlacement(
  key: RewardedPlacementKey | InterstitialPlacementKey,
) {
  if (!supportsUnityAds() || !isAdsConfigured()) return false;

  const placementId = getPlacementId(key);
  if (!placementId) return false;
  const blocked = isBlockedByUserState();
  if (blocked.blocked) return false;

  const init = await initializeUnityAds();
  if (!init) return false;
  trackAdEvent('preload_requested', { provider: 'unity', placement_key: key, placement_id: placementId });
  await unityAdsModule!.preload!(placementId);
  trackAdEvent('preload_ready', { provider: 'unity', placement_key: key, placement_id: placementId });
  return true;
}

export async function isPlacementReady(
  key: RewardedPlacementKey | InterstitialPlacementKey,
) {
  if (!supportsUnityAds() || !isAdsConfigured()) return false;
  const blocked = isBlockedByUserState();
  if (blocked.blocked) return false;

  const placementId = getPlacementId(key);
  if (!placementId) return false;
  const init = await initializeUnityAds();
  if (!init) return false;
  return Boolean(await unityAdsModule!.isReady!(placementId));
}

export async function showRewardedPlacement(
  key: RewardedPlacementKey,
) {
  if (!supportsUnityAds()) {
    return { shown: false, reason: 'unsupported' } as const;
  }

  if (!isAdsConfigured()) {
    return { shown: false, reason: 'not_configured' } as const;
  }
  const blocked = isBlockedByUserState();
  if (blocked.blocked) {
    trackAdEvent('show_blocked', { provider: 'unity', reason: blocked.reason });
    return { shown: false, reason: 'blocked_by_timer' } as const;
  }

  const consent = await getAdConsent();
  if (consent === 'unknown') {
    trackAdEvent('show_blocked', { provider: 'unity', reason: 'consent_required' });
    return { shown: false, reason: 'blocked_by_consent' } as const;
  }
  const cap = await canShowPlacement(key);
  if (!cap.allowed) {
    trackAdEvent('capped', { provider: 'unity', placement_key: key });
    return { shown: false, reason: 'capped' } as const;
  }

  const placementId = getPlacementId(key);
  if (!placementId) {
    return { shown: false, reason: 'not_configured' } as const;
  }

  const preloaded = await preloadPlacement(key);
  if (!preloaded) return { shown: false, reason: 'not_ready' } as const;
  const result = await unityAdsModule!.show!(placementId);
  await markPlacementShown(key);
  trackAdEvent('show_completed', {
    provider: 'unity',
    placement_key: key,
    placement_id: placementId,
    state: result.state,
    completed: result.completed,
    clicked: result.clicked,
  });
  return { shown: true, result } as const;
}

export async function tryShowInterstitialPlacement(
  key: InterstitialPlacementKey,
): Promise<ShowPlacementResult> {
  if (!supportsUnityAds()) {
    return { shown: false, reason: 'unsupported' };
  }

  if (!isAdsConfigured()) {
    return { shown: false, reason: 'not_configured' };
  }
  const blocked = isBlockedByUserState();
  if (blocked.blocked) return { shown: false, reason: 'blocked_by_timer' };

  const consent = await getAdConsent();
  if (consent === 'unknown') return { shown: false, reason: 'blocked_by_consent' };

  const cap = await canShowPlacement(key);
  if (!cap.allowed) {
    trackAdEvent('capped', { provider: 'unity', placement_key: key });
    return { shown: false, reason: 'capped' };
  }
  const placementId = getPlacementId(key);
  if (!placementId) {
    return { shown: false, reason: 'not_configured' };
  }

  const init = await initializeUnityAds();
  if (!init) return { shown: false, reason: 'not_ready' };
  const ready = await unityAdsModule!.isReady!(placementId);
    if (!ready) {
    void preloadPlacement(key).catch((e) => {
      console.debug?.('[ads] preloadPlacement failed', e);
    });
    trackAdEvent('show_skipped', {
      provider: 'unity',
      placement_key: key,
      reason: 'not_ready',
    });
    return { shown: false, reason: 'not_ready' };
  }

  const result = await unityAdsModule!.show!(placementId);
  await markPlacementShown(key);
  trackAdEvent('show_completed', {
    provider: 'unity',
    placement_key: key,
    placement_id: placementId,
    state: result.state,
    completed: result.completed,
    clicked: result.clicked,
  });

  return { shown: true, result };
}

export async function getUnityAdsDebugState() {
  if (!supportsUnityAds() || !unityAdsModule?.getDebugState) {
    return {
      supported: false,
      configured: isAdsConfigured(),
    };
  }

  const nativeState = await unityAdsModule.getDebugState();
  return {
    supported: true,
    configured: isAdsConfigured(),
    gameId: UNITY_GAME_ID,
    requestedTestMode: UNITY_ADS_REQUEST_TEST_MODE,
    bannerOverlayBridge: Boolean(unityAdsModule?.showBanner && unityAdsModule?.hideBanner),
    ...nativeState,
  };
}

export async function showBannerPlacement(
  key: BannerPlacementKey,
  width = 320,
  height = 50,
) {
  if (!supportsUnityAds() || !unityAdsModule?.showBanner || !isAdsConfigured()) {
    return false;
  }

  const placementId = getPlacementId(key);
  if (!placementId) return false;
  const blocked = isBlockedByUserState();
  if (blocked.blocked) return false;

  const consent = await getAdConsent();
  if (consent === 'unknown') return false;

  const init = await initializeUnityAds();
  if (!init) return false;

  await unityAdsModule.showBanner(
    placementId,
    PixelRatio.getPixelSizeForLayoutSize(width),
    PixelRatio.getPixelSizeForLayoutSize(height),
  );

  trackAdEvent('banner_requested', {
    provider: 'unity',
    placement_key: key,
    placement_id: placementId,
  });
  return true;
}

export async function hideBannerPlacement() {
  if (!supportsUnityAds() || !unityAdsModule?.hideBanner) {
    return false;
  }

  await unityAdsModule.hideBanner();
  return true;
}

export async function preloadCoreAds() {
  if (!supportsUnityAds() || !isAdsConfigured()) return;
  const blocked = isBlockedByUserState();
  if (blocked.blocked) return;

  const consent = await getAdConsent();
  if (consent === 'unknown') return;

  const init = await initializeUnityAds();
  if (!init) return;
  await Promise.allSettled([
    preloadPlacement('workout_summary_extended'),
    preloadPlacement('progress_insights_extended'),
    preloadPlacement('explore_deep_dive'),
  ]);
}
