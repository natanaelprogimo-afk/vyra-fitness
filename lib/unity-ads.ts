// Unity Ads deshabilitado temporalmente - pendiente migración a IronSource
export const AD_UNITS = {
  REWARDED: 'Rewarded_Android',
  INTERSTITIAL: 'Interstitial_Android', 
  BANNER: 'Banner_Android',
} as const;

export type AdUnit = typeof AD_UNITS[keyof typeof AD_UNITS];

export async function initUnityAds(): Promise<void> {
  // No-op temporal
}

export function isReady(_adUnit: AdUnit): boolean {
  return false;
}

export function loadAd(_adUnit: AdUnit): void {
  // No-op temporal
}

export function showAd(
  adUnit: AdUnit,
  _onFinish: (placementId: string, state: string) => void,
  onError?: (placementId: string, error: string) => void,
): void {
  onError?.(adUnit, 'Ads no disponibles en esta versión');
}