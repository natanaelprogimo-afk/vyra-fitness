/**
 * useHomeSnapshot Hook
 *
 * Consolidated data fetcher for Home screen.
 * Returns:
 * - Daily metrics
 * - Quick log actions
 * - Progress data (streak, completion, week consistency)
 * - Recovery note
 */

import { useMemo } from 'react';
import { router } from 'expo-router';
import { Routes } from '@/constants/routes';
import { Colors } from '@/constants/colors';
import { useFasting } from './useFasting';
import { useFemaleHealth } from './useFemaleHealth';
import { useNutrition } from './useNutrition';
import { useReadiness } from './useReadiness';
import { useSleep } from './useSleep';
import { useSteps } from './useSteps';
import { useWater } from './useWater';
import { useWorkout } from './useWorkout';
import { useSupplements } from './useSupplements';
import { useEngagementStreak } from './useEngagementStreak';
import { useAuthStore } from '@/stores/authStore';
import { getActiveModules } from '@/lib/active-modules';
import { buildEngagementWeekDots, calculateEngagementStreak } from '@/lib/engagement-streak';
import type { DailyMetric } from '@/components/home/HomeDailyPulse';
import type { QuickLogAction } from '@/components/home/HomeQuickLogDock';
import type { RecoveryNote } from '@/components/home/HomeRecoveryNote';

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

function formatShortDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
}

export interface HomeSnapshot {
  metrics: DailyMetric[];
  quickLogActions: QuickLogAction[];
  completedToday: number;
  totalDaily: number;
  currentStreak: number;
  weekConsistency: number[];
  recoveryNote: RecoveryNote | null;
  loading: boolean;
}

