// REDESIGNED: 2026-05-20 - modulos activos visibles y ordenados por objetivo
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingTooltip from '@/components/onboarding/OnboardingTooltip';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import type { ModuleId } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  buildSuggestedActiveModules,
  getAccessibleOnboardingRoute,
  getFirstIncompleteOnboardingRoute,
  getGoalOption,
  getSelectableOnboardingModules,
  isBinaryGender,
  isGoalDetailId,
  sanitizeActiveModuleSelection,
  type OnboardingBinaryGender,
  type OnboardingGoalDetailId,
} from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';

const MODULE_DESCRIPTIONS: Record<ModuleId, string> = {
  water: 'Registra tu consumo diario de agua y obtén recordatorios según tu peso y actividad.',
  steps: 'Sincroniza tus pasos, establece metas diarias y mejora tu movimiento general (NEAT).',
  nutrition: 'Registra comidas, calcula macros, sigue calorías y recibe recomendaciones personalizadas.',
  workout: 'Crea rutinas, registra entrenamientos, sigue progreso de ejercicios y pesos.',
  fasting: 'Configura protocolos de ayuno intermitente y registra tus ventanas de comida.',
  sleep: 'Monitoea tus horas de sueño, calidad y recuperación según entrenamiento.',
  supplements: 'Organiza suplementos, horarios y recibe recordatorios de tomas.',
  female: 'Registra ciclo menstrual para personalizar entrenamientos y nutrición por fase.',
  mental: 'Check-in diario de bienestar, estrés, motivación y salud emocional.',
  recovery: 'Sigue movilidad, stretching y técnicas de recuperación activa.',
  weight: 'Registra peso actual, sigue cambios corporales y tendencias.',
};

/**
 * Module presets to reduce cognitive load
 * Users can choose a preset or customize manually
 */
const MODULE_PRESETS: Record<string, { label: string; description: string; modules: ModuleId[] }> = {
  lean_body: {
    label: '💪 Cuerpo Magro',
    description: 'Pérdida de grasa + Musculatura',
    modules: ['nutrition', 'workout', 'steps', 'water'],
  },
  performance: {
    label: '⚡ Rendimiento',
    description: 'Entrenamientos + Recuperación',
    modules: ['workout', 'sleep', 'recovery', 'steps'],
  },
  health_focus: {
    label: '❤️ Salud Integral',
    description: 'Bienestar general',
    modules: ['nutrition', 'sleep', 'water', 'mental'],
  },
  minimal: {
    label: '📊 Essentials',
    description: 'Lo mínimo para empezar',
    modules: ['nutrition', 'workout', 'steps'],
  },
};

function PresetButton({
  preset,
  selected: isSelected,
  onPress,
}: {
  preset: (typeof MODULE_PRESETS)[keyof typeof MODULE_PRESETS];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.presetCard,
        isSelected && { borderColor: Colors.action, borderWidth: 2, backgroundColor: withOpacity(Colors.action, 0.08) },
      ]}
      onPress={onPress}
    >
      <Text style={styles.presetLabel}>{preset.label}</Text>
      <Text style={styles.presetDescription}>{preset.description}</Text>
      <Text style={styles.presetModuleCount}>
        {preset.modules.length} módulo{preset.modules.length === 1 ? '' : 's'}
      </Text>
    </Pressable>
  );
}

function orderSelection(values: ModuleId[], preferredOrder: ModuleId[]) {
  const normalized = [...new Set(values)];
  const seen = new Set<ModuleId>();
  const ordered: ModuleId[] = [];

  for (const moduleId of preferredOrder) {
    if (!normalized.includes(moduleId) || seen.has(moduleId)) continue;
    ordered.push(moduleId);
    seen.add(moduleId);
  }

  for (const moduleId of normalized) {
    if (seen.has(moduleId)) continue;
    ordered.push(moduleId);
    seen.add(moduleId);
  }

  return ordered;
}

function CounterButton({
  selectedCount,
  counterScale,
  onPress,
  disabled,
  loading,
}: {
  selectedCount: number;
  counterScale: ReturnType<typeof useSharedValue<number>>;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const counterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: counterScale.value }],
  }));

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      fullWidth
      size="md"
      haptic="medium"
      loading={loading}
    >
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Text>Continuar con </Text>
        <Animated.Text style={counterAnimatedStyle}>
          {selectedCount} módulo{selectedCount === 1 ? '' : 's'}
        </Animated.Text>
        <Text> activo{selectedCount === 1 ? '' : 's'}</Text>
      </View>
    </Button>
  );
}

