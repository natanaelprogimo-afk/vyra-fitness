import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { validateWaterGoal } from '@/utils/validators';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';

const PRESET_GOALS = [
  { label: '1.5L', value: 1500, desc: 'Actividad baja' },
  { label: '2L', value: 2000, desc: 'Moderada' },
  { label: '2.5L', value: 2500, desc: 'Recomendada' },
  { label: '3L', value: 3000, desc: 'Atletas' },
  { label: '3.5L', value: 3500, desc: 'Clima caluroso' },
];

export default function WaterSettingsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const { updateUserProfile, isLoading } = useAuth();
  const waterGlassMl = useSettingsStore((state) => state.waterGlassMl);
  const waterLargeGlassMl = useSettingsStore((state) => state.waterLargeGlassMl);
  const waterBottleMl = useSettingsStore((state) => state.waterBottleMl);
  const setWaterGlassMl = useSettingsStore((state) => state.setWaterGlassMl);
  const setWaterLargeGlassMl = useSettingsStore((state) => state.setWaterLargeGlassMl);
  const setWaterBottleMl = useSettingsStore((state) => state.setWaterBottleMl);

  const [goal, setGoal] = useState((profile?.water_goal_ml ?? 2500).toString());
  const [glass, setGlass] = useState(String(waterGlassMl));
  const [largeGlass, setLargeGlass] = useState(String(waterLargeGlassMl));
  const [bottle, setBottle] = useState(String(waterBottleMl));
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const ml = parseInt(goal, 10);
    const err = validateWaterGoal(ml);
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setWaterGlassMl(parseInt(glass, 10) || waterGlassMl);
    setWaterLargeGlassMl(parseInt(largeGlass, 10) || waterLargeGlassMl);
    setWaterBottleMl(parseInt(bottle, 10) || waterBottleMl);
    const ok = await updateUserProfile({ water_goal_ml: ml });
    if (ok) router.back();
  };

  return (
    <SafeScreen scrollable>
      <Header eyebrow="Ajustes" title="Agua" showBack color={Colors.water} />

      <Text style={styles.sectionTitle}>Meta diaria</Text>
      <Text style={styles.sectionSub}>Elige una base realista y deja que la app la ajuste según el contexto.</Text>

      <View style={styles.presets}>
        {PRESET_GOALS.map((preset) => (
          <Card
            key={preset.value}
            onPress={() => setGoal(preset.value.toString())}
            style={
              parseInt(goal, 10) === preset.value
                ? [styles.presetCard, { borderColor: Colors.water, backgroundColor: `${Colors.water}12` }]
                : styles.presetCard
            }
          >
            <Text style={[styles.presetLabel, parseInt(goal, 10) === preset.value && { color: Colors.water }]}>
              {preset.label}
            </Text>
            <Text style={styles.presetDesc}>{preset.desc}</Text>
          </Card>
        ))}
      </View>

      <Input
        label="Meta personalizada"
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
        unit="ml"
        error={error}
        hint="Entre 500ml y 10.000ml"
        style={styles.input}
      />

      <Card style={styles.infoCard}>
        <Text style={styles.infoEmoji}>Ajuste</Text>
        <Text style={styles.infoText}>
          VYRA puede subir tu meta si hace calor, si estás en ayuno o si el día viene con mucha actividad.
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Objetos rápidos</Text>
      <Text style={styles.sectionSub}>Ajusta una vez cuánto hay en tus recipientes reales.</Text>

      <Input
        label="Un vaso"
        value={glass}
        onChangeText={setGlass}
        keyboardType="numeric"
        unit="ml"
        style={styles.input}
      />
      <Input
        label="Vaso grande"
        value={largeGlass}
        onChangeText={setLargeGlass}
        keyboardType="numeric"
        unit="ml"
        style={styles.input}
      />
      <Input
        label="Botella"
        value={bottle}
        onChangeText={setBottle}
        keyboardType="numeric"
        unit="ml"
        style={styles.input}
      />

      <Card style={styles.infoCard}>
        <Text style={styles.infoEmoji}>Aviso</Text>
        <Text style={styles.infoText}>
          Los recordatorios viven en notificaciones generales. Desde aquí solo dejas afinada la parte operativa.
        </Text>
      </Card>

      <Button onPress={() => router.push(Routes.settings.notificationsSettings as never)} variant="secondary" fullWidth color={Colors.water}>
        Abrir notificaciones
      </Button>

      <Button onPress={handleSave} variant="primary" fullWidth size="lg" loading={isLoading} style={styles.cta}>
        Guardar ajustes
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginTop: Spacing[4],
    marginBottom: Spacing[1],
  },
  sectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[4],
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[5],
  },
  presetCard: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  presetLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  presetDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  input: {
    marginBottom: Spacing[3],
  },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
    backgroundColor: Colors.infoBg,
    borderColor: `${Colors.info}33`,
    marginBottom: Spacing[4],
  },
  infoEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.info,
  },
  infoText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  cta: {},
});
