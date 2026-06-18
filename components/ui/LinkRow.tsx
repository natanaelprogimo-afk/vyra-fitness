// REDESIGNED: 2026-05-21 - link rows are denser and closer to settings canon
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { triggerImpactHaptic } from '@/lib/haptics';

interface LinkRowProps {
  label: string;
  description?: string;
  hint?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  accentColor?: string;
  onPress: () => void;
}

export default function LinkRow({
  label,
  description,
  hint,
  icon = 'chevron-forward',
  accentColor = Colors.info,
  onPress,
}: LinkRowProps) {
  return (
    <Pressable
      onPress={() => {
        void triggerImpactHaptic('light');
        onPress();
      }}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.rowPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={description ?? hint}
    >
      <View style={[styles.iconShell, { backgroundColor: withOpacity(accentColor, 0.12) }]}>
        <Ionicons name="ellipse" size={10} color={accentColor} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2} maxFontSizeMultiplier={1.2}>
            {description}
          </Text>
        ) : null}
      </View>

      <View style={styles.meta}>
        {hint ? (
          <Text style={[styles.hint, { color: Colors.textMuted }]} numberOfLines={1} maxFontSizeMultiplier={1.1}>
            {hint}
          </Text>
        ) : null}
        <Ionicons name={icon} size={16} color={accentColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[1],
    borderRadius: Radius.lg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  description: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexShrink: 0,
  },
  hint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
});