export function useHomeSnapshot(): HomeSnapshot {
  const profile = useAuthStore((state) => state.profile);
  const { activeDates: engagementDates, loading: engagementLoading } = useEngagementStreak(60);
  const { dailyScore, loading: readinessLoading } = useReadiness();
  const { totalHydro, goal: waterGoal, progressPct: waterPct } = useWater();
  const { lastDurationHours, goalHours, qualityInfo } = useSleep();
  const { totalSteps, goal: stepGoal, progressPct: stepProgress, distanceKm } = useSteps();
  const { totals, simpleTargets, todayMeals } = useNutrition();
  const { activeSession, history: workoutHistory } = useWorkout();
  const { supplements, todayLogs: supplementLogs } = useSupplements();
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
  const activeModules = useMemo(() => getActiveModules(profile), [profile]);

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const hour = now.getHours();

  const todayWorkoutCount = useMemo(
    () => workoutHistory.filter((entry) => entry.started_at.slice(0, 10) === todayIso).length,
    [todayIso, workoutHistory],
  );

  const metrics = useMemo(() => {
    const items: DailyMetric[] = [];
    const safeRatio = (current: number, goal: number) => (goal > 0 ? (current / goal) * 100 : 0);
    const nextPeriodLabel = formatShortDate(femaleNextPeriodDate);

    activeModules.forEach((moduleId) => {
      if (moduleId === 'workout') {
        items.push({
          key: 'workout',
          icon: 'barbell-outline' as const,
          label: 'Entreno',
          value: activeSession ? 'Sesion activa' : `${todayWorkoutCount} hoy`,
          meta: activeSession?.name ?? 'Abri tu rutina de hoy',
          color: Colors.workout,
          progressPct: activeSession || todayWorkoutCount > 0 ? 100 : 0,
          onPress: () => router.push((activeSession ? Routes.workout.session : Routes.workout.index) as never),
        });
        return;
      }

      if (moduleId === 'nutrition') {
        items.push({
          key: 'nutrition',
          icon: 'restaurant-outline' as const,
          label: 'Nutrición',
          value: `${Math.round(safeRatio(totals.calories, simpleTargets.calories))}%`,
          meta:
            totals.calories > 0
              ? `${Math.max(0, Math.round(simpleTargets.calories - totals.calories))} kcal faltan`
              : 'Aun no registraste comidas',
          color: Colors.nutrition,
          progressPct: safeRatio(totals.calories, simpleTargets.calories),
          onPress: () => router.push(Routes.nutrition.index as never),
        });
        return;
      }

      if (moduleId === 'water') {
        items.push({
          key: 'water',
          icon: 'water-outline' as const,
          label: 'Agua',
          value: `${Math.round(waterPct)}%`,
          meta:
            waterPct >= 100
              ? 'Meta alcanzada'
              : `${Math.max(0, Math.round((waterGoal - totalHydro) / 1000))}L faltan`,
          color: Colors.water,
          progressPct: waterPct,
          onPress: () => router.push(Routes.water.index as never),
        });
        return;
      }

      if (moduleId === 'steps') {
        items.push({
          key: 'steps',
          icon: 'footsteps-outline' as const,
          label: 'Pasos',
          value: `${Math.round(totalSteps).toLocaleString()}`,
          meta:
            stepProgress >= 100
              ? 'Objetivo cumplido'
              : `${Math.max(0, Math.round(stepGoal - totalSteps)).toLocaleString()} faltan · ${Math.max(0, distanceKm).toFixed(1)} km`,
          color: Colors.steps,
          progressPct: stepProgress,
          onPress: () => router.push(Routes.steps.index as never),
        });
        return;
      }

      if (moduleId === 'sleep') {
        items.push({
          key: 'sleep',
          icon: 'moon-outline' as const,
          label: 'Sueño',
          value: `${Math.max(0, lastDurationHours).toFixed(1)}h`,
          meta:
            lastDurationHours >= goalHours
              ? qualityInfo.label
              : `${Math.round((lastDurationHours / Math.max(goalHours, 1)) * 100)}%`,
          color: Colors.sleep,
          progressPct: safeRatio(lastDurationHours, goalHours),
          onPress: () => router.push(Routes.sleep.index as never),
        });
        return;
      }

      if (moduleId === 'fasting') {
        items.push({
          key: 'fasting',
          icon: 'timer-outline' as const,
          label: 'Ayuno',
          value: fastingActive ? fastingProtocol : 'Listo',
          meta: fastingActive
            ? `${Math.max(0, fastingElapsedHours).toFixed(1)} / ${Math.max(1, fastingTargetHours)}h`
            : 'Toca iniciar desde el modulo',
          color: Colors.fasting,
          progressPct: fastingActive ? fastingProgressPct : 0,
          onPress: () => router.push(Routes.fasting.index as never),
        });
        return;
      }

      if (moduleId === 'female') {
        items.push({
          key: 'female',
          icon: 'flower-outline' as const,
          label: 'Ciclo',
          value: getFemalePhaseLabel(femalePhase),
          meta: isFemaleInCycle
            ? `${nextPeriodLabel ? `Próximo ${nextPeriodLabel} · ` : ''}Día ${Math.max(1, femaleDaysInPhase + 1)}/${Math.max(1, femaleCycleLength)}`
            : 'Pendiente de seguimiento',
          color: Colors.female,
          progressPct:
            isFemaleInCycle && femaleCycleLength > 0
              ? (femaleDaysInPhase / femaleCycleLength) * 100
              : 0,
          onPress: () => router.push(Routes.female.index as never),
        });
        return;
      }

      if (moduleId === 'supplements') {
        const totalSupplements = supplements.length;
        const takenToday = supplementLogs.length;
        items.push({
          key: 'supplements',
          icon: 'medical-outline' as const,
          label: 'Suplementos',
          value: totalSupplements > 0 ? `${takenToday}/${totalSupplements}` : 'Sin pauta',
          meta:
            totalSupplements > 0
              ? takenToday > 0
                ? `${takenToday} tomas hoy`
                : 'Sin tomas hoy'
              : 'Agrega tu stack',
          color: Colors.supplements,
          progressPct: totalSupplements > 0 ? (takenToday / totalSupplements) * 100 : 0,
          onPress: () => router.push(Routes.supplements.index as never),
        });
      }
    });

    return items;
  }, [
    activeModules,
    activeSession,
    distanceKm,
    femaleCycleLength,
    femaleDaysInPhase,
    femaleNextPeriodDate,
    femalePhase,
    fastingActive,
    fastingElapsedHours,
    fastingProtocol,
    fastingProgressPct,
    fastingTargetHours,
    goalHours,
    qualityInfo.label,
    stepGoal,
    stepProgress,
    totalHydro,
    totalSteps,
    todayWorkoutCount,
    totals.calories,
    simpleTargets.calories,
    supplements.length,
    supplementLogs.length,
    waterGoal,
    waterPct,
  ]);

  const quickLogActions = useMemo(() => {
    const items: QuickLogAction[] = [];

    activeModules.forEach((moduleId) => {
      if (moduleId === 'workout') {
        items.push({
          key: 'workout-log',
          icon: 'barbell-outline',
          label: 'Entreno',
          hint: activeSession ? 'Volver a la sesion activa' : 'Abrir rutina',
          color: Colors.workout,
          taps: 1,
          onPress: () => {
            router.push((activeSession ? Routes.workout.session : Routes.workout.index) as never);
          },
        });
        return;
      }

      if (moduleId === 'nutrition') {
        items.push({
          key: 'meal-log',
          icon: 'restaurant-outline',
          label: 'Comida',
          hint: 'Registrar comida',
          color: Colors.nutrition,
          taps: 2,
          onPress: () => {
            const suggestedType = hour < 12 ? 'breakfast' : hour < 16 ? 'lunch' : 'dinner';
            router.push({
              pathname: Routes.nutrition.log,
              params: { mealType: suggestedType },
            } as never);
          },
        });
        return;
      }

      if (moduleId === 'water') {
        items.push({
          key: 'water-log',
          icon: 'water-outline',
          label: 'Agua',
          hint: 'Abrir hidratacion',
          color: Colors.water,
          taps: 1,
          onPress: () => router.push(Routes.water.index as never),
        });
        return;
      }

      if (moduleId === 'sleep') {
        items.push({
          key: 'sleep-log',
          icon: 'moon-outline',
          label: 'Sueno',
          hint: 'Registrar descanso',
          color: Colors.sleep,
          taps: 2,
          onPress: () => router.push(Routes.sleep.log as never),
        });
        return;
      }

      if (moduleId === 'steps') {
        items.push({
          key: 'steps-log',
          icon: 'footsteps-outline',
          label: 'Pasos',
          hint: 'Abrir movimiento',
          color: Colors.steps,
          taps: 1,
          onPress: () => router.push(Routes.steps.index as never),
        });
        return;
      }

      if (moduleId === 'fasting') {
        items.push({
          key: 'fasting-log',
          icon: 'timer-outline',
          label: 'Ayuno',
          hint: fastingActive ? 'Ver ayuno activo' : 'Abrir ayuno',
          color: Colors.fasting,
          taps: 1,
          onPress: () => router.push(Routes.fasting.index as never),
        });
        return;
      }

      if (moduleId === 'female') {
        items.push({
          key: 'female-log',
          icon: 'flower-outline',
          label: 'Ciclo',
          hint: 'Abrir salud femenina',
          color: Colors.female,
          taps: 1,
          onPress: () => router.push(Routes.female.index as never),
        });
        return;
      }

      if (moduleId === 'supplements') {
        items.push({
          key: 'supplements-log',
          icon: 'medical-outline',
          label: 'Suplementos',
          hint: 'Abrir suplementos',
          color: Colors.supplements,
          taps: 1,
          onPress: () => router.push(Routes.supplements.index as never),
        });
      }
    });

    return items;
  }, [activeModules, activeSession, fastingActive, hour]);

  const completedToday = useMemo(() => {
    const completed = new Set<string>();

    if (activeModules.includes('workout') && (activeSession || todayWorkoutCount > 0)) {
      completed.add('workout');
    }
    if (activeModules.includes('nutrition') && todayMeals.length > 0) {
      completed.add('nutrition');
    }
    if (activeModules.includes('water') && totalHydro > 0) {
      completed.add('water');
    }
    if (activeModules.includes('steps') && totalSteps > 0) {
      completed.add('steps');
    }
    if (activeModules.includes('sleep') && lastDurationHours > 0) {
      completed.add('sleep');
    }
    if (activeModules.includes('fasting') && fastingActive) {
      completed.add('fasting');
    }
    if (activeModules.includes('female') && isFemaleInCycle && Boolean(femalePhase)) {
      completed.add('female');
    }

    return completed.size;
  }, [
    activeModules,
    activeSession,
    fastingActive,
    femalePhase,
    isFemaleInCycle,
    lastDurationHours,
    todayMeals,
    todayWorkoutCount,
    totalHydro,
    totalSteps,
  ]);

  const trackableModuleIds = ['workout', 'nutrition', 'water', 'steps', 'sleep', 'fasting', 'female'] as const;
  const totalDaily = activeModules.filter((moduleId) =>
    trackableModuleIds.includes(moduleId as (typeof trackableModuleIds)[number]),
  ).length;

  const currentStreak = useMemo(
    () => calculateEngagementStreak(engagementDates),
    [engagementDates],
  );

  const weekConsistency = useMemo(
    () => buildEngagementWeekDots(engagementDates).map((dot) => (dot.done ? 1 : 0)),
    [engagementDates],
  );

  const recoveryNote = useMemo<RecoveryNote | null>(() => {
    if (activeModules.includes('female') && isFemaleInCycle && femalePhase) {
      const phaseLabel = getFemalePhaseLabel(femalePhase);
      const nextPeriod = formatShortDate(femaleNextPeriodDate);
      return {
        icon: 'flower-outline',
        title: `${phaseLabel} · Día ${Math.max(1, femaleDaysInPhase + 1)}`,
        body: nextPeriod
          ? `Proximo periodo estimado ${nextPeriod}. ${
              femalePhase === 'menstrual'
                ? 'Baja un cambio y prioriza recuperacion.'
                : femalePhase === 'follicular'
                  ? 'Buen momento para subir intensidad.'
                  : femalePhase === 'ovulation'
                    ? 'Estas en una ventana fuerte para empujar.'
                    : 'Proteina y descanso te van a rendir mas.'
            }`
          : 'Tu ciclo ya puede guiar entreno, nutricion y descanso de hoy.',
        accent: Colors.female,
      };
    }

    if (activeModules.includes('fasting') && fastingActive) {
      return {
        icon: 'timer-outline',
        title: `Ayuno ${fastingProtocol}`,
        body: `${Math.max(0, fastingElapsedHours).toFixed(1)} / ${Math.max(1, fastingTargetHours)}h completadas. Agua y sueño siguen sumando.`,
        accent: Colors.fasting,
      };
    }

    if (activeModules.includes('sleep') && dailyScore?.meta.hasSleepLog === false) {
      return {
        icon: 'moon-outline',
        title: 'El sueño aún no quedó registrado',
        body: 'Si anoche dormiste, registrarlo hoy te deja una lectura más fiel del día.',
        accent: Colors.sleep,
      };
    }

    if (activeModules.includes('water') && dailyScore?.meta.hasWaterLog === false) {
      return {
        icon: 'water-outline',
        title: 'Todavia no hay agua registrada',
        body: `Vas en ${Math.round(waterPct)}% de la meta. Un vaso ahora destraba rápido el día.`,
        accent: Colors.water,
      };
    }

    if (activeModules.includes('nutrition') && dailyScore?.meta.hasMealsLog === false) {
      return {
        icon: 'restaurant-outline',
        title: 'Todavia no hay comidas registradas',
        body: 'La primera comida suele ser el registro más fácil para arrancar el día con contexto.',
        accent: Colors.nutrition,
      };
    }

    if (activeModules.includes('sleep') && lastDurationHours > 0 && lastDurationHours < goalHours) {
      return {
        icon: 'moon-outline',
        title: 'Dormiste por debajo de tu meta',
        body: `Anoche registraste ${lastDurationHours.toFixed(1)}h. Hoy conviene cuidar la carga y el descanso.`,
        accent: Colors.sleep,
      };
    }

    if (activeModules.includes('water') && waterPct < 80) {
      return {
        icon: 'water-outline',
        title: 'La hidratacion puede empujar mas',
        body: `Llevas ${Math.round(waterPct)}% de la meta de agua. Súma le un poco más para estabilizar el día.`,
        accent: Colors.water,
      };
    }

    if (dailyScore && dailyScore.score < 60) {
      return {
        icon: 'sparkles-outline',
        title: 'Tu día todavía se está acomodando',
        body: 'Con un registro puntual en tu modulo principal, la lectura de hoy se vuelve mucho mas util.',
        accent: Colors.warning,
      };
    }

    return null;
  }, [
    activeModules,
    dailyScore?.meta.hasMealsLog,
    dailyScore?.meta.hasSleepLog,
    dailyScore?.meta.hasWaterLog,
    dailyScore?.score,
    femaleDaysInPhase,
    femaleNextPeriodDate,
    femalePhase,
    fastingActive,
    fastingElapsedHours,
    fastingProtocol,
    fastingTargetHours,
    goalHours,
    isFemaleInCycle,
    lastDurationHours,
    waterPct,
  ]);

  const loading = readinessLoading || engagementLoading;

  return {
    metrics,
    quickLogActions,
    completedToday,
    totalDaily,
    currentStreak,
    weekConsistency,
    recoveryNote,
    loading,
  };
}
