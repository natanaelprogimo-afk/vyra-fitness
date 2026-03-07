declare module 'react-native-unity-ads' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  export interface UnityBannerViewProps extends ViewProps {
    placementId: string;
    size?: 'standard' | 'leaderboard';
  }

  export const UnityBannerView: ComponentType<UnityBannerViewProps>;

  const UnityAds: {
    initialize(gameId: string, testMode?: boolean): Promise<boolean>;
    isInitialized(): Promise<boolean>;
    load(placementId: string): Promise<boolean>;
    show(placementId: string): Promise<'COMPLETED' | 'SKIPPED' | 'FAILED'>;
    hideBanner(): Promise<boolean>;
    addEventListener(type: string, handler: (...args: any[]) => void): void;
    removeEventListener(type: string, handler: (...args: any[]) => void): void;
    removeAllListeners(): void;
  };

  export default UnityAds;
}
