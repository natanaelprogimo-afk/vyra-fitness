import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/stores/settingsStore';

const THEME_OPTIONS = [
  { label: 'Oscuro', value: 'dark', description: 'Tema oscuro Vyra' },
  { label: 'Claro', value: 'light', description: 'Tema claro para día' },
  { label: 'Sistema', value: 'system', description: 'Sigue la configuración del dispositivo' },
];

const LANG_OPTIONS = [
  { id: 'system', title: 'Seguir al sistema', helper: 'Usa el idioma del teléfono automáticamente.' },
  { id: 'es', title: 'Español', helper: 'Toda la experiencia en español.' },
  { id: 'en', title: 'English', helper: 'Full experience in English.' },
];

export default function SettingsAppearanceScreen() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const heightUnit = useSettingsStore((s) => s.heightUnit);
  const distUnit = useSettingsStore((s) => s.distUnit);
  const volumeUnit = useSettingsStore((s) => s.volumeUnit);
  const setWeightUnit = useSettingsStore((s) => s.setWeightUnit);
  const setHeightUnit = useSettingsStore((s) => s.setHeightUnit);
  const setDistUnit = useSettingsStore((s) => s.setDistUnit);
  const setVolumeUnit = useSettingsStore((s) => s.setVolumeUnit);

  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header title="Apariencia y región" showBack color={Colors.brand} />

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Tema</Text>
          {THEME_OPTIONS.map((opt) => {
            const active = opt.value === colorScheme;
            return (
              <Pressable key={opt.value} onPress={() => setColorScheme(opt.value as any)} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.title}>{opt.label}</Text>
                  <Text style={styles.subtitle}>{opt.description}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>{active ? <Text style={styles.check}>✓</Text> : null}</View>
              </Pressable>
            );
          })}
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
          {LANG_OPTIONS.map((opt) => (
            <Pressable key={opt.id} onPress={() => setLanguage(opt.id as any)} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.title}>{opt.title}</Text>
                <Text style={styles.subtitle}>{opt.helper}</Text>
              </View>
              <View style={[styles.radio, language === opt.id && styles.radioActive]}>{language === opt.id ? <Text style={styles.check}>✓</Text> : null}</View>
            </Pressable>
          ))}
        </Card>

      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing[5], paddingTop: Spacing[5], paddingBottom: Spacing[10], gap: Spacing[4] },
  card: { gap: Spacing[3] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: `${Colors.border}60` },
  rowText: { flex: 1, gap: 2 },
  title: { fontFamily: FontFamily.semibold, fontSize: FontSize.base, color: Colors.textPrimary },
  subtitle: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.brand, backgroundColor: `${Colors.brand}20` },
  check: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.brand, lineHeight: 16 },
  segmentRow: { flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[2] },
  segmentOption: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingVertical: Spacing[2], alignItems: 'center', backgroundColor: Colors.bgSurface },
  segmentOptionActive: { borderColor: Colors.brand, backgroundColor: `${Colors.brand}15` },
  segmentOptionText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  segmentOptionTextActive: { color: Colors.brand, fontFamily: FontFamily.bold },
});
