import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAdsStore } from '@/stores/adsStore';
import { usePremiumStore } from '@/stores/premiumStore';
import {
  initUnityAds,
  loadAd,
  showAd,
  isReady,
  AD_UNITS,
  AdUnit,
} from '@/lib/unity-ads';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

// Contextos donde se puede mostrar un rewarded ad
export type AdContext =
  | 'quick_log_coins'        // Log rápido → +15 monedas
  | 'post_workout_2x_xp'     // Post-entreno → 2x XP
  | 'streak_rescue'          // Rescate de racha → +12h
  | 'store_discount'         // Tienda → 20% descuento

// Reglas: cuántas veces por día puede mostrarse cada tipo
const DAILY_LIMITS: Record<AdContext, number> = {
  quick_log_coins:     5,
  post_workout_2x_xp:  1,
  streak_rescue:       1,
  store_discount:      3,
};

// Intervalos mínimos entre intersticiales (en ms)
const INTERSTITIAL_MIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

export function useAds() {
  const { profile } = useAuthStore();
  const { isPremium } = usePremiumStore();
  const { rewardedCountToday, incrementRewardedCount, interstitialLastAt, setInterstitialLastAt, rewardedLoaded, interstitialLoaded } =
    useAdsStore();

  const [rewardedReady, setRewardedReady] = useState(rewardedLoaded);
  const [interstReady, setInterstReady] = useState(interstitialLoaded);
  const [showing,       setShowing]       = useState(false);
  const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    initUnityAds().then(() => {
      loadAd(AD_UNITS.REWARDED);
      loadAd(AD_UNITS.INTERSTITIAL);
    });

    // Polling de disponibilidad
    checkInterval.current = setInterval(() => {
      setRewardedReady(isReady(AD_UNITS.REWARDED));
      setInterstReady(isReady(AD_UNITS.INTERSTITIAL));
    }, 3000);

    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current);
    };
  }, []);

  // ── ¿Se puede mostrar un rewarded en este contexto? ───────────────
  const canShowRewarded = useCallback(
    (context: AdContext): boolean => {
      if (isPremium) return false;                          // Premium no ve ads
      const count = rewardedCountToday;  // Use total rewarded count
      const limit = DAILY_LIMITS[context];
      return count < limit && rewardedReady;
    },
    [isPremium, rewardedCountToday, rewardedReady],
  );

  // ── ¿Se puede mostrar intersticial? ──────────────────────────────
  const canShowInterstitial = useCallback((): boolean => {
    if (isPremium) return false;
    const now = Date.now();
    if (interstitialLastAt && now - interstitialLastAt.getTime() < INTERSTITIAL_MIN_INTERVAL_MS) return false;
    return interstReady;
  }, [isPremium, interstitialLastAt, interstReady]);

  // ── Mostrar rewarded y otorgar coins ─────────────────────────────
  const showRewarded = useCallback(
    async (
      context: AdContext,
      onReward: (coinsEarned: number) => void,
    ): Promise<void> => {
      if (!canShowRewarded(context) || showing) return;
      setShowing(true);

      return new Promise((resolve) => {
        showAd(
          AD_UNITS.REWARDED,
          async (placementId, state) => {
            setShowing(false);
            if (state === 'COMPLETED' || state === 'Completed') {
              const coins = 15;
              incrementRewardedCount();
              onReward(coins);

              // Registrar en Supabase
              if (profile?.id) {
                try {
                  await supabase.from('ad_interactions').insert({
                    user_id:      profile.id,
                    ad_type:      'rewarded',
                    coins_earned: coins,
                    context,
                    viewed_at:    new Date().toISOString(),
                  });
                  // Sumar coins via RPC
                  await supabase.rpc('increment_coins', {
                    p_user_id:    profile.id,
                    p_amount:     coins,
                    p_type:       'ad_reward',
                    p_description: `Recompensa ad: ${context}`,
                  });
                } catch (err) {
                  captureError(err instanceof Error ? err : new Error(String(err)), { action: "useAds.showRewarded.register" });
                }
              }
            }
            resolve();
          },
          (_, error) => {
            setShowing(false);
            resolve();
          },
        );
      });
    },
    [canShowRewarded, showing, profile?.id, incrementRewardedCount],
  );

  // ── Mostrar intersticial (transición entre pantallas) ─────────────
  const showInterstitial = useCallback(async (): Promise<void> => {
    if (!canShowInterstitial() || showing) return;
    setShowing(true);
    setInterstitialLastAt(new Date());

    return new Promise((resolve) => {
      showAd(
        AD_UNITS.INTERSTITIAL,
        async (placementId, state) => {
          setShowing(false);
          if (profile?.id) {
            try {
              await supabase.from('ad_interactions').insert({
                user_id:      profile.id,
                ad_type:      'interstitial',
                coins_earned: 0,
                context:      'transition',
                viewed_at:    new Date().toISOString(),
              });
            } catch (err) {
              captureError(err instanceof Error ? err : new Error(String(err)), { action: "useAds.showInterstitial.register" });
            }
          }
          resolve();
        },
        () => {
          setShowing(false);
          resolve();
        },
      );
    });
  }, [canShowInterstitial, showing, profile?.id, setInterstitialLastAt]);

  return {
    rewardedReady,
    interstReady,
    showing,
    canShowRewarded,
    canShowInterstitial,
    showRewarded,
    showInterstitial,
    isPremium,
  };
}

