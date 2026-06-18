// REDESIGNED: 2026-05-20 - card surface types aligned to redesign foundations
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { triggerImpactHaptic } from '@/lib/haptics';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';
import { useSettingsStore } from '@/stores/settingsStore';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  noPad?: boolean;
  borderColor?: string;
  shadow?: boolean;
  accentColor?: string;
  decorative?: boolean;
  haptic?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?: 'default' | 'hero' | 'metric' | 'insight' | 'inset';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Card({
  children,
  onPress,
  style,
  elevated = false,
  noPad = false,
  borderColor,
  shadow = false,
  accentColor,
  decorative,
  haptic = true,
  accessibilityLabel,
  accessibilityHint,
  variant = 'default',
}: CardProps) {
  const scale = useSharedValue(1);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const { reduceMotionEnabled } = useAccessibilityPreferences();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!onPress || reduceMotionEnabled) return;
    scale.value = withSpring(0.98, { damping: 15, stiffness: 180 });
  };

  const handlePressOut = () => {
    if (reduceMotionEnabled) return;
    scale.value = withSpring(1, { damping: 16, stiffness: 190 });
  };

  const handlePress = () => {
    if (!onPress) return;
    if (haptic) void triggerImpactHaptic('light');
    onPress();
  };

  const surfaceStyle = getSurfaceStyle({
    variant,
    noPad,
    elevated,
    shadow,
    borderColor,
    accentColor,
    highContrast,
    decorative,
  });

  const content = (
    <View style={[surfaceStyle, style]}>
      {variant === 'insight' && accentColor ? (
        <View style={[styles.insightBorder, { backgroundColor: accentColor }]} />
      ) : null}
      {accentColor && variant !== 'insight' ? (
        <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
      ) : null}
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  insightBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 2,
  },
});

function getSurfaceStyle({
  variant,
  noPad,
  elevated,
  shadow,
  borderColor,
  accentColor,
  highContrast,
  decorative,
}: {
  variant: 'default' | 'hero' | 'metric' | 'insight' | 'inset';
  noPad: boolean;
  elevated: boolean;
  shadow: boolean;
  borderColor?: string;
  accentColor?: string;
  highContrast: boolean;
  decorative?: boolean;
}): ViewStyle {
  const resolvedBorder =
    borderColor ??
    (highContrast ? withOpacity(Colors.white, 0.18) : Colors.border);

  const padding = noPad
    ? 0
    : variant === 'hero'
      ? Spacing[5]
      : variant === 'metric' || variant === 'insight'
        ? Spacing[4]
        : Spacing[4];

  const backgroundColor =
    variant === 'inset'
      ? Colors.surface2
      : variant === 'insight' && accentColor
        ? withOpacity(accentColor, 0.08)
        : elevated
          ? Colors.surface2
          : Colors.surface1;

  return {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor,
    borderRadius: variant === 'hero' ? Radius.xl : Radius.lg,
    padding,
    borderWidth: 1,
    borderColor: variant === 'insight' && accentColor ? withOpacity(accentColor, 0.14) : resolvedBorder,
    ...(shadow || elevated
      ? Platform.OS === 'ios'
        ? {
            ...(variant === 'hero' ? Shadows.lg : Shadows.md),
            shadowColor: accentColor ?? Colors.black,
            shadowOpacity: accentColor ? 0.18 : variant === 'hero' ? 0.42 : 0.32,
          }
        : {
            elevation: variant === 'hero' ? 4 : 2,
          }
      : {}),
    ...(decorative && accentColor ? { shadowColor: accentColor } : {}),
  };
}
