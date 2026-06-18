// REDESIGNED: 2026-05-21 - cierre manual y resumen final del onboarding
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MODULES, type ModuleId } from '@/constants/modules';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import {
  buildOnboardingDataFromDraft,
  getGoalOption,
  getFirstIncompleteOnboardingRoute,
  isGoalDetailId,
  type OnboardingGoalDetailId,
} from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';
import { isGuestAuthUser, MANAGED_GUEST_NAME, normalizeManagedGuestName } from '@/lib/guest-auth';
import { calculateBMR, calculateMacros, calculateTDEE } from '@/utils/calculations';
import { formatNumber } from '@/utils/formatters';

type SaveState = 'loading' | 'idle' | 'saving' | 'error';

const EQUIPMENT_LABELS: Record<string, string> = {
  gym_full: 'Gimnasio',
  home_basic: 'Casa con material',
  bodyweight: 'Peso corporal',
};

type HomePreviewMetric = {
  id: string;
  label: string;
  value: string;
  color: string;
};

const NUTRITION_FORWARD_GOALS = new Set<OnboardingGoalDetailId>([
  'lose_fat',
  'gain_muscle',
  'improve_appearance',
  'eat_better',
  'perform_better',
]);

function mapGoalDetailToMacroGoal(goalDetail: OnboardingGoalDetailId | null | undefined) {
  switch (goalDetail) {
    case 'lose_fat':
      return 'lose_fat';
    case 'gain_muscle':
      return 'gain_muscle';
    case 'perform_better':
      return 'performance';
    case 'feel_better':
      return 'mental';
    default:
      return 'health';
  }
}

function formatWaterGoalVolume(ml: number) {
  if (!Number.isFinite(ml) || ml <= 0) return '0ml';
  if (ml < 1000) return `${Math.round(ml)}ml`;

  const liters = Math.floor((ml / 1000) * 10) / 10;
  return `${liters.toFixed(1)}L`;
}

function buildHomePreviewHero(
  moduleIds: ModuleId[],
  goalLabel: string,
  userName?: string,
): { eyebrow: string; title: string; body: string; accent: string } {
  const greeting = userName ? `${userName}, ` : '';

  if (moduleIds.includes('workout')) {
    return {
      eyebrow: 'PRIMERO EN HOME',
      title: 'Readiness + bloque del día',
      body: `${greeting}VYRA va a abrir con una lectura breve para mover tu objetivo ${goalLabel.toLowerCase()} sin perder tiempo.`,
      accent: Colors.workout,
    };
  }

  if (moduleIds.includes('fasting')) {
    return {
      eyebrow: 'PRIMERO EN HOME',
      title: 'Ventana y siguiente accion',
      body: `${greeting}Vas a ver tu ayuno, el tiempo actual y la accion mas util para seguir sin ruido.`,
      accent: Colors.fasting,
    };
  }

  if (moduleIds.includes('sleep')) {
    return {
      eyebrow: 'PRIMERO EN HOME',
      title: 'Como amaneciste hoy',
      body: `${greeting}Tu descanso reciente y el siguiente ajuste del día quedan arriba para que arranques con contexto.`,
      accent: Colors.sleep,
    };
  }

  if (moduleIds.includes('nutrition')) {
    return {
      eyebrow: 'PRIMERO EN HOME',
      title: 'Base diaria y registro rapido',
      body: `${greeting}Home va a empujar tus comidas, el balance del día y una entrada rápida cuando te haga falta.`,
      accent: Colors.nutrition,
    };
  }

  return {
    eyebrow: 'PRIMERO EN HOME',
    title: 'Tu tablero del día',
    body: `${greeting}Lo primero que ves cambia según tus módulos y lo que ya hayas hecho en el día.`,
    accent: Colors.action,
  };
}

