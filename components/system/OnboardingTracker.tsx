import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import { getOnboardingStepMeta } from '@/constants/onboardingFlow';
import { trackOnboardingStarted, trackOnboardingStepViewed } from '@/lib/analytics';

export default function OnboardingTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);
  const stepEnterTime = useRef<number>(0);

  useEffect(() => {
    const meta = getOnboardingStepMeta(pathname);
    if (!meta) return;
    if (lastTracked.current === meta.pathname) return;

    // Track exit time and duration from previous step
    if (lastTracked.current !== null) {
      const duration = Date.now() - stepEnterTime.current;
      // TODO: trackOnboardingStepDuration(lastTracked.current, duration);
    }

    // Record entry time for this step
    stepEnterTime.current = Date.now();

    if (meta.order === 1) {
      trackOnboardingStarted(meta);
    }
    trackOnboardingStepViewed(meta);
    lastTracked.current = meta.pathname;
  }, [pathname]);

  return null;
}
