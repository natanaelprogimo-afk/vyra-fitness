// ============================================================
// VYRA FITNESS - Header
// Header de navegacion con back button, titulo y accion derecha
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
import { Colors } from '@/constants/colors';
import { ComponentHeight, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { triggerImpactHaptic } from '@/lib/haptics';

interface HeaderProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  displayTitle?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  titleAlign?: 'left' | 'center';
  color?: string;
  backLabel?: string;
  backHint?: string;
}

export default function Header({
  eyebrow,
  title,
  subtitle,
  showBack = true,
  displayTitle,
  onBack,
  rightAction,
  rightElement,
  style,
  titleAlign = 'left',
  color,
  backLabel = 'Volver',
  backHint = 'Regresa a la pantalla anterior',
}: HeaderProps) {
  const handleBack = () => {
    void triggerImpactHaptic('light');
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) router.back();
  };

  const rightEl = rightElement ?? rightAction;
  const useDisplayTitle = displayTitle ?? (typeof title === 'string' && title.length <= 16);
  const titleLines = rightEl ? 1 : useDisplayTitle ? 1 : 2;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            accessibilityHint={backHint}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.titleContainer, titleAlign === 'center' && styles.titleCenter]}>
        {eyebrow ? (
          <Text
            style={[styles.eyebrow, { color: color ?? Colors.textSecondary }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {eyebrow}
          </Text>
        ) : null}

        {title ? (
          <Text
            style={[
              styles.title,
              useDisplayTitle ? styles.titleDisplay : styles.titleDefault,
              { color: color ?? Colors.textPrimary },
            ]}
            numberOfLines={titleLines}
            ellipsizeMode="tail"
            accessibilityRole="header"
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
        ) : null}

        {subtitle ? (
          <Text
            style={styles.subtitle}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, rightEl ? styles.sideRight : styles.sideSpacer]}>
        {rightEl}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: ComponentHeight.header + 14,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
  },
  side: {
    minWidth: 48,
    flexBasis: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
    maxWidth: 120,
    flexShrink: 1,
  },
  sideSpacer: {
    minWidth: 8,
    flexBasis: 8,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border2,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: Spacing[3],
    gap: 2,
  },
  titleCenter: {
    alignItems: 'center',
  },
  title: {},
  titleDisplay: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    lineHeight: 32,
    letterSpacing: 1.8,
  },
  titleDefault: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 1,
    color: Colors.textSecondary,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
});

export { Header };
