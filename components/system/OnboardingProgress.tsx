import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { getOnboardingStepMeta } from '@/constants/onboardingFlow';

interface OnboardingProgressProps {
  pathname: string;
}

export default function OnboardingProgress({ pathname }: OnboardingProgressProps) {
  const meta = getOnboardingStepMeta(pathname);

  if (!meta) return null;

  const progress = Math.max(0, Math.min(1, meta.order / meta.totalSteps));
  const statusLabel =
    meta.order === meta.totalSteps
      ? 'Configurando VYRA · Último paso'
      : `Configurando VYRA · Paso ${meta.order} de ${meta.totalSteps}`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{statusLabel}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[2],
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: withOpacity(Colors.white, 0.34),
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  track: {
    width: '100%',
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.12),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
  },
});
