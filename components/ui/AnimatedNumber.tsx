// VYRA FITNESS - AnimatedNumber
// Number that counts from 0 to the target value with easing.

import React, { useEffect } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import Animated, { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/theme';

Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  onComplete?: () => void;
  formatFn?: (n: number) => string;
}

export default function AnimatedNumber({
  value,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  style,
  onComplete,
  formatFn,
}: AnimatedNumberProps) {
  const animValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    animValue.value = 0;
    animValue.value = withTiming(
      value,
      {
        duration,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished && onComplete) runOnJS(onComplete)();
      },
    );
  }, [animValue, duration, onComplete, value]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = animValue.value;
      const formatted = formatFn ? formatFn(current) : current.toFixed(decimals);
      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (Math.abs(current - value) < 0.01) {
        clearInterval(interval);
        const final = formatFn ? formatFn(value) : value.toFixed(decimals);
        setDisplayValue(`${prefix}${final}${suffix}`);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [animValue, decimals, formatFn, prefix, suffix, value]);

  return <Text style={[styles.text, style]}>{displayValue}</Text>;
}

interface BigNumberProps {
  value: number;
  unit?: string;
  color?: string;
  style?: TextStyle;
  decimals?: number;
}

export function BigNumber({
  value,
  unit,
  color = Colors.textPrimary,
  style,
  decimals = 0,
}: BigNumberProps) {
  return (
    <AnimatedNumber
      value={value}
      decimals={decimals}
      suffix={unit ? ` ${unit}` : ''}
      style={{ ...styles.big, color, ...style }}
      duration={1200}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  big: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    color: Colors.textPrimary,
  },
});
