import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

type PrimaryFocus = 'workout' | 'nutrition' | 'steps' | 'sleep';

const PRIMARY_OPTIONS: Array<{
  id: PrimaryFocus;
  emoji: string;
  title: string;
  subtitle: string;
}> = [
  { id: 'workout', emoji: '🏋️', title: 'Entrenar y ganar fuerza', subtitle: 'Rutinas, sesiones y progreso real' },
  { id: 'nutrition', emoji: '🥗', title: 'Mejorar mi alimentacion', subtitle: 'Log simple de comidas y macros' },
  { id: 'steps', emoji: '🚶', title: 'Moverme mas cada dia', subtitle: 'Pasos, meta diaria y consistencia' },
  { id: 'sleep', emoji: '🌙', title: 'Mejorar mi sueno y rutina', subtitle: 'Dormir mejor para sostener el habito' },
] as const;

const SECONDARY_OPTIONS = [
  { id: 'fasting', label: 'Ayuno' },
  { id: 'female', label: 'Seguimiento femenino' },
  { id: 'water', label: 'Agua' },
  { id: 'nutrition', label: 'Nutricion' },
  { id: 'steps', label: 'Pasos' },
  { id: 'sleep', label: 'Sueno' },
  { id: 'workout', label: 'Workout' },
] as const;

export default function StepModulesScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [primaryFocus, setPrimaryFocus] = useState<PrimaryFocus | null>(null);
  const [secondary, setSecondary] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      const nextDraft = progress.data ?? null;
      const existingModules = Array.isArray(nextDraft?.active_modules) ? nextDraft.active_modules : [];
      const detectedPrimary = PRIMARY_OPTIONS.find((item) => existingModules.includes(item.id))?.id ?? 'workout';
      const detectedSecondary = existingModules.filter((item) => item !== detectedPrimary);

      setDraft(nextDraft);
      setPrimaryFocus(detectedPrimary);
      setSecondary(detectedSecondary);
    })();

    return () => {
      active = false;
    };
  }, []);

  const availableSecondary = useMemo(
    () => SECONDARY_OPTIONS.filter((item) => item.id !== primaryFocus),
    [primaryFocus],
  );

  const toggleSecondary = (moduleId: string) => {
    setSecondary((current) =>
      current.includes(moduleId)
        ? current.filter((item) => item !== moduleId)
        : [...current, moduleId],
    );
  };

  const persistAndContinue = async (modules: string[]) => {
    if (!primaryFocus) return;

    await saveOnboardingProgress(Routes.auth.onboarding.ready, {
      ...(draft ?? {}),
      active_modules: modules,
    });

    router.push(Routes.auth.onboarding.ready as never);
  };

  const handleContinue = async () => {
    if (!primaryFocus) return;
    await persistAndContinue([primaryFocus, ...secondary.filter((item) => item !== primaryFocus)]);
  };

  const handlePrimaryOnly = async () => {
    if (!primaryFocus) return;
    setSecondary([]);
    await persistAndContinue([primaryFocus]);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.modules}
      eyebrow="Paso 3 de 4"
      title={
        <View>
          <Text style={styles.title}>Cual es tu foco principal?</Text>
        </View>
      }
      subtitle="Elegimos una sola prioridad y luego, si quieres, sumamos apoyo."
      footer={
        <View style={styles.footer}>
          <Button onPress={handleContinue} disabled={!primaryFocus} fullWidth size="lg" haptic="medium">
            Continuar
          </Button>
          <Button onPress={handlePrimaryOnly} variant="ghost" fullWidth disabled={!primaryFocus}>
            Solo el foco principal
          </Button>
        </View>
      }
    >
      <View style={styles.stack}>
        {PRIMARY_OPTIONS.map((option) => {
          const selected = option.id === primaryFocus;
          return (
            <Pressable
              key={option.id}
              onPress={() => setPrimaryFocus(option.id)}
              style={[styles.primaryCard, selected && styles.primaryCardActive]}
            >
              <Text style={styles.primaryEmoji}>{option.emoji}</Text>
              <View style={styles.primaryCopy}>
                <Text style={styles.primaryTitle}>{option.title}</Text>
                <Text style={styles.primarySubtitle}>{option.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Anadir algo mas?</Text>
        <View style={styles.secondaryWrap}>
          {availableSecondary.map((option) => {
            const active = secondary.includes(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => toggleSecondary(option.id)}
                style={[styles.secondaryChip, active && styles.secondaryChipActive]}
              >
                <Text style={[styles.secondaryChipText, active && styles.secondaryChipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.textPrimary,
    letterSpacing: -1.5,
  },
  footer: {
    gap: Spacing[2],
  },
  stack: {
    gap: Spacing[3],
  },
  primaryCard: {
    minHeight: 84,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  primaryCardActive: {
    borderColor: Colors.actionBorder,
    backgroundColor: withOpacity(Colors.action, 0.1),
  },
  primaryEmoji: {
    fontSize: 24,
  },
  primaryCopy: {
    flex: 1,
    gap: 4,
  },
  primaryTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  primarySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  section: {
    gap: Spacing[3],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  secondaryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  secondaryChip: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  secondaryChipActive: {
    backgroundColor: withOpacity(Colors.action, 0.1),
    borderColor: Colors.actionBorder,
  },
  secondaryChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  secondaryChipTextActive: {
    color: Colors.textPrimary,
  },
});
