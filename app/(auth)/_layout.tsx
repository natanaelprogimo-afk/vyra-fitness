// ============================================================
// VYRA FITNESS — Auth Layout
// Stack de auth con guard: redirige a tabs si ya está logueado
// ============================================================

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';

export default function AuthLayout() {
  const { isInitialized, isAuthenticated, isOnboarded } = useAuthStore((s) => ({
    isInitialized:  s.isInitialized,
    isAuthenticated: s.isAuthenticated(),
    isOnboarded:    s.isOnboarded(),
  }));

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      if (isOnboarded) {
        router.replace(Routes.tabs.home as any);
      } else {
        router.replace(Routes.auth.onboarding.step1 as any);
      }
    }
  }, [isInitialized, isAuthenticated, isOnboarded]);

  return (
    <Stack
      screenOptions={{
        headerShown:   false,
        contentStyle:  { backgroundColor: Colors.bgPrimary },
        animation:     'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    </Stack>
  );
}