import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

export default function ReferralScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const hasResolvedProfile = useAuthStore((state) => state.hasResolvedProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const code = useMemo(() => {
    const raw = params.code ?? params.ref ?? '';
    return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  }, [params.code, params.ref]);
  const inviterName = useMemo(() => {
    const raw = params.name ?? params.by ?? params.inviter ?? '';
    return typeof raw === 'string' ? raw.trim() : '';
  }, [params.by, params.inviter, params.name]);

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated && !hasResolvedProfile) return;
    if (isAuthenticated) {
      router.replace(Routes.profile.referral as never);
    }
  }, [hasResolvedProfile, isAuthenticated, isInitialized]);

  if (!isInitialized || (isAuthenticated && !hasResolvedProfile)) {
    return (
      <SafeScreen>
        <View style={styles.loadingState} />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <Text style={styles.eyebrow}>Invitacion</Text>
          <Text style={styles.title}>
            {inviterName ? `${inviterName} te invito a entrar a VYRA.` : 'Alguien te invito a entrar a VYRA.'}
          </Text>
          <Text style={styles.body}>
            Si te registras ahora, el código queda aplicado y la invitación se vincula a tu cuenta.
          </Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>{inviterName ? 'Código de tu amigo' : 'Código detectado'}</Text>
            <Text style={styles.codeValue}>{code || 'SIN CODIGO'}</Text>
          </View>

          <Button
            onPress={() =>
              router.push({ pathname: Routes.auth.register, params: code ? { ref: code } : {} } as never)
            }
            fullWidth
            size="lg"
          >
            Crear mi cuenta
          </Button>

          <Button onPress={() => router.replace(Routes.auth.login as never)} variant="ghost" fullWidth>
            Ya tengo cuenta
          </Button>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[12],
  },
  heroCard: {
    gap: Spacing[4],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  codeCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.18),
    backgroundColor: withOpacity(Colors.brand, 0.1),
    padding: Spacing[5],
    gap: Spacing[1],
  },
  codeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  codeValue: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    color: Colors.textPrimary,
  },
});
