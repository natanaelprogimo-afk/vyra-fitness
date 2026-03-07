import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { usePremiumStore } from '@/stores/premiumStore';
import {
  UnityBannerView,
  getUnityBannerPlacement,
  initUnityAds,
} from '@/lib/unity-ads';

interface UnityAdBannerProps {
  style?: StyleProp<ViewStyle>;
  size?: 'standard' | 'leaderboard';
}

export function UnityAdBanner({
  style,
  size = 'standard',
}: UnityAdBannerProps) {
  const { isPremium } = usePremiumStore();
  const [ready, setReady] = useState(false);
  const placementId = getUnityBannerPlacement();

  useEffect(() => {
    let mounted = true;

    if (Platform.OS !== 'android' || isPremium || !placementId) {
      setReady(false);
      return () => {
        mounted = false;
      };
    }

    void initUnityAds().then((initialized) => {
      if (mounted) {
        setReady(initialized);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isPremium, placementId]);

  if (Platform.OS !== 'android' || isPremium || !placementId || !ready) {
    return null;
  }

  return (
    <UnityBannerView
      placementId={placementId}
      size={size}
      style={[styles.banner, style]}
    />
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    minHeight: 50,
  },
});

export default UnityAdBanner;
