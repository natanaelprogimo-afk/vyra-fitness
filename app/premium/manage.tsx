import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { usePremium } from '@/hooks/usePremium';

const ACTIVE_ZONES = [
  { title: 'Progreso', body: 'Lecturas premium y correlaciones mas finas.', route: Routes.tabs.progress, accent: Colors.premium },
  { title: 'Nutricion IA', body: 'Registro mas rapido con foto y sin limite diario.', route: Routes.nutrition.log, accent: Colors.success },
  { title: 'Historial', body: 'Mas contexto y mas profundidad para leer tus semanas.', route: Routes.dailySummary, accent: Colors.brand },
] as const;

export default function ManageSubscriptionScreen() {
  const { status, loading, cancelling, handleCancel, trialDaysLeft, isInTrial } = usePremium();

  const isActive = Boolean(status?.isActive);
  const nextBillingLabel = status?.status === 'cancelled'
    ? 'Acceso hasta'
    : isInTrial
      ? 'Trial hasta'
      : 'Proxima renovacion';
  const nextBillingDate = isInTrial ? status?.trialEndsAt ?? null : status?.expiresAt ?? null;
  const planLabel =
    status?.plan === 'monthly'
      ? 'Mensual'
      : status?.plan === 'yearly'
        ? 'Anual'
        : 'Sin plan activo';

  function onCancelPress() {
    const message = isInTrial
      ? `Tienes ${trialDaysLeft} dias de trial por delante. Si cancelas, el acceso termina cuando cierre ese periodo.`
      : 'Se corta la siguiente renovacion, pero mantienes el acceso hasta el final del periodo ya pagado.';

    Alert.alert('Cancelar Premium', message, [
      { text: 'Seguir con Premium', style: 'cancel' },
      {
        text: 'Cancelar renovacion',
        style: 'destructive',
        onPress: async () => {
          const success = await handleCancel();
          if (success) {
            Alert.alert('Renovacion cancelada', 'Tu acceso sigue activo hasta que termine el periodo actual.');
            router.back();
          } else {
            Alert.alert('No se pudo cancelar', 'Intenta de nuevo en unos segundos.');
          }
        },
      },
    ]);
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Mi Premium" showBack color={Colors.premium} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.premium}>
          <Text style={styles.eyebrow}>{isActive ? 'Premium activo' : 'Estado de suscripcion'}</Text>
          <Text style={styles.heroTitle}>
            {isActive ? 'Tu inversion esta encendida.' : 'No hay un plan activo ahora mismo.'}
          </Text>
          <Text style={styles.heroBody}>
            {isActive
              ? isInTrial
                ? `Estas dentro del trial y quedan ${trialDaysLeft} dias para decidir si quieres continuidad.`
                : 'La capa Premium esta lista para notarse en progreso, historial y registro rapido con menos friccion.'
              : 'Si quieres volver, el paywall contextual sigue siendo la entrada mas limpia.'}
          </Text>

          <View style={styles.metaStack}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Plan</Text>
              <Text style={styles.metaValue}>{planLabel}</Text>
            </View>
            {nextBillingDate ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{nextBillingLabel}</Text>
                <Text style={styles.metaValue}>
                  {new Date(nextBillingDate).toLocaleDateString('es-UY', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Estado</Text>
              <Text style={[styles.metaValue, isActive ? { color: Colors.success } : null]}>
                {isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </Card>

        {isActive ? (
          <Card>
            <Text style={styles.sectionTitle}>Donde mas se nota hoy</Text>
            <View style={styles.zoneStack}>
              {ACTIVE_ZONES.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={[styles.zoneCard, { borderColor: withOpacity(item.accent, 0.24) }]}
                  onPress={() => router.push(item.route as never)}
                >
                  <Text style={[styles.zoneTitle, { color: item.accent }]}>{item.title}</Text>
                  <Text style={styles.zoneBody}>{item.body}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ) : null}

        {isActive ? (
          <Button
            onPress={onCancelPress}
            disabled={cancelling || loading}
            variant="secondary"
            fullWidth
            color={Colors.premium}
          >
            {cancelling ? 'Cancelando...' : 'Cancelar renovacion'}
          </Button>
        ) : (
          <Button onPress={() => router.push(Routes.premium.paywall as never)} fullWidth color={Colors.premium}>
            Volver a planes
          </Button>
        )}

        <Text style={styles.disclaimer}>
          Cancelar no borra tus datos ni lo ya pagado. Solo evita la siguiente renovacion.
        </Text>
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
    color: Colors.premium,
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
  metaStack: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
  },
  metaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  metaValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  zoneStack: {
    gap: Spacing[2],
  },
  zoneCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 4,
  },
  zoneTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  zoneBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
