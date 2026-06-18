import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  copy: {
    flex: 1,
    gap: Spacing[1],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});

