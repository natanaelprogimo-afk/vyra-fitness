// ============================================================
// VYRA FITNESS — Auth Layout
// Stack de auth con guard: redirige a tabs si ya está logueado
// ============================================================

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router, useGlobalSearchParams, usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { isGuestAuthUser } from '@/lib/guest-auth';
import { isPasswordRecoveryFlowActive } from '@/lib/password-recovery';

export default function AuthLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const hasResolvedProfile = useAuthStore((s) => s.hasResolvedProfile);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const postAuthRoute = useNavigationStore((s) => s.postAuthRoute);
  const consumePostAuthRoute = useNavigationStore((s) => s.consumePostAuthRoute);
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ hold?: string | string[] }>();

  const isAuthenticated = session !== null && user !== null;
  const isOnboarded = profile?.onboarding_completed ?? false;
  const holdValue = Array.isArray(params.hold) ? params.hold[0] : params.hold;
  const isSessionBridge = pathname.includes('session-bridge');
  const isHoldingSessionBridge = isSessionBridge && (holdValue === '1' || holdValue === 'true');
  const isGuestUpgradeRoute = pathname.includes('/google') || pathname.includes('/apple');
  const isAnonymousUser = isGuestAuthUser(user);
  const isPasswordRecovery = isPasswordRecoveryFlowActive();

  useEffect(() => {
    if (!isInitialized) return;
    if (isSessionBridge) return;
    if (isHoldingSessionBridge) return;
    if (isPasswordRecovery) return;
    if (isAuthenticated && isAnonymousUser && isGuestUpgradeRoute) return;
    if (isAuthenticated && !hasResolvedProfile) return;
    if (isAuthenticated) {
      if (isOnboarded) {
        const targetRoute = postAuthRoute ?? Routes.tabs.home;
        if (postAuthRoute) {
          consumePostAuthRoute();
        }
        router.replace(targetRoute as never);
      } else {
        router.replace(Routes.auth.onboarding.transition as never);
      }
    }
  }, [
    consumePostAuthRoute,
    hasResolvedProfile,
    isHoldingSessionBridge,
    isInitialized,
    isAuthenticated,
    isAnonymousUser,
    isOnboarded,
    isPasswordRecovery,
    isSessionBridge,
    isGuestUpgradeRoute,
    postAuthRoute,
  ]);

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
      <Stack.Screen name="google" />
      <Stack.Screen name="apple" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    </Stack>
  );
}
