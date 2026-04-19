import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const PHASES = [
  {
    name: 'Menstrual - Dias 1-5',
    color: Colors.error,
    desc: 'Baja un poco la exigencia y prioriza movimiento suave, descanso y recuperacion.',
  },
  {
    name: 'Folicular - Dias 6-13',
    color: Colors.steps,
    desc: 'Suele ser la fase con mas energia y mejor tolerancia al esfuerzo.',
  },
  {
    name: 'Ovulacion - Dia 14',
    color: Colors.fasting,
    desc: 'Puede ser un buen momento para apretar un poco mas si te sientes bien.',
  },
  {
    name: 'Lutea - Dias 15-28',
    color: Colors.sleep,
    desc: 'Conviene vigilar fatiga, descanso y hambre para no forzar de mas.',
  },
];

export default function FemaleHealthScreen() {
  const { profile, setProfile } = useAuthStore();
  const [enabled, setEnabled] = useState(profile?.female_health_enabled ?? false);
  const [saving, setSaving] = useState(false);

  async function handleToggle(nextValue: boolean) {
    if (nextValue && !enabled) {
      Alert.alert(
        'Salud femenina',
        'Al activarlo, VYRA ajusta entrenamiento, nutricion y recuperacion segun tu ciclo. Tu informacion queda privada dentro de tu cuenta.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Activar', onPress: () => void save(nextValue) },
        ],
      );
      return;
    }

    await save(nextValue);
  }

  async function save(nextValue: boolean) {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ female_health_enabled: nextValue })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setEnabled(nextValue);
      setProfile(data);
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Salud femenina</Text>
        <Text style={styles.subtitle}>
          Es un modulo opcional y discreto. Si no lo activas, no aparece en tu dia a dia.
        </Text>

        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleTitle}>Activar seguimiento del ciclo</Text>
            <Text style={styles.toggleDesc}>
              Ajusta recomendaciones de entreno, nutricion y descanso segun la fase actual.
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(value) => void handleToggle(value)}
            trackColor={{ false: Colors.bgElevated, true: Colors.female }}
            thumbColor="#FFFFFF"
            disabled={saving}
          />
        </View>

        {enabled ? (
          <View style={styles.phasesContainer}>
            <Text style={styles.phasesTitle}>Como cambia tu dia</Text>
            {PHASES.map((phase) => (
              <View key={phase.name} style={styles.phaseCard}>
                <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                  <Text style={styles.phaseDesc}>{phase.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>Privacidad</Text>
          <Text style={styles.privacyText}>
            La informacion del ciclo solo aparece dentro de tu cuenta y puedes desactivar este modulo cuando quieras.
          </Text>
          <Text style={styles.privacyText}>
            Esta lectura es orientativa. No uses la app como metodo anticonceptivo ni como reemplazo de atencion medica.
          </Text>
        </View>

        {enabled ? (
          <TouchableOpacity
            style={styles.goToModuleBtn}
            onPress={() => router.push('/modules/female' as never)}
          >
            <Text style={styles.goToModuleBtnText}>Abrir modulo de ciclo</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 20 },
  toggleCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  toggleLeft: { flex: 1, marginRight: 16 },
  toggleTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  toggleDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  phasesContainer: { marginBottom: 24 },
  phasesTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  phaseDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  phaseInfo: { flex: 1 },
  phaseName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  phaseDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  privacyBox: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    gap: 8,
  },
  privacyTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  privacyText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  goToModuleBtn: {
    backgroundColor: `${Colors.female}18`,
    borderWidth: 1,
    borderColor: `${Colors.female}55`,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  goToModuleBtnText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
});
