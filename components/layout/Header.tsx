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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { ComponentHeight, FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';

interface HeaderProps {
  eyebrow?:    string;
  title?:      string;
  subtitle?:   string;
  showBack?:   boolean;
  displayTitle?: boolean;
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
  displayTitle,
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
  const useDisplayTitle = displayTitle ?? (typeof title === 'string' && title.length <= 16);

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
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
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
            style={[
              styles.title,
              useDisplayTitle ? styles.titleDisplay : styles.titleDefault,
              color ? { color } : {},
            ]}
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
    alignItems:     'flex-end',
    minHeight:      ComponentHeight.header + 14,
    paddingHorizontal: Spacing[5],
    paddingBottom:  Spacing[3],
  },
  side: {
    minWidth:       48,
    flexBasis:      48,
    alignItems:     'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
    maxWidth: 120,
    flexShrink: 1,
  },
  backBtn: {
    width:           42,
    height:          42,
    borderRadius:    Radius.full,
    backgroundColor: Colors.bgElevated,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
  },
  titleContainer: {
    flex:    1,
    paddingHorizontal: Spacing[3],
    gap: 2,
  },
  titleCenter: {
    alignItems: 'center',
  },
  title: {
    color:      Colors.textPrimary,
  },
  titleDisplay: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 30,
    letterSpacing: 1.8,
  },
  titleDefault: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.xs,
    color:      Colors.textSecondary,
    marginTop:  1,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
});

export { Header };
