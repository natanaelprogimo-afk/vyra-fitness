// ============================================================
// VYRA FITNESS — EmptyState
// Pantalla vacía con ilustración emoji, título y CTA
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';
import Button from './Button';

interface EmptyStateProps {
  emoji?:      string;
  icon?:       string;
  title:       string;
  description?: string;
  subtitle?:   string;
  ctaLabel?:   string;
  label?:      string;
  onCta?:      () => void;
  onPress?:    () => void;
  style?:      ViewStyle;
  compact?:    boolean;
}

export default function EmptyState({
  emoji,
  icon,
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
  const displayEmoji = emoji ?? icon;
  const displayText = subtitle ?? description;
  const displayLabel = ctaLabel ?? label;
  const handlePress = onCta ?? onPress;

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      {displayEmoji && <Text style={[styles.emoji, compact && styles.emojiCompact]}>{displayEmoji}</Text>}
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {displayText && (
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
          {displayText}
        </Text>
      )}
      {displayLabel && handlePress && (
        <Button
          onPress={handlePress}
          variant="primary"
          style={compact ? { ...styles.cta, ...styles.ctaCompact } : styles.cta}
          size={compact ? 'sm' : 'md'}
          label={displayLabel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    paddingVertical:   Spacing[12],
  },
  compact: {
    paddingVertical:   Spacing[8],
    paddingHorizontal: Spacing[4],
  },
  emoji: {
    fontSize:     64,
    marginBottom: Spacing[5],
  },
  emojiCompact: {
    fontSize:     40,
    marginBottom: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.xl,
    color:      Colors.textPrimary,
    textAlign:  'center',
    marginBottom: Spacing[2],
  },
  titleCompact: {
    fontSize: FontSize.lg,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.base,
    color:      Colors.textSecondary,
    textAlign:  'center',
    lineHeight: FontSize.base * 1.5,
  },
  subtitleCompact: {
    fontSize: FontSize.sm,
  },
  cta: {
    marginTop: Spacing[6],
    minWidth:  180,
  },
  ctaCompact: {
    marginTop: Spacing[4],
    minWidth:  140,
  },
});