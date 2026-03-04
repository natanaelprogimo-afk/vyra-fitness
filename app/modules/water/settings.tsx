// ============================================================
// VYRA FITNESS — Agua: Configuración (meta + recordatorios)
// ============================================================

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
import { validateWaterGoal } from '@/utils/validators';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';

// Metas predefinidas según peso corporal (OMS: 35ml/kg)
const PRESET_GOALS = [
  { label: '1.5L', value: 1500, desc: 'Actividad baja' },
  { label: '2L',   value: 2000, desc: 'Moderada'       },
  { label: '2.5L', value: 2500, desc: 'Recomendada OMS' },
  { label: '3L',   value: 3000, desc: 'Atletas'         },
  { label: '3.5L', value: 3500, desc: 'Clima caluroso'  },
];

export default function WaterSettingsScreen() {
  const profile             = useAuthStore((s) => s.profile);
  const { updateUserProfile, isLoading } = useAuth();

  const [goal,  setGoal]  = useState((profile?.water_goal_ml ?? 2500).toString());
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const ml  = parseInt(goal);
    const err = validateWaterGoal(ml);
    if (err) { setError(err); return; }
    setError(null);
    const ok = await updateUserProfile({ water_goal_ml: ml });
    if (ok) router.back();
  };

  return (
    <SafeScreen scrollable>
      <Header title="Configurar hidratación" showBack />

      {/* Metas rápidas */}
      <Text style={styles.sectionTitle}>Meta diaria</Text>
      <Text style={styles.sectionSub}>La OMS recomienda 2.5L para adultos activos</Text>

      <View style={styles.presets}>
        {PRESET_GOALS.map((p) => (
          <Card
            key={p.value}
            onPress={() => setGoal(p.value.toString())}
            style={parseInt(goal) === p.value ? [styles.presetCard, { borderColor: Colors.water, backgroundColor: `${Colors.water}12` }] : styles.presetCard}
          >
            <Text style={[styles.presetLabel, parseInt(goal) === p.value && { color: Colors.water }]}>
              {p.label}
            </Text>
            <Text style={styles.presetDesc}>{p.desc}</Text>
          </Card>
        ))}
      </View>

      {/* Input personalizado */}
      <Input
        label="O ingresá tu meta personalizada"
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
        unit="ml"
        error={error}
        hint="Entre 500ml y 10,000ml"
        style={styles.input}
      />

      {/* Info sobre ajuste automático */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoEmoji}>💡</Text>
        <Text style={styles.infoText}>
          Podés ajustar tu meta según el clima, tu peso o nivel de actividad. En verano o si hacés mucho ejercicio, aumentá 500-1000ml.
        </Text>
      </Card>

      <Button onPress={handleSave} variant="primary" fullWidth size="lg" loading={isLoading} style={styles.cta}>
        Guardar meta
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginTop: Spacing[4], marginBottom: Spacing[1] },
  sectionSub:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[4] },
  presets:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[5] },
  presetCard:   { width: '30%', alignItems: 'center', paddingVertical: Spacing[3] },
  presetLabel:  { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  presetDesc:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  input:        { marginBottom: Spacing[4] },
  infoCard: {
    flexDirection:   'row',
    gap:             Spacing[3],
    alignItems:      'flex-start',
    backgroundColor: Colors.infoBg,
    borderColor:     `${Colors.info}33`,
    marginBottom:    Spacing[6],
  },
  infoEmoji: { fontSize: 20 },
  infoText:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
  cta:       {},
});