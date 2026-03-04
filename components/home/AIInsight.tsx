// ============================================================
// VYRA FITNESS — AIInsight
// Card con insight del coach IA basado en datos del día
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

interface AIInsightProps {
  insight?: string | null;
}

export const AIInsight = ({ insight }: AIInsightProps) => {
  if (!insight) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💡 Coach IA</Text>
      <Text style={styles.text}>{insight}</Text>
    </View>
  );
};

export default AIInsight;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand,
  },
  header: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
    textTransform: 'uppercase',
  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
