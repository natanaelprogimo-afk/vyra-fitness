import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import Button from '@/components/ui/Button';
import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { loadFastingSettings, parseTimeInput, saveFastingSettings, type FastingSettings } from '@/lib/fasting-settings';

const SCREEN_BG = '#160f0d';
const CARD_BG = '#1e1412';
const TILE_BG = '#261916';
const BORDER = 'rgba(243, 112, 53, 0.14)';

function ToggleRow({ title, body, value, onValueChange }: { title: string; body: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleBody}>{body}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3a2620', true: withOpacity(Colors.fasting, 0.42) }}
        thumbColor={value ? Colors.fasting : '#a9928b'}
      />
    </View>
  );
}

export default function FastingSettingsScreen() {
  const [settings, setSettings] = useState<FastingSettings | null>(null);
  const [timeValue, setTimeValue] = useState('12:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadFastingSettings().then((value) => {
      if (!mounted) return;
      setSettings(value);
      setTimeValue(value.defaultStartTime ?? '12:00');
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!settings) return null;

  const handleSave = async () => {
    const parsed = parseTimeInput(timeValue);
    if (!parsed) return;
    setSaving(true);
    const next = await saveFastingSettings({
      ...settings,
      defaultStartTime: `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`,
    });
    setSettings(next);
    setSaving(false);
    router.back();
  };

  return (
    <SafeScreen backgroundColor={SCREEN_BG} disableAtmosphere padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ajustes de ayuno</Text>
            <Text style={styles.subtitle}>Timer · fases · avisos</Text>
          </View>
          <Text style={styles.headerLink}>timer</Text>
        </View>

        <FastingModuleTabs active="settings" />

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Notificaciones</Text>
          <ToggleRow title="Aviso de inicio" body="Te recuerda cuando empieza tu ventana elegida." value={settings.notifyStart} onValueChange={(value) => setSettings((current) => (current ? { ...current, notifyStart: value } : current))} />
          <ToggleRow title="Meta de horas" body="Avisa cuando cerraste el objetivo del protocolo." value={settings.notifyComplete} onValueChange={(value) => setSettings((current) => (current ? { ...current, notifyComplete: value } : current))} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Experiencia</Text>
          <ToggleRow title="Mostrar fases" body="Mantiene mensajes simples dentro del timer mientras ayunás." value={settings.showPhaseLabels} onValueChange={(value) => setSettings((current) => (current ? { ...current, showPhaseLabels: value } : current))} />
          <ToggleRow title="Predicciones" body='Ejemplo: "En 2h entrás en quema máxima".' value={settings.showPredictions} onValueChange={(value) => setSettings((current) => (current ? { ...current, showPredictions: value } : current))} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Hora base</Text>
          <TextInput value={timeValue} onChangeText={setTimeValue} placeholder="12:00" placeholderTextColor="#866f69" style={styles.input} />
          <Text style={styles.baseHint}>Es la primera comida del día. De ahí parte la ventana por defecto.</Text>
        </View>

        <Button label={saving ? 'Guardando...' : 'Guardar ajustes'} onPress={handleSave} color={Colors.fasting} disabled={saving || !parseTimeInput(timeValue)} fullWidth />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#fff',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#a9928b',
  },
  headerLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#ffd2bf',
    marginTop: 8,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: Spacing[4],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: '#a9928b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[2],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
  toggleBody: {
    marginTop: 2,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#a9928b',
    lineHeight: 18,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: TILE_BG,
    paddingHorizontal: Spacing[3],
    color: '#fff',
    fontFamily: FontFamily.bold,
    fontSize: 24,
    textAlign: 'center',
  },
  baseHint: {
    marginTop: Spacing[2],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#d3b5aa',
  },
});
