import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

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
  accentColor = Colors.brand,
  onPress,
}: LinkRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={description ?? hint}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>

      <View style={styles.meta}>
        {hint ? <Text style={[styles.hint, { color: accentColor }]}>{hint}</Text> : null}
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={16} color={accentColor} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    minHeight: 56,
    paddingVertical: Spacing[3],
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  hint: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
});

