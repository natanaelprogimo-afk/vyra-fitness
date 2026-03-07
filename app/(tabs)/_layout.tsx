// ============================================================
// VYRA FITNESS — Tabs Layout
// 5 tabs con TabBar custom y guard de auth
// ============================================================

import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import TabBar from '@/components/layout/TabBar';

export default function TabsLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const isAuthenticated = session !== null && user !== null;
  const isOnboarded = profile?.onboarding_completed ?? false;

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome' as any);
      return;
    }
    if (!isOnboarded) {
      router.replace('/(auth)/onboarding/step1-goals' as any);
    }
  }, [isInitialized, isAuthenticated, isOnboarded]);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home'     }} />
      <Tabs.Screen name="log"      options={{ title: 'Log'      }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso' }} />
      <Tabs.Screen name="coach"    options={{ title: 'Coach'    }} />
      <Tabs.Screen name="profile"  options={{ title: 'Perfil'   }} />
    </Tabs>
  );
}