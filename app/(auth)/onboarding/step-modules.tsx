import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import {
  DEFAULT_ACTIVE_MODULES,
  MODULES,
  sortModuleIds,
  type ModuleId,
  type ModuleTier,
} from '@/constants/modules';
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
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  helper: string;
  color: string;
}> = [
  {
    id: 'workout',
    icon: 'barbell-outline',
    title: 'Entreno',
    subtitle: 'Entrenar y ganar fuerza',
    helper: 'Plan adaptativo, sesiones y progreso',
    color: Colors.workout,
  },
  {
    id: 'nutrition',
    icon: 'restaurant-outline',
    title: 'Nutrición',
    subtitle: 'Ordenar comidas y macros',
    helper: 'Registro, macros y decisiones de comida',
    color: Colors.nutrition,
  },
  {
    id: 'steps',
    icon: 'footsteps-outline',
    title: 'Pasos',
    subtitle: 'Moverme más cada día',
    helper: 'Meta diaria, caminatas y consistencia',
    color: Colors.steps,
  },
  {
    id: 'sleep',
    icon: 'moon-outline',
    title: 'Sueño',
    subtitle: 'Dormir mejor y sostener rutina',
    helper: 'Descanso, lectura de noches y ajustes',
    color: Colors.sleep,
  },
] as const;

const SECONDARY_GROUPS: Array<{
  tier: ModuleTier;
  title: string;
  description: string;
}> = [
  {
    tier: 'core',
    title: 'Base recomendada',
    description: 'Los módulos core sostienen el flujo diario del producto.',
  },
  {
    tier: 'contextual',
    title: 'Apoyos contextuales',
    description: 'Actívalos si realmente cambian cómo usas VYRA.',
  },
] as const;

function buildModuleSelection(primaryFocus: PrimaryFocus, secondary: ModuleId[]) {
  const rest = sortModuleIds(secondary.filter((item) => item !== primaryFocus));
  return [primaryFocus, ...rest];
}

