/**
 * useTodayPriority Hook
 *
 * Determines the single most important action for today based on
 * the modules the user actually activated, following the redesign spec.
 */

import { useMemo } from 'react';
import { router } from 'expo-router';
import { Routes } from '@/constants/routes';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { getActiveModules } from '@/lib/active-modules';
import { calculateEngagementStreak } from '@/lib/engagement-streak';
import { getWorkoutPlanSnapshot } from '@/lib/workout-plan';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { useFasting, formatFastingTimeShort } from './useFasting';
import { useFemaleHealth } from './useFemaleHealth';
import { useNutrition } from './useNutrition';
import { useSleep } from './useSleep';
import { useSteps } from './useSteps';
import { useWater } from './useWater';
import { useWorkout } from './useWorkout';
import { useEngagementStreak } from './useEngagementStreak';
import type { TodayAction } from '@/components/home/HomeTodayAction';
import type { ModuleId } from '@/constants/modules';

function isoDay(value: string | null | undefined) {
  return value?.slice(0, 10) ?? '';
}

function mealLabel(mealType: 'breakfast' | 'lunch' | 'dinner') {
  switch (mealType) {
    case 'breakfast':
      return 'desayuno';
    case 'lunch':
      return 'almuerzo';
    case 'dinner':
    default:
      return 'cena';
  }
}

function buildDefaultAction(moduleId: ModuleId): TodayAction {
  switch (moduleId) {
    case 'workout':
      return {
        icon: 'barbell-outline',
        eyebrow: 'Entreno',
        title: 'Abrir tu rutina de hoy',
        body: 'La siguiente sesion te espera con el contexto listo.',
        cta: 'Ver entreno',
        color: Colors.workout,
        onPress: () => router.push(Routes.workout.index as never),
      };
    case 'nutrition':
      return {
        icon: 'restaurant-outline',
        eyebrow: 'Nutrición',
        title: 'Registrar tu primera comida',
        body: 'Empezar por comida suele destrabar el resto del día.',
        cta: 'Registrar comida',
        color: Colors.nutrition,
        onPress: () =>
          router.push({
            pathname: Routes.nutrition.log,
            params: { mealType: 'breakfast' },
          } as never),
      };
    case 'water':
      return {
        icon: 'water-outline',
        eyebrow: 'Agua',
        title: 'Suma agua ahora',
        body: 'Un registro pequeño ya mueve la meta del día.',
        cta: 'Registrar agua',
        color: Colors.water,
        onPress: () => router.push(Routes.water.index as never),
      };
    case 'sleep':
      return {
        icon: 'moon-outline',
        eyebrow: 'Sueño',
        title: 'Registrar tu sueño',
        body: 'Dejar la noche cerrada mejora la lectura de hoy.',
        cta: 'Ver sueño',
        color: Colors.sleep,
        onPress: () => router.push(Routes.sleep.index as never),
      };
    case 'steps':
      return {
        icon: 'footsteps-outline',
        eyebrow: 'Pasos',
        title: 'Moverte un poco mas',
        body: 'Una caminata breve ya suma al ritmo del día.',
        cta: 'Ver pasos',
        color: Colors.steps,
        onPress: () => router.push(Routes.steps.index as never),
      };
    case 'fasting':
      return {
        icon: 'timer-outline',
        eyebrow: 'Ayuno',
        title: 'Abrir tu ayuno',
        body: 'Si lo activas, el timer queda listo para seguirlo.',
        cta: 'Ver ayuno',
        color: Colors.fasting,
        onPress: () => router.push(Routes.fasting.index as never),
      };
    case 'female':
      return {
        icon: 'flower-outline',
        eyebrow: 'Ciclo',
        title: 'Abrir tu ciclo',
        body: 'Tu fase y tus síntomas ya pueden guiar el día.',
        cta: 'Ver ciclo',
        color: Colors.female,
        onPress: () => router.push(Routes.female.index as never),
      };
    case 'supplements':
      return {
        icon: 'medical-outline',
        eyebrow: 'Suplementos',
        title: 'Revisar tu stack',
        body: 'Tenes tu pauta lista para registrar sin perder el hilo.',
        cta: 'Abrir stack',
        color: Colors.supplements,
        onPress: () => router.push(Routes.supplements.index as never),
      };
    default:
      return {
        icon: 'checkmark-circle-outline',
        eyebrow: 'Buen día',
        title: 'Todo va en buen camino',
        body: 'Si no hay nada urgente, abre tu siguiente módulo.',
        cta: 'Explorar módulos',
        color: Colors.action,
        onPress: () => router.push(Routes.tabs.explore as never),
      };
  }
}

