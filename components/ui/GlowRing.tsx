import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

export type GlowRingState = 'active' | 'complete' | 'empty' | 'excellent';

function getRingColor(state: GlowRingState, color?: string) {
  if (color) return color;
  switch (state) {
    case 'complete':
      return Colors.success;
    case 'excellent':
      return Colors.excellent;
    case 'empty':
      return Colors.textMuted;
    case 'active':
    default:
      return Colors.action;
  }
}

interface GlowRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  state?: GlowRingState;
  color?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  pulse?: boolean;
  trackColor?: string;
}

export default function GlowRing({
  value,
  size = 120,
  strokeWidth = 10,
  state = 'active',
  color,
  children,
  style,
  pulse = false,
  trackColor,
}: GlowRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const resolvedColor = getRingColor(state, color);

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  useEffect(() => {
    if (!pulse) {
      pulseScale.value = 1;
      return;
    }

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse, pulseScale]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (progress.value / 100) * circumference,
  }));

  const pulseStyle = {
    transform: [{ scale: pulseScale }],
  };

  return (
    <AnimatedView style={[styles.wrap, { width: size, height: size }, style, pulseStyle]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? withOpacity(Colors.white, 0.08)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
        {(state === 'active' || state === 'excellent') && clamped > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2}
            stroke={withOpacity(resolvedColor, state === 'excellent' ? 0.24 : 0.18)}
            strokeWidth={1}
            fill="none"
          />
        ) : null}
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
