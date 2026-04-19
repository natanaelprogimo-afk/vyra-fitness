import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Routes } from '@/constants/routes';
import { Colors, withOpacity } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';

const TRACK_WIDTH = 132;

export default function AppEntryScreen() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasResolvedProfile = useAuthStore((state) => state.hasResolvedProfile);
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const postAuthRoute = useNavigationStore((state) => state.postAuthRoute);
  const clearPostAuthRoute = useNavigationStore((state) => state.clearPostAuthRoute);
  const progress = useSharedValue(0);
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
    progress.value = withTiming(1, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  useEffect(() => {
    if (!isInitialized) return;
    if (session && !hasResolvedProfile) return;

    veilOpacity.value = withTiming(1, { duration: 180 });
    const timer = setTimeout(() => {
      router.replace(destination as never);
      if (postAuthRoute) {
        clearPostAuthRoute();
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [clearPostAuthRoute, destination, hasResolvedProfile, isInitialized, postAuthRoute, session, veilOpacity]);

  const progressStyle = useAnimatedStyle(() => ({
    width: TRACK_WIDTH * progress.value,
  }));

  const veilStyle = useAnimatedStyle(() => ({
    opacity: veilOpacity.value,
  }));

  return (
    <View style={styles.screen}>
      <Text style={styles.logoWord}>VYRA</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
      <Animated.View pointerEvents="none" style={[styles.veil, veilStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: Colors.bgBase,
  },
  logoWord: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    letterSpacing: -1,
    color: Colors.textPrimary,
  },
  progressTrack: {
    width: TRACK_WIDTH,
    height: 2,
    borderRadius: 999,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    borderRadius: 999,
    backgroundColor: Colors.action,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgBase,
  },
});