function buildHomePreviewMetrics(moduleIds: ModuleId[]): HomePreviewMetric[] {
  const calorieGoalValue = 1858;
  const waterGoalValue = 2450;
  const map: Record<ModuleId, HomePreviewMetric> = {
    workout: { id: 'workout', label: 'Entreno', value: 'Listo hoy', color: Colors.workout },
    nutrition: {
      id: 'nutrition',
      label: 'Comidas',
      value: `${formatNumber(calorieGoalValue)} kcal`,
      color: Colors.nutrition,
    },
    sleep: { id: 'sleep', label: 'Sueño', value: '8 h meta', color: Colors.sleep },
    water: {
      id: 'water',
      label: 'Agua',
      value: formatWaterGoalVolume(waterGoalValue),
      color: Colors.water,
    },
    steps: { id: 'steps', label: 'Pasos', value: '9.5k meta', color: Colors.steps },
    fasting: { id: 'fasting', label: 'Ayuno', value: '16:8', color: Colors.fasting },
    female: { id: 'female', label: 'Ciclo', value: 'En contexto', color: Colors.female },
    supplements: { id: 'supplements', label: 'Suples', value: 'Por horario', color: Colors.supplements },
    weight: { id: 'weight', label: 'Peso', value: 'Seguimiento', color: Colors.action },
    recovery: { id: 'recovery', label: 'Recovery', value: 'Contexto', color: Colors.action },
    mental: { id: 'mental', label: 'Mental', value: 'Check-in', color: Colors.action },
  };

  return moduleIds.slice(0, 4).map((moduleId) => map[moduleId]).filter(Boolean);
}

function buildHomePreviewActions(moduleIds: ModuleId[]) {
  const actionMap: Record<ModuleId, string> = {
    workout: '+ Entreno',
    nutrition: '+ Comida',
    sleep: '+ Sueño',
    water: '+ Agua',
    steps: 'Ver pasos',
    fasting: 'Seguir ayuno',
    female: 'Check-in',
    supplements: '+ Toma',
    weight: '+ Peso',
    recovery: 'Recovery',
    mental: 'Como vas',
  };

  return moduleIds.slice(0, 3).map((moduleId) => actionMap[moduleId]).filter(Boolean);
}

