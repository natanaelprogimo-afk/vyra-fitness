import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import SegmentedControl from '@/components/ui/SegmentedControl';
import SettingToggleRow from '@/components/ui/SettingToggleRow';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { resolveSupportedLanguage } from '@/lib/language';
import { useSettingsStore } from '@/stores/settingsStore';

const SCREEN_COPY = {
  es: {
    header: 'Apariencia y unidades',
    noticeTitle: 'Preferencias que ya impactan mas capas',
    noticeBody:
      'Tema, contraste, motion, lectura asistida y escala de texto ya gobiernan launch, primitives y feedback compartido. Aun quedan superficies heredadas por terminar de cerrar.',
    visualEyebrow: 'Sistema visual',
    visualTitle: 'Tema e idioma',
    visualSubtitle: 'El mismo ajuste tiene que sentirse coherente en tabs, auth, launch y settings.',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
    accessibilityEyebrow: 'Accesibilidad',
    accessibilityTitle: 'Preferencias sensoriales',
    accessibilitySubtitle:
      'Reducen friccion en motion, contraste, lectura y jerarquia para flujos largos.',
    textNormal: 'Normal',
    textLarge: 'Grande',
    textExtraLarge: 'Extra grande',
    highContrastTitle: 'Alto contraste',
    highContrastDescription: 'Refuerza bordes y lectura sobre fondos oscuros.',
    reduceMotionTitle: 'Reducir motion',
    reduceMotionDescription: 'Desactiva pulsos y escalas decorativas cuando no son esenciales.',
    screenReaderTitle: 'Modo screen reader',
    screenReaderDescription:
      'Hace mas explicitos labels y avisos importantes en feedback compartido.',
    unitsEyebrow: 'Unidades',
    unitsTitle: 'Base de lectura',
    unitsSubtitle:
      'Los módulos ya no deberían reinterpretar a mano tus unidades principales.',
    languageSystem: 'Sistema',
    languageEs: 'Español',
    languageEn: 'English',
    languagePt: 'Português',
  },
  en: {
    header: 'Appearance and units',
    noticeTitle: 'Preferences that already affect more layers',
    noticeBody:
      'Theme, contrast, motion, assisted reading and text scale already drive launch, primitives and shared feedback. Some legacy surfaces still need to be finished.',
    visualEyebrow: 'Visual system',
    visualTitle: 'Theme and language',
    visualSubtitle: 'The same setting should feel coherent across tabs, auth, launch and settings.',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    accessibilityEyebrow: 'Accessibility',
    accessibilityTitle: 'Sensory preferences',
    accessibilitySubtitle:
      'They reduce friction in motion, contrast, reading and hierarchy during long flows.',
    textNormal: 'Normal',
    textLarge: 'Large',
    textExtraLarge: 'Extra large',
    highContrastTitle: 'High contrast',
    highContrastDescription: 'Strengthens edges and readability over dark surfaces.',
    reduceMotionTitle: 'Reduce motion',
    reduceMotionDescription: 'Turns off decorative pulses and scaling when not essential.',
    screenReaderTitle: 'Screen reader mode',
    screenReaderDescription:
      'Makes labels and important announcements more explicit in shared feedback.',
    unitsEyebrow: 'Units',
    unitsTitle: 'Reading base',
    unitsSubtitle:
      'Modules should no longer reinterpret your main units manually.',
    languageSystem: 'System',
    languageEs: 'Spanish',
    languageEn: 'English',
    languagePt: 'Portuguese',
  },
  pt: {
    header: 'Aparencia e unidades',
    noticeTitle: 'Preferencias que ja afetam mais camadas',
    noticeBody:
      'Tema, contraste, motion, leitura assistida e escala de texto ja governam launch, primitives e feedback compartilhado. Algumas superficies legadas ainda precisam ser fechadas.',
    visualEyebrow: 'Sistema visual',
    visualTitle: 'Tema e idioma',
    visualSubtitle: 'O mesmo ajuste precisa soar coerente entre tabs, auth, launch e settings.',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Escuro',
    accessibilityEyebrow: 'Acessibilidade',
    accessibilityTitle: 'Preferencias sensoriais',
    accessibilitySubtitle:
      'Reduzem friccao em motion, contraste, leitura e hierarquia em fluxos longos.',
    textNormal: 'Normal',
    textLarge: 'Grande',
    textExtraLarge: 'Muito grande',
    highContrastTitle: 'Alto contraste',
    highContrastDescription: 'Reforca bordas e leitura sobre fundos escuros.',
    reduceMotionTitle: 'Reduzir motion',
    reduceMotionDescription: 'Desliga pulsos e escalas decorativas quando nao sao essenciais.',
    screenReaderTitle: 'Modo leitor de tela',
    screenReaderDescription:
      'Deixa labels e avisos importantes mais explicitos no feedback compartilhado.',
    unitsEyebrow: 'Unidades',
    unitsTitle: 'Base de leitura',
    unitsSubtitle:
      'Os módulos não deveriam reinterpretar manualmente suas unidades principais.',
    languageSystem: 'Sistema',
    languageEs: 'Español',
    languageEn: 'English',
    languagePt: 'Português',
  },
} as const;

