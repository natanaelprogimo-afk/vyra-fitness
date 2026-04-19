import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { MODULES, type ModuleId } from '@/constants/modules';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { buildProfileContextUpdate } from '@/lib/profile-context';
import { supabase } from '@/lib/supabase';
import { buildProfileContextWithActiveModules, getActiveModules } from '@/lib/active-modules';

function normalizeSelection(modules: ModuleId[]): ModuleId[] {
  return [...new Set(modules)].sort();
}

function sameSelection(a: ModuleId[], b: ModuleId[]): boolean {
  const left = normalizeSelection(a);
  const right = normalizeSelection(b);
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

export default function SettingsModulesScreen() {
  const { profile, setProfile } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<ModuleId[]>(() => getActiveModules(profile));

  const baseline = useMemo(() => getActiveModules(profile), [profile]);
  const hasChanges = !sameSelection(selected, baseline);

  useEffect(() => {
    setSelected(getActiveModules(profile));
  }, [profile]);

  const toggleModule = (moduleId: ModuleId) => {
    setSelected((prev) => {
      if (prev.includes(moduleId)) {
        if (prev.length <= 3) {
          showToast('Mantén al menos 3 módulos activos.', 'warning');
          return prev;
        }
        return prev.filter((item) => item !== moduleId);
      }
      return [...prev, moduleId];
    });
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    if (selected.length < 3) {
      Alert.alert('Módulos insuficientes', 'Tienes que dejar al menos 3 módulos activos.');
      return;
    }

    setSaving(true);
    try {
      const nextContextMemory = buildProfileContextWithActiveModules(profile, selected);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...buildProfileContextUpdate({ memory: nextContextMemory }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;
      setProfile(data);
      showToast('Módulos activos actualizados.', 'success');
      router.back();
    } catch {
      showToast('No se pudieron guardar los módulos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Módulos activos" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>Personaliza tu app</Text>
          <Text style={styles.subtitle}>
            Elige qué módulos quieres ver primero en Home y en el registro rápido.
          </Text>

          <View style={styles.chips}>
            {MODULES.map((module) => {
              const isSelected = selected.includes(module.id as ModuleId);
              return (
                <Pressable
                  key={module.id}
                  onPress={() => toggleModule(module.id as ModuleId)}
                  style={[
                    styles.chip,
                    isSelected && {
                      borderColor: module.color,
                      backgroundColor: `${module.color}14`,
                    },
                  ]}
                >
                  <Text style={styles.chipEmoji}>{module.emoji}</Text>
                  <Text style={[styles.chipLabel, isSelected && { color: module.color }]}>
                    {module.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.helperCard}>
          <Text style={styles.helperTitle}>Salud femenina</Text>
          <Text style={styles.helperText}>
            La activación sensible del ciclo ya no vive en Perfil. Si necesitas encenderlo
            o ajustar tus datos base, hacelo desde la configuración dedicada del módulo.
          </Text>
          <Button
            label={
              profile?.female_health_enabled
                ?  'Abrir configuración del ciclo'
                : 'Configurar módulo'
            }
            onPress={() => router.push(Routes.profile.femaleHealth as never)}
            variant="secondary"
            color={Colors.female}
            fullWidth
          />
        </Card>

        <Button
          label={saving ? 'Guardando...' : 'Guardar módulos'}
          onPress={handleSave}
          disabled={saving || !hasChanges}
          color={Colors.brand}
        />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing[4],
  },
  helperCard: {
    gap: Spacing[3],
  },
  helperTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  helperText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
