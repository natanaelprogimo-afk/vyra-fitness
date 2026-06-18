import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { trackPaywallViewed, trackTrialStarted } from '@/lib/analytics';

export default function GuestUpgradeScreen() {
  useEffect(() => {
    trackPaywallViewed({
      surface: 'guest_upgrade',
    });
  }, []);

  return (
    <SafeScreen>
      <Header title="Recuperar progreso" />
      <View style={styles.container}>
        <Card style={styles.hero}>
          <Text style={styles.title}>Convierte tu modo invitado en una cuenta real</Text>
          <Text style={styles.body}>
            Unificamos este flujo con la recuperacion nueva para que no se parta entre contratos viejos y nuevos.
            Desde aqui sigues por el camino actual de email, codigo y conversion.
          </Text>
        </Card>

        <NoticeCard
          title="Que conserva"
          body="Tus registros, entrenos, progreso y ajustes del modo invitado pasan a tu cuenta permanente."
          tone="info"
        />

        <Button
          fullWidth
          size="lg"
          onPress={() => {
            trackTrialStarted({
              surface: 'guest_upgrade',
              source: 'email_recovery_cta',
            });
            router.push('/(auth)/guest-email-recovery' as never);
          }}
        >
          Continuar con email
        </Button>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing[4],
    gap: Spacing[4],
  },
  hero: {
    gap: Spacing[3],
    borderRadius: Radius['3xl'],
    backgroundColor: withOpacity(Colors.action, 0.08),
    borderColor: withOpacity(Colors.action, 0.18),
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
