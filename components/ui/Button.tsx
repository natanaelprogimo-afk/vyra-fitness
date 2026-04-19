import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium' | 'coin';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'small' | 'large' | 'utility' | 'primary';

interface ButtonProps extends Omit<PressableProps, 'onPress' | 'style'> {
  onPress: () => void;
  children?: React.ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  color?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  onPress,
  children,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconRight = false,
  style,
  textStyle,
  haptic = 'light',
  color,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);
  const displayContent = children ?? label;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withTiming(0.97, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic !== 'none') {
      const style =
        haptic === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : haptic === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light;
      Haptics.impactAsync(style).catch(() => {});
    }
    onPress();
  };

  const variantStyles = getVariantStyles(variant, color);
  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      {...rest}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.loaderColor} size="small" />
      ) : (
        <>
          {icon && !iconRight ? <Animated.View style={styles.iconLeft}>{icon}</Animated.View> : null}
          <Text style={[styles.text, sizeStyles.text, variantStyles.text, textStyle]}>{displayContent}</Text>
          {icon && iconRight ? <Animated.View style={styles.iconRight}>{icon}</Animated.View> : null}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  iconLeft: {
    marginRight: Spacing[2],
  },
  iconRight: {
    marginLeft: Spacing[2],
  },
  text: {
    fontFamily: FontFamily.bold,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

const SIZE_STYLES: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { minHeight: 48, paddingHorizontal: Spacing[4] },
    text: { fontSize: 15 },
  },
  small: {
    container: { minHeight: 48, paddingHorizontal: Spacing[4] },
    text: { fontSize: 15 },
  },
  md: {
    container: { minHeight: 56, paddingHorizontal: Spacing[5] },
    text: { fontSize: 17 },
  },
  lg: {
    container: { minHeight: 60, paddingHorizontal: Spacing[5] },
    text: { fontSize: 17 },
  },
  large: {
    container: { minHeight: 60, paddingHorizontal: Spacing[5] },
    text: { fontSize: 17 },
  },
  utility: {
    container: { minHeight: 48, paddingHorizontal: Spacing[4] },
    text: { fontSize: 15 },
  },
  primary: {
    container: { minHeight: 56, paddingHorizontal: Spacing[5] },
    text: { fontSize: 17 },
  },
};

function getVariantStyles(
  variant: ButtonVariant,
  color?: string,
): { container: ViewStyle; text: TextStyle; loaderColor: string } {
  const resolvedColor =
    color ??
    (variant === 'danger'
      ? Colors.error
      : variant === 'premium'
        ? Colors.textPrimary
        : variant === 'coin'
          ? Colors.textPrimary
          : Colors.action);

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: resolvedColor,
        },
        text: {
          color: Colors.white,
          fontFamily: FontFamily.bold,
        },
        loaderColor: Colors.white,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: Colors.bgElevated,
          borderWidth: 1,
          borderColor: Colors.border2,
        },
        text: {
          color: Colors.textPrimary,
          fontFamily: FontFamily.semibold,
        },
        loaderColor: Colors.textPrimary,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
        },
        text: {
          color: color ?? Colors.textSecondary,
          fontFamily: FontFamily.medium,
        },
        loaderColor: color ?? Colors.textSecondary,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: Colors.errorBg,
          borderWidth: 1,
          borderColor: withOpacity(Colors.error, 0.2),
        },
        text: {
          color: Colors.error,
        },
        loaderColor: Colors.error,
      };
    case 'premium':
      return {
        container: {
          backgroundColor: Colors.elevated,
          borderWidth: 1,
          borderColor: withOpacity(Colors.white, 0.08),
        },
        text: {
          color: Colors.textPrimary,
        },
        loaderColor: Colors.textPrimary,
      };
    case 'coin':
      return {
        container: {
          backgroundColor: Colors.elevated,
          borderWidth: 1,
          borderColor: withOpacity(Colors.white, 0.08),
        },
        text: {
          color: Colors.textPrimary,
        },
        loaderColor: Colors.textPrimary,
      };
    default:
      return {
        container: {
          backgroundColor: Colors.action,
        },
        text: {
          color: Colors.white,
        },
        loaderColor: Colors.white,
      };
  }
}
