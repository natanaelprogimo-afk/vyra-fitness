// REDESIGNED: 2026-05-21 - metric cards are denser and closer to dashboard patterns
import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface MetricCardProps {
  value: string | number;
  label: string;
  note?: string;
  accentColor?: string;
  style?: ViewStyle;
}

export default function MetricCard({
  value,
  label,
  note,
  accentColor = Colors.textPrimary,
  style,
}: MetricCardProps) {
  return (
    <Card variant="metric" style={[styles.card, style]} shadow={false}>
      <View style={styles.topRow}>
        <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
        <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
      </View>

      <Text
        style={[styles.value, { color: accentColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        maxFontSizeMultiplier={1.15}
      >
        {value}
      </Text>

      {note ? (
        <Text style={styles.note} numberOfLines={3} maxFontSizeMultiplier={1.2}>
          {note}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    gap: Spacing[2],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  label: {
    flex: 1,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    opacity: 0.85,
  },
  value: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['2xl'],
    lineHeight: 34,
    letterSpacing: -0.8,
  },
  note: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
