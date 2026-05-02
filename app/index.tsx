import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import GlowRing from '@/components/ui/GlowRing';
import { Routes } from '@/constants/routes';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';

const SPLASH_RING_SIZE = 132;

export default function AppEntryScreen() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasResolvedProfile = useAuthStore((state) => state.hasResolvedProfile);
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const postAuthRoute = useNavigationStore((state) => state.postAuthRoute);
  const clearPostAuthRoute = useNavigationStore((state) => state.clearPostAuthRoute);
  const [ringValue, setRingValue] = useState(0);
  const spin = useSharedValue(0);
  const veilOpacity = useSharedValue(0);

  const destination = useMemo(() => {
    const isAuthenticated = session !== null && user !== null;

    if (!isAuthenticated) {
      return Routes.auth.welcome;
    }

    if (profile?.onboarding_completed) {
      return postAuthRoute ?? Routes.tabs.home;
    }

    return Routes.auth.onboarding.goals;
  }, [postAuthRoute, profile?.onboarding_completed, session, user]);

  useEffect(() => {
    setRingValue(100);
    spin.value = withRepeat(
      withTiming(360, {
        duration: 1400,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [spin]);

  useEffect(() => {
    if (!isInitialized) return;
    if (session && !hasResolvedProfile) return;

    veilOpacity.value = withTiming(1, { duration: 220 });
    const timer = setTimeout(() => {
      router.replace(destination as never);
      if (postAuthRoute && destination === postAuthRoute) {
        clearPostAuthRoute();
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [clearPostAuthRoute, destination, hasResolvedProfile, isInitialized, postAuthRoute, session, veilOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const veilStyle = useAnimatedStyle(() => ({
    opacity: veilOpacity.value,
  }));

  return (
    <View style={styles.screen}>
      <Text style={styles.logoWord}>VYRA</Text>
      <Animated.View style={ringStyle}>
        <GlowRing
          value={ringValue}
          size={SPLASH_RING_SIZE}
          strokeWidth={4}
          color={Colors.action}
          trackColor="rgba(255,255,255,0.08)"
        />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.veil, veilStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[6],
    backgroundColor: Colors.bgBase,
  },
  logoWord: {
    fontFamily: FontFamily.black,
    fontSize: 28,
    letterSpacing: -1.1,
    color: Colors.textPrimary,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgBase,
  },
});
