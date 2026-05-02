import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface SettingToggleRowProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accentColor?: string;
  icon?: React.ReactNode;
}

export default function SettingToggleRow({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  accentColor = Colors.brand,
  icon,
}: SettingToggleRowProps) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) onValueChange(!value);
      }}
      style={[styles.row, disabled && styles.rowDisabled]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={title}
      accessibilityHint={description}
      disabled={disabled}
    >
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View
        style={[
          styles.track,
          value && {
            justifyContent: 'flex-end',
            borderColor: withOpacity(accentColor, 0.42),
            backgroundColor: withOpacity(accentColor, 0.18),
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            value ? { backgroundColor: accentColor } : styles.thumbInactive,
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 56,
    paddingVertical: Spacing[2],
  },
  rowDisabled: {
    opacity: 0.55,
  },
  iconSlot: {
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  track: {
    width: 52,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border2,
    backgroundColor: Colors.bgElevated,
    padding: 3,
    justifyContent: 'flex-start',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.textPrimary,
  },
  thumbInactive: {
    backgroundColor: Colors.textMuted,
  },
});
