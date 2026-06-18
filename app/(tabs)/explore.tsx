// REDESIGNED: 2026-05-21 - Explore now behaves like a practical module hub
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { MODULES, type ModuleId } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { useResponsiveLayout } from '@/constants/useResponsiveLayout';
import { ExplorePageStrings, WorkoutDifficultyLevels } from '@/constants/strings';
import { useFasting } from '@/hooks/useFasting';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useNutrition } from '@/hooks/useNutrition';
import { useSleep } from '@/hooks/useSleep';
import { useSteps } from '@/hooks/useSteps';
import { useWater } from '@/hooks/useWater';
import { useEngagementStreak } from '@/hooks/useEngagementStreak';
import { useReadiness } from '@/hooks/useReadiness';
import { useWorkout } from '@/hooks/useWorkout';
import { getActiveModules } from '@/lib/active-modules';
import { buildEngagementWeekDots, calculateEngagementStreak } from '@/lib/engagement-streak';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { getProfileContextMemory } from '@/lib/profile-context';
import { buildSuggestedActiveModules, isGoalDetailId } from '@/lib/onboarding-v2';
import { useAuthStore } from '@/stores/authStore';
import { formatCalories, formatVolume } from '@/utils/formatters';

type ExploreModuleTile = {
  id: string;
  title: string;
  body: string;
  route: string;
  color: string;
  emoji: string;
};

type ExploreRoutineCard = {
  key: string;
  eyebrow: string;
  title: string;
  meta: string;
  body: string;
  accent: string;
  route: string;
  params?: Record<string, string>;
  cta: string;
};

type ExploreLinkRow = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  route: string;
  accent: string;
};

function getWeekNumber(historyCount: number, daysPerWeek: number) {
  return Math.max(1, Math.floor(historyCount / Math.max(1, daysPerWeek)) + 1);
}

function isWithinLastDays(iso: string, days: number) {
  const date = new Date(iso);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  cutoff.setHours(0, 0, 0, 0);
  return date.getTime() >= cutoff.getTime();
}

function levelLabel(exerciseCount: number) {
  if (exerciseCount >= 7) return WorkoutDifficultyLevels.high;
  if (exerciseCount >= 5) return WorkoutDifficultyLevels.medium;
  return WorkoutDifficultyLevels.base;
}

function getPrimaryGoalOrder(
  goalDetail: string | null,
  primaryGoal: string | null,
  gender: 'male' | 'female',
  femaleHealthEnabled: boolean,
): ModuleId[] {
  if (goalDetail && isGoalDetailId(goalDetail)) {
    return buildSuggestedActiveModules(goalDetail, gender, femaleHealthEnabled);
  }

  switch (primaryGoal) {
    case 'lose_fat':
      return ['nutrition', 'steps', 'workout', 'water'];  // FIXED: Steps primero (NEAT)
    case 'gain_muscle':
      return ['workout', 'nutrition', 'sleep', 'water'];  // FIXED: Sleep > Water
    case 'sport_performance':
    case 'performance':
      return ['workout', 'sleep', 'nutrition', 'water', 'steps'];
    case 'mental_wellbeing':
    case 'mental':
      return ['sleep', 'water', 'steps'];
    case 'general_health':
    case 'health':
    default:
      return ['steps', 'sleep', 'water', 'nutrition', 'workout'];
  }
}

