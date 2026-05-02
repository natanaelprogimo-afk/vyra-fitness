// ============================================================
// VYRA FITNESS - AIInsight
// Card con lectura contextual basada en datos del día.
// ============================================================

import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

interface AIInsightProps {
  insight?: string | null;
  onPress?: () => void;
  actionLabel?: string;
}

export const AIInsight = ({ insight, onPress, actionLabel = 'Ver contexto' }: AIInsightProps) => {
  if (!insight) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lectura contextual</Text>
      <Text style={styles.text}>{insight}</Text>
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityHint="Abre la lectura contextual completa."
          hitSlop={8}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default AIInsight;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: `${Colors.info}35`,
  },
  header: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.info,
    marginBottom: Spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: `${Colors.info}18`,
  },
  buttonText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.info,
  },
});
