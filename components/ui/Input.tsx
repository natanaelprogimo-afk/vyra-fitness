// REDESIGNED: 2026-05-20 - input states and density aligned to redesign system
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  hint?: string;
  size?: 'md' | 'compact';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onPressRight?: () => void;
  style?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
  unit?: string;
  secureToggleAccessibilityLabel?: string;
  rightAccessibilityLabel?: string;
}

export default function Input({
  label,
  error,
  hint,
  size = 'md',
  iconLeft,
  iconRight,
  onPressRight,
  style,
  inputStyle,
  disabled = false,
  unit,
  secureTextEntry,
  secureToggleAccessibilityLabel = 'Mostrar u ocultar contraseña',
  rightAccessibilityLabel = 'Acción de campo',
  value,
  defaultValue,
  onChangeText,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');

  const currentValue = value ?? uncontrolledValue;

  const fieldColors = useMemo(() => {
    if (disabled) {
      return {
        backgroundColor: withOpacity(Colors.white, 0.03),
        borderColor: withOpacity(Colors.white, 0.06),
      };
    }

    if (error) {
      return {
        backgroundColor: withOpacity(Colors.error, 0.05),
        borderColor: withOpacity(Colors.error, 0.6),
      };
    }

    if (isFocused) {
      return {
        backgroundColor: Colors.surface3,
        borderColor: Colors.brand,
      };
    }

    return {
      backgroundColor: Colors.surface2,
      borderColor: withOpacity(Colors.white, 0.1),
    };
  }, [disabled, error, isFocused]);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1.25}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.container,
          size === 'compact' ? styles.containerCompact : null,
          fieldColors,
          disabled && styles.disabled,
        ]}
      >
        {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}

        <TextInput
          {...props}
          value={value}
          defaultValue={defaultValue}
          onChangeText={(nextValue) => {
            if (value === undefined) {
              setUncontrolledValue(nextValue);
            }
            onChangeText?.(nextValue);
          }}
          style={[
            styles.input,
            size === 'compact' ? styles.inputCompact : null,
            iconLeft ? styles.inputWithLeading : null,
            (iconRight || secureTextEntry || unit) ? styles.inputWithTrailing : null,
            inputStyle,
          ]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.info}
          cursorColor={Colors.info}
          onFocus={(event) => {
            setIsFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            props.onBlur?.(event);
          }}
          editable={!disabled}
          secureTextEntry={isSecure}
          accessibilityLabel={props.accessibilityLabel ?? label}
          maxFontSizeMultiplier={1.3}
        />

        {unit ? (
          <Text style={styles.unit} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {unit}
          </Text>
        ) : null}

        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecure((previous) => !previous)}
            style={styles.iconRight}
            accessibilityRole="button"
            accessibilityLabel={secureToggleAccessibilityLabel}
            accessibilityHint={
              isSecure ? 'Muestra la contraseña escrita.' : 'Oculta la contraseña escrita.'
            }
          >
            <MaterialIcons
              name={isSecure ? 'visibility' : 'visibility-off'}
              size={20}
              color={Colors.textMuted}
            />
          </Pressable>
        ) : null}

        {iconRight && !secureTextEntry ? (
          <Pressable
            onPress={onPressRight}
            style={styles.iconRight}
            disabled={!onPressRight}
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel}
          >
            {iconRight}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Animated.Text
          entering={FadeIn.duration(180)}
          style={styles.error}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {error}
        </Animated.Text>
      ) : hint ? (
        <Text style={styles.hint} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {hint}
        </Text>
      ) : currentValue ? (
        <View style={styles.helperSpacer} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing[1.5],
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  container: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerCompact: {
    minHeight: 44,
    paddingHorizontal: Spacing[3],
  },
  input: {
    flex: 1,
    minHeight: 50,
    color: Colors.textPrimary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    paddingVertical: 0,
  },
  inputCompact: {
    minHeight: 42,
    fontSize: FontSize.sm,
  },
  inputWithLeading: {
    marginLeft: Spacing[2],
  },
  inputWithTrailing: {
    marginRight: Spacing[1],
  },
  iconLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing[1],
  },
  unit: {
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    marginLeft: Spacing[1],
  },
  disabled: {
    opacity: 0.55,
  },
  error: {
    color: Colors.error,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  hint: {
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  helperSpacer: {
    minHeight: 18,
  },
});