export function useTodayPriority(): TodayAction | null {
  const profile = useAuthStore((state) => state.profile);
  const activeModules = useMemo(() => getActiveModules(profile), [profile]);
  const activeModuleSet = useMemo(() => new Set(activeModules), [activeModules]);
  const { activeDates: engagementDates } = useEngagementStreak(60);

  const {
    activeFast,
    history: fastingHistory,
    elapsedHours,
    remainingMs,
  } = useFasting();
  const { currentPhase: femalePhase, isInCycle: isFemaleInCycle } = useFemaleHealth();
  const { activeSession, routines, history, getActiveProgram, getRecommendedRoutine } = useWorkout();
  const { hasEaten } = useNutrition();
  const { progressPct: waterPct } = useWater();
  const { lastDurationHours } = useSleep();
  const { progressPct: stepProgress } = useSteps();
  const hour = new Date().getHours();
  const profileStreak = Number(profile?.current_streak ?? profile?.streak ?? 0);
  const engagementStreak = useMemo(() => {
    const calculated = calculateEngagementStreak(engagementDates);
    return calculated > 0 ? calculated : profileStreak;
  }, [engagementDates, profileStreak]);

  return useMemo(() => {
    const activeProgram = getActiveProgram();
    const recommendedRoutine = getRecommendedRoutine().routine;

    const workoutPlan = activeModuleSet.has('workout')
      ? getWorkoutPlanSnapshot({
          routines,
          history,
          activeProgram,
          fallbackRoutine: recommendedRoutine,
        })
      : null;

    const mealType: 'breakfast' | 'lunch' | 'dinner' =
      hour < 11 ? 'breakfast' : hour < 16 ? 'lunch' : 'dinner';
    const mealLogged = Boolean(hasEaten[mealType]);
    const hasAnyMealLogged = Object.values(hasEaten).some(Boolean);
    const fastingCompleteToday =
      activeModuleSet.has('fasting') &&
      fastingHistory.some((entry) => {
        const entryDay = isoDay(entry.end_time ?? entry.start_time);
        return entry.status === 'completed' && entryDay === isoDay(new Date().toISOString());
      });
    const femaleComplete = !activeModuleSet.has('female') || Boolean(isFemaleInCycle && femalePhase);
    const workoutComplete =
      !activeModuleSet.has('workout') ||
      Boolean(activeSession || workoutPlan?.completedToday || workoutPlan?.isRestDay);
    const nutritionComplete = !activeModuleSet.has('nutrition') || hasAnyMealLogged;
    const waterComplete = !activeModuleSet.has('water') || waterPct >= 50;
    const sleepComplete = !activeModuleSet.has('sleep') || lastDurationHours > 0;
    const stepsComplete = !activeModuleSet.has('steps') || stepProgress >= 50;

    if (activeModuleSet.has('fasting') && activeFast) {
      const endTime = new Date(Date.now() + remainingMs);
      return {
        icon: 'timer-outline',
        eyebrow: 'AYUNO EN CURSO',
        title: `Llevas ${formatFastingTimeShort(Math.max(0, Math.round(elapsedHours * 3600)))} de ayuno`,
        body: `Romperas a ${endTime.toLocaleTimeString('es-UY', {
          hour: '2-digit',
          minute: '2-digit',
        })}. Vas bien.`,
        cta: 'Ver ayuno',
        color: Colors.fasting,
        onPress: () => router.push(Routes.fasting.index as never),
      };
    }

    if (activeModuleSet.has('workout') && activeSession) {
      return {
        icon: 'barbell-outline',
        eyebrow: 'BLOQUE DE HOY',
        title: `Vuelve a ${getWorkoutDisplayName(activeSession.name).toLowerCase()}`,
        body: 'Tu ultima sesion quedo abierta. Cierra el bloque sin perder el ritmo.',
        cta: 'Continuar entreno',
        color: Colors.workout,
        onPress: () => router.push(Routes.workout.session as never),
      };
    }

    if (
      activeModuleSet.has('workout') &&
      workoutPlan?.todayRoutine &&
      !workoutPlan.completedToday &&
      !workoutPlan.isRestDay
    ) {
      const todayRoutine = workoutPlan.todayRoutine;
      return {
        icon: 'barbell-outline',
        eyebrow: 'BLOQUE DE HOY',
        title: `${getWorkoutDisplayName(todayRoutine.name)} · Día de hoy`,
        body: `${todayRoutine.exercises.length} ejercicios · ${todayRoutine.estimated_duration_min ?? 0} min`,
        cta: 'Empezar entrenamiento',
        color: Colors.workout,
        onPress: () =>
          router.push({
            pathname: Routes.workout.preview,
            params: {
              routineId: todayRoutine.id,
              name: getWorkoutDisplayName(todayRoutine.name),
            },
          } as never),
      };
    }

    if (activeModuleSet.has('nutrition') && !mealLogged) {
      return {
        icon: 'restaurant-outline',
        eyebrow: 'PRÓXIMA COMIDA',
        title:
          mealType === 'breakfast'
            ? 'Registrá tu desayuno'
            : mealType === 'lunch'
              ? 'Es hora del almuerzo'
              : 'Cerrá el día con la cena',
        body:
          mealType === 'breakfast'
            ? 'Empezar a loggear comidas define el día.'
            : mealType === 'lunch'
              ? 'Registralo en segundos.'
              : 'Último registro del día.',
        cta:
          mealType === 'breakfast'
            ? 'Registrar desayuno'
            : mealType === 'lunch'
              ? 'Registrar almuerzo'
              : 'Registrar cena',
        color: Colors.nutrition,
        onPress: () =>
          router.push({
            pathname: Routes.nutrition.log,
            params: { mealType },
          } as never),
      };
    }

    if (activeModuleSet.has('water') && hour >= 15 && waterPct < 50) {
      const remainingLiters = Math.max(0, ((50 - waterPct) / 100) * 1.0);
      return {
        icon: 'water-outline',
        eyebrow: 'RECORDATORIO',
        title: `Te faltan ${remainingLiters.toFixed(1)}L para tu meta`,
        body: 'Hidratarte ahora mejora tu recuperacion.',
        cta: 'Registrar agua',
        color: Colors.water,
        onPress: () => router.push(Routes.water.index as never),
      };
    }

    const allTrackableComplete =
      workoutComplete &&
      nutritionComplete &&
      waterComplete &&
      sleepComplete &&
      stepsComplete &&
      fastingCompleteToday &&
      femaleComplete;

    if (allTrackableComplete) {
      const completedCount = [
        workoutComplete,
        nutritionComplete,
        waterComplete,
        sleepComplete,
        stepsComplete,
        fastingCompleteToday,
        femaleComplete,
      ].filter(Boolean).length;
      const totalCount = [
        activeModuleSet.has('workout'),
        activeModuleSet.has('nutrition'),
        activeModuleSet.has('water'),
        activeModuleSet.has('sleep'),
        activeModuleSet.has('steps'),
        activeModuleSet.has('fasting'),
        activeModuleSet.has('female'),
      ].filter(Boolean).length;

      return {
        icon: 'checkmark-circle-outline',
        eyebrow: 'DÍA CERRADO',
        title: `Progreso ${completedCount}/${totalCount} · Racha: ${engagementStreak} días`,
        body: '¡Excelente día!',
        cta: 'Ver resumen',
        color: Colors.success,
        onPress: () => router.push(Routes.tabs.progress as never),
      };
    }

    const fallbackModule =
      activeModules.find((moduleId) => {
        if (!['workout', 'nutrition', 'water', 'sleep', 'steps', 'fasting', 'female'].includes(moduleId)) {
          return false;
        }
        if (moduleId === 'workout') return !workoutComplete;
        if (moduleId === 'nutrition') return !nutritionComplete;
        if (moduleId === 'water') return !waterComplete;
        if (moduleId === 'sleep') return !sleepComplete;
        if (moduleId === 'steps') return !stepsComplete;
        if (moduleId === 'fasting') return !fastingCompleteToday;
        if (moduleId === 'female') return !femaleComplete;
        return false;
      }) ??
      activeModules.find((moduleId) =>
        ['workout', 'nutrition', 'water', 'sleep', 'steps', 'fasting', 'female'].includes(moduleId),
      ) ??
      null;

    return fallbackModule ? buildDefaultAction(fallbackModule) : buildDefaultAction('water');
  }, [
    activeFast,
    activeModuleSet,
    activeModules,
    activeSession,
    elapsedHours,
    femalePhase,
    fastingHistory,
    getActiveProgram,
    getRecommendedRoutine,
    hasEaten,
    history,
    hour,
    isFemaleInCycle,
    lastDurationHours,
    remainingMs,
    routines,
    engagementDates,
    profileStreak,
    engagementStreak,
    stepProgress,
    waterPct,
  ]);
}
