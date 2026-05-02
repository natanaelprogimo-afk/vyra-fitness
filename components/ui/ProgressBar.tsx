import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily } from '@/constants/theme';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  label?: string;
  showPct?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  duration?: number;
  trackColor?: string;
}

export default function ProgressBar({
  value,
  color = Colors.brand,
  height = 8,
  label,
  showPct = false,
  animated = true,
  style,
  duration = 600,
  trackColor = Colors.bgElevated,
}: ProgressBarProps) {
  const width = useSharedValue(0);
  const clampedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    width.value = animated
      ? withTiming(clampedValue, { duration, easing: Easing.out(Easing.cubic) })
      : clampedValue;
  }, [animated, clampedValue, duration, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={style}>
      {(label || showPct) && (
        <View style={styles.labelRow}>
          {label ? <Text style={[styles.label, { color: Colors.textSecondary }]}>{label}</Text> : null}
          {showPct ? <Text style={[styles.pct, { color }]}>{Math.round(clampedValue)}%</Text> : null}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: trackColor,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height,
              borderRadius: height / 2,
            },
            barStyle,
          ]}
        />
      </View>
    </View>
  );
}

interface MacroBarProps {
  protein: number;
  carbs: number;
  fat: number;
  height?: number;
  style?: ViewStyle;
}

export function MacroBar({ protein, carbs, fat, height = 10, style }: MacroBarProps) {
  const total = protein + carbs + fat || 1;
  const pPct = (protein / total) * 100;
  const cPct = (carbs / total) * 100;
  const fPct = (fat / total) * 100;

  return (
    <View
      style={[
        styles.macroTrack,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: Colors.bgElevated,
        },
        style,
      ]}
    >
      <View style={{ flex: pPct, backgroundColor: Colors.nutrition, borderRadius: height / 2 }} />
      <View style={{ flex: cPct, backgroundColor: Colors.fasting }} />
      <View style={{ flex: fPct, backgroundColor: Colors.brand, borderRadius: height / 2 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  pct: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    minWidth: 4,
  },
  macroTrack: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
});
