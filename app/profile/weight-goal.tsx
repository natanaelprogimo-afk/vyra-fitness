// app/profile/weight-goal.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { calculateBMI, getBMICategory, BMI_CATEGORY_LABELS } from '@/utils/calculations';

export default function WeightGoalScreen() {
  const { profile, setProfile } = useAuthStore();

  const [currentKg, setCurrentKg] = useState(
    String(profile?.weight_start_kg ?? '')
  );
  const [goalKg, setGoalKg] = useState(
    String(profile?.weight_goal_kg ?? '')
  );
  const [saving, setSaving] = useState(false);

  const bmi = profile?.height_cm && currentKg
    ? calculateBMI(parseFloat(currentKg), profile.height_cm)
    : null;

  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  async function handleSave() {
    if (!profile?.id) return;
    const current = parseFloat(currentKg);
    const goal    = parseFloat(goalKg);
    if (isNaN(current) || current < 30 || current > 300) {
      Alert.alert('Peso inválido', 'Ingresá un peso entre 30 y 300 kg.');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          weight_start_kg: current,
          weight_goal_kg:  isNaN(goal) ? null : goal,
        })
        .eq('id', profile.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Peso y objetivo</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Peso actual (kg)</Text>
          <TextInput
            style={styles.input}
            value={currentKg}
            onChangeText={setCurrentKg}
            keyboardType="decimal-pad"
            placeholder="ej: 75.5"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {bmi && bmiCategory && (
          <View style={styles.bmiRow}>
            <Text style={styles.bmiLabel}>IMC:</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
            <Text style={styles.bmiCategory}>
              — {BMI_CATEGORY_LABELS[bmiCategory.category]}
            </Text>
            <Text style={styles.bmiDisclaimer}> ⓘ</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Peso objetivo (kg) — opcional</Text>
          <TextInput
            style={styles.input}
            value={goalKg}
            onChangeText={setGoalKg}
            keyboardType="decimal-pad"
            placeholder="ej: 70"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <Text style={styles.disclaimer}>
          ⓘ IMC y % de grasa son aproximaciones. Para diagnóstico médico consultá a tu médico.
        </Text>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bgPrimary },
  inner:       { padding: 20 },
  backBtn:     { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title:       { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 24 },
  field:       { marginBottom: 20 },
  label:       { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: Colors.bgSurface, color: Colors.textPrimary,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, borderWidth: 1, borderColor: Colors.border,
  },
  bmiRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  bmiLabel:     { color: Colors.textSecondary, fontSize: 14 },
  bmiValue:     { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  bmiCategory:  { color: Colors.textSecondary, fontSize: 14 },
  bmiDisclaimer:{ color: Colors.textMuted, fontSize: 12 },
  disclaimer:   { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 24 },
  saveBtn: {
    backgroundColor: Colors.brand, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});