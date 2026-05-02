import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const INCLUDED_FEATURES = [
  'Lecturas avanzadas, correlaciones e insights contextuales.',
  'Historial amplio y recorridos completos por modulo.',
  'Scanner, IA, exportaciones y capas de soporte dentro del acceso actual.',
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

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Todo incluido" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {arrivedFromLegacyFlow ? (
          <NoticeCard
            title="Ruta de compatibilidad"
            body="Este enlace viejo ahora solo resume el acceso actual. La app sigue disponible con acceso incluido."
            tone="info"
          />
        ) : null}

        <Card accentColor={Colors.brand}>
          <Text style={styles.eyebrow}>Acceso actual</Text>
          <Text style={styles.heroTitle}>Todo el producto esta abierto.</Text>
          <Text style={styles.heroBody}>
            Vyra funciona hoy con acceso incluido. La monetizacion actual se apoya en anuncios
            discretos y en videos recompensados opcionales, no en suscripciones.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Que incluye hoy</Text>
          <View style={styles.stack}>
            {INCLUDED_FEATURES.map((item) => (
              <View key={item} style={styles.row}>
                <View style={styles.dot} />
                <Text style={styles.rowText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Modelo actual</Text>
          <Text style={styles.sectionBody}>
            Los anuncios viven en superficies secundarias o como extras optativos. Tus datos, tu
            cuenta y tus registros actuales no cambian por esta ruta.
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
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sectionBody: {
    marginTop: Spacing[2],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  stack: {
    marginTop: Spacing[2],
    gap: Spacing[2],
  },
  row: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    marginTop: 7,
    backgroundColor: withOpacity(Colors.brand, 0.65),
  },
  rowText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing[3],
  },
});
