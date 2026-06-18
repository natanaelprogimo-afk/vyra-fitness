import { useEffect } from 'react';
import { router } from 'expo-router';
import { Routes } from '@/constants/routes';
import { getFirstIncompleteOnboardingRoute } from '@/lib/onboarding-v2';
import { loadOnboardingProgress } from '@/lib/onboarding-storage';

export default function SetupTransitionScreen() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (cancelled) return;

      // If user has already started onboarding, continue from where they left off
      if (progress.data?.goal_detail) {
        const nextRoute =
          getFirstIncompleteOnboardingRoute(progress.data ?? null) || Routes.tabs.home;
        router.replace(nextRoute as never);
        return;
      }

      // Otherwise, show setup mode selection
      router.replace(Routes.auth.onboarding.setupMode as never);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
