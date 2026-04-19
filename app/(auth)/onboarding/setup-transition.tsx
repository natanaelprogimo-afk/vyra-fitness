import { useEffect } from 'react';
import { router } from 'expo-router';
import { Routes } from '@/constants/routes';
import { loadOnboardingProgress } from '@/lib/onboarding-storage';

export default function SetupTransitionScreen() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (cancelled) return;

      const nextRoute = progress.step || Routes.auth.onboarding.goals;

      router.replace(nextRoute as never);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
