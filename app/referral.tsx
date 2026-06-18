import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

export default function ReferralBridgeScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasResolvedProfile = useAuthStore((state) => state.hasResolvedProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const code = useMemo(() => {
    const raw = params.code ?? params.ref ?? '';
    return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  }, [params.code, params.ref]);

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated && !hasResolvedProfile) return;

    if (isAuthenticated) {
      router.replace(Routes.tabs.home as never);
      return;
    }

    router.replace(
      {
        pathname: Routes.auth.register,
        params: code ? { ref: code } : {},
      } as never,
    );
  }, [code, hasResolvedProfile, isAuthenticated, isInitialized]);

  return (
    <SafeScreen>
      <View style={styles.loadingState}>
        <ActivityIndicator size="small" color={Colors.action} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
