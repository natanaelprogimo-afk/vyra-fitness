// ============================================================
// VYRA FITNESS — Pasos: Configurar meta
// ============================================================

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

const PRESETS = [
  { label: '6.000',  value: 6000,  desc: 'Base realista'   },
  { label: '7.500',  value: 7500,  desc: 'Buen ritmo'      },
  { label: '9.000',  value: 9000,  desc: 'Activo'          },
  { label: '10.500', value: 10500, desc: 'Muy activo'      },
  { label: '12.000', value: 12000, desc: 'Reto fuerte'     },
  { label: '15.000', value: 15000, desc: 'Nivel atleta'    },
];

export default function StepsSettingsScreen() {
  const profile             = useAuthStore((s) => s.profile);
  const { updateUserProfile, isLoading } = useAuth();
  const [goal,  setGoal]  = useState((profile?.step_goal ?? 10000).toString());
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const n = parseInt(goal);
    if (isNaN(n) || n < 1000 || n > 100000) { setError('Ingresá entre 1.000 y 100.000 pasos'); return; }
    setError(null);
    const ok = await updateUserProfile({ step_goal: n });
    if (ok) router.back();
  };

  return (
    <SafeScreen scrollable>
      <Header eyebrow="Pasos" title="Meta" showBack color={Colors.steps} />
      <Text style={styles.sub}>Empieza con una meta que puedas sostener de verdad. Si luego te queda corta, la subes.</Text>

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => setGoal(p.value.toString())}
            style={[styles.preset, parseInt(goal) === p.value && styles.presetActive]}
          >
            <Text style={[styles.presetLabel, parseInt(goal) === p.value && { color: Colors.steps }]}>{p.label}</Text>
            <Text style={styles.presetDesc}>{p.desc}</Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Meta personalizada"
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
        unit="pasos"
        error={error}
        style={styles.input}
      />

      <Button onPress={handleSave} variant="primary" fullWidth size="lg" loading={isLoading}>
        Guardar
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  sub:         { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing[2], marginBottom: Spacing[5] },
  presets:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[5] },
  preset:      { width: '30%', alignItems: 'center', paddingVertical: Spacing[3], backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border },
  presetActive:{ borderColor: Colors.steps, backgroundColor: `${Colors.steps}12` },
  presetLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  presetDesc:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  input:       { marginBottom: Spacing[6] },
});
