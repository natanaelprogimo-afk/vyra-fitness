import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settingsStore';

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmentBlock}>
      <Text style={styles.segmentLabel}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.segmentOption, active && styles.segmentOptionActive]}
            >
              <Text style={[styles.segmentOptionText, active && styles.segmentOptionTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsUnitsScreen() {
  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const heightUnit = useSettingsStore((s) => s.heightUnit);
  const distUnit = useSettingsStore((s) => s.distUnit);
  const volumeUnit = useSettingsStore((s) => s.volumeUnit);
  const setWeightUnit = useSettingsStore((s) => s.setWeightUnit);
  const setHeightUnit = useSettingsStore((s) => s.setHeightUnit);
  const setDistUnit = useSettingsStore((s) => s.setDistUnit);
  const setVolumeUnit = useSettingsStore((s) => s.setVolumeUnit);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Unidades" showBack color={Colors.brand} />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Segmented
            label="Peso"
            options={[
              { label: 'kg', value: 'kg' },
              { label: 'lb', value: 'lb' },
            ]}
            value={weightUnit}
            onChange={(value) => setWeightUnit(value as 'kg' | 'lb')}
          />
          <Segmented
            label="Altura"
            options={[
              { label: 'cm', value: 'cm' },
              { label: 'ft', value: 'ft' },
            ]}
            value={heightUnit}
            onChange={(value) => setHeightUnit(value as 'cm' | 'ft')}
          />
          <Segmented
            label="Distancia"
            options={[
              { label: 'km', value: 'km' },
              { label: 'mi', value: 'mi' },
            ]}
            value={distUnit}
            onChange={(value) => setDistUnit(value as 'km' | 'mi')}
          />
          <Segmented
            label="Volumen"
            options={[
              { label: 'ml', value: 'ml' },
              { label: 'oz', value: 'oz' },
            ]}
            value={volumeUnit}
            onChange={(value) => setVolumeUnit(value as 'ml' | 'oz')}
          />
        </Card>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
  },
  card: {
    gap: Spacing[4],
  },
  segmentBlock: {
    gap: Spacing[2],
  },
  segmentLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  segmentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
  },
  segmentOptionActive: {
    borderColor: Colors.brand,
    backgroundColor: `${Colors.brand}15`,
  },
  segmentOptionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  segmentOptionTextActive: {
    color: Colors.brand,
    fontFamily: FontFamily.bold,
  },
});
