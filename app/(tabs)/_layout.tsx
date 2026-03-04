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
  const { isInitialized, isAuthenticated, isOnboarded } = useAuthStore((s) => ({
    isInitialized:   s.isInitialized,
    isAuthenticated: s.isAuthenticated(),
    isOnboarded:     s.isOnboarded(),
  }));

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