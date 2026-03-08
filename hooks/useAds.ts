import { useEffect, useMemo, useState, useCallback } from 'react';
import { usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { useUIStore } from '@/stores/uiStore';
import { useAdsStore } from '@/stores/adsStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import {
  initUnityAds as unityInit,
  preloadRewarded,
  preloadInterstitial,
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

function emptyContextViews(): Record<AdContext, number> {
  return {
    quick_log_coins: 0,
    post_workout_2x_xp: 0,
    streak_rescue: 0,
    store_discount: 0,
  };
}

export function useAds() {
  const { isPremium } = usePremiumStore();
  const userId = useAuthStore((state) => state.profile?.id ?? null);
  const pathname = usePathname();
  const { achievementModal } = useUIStore();
  const {
    rewardedLoaded,
    interstitialLoaded,
    isInitialized,
    adsDate,
    adsShownToday,
    contextViews,
    lastInterstitialAt,
    lastAchievementAt,
    setRewardedLoaded,
    setInterstitialLoaded,
    setInitialized,
    syncDay,
    markRewardedShown,
    markInterstitialShown,
    markAchievementSeen,
  } = useAdsStore();

  const [showing, setShowing] = useState(false);

  const loadPlacements = useCallback(async () => {
    const [rewardedOk, interstitialOk] = await Promise.all([
      preloadRewarded(),
      preloadInterstitial(),
    ]);

    setRewardedLoaded(rewardedOk);
    setInterstitialLoaded(interstitialOk);
  }, [setInterstitialLoaded, setRewardedLoaded]);

  const initUnityAds = useCallback(async () => {
    const initialized = await unityInit(process.env.EXPO_PUBLIC_UNITY_GAME_ID_ANDROID);
    setInitialized(initialized);

    if (initialized) {
      await loadPlacements();
    } else {
      setRewardedLoaded(false);
      setInterstitialLoaded(false);
    }

    return initialized;
  }, [loadPlacements, setInitialized, setInterstitialLoaded, setRewardedLoaded]);

  useEffect(() => {
    if (achievementModal.visible) {
      markAchievementSeen();
    }
  }, [achievementModal.visible, markAchievementSeen]);

  useEffect(() => {
    syncDay();
    void initUnityAds();
  }, [initUnityAds, syncDay]);

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

  const inAchievementGrace = useCallback(
    () => Date.now() - lastAchievementAt < POST_ACHIEVEMENT_GRACE_MS,
    [lastAchievementAt],
  );

  const currentDate = toIsoDay(new Date());
  const effectiveAdsShownToday = adsDate === currentDate ? adsShownToday : 0;
  const effectiveContextViews = adsDate === currentDate ? contextViews : emptyContextViews();

  const trackAdInteraction = useCallback(async (
    adType: 'rewarded' | 'interstitial',
    context: string,
    coinsEarned = 0,
  ) => {
    if (!userId) return;

    const { error } = await supabase
      .from('ad_interactions')
      .insert({
        user_id: userId,
        ad_type: adType,
        coins_earned: coinsEarned,
        context,
        viewed_at: new Date().toISOString(),
      });

    if (error) {
      captureError(new Error(error.message), {
        action: 'useAds.trackAdInteraction',
        adType,
        context,
      });
    }
  }, [userId]);

  const canShowRewarded = useCallback((context: AdContext) => {
    const allowOnSummary =
      context === 'post_workout_2x_xp' &&
      pathname.includes('/modules/workout/summary');

    if (isPremium) return false;
    if (!isInitialized || !rewardedLoaded) return false;
    if (isProhibitedScreen && !allowOnSummary) return false;
    if (inAchievementGrace()) return false;
    if (effectiveAdsShownToday >= GLOBAL_DAILY_AD_CAP) return false;
    return effectiveContextViews[context] < DAILY_LIMITS[context];
  }, [
    effectiveAdsShownToday,
    effectiveContextViews,
    inAchievementGrace,
    isInitialized,
    isPremium,
    pathname,
    isProhibitedScreen,
    rewardedLoaded,
  ]);

  const canShowInterstitial = useCallback(() => {
    if (isPremium) return false;
    if (!isInitialized || !interstitialLoaded) return false;
    if (isProhibitedScreen) return false;
    if (inAchievementGrace()) return false;
    if (effectiveAdsShownToday >= GLOBAL_DAILY_AD_CAP) return false;
    return Date.now() - lastInterstitialAt >= INTERSTITIAL_MIN_INTERVAL_MS;
  }, [
    effectiveAdsShownToday,
    inAchievementGrace,
    interstitialLoaded,
    isInitialized,
    isPremium,
    isProhibitedScreen,
    lastInterstitialAt,
  ]);

  const showRewardedAd = useCallback(async (
    context: AdContext,
    onReward?: (coinsEarned: number) => void | Promise<void>,
  ) => {
    if (!canShowRewarded(context)) return false;

    try {
      setShowing(true);
      const result = await unityShowRewarded();

      if (result === 'completed') {
        const coins = context === 'quick_log_coins' ? 15 : 10;
        markRewardedShown(context);

        try {
          await Promise.resolve(onReward?.(coins));
        } catch (rewardError) {
          captureError(rewardError instanceof Error ? rewardError : new Error(String(rewardError)), {
            action: 'useAds.rewardCallback',
            context,
          });
        }

        void trackAdInteraction('rewarded', context, coins);
        void preloadRewarded().then(setRewardedLoaded);
        return true;
      }

      void preloadRewarded().then(setRewardedLoaded);
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
  }, [canShowRewarded, markRewardedShown, setRewardedLoaded, trackAdInteraction]);

  const showInterstitial = useCallback(async () => {
    if (!canShowInterstitial()) return false;

    try {
      setShowing(true);
      const result = await unityShowInterstitial();

      if (result === 'completed') {
        markInterstitialShown();
        void trackAdInteraction('interstitial', pathname);
        void preloadInterstitial().then(setInterstitialLoaded);
        return true;
      }

      void preloadInterstitial().then(setInterstitialLoaded);
      return false;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useAds.showInterstitial',
      });
      return false;
    } finally {
      setShowing(false);
    }
  }, [canShowInterstitial, markInterstitialShown, pathname, setInterstitialLoaded, trackAdInteraction]);

  return {
    rewardedReady: rewardedLoaded,
    interstReady: interstitialLoaded,
    showing,
    isPremium,
    isWorkoutActive,
    initUnityAds,
    canShowRewarded,
    canShowInterstitial,
    showRewardedAd,
    showRewarded: showRewardedAd,
    showInterstitial,
    adsShownToday: effectiveAdsShownToday,
  };
}

export default useAds;
