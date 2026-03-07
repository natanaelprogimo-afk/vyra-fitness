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
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const isAuthenticated = session !== null && user !== null;
  const isOnboarded = profile?.onboarding_completed ?? false;

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      if (isOnboarded) {
        router.replace(Routes.tabs.home as any);
      } else {
        router.replace(Routes.auth.onboarding.step0 as any);
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
