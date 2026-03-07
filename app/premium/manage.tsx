import React, { useState } from 'react';
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
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { usePremium } from '@/hooks/usePremium';

export default function ManageSubscriptionScreen() {
  const { status, loading, cancelling, handleCancel, trialDaysLeft, isInTrial } = usePremium();

  const onCancelPress = () => {
    Alert.alert(
      'Cancelar suscripción',
      isInTrial
        ? `Todavía tenés ${trialDaysLeft} días de trial heredado. Si cancelás ahora perderás el acceso al terminar ese período. ¿Querés cancelar?`
        : '¿Estás seguro? Se detendrá la renovación y conservarás Premium hasta el fin del período actual.',
      [
        { text: 'Mantener Premium', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const success = await handleCancel();
            if (success) {
              Alert.alert(
                'Suscripción cancelada',
                'La renovación quedó cancelada. Seguís teniendo acceso Premium hasta el fin del período actual.',
              );
              router.back();
            } else {
              Alert.alert('Error', 'No pudimos cancelar. Intentá de nuevo o contactá a soporte.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Mi suscripción" showBack color={Colors.premium} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Estado actual */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusEmoji}>💎</Text>
            <View>
              <Text style={styles.statusTitle}>Vyra Premium</Text>
              <Text style={[
                styles.statusBadge,
                { color: status?.isActive ? Colors.success : Colors.error },
              ]}>
                {status?.isActive ? '● Activa' : '● Inactiva'}
              </Text>
            </View>
          </View>

          <View style={styles.statusDetails}>
            <StatusRow label="Plan" value={
              status?.plan === 'monthly' ? 'Mensual — $12.99/mes'
              : status?.plan === 'yearly' ? 'Anual — $99.99/año'
              : '—'
            } />
            {isInTrial && (
              <StatusRow
                label="Trial gratuito"
                value={`${trialDaysLeft} días restantes`}
                valueColor={Colors.success}
              />
            )}
            {isInTrial && status?.trialEndsAt && (
              <StatusRow
                label="Trial vence"
                value={new Date(status.trialEndsAt).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              />
            )}
            {!isInTrial && status?.expiresAt && (
              <StatusRow
                label="Próxima renovación"
                value={new Date(status.expiresAt).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              />
            )}
          </View>
        </Card>

        {/* Features activas */}
        <Card>
          <Text style={styles.sectionTitle}>Features activas</Text>
          {[
            '🤖 Coach IA ilimitado con memoria',
            '📸 Análisis de fotos con IA',
            '🎙️ Log de comida por voz',
            '📊 Historial ilimitado',
            '🔍 Barcode scanner ilimitado',
            '📈 Proyección de peso con IA',
            '🚫 Sin anuncios',
          ].map((feature, i) => (
            <Text key={i} style={styles.feature}>{feature}</Text>
          ))}
        </Card>

        {/* Cancelar */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancelPress}
          disabled={cancelling || loading}
        >
          <Text style={styles.cancelBtnText}>
            {cancelling ? 'Cancelando...' : 'Cancelar suscripción'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Al cancelar detenés la renovación en PayPal, pero mantenés acceso hasta el fin del período ya pagado.
          Tus datos se conservan al volver al plan Free.
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
  statusEmoji: { fontSize: 48 },
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
    borderRadius: Radius.xl,
  },
  cancelBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.error,
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
