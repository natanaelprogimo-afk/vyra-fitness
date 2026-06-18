// REDESIGNED: 2026-05-20 - header is tighter, calmer, and more consistent
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, withOpacity } from '@/constants/colors';
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
  const useDisplayTitle = displayTitle ?? false;
  const resolvedColor = color ?? Colors.textPrimary;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            accessibilityHint={backHint}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <View
        style={[
          styles.titleWrap,
          titleAlign === 'center' ? styles.titleCenter : styles.titleLeft,
        ]}
      >
        {eyebrow ? (
          <Text style={styles.eyebrow} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {eyebrow}
          </Text>
        ) : null}

        {title ? (
          <Text
            style={[
              useDisplayTitle ? styles.titleDisplay : styles.title,
              { color: resolvedColor },
              titleAlign === 'center' ? styles.centeredText : null,
            ]}
            numberOfLines={titleAlign === 'center' ? 1 : 2}
            ellipsizeMode="middle"
            accessibilityRole="header"
            maxFontSizeMultiplier={1.25}
          >
            {title}
          </Text>
        ) : null}

        {subtitle ? (
          <Text
            style={[styles.subtitle, titleAlign === 'center' ? styles.centeredText : null]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>{rightEl}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: ComponentHeight.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[1],
    gap: Spacing[2],
  },
  side: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleLeft: {
    alignItems: 'flex-start',
  },
  titleCenter: {
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  titleDisplay: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xl,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  eyebrow: {
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  centeredText: {
    textAlign: 'center',
  },
});

export { Header };
