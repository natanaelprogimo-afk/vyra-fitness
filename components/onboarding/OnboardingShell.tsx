import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import OnboardingProgress from '@/components/system/OnboardingProgress';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { getOnboardingStepMeta, ONBOARDING_STEPS } from '@/constants/onboardingFlow';

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
  const stepLabel = meta ? `Paso ${meta.order} de ${ONBOARDING_STEPS.length}` : null;

  return (
    <SafeScreen
      scrollable={false}
      padBottom
      disableAtmosphere
      contentStyle={contentStyle ? { ...styles.content, ...contentStyle } : styles.content}
    >
      <View style={styles.topRail}>
        <View style={styles.progressRow}>
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
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <View style={styles.progressCopy}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{meta?.blockLabel ?? 'Configurando Vyra'}</Text>
              {stepLabel ? (
                <Text
                  style={styles.progressStep}
                  accessibilityLiveRegion="polite"
                  accessible={true}
                >
                  {stepLabel}
                </Text>
              ) : null}
            </View>
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
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>
        {skipHint ? <Text style={styles.skipHint}>{skipHint}</Text> : null}
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <View style={styles.titleWrap}>
          {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View
        style={styles.bodyRegion}
        accessible={true}
        accessibilityLabel={`${eyebrow}: ${typeof title === 'string' ? title : ''}`}
      >
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            <View style={styles.body}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.body}>{children}</View>
        )}
      </View>

      {footer ? <View style={styles.footerPinned}>{footer}</View> : null}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing[4],
    paddingTop: Spacing[1],
    paddingBottom: Spacing[6],
  },
  topRail: {
    gap: Spacing[1.5],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  progressCopy: {
    flex: 1,
    gap: Spacing[1.5],
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  progressLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  progressStep: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  skipButton: {
    minHeight: 32,
    paddingHorizontal: Spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipPlaceholder: {
    width: 30,
  },
  skipText: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  skipHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
    maxWidth: 320,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  header: {
    gap: Spacing[1.5],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  titleWrap: {
    gap: Spacing[1],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    maxWidth: 360,
  },
  body: {
    gap: Spacing[2.5],
  },
  bodyRegion: {
    flex: 1,
    minHeight: 0,
  },
  scrollBody: {
    flexGrow: 1,
    paddingBottom: Spacing[8],
  },
  footerPinned: {
    gap: Spacing[2],
    paddingBottom: Spacing[5],
  },
});
