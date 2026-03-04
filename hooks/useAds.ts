import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAdsStore } from '@/stores/adsStore';
import { usePremiumStore } from '@/stores/premiumStore';
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
  // Unity Ads removed temporarily — provide a safe no-op implementation
  const { profile } = useAuthStore();
  const { isPremium } = usePremiumStore();

  const rewardedReady = false;
  const interstReady = false;
  const showing = false;

  const canShowRewarded = (_context: AdContext) => false;
  const canShowInterstitial = () => false;

  const showRewarded = async (_context: AdContext, _onReward: (coinsEarned: number) => void) => {
    return Promise.resolve();
  };

  const showInterstitial = async () => Promise.resolve();

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

