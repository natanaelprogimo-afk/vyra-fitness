import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/theme';

interface BadgeGlyphProps {
  label: string;
  size?: number;
  accent?: string;
  locked?: boolean;
}

export default function BadgeGlyph({
  label,
  size = 44,
  accent = Colors.coins,
  locked = false,
}: BadgeGlyphProps) {
  const rawLabel = String(label || 'BDG').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const numbers = rawLabel.replace(/[^0-9]/g, '');
  const safeLabel = (numbers || rawLabel || 'BD').slice(0, numbers ? 3 : 2);
  const shell = locked ? Colors.surface3 : `${accent}20`;
  const rim = locked ? Colors.border : `${accent}70`;
  const center = locked ? Colors.surface2 : `${accent}16`;
  const textColor = locked ? Colors.textSecondary : accent;
  const iconName = locked ? 'lock-closed' : 'medal';
  const badgeSize = Math.max(18, Math.round(size * 0.3));
  const ribbonWidth = Math.max(18, Math.round(size * 0.46));
  const ribbonHeight = Math.max(8, Math.round(size * 0.16));

  return (
    <View style={[styles.wrap, { width: size, height: size + Math.max(8, size * 0.08) }]}>
      <View
        style={[
          styles.shell,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: shell,
            borderColor: rim,
          },
        ]}
      >
        <View
          style={[
            styles.halo,
            {
              width: size * 0.84,
              height: size * 0.84,
              borderRadius: size / 2,
              backgroundColor: locked ? 'rgba(255,255,255,0.03)' : `${accent}12`,
            },
          ]}
        />
        <View
          style={[
            styles.core,
            {
              width: size * 0.72,
              height: size * 0.72,
              borderRadius: size / 2.4,
              backgroundColor: center,
              borderColor: locked ? 'rgba(255,255,255,0.08)' : `${accent}44`,
            },
          ]}
        >
          <Ionicons name={iconName} size={badgeSize} color={textColor} />
          {!locked ? (
            <Text style={[styles.text, { color: textColor, fontSize: Math.max(10, size * 0.2) }]}>
              {safeLabel}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.ribbon,
          {
            width: ribbonWidth,
            height: ribbonHeight,
            borderRadius: ribbonHeight / 2,
            backgroundColor: locked ? Colors.surface3 : `${accent}E6`,
            bottom: 0,
          },
        ]}
      />
      <View
        style={[
          styles.ribbonShadow,
          {
            width: ribbonWidth - 6,
            height: Math.max(4, ribbonHeight - 4),
            borderRadius: Math.max(4, ribbonHeight / 2),
            bottom: 2,
          },
        ]}
      />

      {locked ? (
        <View style={[styles.lockDot, { backgroundColor: Colors.surface1, borderColor: rim }]}>
          <Ionicons name="lock-closed" size={10} color={Colors.textSecondary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    opacity: 0.95,
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  text: {
    fontFamily: FontFamily.bold,
    letterSpacing: 0.4,
  },
  ribbon: {
    position: 'absolute',
    opacity: 0.95,
  },
  ribbonShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.16)',
    opacity: 0.9,
  },
  lockDot: {
    position: 'absolute',
    top: 2,
    right: 1,
    width: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
