// REDESIGNED: 2026-05-23 — access compatibility screen for legacy links
import React from 'react';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { trackPaywallViewed } from '@/lib/analytics';

const INCLUDED_FEATURES = [
  'Lecturas avanzadas, correlaciones e insights contextuales.',
  'Historial amplio y recorridos completos por modulo.',
  'Scanner, IA, exportaciones y capas de soporte dentro del acceso actual.',
] as const;

const STATUS_PILLS = [
  'Acceso abierto',
  'Sin plan activo',
  'Experiencia limpia',
] as const;

export default function PaywallScreen() {
  const params = useLocalSearchParams<{
    subscription_status?: string;
    subscription_id?: string;
    plan?: string;
    trigger?: string;
  }>();

  const arrivedFromLegacyFlow = Boolean(
    params.subscription_status || params.subscription_id || params.plan || params.trigger,
  );

  useEffect(() => {
    trackPaywallViewed({
      surface: 'premium_paywall',
      arrived_from_legacy_flow: arrivedFromLegacyFlow,
    });
  }, [arrivedFromLegacyFlow]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Acceso" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {arrivedFromLegacyFlow ? (
          <NoticeCard
            title="Ruta de compatibilidad"
            body="Este enlace viejo ahora solo resume el acceso actual. La app sigue disponible sin bloqueos ni pantallas de pago."
            tone="info"
          />
        ) : null}

        <Card accentColor={Colors.brand} style={styles.heroCard}>
          <Text style={styles.eyebrow}>Acceso actual</Text>
          <Text style={styles.heroTitle}>Nada por desbloquear.</Text>
          <Text style={styles.heroBody}>
            Vyra funciona hoy con acceso abierto. Esta pantalla ya no vende un plan: solo deja
            claro cómo se sostiene el producto y a dónde seguir.
          </Text>
          <View style={styles.pillRow}>
            {STATUS_PILLS.map((item) => (
              <View key={item} style={styles.statusPill}>
                <Text style={styles.statusPillText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <SectionHeader
            eyebrow="Disponible"
            title="Que tienes hoy"
            subtitle="Lo importante entra sin letra chica ni condiciones escondidas."
          />
          <View style={styles.stack}>
            {INCLUDED_FEATURES.map((item) => (
              <View key={item} style={styles.row}>
                <View style={styles.dotWrap}>
                  <View style={styles.dot} />
                </View>
                <Text style={styles.rowText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <SectionHeader
            eyebrow="Modelo"
            title="Como se sostiene ahora"
            subtitle="La experiencia principal se mantiene limpia: solo lo esencial para registrar y avanzar."
          />
          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>0</Text>
              <Text style={styles.metaLabel}>Pasos extra para usar la app</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaValue}>100%</Text>
              <Text style={styles.metaLabel}>Del tracking principal abierto</Text>
            </View>
          </View>
          <Text style={styles.sectionBody}>
            Tus datos, tu cuenta y tu historial no cambian por entrar aqui. Esta superficie solo
            ordena expectativas y evita que un enlace viejo te haga pensar que falta pagar algo.
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button onPress={() => router.replace('/(tabs)' as never)} fullWidth color={Colors.brand}>
            Ir al inicio
          </Button>
          <Button
            onPress={() => router.push('/profile' as never)}
            variant="secondary"
            fullWidth
            color={Colors.brand}
          >
            Ver mi perfil
          </Button>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[3],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    lineHeight: 34,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  statusPill: {
    minHeight: 32,
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.18),
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  statusPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  sectionCard: {
    gap: Spacing[4],
  },
  stack: {
    gap: Spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  dotWrap: {
    width: 18,
    paddingTop: 7,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.brand, 0.65),
  },
  rowText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  metaCard: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: withOpacity(Colors.surface2, 0.9),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  metaValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  metaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing[3],
  },
});
