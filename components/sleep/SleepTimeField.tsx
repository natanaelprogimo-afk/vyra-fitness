import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { SLEEP_INPUT_BG } from '@/lib/sleep-module';

function buildDefaultTime(hour: number, minute = 0) {
  const value = new Date();
  value.setHours(hour, minute, 0, 0);
  return value;
}

export default function SleepTimeField({
  label,
  value,
  placeholder,
  defaultHour,
  onChange,
}: {
  label: string;
  value: Date | null;
  placeholder: string;
  defaultHour: number;
  onChange: (value: Date) => void;
}) {
  const [showIosPicker, setShowIosPicker] = useState(false);
  const resolvedValue = useMemo(() => value ?? buildDefaultTime(defaultHour), [defaultHour, value]);

  const handleChange = (_event: DateTimePickerEvent, nextValue?: Date) => {
    if (nextValue) {
      const picked = buildDefaultTime(nextValue.getHours(), nextValue.getMinutes());
      onChange(picked);
    }
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: resolvedValue,
        mode: 'time',
        is24Hour: true,
        onChange: handleChange,
      });
      return;
    }
    setShowIosPicker((current) => !current);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={openPicker} style={styles.field}>
        <View style={styles.fieldCopy}>
          <Text style={[styles.value, !value && styles.valuePlaceholder]}>
            {value
              ? value.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
              : placeholder}
          </Text>
          <Text style={styles.hint}>Selector nativo del sistema</Text>
        </View>
        <Ionicons name="time-outline" size={20} color={Colors.sleep} />
      </Pressable>
      {Platform.OS === 'ios' && showIosPicker ? (
        <View style={styles.iosWrap}>
          <DateTimePicker
            value={resolvedValue}
            mode="time"
            display="spinner"
            onChange={handleChange}
            textColor={Colors.textPrimary}
            themeVariant="dark"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[2],
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  field: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.16),
    backgroundColor: SLEEP_INPUT_BG,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  fieldCopy: {
    gap: 2,
    flex: 1,
  },
  value: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  valuePlaceholder: {
    color: Colors.textMuted,
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  iosWrap: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: SLEEP_INPUT_BG,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.14),
  },
});

