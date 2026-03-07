import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'expo-router';
import { usePremiumStore } from '@/stores/premiumStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';
import {
  initUnityAds as unityInit,
  showRewarded as unityShowRewarded,
  showInterstitial as unityShowInterstitial,
} from '@/lib/unity-ads';

export type AdContext =
  | 'quick_log_coins'
  | 'post_workout_2x_xp'
  | 'streak_rescue'
  | 'store_discount';

const DAILY_LIMITS: Record<AdContext, number> = {
  quick_log_coins: 5,
  post_workout_2x_xp: 1,
  streak_rescue: 1,
  store_discount: 3,
};

const INTERSTITIAL_MIN_INTERVAL_MS = 60 * 60 * 1000;
const GLOBAL_DAILY_AD_CAP = 3;
const POST_ACHIEVEMENT_GRACE_MS = 10 * 60 * 1000;

function toIsoDay(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

export function useAds() {
  const { isPremium } = usePremiumStore();
  const pathname = usePathname();
  const { achievementModal } = useUIStore();

  const [showing, setShowing] = useState(false);
  const [contextViews, setContextViews] = useState<Record<AdContext, number>>({
    quick_log_coins: 0,
    post_workout_2x_xp: 0,
    streak_rescue: 0,
    store_discount: 0,
  });
  const [lastInterstitialAt, setLastInterstitialAt] = useState<number>(0);
  const [adsDate, setAdsDate] = useState<string>(toIsoDay(new Date()));
  const [adsShownToday, setAdsShownToday] = useState<number>(0);
  const [lastAchievementAt, setLastAchievementAt] = useState<number>(0);

  useEffect(() => {
    if (achievementModal.visible) {
      setLastAchievementAt(Date.now());
    }
  }, [achievementModal.visible]);

  useEffect(() => {
    void unityInit(process.env.EXPO_PUBLIC_UNITY_GAME_ID_ANDROID);
  }, []);

  const resetIfNewDay = () => {
    const today = toIsoDay(new Date());
    if (today !== adsDate) {
      setAdsDate(today);
      setAdsShownToday(0);
      setContextViews({
        quick_log_coins: 0,
        post_workout_2x_xp: 0,
        streak_rescue: 0,
        store_discount: 0,
      });
    }
  };

  const isWorkoutActive = useMemo(
    () => pathname.includes('/modules/workout/session') || pathname.includes('/modules/workout/active'),
    [pathname],
  );

  const isProhibitedScreen = useMemo(() => {
    return (
      isWorkoutActive ||
      pathname.includes('/modules/mental') ||
      pathname.includes('/modules/fasting') ||
      pathname.includes('/modules/workout/summary') ||
      pathname.includes('/modules/workout/session') ||
      pathname.includes('/modules/workout/active')
    );
  }, [isWorkoutActive, pathname]);

  const inAchievementGrace = () => Date.now() - lastAchievementAt < POST_ACHIEVEMENT_GRACE_MS;

  const canShowRewarded = (context: AdContext) => {
    resetIfNewDay();
    if (isPremium) return false;
    if (isProhibitedScreen) return false;
    if (inAchievementGrace()) return false;
    if (adsShownToday >= GLOBAL_DAILY_AD_CAP) return false;
    return contextViews[context] < DAILY_LIMITS[context];
  };

  const canShowInterstitial = () => {
    resetIfNewDay();
    if (isPremium) return false;
    if (isProhibitedScreen) return false;
    if (inAchievementGrace()) return false;
    if (adsShownToday >= GLOBAL_DAILY_AD_CAP) return false;
    return Date.now() - lastInterstitialAt >= INTERSTITIAL_MIN_INTERVAL_MS;
  };

  const initUnityAds = async () => {
    await unityInit(process.env.EXPO_PUBLIC_UNITY_GAME_ID_ANDROID);
  };

  const showRewardedAd = async (
    context: AdContext,
    onReward?: (coinsEarned: number) => void,
  ) => {
    if (!canShowRewarded(context)) return false;

    try {
      setShowing(true);
      const result = await unityShowRewarded();

      if (result === 'completed') {
        setContextViews((prev) => ({ ...prev, [context]: prev[context] + 1 }));
        setAdsShownToday((prev) => prev + 1);
        const coins = context === 'quick_log_coins' ? 15 : 10;
        onReward?.(coins);
        return true;
      }

      return false;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useAds.showRewardedAd',
        context,
      });
      return false;
    } finally {
      setShowing(false);
    }
  };

  const showInterstitial = async () => {
    if (!canShowInterstitial()) return false;

    try {
      setShowing(true);
      const result = await unityShowInterstitial();
      if (result === 'completed') {
        setLastInterstitialAt(Date.now());
        setAdsShownToday((prev) => prev + 1);
        return true;
      }
      return false;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useAds.showInterstitial',
      });
      return false;
    } finally {
      setShowing(false);
    }
  };

  return {
    rewardedReady: true,
    interstReady: true,
    showing,
    isPremium,
    isWorkoutActive,
    initUnityAds,
    canShowRewarded,
    canShowInterstitial,
    showRewardedAd,
    showRewarded: showRewardedAd,
    showInterstitial,
    adsShownToday,
  };
}

export default useAds;