export default function StepModulesScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [gender, setGender] = useState<OnboardingBinaryGender | null>(null);
  const [goalDetail, setGoalDetail] = useState<OnboardingGoalDetailId | null>(null);
  const [selected, setSelected] = useState<ModuleId[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const snackbarOpacity = useSharedValue(0);
  const counterScale = useSharedValue(1);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.modules,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.modules) {
        router.replace(nextRoute as never);
        return;
      }

      const nextGender = isBinaryGender(progress.data?.gender) ? progress.data.gender : null;
      const nextGoalDetail = isGoalDetailId(progress.data?.goal_detail)
        ? progress.data.goal_detail
        : null;

      if (!nextGender || !nextGoalDetail || !getGoalOption(nextGoalDetail)) {
        router.replace(Routes.auth.onboarding.goal as never);
        return;
      }

      const explicitModules = sanitizeActiveModuleSelection(nextGender, progress.data?.active_modules);
      const suggestedModules = buildSuggestedActiveModules(
        nextGoalDetail,
        nextGender,
        Boolean(progress.data?.female_health_enabled),
      );

      setDraft(progress.data ?? null);
      setGender(nextGender);
      setGoalDetail(nextGoalDetail);
      setSelected(
        orderSelection(explicitModules.length >= 1 ? explicitModules : suggestedModules, suggestedModules),
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  // Cleanup all timers when component unmounts
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  // Counter flip animation on count change
  useEffect(() => {
    counterScale.value = 0.8;
    counterScale.value = withTiming(1.15, { duration: 150, easing: Easing.out(Easing.ease) });
    
    const bounceTimer = setTimeout(() => {
      counterScale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
    }, 150);

    return () => clearTimeout(bounceTimer);
  }, [selected.length]);

  const moduleOptions = useMemo(
    () => (gender ? getSelectableOnboardingModules(gender) : []),
    [gender],
  );
  const suggestedSelection = useMemo(() => {
    if (!gender || !goalDetail) return [];
    return buildSuggestedActiveModules(goalDetail, gender, Boolean(draft?.female_health_enabled));
  }, [draft?.female_health_enabled, gender, goalDetail]);

  const goalName = goalDetail ? getGoalOption(goalDetail)?.label ?? 'tu objetivo' : 'tu objetivo';
  const selectedCount = selected.length;
  const selectedSummary =
    selectedCount === 0
      ? 'Elige al menos 1 modulo'
      : `${selectedCount} modulo${selectedCount === 1 ? '' : 's'} activo${selectedCount === 1 ? '' : 's'}`;

  const toggleModule = (moduleId: ModuleId) => {
    setSelected((current) => {
      const isRemoving = current.includes(moduleId);
      
      if (isRemoving) {
        // Show snackbar when deactivating
        setShowSnackbar(true);
        snackbarOpacity.value = 0;
        snackbarOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
        
        // Track timer for cleanup on unmount
        const timer = setTimeout(() => {
          snackbarOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
          // Also track inner timer
          const hideTimer = setTimeout(() => setShowSnackbar(false), 300);
          timersRef.current.push(hideTimer);
        }, 2500);
        
        timersRef.current.push(timer);
        
        return current.filter((item) => item !== moduleId);
      }

      return orderSelection([...current, moduleId], suggestedSelection);
    });
  };

  const handleContinue = async () => {
    if (!gender || selected.length === 0 || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const sanitizedSelection = sanitizeActiveModuleSelection(gender, selected);
      
      // Clean up orphan fields from deselected modules
      const cleanedDraft = { ...(draft ?? {}) };
      const activeModuleSet = new Set(sanitizedSelection);
      
      if (!activeModuleSet.has('fasting')) {
        delete cleanedDraft.fasting_protocol;
      }
      if (!activeModuleSet.has('female')) {
        delete cleanedDraft.female_health_enabled;
      }
      if (!activeModuleSet.has('sleep')) {
        delete cleanedDraft.sleep_time_minutes;
        delete cleanedDraft.wake_time_minutes;
        delete cleanedDraft.sleep_goal_hours;
      }
      if (!activeModuleSet.has('steps')) {
        delete cleanedDraft.step_goal;
      }
      if (!activeModuleSet.has('nutrition')) {
        delete cleanedDraft.nutrition_pattern;
      }
      if (!activeModuleSet.has('water')) {
        delete cleanedDraft.water_goal_ml;
      }
      
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...cleanedDraft,
        active_modules: sanitizedSelection,
      });

      await saveOnboardingProgress(nextRoute, {
        ...cleanedDraft,
        active_modules: sanitizedSelection,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Modules] Failed to continue:', err);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.modules}
      eyebrow="Módulos activos"
      title={<Text style={styles.title}>Activa solo lo que sí quieres usar.</Text>}
      subtitle={`Home, Explore y Registro se acomodan a este set y al objetivo ${goalName.toLowerCase()}.`}
      scrollable
      contentStyle={styles.content}
      footer={
        <View style={styles.footerStack}>
          {saveError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          )}
          <Text style={styles.footerNote}>Luego puedes ajustar este plan desde Ajustes.</Text>
          <CounterButton selectedCount={selectedCount} counterScale={counterScale} onPress={handleContinue} disabled={selectedCount === 0 || isProcessing} loading={isProcessing} />
        </View>
      }
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryPillText}>{selectedSummary}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Elige un enfoque (opcional)</Text>
      <View style={styles.presetsGrid}>
        {Object.entries(MODULE_PRESETS).map(([key, preset]) => (
          <PresetButton
            key={key}
            preset={preset}
            selected={selectedPreset === key}
            onPress={() => {
              setSelectedPreset(selectedPreset === key ? null : key);
              // Apply preset modules when selected
              if (selectedPreset !== key) {
                setSelected(orderSelection(preset.modules, suggestedSelection));
              }
            }}
          />
        ))}
      </View>

      <Text style={styles.recommendationNote}>
        Este es el set recomendado para empezar. Menos módulos, más probabilidad de sostenerlo.
      </Text>

      <View style={styles.grid} accessibilityRole="list">
        {moduleOptions.map((module) => {
          const active = selected.includes(module.id as ModuleId);
          const recommended = suggestedSelection.includes(module.id as ModuleId);

          return (
            <Pressable
              key={module.id}
              onPress={() => toggleModule(module.id as ModuleId)}
              style={[
                styles.card,
                !active && styles.cardInactive,
                active && {
                  borderColor: withOpacity(module.color, 0.46),
                  backgroundColor: withOpacity(module.color, 0.12),
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityLabel={module.name}
              accessibilityHint={module.description}
              accessibilityState={{ checked: active }}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: withOpacity(module.color, 0.14) }]}>
                  <Text style={styles.emoji}>{module.emoji}</Text>
                </View>
                {/* Toggle Switch */}
                <View style={[styles.toggleSwitch, active ? { backgroundColor: module.color } : null]}>
                  <View style={[styles.toggleThumb, active ? styles.toggleThumbActive : null]} />
                </View>
              </View>

              <Text style={styles.cardTitle}>{module.name}</Text>
              <Text style={styles.cardBody} numberOfLines={2}>
                {module.description}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardHint, active && { color: module.color }]} numberOfLines={1}>
                  {active ? '✓ Activo' : recommended ? '💡 Recomendado' : 'Inactivo'}
                </Text>
                <OnboardingTooltip 
                  label={module.name}
                  description={MODULE_DESCRIPTIONS[module.id as ModuleId] || module.description}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      {showSnackbar && <SnackbarReactivation opacity={snackbarOpacity} />}
    </OnboardingShell>
  );
}

