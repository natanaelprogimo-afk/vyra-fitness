// ============================================================
// VYRA FITNESS — Button
// Variantes: primary, secondary, ghost, danger, premium, coin
// Con haptic feedback, loading state, ícono opcional
// ============================================================

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium' | 'coin';
export type ButtonSize    = 'sm' | 'md' | 'lg' | 'small' | 'large';

interface ButtonProps {
  onPress:     () => void;
  children?:   React.ReactNode;
  label?:      string;  // Deprecated: use children instead
  variant?:    ButtonVariant;
  size?:       ButtonSize;
  disabled?:   boolean;
  loading?:    boolean;
  fullWidth?:  boolean;
  icon?:       React.ReactNode;
  iconRight?:  boolean;
  style?:      ViewStyle | ViewStyle[];
  textStyle?:  TextStyle;
  haptic?:     'light' | 'medium' | 'heavy' | 'none';
  color?:      string;  // Optional color override
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  onPress,
  children,
  label,
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  loading   = false,
  fullWidth = false,
  icon,
  iconRight = false,
  style,
  textStyle,
  haptic = 'light',
  color,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const displayContent = children ?? label;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic !== 'none') {
      const style = haptic === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : haptic === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
      Haptics.impactAsync(style).catch(() => {});
    }
    onPress();
  };

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        ss.container,
        vs.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={vs.loaderColor}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && !iconRight && (
            <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
          )}
          <Text style={[styles.text, ss.text, vs.text, textStyle]}>
            {displayContent}
          </Text>
          {icon && iconRight && (
            <Animated.View style={styles.iconRight}>{icon}</Animated.View>
          )}
        </>
      )}
    </AnimatedPressable>
  );
}

// ─── Estilos base ─────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   Radius.xl,
  },
  fullWidth: { width: '100%' },
  disabled:  { opacity: 0.45 },
  iconLeft:  { marginRight: Spacing[2] },
  iconRight: { marginLeft: Spacing[2] },
  text:      { fontFamily: FontFamily.semibold },
});

// ─── Tamaños ─────────────────────────────────────────────────
const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { height: 40, paddingHorizontal: Spacing[4] },
    text:      { fontSize: FontSize.sm },
  },
  small: {
    container: { height: 40, paddingHorizontal: Spacing[4] },
    text:      { fontSize: FontSize.sm },
  },
  md: {
    container: { height: 52, paddingHorizontal: Spacing[6] },
    text:      { fontSize: FontSize.base },
  },
  lg: {
    container: { height: 60, paddingHorizontal: Spacing[8] },
    text:      { fontSize: FontSize.lg },
  },
  large: {
    container: { height: 60, paddingHorizontal: Spacing[8] },
    text:      { fontSize: FontSize.lg },
  },
};

// ─── Variantes ───────────────────────────────────────────────
const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; loaderColor: string }
> = {
  primary: {
    container:   { backgroundColor: Colors.brand },
    text:        { color: Colors.white },
    loaderColor: Colors.white,
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth:     1.5,
      borderColor:     Colors.brand,
    },
    text:        { color: Colors.brand },
    loaderColor: Colors.brand,
  },
  ghost: {
    container:   { backgroundColor: 'transparent' },
    text:        { color: Colors.textSecondary },
    loaderColor: Colors.textSecondary,
  },
  danger: {
    container:   { backgroundColor: Colors.error },
    text:        { color: Colors.white },
    loaderColor: Colors.white,
  },
  premium: {
    container:   { backgroundColor: Colors.premium },
    text:        { color: Colors.white },
    loaderColor: Colors.white,
  },
  coin: {
    container: {
      backgroundColor: Colors.coinsBg,
      borderWidth:     1,
      borderColor:     Colors.coins,
    },
    text:        { color: Colors.coins },
    loaderColor: Colors.coins,
  },
};