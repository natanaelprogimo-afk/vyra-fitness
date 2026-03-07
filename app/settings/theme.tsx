import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settingsStore';

const OPTIONS: Array<{ label: string; value: 'dark' | 'light' | 'system'; description: string }> = [
  { label: 'Oscuro', value: 'dark', description: 'Tema oscuro Vyra' },
  { label: 'Claro', value: 'light', description: 'Tema claro para día' },
  { label: 'Sistema', value: 'system', description: 'Sigue la configuración del dispositivo' },
];

export default function SettingsThemeScreen() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Tema" showBack color={Colors.brand} />
      <View style={styles.content}>
        <Card style={styles.card}>
          {OPTIONS.map((option) => {
            const active = option.value === colorScheme;
            return (
              <Pressable
                key={option.value}
                onPress={() => setColorScheme(option.value)}
                style={styles.row}
              >
                <View style={styles.rowText}>
                  <Text style={styles.title}>{option.label}</Text>
                  <Text style={styles.subtitle}>{option.description}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })}
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
    padding: 0,
    overflow: 'hidden',
    borderRadius: Radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}60`,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.brand,
    backgroundColor: `${Colors.brand}20`,
  },
  check: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.brand,
    lineHeight: 16,
  },
});
