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
import { Colors, withOpacity } from '@/constants/colors';
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
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);
  const borderColor = isFocused ? Colors.action : error ? Colors.error : Colors.bgOverlay;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.container, { borderColor }, disabled && styles.disabled]}>
        {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}

        <TextInput
          {...props}
          style={[
            styles.input,
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
        />

        {unit ? <Text style={styles.unit}>{unit}</Text> : null}

        {secureTextEntry ? (
          <Pressable onPress={() => setIsSecure((value) => !value)} style={styles.iconRight}>
            <Text style={styles.secureToggle}>{isSecure ? '👁️' : '🙈'}</Text>
          </Pressable>
        ) : null}

        {iconRight && !secureTextEntry ? (
          <Pressable onPress={onPressRight} style={styles.iconRight} disabled={!onPressRight}>
            {iconRight}
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
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
    color: Colors.textMuted,
    marginBottom: Spacing[1.5],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 56,
    paddingHorizontal: Spacing[5],
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 18,
    color: Colors.textPrimary,
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
    color: Colors.textMuted,
  },
  secureToggle: {
    fontSize: FontSize.base,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing[1],
    marginLeft: Spacing[1],
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing[1],
    marginLeft: Spacing[1],
  },
});
