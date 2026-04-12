import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { DEFAULT_ACTIVE_MODULES, ONBOARDING_MODULES } from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';
import type { ModuleId } from '@/constants/modules';
import { router } from 'expo-router';

export default function StepModulesScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [selected, setSelected] = useState<ModuleId[]>(DEFAULT_ACTIVE_MODULES);
  const [femaleEnabled, setFemaleEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      const data = progress.data ?? {};
      setDraft(data);
      const shouldReuseExistingModules = ![
        Routes.auth.register,
        Routes.auth.onboarding.transition,
        Routes.auth.onboarding.goals,
        Routes.auth.onboarding.base,
        Routes.auth.onboarding.modules,
      ].includes((progress.step || '') as any);
      const nextModules = shouldReuseExistingModules && Array.isArray(data.active_modules) && data.active_modules.length > 0
        ? (data.active_modules.filter((value): value is ModuleId => value !== 'female') as ModuleId[])
        : DEFAULT_ACTIVE_MODULES;
      setSelected(nextModules);
      setFemaleEnabled(shouldReuseExistingModules ? Boolean(data.female_health_enabled || data.active_modules?.includes('female')) : false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const visibleCount = selected.length + (femaleEnabled ? 1 : 0);
  const payloadModules = useMemo(() => (femaleEnabled ? [...selected, 'female'] : selected), [femaleEnabled, selected]);

  const toggleModule = (id: ModuleId) => {
    setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const handleContinue = async () => {
    await saveOnboardingProgress(Routes.auth.onboarding.meta, {
      ...(draft ?? {}),
      active_modules: payloadModules,
      female_health_enabled: femaleEnabled,
    });
    router.push(Routes.auth.onboarding.meta as any);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.modules}
      eyebrow="Tu tablero"
      title={
        <View>
          <Text style={styles.title}>Activá lo</Text>
          <Text style={styles.title}>que usás.</Text>
        </View>
      }
      subtitle="Solo lo importante para empezar claro."
      footer={
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onPress={handleContinue}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          iconRight
        >
          Continuar
        </Button>
      }
    >
      <Text style={styles.summary}>{visibleCount} módulos listos hoy.</Text>

      <View style={styles.grid}>
        {ONBOARDING_MODULES.map((module) => {
          const active = selected.includes(module.id as ModuleId);
          return (
            <Pressable
              key={module.id}
              onPress={() => toggleModule(module.id as ModuleId)}
              style={[
                styles.moduleCard,
                active && {
                  borderColor: withOpacity(module.color, 0.48),
                  backgroundColor: withOpacity(module.color, 0.14),
                },
              ]}
            >
              <View style={styles.moduleTop}>
                <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                <View style={[styles.switchTrack, active && styles.switchTrackActive]}>
                  <View style={[styles.switchKnob, active && styles.switchKnobActive]} />
                </View>
              </View>
              <Text style={styles.moduleTitle}>{module.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={styles.specialCard} shadow={false}>
        <View style={styles.specialRow}>
          <View style={styles.specialCopy}>
            <Text style={styles.specialTitle}>Salud femenina</Text>
            <Text style={styles.specialText}>Ciclo, recovery y agua</Text>
          </View>
          <Pressable onPress={() => setFemaleEnabled((value) => !value)} style={[styles.switchTrack, femaleEnabled && styles.switchTrackActive]}>
            <View style={[styles.switchKnob, femaleEnabled && styles.switchKnobActive]} />
          </Pressable>
        </View>
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 38,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  summary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  moduleCard: {
    width: '47.5%',
    minHeight: 108,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface1, 0.96),
    padding: Spacing[3],
    gap: Spacing[3],
  },
  moduleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  moduleTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  switchTrack: {
    width: 42,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.1),
    backgroundColor: withOpacity(Colors.white, 0.04),
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    borderColor: withOpacity(Colors.brand, 0.4),
    backgroundColor: withOpacity(Colors.brand, 0.38),
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  switchKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.brandLight,
  },
  specialCard: {
    backgroundColor: withOpacity(Colors.surface1, 0.96),
  },
  specialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  specialCopy: {
    gap: 4,
  },
  specialTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  specialText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});

