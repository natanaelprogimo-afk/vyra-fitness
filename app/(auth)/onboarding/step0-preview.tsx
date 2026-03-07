import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const PREVIEW_STATS = [
  { emoji: '🔥', label: 'Racha promedio', value: '21 días' },
  { emoji: '💧', label: 'Hidratación', value: '+1.4L/día' },
  { emoji: '😴', label: 'Sueño', value: '+48 min/noche' },
  { emoji: '🏋️', label: 'Entrenos completos', value: '3.2 por semana' },
];

export default function OnboardingPreview() {
  return (
    <SafeScreen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>ANTES DE EMPEZAR</Text>
        <Text style={styles.title}>Así se ve tu día 30{'\n'}si sos constante</Text>
        <Text style={styles.subtitle}>
          Esto es un ejemplo realista basado en usuarios con tu mismo punto de partida.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preview “día 30”</Text>
        {PREVIEW_STATS.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowEmoji}>{item.emoji}</Text>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/onboarding/step1-conversation' as any)}
        >
          Empezar onboarding conversacional
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onPress={() => router.push('/(auth)/onboarding/step1-goals' as any)}
        >
          Usar modo clasico
        </Button>
        <Text style={styles.note}>
          Te vamos a pedir solo 4 datos rapidos para personalizar todo.
        </Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: Spacing[7],
    gap: Spacing[2],
  },
  kicker: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    letterSpacing: 1,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'] * 1.2,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.5,
  },
  card: {
    marginTop: Spacing[6],
    padding: Spacing[4],
    borderRadius: Radius['2xl'],
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  cardTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  rowEmoji: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  footer: {
    marginTop: 'auto',
    gap: Spacing[3],
    paddingBottom: Spacing[6],
  },
  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
