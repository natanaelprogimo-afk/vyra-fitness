import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settingsStore';
import { triggerImpactHaptic } from '@/lib/haptics';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';

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
  haptic = true,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const scale = useSharedValue(1);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const { reduceMotionEnabled } = useAccessibilityPreferences();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!onPress) return;
    if (reduceMotionEnabled) return;
    scale.value = withTiming(0.98, { duration: 90 });
  };

  const handlePressOut = () => {
    if (reduceMotionEnabled) return;
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (!onPress) return;
    if (haptic) void triggerImpactHaptic('light');
    onPress();
  };

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? Colors.bgElevated : Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: noPad ? 0 : Spacing[5],
    borderWidth: 1,
    borderColor:
      borderColor ?? (highContrast ? withOpacity(Colors.white, 0.2) : Colors.border),
    overflow: accentColor ? 'hidden' : 'visible',
    ...(shadow ? { ...Shadows.md, shadowColor: accentColor ?? Colors.black } : {}),
  };

  const content = (
    <View style={[cardStyle, style]}>
      {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
});
