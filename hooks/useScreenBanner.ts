import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  hideBannerPlacement,
  showBannerPlacement,
} from '@/lib/ads/runtime';
import type { BannerPlacementKey } from '@/lib/ads/placements';

export function useScreenBanner(
  placementKey: BannerPlacementKey,
  width = 320,
  height = 50,
  enabled = true,
) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        void hideBannerPlacement().catch((e) => {
          console.debug?.('[useScreenBanner] hideBannerPlacement failed', e);
        });
        return undefined;
      }

      void showBannerPlacement(placementKey, width, height).catch((e) => {
        console.debug?.('[useScreenBanner] showBannerPlacement failed', e);
      });

      return () => {
        void hideBannerPlacement().catch((e) => {
          console.debug?.('[useScreenBanner] hideBannerPlacement failed', e);
        });
      };
    }, [enabled, height, placementKey, width]),
  );
}

export default useScreenBanner;
