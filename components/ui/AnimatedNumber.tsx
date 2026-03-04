// ============================================================
// VYRA FITNESS — AnimatedNumber
// Número que cuenta de 0 al valor real con easing.
// Usado en Daily Score, contadores de pasos, coins, etc.
// ============================================================

import React, { useEffect } from 'react';
import { Text, StyleSheet, type TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily } from '@/constants/theme';

// Necesitamos createAnimatedComponent para Text
const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps {
  value:       number;
  duration?:   number;             // ms, default 1500
  decimals?:   number;
  prefix?:     string;
  suffix?:     string;
  style?:      TextStyle;  // Single style, not array
  onComplete?: () => void;
  formatFn?:   (n: number) => string;
}

export default function AnimatedNumber({
  value,
  duration  = 1500,
  decimals  = 0,
  prefix    = '',
  suffix    = '',
  style,
  onComplete,
  formatFn,
}: AnimatedNumberProps) {
  const animValue = useSharedValue(0);
  // Usamos un estado React para el texto porque Reanimated Text necesita
  // que el valor sea controlado via useAnimatedProps con 'text' prop
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    animValue.value = 0;
    animValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished && onComplete) runOnJS(onComplete)();
    });
  }, [value]);

  // Actualizamos el texto cada frame usando un listener
  useEffect(() => {
    const interval = setInterval(() => {
      const current = animValue.value;
      const formatted = formatFn
        ? formatFn(current)
        : current.toFixed(decimals);
      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (Math.abs(current - value) < 0.01) {
        clearInterval(interval);
        const final = formatFn ? formatFn(value) : value.toFixed(decimals);
        setDisplayValue(`${prefix}${final}${suffix}`);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [value, duration, decimals, prefix, suffix, formatFn]);

  return (
    <Text style={[styles.text, style]}>
      {displayValue}
    </Text>
  );
}

// ─── Variante grande para módulos (score, pasos, etc.) ───────

interface BigNumberProps {
  value:    number;
  unit?:    string;
  color?:   string;
  style?:   TextStyle;
  decimals?:number;
}

export function BigNumber({ value, unit, color = Colors.textPrimary, style, decimals = 0 }: BigNumberProps) {
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
    fontSize:   FontSize.base,
    color:      Colors.textPrimary,
  },
  big: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize['4xl'],
    color:      Colors.textPrimary,
  },
});