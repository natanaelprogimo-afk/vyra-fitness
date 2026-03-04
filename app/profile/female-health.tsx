// app/profile/female-health.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function FemaleHealthScreen() {
  const { profile, setProfile } = useAuthStore();
  const [enabled, setEnabled]   = useState(profile?.female_health_enabled ?? false);
  const [saving,  setSaving]    = useState(false);

  async function handleToggle(value: boolean) {
    if (value && !enabled) {
      // Mostrar contexto antes de activar
      Alert.alert(
        '🌸 Salud femenina',
        'Al activar este módulo, Vyra adaptará tus recomendaciones de entrenamiento y nutrición según las fases de tu ciclo menstrual.\n\nTus datos son privados y solo vos podés verlos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Activar', onPress: () => save(true) },
        ]
      );
    } else {
      save(value);
    }
  }

  async function save(value: boolean) {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ female_health_enabled: value })
        .eq('id', profile.id)
        .select()
        .single();
      if (error) throw error;
      setEnabled(value);
      setProfile(data);
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🌸 Salud femenina</Text>
        <Text style={styles.subtitle}>
          Módulo completamente opcional. Invisible si no está activado.
        </Text>

        {/* Toggle principal */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleTitle}>Activar módulo</Text>
            <Text style={styles.toggleDesc}>
              Adapta entrenos, nutrición y pasos según las fases de tu ciclo
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: Colors.bgElevated, true: Colors.female }}
            thumbColor="#FFFFFF"
            disabled={saving}
          />
        </View>

        {/* Info de fases */}
        {enabled && (
          <View style={styles.phasesContainer}>
            <Text style={styles.phasesTitle}>Adaptaciones por fase</Text>
            {PHASES.map(phase => (
              <View key={phase.name} style={styles.phaseCard}>
                <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                  <Text style={styles.phaseDesc}>{phase.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Privacidad */}
        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>🔒 Privacidad</Text>
          <Text style={styles.privacyText}>
            Los datos de ciclo están protegidos con seguridad a nivel de fila (RLS). Solo vos podés ver tus datos.
          </Text>
          <Text style={styles.privacyText}>
            ⚠️ La predicción de Vyra es una estimación. No usés esta app como método anticonceptivo.
          </Text>
        </View>

        {enabled && (
          <TouchableOpacity
            style={styles.goToModuleBtn}
            onPress={() => router.push('/modules/female' as any)}
          >
            <Text style={styles.goToModuleBtnText}>Ir al módulo de ciclo →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PHASES = [
  { name: 'Menstrual (Días 1–5)',   color: Colors.error,    desc: 'Movimiento suave, yoga, más hierro y magnesio. Meta pasos −15%.' },
  { name: 'Folicular (Días 6–13)',  color: Colors.steps,    desc: 'Energía alta. Mejor momento para HIIT y PRs.' },
  { name: 'Ovulación (Día 14)',     color: Colors.fasting,  desc: 'Máxima fuerza. Hidratación extra, proteína alta.' },
  { name: 'Lútea (Días 15–28)',     color: Colors.sleep,    desc: 'Volumen reducido, más recovery y proteína.' },
];

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll:      { padding: 20, paddingBottom: 40 },
  backBtn:     { color: Colors.brand, fontSize: 14, marginBottom: 16 },
  title:       { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle:    { color: Colors.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 20 },
  toggleCard: {
    backgroundColor: Colors.bgSurface, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24,
  },
  toggleLeft:  { flex: 1, marginRight: 16 },
  toggleTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  toggleDesc:  { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  phasesContainer: { marginBottom: 24 },
  phasesTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  phaseCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.bgSurface, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  phaseDot:    { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  phaseInfo:   { flex: 1 },
  phaseName:   { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  phaseDesc:   { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  privacyBox: {
    backgroundColor: Colors.bgSurface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24, gap: 8,
  },
  privacyTitle:{ color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  privacyText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  goToModuleBtn: {
    backgroundColor: Colors.female, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  goToModuleBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});