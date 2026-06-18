// REDESIGNED: 2026-05-20 - button system aligned to exhaustive redesign tokens
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { triggerImpactHaptic } from '@/lib/haptics';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium';
export type ButtonSize = 'sm' | 'md' | 'lg';  // Simplified: removed duplicate size names

type BaseButtonPressableProps = PressableProps;

interface ButtonProps extends Omit<BaseButtonPressableProps, 'onPress' | 'style'> {
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
  const { reduceMotionEnabled } = useAccessibilityPreferences();
  const variantStyles = getVariantStyles(variant, color);
  const sizeStyles = SIZE_STYLES[size];
  const content = children ?? label;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading || reduceMotionEnabled) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 180 });
  };

  const handlePressOut = () => {
    if (reduceMotionEnabled) return;
    scale.value = withSpring(1, { damping: 16, stiffness: 190 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic !== 'none') {
      void triggerImpactHaptic(haptic);
    }
    onPress();
  };

  return (
    <AnimatedPressable
      {...rest}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
        ...(rest.accessibilityState ?? {}),
      }}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.loaderColor} size="small" />
      ) : (
        <>
          {icon && !iconRight ? <Animated.View style={styles.iconLeft}>{icon}</Animated.View> : null}
          <Text
            style={[styles.text, sizeStyles.text, variantStyles.text, textStyle]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {content}
          </Text>
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
    gap: Spacing[2],
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.35,
  },
  iconLeft: {
    marginRight: Spacing[1],
  },
  iconRight: {
    marginLeft: Spacing[1],
  },
  text: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});

const SIZE_STYLES: Record<'sm' | 'md' | 'lg', { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { minHeight: 44, paddingHorizontal: Spacing[4] },
    text: { fontSize: FontSize.sm },
  },
  md: {
    container: { minHeight: 52, paddingHorizontal: Spacing[6] },
    text: { fontSize: FontSize.md },
  },
  lg: {
    container: { minHeight: 56, paddingHorizontal: Spacing[6] },
    text: { fontSize: FontSize.lg },
  },
};

function getContrastTextColor(backgroundColor: string) {
  const normalized = backgroundColor.replace('#', '');
  if (normalized.length !== 6) return Colors.black;
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.72 ? Colors.black : Colors.white;
}

function getVariantStyles(
  variant: ButtonVariant,
  color?: string,
): { container: ViewStyle; text: TextStyle; loaderColor: string } {
  const primaryBg = color ?? Colors.primary;
  const primaryText = getContrastTextColor(primaryBg);

  if (variant === 'primary') {
    return {
      container: {
        backgroundColor: primaryBg,
        borderColor: primaryBg,
        ...(color
          ? {
              ...Shadows.brand,
              shadowColor: color,
              shadowOpacity: 0.16,
            }
          : {}),
      },
      text: {
        color: primaryText,
      },
      loaderColor: primaryText,
    };
  }

  if (variant === 'secondary') {
    return {
      container: {
        backgroundColor: color ? withOpacity(color, 0.12) : 'rgba(255,255,255,0.10)',
        borderColor: color ? withOpacity(color, 0.3) : 'rgba(255,255,255,0.16)',
      },
      text: {
        color: color ?? Colors.textPrimary,
      },
      loaderColor: color ?? Colors.textPrimary,
    };
  }

  if (variant === 'ghost') {
    return {
      container: {
        backgroundColor: Colors.transparent,
        borderColor: Colors.transparent,
      },
      text: {
        color: color ?? Colors.textSecondary,
      },
      loaderColor: color ?? Colors.textSecondary,
    };
  }

  if (variant === 'danger') {
    return {
      container: {
        backgroundColor: 'rgba(255,59,48,0.15)',
        borderColor: 'rgba(255,59,48,0.30)',
      },
      text: {
        color: Colors.error,
      },
      loaderColor: Colors.error,
    };
  }

  return {
    container: {
      backgroundColor: Colors.premiumBg,
      borderColor: withOpacity(Colors.premium, 0.28),
    },
    text: {
      color: Colors.textPrimary,
    },
    loaderColor: Colors.textPrimary,
  };
}
