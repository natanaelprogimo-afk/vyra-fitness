import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { trackPaywallViewed } from '@/lib/analytics';
import type { PaywallTrigger } from '@/types/navigation';

interface PremiumLockProps {
  feature: string;
  trigger?: PaywallTrigger;
  children?: React.ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}

function hasPremiumAccess(profile: ReturnType<typeof useAuthStore.getState>['profile']) {
  if (!profile?.is_premium) return false;
  if (!profile.premium_expires_at) return true;
  return new Date(profile.premium_expires_at) > new Date();
}

export default function PremiumLock({
  feature,
  trigger = 'feature_lock',
  children,
  style,
  compact = false,
}: PremiumLockProps) {
  const profile = useAuthStore((state) => state.profile);
  const isPremium = hasPremiumAccess(profile);

  if (isPremium) return <>{children}</>;

  const handlePress = () => {
    trackPaywallViewed(trigger);
    router.push({ pathname: '/premium/paywall', params: { trigger } } as any);
  };

  if (compact) {
    return (
      <Pressable onPress={handlePress} style={[styles.compact, style]}>
        <Text style={styles.compactIcon}>PRO</Text>
        <Text style={styles.compactText}>Premium</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      {children ? (
        <View style={styles.blurred} pointerEvents="none">
          {children}
        </View>
      ) : null}

      <Pressable onPress={handlePress} style={styles.overlay}>
        <View style={styles.lockCard}>
          <Text style={styles.lockIcon}>PRO</Text>
          <Text style={styles.lockTitle}>Feature Premium</Text>
          <Text style={styles.lockFeature}>{feature}</Text>
          <Text style={styles.lockCta}>{'Activa Premium con PayPal ->'}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export function usePremiumGate(trigger: PaywallTrigger = 'feature_lock') {
  const profile = useAuthStore((state) => state.profile);
  const isPremium = hasPremiumAccess(profile);

  const requirePremium = (onAllowed: () => void) => {
    if (isPremium) {
      onAllowed();
      return;
    }
    trackPaywallViewed(trigger);
    router.push({ pathname: '/premium/paywall', params: { trigger } } as any);
  };

  return { isPremium, requirePremium };
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.xl,
  },
  blurred: {
    opacity: 0.15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,10,30,0.7)',
    borderRadius: Radius.xl,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
  },
  lockCard: {
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: Colors.actionBorder,
    minWidth: 200,
  },
  lockIcon: {
    fontSize: 28,
    marginBottom: Spacing[2],
    color: Colors.action,
    fontFamily: FontFamily.bold,
  },
  lockTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.premium,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing[1],
  },
  lockFeature: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  lockCta: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.action,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premiumBg,
    borderRadius: Radius.full,
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2.5],
    gap: Spacing[1],
  },
  compactIcon: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.premium,
  },
  compactText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
});
