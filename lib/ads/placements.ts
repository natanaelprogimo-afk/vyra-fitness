import { Platform } from 'react-native';

export type RewardedPlacementKey =
  | 'workout_summary_extended'
  | 'progress_insights_extended';

export type InterstitialPlacementKey =
  | 'explore_deep_dive';

export type BannerPlacementKey =
  | 'water_history_banner'
  | 'nutrition_history_banner'
  | 'supplements_history_banner'
  | 'internal_ads_lab_banner';

export type PlacementKey =
  | RewardedPlacementKey
  | InterstitialPlacementKey
  | BannerPlacementKey;

type PlacementDefinition = {
  adUnitId: string;
  kind: 'rewarded' | 'interstitial' | 'banner';
  dailyCap?: number;
  minIntervalMs?: number;
};

const REWARDED_AD_UNIT_ID =
  (Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_UNITY_REWARDED_PLACEMENT_ANDROID?.trim()
    : process.env.EXPO_PUBLIC_UNITY_REWARDED_PLACEMENT_IOS?.trim()) ||
  process.env.EXPO_PUBLIC_UNITY_REWARDED_PLACEMENT?.trim() ||
  '';
const INTERSTITIAL_AD_UNIT_ID =
  (Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_UNITY_INTERSTITIAL_PLACEMENT_ANDROID?.trim()
    : process.env.EXPO_PUBLIC_UNITY_INTERSTITIAL_PLACEMENT_IOS?.trim()) ||
  process.env.EXPO_PUBLIC_UNITY_INTERSTITIAL_PLACEMENT?.trim() ||
  '';
const BANNER_AD_UNIT_ID =
  (Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_UNITY_BANNER_PLACEMENT_ANDROID?.trim()
    : process.env.EXPO_PUBLIC_UNITY_BANNER_PLACEMENT_IOS?.trim()) ||
  process.env.EXPO_PUBLIC_UNITY_BANNER_PLACEMENT?.trim() ||
  '';

export const UNITY_GAME_ID =
  (Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_UNITY_GAME_ID_ANDROID?.trim()
    : process.env.EXPO_PUBLIC_UNITY_GAME_ID_IOS?.trim()) ||
  process.env.EXPO_PUBLIC_UNITY_GAME_ID_ANDROID?.trim() ||
  process.env.EXPO_PUBLIC_UNITY_GAME_ID?.trim() ||
  '';

export const UNITY_ADS_REQUEST_TEST_MODE =
  process.env.EXPO_PUBLIC_UNITY_ADS_TEST_MODE === 'true';

export const AD_PLACEMENTS: Record<PlacementKey, PlacementDefinition> = {
  workout_summary_extended: {
    adUnitId: REWARDED_AD_UNIT_ID,
    kind: 'rewarded',
    dailyCap: 6,
  },
  progress_insights_extended: {
    adUnitId: REWARDED_AD_UNIT_ID,
    kind: 'rewarded',
    dailyCap: 6,
  },
  explore_deep_dive: {
    adUnitId: INTERSTITIAL_AD_UNIT_ID,
    kind: 'interstitial',
    dailyCap: 4,
    minIntervalMs: 15 * 60 * 1000,
  },
  water_history_banner: {
    adUnitId: BANNER_AD_UNIT_ID,
    kind: 'banner',
  },
  nutrition_history_banner: {
    adUnitId: BANNER_AD_UNIT_ID,
    kind: 'banner',
  },
  supplements_history_banner: {
    adUnitId: BANNER_AD_UNIT_ID,
    kind: 'banner',
  },
  internal_ads_lab_banner: {
    adUnitId: BANNER_AD_UNIT_ID,
    kind: 'banner',
  },
};

export function getPlacementDefinition(key: PlacementKey) {
  return AD_PLACEMENTS[key];
}

export function getPlacementId(key: PlacementKey) {
  return AD_PLACEMENTS[key].adUnitId;
}

export function isAdsConfigured() {
  return Boolean(
    UNITY_GAME_ID &&
      REWARDED_AD_UNIT_ID &&
      INTERSTITIAL_AD_UNIT_ID &&
      BANNER_AD_UNIT_ID,
  );
}
