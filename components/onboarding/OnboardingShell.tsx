import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import OnboardingProgress from '@/components/system/OnboardingProgress';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';

interface OnboardingShellProps {
  pathname: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
}

export default function OnboardingShell({
  pathname,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  contentStyle,
  scrollable = true,
}: OnboardingShellProps) {
  return (
    <SafeScreen
      scrollable={scrollable}
      stickyHeaderIndices={scrollable ? [0] : undefined}
      padBottom
      contentStyle={contentStyle ? { ...styles.content, ...contentStyle } : styles.content}
    >
      <View style={styles.progressSticky}>
        <OnboardingProgress pathname={pathname} />
      </View>

      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace(Routes.auth.register as any);
        }}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <View style={styles.titleWrap}>{typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}</View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  progressSticky: {
    backgroundColor: Colors.bgPrimary,
    paddingBottom: Spacing[2],
    zIndex: 2,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: Spacing[2],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.brandLight,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  titleWrap: {
    gap: Spacing[1],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    lineHeight: 40,
    color: Colors.textPrimary,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    maxWidth: 320,
  },
  body: {
    gap: Spacing[4],
  },
  footer: {
    gap: Spacing[3],
  },
});
