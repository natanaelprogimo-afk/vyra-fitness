import React from 'react';
import { Platform, View } from 'react-native';
import { usePremiumStore } from '@/stores/premiumStore';

interface UnityAdBannerProps {
  style?: object;
}

export function UnityAdBanner({ style }: UnityAdBannerProps) {
  const { isPremium } = usePremiumStore();

  // Premium users never see ads.
  if (isPremium) return null;

  // The current Unity RN package in this project supports rewarded/interstitial only.
  // Keep banner slot empty to avoid rendering fake placeholders as if it were a real ad.
  if (Platform.OS !== 'android') return null;
  if (!process.env.EXPO_PUBLIC_UNITY_BANNER_PLACEMENT) return null;

  return <View style={style} />;
}

export default UnityAdBanner;
