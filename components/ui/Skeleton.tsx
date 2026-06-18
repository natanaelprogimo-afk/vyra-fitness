// REDESIGNED: 2026-05-21 - skeletons better mirror final structures and feel calmer
import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 16,
  radius,
  borderRadius,
  style,
  circle = false,
}: SkeletonProps) {
  const finalRadius = radius ?? borderRadius ?? Radius.md;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-120, 220]) }],
    opacity: interpolate(progress.value, [0, 0.45, 1], [0.1, 0.24, 0.1]),
  }));

  const size = circle ? height : undefined;

  return (
    <View
      style={[
        styles.shell,
        {
          width: circle ? size : width,
          height,
          borderRadius: circle ? height / 2 : finalRadius,
          backgroundColor: Colors.surface2,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            borderRadius: circle ? height / 2 : finalRadius,
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

export function CardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.surface1,
          borderColor: Colors.border,
        },
        style,
      ]}
    >
      <View style={styles.cardHeader}>
        <Skeleton circle height={40} />
        <View style={styles.cardTitleGroup}>
          <Skeleton width="56%" height={14} />
          <Skeleton width="36%" height={10} style={{ marginTop: 6 }} />
        </View>
      </View>
      <Skeleton height={72} style={{ marginTop: 14 }} />
      <Skeleton width="44%" height={12} style={{ marginTop: 12 }} />
    </View>
  );
}

export function StatSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.stat, style]}>
      <Skeleton width={44} height={44} circle />
      <Skeleton width="72%" height={12} style={{ marginTop: 10 }} />
      <Skeleton width="48%" height={10} style={{ marginTop: 6 }} />
    </View>
  );
}

export function ListSkeleton({ count = 3, style }: { count?: number; style?: ViewStyle }) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <Skeleton circle height={40} />
          <View style={styles.listContent}>
            <Skeleton width="62%" height={13} />
            <Skeleton width="44%" height={10} style={{ marginTop: 6 }} />
          </View>
          <Skeleton width={48} height={22} radius={Radius.full} />
        </View>
      ))}
    </View>
  );
}

export function DailyScoreSkeleton() {
  return (
    <View style={styles.scoreContainer}>
      <Skeleton circle height={120} />
      <Skeleton width="42%" height={15} style={{ marginTop: 12, alignSelf: 'center' }} />
      <View style={styles.scoreDetails}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} width="16%" height={8} radius={Radius.full} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '42%',
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing[5],
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  cardTitleGroup: {
    flex: 1,
  },
  stat: {
    alignItems: 'flex-start',
    padding: Spacing[4],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2.5],
    gap: Spacing[3],
  },
  listContent: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: Spacing[4],
  },
  scoreDetails: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
    justifyContent: 'center',
  },
});

export default Skeleton;
