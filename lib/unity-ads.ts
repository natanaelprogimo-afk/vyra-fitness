// Unity Ads wrapper: tries to use `react-native-unity-ads` if available,
// otherwise falls back to a simulated flow for development.

type UnityResult = 'completed' | 'skipped' | 'failed';

function getPlacement(kind: 'rewarded' | 'interstitial') {
  if (kind === 'rewarded') {
    return process.env.EXPO_PUBLIC_UNITY_REWARDED_PLACEMENT ?? 'vyra_rewarded';
  }
  return process.env.EXPO_PUBLIC_UNITY_INTERSTITIAL_PLACEMENT ?? 'vyra_interstitial';
}

export async function initUnityAds(gameId?: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const UnityAds = require('react-native-unity-ads');
    if (UnityAds && typeof UnityAds.initialize === 'function') {
      UnityAds.initialize(
        gameId ?? process.env.EXPO_PUBLIC_UNITY_GAME_ID_ANDROID ?? process.env.EXPO_PUBLIC_UNITY_GAME_ID ?? '',
        true,
      );
    }
  } catch {
    // Native module missing - ignore (dev fallback will be used)
  }
}

async function showPlacement(placementId: string): Promise<UnityResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const UnityAds = require('react-native-unity-ads');
    if (UnityAds && typeof UnityAds.show === 'function') {
      return await new Promise<UnityResult>((resolve) => {
        try {
          UnityAds.show(placementId);

          const onUnityEvent = (ev: any) => {
            if (ev && ev.status === 'completed') {
              resolve('completed');
              // @ts-ignore
              UnityAds.removeEventListener(onUnityEvent);
            } else if (ev && ev.status === 'skipped') {
              resolve('skipped');
              // @ts-ignore
              UnityAds.removeEventListener(onUnityEvent);
            }
          };

          if (typeof UnityAds.addEventListener === 'function') {
            // @ts-ignore
            UnityAds.addEventListener(onUnityEvent);
            setTimeout(() => resolve('completed'), 8000);
          } else {
            setTimeout(() => resolve('completed'), 4000);
          }
        } catch {
          resolve('failed');
        }
      });
    }
  } catch {
    // Continue to fallback
  }

  return await new Promise<UnityResult>((resolve) => {
    setTimeout(() => resolve('completed'), 2000);
  });
}

export async function showRewarded(): Promise<UnityResult> {
  return showPlacement(getPlacement('rewarded'));
}

export async function showInterstitial(): Promise<UnityResult> {
  return showPlacement(getPlacement('interstitial'));
}
