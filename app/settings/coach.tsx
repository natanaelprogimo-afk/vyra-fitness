import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  type CoachSpecialty,
  type CoachProactivityLevel,
  getCoachMemory,
  getCoachProactivityLevel,
  getCoachSpecialty,
  withCoachProactivity,
  withCoachSpecialty,
} from '@/lib/coach-settings';

const OPTIONS: Array<{
  id: CoachProactivityLevel;
  title: string;
  description: string;
}> = [
  {
    id: 'normal',
    title: 'Normal',
    description: 'Insights semanales y alertas importantes cuando detectamos riesgo.',
  },
  {
    id: 'active',
    title: 'Activo',
    description: 'Mas observaciones y seguimiento proactivo durante la semana.',
  },
  {
    id: 'silent',
    title: 'Silencioso',
    description: 'El coach solo responde cuando vos le hablas.',
  },
];

const SPECIALTY_OPTIONS: Array<{
  id: CoachSpecialty;
  title: string;
  description: string;
}> = [
  {
    id: 'general_wellbeing',
    title: 'Bienestar general',
    description: 'Balance entre habitos, energia, estres y consistencia.',
  },
  {
    id: 'weight_loss',
    title: 'Perdida de grasa',
    description: 'Enfoque en adherencia nutricional y progreso sostenible.',
  },
  {
    id: 'sport_performance',
    title: 'Rendimiento deportivo',
    description: 'Enfoque en carga, recuperacion y performance.',
  },
  {
    id: 'female_hormonal',
    title: 'Salud hormonal femenina',
    description: 'Enfoque en ciclo, sintomas y ajustes por fase.',
  },
];

export default function CoachSettingsScreen() {
  const { profile, updateProfile } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const [selected, setSelected] = useState<CoachProactivityLevel>(getCoachProactivityLevel(profile));
  const [selectedSpecialty, setSelectedSpecialty] = useState<CoachSpecialty>(getCoachSpecialty(profile));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(getCoachProactivityLevel(profile));
    setSelectedSpecialty(getCoachSpecialty(profile));
  }, [profile?.coach_memory_json, profile?.id]);

  const persistCoachMemory = async (nextMemory: Record<string, unknown>) => {
    if (!profile?.id || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          coach_memory_json: nextMemory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      updateProfile({ coach_memory_json: nextMemory });
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveProactivity = async (next: CoachProactivityLevel) => {
    if (!profile?.id || saving) return;
    setSelected(next);
    const nextMemory = withCoachProactivity(getCoachMemory(profile), next);
    const ok = await persistCoachMemory(nextMemory);
    showToast(
      ok ? 'Nivel de proactividad actualizado.' : 'No se pudo actualizar el modo del coach.',
      ok ? 'success' : 'error',
    );
  };

  const saveSpecialty = async (next: CoachSpecialty) => {
    if (!profile?.id || saving) return;
    setSelectedSpecialty(next);
    const nextMemory = withCoachSpecialty(getCoachMemory(profile), next);
    const ok = await persistCoachMemory(nextMemory);
    showToast(
      ok ? 'Especialidad del coach actualizada.' : 'No se pudo actualizar la especialidad del coach.',
      ok ? 'success' : 'error',
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Coach IA" showBack color={Colors.brand} />
      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Nivel de proactividad</Text>
          <Text style={styles.infoText}>
            Controla con que frecuencia el coach te escribe sin que vos lo pidas.
          </Text>
        </Card>

        <Card style={styles.card}>
          {OPTIONS.map((option) => {
            const isActive = selected === option.id;
            return (
              <Pressable
                key={option.id}
                style={[styles.row, isActive && styles.rowActive]}
                onPress={() => saveProactivity(option.id)}
                disabled={saving}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, isActive && styles.rowTitleActive]}>
                    {option.title}
                  </Text>
                  <Text style={styles.rowDescription}>{option.description}</Text>
                </View>
                <View style={[styles.dot, isActive && styles.dotActive]} />
              </Pressable>
            );
          })}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Especialidad del coach</Text>
          <Text style={styles.infoText}>
            Define en que tipo de recomendaciones queres que el coach ponga mas foco.
          </Text>
        </Card>

        <Card style={styles.card}>
          {SPECIALTY_OPTIONS.map((option) => {
            const isActive = selectedSpecialty === option.id;
            return (
              <Pressable
                key={option.id}
                style={[styles.row, isActive && styles.rowActive]}
                onPress={() => saveSpecialty(option.id)}
                disabled={saving}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, isActive && styles.rowTitleActive]}>
                    {option.title}
                  </Text>
                  <Text style={styles.rowDescription}>{option.description}</Text>
                </View>
                <View style={[styles.dot, isActive && styles.dotActive]} />
              </Pressable>
            );
          })}
        </Card>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  infoCard: {
    gap: Spacing[2],
  },
  infoTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  infoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    padding: 0,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}60`,
  },
  rowActive: {
    backgroundColor: `${Colors.brand}14`,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  rowTitleActive: {
    color: Colors.brand,
  },
  rowDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dotActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brand,
  },
});