export default function StepModulesScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [primaryFocus, setPrimaryFocus] = useState<PrimaryFocus | null>(null);
  const [secondary, setSecondary] = useState<ModuleId[]>([]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextDraft = progress.data ?? null;
      const existingModules = Array.isArray(nextDraft?.active_modules)
        ? (nextDraft.active_modules as ModuleId[])
        : [];
      const detectedPrimary =
        PRIMARY_OPTIONS.find((item) => existingModules.includes(item.id))?.id ??
        DEFAULT_ACTIVE_MODULES[0];
      const fallbackSecondary = DEFAULT_ACTIVE_MODULES.filter(
        (item) => item !== detectedPrimary,
      );
      const detectedSecondary =
        existingModules.length >= 1
          ? existingModules.filter((item) => item !== detectedPrimary) as ModuleId[]
          : fallbackSecondary;

      setDraft(nextDraft);
      setPrimaryFocus(detectedPrimary as PrimaryFocus);
      setSecondary(sortModuleIds(detectedSecondary));
    })();

    return () => {
      active = false;
    };
  }, []);

  const availableSecondary = useMemo(
    () => MODULES.filter((item) => item.id !== primaryFocus),
    [primaryFocus],
  );

  const toggleSecondary = (moduleId: ModuleId) => {
    setSecondary((current) =>
      current.includes(moduleId)
        ? current.filter((item) => item !== moduleId)
        : sortModuleIds([...current, moduleId]),
    );
  };

  const persistAndContinue = async (modules: ModuleId[]) => {
    if (!primaryFocus) return;

    await saveOnboardingProgress(Routes.auth.onboarding.ready, {
      ...(draft ?? {}),
      active_modules: modules,
    });

    router.push(Routes.auth.onboarding.ready as never);
  };

  const handleContinue = async () => {
    if (!primaryFocus) return;
    await persistAndContinue(buildModuleSelection(primaryFocus, secondary));
  };

  const handleSkip = () => {
    const fallbackPrimary = (primaryFocus ?? DEFAULT_ACTIVE_MODULES[0]) as PrimaryFocus;
    const fallbackSecondary = DEFAULT_ACTIVE_MODULES.filter(
      (item) => item !== fallbackPrimary,
    );
    void persistAndContinue(buildModuleSelection(fallbackPrimary, fallbackSecondary));
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.modules}
      eyebrow="Paso 3 de 4"
      title={<Text style={styles.title}>¿Qué quieres priorizar primero?</Text>}
      subtitle="Primero definimos tu foco principal. Después dejamos una base core activa para que VYRA se sienta útil desde el día 1."
      onSkip={handleSkip}
      skipHint="Si prefieres entrar rápido, arrancamos con la base recomendada y luego la ajustas cuando quieras."
      footer={
        <View style={styles.footer}>
          <Button
            onPress={handleContinue}
            disabled={!primaryFocus}
            fullWidth
            size="lg"
            haptic="medium"
          >
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Foco principal</Text>
        <View
          style={styles.stack}
          accessibilityRole="radiogroup"
          accessibilityLabel="Foco principal"
        >
          {PRIMARY_OPTIONS.map((option) => {
            const selected = option.id === primaryFocus;
            return (
              <Pressable
                key={option.id}
                onPress={() => setPrimaryFocus(option.id)}
                style={[styles.primaryCard, selected && styles.primaryCardActive]}
                accessibilityRole="radio"
                accessibilityLabel={option.subtitle}
                accessibilityHint={option.helper}
                accessibilityState={{ selected }}
                hitSlop={8}
              >
                <View style={styles.primaryTop}>
                  <View
                    style={[
                      styles.primaryIconWrap,
                      { backgroundColor: withOpacity(option.color, 0.12) },
                    ]}
                  >
                    <Ionicons name={option.icon} size={20} color={option.color} />
                  </View>
                  <View style={styles.primaryCopy}>
                    <Text style={styles.primaryTitle}>{option.subtitle}</Text>
                    <Text style={styles.primarySubtitle}>{option.helper}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioActive]}>
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                </View>

                <View style={styles.mockRow}>
                  {option.id === 'workout' ? (
                    <>
                      <MiniMock title="Hoy" value="72%" color={option.color} />
                      <MiniMock title="Series" value="58%" color={option.color} />
                      <MiniMock title="PRs" value="34%" color={option.color} />
                    </>
                  ) : null}
                  {option.id === 'nutrition' ? (
                    <>
                      <MiniMock title="Kcal" value="68%" color={option.color} />
                      <MiniMock title="Prote" value="54%" color={option.color} />
                      <MiniMock title="Macros" value="76%" color={option.color} />
                    </>
                  ) : null}
                  {option.id === 'steps' ? (
                    <>
                      <MiniMock title="Meta" value="82%" color={option.color} />
                      <MiniMock title="Semana" value="64%" color={option.color} />
                      <MiniMock title="Racha" value="44%" color={option.color} />
                    </>
                  ) : null}
                  {option.id === 'sleep' ? (
                    <>
                      <MiniMock title="Noche" value="74%" color={option.color} />
                      <MiniMock title="Calidad" value="61%" color={option.color} />
                      <MiniMock title="Rutina" value="52%" color={option.color} />
                    </>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {SECONDARY_GROUPS.map((group) => {
        const items = availableSecondary.filter((option) => option.tier === group.tier);

        return (
          <View key={group.tier} style={styles.section}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionLabel}>{group.title}</Text>
              <Text style={styles.sectionBody}>{group.description}</Text>
            </View>

            <View style={styles.secondaryWrap}>
              {items.map((option) => {
                const moduleId = option.id as ModuleId;
                const active = secondary.includes(moduleId);
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => toggleSecondary(moduleId)}
                    style={[styles.secondaryChip, active && styles.secondaryChipActive]}
                    accessibilityRole="checkbox"
                    accessibilityLabel={option.name}
                    accessibilityHint={option.description}
                    accessibilityState={{ checked: active }}
                    hitSlop={8}
                  >
                    <Text style={styles.secondaryEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.secondaryChipText,
                        active && styles.secondaryChipTextActive,
                      ]}
                    >
                      {option.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </OnboardingShell>
  );
}

function MiniMock({
  title,
  value,
  color,
}: {
  title: string;
  value: `${number}%`;
  color: string;
}) {
  return (
    <View style={styles.mockCard}>
      <Text style={styles.mockTitle}>{title}</Text>
      <View style={styles.mockTrack}>
        <View style={[styles.mockFill, { width: value, backgroundColor: color }]} />
      </View>
    </View>
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
  section: {
    gap: Spacing[3],
  },
  sectionCopy: {
    gap: Spacing[1],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  secondaryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  secondaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    borderRadius: Radius.full,
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
  secondaryEmoji: {
    fontSize: 14,
  },
  secondaryChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  secondaryChipTextActive: {
    color: Colors.textPrimary,
  },
  stack: {
    gap: Spacing[3],
  },
  primaryCard: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    padding: Spacing[4],
    gap: Spacing[3],
  },
  primaryCardActive: {
    borderColor: Colors.actionBorder,
    backgroundColor: withOpacity(Colors.action, 0.08),
  },
  primaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  primaryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCopy: {
    flex: 1,
    gap: 2,
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
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.white, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.action,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.action,
  },
  mockRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  mockCard: {
    flex: 1,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  mockTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  mockTrack: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.06),
    overflow: 'hidden',
  },
  mockFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
