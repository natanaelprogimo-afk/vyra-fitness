// REDESIGNED: 2026-05-21 - splash is calmer, faster, and progress-led
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Routes } from '@/constants/routes';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';

const ENTRY_ROUTE_TIMEOUT_MS = 3500;
const PROGRESS_WIDTH = Dimensions.get('window').width * 0.34;

export default function AppEntryScreen() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasResolvedProfile = useAuthStore((state) => state.hasResolvedProfile);
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const postAuthRoute = useNavigationStore((state) => state.postAuthRoute);
  const clearPostAuthRoute = useNavigationStore((state) => state.clearPostAuthRoute);
  const [entryTimedOut, setEntryTimedOut] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.96);
  const progressX = useSharedValue(-PROGRESS_WIDTH);
  const exitOpacity = useSharedValue(1);
  const exitScale = useSharedValue(1);

  const destination = useMemo(() => {
    const isAuthenticated = session !== null && user !== null;

    if (!isAuthenticated) {
      return Routes.auth.welcome;
    }

    if (profile?.onboarding_completed || (entryTimedOut && profile == null)) {
      return postAuthRoute ?? Routes.tabs.home;
    }

    return Routes.auth.onboarding.transition;
  }, [entryTimedOut, postAuthRoute, profile, session, user]);

  const waitingForProfile = session !== null && user !== null && !hasResolvedProfile;
  const readyToResolve = (isInitialized || entryTimedOut) && (!waitingForProfile || entryTimedOut);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    progressX.value = withRepeat(
      withTiming(Dimensions.get('window').width + PROGRESS_WIDTH, {
        duration: 1250,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      false,
    );
  }, [logoOpacity, logoScale, progressX]);

  useEffect(() => {
    if (shouldRedirect) return undefined;
    const timer = setTimeout(() => {
      setEntryTimedOut(true);
    }, ENTRY_ROUTE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [shouldRedirect]);

  useEffect(() => {
    if (!readyToResolve) return;
    exitOpacity.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    exitScale.value = withTiming(1.015, { duration: 220, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(() => {
      setShouldRedirect(true);
      if (postAuthRoute && destination === postAuthRoute) {
        clearPostAuthRoute();
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [clearPostAuthRoute, destination, exitOpacity, exitScale, postAuthRoute, readyToResolve]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value * exitOpacity.value,
    transform: [{ scale: logoScale.value * exitScale.value }],
  }));

  const progressIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressX.value }],
    opacity: interpolate(exitOpacity.value, [0, 1], [0, 1]),
  }));

  if (shouldRedirect) {
    return <Redirect href={destination as never} />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />

      <Animated.View style={[styles.hero, heroStyle]}>
        <Text style={styles.wordmark}>VYRA</Text>
        <Text style={styles.tagline}>Salud. Habitos. Progreso.</Text>
      </Animated.View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressIndicator, progressIndicatorStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.base,
    overflow: 'hidden',
  },
  glowPrimary: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -140,
    right: -120,
    backgroundColor: withOpacity(Colors.workout, 0.08),
  },
  glowSecondary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: -140,
    left: -120,
    backgroundColor: withOpacity(Colors.sleep, 0.07),
  },
  hero: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  wordmark: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.black,
    fontSize: FontSize['2xl'],
    letterSpacing: 2.8,
  },
  tagline: {
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    letterSpacing: 0.6,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: withOpacity(Colors.white, 0.06),
    overflow: 'hidden',
  },
  progressIndicator: {
    width: PROGRESS_WIDTH,
    height: 2,
    backgroundColor: Colors.textPrimary,
  },
});
