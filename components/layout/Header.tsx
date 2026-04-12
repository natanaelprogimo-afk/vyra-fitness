// ============================================================
// VYRA FITNESS — Header
// Header de navegación con back button, título y acción derecha
// ============================================================

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';

interface HeaderProps {
  eyebrow?:    string;
  title?:      string;
  subtitle?:   string;
  showBack?:   boolean;
  onBack?:     () => void;
  rightAction?:React.ReactNode;
  rightElement?: React.ReactNode;
  style?:      ViewStyle;
  titleAlign?: 'left' | 'center';
  color?:      string;             // color del título (para módulos)
}

export default function Header({
  eyebrow,
  title,
  subtitle,
  showBack    = true,
  onBack,
  rightAction,
  rightElement,
  style,
  titleAlign  = 'left',
  color,
}: HeaderProps) {
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onBack) { onBack(); return; }
    if (router.canGoBack()) router.back();
  };

  const rightEl = rightElement ?? rightAction;

  return (
    <View style={[styles.container, style]}>
      {/* Left — Back button */}
      <View style={styles.side}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        )}
      </View>

      {/* Center — Title */}
      <View style={[styles.titleContainer, titleAlign === 'center' && styles.titleCenter]}>
        {eyebrow && (
          <Text style={[styles.eyebrow, color ? { color } : {}]} numberOfLines={1}>{eyebrow}</Text>
        )}
        {title && (
          <Text
            style={[styles.title, color ? { color } : {}]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right — Action */}
      <View style={[styles.side, styles.sideRight]}>
        {rightEl}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'center',
    height:         56,
    paddingHorizontal: Spacing[1],
  },
  side: {
    width:          56,
    alignItems:     'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.bgElevated,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  backIcon: {
    fontSize:   FontSize.lg,
    color:      Colors.textPrimary,
    lineHeight: FontSize.lg * 1.2,
  },
  titleContainer: {
    flex:    1,
    paddingHorizontal: Spacing[2],
  },
  titleCenter: {
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.xl,
    color:      Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.sm,
    color:      Colors.textSecondary,
    marginTop:  1,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
});

export { Header };