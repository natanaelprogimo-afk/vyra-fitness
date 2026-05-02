import React from 'react';
import { StyleSheet, Text, type ViewStyle } from 'react-native';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

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
    <Card style={[styles.card, style]} shadow={false}>
      <Text style={[styles.value, { color: accentColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {note ? (
        <Text style={styles.note} numberOfLines={3}>
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
    gap: Spacing[1],
  },
  value: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['2xl'],
    letterSpacing: -1.4,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