function getSectionCopy(
  moduleId: ModuleId | null | undefined,
  goalDetail: string | null,
  primaryGoal: string | null,
) {
  if (goalDetail === 'recover_habit') {
    return {
      title: 'Racha y continuidad',
      body: 'Hoy gana el habito antes que la intensidad.',
      action: 'Abrir progreso',
    };
  }

  if (goalDetail === 'feel_better' || primaryGoal === 'mental_wellbeing' || primaryGoal === 'mental') {
    return {
      title: 'Sueño y bienestar',
      body: 'Dormir bien, hidratarte y bajar friccion van al frente.',
      action: 'Abrir modulo',
    };
  }

  switch (moduleId) {
    case 'nutrition':
      return {
        title: 'Nutrición del día',
        body: 'Calorías y comidas van primero; el entreno acompaña.',
        action: 'Abrir nutrición',
      };
    case 'workout':
      return {
        title: 'Entreno de hoy',
        body: 'La rutina del día abre el bloque y te deja avanzar sin pensar.',
        action: 'Abrir entreno',
      };
    case 'steps':
      return {
        title: 'Pasos de hoy',
        body: 'Movimiento y ritmo marcan el centro de este plan.',
        action: 'Abrir pasos',
      };
    case 'sleep':
      return {
        title: 'Sueño de anoche',
        body: 'El descanso guía tu recuperación y tu energía.',
        action: 'Abrir sueño',
      };
    case 'water':
      return {
        title: 'Hidratación del día',
        body: 'La meta de agua mueve el resto del rendimiento.',
        action: 'Abrir agua',
      };
    case 'fasting':
      return {
        title: 'Ayuno',
        body: 'Tu ventana y el timer quedan arriba para no perder contexto.',
        action: 'Abrir ayuno',
      };
    case 'female':
      return {
        title: 'Ciclo y fase',
        body: 'Tu ciclo adapta el resto del plan.',
        action: 'Abrir ciclo',
      };
    case 'supplements':
      return {
        title: 'Suplementos',
        body: 'Tu stack y recordatorios quedan a mano.',
        action: 'Abrir stack',
      };
    default:
      return {
        title: 'Tu plan visible',
        body: 'El orden se adapta a tu objetivo y a los módulos activos.',
        action: 'Abrir modulo',
      };
  }
}

function getFemalePhaseLabel(phase: string | null | undefined) {
  switch (phase) {
    case 'menstrual':
      return 'Menstrual';
    case 'follicular':
      return 'Folicular';
    case 'ovulation':
      return 'Ovulacion';
    case 'luteal':
      return 'Lutea';
    default:
      return 'Ciclo';
  }
}