export default function SettingsAppearanceScreen() {
  const { i18n } = useTranslation();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const language = useSettingsStore((state) => state.language);
  const textScale = useSettingsStore((state) => state.textScale);
  const weightUnit = useSettingsStore((state) => state.weightUnit);
  const heightUnit = useSettingsStore((state) => state.heightUnit);
  const distUnit = useSettingsStore((state) => state.distUnit);
  const volumeUnit = useSettingsStore((state) => state.volumeUnit);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const screenReaderMode = useSettingsStore((state) => state.screenReaderMode);
  const setColorScheme = useSettingsStore((state) => state.setColorScheme);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setTextScale = useSettingsStore((state) => state.setTextScale);
  const setWeightUnit = useSettingsStore((state) => state.setWeightUnit);
  const setHeightUnit = useSettingsStore((state) => state.setHeightUnit);
  const setDistUnit = useSettingsStore((state) => state.setDistUnit);
  const setVolumeUnit = useSettingsStore((state) => state.setVolumeUnit);
  const setHighContrast = useSettingsStore((state) => state.setHighContrast);
  const setReduceMotion = useSettingsStore((state) => state.setReduceMotion);
  const setScreenReaderMode = useSettingsStore((state) => state.setScreenReaderMode);
  const themeSummary =
    colorScheme === 'system' ? copy.system : colorScheme === 'light' ? copy.light : copy.dark;
  const languageSummary =
    language === 'system'
      ? copy.languageSystem
      : language === 'es'
        ? copy.languageEs
        : language === 'en'
          ? copy.languageEn
          : copy.languagePt;
  const textSummary =
    textScale === 'normal' ? copy.textNormal : textScale === 'large' ? copy.textLarge : copy.textExtraLarge;
  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title={copy.header} showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} accentColor={Colors.brand} shadow={false}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>{copy.visualEyebrow}</Text>
            <Text style={styles.heroTitle}>{copy.visualTitle}</Text>
            <Text style={styles.heroBody}>{copy.visualSubtitle}</Text>
          </View>

          <View style={styles.snapshotRow}>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Tema</Text>
              <Text style={styles.snapshotValue}>{themeSummary}</Text>
            </View>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Idioma</Text>
              <Text style={styles.snapshotValue}>{languageSummary}</Text>
            </View>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Lectura</Text>
              <Text style={styles.snapshotValue}>{textSummary}</Text>
            </View>
          </View>
        </Card>

        <NoticeCard title={copy.noticeTitle} body={copy.noticeBody} tone="info" />

        <Card style={styles.card}>
          <SectionHeader
            eyebrow={copy.visualEyebrow}
            title={copy.visualTitle}
            subtitle={copy.visualSubtitle}
          />

          <SegmentedControl
            value={colorScheme}
            onChange={setColorScheme}
            accessibilityLabel={copy.visualTitle}
            options={[
              { value: 'system', label: copy.system },
              { value: 'light', label: copy.light },
              { value: 'dark', label: copy.dark },
            ]}
          />

          <SegmentedControl
            value={language}
            onChange={setLanguage}
            accessibilityLabel={copy.visualTitle}
            options={[
              { value: 'system', label: copy.languageSystem },
              { value: 'es', label: copy.languageEs },
              { value: 'en', label: copy.languageEn },
              { value: 'pt', label: copy.languagePt },
            ]}
          />

        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow={copy.accessibilityEyebrow}
            title={copy.accessibilityTitle}
            subtitle={copy.accessibilitySubtitle}
          />

          <SegmentedControl
            value={textScale}
            onChange={setTextScale}
            accessibilityLabel={copy.accessibilityTitle}
            options={[
              { value: 'normal', label: copy.textNormal },
              { value: 'large', label: copy.textLarge },
              { value: 'extraLarge', label: copy.textExtraLarge },
            ]}
          />

          <View style={styles.toggleStack}>
            <SettingToggleRow
              title={copy.highContrastTitle}
              description={copy.highContrastDescription}
              value={highContrast}
              onValueChange={setHighContrast}
            />
            <SettingToggleRow
              title={copy.reduceMotionTitle}
              description={copy.reduceMotionDescription}
              value={reduceMotion}
              onValueChange={setReduceMotion}
            />
            <SettingToggleRow
              title={copy.screenReaderTitle}
              description={copy.screenReaderDescription}
              value={screenReaderMode}
              onValueChange={setScreenReaderMode}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow={copy.unitsEyebrow}
            title={copy.unitsTitle}
            subtitle={copy.unitsSubtitle}
          />

          <SegmentedControl
            value={weightUnit}
            onChange={setWeightUnit}
            accessibilityLabel="Weight unit"
            options={[
              { value: 'kg', label: 'kg' },
              { value: 'lb', label: 'lb' },
            ]}
          />
          <SegmentedControl
            value={heightUnit}
            onChange={setHeightUnit}
            accessibilityLabel="Height unit"
            options={[
              { value: 'cm', label: 'cm' },
              { value: 'ft', label: 'ft' },
            ]}
          />
          <SegmentedControl
            value={distUnit}
            onChange={setDistUnit}
            accessibilityLabel="Distance unit"
            options={[
              { value: 'km', label: 'km' },
              { value: 'mi', label: 'mi' },
            ]}
          />
          <SegmentedControl
            value={volumeUnit}
            onChange={setVolumeUnit}
            accessibilityLabel="Volume unit"
            options={[
              { value: 'ml', label: 'ml' },
              { value: 'oz', label: 'oz' },
            ]}
          />
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[4],
  },
  heroCopy: {
    gap: 6,
  },
  heroEyebrow: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  heroBody: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  snapshotCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  snapshotLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  snapshotValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    gap: Spacing[4],
  },
  toggleStack: {
    gap: Spacing[2],
  },
});