function HeroAnimation({
  opacity,
  scale,
  children,
}: {
  opacity: ReturnType<typeof useSharedValue<number>>;
  scale: ReturnType<typeof useSharedValue<number>>;
  children: React.ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.summaryHero, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

function ItemAnimation({
  opacity,
  children,
}: {
  opacity: ReturnType<typeof useSharedValue<number>>;
  children: React.ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[animatedStyle]}>{children}</Animated.View>;
}

export default function StepReadyScreen() {
  const { isLoading, saveOnboarding } = useAuth();
  const authUser = useAuthStore((state) => state.user);
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const heroOpacity = useSharedValue(0);
  const heroScale = useSharedValue(0.9);
  const itemsOpacity = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getFirstIncompleteOnboardingRoute(progress.data ?? null);
      if (nextRoute !== Routes.auth.onboarding.ready) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setSaveState('idle');
    })();

    return () => {
      active = false;
    };
  }, []);

  // Celebration animation
  useEffect(() => {
    if (saveState !== 'idle') return;

    // Hero entrance
    heroOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    heroScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });

    // Staggered items entrance
    itemsOpacity.forEach((opacity, index) => {
      opacity.value = withDelay(200 + index * 150, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
    });
  }, [saveState]);

  const onboardingData = useMemo(() => buildOnboardingDataFromDraft(draft), [draft]);

  const selectedModules = useMemo(() => {
    const moduleMap = new Map(MODULES.map((item) => [item.id, item]));
    return (onboardingData?.active_modules ?? [])
      .map((moduleId) => moduleMap.get(moduleId))
      .filter((item): item is (typeof MODULES)[number] => Boolean(item));
  }, [onboardingData?.active_modules]);

  const goalDetail = isGoalDetailId(draft?.goal_detail) ? draft.goal_detail : null;
  const goalLabel = useMemo(() => {
    if (!goalDetail) return 'Tu objetivo principal';
    return getGoalOption(goalDetail)?.label ?? 'Tu objetivo principal';
  }, [goalDetail]);

  const equipmentLabel = draft?.equipment
    ? EQUIPMENT_LABELS[draft.equipment] ?? 'Tu entorno elegido'
    : 'Tu entorno elegido';
  const fallbackName =
    authUser?.user_metadata && typeof authUser.user_metadata.name === 'string'
      ? authUser.user_metadata.name.trim()
      : typeof authUser?.email === 'string'
        ? authUser.email.split('@')[0] ?? ''
        : '';
  const displayName = isGuestAuthUser(authUser)
    ? MANAGED_GUEST_NAME
    : normalizeManagedGuestName(onboardingData?.name) ||
      normalizeManagedGuestName(draft?.name) ||
      normalizeManagedGuestName(fallbackName) ||
      'tu base';
  const selectedModuleIds = useMemo(
    () => selectedModules.map((module) => module.id as ModuleId),
    [selectedModules],
  );
  const calorieGoal = useMemo(() => {
    if (!draft || !onboardingData) return null;
    if (!goalDetail) return null;
    if (!NUTRITION_FORWARD_GOALS.has(goalDetail)) return null;

    const age = Number(onboardingData.age);
    const heightCm = Number(onboardingData.height_cm);
    const weightKg = Number(
      onboardingData.weight_current_kg ??
        onboardingData.weight_start_kg ??
        draft.weight_current_kg ??
        draft.weight_start_kg ??
        0,
    );
    const activityLevel = Number(onboardingData.activity_level);
    const sex = onboardingData.gender === 'female' ? 'female' : 'male';

    if (
      !Number.isFinite(age) ||
      !Number.isFinite(heightCm) ||
      !Number.isFinite(weightKg) ||
      !Number.isFinite(activityLevel)
    ) {
      return null;
    }

    const tdee = calculateTDEE(
      calculateBMR(weightKg, heightCm, age, sex),
      activityLevel,
    );
    const macroGoal = mapGoalDetailToMacroGoal(goalDetail);
    return calculateMacros(tdee, macroGoal).calories;
  }, [draft, goalDetail, onboardingData]);
  const showCalorieGoal = Boolean(
    (goalDetail && NUTRITION_FORWARD_GOALS.has(goalDetail)) || selectedModuleIds.includes('nutrition'),
  );
  const previewHero = useMemo(
    () => buildHomePreviewHero(selectedModuleIds, goalLabel, onboardingData?.name as string),
    [goalLabel, selectedModuleIds, onboardingData?.name],
  );
  const previewMetrics = useMemo(
    () =>
      buildHomePreviewMetrics(
        selectedModuleIds,
      ).map((metric) => {
        if (metric.id === 'water') {
          return {
            ...metric,
            value: formatWaterGoalVolume(onboardingData?.water_goal_ml ?? 0),
          };
        }

        if (metric.id === 'nutrition' && calorieGoal) {
          return {
            ...metric,
            value: `${formatNumber(calorieGoal)} kcal`,
          };
        }

        return metric;
      }),
    [calorieGoal, onboardingData?.water_goal_ml, selectedModuleIds],
  );
  const previewActions = useMemo(
    () => buildHomePreviewActions(selectedModuleIds),
    [selectedModuleIds],
  );
  const isGuest = isGuestAuthUser(authUser);

  const handleContinue = async () => {
    if (!onboardingData || !termsAccepted || !privacyAccepted) return;

    setSaveState('saving');
    setSaveError(null);
    const ok = await saveOnboarding({
      ...onboardingData,
      terms_accepted: true,
      privacy_accepted: true,
    });
    if (ok) {
      router.replace(Routes.tabs.home as never);
      return;
    }

    setSaveError('No pudimos completar tu configuración. Verifica tu conexión e intenta de nuevo.');
    setSaveState('error');
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.ready}
      eyebrow="Todo listo"
      title={<Text style={styles.title}>Base sólida para comenzar</Text>}
      subtitle="Revisá el enfoque con el que va a arrancar tu inicio. Cuando sigas, entrás directo a Home."
      scrollable
      contentStyle={styles.content}
      footer={
        saveState !== 'loading' ? (
          <View style={styles.footerStack}>
            {saveError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{saveError}</Text>
              </View>
            )}
            <Button
              onPress={handleContinue}
              fullWidth
              size="md"
              haptic="medium"
              loading={saveState === 'saving' || isLoading}
              disabled={!onboardingData || !termsAccepted || !privacyAccepted}
            >
              Ir a VYRA
            </Button>
            <Pressable
              onPress={() => router.push(Routes.auth.onboarding.modules as never)}
              accessibilityRole="button"
              accessibilityLabel="Ajustar módulos"
              accessibilityHint="Te vuelve a la selección de módulos para editar tu arranque."
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>Ajustar módulos</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.footerStack}>
            <Button fullWidth size="md" disabled loading onPress={() => {}}>
              Preparando...
            </Button>
          </View>
        )
      }
    >
      <Card style={styles.card} shadow={false}>
        {saveState === 'loading' ? (
          <>
            <View style={styles.loaderRow}>
              <ActivityIndicator size="small" color={Colors.textPrimary} />
              <Text style={styles.loaderTitle}>Preparando tu resumen final...</Text>
            </View>
            <Text style={styles.loaderBody}>
              Estamos reuniendo tus elecciones para que el inicio salga ya personalizado.
            </Text>
          </>
        ) : (
          <>
            <HeroAnimation opacity={heroOpacity} scale={heroScale}>
              <Text style={styles.summaryEyebrow}>🎉 Onboarding completado</Text>
              <Text style={styles.summaryTitle}>
                {isGuest ? 'Tu arranque' : `¡Hola, ${displayName}!`}
              </Text>
              <Text style={styles.summaryBody}>
                Home va a priorizar lo que elegiste usar y el objetivo que querés trabajar primero.
              </Text>
            </HeroAnimation>

            <ItemAnimation opacity={itemsOpacity[0]}>
              <View style={styles.summaryStack}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Text style={styles.summaryLabel}>Objetivo</Text>
                    <Pressable
                      onPress={() => router.push(Routes.auth.onboarding.goal as never)}
                      style={styles.editButton}
                      hitSlop={8}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.summaryValue}>{goalLabel}</Text>
                </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <Text style={styles.summaryLabel}>Entorno</Text>
                  <Pressable
                    onPress={() => router.push(Routes.auth.onboarding.equipment as never)}
                    style={styles.editButton}
                    hitSlop={8}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </Pressable>
                </View>
                <Text style={styles.summaryValue}>{equipmentLabel}</Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryRowWrap]}>
                <View style={styles.summaryLabelRow}>
                  <Text style={styles.summaryLabel}>Módulos activos</Text>
                  <Pressable
                    onPress={() => router.push(Routes.auth.onboarding.modules as never)}
                    style={styles.editButton}
                    hitSlop={8}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </Pressable>
                </View>
                <View style={styles.moduleWrap}>
                  {selectedModules.map((module) => (
                    <View
                      key={module.id}
                      style={[
                        styles.moduleChip,
                        {
                          borderColor: withOpacity(module.color, 0.24),
                          backgroundColor: withOpacity(module.color, 0.1),
                        },
                      ]}
                    >
                      <Text style={styles.moduleChipText}>{module.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            </ItemAnimation>

            <View style={styles.metaBox}>
                <View style={styles.metaRow}>
                  <Text style={styles.summaryLabel}>Meta de agua</Text>
                  <Text style={styles.metaValue}>
                    {formatWaterGoalVolume(onboardingData?.water_goal_ml ?? 0)} / día
                  </Text>
                </View>
              {showCalorieGoal && calorieGoal ? (
                <View style={styles.metaRow}>
                  <Text style={styles.summaryLabel}>Meta calórica</Text>
                  <Text style={styles.metaValue}>
                    {formatNumber(calorieGoal)} kcal / día
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.previewStack}>
              <Text style={styles.previewLabel}>Así se verá tu Home</Text>

              <View style={styles.previewDevice}>
                <View style={[styles.previewHeroCard, { borderColor: withOpacity(previewHero.accent, 0.3) }]}>
                  <View style={styles.previewHeroTop}>
                    <Text style={styles.previewHeroEyebrow}>{previewHero.eyebrow}</Text>
                    <View style={[styles.previewHeroDot, { backgroundColor: previewHero.accent }]} />
                  </View>
                  <Text style={styles.previewHeroTitle}>{previewHero.title}</Text>
                  <Text style={styles.previewHeroBody}>{previewHero.body}</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.previewMetricsScroll}
                >
                  {previewMetrics.map((metric) => (
                    <View
                      key={metric.id}
                      style={[
                        styles.previewMetricCard,
                        {
                          borderColor: withOpacity(metric.color, 0.18),
                          backgroundColor: withOpacity(metric.color, 0.09),
                        },
                      ]}
                    >
                      <Text style={styles.previewMetricLabel}>{metric.label}</Text>
                      <Text style={styles.previewMetricValue} numberOfLines={2}>
                        {metric.value}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.previewActionsRow}>
                  {previewActions.map((action) => (
                    <View key={action} style={styles.previewActionChip}>
                      <Text style={styles.previewActionText}>{action}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Que pasa al entrar</Text>
              <Text style={styles.noteBody}>
                Vas directo a Home, con acciones rápidas, módulos activos y prioridades ajustadas a esta configuración.
              </Text>
            </View>

            <View style={styles.consentsBox}>
              <Pressable
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={[styles.consentRow, termsAccepted && styles.consentRowActive]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                accessibilityLabel="Aceptar términos de servicio"
              >
                <View
                  style={[
                    styles.consentCheckbox,
                    termsAccepted && styles.consentCheckboxActive,
                  ]}
                >
                  {termsAccepted && <Text style={styles.consentCheckmark}>✓</Text>}
                </View>
                <Text style={styles.consentText}>Acepto los términos de servicio</Text>
              </Pressable>

              <Pressable
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
                style={[styles.consentRow, privacyAccepted && styles.consentRowActive]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: privacyAccepted }}
                accessibilityLabel="Aceptar política de privacidad"
              >
                <View
                  style={[
                    styles.consentCheckbox,
                    privacyAccepted && styles.consentCheckboxActive,
                  ]}
                >
                  {privacyAccepted && <Text style={styles.consentCheckmark}>✓</Text>}
                </View>
                <Text style={styles.consentText}>Acepto la política de privacidad</Text>
              </Pressable>
            </View>

            {saveState === 'error' ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>No pudimos guardar tu perfil todavia.</Text>
                <Text style={styles.errorBody}>
                  Tus respuestas siguen guardadas. Proba de nuevo y entras apenas termine el guardado.
                </Text>
              </View>
            ) : null}
          </>
        )}
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: 0,
    paddingBottom: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.7,
  },
  card: {
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
    borderColor: withOpacity(Colors.textPrimary, 0.1),
    backgroundColor: Colors.surface2,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  loaderTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  loaderBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  summaryHero: {
    gap: Spacing[1.5],
  },
  summaryEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: Colors.textPrimary,
  },
  summaryBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  summaryStack: {
    gap: Spacing[2],
  },
  previewStack: {
    gap: Spacing[1.5],
  },
  previewLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  previewDevice: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.textPrimary, 0.08),
    backgroundColor: withOpacity(Colors.base, 0.65),
    padding: Spacing[2],
    gap: Spacing[2],
  },
  previewHeroCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: withOpacity(Colors.white, 0.03),
    padding: Spacing[2],
    gap: Spacing[1],
  },
  previewHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[1],
  },
  previewHeroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  previewHeroDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  previewHeroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  previewHeroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  previewMetricsGrid: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  previewMetricsScroll: {
    flexDirection: 'row',
    gap: Spacing[1.5],
    paddingRight: Spacing[1],
  },
  previewMetricCard: {
    width: 126,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1.5],
    gap: 4,
  },
  previewMetricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewMetricValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  previewActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
  },
  previewActionChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[1.5],
    paddingVertical: Spacing[1],
    backgroundColor: withOpacity(Colors.white, 0.05),
  },
  previewActionText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textPrimary,
  },
  summaryRow: {
    gap: Spacing[1],
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  editButton: {
    padding: Spacing[0.5],
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.action, 0.1),
  },
  editButtonText: {
    fontSize: 12,
  },
  summaryRowWrap: {
    gap: Spacing[1.5],
  },
  summaryLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  metaBox: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.textPrimary, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    padding: Spacing[3],
    gap: Spacing[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  metaValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'right',
    flexShrink: 1,
  },
  moduleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1.5],
  },
  moduleChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  moduleChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  primaryAction: {
    marginTop: Spacing[1],
  },
  noteBox: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.textPrimary, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    padding: Spacing[3],
    gap: Spacing[1],
  },
  noteTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  noteBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  errorBox: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.24),
    backgroundColor: withOpacity(Colors.error, 0.08),
    padding: Spacing[3],
    gap: Spacing[1],
  },
  errorTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  errorBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  secondaryAction: {
    alignSelf: 'center',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
  },
  secondaryActionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  footerStack: {
    gap: Spacing[1.5],
  },
  consentsBox: {
    gap: Spacing[2],
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.textPrimary, 0.04),
    padding: Spacing[2.5],
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[1.5],
  },
  consentRowActive: {
    opacity: 1,
  },
  consentCheckbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.textSecondary, 0.4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  consentCheckboxActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary,
  },
  consentCheckmark: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.white,
  },
  consentText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.error, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.3),
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2.5],
  },
  errorIcon: {
    fontSize: 18,
    flexShrink: 0,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.error,
  },
});

