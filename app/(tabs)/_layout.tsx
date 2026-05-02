import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import TabBar from '@/components/layout/TabBar';
import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

export default function TabsLayout() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasResolvedProfile = useAuthStore((state) => state.hasResolvedProfile);
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const isAuthenticated = session !== null && user !== null;
  const isOnboarded = profile?.onboarding_completed ?? false;

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated && !hasResolvedProfile) return;

    if (!isAuthenticated) {
      router.replace(Routes.auth.welcome as never);
      return;
    }

    if (!isOnboarded) {
      router.replace(Routes.auth.onboarding.goals as never);
    }
  }, [hasResolvedProfile, isAuthenticated, isInitialized, isOnboarded]);

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso' }} />
    </Tabs>
  );
}

