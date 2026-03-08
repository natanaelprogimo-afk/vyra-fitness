import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/constants/theme';
import { usePremium } from '@/hooks/usePremium';

const ACTIVE_BENEFITS = [
  'Coach IA sin limite diario',
  'Correlaciones premium en progreso, sueno y bienestar',
  'Barcode scanner ilimitado',
  'Sin anuncios de Unity Ads',
];

export default function ManageSubscriptionScreen() {
  const { status, loading, cancelling, handleCancel, trialDaysLeft, isInTrial } = usePremium();

  const nextBillingLabel =
    status?.status === 'cancelled' ? 'Acceso hasta' : isInTrial ? 'Trial vence' : 'Proxima renovacion';

  const nextBillingDate = isInTrial ? status?.trialEndsAt ?? null : status?.expiresAt ?? null;

  const onCancelPress = () => {
    const message = isInTrial
      ? `Todavia tenes ${trialDaysLeft} dias de trial heredado. Si cancelas ahora, el acceso termina al finalizar ese periodo.`
      : 'Se detendra la renovacion automatica y conservaras Premium hasta el fin del periodo ya pago.';

    Alert.alert(
      'Cancelar suscripcion',
      message,
      [
        { text: 'Mantener Premium', style: 'cancel' },
        {
          text: 'Si, cancelar',
          style: 'destructive',
          onPress: async () => {
            const success = await handleCancel();
            if (success) {
              Alert.alert(
                'Suscripcion cancelada',
                'La renovacion quedo cancelada. Tu acceso Premium sigue activo hasta el fin del periodo actual.',
              );
              router.back();
            } else {
              Alert.alert('Error', 'No pudimos cancelar la suscripcion. Intenta de nuevo.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Mi suscripcion" showBack color={Colors.premium} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusEmoji}>PRO</Text>
            <View>
              <Text style={styles.statusTitle}>Vyra Premium</Text>
              <Text style={[
                styles.statusBadge,
                { color: status?.isActive ? Colors.success : Colors.error },
              ]}>
                {status?.isActive ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
          </View>

          <View style={styles.statusDetails}>
            <StatusRow
              label="Plan"
              value={
                status?.plan === 'monthly'
                  ? 'Mensual - $12.99/mes'
                  : status?.plan === 'yearly'
                    ? 'Anual - $99.99/ano'
                    : '-'
              }
            />

            {nextBillingDate ? (
              <StatusRow
                label={nextBillingLabel}
                value={new Date(nextBillingDate).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            ) : null}

            <StatusRow
              label="Estado local"
              value={status?.status ? status.status : '-'}
              valueColor={status?.isActive ? Colors.success : Colors.textPrimary}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Beneficios activos</Text>
          {ACTIVE_BENEFITS.map((feature) => (
            <Text key={feature} style={styles.feature}>- {feature}</Text>
          ))}
        </Card>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancelPress}
          disabled={cancelling || loading || !status?.isActive}
        >
          <Text style={styles.cancelBtnText}>
            {cancelling ? 'Cancelando...' : 'Cancelar suscripcion'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          La cancelacion detiene la siguiente renovacion en PayPal. No elimina el acceso ya pagado ni tus datos.
        </Text>
      </ScrollView>
    </SafeScreen>
  );
}

function StatusRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  statusCard: { gap: Spacing[4] },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  statusEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 40,
    color: Colors.premium,
  },
  statusTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  statusBadge: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    marginTop: 2,
  },
  statusDetails: {
    gap: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[3],
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  feature: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}50`,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 16,
  },
  cancelBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.error,
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
