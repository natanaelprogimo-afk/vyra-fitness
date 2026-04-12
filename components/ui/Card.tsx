// ============================================================
// VYRA FITNESS — Card
// Card con glass effect, border sutil, press animation opcional
// ============================================================

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
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Shadows } from '@/constants/theme';

interface CardProps {
  children:        React.ReactNode;
  onPress?:        () => void;
  style?:          StyleProp<ViewStyle>;
  elevated?:       boolean;        // usa bgElevated en vez de bgSurface
  noPad?:          boolean;
  borderColor?:    string;
  shadow?:         boolean;
  accentColor?:    string;         // barra de color izquierda
  decorative?:     boolean;
  haptic?:         boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Card({
  children,
  onPress,
  style,
  elevated    = false,
  noPad       = false,
  borderColor,
  shadow      = false,
  accentColor,
  haptic      = true,
}: CardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!onPress) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  };

  const handlePress = () => {
    if (!onPress) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? Colors.bgElevated : Colors.bgSurface,
    borderRadius:    Radius.xl,
    padding:         noPad ? 0 : Spacing[4],
    borderWidth:     1,
    borderColor:     borderColor ?? Colors.border,
    overflow:        accentColor ? 'hidden' : 'visible',
    ...(shadow ? Shadows.md : {}),
  };

  const content = (
    <View style={[cardStyle, style]}>
      {accentColor && (
        <View
          style={[styles.accent, { backgroundColor: accentColor }]}
          pointerEvents="none"
        />
      )}
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
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  accent: {
    position: 'absolute',
    left:     0,
    top:      0,
    bottom:   0,
    width:    3,
    borderTopLeftRadius:    Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
});