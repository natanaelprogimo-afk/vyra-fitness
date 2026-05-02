import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';
import { Colors } from '@/constants/colors';

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputStyle?: StyleProp<ViewStyle | TextStyle>;
  error?: string | null;
}

export default function TimePicker({ label, value, onChange, placeholder = '', inputStyle, error }: Props) {
  const [show, setShow] = useState(false);

  const parsed = useMemo(() => {
    const parts = (value || '').split(':');
    if (parts.length !== 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return { h: Math.max(0, Math.min(23, Math.floor(h))), m: Math.max(0, Math.min(59, Math.floor(m))) };
  }, [value]);

  const dateValue = useMemo(() => {
    const d = new Date();
    if (parsed) d.setHours(parsed.h, parsed.m, 0, 0);
    return d;
  }, [parsed]);

  const onChangeInternal = (_event: unknown, selected?: Date | undefined) => {
    setShow(Platform.OS === 'ios');
    if (!selected) return;
    const hh = String(selected.getHours()).padStart(2, '0');
    const mm = String(selected.getMinutes()).padStart(2, '0');
    onChange(`${hh}:${mm}`);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => setShow(true)}
        style={styles.input}
        accessibilityRole="button"
      >
        <Text style={[styles.inputText, inputStyle as StyleProp<TextStyle>, !value && styles.placeholder]}>{value || placeholder}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'android' ? 'clock' : 'spinner'}
          onChange={onChangeInternal}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  input: {
    borderRadius: Radius.lg,
    padding: Spacing[3],
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  placeholder: {
    color: Colors.textSecondary,
  },
  error: {
    color: Colors.warning,
    marginTop: 6,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
  },
});
