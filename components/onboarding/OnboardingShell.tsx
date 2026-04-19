import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import OnboardingProgress from '@/components/system/OnboardingProgress';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { getOnboardingStepMeta } from '@/constants/onboardingFlow';

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
  const meta = getOnboardingStepMeta(pathname);
  const shouldShowBack = (meta?.order ?? 99) > 1;

  return (
    <SafeScreen
      scrollable={scrollable}
      padBottom
      contentStyle={contentStyle ? { ...styles.content, ...contentStyle } : styles.content}
    >
      <View style={styles.topRail}>
        <OnboardingProgress pathname={pathname} />
      </View>

      {shouldShowBack ? (
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace(Routes.auth.welcome as never);
          }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
        </Pressable>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <View style={styles.titleWrap}>
          {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[6],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
  },
  topRail: {
    gap: Spacing[3],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: Spacing[2],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  titleWrap: {
    gap: Spacing[1],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 38,
    color: Colors.textPrimary,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
    maxWidth: 340,
  },
  body: {
    gap: Spacing[4],
  },
  footer: {
    gap: Spacing[3],
    marginTop: 'auto',
  },
});
