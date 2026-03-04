// ============================================================
// VYRA FITNESS — Badge
// Badges de rareza, status chips, tags de módulo
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';

export type BadgeVariant =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'premium'
  | 'free'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'module';

interface BadgeProps {
  children:    React.ReactNode;
  variant?:    BadgeVariant;
  color?:      string;             // Color personalizado (para módulos)
  small?:      boolean;
  icon?:       string;             // Emoji antes del texto
  style?:      ViewStyle;
  dot?:        boolean;            // Solo un punto de color (notif dot)
}

export default function Badge({
  children,
  variant = 'info',
  color,
  small   = false,
  icon,
  style,
  dot     = false,
}: BadgeProps) {
  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: color ?? badgeConfig[variant].bg },
          style,
        ]}
      />
    );
  }

  const config = badgeConfig[variant];
  const bg     = color ? `${color}22` : config.bg;
  const fg     = color ?? config.fg;

  return (
    <View
      style={[
        styles.base,
        small ? styles.small : styles.normal,
        { backgroundColor: bg },
        style,
      ]}
    >
      {icon && (
        <Text style={[styles.icon, small ? styles.iconSmall : {}]}>{icon}</Text>
      )}
      <Text
        style={[
          styles.text,
          small ? styles.textSmall : {},
          { color: fg },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const badgeConfig: Record<BadgeVariant, { bg: string; fg: string }> = {
  common:    { bg: `${Colors.rarityCommon}22`,    fg: Colors.rarityCommon    },
  rare:      { bg: `${Colors.rarityRare}22`,      fg: Colors.rarityRare      },
  epic:      { bg: `${Colors.rarityEpic}22`,      fg: Colors.rarityEpic      },
  legendary: { bg: `${Colors.rarityLegendary}22`, fg: Colors.rarityLegendary },
  premium:   { bg: Colors.premiumBg,              fg: Colors.premium         },
  free:      { bg: Colors.bgElevated,             fg: Colors.textSecondary   },
  success:   { bg: Colors.successBg,              fg: Colors.success         },
  error:     { bg: Colors.errorBg,                fg: Colors.error           },
  warning:   { bg: Colors.warningBg,              fg: Colors.warning         },
  info:      { bg: Colors.infoBg,                 fg: Colors.info            },
  module:    { bg: Colors.brandLight + '22',      fg: Colors.brandLight      },
};

const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   Radius.full,
    alignSelf:      'flex-start',
  },
  normal: {
    paddingVertical:   Spacing[1],
    paddingHorizontal: Spacing[2.5],
  },
  small: {
    paddingVertical:   2,
    paddingHorizontal: Spacing[2],
  },
  text: {
    fontFamily: FontFamily.semibold,
    fontSize:   FontSize.xs,
  },
  textSmall: {
    fontSize: 10,
  },
  icon: {
    fontSize:    FontSize.xs,
    marginRight: 3,
  },
  iconSmall: {
    fontSize: 10,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
});