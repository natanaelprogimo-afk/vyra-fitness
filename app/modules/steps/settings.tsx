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
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

const PRESETS = [
  { label: '5.000',  value: 5000,  desc: 'Poco activo'     },
  { label: '7.500',  value: 7500,  desc: 'Moderado'        },
  { label: '10.000', value: 10000, desc: 'OMS recomienda'  },
  { label: '12.000', value: 12000, desc: 'Activo'          },
  { label: '15.000', value: 15000, desc: 'Muy activo'      },
  { label: '20.000', value: 20000, desc: 'Atleta'          },
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
      <Header title="Meta de pasos" showBack />
      <Text style={styles.sub}>La OMS recomienda 10.000 pasos diarios para adultos.</Text>

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