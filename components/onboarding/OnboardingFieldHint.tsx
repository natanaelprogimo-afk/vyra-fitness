/**
 * Onboarding Field Hint
 * Shows helpful text like "(Ajustable después)" to reduce abandonment
 * by reducing fear of permanent decisions
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/theme';

interface OnboardingFieldHintProps {
  text?: string;
  type?: 'info' | 'optional' | 'adjustable';
}

const DEFAULT_HINTS: Record<string, string> = {
  info: '💡 Este dato nos ayuda a personalizarte mejor',
  optional: '(Opcional - podés hacerlo después)',
  adjustable: '(Ajustable desde Ajustes en cualquier momento)',
};

export default function OnboardingFieldHint({
  text,
  type = 'adjustable',
}: OnboardingFieldHintProps) {
  const displayText = text || DEFAULT_HINTS[type];

  return <Text style={styles.hint}>{displayText}</Text>;
}

const styles = StyleSheet.create({
  hint: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
