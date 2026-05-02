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
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onPressRight?: () => void;
  style?: ViewStyle | ViewStyle[];
  inputStyle?: object;
  disabled?: boolean;
  unit?: string;
  secureToggleAccessibilityLabel?: string;
  rightAccessibilityLabel?: string;
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
  secureToggleAccessibilityLabel = 'Mostrar u ocultar contraseña',
  rightAccessibilityLabel = 'Acción de campo',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);
  const borderColor = isFocused ? Colors.action : error ? Colors.error : Colors.bgOverlay;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={[styles.label, { color: Colors.textMuted }]}>{label}</Text> : null}

      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: Colors.bgElevated,
          },
          disabled && styles.disabled,
        ]}
      >
        {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}

        <TextInput
          {...props}
          style={[
            styles.input,
            { color: Colors.textPrimary },
            iconLeft ? styles.inputWithIconLeft : null,
            unit ? styles.inputWithUnit : null,
            inputStyle,
          ]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.action}
          cursorColor={Colors.action}
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
          maxFontSizeMultiplier={1.35}
        />

        {unit ? <Text style={[styles.unit, { color: Colors.textMuted }]}>{unit}</Text> : null}

        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecure((value) => !value)}
            style={styles.iconRight}
            accessibilityRole="button"
            accessibilityLabel={secureToggleAccessibilityLabel}
            accessibilityHint={isSecure ? 'Muestra la contraseña escrita.' : 'Oculta la contraseña escrita.'}
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

      {error ? <Text style={[styles.error, { color: Colors.error }]}>{error}</Text> : null}
      {hint && !error ? <Text style={[styles.hint, { color: Colors.textMuted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing[3],
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    marginBottom: Spacing[1.5],
    letterSpacing: 0.4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 56,
    paddingHorizontal: Spacing[5],
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    height: '100%',
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
    fontSize: FontSize.sm,
  },
  secureToggle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: Spacing[1],
    marginLeft: Spacing[1],
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: Spacing[1],
    marginLeft: Spacing[1],
  },
});