function SnackbarReactivation({ opacity }: { opacity: ReturnType<typeof useSharedValue<number>> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.snackbar, animatedStyle]}>
      <Text style={styles.snackbarText}>Podés reactivarlo desde Ajustes</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[1.5],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    lineHeight: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.45,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[1.5],
  },
  summaryPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 7,
    backgroundColor: withOpacity(Colors.secondary, 0.12),
  },
  summaryPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.secondary,
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing[1],
  },
  recommendationNote: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1.5],
  },
  presetCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    gap: Spacing[1],
  },
  presetLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  presetDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  presetModuleCount: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    color: Colors.textMuted,
  },
  footerStack: {
    gap: Spacing[1],
  },
  footerNote: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '31.8%',
    minHeight: 84,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  cardInactive: {
    opacity: 0.65,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[1],
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 13,
  },
  toggleSwitch: {
    width: 32,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.16),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    color: Colors.textPrimary,
  },
  cardBody: {
    fontFamily: FontFamily.regular,
    fontSize: 9.5,
    lineHeight: 13,
    color: Colors.textSecondary,
  },
  cardHint: {
    fontFamily: FontFamily.medium,
    fontSize: 8.5,
    color: Colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[1],
  },
  snackbar: {
    position: 'absolute',
    bottom: Spacing[3],
    left: Spacing[3],
    right: Spacing[3],
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.textPrimary, 0.92),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  snackbarText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.white,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.error, 0.1),
    borderLeftColor: Colors.error,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    borderRadius: Radius.sm,
    marginBottom: Spacing[2],
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.error,
  },
});
