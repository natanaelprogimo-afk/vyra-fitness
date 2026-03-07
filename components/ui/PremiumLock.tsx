// ============================================================
// VYRA FITNESS — PremiumLock
// Overlay para features Premium. Muestra el paywall al tocar.
// ============================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { trackPaywallViewed } from '@/lib/analytics';
import type { PaywallTrigger } from '@/types/navigation';

interface PremiumLockProps {
  feature:     string;             // Nombre legible de la feature
  trigger?:    PaywallTrigger;
  children?:   React.ReactNode;   // Contenido a bloquear (se muestra difuminado)
  style?:      ViewStyle;
  compact?:    boolean;            // Versión inline pequeña
}

export default function PremiumLock({
  feature,
  trigger  = 'feature_lock',
  children,
  style,
  compact  = false,
}: PremiumLockProps) {
  const profile = useAuthStore((s) => s.profile);
  const isPremium = (() => {
    const p = profile;
    if (!p) return false;
    if (!p.is_premium) return false;
    if (!p.premium_expires_at) return true;
    return new Date(p.premium_expires_at) > new Date();
  })();

  // Si es Premium, renderizar directamente
  if (isPremium) return <>{children}</>;

  const handlePress = () => {
    trackPaywallViewed(trigger);
    router.push({ pathname: '/premium/paywall', params: { trigger } } as any);
  };

  if (compact) {
    return (
      <Pressable onPress={handlePress} style={[styles.compact, style]}>
        <Text style={styles.compactIcon}>💎</Text>
        <Text style={styles.compactText}>Premium</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      {/* Contenido difuminado detrás */}
      {children && (
        <View style={styles.blurred} pointerEvents="none">
          {children}
        </View>
      )}

      {/* Overlay */}
      <Pressable onPress={handlePress} style={styles.overlay}>
        <View style={styles.lockCard}>
          <Text style={styles.lockIcon}>💎</Text>
          <Text style={styles.lockTitle}>Feature Premium</Text>
          <Text style={styles.lockFeature}>{feature}</Text>
          <Text style={styles.lockCta}>Probalo 7 días gratis →</Text>
        </View>
      </Pressable>
    </View>
  );
}

// ─── Hook helper para verificar premium rápido ───────────────

export function usePremiumGate(trigger: PaywallTrigger = 'feature_lock') {
  const profile = useAuthStore((s) => s.profile);
  const isPremium = (() => {
    const p = profile;
    if (!p) return false;
    if (!p.is_premium) return false;
    if (!p.premium_expires_at) return true;
    return new Date(p.premium_expires_at) > new Date();
  })();

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
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,10,30,0.7)',
    borderRadius:   Radius.xl,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
  },
  lockCard: {
    alignItems:      'center',
    backgroundColor: Colors.bgElevated,
    borderRadius:    Radius.xl,
    padding:         Spacing[5],
    borderWidth:     1,
    borderColor:     Colors.coins + '44',
    minWidth:        200,
  },
  lockIcon: {
    fontSize:     40,
    marginBottom: Spacing[2],
  },
  lockTitle: {
    fontFamily:   FontFamily.semibold,
    fontSize:     FontSize.xs,
    color:        Colors.premium,
    letterSpacing:1,
    textTransform:'uppercase',
    marginBottom: Spacing[1],
  },
  lockFeature: {
    fontFamily:   FontFamily.bold,
    fontSize:     FontSize.base,
    color:        Colors.textPrimary,
    textAlign:    'center',
    marginBottom: Spacing[4],
  },
  lockCta: {
    fontFamily:   FontFamily.semibold,
    fontSize:     FontSize.sm,
    color:        Colors.coins,
  },
  // Compact
  compact: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.premiumBg,
    borderRadius:    Radius.full,
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2.5],
    gap:             Spacing[1],
  },
  compactIcon: {
    fontSize: 12,
  },
  compactText: {
    fontFamily: FontFamily.semibold,
    fontSize:   10,
    color:      Colors.premium,
  },
});