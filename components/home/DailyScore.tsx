import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Radius } from '@/constants/theme';
import { DailyScore as DailyScoreType, ScoreBreakdown } from '@/hooks/useReadiness';

interface DailyScoreProps {
  data:    DailyScoreType | null;
  loading: boolean;
  onPress?: () => void;
}

// Animador de número (cuenta de 0 al valor)
function AnimatedScore({ target, color }: { target: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      200,
      withTiming(target, {
        duration: 1500,
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

  return (
    <Animated.Text style={[styles.scoreNumber, animStyle]}>
      {displayValue.value}
    </Animated.Text>
  );
}

// Ring SVG animado
function ScoreRing({ score, color }: { score: number; color: string }) {
  const RADIUS = 72;
  const STROKE = 10;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const SIZE = (RADIUS + STROKE) * 2 + 4;

  const animProgress = useSharedValue(0);

  useEffect(() => {
    animProgress.value = 0;
    animProgress.value = withDelay(
      100,
      withTiming(score / 100, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [score]);

  const animStyle = useAnimatedStyle(() => ({
    // Usado para re-render — el SVG strokeDashoffset no es animable directo en RN
    // Se hace con opacity para el glow effect
    opacity: 0.95 + animProgress.value * 0.05,
  }));

  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <Animated.View style={animStyle}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track gris */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.bgElevated}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Arco coloreado */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2},${SIZE / 2}`}
        />
      </Svg>
    </Animated.View>
  );
}

// Barra de breakdown por módulo
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
      withTiming(value / 100, { duration: 800, easing: Easing.out(Easing.quad) }),
    );
  }, [value]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%` as any,
  }));

  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <View style={styles.breakdownTrack}>
        <Animated.View
          style={[styles.breakdownFill, { backgroundColor: color }, barStyle]}
        />
      </View>
      <Text style={[styles.breakdownValue, { color }]}>{value}</Text>
    </View>
  );
}

const BREAKDOWN_ITEMS: {
  key: keyof ScoreBreakdown;
  label: string;
  color: string;
}[] = [
  { key: 'hydration',  label: '💧 Agua',       color: Colors.water },
  { key: 'activity',   label: '🚶 Actividad',   color: Colors.steps },
  { key: 'sleep',      label: '😴 Sueño',       color: Colors.sleep },
  { key: 'nutrition',  label: '🍎 Nutrición',   color: Colors.nutrition },
  { key: 'mental',     label: '🧠 Mental',      color: Colors.mental },
];

export function DailyScore({ data, loading, onPress }: DailyScoreProps) {
  const score  = data?.score     ?? 0;
  const color  = score >= 80 ? Colors.success : score >= 60 ? Colors.warning : Colors.error;
  const label  = score >= 90 ? '¡Día excepcional!'
               : score >= 80 ? 'Muy buen día'
               : score >= 70 ? 'Buen día'
               : score >= 60 ? 'Día regular'
               : score >= 40 ? 'Podés mejorar'
               : 'Empezá por un paso';

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingRing} />
        <View style={styles.loadingText} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Ring + número */}
      <View style={styles.ringWrapper}>
        <ScoreRing score={score} color={color} />
        <View style={styles.ringCenter}>
          <AnimatedScore target={score} color={color} />
          <Text style={styles.scoreMax}>/100</Text>
          <Text style={styles.scoreLabel}>{label}</Text>
        </View>
      </View>

      {/* Breakdown barras */}
      {data?.breakdown && (
        <View style={styles.breakdown}>
          {BREAKDOWN_ITEMS.map((item, i) => (
            <BreakdownBar
              key={item.key}
              label={item.label}
              value={data.breakdown[item.key]}
              color={item.color}
              delay={300 + i * 80}
            />
          ))}
        </View>
      )}

      {/* Estrés capeado */}
      {data?.meta?.stressCapped && (
        <View style={styles.capNotice}>
          <Text style={styles.capNoticeText}>
            ⚡ Score máximo reducido por estrés alto — cuidate hoy
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius['2xl'],
    padding: Spacing[5],
    gap: Spacing[5],
  },
  loadingRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.bgElevated,
    alignSelf: 'center',
  },
  loadingText: {
    height: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
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
    fontFamily: FontFamily.bold,
    fontSize: 52,
    lineHeight: 60,
  },
  scoreMax: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: -4,
  },
  scoreLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 120,
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
    width: 100,
  },
  breakdownTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: 6,
    borderRadius: Radius.full,
  },
  breakdownValue: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    width: 30,
    textAlign: 'right',
  },
  capNotice: {
    backgroundColor: `${Colors.warning}15`,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  capNoticeText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.warning,
  },
});

export default DailyScore;