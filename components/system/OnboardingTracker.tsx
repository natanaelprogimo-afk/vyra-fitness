import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import { getOnboardingStepMeta } from '@/constants/onboardingFlow';
import { trackOnboardingStepViewed } from '@/lib/analytics';

export default function OnboardingTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const meta = getOnboardingStepMeta(pathname);
    if (!meta) return;
    if (lastTracked.current === meta.pathname) return;

    trackOnboardingStepViewed(meta);
    lastTracked.current = meta.pathname;
  }, [pathname]);

  return null;
}
