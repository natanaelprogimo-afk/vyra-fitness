// ============================================================
// VYRA FITNESS — CoinBadge
// Muestra el balance de VyraCoins con animación al sumar
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';

interface CoinBadgeProps {
  amount:   number;
  earned?:  number;              // Si se especifica, muestra "+N" animado
  size?:    'sm' | 'md' | 'lg';
  style?:   ViewStyle;
  showIcon?:boolean;
}

export default function CoinBadge({
  amount,
  earned,
  size    = 'md',
  style,
  showIcon = true,
}: CoinBadgeProps) {
  const scale     = useSharedValue(1);
  const earnedOp  = useSharedValue(0);
  const earnedY   = useSharedValue(0);

  useEffect(() => {
    if (!earned) return;
    // Pulse en el badge principal
    scale.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 300 }),
      withSpring(1,    { damping: 12, stiffness: 200 })
    );
    // Animación del "+N"
    earnedOp.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 350 })
    );
    earnedY.value = withSequence(
      withTiming(0,   { duration: 0 }),
      withTiming(-24, { duration: 1000 }),
    );
  }, [earned]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const earnedStyle = useAnimatedStyle(() => ({
    opacity:   earnedOp.value,
    transform: [{ translateY: earnedY.value }],
  }));

  const sz = sizeConfig[size];

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={[styles.badge, sz.badge, badgeStyle]}>
        {showIcon && <Text style={[styles.icon, sz.icon]}>🪙</Text>}
        <Text style={[styles.amount, sz.text]}>{amount.toLocaleString('es')}</Text>
      </Animated.View>

      {earned ? (
        <Animated.Text style={[styles.earned, earnedStyle]}>
          +{earned}🪙
        </Animated.Text>
      ) : null}
    </View>
  );
}

// ─── Versión inline (para usar dentro de texto) ──────────────
export function InlineCoin({ amount }: { amount: number }) {
  return (
    <Text style={styles.inline}>
      {amount}🪙
    </Text>
  );
}

const sizeConfig = {
  sm: {
    badge: { paddingVertical: 2, paddingHorizontal: Spacing[2], gap: 2 },
    icon:  { fontSize: 10 },
    text:  { fontSize: FontSize.xs },
  },
  md: {
    badge: { paddingVertical: Spacing[1], paddingHorizontal: Spacing[2.5], gap: 4 },
    icon:  { fontSize: FontSize.sm },
    text:  { fontSize: FontSize.sm },
  },
  lg: {
    badge: { paddingVertical: Spacing[1.5], paddingHorizontal: Spacing[3], gap: 6 },
    icon:  { fontSize: FontSize.base },
    text:  { fontSize: FontSize.lg },
  },
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  badge: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.coinsBg,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     Colors.coins + '44',
  },
  icon: {
    fontSize: FontSize.sm,
  },
  amount: {
    fontFamily: FontFamily.bold,
    color:      Colors.coins,
  },
  earned: {
    position:   'absolute',
    right:      0,
    top:        -8,
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.sm,
    color:      Colors.coins,
  },
  inline: {
    fontFamily: FontFamily.semibold,
    fontSize:   FontSize.sm,
    color:      Colors.coins,
  },
});