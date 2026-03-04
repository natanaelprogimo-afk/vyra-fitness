// ============================================================
// VYRA FITNESS — Input
// Campo de texto con label, error, ícono, tipo seguro y multiline
// ============================================================

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?:       string;
  error?:       string | null;
  hint?:        string;
  iconLeft?:    React.ReactNode;
  iconRight?:   React.ReactNode;
  onPressRight?:() => void;
  style?:       ViewStyle | ViewStyle[];
  inputStyle?:  object;
  disabled?:    boolean;
  unit?:        string;             // ej: "kg", "ml", "kcal"
}

export default function Input({
  label,
  error,
  hint,
  iconLeft,
  iconRight,
  onPressRight,
  style,
  inputStyle,
  disabled = false,
  unit,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused]   = useState(false);
  const [isSecure, setIsSecure]     = useState(secureTextEntry ?? false);
  const borderAnim = useSharedValue(0);

  const animBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(
      isFocused
        ? Colors.brand
        : error
        ? Colors.error
        : Colors.border,
      { duration: 180 }
    ),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderAnim.value = 1;
    props.onFocus?.({} as never);
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderAnim.value = 0;
    props.onBlur?.({} as never);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Animated.View style={[styles.container, animBorder, error && styles.errorBorder, disabled && styles.disabled]}>
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}

        <TextInput
          {...props}
          style={[styles.input, iconLeft ? styles.inputWithIconLeft : null, unit ? styles.inputWithUnit : null, inputStyle]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.brand}
          cursorColor={Colors.brand}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={isSecure}
        />

        {unit && (
          <Text style={styles.unit}>{unit}</Text>
        )}

        {secureTextEntry && (
          <Pressable onPress={() => setIsSecure(!isSecure)} style={styles.iconRight}>
            <Text style={styles.secureToggle}>{isSecure ? '👁️' : '🙈'}</Text>
          </Pressable>
        )}

        {iconRight && !secureTextEntry && (
          <Pressable
            onPress={onPressRight}
            style={styles.iconRight}
            disabled={!onPressRight}
          >
            {iconRight}
          </Pressable>
        )}
      </Animated.View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing[3],
  },
  label: {
    fontFamily:   FontFamily.medium,
    fontSize:     FontSize.sm,
    color:        Colors.textSecondary,
    marginBottom: Spacing[1.5],
  },
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius.lg,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    height:          52,
    paddingHorizontal: Spacing[4],
  },
  input: {
    flex:         1,
    fontFamily:   FontFamily.regular,
    fontSize:     FontSize.base,
    color:        Colors.textPrimary,
    height:       '100%',
  },
  inputWithIconLeft: {
    marginLeft: Spacing[2],
  },
  inputWithUnit: {
    marginRight: Spacing[2],
  },
  iconLeft: {
    marginRight: 0,
  },
  iconRight: {
    marginLeft: Spacing[2],
  },
  unit: {
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.sm,
    color:      Colors.textMuted,
  },
  secureToggle: {
    fontSize: FontSize.base,
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    fontFamily:  FontFamily.regular,
    fontSize:    FontSize.xs,
    color:       Colors.error,
    marginTop:   Spacing[1],
    marginLeft:  Spacing[1],
  },
  hint: {
    fontFamily:  FontFamily.regular,
    fontSize:    FontSize.xs,
    color:       Colors.textMuted,
    marginTop:   Spacing[1],
    marginLeft:  Spacing[1],
  },
});