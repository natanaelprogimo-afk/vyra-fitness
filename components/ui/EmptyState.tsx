// REDESIGNED: 2026-05-21 - empty states are lighter, shorter, and more contextual
import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import Button from './Button';

interface EmptyStateProps {
  emoji?: string;
  icon?: string;
  eyebrow?: string;
  tone?: 'neutral' | 'brand' | 'premium' | 'warning' | 'success';
  title: string;
  description?: string;
  subtitle?: string;
  ctaLabel?: string;
  label?: string;
  onCta?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

const TONE_ACCENTS = {
  neutral: Colors.textMuted,
  brand: Colors.info,
  premium: Colors.premium,
  warning: Colors.warning,
  success: Colors.success,
} as const;

export default function EmptyState({
  emoji,
  icon,
  eyebrow,
  tone = 'neutral',
  title,
  subtitle,
  description,
  ctaLabel,
  label,
  onCta,
  onPress,
  style,
  compact = false,
}: EmptyStateProps) {
  const displayToken = emoji ?? icon;
  const displayText = subtitle ?? description;
  const displayLabel = ctaLabel ?? label;
  const handlePress = onCta ?? onPress;
  const accent = TONE_ACCENTS[tone];

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {displayToken ? (
        <View style={[styles.iconWrap, compact && styles.iconWrapCompact, { backgroundColor: withOpacity(accent, 0.12), borderColor: withOpacity(accent, 0.2) }]}>
          <Text style={[styles.iconToken, compact && styles.iconTokenCompact, { color: accent }]}>
            {displayToken}
          </Text>
        </View>
      ) : null}

      {eyebrow ? (
        <Text style={styles.eyebrow} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {eyebrow}
        </Text>
      ) : null}

      <Text
        style={[styles.title, compact && styles.titleCompact]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.2}
      >
        {title}
      </Text>

      {displayText ? (
        <Text
          style={[styles.body, compact && styles.bodyCompact]}
          numberOfLines={compact ? 2 : 2}
          maxFontSizeMultiplier={1.2}
        >
          {displayText}
        </Text>
      ) : null}

      {displayLabel && handlePress ? (
        <Button
          onPress={handlePress}
          variant="secondary"
          color={accent}
          size={compact ? 'sm' : 'md'}
          style={compact ? [styles.cta, styles.ctaCompact] : styles.cta}
        >
          {displayLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 240,
    maxHeight: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[8],
  },
  containerCompact: {
    minHeight: 180,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[5],
  },
  iconWrap: {
    minWidth: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
  },
  iconWrapCompact: {
    minWidth: 56,
    height: 56,
    borderRadius: Radius.lg,
    marginBottom: Spacing[3],
  },
  iconToken: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    lineHeight: 18,
    textAlign: 'center',
  },
  iconTokenCompact: {
    fontSize: FontSize.sm,
  },
  eyebrow: {
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing[1],
    textAlign: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  titleCompact: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  body: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
  bodyCompact: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  cta: {
    marginTop: Spacing[5],
    minWidth: 172,
  },
  ctaCompact: {
    marginTop: Spacing[4],
    minWidth: 136,
  },
});
