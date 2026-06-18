// ============================================================
// VYRA FITNESS — ProgressCircle
// Ring circular animado. Usado en módulos agua, pasos, ayuno.
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressCircleProps {
  value:        number;            // 0-100
  size?:        number;            // diameter px
  strokeWidth?: number;
  color?:       string;
  trackColor?:  string;
  children?:    React.ReactNode;   // contenido central
  style?:       ViewStyle;
  animated?:    boolean;
  duration?:    number;
  accessibilityLabel?: string;
}

export default function ProgressCircle({
  value,
  size        = 120,
  strokeWidth = 10,
  color       = Colors.brand,
  trackColor  = Colors.elevated,
  children,
  style,
  animated    = true,
  duration    = 800,
  accessibilityLabel,
}: ProgressCircleProps) {
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = animated
      ? withTiming(clampedValue, { duration, easing: Easing.out(Easing.cubic) })
      : clampedValue;
  }, [clampedValue, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (progress.value / 100) * circumference,
  }));

  const center = size / 2;

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `Progreso ${Math.round(clampedValue)} por ciento`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Centro */}
      <View style={[styles.center, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
}

// ─── Variante con número en el centro ────────────────────────

interface SimpleRingProps extends ProgressCircleProps {
  label?:       string;
  valueLabel?:  string;
}

export function SimpleRing({
  value,
  color   = Colors.brand,
  size    = 100,
  label,
  valueLabel,
  ...rest
}: SimpleRingProps) {
  return (
    <ProgressCircle value={value} color={color} size={size} {...rest}>
      <View style={styles.ringContent}>
        <Text style={[styles.ringValue, { color }]}>
          {valueLabel ?? `${Math.round(value)}%`}
        </Text>
        {label && <Text style={styles.ringLabel}>{label}</Text>}
      </View>
    </ProgressCircle>
  );
}

const styles = StyleSheet.create({
  center: {
    position:        'absolute',
    alignItems:      'center',
    justifyContent:  'center',
  },
  ringContent: {
    alignItems: 'center',
  },
  ringValue: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.lg,
  },
  ringLabel: {
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.xs,
    color:      Colors.textMuted,
    marginTop:  2,
  },
});
