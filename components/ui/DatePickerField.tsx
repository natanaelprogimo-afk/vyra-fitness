import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface DatePickerFieldProps {
  label?: string;
  value: Date;
  onChange: (value: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function DatePickerField({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setShow(true)}
        style={styles.input}
        accessibilityRole="button"
      >
        <View style={styles.inputRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.fasting} />
          <Text style={styles.inputText}>
            {value.toLocaleDateString('es-UY', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>
      </Pressable>
      {show ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(_event, nextValue) => {
            setShow(false);
            if (nextValue) {
              onChange(nextValue);
            }
          }}
        />
      ) : null}
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
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  inputText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
});
