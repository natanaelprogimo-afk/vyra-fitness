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
  skipLabel?: string;
  skipHint?: string;
  onSkip?: () => void;
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
  skipLabel = 'Omitir',
  skipHint,
  onSkip,
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
        <View style={styles.progressRow}>
          <View style={styles.progressCopy}>
            <Text style={styles.progressLabel}>{meta?.blockLabel ?? 'Configurando Vyra'}</Text>
            <OnboardingProgress pathname={pathname} />
          </View>
          {onSkip ? (
            <Pressable
              onPress={onSkip}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel={skipLabel}
            >
              <Text style={styles.skipText}>{skipLabel}</Text>
            </Pressable>
          ) : null}
        </View>
        {skipHint ? <Text style={styles.skipHint}>{skipHint}</Text> : null}
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  progressCopy: {
    flex: 1,
    gap: Spacing[2],
  },
  progressLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  skipButton: {
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.22),
    backgroundColor: withOpacity(Colors.action, 0.08),
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.action,
  },
  skipHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
    maxWidth: 320,
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
