// ============================================================
// VYRA FITNESS — Skeleton
// Placeholder de carga con efecto shimmer usando Reanimated
// ============================================================

import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/theme';

interface SkeletonProps {
  width?:       number | `${number}%`;
  height?:      number;
  radius?:      number;
  borderRadius?: number;  // alias for radius
  style?:       ViewStyle;
  circle?:      boolean;
}

export function Skeleton({
  width           = '100%',
  height          = 16,
  radius,
  borderRadius,
  style,
  circle          = false,
}: SkeletonProps) {
  const finalRadius = radius ?? borderRadius ?? Radius.md;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.4, 0.8, 0.4]),
  }));

  const size = circle ? height : undefined;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width:        circle ? size : width,
          height:       height,
          borderRadius: circle ? height / 2 : finalRadius,
        },
        animStyle,
        style,
      ]}
    />
  );
}

// ─── Skeleton compuestos para módulos ────────────────────────

export function CardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Skeleton circle height={40} />
        <View style={styles.cardTitleGroup}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={10} style={{ marginTop: 6 }} />
        </View>
      </View>
      <Skeleton height={80} style={{ marginTop: 12 }} />
    </View>
  );
}

export function StatSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.stat, style]}>
      <Skeleton width={48} height={48} circle />
      <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="50%" height={10} style={{ marginTop: 4 }} />
    </View>
  );
}

export function ListSkeleton({ count = 3, style }: { count?: number; style?: ViewStyle }) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton circle height={44} />
          <View style={styles.listContent}>
            <Skeleton width="65%" height={14} />
            <Skeleton width="45%" height={10} style={{ marginTop: 5 }} />
          </View>
          <Skeleton width={48} height={24} radius={Radius.full} />
        </View>
      ))}
    </View>
  );
}

export function DailyScoreSkeleton() {
  return (
    <View style={styles.scoreContainer}>
      <Skeleton circle height={120} />
      <Skeleton width="50%" height={16} style={{ marginTop: 12, alignSelf: 'center' }} />
      <View style={styles.scoreDetails}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width="16%" height={8} radius={Radius.full} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.bgElevated,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius.xl,
    padding:         16,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  cardTitleGroup: {
    flex: 1,
  },
  stat: {
    alignItems: 'center',
    padding:    16,
  },
  listItem: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 10,
    gap:            12,
  },
  listContent: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    padding:    16,
  },
  scoreDetails: {
    flexDirection:  'row',
    gap:            8,
    marginTop:      12,
    justifyContent: 'center',
  },
});

export default Skeleton;