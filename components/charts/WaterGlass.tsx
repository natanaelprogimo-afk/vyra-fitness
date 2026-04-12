import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

interface WaterGlassProps {
  progress: number;
  value: number;
  goal: number;
  color?: string;
  width?: number;
  height?: number;
}

function WaterGlass({
  progress,
  value,
  goal,
  color = Colors.water,
  width = 140,
  height = 210,
}: WaterGlassProps) {
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeGoal = Number.isFinite(goal) && goal > 0 ? goal : 0;
  const clamped = Math.max(0, Math.min(100, safeProgress));
  const fill = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const AnimatedRect = Animated.createAnimatedComponent(Rect);

  useEffect(() => {
    fill.value = reduceMotion ? clamped / 100 : withTiming(clamped / 100, { duration: 340, easing: Easing.out(Easing.cubic) });
  }, [clamped, fill, reduceMotion]);

  const viewBoxWidth = 100;
  const viewBoxHeight = 140;
  const dropPath = 'M50 5 C 30 35 18 55 18 80 C 18 108 34 130 50 130 C 66 130 82 108 82 80 C 82 55 70 35 50 5 Z';

  const animatedProps = useAnimatedProps(() => {
    const fillHeight = viewBoxHeight * fill.value;
    return {
      y: viewBoxHeight - fillHeight,
      height: fillHeight,
    };
  });

  return (
   <View style={[styles.wrapper, { width }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}>
      <View style={[styles.dropWrap, { width, height }]}> 
        <Svg width={width} height={height} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
          <Defs>
            <ClipPath id="dropClip">
              <Path d={dropPath} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#dropClip)">
            <Rect x={0} y={0} width={viewBoxWidth} height={viewBoxHeight} fill={withOpacity(color, 0.08)} />
            <AnimatedRect x={0} animatedProps={animatedProps} width={viewBoxWidth} fill={color} />
          </G>
          <Path d={dropPath} fill="transparent" stroke={withOpacity(color, 0.34)} strokeWidth={2} />
        </Svg>
        <View style={styles.centerOverlay} pointerEvents="none">
          <Text style={[styles.centerPct, { color }]}>{Math.round(clamped)}%</Text>
        </View>
      </View>

      <View style={styles.labelWrap}>
        <Text style={[styles.value, { color }]}>{Math.round(safeValue)} ml</Text>
        <Text style={styles.goal}>de {Math.round(safeGoal)} ml</Text>
        <Text style={[styles.pct, { color }]}>{Math.round(clamped)}% de la meta</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  dropWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPct: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    textShadowColor: 'rgba(0,0,0,0.18)',
   textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  labelWrap: {
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  goal: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  pct: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
});

export default memo(WaterGlass);
