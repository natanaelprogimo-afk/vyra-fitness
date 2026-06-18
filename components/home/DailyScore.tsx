import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import type { DailyScore as DailyScoreType, ScoreBreakdown } from '@/hooks/useReadiness';

interface DailyScoreProps {
  data: DailyScoreType | null;
  loading: boolean;
  onPress?: () => void;
}

function AnimatedScore({ target, color }: { target: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      160,
      withTiming(target, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [target]);

  const displayValue = useDerivedValue(() =>
    Math.round(interpolate(progress.value, [0, target], [0, target])),
  );

  const animStyle = useAnimatedStyle(() => ({
    color,
  }));

  return <Animated.Text style={[styles.scoreNumber, animStyle]}>{displayValue.value}</Animated.Text>;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const size = (radius + stroke) * 2 + 4;
  const animProgress = useSharedValue(0);

  useEffect(() => {
    animProgress.value = 0;
    animProgress.value = withDelay(
      100,
      withTiming(score / 100, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [score]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 0.95 + animProgress.value * 0.05,
  }));

  const offset = circumference * (1 - score / 100);

  return (
    <Animated.View style={animStyle}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.elevated}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2},${size / 2}`}
        />
      </Svg>
    </Animated.View>
  );
}

function BreakdownBar({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(
      delay,
      withTiming(value / 100, { duration: 700, easing: Easing.out(Easing.quad) }),
    );
  }, [delay, value]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%` as const,
  }));

  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <View style={styles.breakdownTrack}>
        <Animated.View style={[styles.breakdownFill, { backgroundColor: color }, barStyle]} />
      </View>
      <Text style={[styles.breakdownValue, { color }]}>{value}</Text>
    </View>
  );
}

const BREAKDOWN_ITEMS: Array<{
  key: keyof ScoreBreakdown;
  label: string;
  color: string;
}> = [
  { key: 'hydration', label: 'Agua', color: Colors.water },
  { key: 'activity', label: 'Actividad', color: Colors.steps },
  { key: 'sleep', label: 'Sueño', color: Colors.sleep },
  { key: 'nutrition', label: 'Nutrición', color: Colors.nutrition },
  { key: 'mental', label: 'Ánimo', color: Colors.mental },
];

function getScoreLabel(score: number) {
  if (score >= 90) return 'Muy buen equilibrio';
  if (score >= 80) return 'Día bien sostenido';
  if (score >= 70) return 'Buena base';
  if (score >= 60) return 'Conviene ordenar dos cosas';
  if (score >= 40) return 'Mejor bajar ruido';
  return 'Empieza por lo básico';
}

export function DailyScore({ data, loading, onPress }: DailyScoreProps) {
  const score = data?.score ?? 0;
  const color = score >= 80 ? Colors.success : score >= 60 ? Colors.warning : Colors.error;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingRing} />
        <View style={styles.loadingText} />
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && onPress ? styles.containerPressed : null]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? 'Abrir detalle del balance diario' : undefined}
    >
      <View style={styles.ringWrapper}>
        <ScoreRing score={score} color={color} />
        <View style={styles.ringCenter}>
          <AnimatedScore target={score} color={color} />
          <Text style={styles.scoreMax}>/100</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
        </View>
      </View>

      {data?.breakdown ? (
        <View style={styles.breakdown}>
          {BREAKDOWN_ITEMS.map((item, index) => (
            <BreakdownBar
              key={item.key}
              label={item.label}
              value={data.breakdown[item.key]}
              color={item.color}
              delay={260 + index * 70}
            />
          ))}
        </View>
      ) : null}

      {data?.meta?.stressCapped ? (
        <View style={styles.capNotice}>
          <Text style={styles.capNoticeText}>
            Hoy conviene ir más suave; el estrés está pesando más de lo normal.
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius['2xl'],
    padding: Spacing[4],
    gap: Spacing[4],
  },
  containerPressed: {
    opacity: 0.92,
  },
  loadingRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: Colors.elevated,
    alignSelf: 'center',
  },
  loadingText: {
    height: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    marginHorizontal: Spacing[8],
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontFamily: FontFamily.display,
    fontSize: 46,
    lineHeight: 46,
    letterSpacing: 2,
  },
  scoreMax: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: -4,
  },
  scoreLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 132,
    lineHeight: 16,
  },
  breakdown: {
    gap: Spacing[2],
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  breakdownLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    width: 82,
  },
  breakdownTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.elevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: 6,
    borderRadius: Radius.full,
  },
  breakdownValue: {
    width: 28,
    textAlign: 'right',
    fontFamily: FontFamily.semibold,
    fontSize: 12,
  },
  capNotice: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: `${Colors.warning}2A`,
    backgroundColor: `${Colors.warning}10`,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  capNoticeText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default DailyScore;
