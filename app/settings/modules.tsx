import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import {
  DEFAULT_ACTIVE_MODULES,
  MODULES,
  type ModuleId,
  type ModuleTier,
} from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { buildProfileContextUpdate } from '@/lib/profile-context';
import { supabase } from '@/lib/supabase';
import { buildProfileContextWithActiveModules, getActiveModules } from '@/lib/active-modules';

const MODULE_GROUPS: Array<{
  tier: ModuleTier;
  title: string;
  description: string;
}> = [
  {
    tier: 'core',
    title: 'Core',
    description: 'Sostienen Inicio, Quick Log y la lectura principal de progreso.',
  },
  {
    tier: 'contextual',
    title: 'Contextuales',
    description: 'Suman valor real sin competir con el núcleo diario del producto.',
  },
] as const;

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
  const isRecommendedSelection = sameSelection(selected, DEFAULT_ACTIVE_MODULES);

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
      showToast('Tienes que dejar al menos 3 módulos activos.', 'warning');
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
        <Card style={styles.introCard}>
          <Text style={styles.title}>Ordena VYRA a tu manera</Text>
          <Text style={styles.subtitle}>
            Los módulos core son la base recomendada. Los contextuales quedan como apoyo
            cuando realmente suman a tu día.
          </Text>

          {!isRecommendedSelection ? (
            <Button
              label="Volver al set recomendado"
              onPress={() => setSelected(DEFAULT_ACTIVE_MODULES)}
              variant="secondary"
              color={Colors.brand}
              fullWidth
            />
          ) : (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>Base recomendada activa</Text>
            </View>
          )}
        </Card>

        {MODULE_GROUPS.map((group) => {
          const modules = MODULES.filter((module) => module.tier === group.tier);
          return (
            <Card key={group.tier} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
              </View>

              <View style={styles.moduleGrid}>
                {modules.map((module) => {
                  const moduleId = module.id as ModuleId;
                  const isSelected = selected.includes(moduleId);

                  return (
                    <Pressable
                      key={module.id}
                      onPress={() => toggleModule(moduleId)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={module.name}
                      accessibilityHint={
                        isSelected
                          ? `Desactiva ${module.name} si quieres simplificar tu stack diario.`
                          : `Activa ${module.name} dentro de tus módulos visibles.`
                      }
                      style={[
                        styles.moduleCard,
                        isSelected && {
                          borderColor: module.color,
                          backgroundColor: withOpacity(module.color, 0.1),
                        },
                      ]}
                    >
                      <View style={styles.moduleTopRow}>
                        <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                        {isSelected ? (
                          <View
                            style={[
                              styles.activePill,
                              { backgroundColor: withOpacity(module.color, 0.16) },
                            ]}
                          >
                            <Text style={[styles.activePillText, { color: module.color }]}>
                              Activo
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.moduleName}>{module.name}</Text>
                      <Text style={styles.moduleDescription}>{module.description}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          );
        })}

        <Card style={styles.helperCard}>
          <Text style={styles.helperTitle}>Salud femenina</Text>
          <Text style={styles.helperText}>
            El encendido sensible del ciclo ya no vive en Perfil. Si necesitas activarlo
            o ajustar tus datos base, hazlo desde la configuración dedicada del módulo.
          </Text>
          <Button
            label={
              profile?.female_health_enabled
                ? 'Abrir configuración del ciclo'
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

        <ScreenFooterSpacer extra={Spacing[2]} />
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
  introCard: {
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.brand, 0.12),
  },
  recommendedBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  groupCard: {
    gap: Spacing[3],
  },
  groupHeader: {
    gap: Spacing[1],
  },
  groupTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  groupDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  moduleCard: {
    width: '47%',
    minHeight: 132,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  moduleEmoji: {
    fontSize: 18,
  },
  activePill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 6,
  },
  activePillText: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
  },
  moduleName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  moduleDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
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
});
