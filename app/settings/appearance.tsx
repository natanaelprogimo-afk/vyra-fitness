import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settingsStore';

const THEME_OPTIONS: Array<{
  label: string;
  value: 'dark' | 'light' | 'system';
  description: string;
}> = [
  { label: 'Oscuro', value: 'dark', description: 'Tema oscuro Vyra' },
  { label: 'Claro', value: 'light', description: 'Tema claro para el dia' },
  { label: 'Sistema', value: 'system', description: 'Sigue la configuracion del dispositivo' },
];

const LANG_OPTIONS: Array<{
  id: 'system' | 'es' | 'en';
  title: string;
  helper: string;
}> = [
  { id: 'system', title: 'Seguir al sistema', helper: 'Usa el idioma del telefono automaticamente.' },
  { id: 'es', title: 'Espanol', helper: 'Toda la experiencia en espanol.' },
  { id: 'en', title: 'English', helper: 'Full experience in English.' },
];

export default function SettingsAppearanceScreen() {
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const setColorScheme = useSettingsStore((state) => state.setColorScheme);
  const weightUnit = useSettingsStore((state) => state.weightUnit);
  const heightUnit = useSettingsStore((state) => state.heightUnit);
  const distUnit = useSettingsStore((state) => state.distUnit);
  const volumeUnit = useSettingsStore((state) => state.volumeUnit);
  const setWeightUnit = useSettingsStore((state) => state.setWeightUnit);
  const setHeightUnit = useSettingsStore((state) => state.setHeightUnit);
  const setDistUnit = useSettingsStore((state) => state.setDistUnit);
  const setVolumeUnit = useSettingsStore((state) => state.setVolumeUnit);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const setHighContrast = useSettingsStore((state) => state.setHighContrast);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header title="Apariencia y region" showBack color={Colors.brand} />

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Tema</Text>
          {THEME_OPTIONS.map((option) => {
            const active = option.value === colorScheme;
            return (
              <Pressable key={option.value} onPress={() => setColorScheme(option.value)} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.title}>{option.label}</Text>
                  <Text style={styles.subtitle}>{option.description}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <Text style={styles.check}>OK</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Accesibilidad</Text>
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.title}>Alto contraste</Text>
              <Text style={styles.subtitle}>
                Refuerza bordes y lectura sobre fondos oscuros para pantallas con menos legibilidad.
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: Colors.border, true: `${Colors.brand}66` }}
              thumbColor={highContrast ? Colors.brand : Colors.textMuted}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Unidades</Text>
          <View style={styles.segmentRow}>
            <Pressable style={[styles.segmentOption, weightUnit === 'kg' && styles.segmentOptionActive]} onPress={() => setWeightUnit('kg')}>
              <Text style={[styles.segmentOptionText, weightUnit === 'kg' && styles.segmentOptionTextActive]}>kg</Text>
            </Pressable>
            <Pressable style={[styles.segmentOption, weightUnit === 'lb' && styles.segmentOptionActive]} onPress={() => setWeightUnit('lb')}>
              <Text style={[styles.segmentOptionText, weightUnit === 'lb' && styles.segmentOptionTextActive]}>lb</Text>
            </Pressable>
          </View>
          <View style={styles.segmentRow}>
            <Pressable style={[styles.segmentOption, heightUnit === 'cm' && styles.segmentOptionActive]} onPress={() => setHeightUnit('cm')}>
              <Text style={[styles.segmentOptionText, heightUnit === 'cm' && styles.segmentOptionTextActive]}>cm</Text>
            </Pressable>
            <Pressable style={[styles.segmentOption, heightUnit === 'ft' && styles.segmentOptionActive]} onPress={() => setHeightUnit('ft')}>
              <Text style={[styles.segmentOptionText, heightUnit === 'ft' && styles.segmentOptionTextActive]}>ft</Text>
            </Pressable>
          </View>
          <View style={styles.segmentRow}>
            <Pressable style={[styles.segmentOption, distUnit === 'km' && styles.segmentOptionActive]} onPress={() => setDistUnit('km')}>
              <Text style={[styles.segmentOptionText, distUnit === 'km' && styles.segmentOptionTextActive]}>km</Text>
            </Pressable>
            <Pressable style={[styles.segmentOption, distUnit === 'mi' && styles.segmentOptionActive]} onPress={() => setDistUnit('mi')}>
              <Text style={[styles.segmentOptionText, distUnit === 'mi' && styles.segmentOptionTextActive]}>mi</Text>
            </Pressable>
          </View>
          <View style={styles.segmentRow}>
            <Pressable style={[styles.segmentOption, volumeUnit === 'ml' && styles.segmentOptionActive]} onPress={() => setVolumeUnit('ml')}>
              <Text style={[styles.segmentOptionText, volumeUnit === 'ml' && styles.segmentOptionTextActive]}>ml</Text>
            </Pressable>
            <Pressable style={[styles.segmentOption, volumeUnit === 'oz' && styles.segmentOptionActive]} onPress={() => setVolumeUnit('oz')}>
              <Text style={[styles.segmentOptionText, volumeUnit === 'oz' && styles.segmentOptionTextActive]}>oz</Text>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Idioma</Text>
          {LANG_OPTIONS.map((option) => (
            <Pressable key={option.id} onPress={() => setLanguage(option.id)} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.title}>{option.title}</Text>
                <Text style={styles.subtitle}>{option.helper}</Text>
              </View>
              <View style={[styles.radio, language === option.id && styles.radioActive]}>
                {language === option.id ? <Text style={styles.check}>OK</Text> : null}
              </View>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}60`,
    minHeight: 56,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: `${Colors.border}60`,
    minHeight: 56,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 10,
    color: Colors.brand,
    lineHeight: 12,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },
  segmentOption: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
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