export default function ExploreScreen() {
  const profile = useAuthStore((state) => state.profile);
  const layout = useResponsiveLayout();
  const activeModules = getActiveModules(profile);
  const { focusActions } = useReadiness();
  const { totals, simpleTargets, todayMeals } = useNutrition();
  const { totalHydro, goal: waterGoal } = useWater();
  const { totalSteps, goal: stepGoal, progressPct: stepProgress, distanceKm } = useSteps();
  const { lastDurationHours, goalHours, qualityInfo } = useSleep();
  const {
    isActive: fastingActive,
    protocol: fastingProtocol,
    elapsedHours: fastingElapsedHours,
    targetHours: fastingTargetHours,
    progressPct: fastingProgressPct,
  } = useFasting();
  const {
    currentPhase: femalePhase,
    daysInPhase: femaleDaysInPhase,
    cycleLength: femaleCycleLength,
    nextPeriodDate: femaleNextPeriodDate,
    isInCycle: isFemaleInCycle,
  } = useFemaleHealth();
  const { activeDates: engagementDates } = useEngagementStreak(30);
  const {
    activeSession,
    history,
    routines,
    getActiveProgram,
    getRecommendedRoutine,
  } = useWorkout();
  const profileContextMemory = getProfileContextMemory(profile);
  const rawGoalDetail =
    (profile as unknown as Record<string, unknown>).goal_detail ?? profileContextMemory.goal_detail;
  const goalDetail = typeof rawGoalDetail === 'string' && rawGoalDetail.trim().length > 0
    ? rawGoalDetail.trim()
    : null;
  const primaryGoal = profile?.primary_goal ?? profile?.goal ?? null;
  const profileGender = profile?.gender === 'female' ? 'female' : 'male';
  const workoutCycleKey = [
    profile?.female_health_enabled ? '1' : '0',
    profile?.female_last_period_date ?? '',
    profile?.female_cycle_length ?? '',
    profile?.gender ?? '',
  ].join('|');

  const activeProgram = useMemo(() => getActiveProgram(), [getActiveProgram, history, routines]);
  const recommendedRoutineData = useMemo(
    () => getRecommendedRoutine(),
    [getRecommendedRoutine, history, routines, workoutCycleKey],
  );
  const recommendedRoutine = recommendedRoutineData.routine;
  const weeklyGoal = Math.max(1, activeProgram?.days_per_week ?? 4);
  const sessionsThisWeek = history.filter((item) => isWithinLastDays(item.started_at, 7)).length;
  const programWeek = getWeekNumber(history.length, weeklyGoal);
  const nextFocus = focusActions[0];

  const activeModuleOrder = useMemo(() => {
    const baseOrder = getPrimaryGoalOrder(
      goalDetail,
      primaryGoal,
      profileGender,
      Boolean(profile?.female_health_enabled),
    );
    const activeSet = new Set(activeModules);
    const ordered: ModuleId[] = [];

    for (const moduleId of baseOrder) {
      if (!activeSet.has(moduleId) || ordered.includes(moduleId)) continue;
      ordered.push(moduleId);
    }

    for (const moduleId of activeModules) {
      if (ordered.includes(moduleId)) continue;
      ordered.push(moduleId);
    }

    return ordered;
  }, [
    activeModules,
    goalDetail,
    primaryGoal,
    profile?.female_health_enabled,
    profileGender,
  ]);

  const engagementStreak = useMemo(
    () => calculateEngagementStreak(engagementDates),
    [engagementDates],
  );

  const weekDots = useMemo(
    () => buildEngagementWeekDots(engagementDates, 7),
    [engagementDates],
  );

  const activeModuleCards = useMemo<ExploreModuleTile[]>(
    () =>
      activeModuleOrder
        .map((moduleId) => {
          const module = MODULES.find((item) => item.id === moduleId);
          if (!module) return null;
          return {
            id: module.id,
            title: module.name,
            body: module.description,
            route: module.route,
            color: module.color,
            emoji: module.emoji,
          };
        })
        .filter((item): item is ExploreModuleTile => item !== null),
    [activeModuleOrder],
  );

  const featuredRoutineCards = useMemo<ExploreRoutineCard[]>(() => {
    const cards: ExploreRoutineCard[] = [];

    const buildModuleCard = (moduleId: ModuleId): ExploreRoutineCard | null => {
      switch (moduleId) {
        case 'nutrition': {
          const remainingCalories = Math.max(0, simpleTargets.calories - totals.calories);
          return {
            key: 'nutrition-summary',
            eyebrow: 'Nutrición del día',
            title: remainingCalories > 0 ? `${formatCalories(remainingCalories)} restantes` : 'Meta alcanzada',
            meta: `${todayMeals.length} comidas · meta ${formatCalories(simpleTargets.calories)}`,
            body:
              todayMeals.length > 0
                ? 'Ya hay comida registrada hoy.'
                : 'La primera comida le da contexto al resto del día.',
            accent: Colors.nutrition,
            route: todayMeals.length > 0 ? Routes.nutrition.index : Routes.nutrition.log,
            cta: todayMeals.length > 0 ? 'Abrir nutrición' : 'Registrar comida',
          };
        }
        case 'workout': {
          if (activeSession) {
            return {
              key: 'active-session',
              eyebrow: 'Sesión abierta',
              title: getWorkoutDisplayName(activeSession.name),
              meta: `${activeSession.exercises.length} ejercicios en curso`,
              body: 'Vuelve donde lo dejaste para cerrar el bloque sin perder el hilo.',
              accent: Colors.workout,
              route: Routes.workout.session,
              cta: 'Volver al entreno',
            };
          }

          if (activeProgram) {
            return {
              key: `program-${activeProgram.id}`,
              eyebrow: 'Programa activo',
              title: activeProgram.name,
              meta: `Semana ${programWeek} · ${sessionsThisWeek}/${weeklyGoal} sesiones`,
              body: 'Abre el plan completo y manten el bloque ordenado sin decidir desde cero.',
              accent: Colors.workout,
              route: Routes.workout.programs,
              cta: 'Ver programa',
            };
          }

          if (recommendedRoutine) {
            return {
              key: `recommended-${recommendedRoutine.id}`,
              eyebrow: 'Rutina destacada',
              title: getWorkoutDisplayName(recommendedRoutine.name),
              meta: `${recommendedRoutine.exercises.length} ejercicios · ${recommendedRoutine.estimated_duration_min ?? 30} min · ${levelLabel(recommendedRoutine.exercises.length)}`,
              body: recommendedRoutineData.reason || 'Es la opción más clara para hoy según tu contexto actual.',
              accent: Colors.workout,
              route: Routes.workout.preview,
              params: {
                routineId: recommendedRoutine.id,
                name: getWorkoutDisplayName(recommendedRoutine.name),
              },
              cta: 'Abrir rutina',
            };
          }

          return {
            key: 'workout-browse',
            eyebrow: 'Entreno',
            title: 'Ver programas',
            meta: 'Explora rutinas para hoy',
            body: 'No hay una rutina definida, pero si una puerta clara para empezar.',
            accent: Colors.workout,
            route: Routes.workout.programs,
            cta: 'Ver programas',
          };
        }
        case 'water': {
          const remainingMl = Math.max(0, waterGoal - totalHydro);
          return {
            key: 'water-summary',
            eyebrow: 'Hidratación del día',
            title: remainingMl > 0 ? `${formatVolume(remainingMl)} restantes` : 'Meta alcanzada',
            meta: `${formatVolume(totalHydro)} / ${formatVolume(waterGoal)}`,
            body:
              totalHydro > 0
                ? 'Ya hay hidratación registrada hoy.'
                : 'Una toma breve ya cambia el ritmo del día.',
            accent: Colors.water,
            route: Routes.water.index,
            cta: 'Registrar agua',
          };
        }
        case 'steps': {
          const remainingSteps = Math.max(0, stepGoal - totalSteps);
          return {
            key: 'steps-summary',
            eyebrow: 'Pasos de hoy',
            title: `${Math.round(totalSteps).toLocaleString('es-UY')} pasos`,
            meta: `${Math.round(stepProgress)}% · ${remainingSteps.toLocaleString('es-UY')} pendientes`,
            body:
              totalSteps > 0
                ? `${distanceKm.toFixed(1)} km hoy`
                : 'Empezar a caminar mueve todo el plan.',
            accent: Colors.steps,
            route: Routes.steps.index,
            cta: 'Ver pasos',
          };
        }
        case 'sleep': {
          const hasSleep = lastDurationHours > 0;
          return {
            key: 'sleep-summary',
            eyebrow: 'Sueño de anoche',
            title: hasSleep ? `${lastDurationHours.toFixed(1)}h dormidas` : 'Sin registro de anoche',
            meta: `Meta ${goalHours.toFixed(1)}h`,
            body: hasSleep ? qualityInfo.label : 'Registrar el descanso de anoche ordena la recuperación.',
            accent: Colors.sleep,
            route: hasSleep ? Routes.sleep.index : Routes.sleep.log,
            cta: hasSleep ? 'Abrir sueño' : 'Registrar sueño',
          };
        }
        case 'fasting': {
          return {
            key: 'fasting-summary',
            eyebrow: 'Ayuno',
            title: fastingActive ? `Ayuno ${fastingProtocol}` : `Protocolo ${fastingProtocol}`,
            meta: fastingActive
              ? `${fastingElapsedHours.toFixed(1)}h / ${Math.max(1, fastingTargetHours).toFixed(1)}h`
              : `${Math.round(fastingProgressPct)}% listo`,
            body: fastingActive
              ? 'Mantener agua y descanso sostiene el protocolo.'
              : 'Si lo activas, el timer aparece en vivo.',
            accent: Colors.fasting,
            route: Routes.fasting.index,
            cta: fastingActive ? 'Ver ayuno' : 'Abrir ayuno',
          };
        }
        case 'female': {
          const nextPeriodLabel = femaleNextPeriodDate
            ? new Date(`${femaleNextPeriodDate}T12:00:00`).toLocaleDateString('es-UY', {
                day: 'numeric',
                month: 'short',
              })
            : null;

          return {
            key: 'female-summary',
            eyebrow: 'Ciclo y fase',
            title: `${getFemalePhaseLabel(femalePhase)}${isFemaleInCycle ? ` · día ${femaleDaysInPhase + 1}` : ''}`,
            meta: isFemaleInCycle
              ? `${Math.max(1, femaleCycleLength ?? 28)} dias${nextPeriodLabel ? ` · proximo ${nextPeriodLabel}` : ''}`
              : 'Pendiente de seguimiento',
            body: isFemaleInCycle
              ? 'Tu ciclo ya puede adaptar entreno y nutricion.'
              : 'Activalo para sumar contexto a tu plan.',
            accent: Colors.female,
            route: Routes.female.index,
            cta: isFemaleInCycle ? 'Ver ciclo' : 'Configurar ciclo',
          };
        }
        case 'supplements':
          return {
            key: 'supplements-summary',
            eyebrow: 'Suplementos',
            title: 'Stack y recordatorios',
            meta: 'Tomas, horarios y adherencia',
            body: 'Revisa tu stack sin salir del plan.',
            accent: Colors.supplements,
            route: Routes.supplements.index,
            cta: 'Abrir stack',
          };
        default:
          return null;
      }
    };

    if (goalDetail === 'recover_habit') {
      cards.push({
        key: 'habit-summary',
        eyebrow: 'Racha actual',
        title: `${engagementStreak} dias seguidos`,
        meta: `${weekDots.filter((dot) => dot.done).length}/7 dias activos`,
        body: engagementStreak > 0
          ? 'Ya hay continuidad. Hoy toca sostenerla.'
          : 'El primer registro de hoy empieza la racha.',
        accent: Colors.brand,
        route: Routes.tabs.progress,
        cta: 'Ver progreso',
      });
    }

    for (const moduleId of activeModuleOrder) {
      if (cards.length >= 3) break;
      const moduleCard = buildModuleCard(moduleId);
      if (moduleCard) cards.push(moduleCard);
    }

    if (!cards.length && activeModules.includes('nutrition')) {
      cards.push({
        key: 'nutrition-start',
        eyebrow: 'Carga inteligente',
        title: 'Registrar una comida',
        meta: 'Entrada rápida para dejar el día visible',
        body: 'Si hoy aun no registraste nada, este es el mejor punto para arrancar.',
        accent: Colors.nutrition,
        route: Routes.nutrition.log,
        cta: 'Abrir nutricion',
      });
    }

    return cards.slice(0, 3);
  }, [
    activeModuleOrder,
    activeModules,
    activeProgram,
    activeSession,
    distanceKm,
    femaleCycleLength,
    femaleDaysInPhase,
    femaleNextPeriodDate,
    femalePhase,
    fastingActive,
    fastingElapsedHours,
    fastingProgressPct,
    fastingProtocol,
    fastingTargetHours,
    goalHours,
    goalDetail,
    engagementStreak,
    lastDurationHours,
    programWeek,
    qualityInfo.label,
    recommendedRoutine,
    recommendedRoutineData.reason,
    sessionsThisWeek,
    simpleTargets.calories,
    stepGoal,
    stepProgress,
    totalHydro,
    totalSteps,
    totals.calories,
    todayMeals.length,
    isFemaleInCycle,
    waterGoal,
    weeklyGoal,
    weekDots,
  ]);

  const sectionCopy = getSectionCopy(activeModuleOrder[0] ?? null, goalDetail, primaryGoal);
  const sectionRoute = goalDetail === 'recover_habit'
    ? Routes.tabs.progress
    : activeModuleOrder[0]
      ? (MODULES.find((item) => item.id === activeModuleOrder[0])?.route ?? Routes.tabs.explore)
      : Routes.tabs.explore;
  const quickLinks = useMemo<ExploreLinkRow[]>(() => {
    const links: ExploreLinkRow[] = [];

    if (activeModules.includes('nutrition')) {
      links.push({
        key: 'nutrition-search',
        eyebrow: 'Buscar',
        title: 'Alimentos y recientes',
        body: 'Abre la biblioteca o repite algo frecuente sin entrar a una lista eterna.',
        route: '/modules/nutrition/search',
        accent: Colors.nutrition,
      });
    }

    if (activeModules.includes('workout')) {
      links.push({
        key: 'workout-planner',
        eyebrow: 'Planificar',
        title: 'Planner semanal',
        body: 'Ve tu bloque, ajusta dias y evita decidir la rutina cada vez desde cero.',
        route: Routes.workout.planner,
        accent: Colors.workout,
      });
    }

    if (activeModules.includes('sleep')) {
      links.push({
        key: 'sleep-hub',
        eyebrow: 'Recuperacion',
        title: 'Sueño e insights',
        body: 'Abre la lectura de la noche y la tendencia sin salir del flujo diario.',
        route: Routes.sleep.index,
        accent: Colors.sleep,
      });
    }

    links.push({
      key: 'progress-insights',
      eyebrow: 'Progreso',
      title: 'Leer la semana',
      body: 'Ve score, tendencias e insights del sistema en un mismo bloque.',
      route: Routes.tabs.progress,
      accent: Colors.brand,
    });

    return links.slice(0, 4);
  }, [activeModules]);

  const searchTarget = activeModules.includes('nutrition')
    ? '/modules/nutrition/search'
    : activeModules.includes('workout')
      ? Routes.workout.programs
      : Routes.tabs.home;

  const handleExploreNavigation = useCallback(
    (
      route: string,
      params?: Record<string, string>,
    ) => {
      const destination = params
        ? ({ pathname: route, params } as never)
        : (route as never);

      router.push(destination);
    },
    [],
  );

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <Header title={ExplorePageStrings.title} showBack={false} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            maxWidth: layout.maxWidth,
            alignSelf: 'center',
            paddingHorizontal: layout.paddingHorizontal,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {nextFocus?.route ? (
          <Card style={styles.nextActionCard} shadow={false} accentColor={Colors.secondary}>
            <View style={styles.nextActionTop}>
              <View style={styles.nextActionCopy}>
                <Text style={styles.nextActionEyebrow}>Siguiente paso</Text>
                <Text style={styles.nextActionTitle}>{nextFocus.title}</Text>
                <Text style={styles.nextActionBody}>
                  El plan deberia servirte para decidir en segundos. Esta es la accion mas clara para seguir hoy.
                </Text>
              </View>
              <View style={styles.nextActionBadge}>
                <Ionicons name="sparkles-outline" size={18} color={Colors.secondary} />
              </View>
            </View>
            <Button
              onPress={() => {
                void handleExploreNavigation(nextFocus.route);
              }}
              fullWidth
              color={Colors.secondary}
              size="sm"
            >
              Abrir ahora
            </Button>
          </Card>
        ) : null}

        {featuredRoutineCards.length ? (
          <Card shadow={false}>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>{sectionCopy.title}</Text>
                <Text style={styles.sectionBody}>{sectionCopy.body}</Text>
              </View>
              <Pressable
                onPress={() => {
                  void handleExploreNavigation(sectionRoute);
                }}
                accessibilityRole="button"
                accessibilityLabel={sectionCopy.action}
                accessibilityHint={`Abre ${sectionCopy.title.toLowerCase()}.`}
                hitSlop={8}
              >
                <Text style={styles.sectionLink}>{sectionCopy.action}</Text>
              </Pressable>
            </View>

            <View style={styles.featuredStack}>
              {featuredRoutineCards.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.featuredCard, { borderColor: withOpacity(item.accent, 0.18) }]}
                  onPress={() => {
                    void handleExploreNavigation(item.route, item.params);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  accessibilityHint={item.body}
                >
                  <Text style={[styles.featuredEyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
                  <Text style={styles.featuredTitle}>{item.title}</Text>
                  <Text style={styles.featuredMeta}>{item.meta}</Text>
                  <Text style={styles.featuredBody}>{item.body}</Text>
                  <View style={styles.featuredFooter}>
                    <Text style={[styles.featuredCta, { color: item.accent }]}>{item.cta}</Text>
                    <Ionicons name="arrow-forward" size={16} color={item.accent} />
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        {activeModuleCards.length ? (
          <Card shadow={false}>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Tu plan visible</Text>
                <Text style={styles.sectionBody}>Solo lo activo. Si no empuja tu rutina actual, no aparece arriba.</Text>
              </View>
              <Text style={styles.sectionMeta}>{activeModuleCards.length} activos</Text>
            </View>

            <View style={styles.moduleGrid}>
              {activeModuleCards.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.moduleTile, { borderColor: withOpacity(item.color, 0.18) }]}
                  onPress={() => {
                    void handleExploreNavigation(item.route);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  accessibilityHint={item.body}
                >
                  <View style={[styles.moduleIconWrap, { backgroundColor: withOpacity(item.color, 0.12) }]}>
                    <Text style={styles.moduleEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={styles.moduleTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        <Card shadow={false}>
          <View style={styles.sectionTopRow}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Plan rapido</Text>
              <Text style={styles.sectionBody}>Cuando no quieres pensar mucho, estos accesos deberian resolverte la accion.</Text>
            </View>
          </View>

          <View style={styles.linksStack}>
            <Pressable
              style={[styles.linkRow, { borderColor: withOpacity(Colors.action, 0.16) }]}
              onPress={() => {
                void handleExploreNavigation(searchTarget);
              }}
              accessibilityRole="button"
              accessibilityLabel="Buscar módulos, rutinas o alimentos"
              accessibilityHint="Abre la mejor entrada de búsqueda según los módulos que activaste."
            >
              <View style={[styles.linkIconWrap, { backgroundColor: withOpacity(Colors.action, 0.12) }]}>
                <Ionicons name="search-outline" size={16} color={Colors.action} />
              </View>
              <View style={styles.linkCopy}>
                <Text style={[styles.linkEyebrow, { color: Colors.action }]}>Buscar</Text>
                <Text style={styles.linkTitle}>Rutinas, alimentos o accesos</Text>
                <Text style={styles.linkBody}>Usa busqueda solo cuando sabes lo que quieres abrir.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
            {quickLinks.map((item) => (
              <Pressable
                key={item.key}
                style={[styles.linkRow, { borderColor: withOpacity(item.accent, 0.16) }]}
                onPress={() => {
                  void handleExploreNavigation(item.route);
                }}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                accessibilityHint={item.body}
              >
                <View style={[styles.linkIconWrap, { backgroundColor: withOpacity(item.accent, 0.12) }]}>
                  <Ionicons name="arrow-forward-outline" size={16} color={item.accent} />
                </View>
                <View style={styles.linkCopy}>
                  <Text style={[styles.linkEyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
                  <Text style={styles.linkTitle}>{item.title}</Text>
                  <Text style={styles.linkBody}>{item.body}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </Card>

        <Card shadow={false}>
          <View style={styles.sectionTopRow}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Progreso de la semana</Text>
              <Text style={styles.sectionBody}>Lo que ya sostuviste en los ultimos 7 dias.</Text>
            </View>
            <Text style={styles.sectionMeta}>{engagementStreak} dias</Text>
          </View>

          <View style={styles.weekDotsRow}>
            {weekDots.map((dot) => (
              <View
                key={dot.key}
                style={[
                  styles.weekDot,
                  dot.done && styles.weekDotDone,
                  dot.isToday && styles.weekDotToday,
                ]}
              >
                <Text
                  style={[
                    styles.weekDotLabel,
                    dot.done && styles.weekDotLabelDone,
                    dot.isToday && styles.weekDotLabelToday,
                  ]}
                >
                  {dot.dayNumber}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <ScreenFooterSpacer />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: Spacing[4],
  },
  nextActionCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.secondary, 0.08),
    borderColor: withOpacity(Colors.secondary, 0.2),
  },
  nextActionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  nextActionCopy: {
    flex: 1,
    gap: 4,
  },
  nextActionEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.secondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  nextActionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  nextActionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.px20,
    color: Colors.textSecondary,
  },
  nextActionBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.secondary, 0.14),
  },
  sectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  sectionMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sectionLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.workout,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  moduleTile: {
    width: '49%',
    minHeight: 108,
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[3],
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  moduleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleEmoji: {
    fontSize: 16,
  },
  moduleTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  featuredStack: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  featuredCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 6,
  },
  featuredEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  featuredMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  featuredBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    marginTop: Spacing[1],
  },
  featuredCta: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  weekDotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  weekDot: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  weekDotDone: {
    backgroundColor: withOpacity(Colors.success, 0.16),
    borderColor: withOpacity(Colors.success, 0.4),
  },
  weekDotToday: {
    borderColor: Colors.brand,
    borderWidth: 1.5,
  },
  weekDotLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekDotLabelDone: {
    color: Colors.success,
  },
  weekDotLabelToday: {
    color: Colors.brand,
  },
  linksStack: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  linkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkCopy: {
    flex: 1,
    gap: 2,
  },
  linkEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  linkTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  linkBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
