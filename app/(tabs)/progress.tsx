// REDESIGNED: 2026-05-21 - progress tab now reads as a real analytical cockpit
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProgressCircle from '@/components/charts/ProgressCircle';
import MiniSparkline from '@/components/progress/MiniSparkline';
import VyraBalanceTrendChart from '@/components/progress/VyraBalanceTrendChart';
import MuscleSilhouette from '@/components/workout/MuscleSilhouette';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { Colors, withOpacity } from '@/constants/colors';
import { MODULES } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { useLocalizedStrings, ProgressPageStrings } from '@/constants/strings';
import { FontFamily, FontSize, Radius, Spacing, TextLeading } from '@/constants/theme';
import { useResponsiveLayout } from '@/constants/useResponsiveLayout';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkout } from '@/hooks/useWorkout';
import { useNutrition } from '@/hooks/useNutrition';
import { useWater } from '@/hooks/useWater';
import { useSteps } from '@/hooks/useSteps';
import { useSleep } from '@/hooks/useSleep';
import { useFasting } from '@/hooks/useFasting';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useWeight } from '@/hooks/useWeight';
import { useEngagementStreak } from '@/hooks/useEngagementStreak';
import { useReadiness, type ScoreBreakdown, type ScoreHistory } from '@/hooks/useReadiness';
import { getActiveModules } from '@/lib/active-modules';
import {
  buildEngagementWeekDots,
  calculateEngagementStreak,
  createActiveDateSet,
} from '@/lib/engagement-streak';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import {
  formatCalories,
  formatDistance,
  formatDuration,
  formatVolume,
  formatWeight,
} from '@/utils/formatters';

type ModuleProgressCard = {
  id: string;
  title: string;
  color: string;
  value: string;
  meta: string;
  note: string;
  cta: string;
  progress: number;
  route: string;
};

type RangeKey = '7d' | '30d' | '90d';

type FactorCardData = {
  key: keyof ScoreBreakdown;
  label: string;
  color: string;
  value: number;
  delta: number | null;
  route: string;
  series: number[];
};

const RANGE_DAYS: Record<RangeKey, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const RANGE_OPTIONS = [
  { value: '7d' as const, label: '7d' },
  { value: '30d' as const, label: '30d' },
  { value: '90d' as const, label: '90d' },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function averageRows(rows: ScoreHistory[]) {
  if (!rows.length) return null;
  const total = rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0);
  return Math.round(total / rows.length);
}

function sortHistory(rows: ScoreHistory[]) {
  return [...rows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function formatHistoryLabel(value: string, range: RangeKey) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  if (range === '7d') {
    return date.toLocaleDateString('es-UY', { weekday: 'short' }).replace('.', '');
  }

  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
}

function formatRangeWindow(range: RangeKey) {
  if (range === '7d') return 'esta semana';
  if (range === '30d') return 'los ultimos 30 dias';
  return 'los ultimos 90 dias';
}

function formatDelta(delta: number | null) {
  if (delta === null) return '--';
  if (delta === 0) return '0';
  return `${delta > 0 ? '+' : ''}${delta}`;
}

function getDeltaTone(delta: number | null) {
  if (delta === null || delta === 0) return Colors.textMuted;
  return delta > 0 ? Colors.success : Colors.error;
}

function getTrendArrow(delta: number | null) {
  if (delta === null || delta === 0) return 'remove';
  return delta > 0 ? 'arrow-up' : 'arrow-down';
}

function getModuleInfo(moduleId: string) {
  return MODULES.find((item) => item.id === moduleId);
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

function getMetricSeries(history: ScoreHistory[], key: keyof ScoreBreakdown) {
  return history.map((row) => {
    if (key === 'hydration') return Number(row.hydration_pct ?? 0);
    if (key === 'activity') return Number(row.activity_pct ?? 0);
    if (key === 'sleep') return Number(row.sleep_pct ?? 0);
    if (key === 'nutrition') return Number(row.nutrition_pct ?? 0);
    return Number(row.mental_pct ?? 0);
  });
}

function getMetricDelta(series: number[]) {
  if (series.length < 2) return null;
  return Math.round(series[series.length - 1] - series[0]);
}

function buildFactorCards(
  history: ScoreHistory[],
  breakdown: ScoreBreakdown | null,
  activeModules: string[],
): FactorCardData[] {
  const activeSet = new Set(activeModules);
  const hydrationSeries = getMetricSeries(history, 'hydration');
  const activitySeries = getMetricSeries(history, 'activity');
  const sleepSeries = getMetricSeries(history, 'sleep');
  const nutritionSeries = getMetricSeries(history, 'nutrition');
  const mentalSeries = getMetricSeries(history, 'mental');

  const cards: FactorCardData[] = [];

  if (activeSet.has('water')) {
    cards.push({
      key: 'hydration',
      label: 'Agua',
      color: Colors.water,
      value: breakdown?.hydration ?? hydrationSeries[hydrationSeries.length - 1] ?? 0,
      delta: getMetricDelta(hydrationSeries),
      route: Routes.water.index,
      series: hydrationSeries,
    });
  }

  if (activeSet.has('workout') || activeSet.has('steps')) {
    cards.push({
      key: 'activity',
      label: 'Movimiento',
      color: Colors.steps,
      value: breakdown?.activity ?? activitySeries[activitySeries.length - 1] ?? 0,
      delta: getMetricDelta(activitySeries),
      route: activeSet.has('workout') ? Routes.workout.index : Routes.steps.index,
      series: activitySeries,
    });
  }

  if (activeSet.has('sleep')) {
    cards.push({
      key: 'sleep',
      label: 'Sueño',
      color: Colors.sleep,
      value: breakdown?.sleep ?? sleepSeries[sleepSeries.length - 1] ?? 0,
      delta: getMetricDelta(sleepSeries),
      route: Routes.sleep.index,
      series: sleepSeries,
    });
  }

  if (activeSet.has('nutrition')) {
    cards.push({
      key: 'nutrition',
      label: 'Nutricion',
      color: Colors.nutrition,
      value: breakdown?.nutrition ?? nutritionSeries[nutritionSeries.length - 1] ?? 0,
      delta: getMetricDelta(nutritionSeries),
      route: Routes.nutrition.index,
      series: nutritionSeries,
    });
  }

  cards.push({
    key: 'mental',
    label: 'Mental',
    color: Colors.mental,
    value: breakdown?.mental ?? mentalSeries[mentalSeries.length - 1] ?? 0,
    delta: getMetricDelta(mentalSeries),
    route: Routes.readiness,
    series: mentalSeries,
  });

  return cards;
}

function buildGoalCopy(params: {
  goal: string | null | undefined;
  consumedCalories: number;
  targetCalories: number;
  activityCalories: number;
  nutritionStreakDays: number;
  progressStrings: ReturnType<typeof useLocalizedStrings>['ShellStrings']['progress'];
}) {
  const { goal, consumedCalories, targetCalories, activityCalories, nutritionStreakDays, progressStrings } = params;
  if (consumedCalories <= 0) {
    return {
      title: 'Aun no registraste comidas hoy',
      body: 'Registra tu primera comida para ver energía, macros y balance del día.',
      note: 'En cuanto cargues algo, esta card deja de estar vacia.',
    };
  }
  const remaining = Math.max(0, Math.round(targetCalories - consumedCalories));
  const overTarget = Math.max(0, Math.round(consumedCalories - targetCalories));
  const targetPct = clampPercent((consumedCalories / Math.max(1, targetCalories)) * 100);

  if (goal === 'lose_fat') {
    return {
      title:
        remaining > 0
          ? progressStrings.goals.loseFatRemaining.replace('{{remaining}}', String(remaining))
          : progressStrings.goals.loseFatOver.replace('{{over}}', String(overTarget)),
      body:
        remaining > 0
          ? progressStrings.goals.loseFatBodyGood.replace('{{activity}}', formatCalories(activityCalories))
          : progressStrings.goals.loseFatBodyOver,
      note: progressStrings.goals.loseFatNote
        .replace('{{pct}}', String(targetPct))
        .replace('{{days}}', String(nutritionStreakDays)),
    };
  }

  if (goal === 'gain_muscle') {
    return {
      title:
        remaining > 0
          ? progressStrings.goals.gainMuscleRemaining.replace('{{remaining}}', String(remaining))
          : progressStrings.goals.gainMuscleDone,
      body:
        remaining > 0
          ? progressStrings.goals.gainMuscleBodyRemaining
          : progressStrings.goals.gainMuscleBodyDone,
      note: progressStrings.goals.gainMuscleNote
        .replace('{{pct}}', String(targetPct))
        .replace('{{activity}}', formatCalories(activityCalories)),
    };
  }

  if (goal === 'sport_performance' || goal === 'performance') {
    return {
      title: progressStrings.goals.performanceTitle.replace('{{pct}}', String(targetPct)),
      body: progressStrings.goals.performanceBody.replace('{{activity}}', formatCalories(activityCalories)),
      note: progressStrings.goals.performanceNote
        .replace('{{target}}', formatCalories(targetCalories))
        .replace('{{days}}', String(nutritionStreakDays)),
    };
  }

  return {
    title: progressStrings.goals.defaultTitle.replace('{{pct}}', String(targetPct)),
    body: progressStrings.goals.defaultBody
      .replace('{{activity}}', formatCalories(activityCalories))
      .replace('{{days}}', String(nutritionStreakDays)),
    note: progressStrings.goals.defaultNote.replace('{{target}}', formatCalories(targetCalories)),
  };
}

function buildWeightCopy(params: {
  goal: string | null | undefined;
  current: number | null;
  target: number | null;
  weeklyDelta: number | null;
  weightUnit: 'kg' | 'lb';
  progressStrings: ReturnType<typeof useLocalizedStrings>['ShellStrings']['progress'];
}) {
  const { goal, current, target, weeklyDelta, weightUnit, progressStrings } = params;

  if (current === null) {
    return {
      title: progressStrings.weight.noDataTitle,
      body: progressStrings.weight.noDataBody,
      note: progressStrings.weight.noDataNote,
    };
  }

  const deltaText =
    weeklyDelta === null
      ? progressStrings.weight.noTrend
      : progressStrings.weight.weeklyDelta
          .replace('{{sign}}', weeklyDelta > 0 ? '+' : '')
          .replace('{{value}}', formatWeight(Math.abs(weeklyDelta), weightUnit).replace(/^(0 )?/, ''));

  if (target !== null) {
    const difference = Math.round((current - target) * 10) / 10;
    if (goal === 'lose_fat' && difference > 0) {
      return {
        title: progressStrings.weight.toGoal.replace('{{value}}', formatWeight(difference, weightUnit)),
        body: progressStrings.weight.loseFatBody.replace('{{current}}', formatWeight(current, weightUnit)),
        note: deltaText,
      };
    }

    if (goal === 'gain_muscle' && difference < 0) {
      return {
        title: progressStrings.weight.toGoal.replace('{{value}}', formatWeight(Math.abs(difference), weightUnit)),
        body: progressStrings.weight.gainMuscleBody.replace('{{current}}', formatWeight(current, weightUnit)),
        note: deltaText,
      };
    }
  }

  return {
    title: progressStrings.weight.currentWeight.replace('{{value}}', formatWeight(current, weightUnit)),
    body: progressStrings.weight.defaultBody,
    note: deltaText,
  };
}

function ProgressBar({ color, progress }: { color: string; progress: number }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${clampPercent(progress)}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function StatPill({
  label,
  value,
  toneColor = Colors.textPrimary,
}: {
  label: string;
  value: string;
  toneColor?: string;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text style={[styles.statPillValue, { color: toneColor }]}>{value}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const [range, setRange] = useState<RangeKey>('7d');
  const profile = useAuthStore((state) => state.profile);
  const layout = useResponsiveLayout();
  const { ShellStrings: shellStrings, ModuleNames: moduleNames } = useLocalizedStrings();
  const progressStrings = shellStrings.progress;
  const volumeUnit = useSettingsStore((state) => state.volumeUnit);
  const weightUnit = useSettingsStore((state) => state.weightUnit);
  const distUnit = useSettingsStore((state) => state.distUnit);
  const activeModules = getActiveModules(profile);

  const { activeDates: storedEngagementDates } = useEngagementStreak(90);
  const { history, getWeeklyStats, getActiveProgram } = useWorkout();
  const {
    totals,
    simpleTargets,
    activityCalories,
    weeklyData: nutritionWeeklyData,
    nutritionStreakDays,
    todayMeals,
  } = useNutrition();
  const { totalHydro, goal: waterGoal, hydrationStreak } = useWater();
  const { totalSteps, goal: stepGoal, daysMetGoal, distanceKm } = useSteps();
  const { lastDurationHours, goalHours, daysWithGoal, getLastNight } = useSleep();
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
  const { stats } = useWeight();
  const {
    dailyScore,
    history: readinessHistory,
    fetchHistory,
    predictedScore,
    similarDayComparison,
    focusActions,
    morningNarrative,
    crossModuleInsights,
    qualityScoreStreak,
    scoreColor,
    scoreLabel,
  } = useReadiness();

  const activeProgram = getActiveProgram();
  const weeklyWorkout = getWeeklyStats();
  const lastSleep = getLastNight();
  const today = todayKey();
  const rangeDays = RANGE_DAYS[range];

  useEffect(() => {
    void fetchHistory(rangeDays);
  }, [fetchHistory, rangeDays]);

  const workoutToday = history.some((entry) => entry.started_at.slice(0, 10) === today);
  const nutritionToday = todayMeals.length > 0;
  const stepsToday = Number(totalSteps ?? 0) > 0;
  const waterToday = Number(totalHydro ?? 0) > 0;
  const sleepTracked = Boolean(lastSleep?.end_time);

  const completedToday = useMemo(() => {
    const set = new Set<string>();
    if (workoutToday) set.add('workout');
    if (nutritionToday) set.add('nutrition');
    if (stepsToday) set.add('steps');
    if (waterToday) set.add('water');
    if (sleepTracked) set.add('sleep');
    if (fastingActive) set.add('fasting');
    if (isFemaleInCycle && Boolean(femalePhase)) set.add('female');
    return set;
  }, [fastingActive, femalePhase, isFemaleInCycle, nutritionToday, sleepTracked, stepsToday, waterToday, workoutToday]);

  const liveEngagementDates = useMemo(
    () =>
      createActiveDateSet([
        workoutToday ? [today] : [],
        nutritionToday ? [today] : [],
        stepsToday ? [today] : [],
        waterToday ? [today] : [],
        sleepTracked && lastSleep?.end_time ? [lastSleep.end_time.slice(0, 10)] : [],
      ]),
    [lastSleep?.end_time, nutritionToday, sleepTracked, stepsToday, today, waterToday, workoutToday],
  );

  const allEngagementDates = useMemo(
    () => createActiveDateSet([storedEngagementDates, liveEngagementDates]),
    [liveEngagementDates, storedEngagementDates],
  );
  const streak = useMemo(() => calculateEngagementStreak(allEngagementDates), [allEngagementDates]);
  const weekDots = useMemo(() => buildEngagementWeekDots(allEngagementDates), [allEngagementDates]);

  const recentWorkoutMuscles = useMemo(
    () =>
      history
        .filter((entry) => {
          const daysAgo = Math.round((Date.now() - new Date(entry.started_at).getTime()) / 86400000);
          return daysAgo <= 29;
        })
        .flatMap((entry) => entry.muscles_worked ?? []),
    [history],
  );

  const programSessionsDone = useMemo(() => {
    if (!activeProgram) return 0;
    return history.filter((entry) => activeProgram.routine_ids.includes(entry.routine_id ?? '')).length;
  }, [activeProgram, history]);

  const moduleCards = useMemo<ModuleProgressCard[]>(() => {
    const cards: ModuleProgressCard[] = [];
    const nextFemalePeriodLabel = femaleNextPeriodDate
      ? new Date(`${femaleNextPeriodDate}T12:00:00`).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })
      : null;

    activeModules.forEach((moduleId) => {
      const definition = getModuleInfo(moduleId);
      if (!definition) return;

      if (moduleId === 'workout') {
        const targetSessions = activeProgram?.days_per_week ?? 3;
        const programTitle = activeProgram?.name ?? progressStrings.cards.workoutMeta;
        cards.push({
          id: moduleId,
          title: moduleNames.workout,
          color: definition.color,
          value: `${weeklyWorkout.sessions}/${targetSessions} ${ProgressPageStrings.workoutSessions}`,
          meta: activeProgram ? programTitle : progressStrings.cards.workoutMeta,
          note:
            weeklyWorkout.sessions > 0
              ? progressStrings.cards.workoutProgramNote
                  .replace('{{duration}}', formatDuration(Math.max(weeklyWorkout.sessions * 45, 30)))
                  .replace('{{count}}', String(programSessionsDone))
              : progressStrings.cards.workoutNote,
          cta: activeProgram ? progressStrings.cards.continueProgram : progressStrings.cards.startWorkout,
          progress: (weeklyWorkout.sessions / Math.max(1, targetSessions)) * 100,
          route: activeProgram ? Routes.workout.programs : Routes.workout.index,
        });
        return;
      }

      if (moduleId === 'nutrition') {
        cards.push({
          id: moduleId,
          title: moduleNames.nutrition,
          color: definition.color,
          value: `${Math.round(totals.calories)} / ${Math.round(simpleTargets.calories)} kcal`,
          meta: progressStrings.cards.nutritionMeta
            .replace('{{protein}}', String(Math.round(totals.protein)))
            .replace('{{days}}', String(nutritionStreakDays)),
          note: progressStrings.cards.nutritionNote.replace(
            '{{days}}',
            String(nutritionWeeklyData.filter((row) => Number(row.calories ?? 0) > 0).length),
          ),
          cta: progressStrings.cards.openNutrition,
          progress: (totals.calories / Math.max(1, simpleTargets.calories)) * 100,
          route: Routes.nutrition.index,
        });
        return;
      }

      if (moduleId === 'water') {
        cards.push({
          id: moduleId,
          title: moduleNames.water,
          color: definition.color,
          value: `${formatVolume(totalHydro, volumeUnit)} / ${formatVolume(waterGoal, volumeUnit)}`,
          meta: progressStrings.cards.waterMeta.replace('{{days}}', String(hydrationStreak.streakDays)),
          note: hydrationStreak.metToday ? progressStrings.cards.waterDone : progressStrings.cards.waterPending,
          cta: progressStrings.cards.openWater,
          progress: (totalHydro / Math.max(1, waterGoal)) * 100,
          route: Routes.water.index,
        });
        return;
      }

      if (moduleId === 'steps') {
        cards.push({
          id: moduleId,
          title: moduleNames.steps,
          color: definition.color,
          value: `${Math.round(totalSteps).toLocaleString()} / ${Math.round(stepGoal).toLocaleString()}`,
          meta: progressStrings.cards.stepsMeta.replace('{{days}}', String(daysMetGoal)),
          note: progressStrings.cards.stepsNote.replace('{{distance}}', formatDistance(distanceKm, distUnit)),
          cta: progressStrings.cards.openSteps,
          progress: (totalSteps / Math.max(1, stepGoal)) * 100,
          route: Routes.steps.index,
        });
        return;
      }

      if (moduleId === 'sleep') {
        cards.push({
          id: moduleId,
          title: moduleNames.sleep,
          color: definition.color,
          value: `${lastDurationHours.toFixed(1)}h / ${goalHours.toFixed(1)}h`,
          meta: progressStrings.cards.sleepMeta.replace('{{days}}', String(daysWithGoal)),
          note: lastDurationHours >= goalHours ? ProgressPageStrings.sleepRecovered : ProgressPageStrings.sleepRecovering,
          cta: progressStrings.cards.openSleep,
          progress: (lastDurationHours / Math.max(1, goalHours)) * 100,
          route: Routes.sleep.index,
        });
        return;
      }

      if (moduleId === 'fasting') {
        cards.push({
          id: moduleId,
          title: moduleNames.fasting ?? 'Ayuno',
          color: definition.color,
          value: fastingActive ? `${fastingProtocol} activo` : 'Listo para iniciar',
          meta: fastingActive
            ? `${Math.max(0, fastingElapsedHours).toFixed(1)} / ${Math.max(1, fastingTargetHours)}h`
            : 'Ventana base configurada',
          note: fastingActive ? 'El timer esta corriendo' : 'Toca para iniciar tu ventana',
          cta: fastingActive ? 'Ver ayuno' : 'Abrir ayuno',
          progress: fastingActive ? fastingProgressPct : 0,
          route: Routes.fasting.index,
        });
        return;
      }

      if (moduleId === 'female') {
        cards.push({
          id: moduleId,
          title: moduleNames.female ?? 'Ciclo',
          color: definition.color,
          value: isFemaleInCycle ? `${getFemalePhaseLabel(femalePhase)} · Día ${Math.max(1, femaleDaysInPhase + 1)}` : 'Pendiente',
          meta: isFemaleInCycle
            ? `${nextFemalePeriodLabel ? `Proximo ${nextFemalePeriodLabel}` : 'Ciclo activo'}`
            : 'Configura tu ciclo',
          note: isFemaleInCycle
            ? 'La fase actual ya puede guiar tu semana'
            : 'Agrega tu primer periodo para empezar a leer contexto',
          cta: 'Abrir ciclo',
          progress:
            isFemaleInCycle && femaleCycleLength > 0
              ? (femaleDaysInPhase / Math.max(1, femaleCycleLength)) * 100
              : 0,
          route: Routes.female.index,
        });
        return;
      }

      cards.push({
        id: moduleId,
        title: moduleNames[moduleId as keyof typeof moduleNames] ?? definition.name,
        color: definition.color,
        value: progressStrings.cards.active,
        meta: progressStrings.cards.active,
        note: progressStrings.cards.moduleAvailable,
        cta: progressStrings.cards.openModule,
        progress: completedToday.has(moduleId) ? 100 : 0,
        route: definition.route,
      });
    });

    return cards;
  }, [
    ProgressPageStrings.sleepRecovered,
    ProgressPageStrings.sleepRecovering,
    ProgressPageStrings.workoutSessions,
    activeModules,
    activeProgram,
    completedToday,
    daysMetGoal,
    daysWithGoal,
    distUnit,
    distanceKm,
    goalHours,
    hydrationStreak.metToday,
    hydrationStreak.streakDays,
    lastDurationHours,
    fastingActive,
    fastingElapsedHours,
    fastingProtocol,
    fastingProgressPct,
    fastingTargetHours,
    femaleCycleLength,
    femaleDaysInPhase,
    femaleNextPeriodDate,
    femalePhase,
    isFemaleInCycle,
    moduleNames,
    nutritionStreakDays,
    nutritionWeeklyData,
    programSessionsDone,
    progressStrings.cards,
    simpleTargets.calories,
    stepGoal,
    totalHydro,
    totalSteps,
    totals.calories,
    totals.protein,
    volumeUnit,
    waterGoal,
    weeklyWorkout.sessions,
  ]);

  const sortedReadinessHistory = useMemo(() => sortHistory(readinessHistory), [readinessHistory]);
  const visibleReadinessHistory = useMemo(
    () => sortedReadinessHistory.slice(-rangeDays),
    [rangeDays, sortedReadinessHistory],
  );
  const previousReadinessHistory = useMemo(
    () => sortedReadinessHistory.slice(-rangeDays * 2, -rangeDays),
    [rangeDays, sortedReadinessHistory],
  );
  const chartData = useMemo(
    () =>
      visibleReadinessHistory.map((row) => ({
        label: formatHistoryLabel(row.date, range),
        value: Number(row.total_score ?? 0),
      })),
    [range, visibleReadinessHistory],
  );

  const averageScoreValue = useMemo(() => averageRows(visibleReadinessHistory), [visibleReadinessHistory]);
  const previousAverageScore = useMemo(() => averageRows(previousReadinessHistory), [previousReadinessHistory]);
  const averageDelta = averageScoreValue !== null && previousAverageScore !== null
    ? averageScoreValue - previousAverageScore
    : null;
  const bestScore = visibleReadinessHistory.length
    ? Math.max(...visibleReadinessHistory.map((row) => Number(row.total_score ?? 0)))
    : null;
  const latestHistoryScore = visibleReadinessHistory[visibleReadinessHistory.length - 1]?.total_score ?? null;
  const latestScore = Math.round(
    Number(
      dailyScore?.score ??
      latestHistoryScore ??
      0,
    ),
  );
  const buildPhase = visibleReadinessHistory.length < 7;
  const buildProgressPct = Math.min(100, (visibleReadinessHistory.length / 7) * 100);
  const heroScoreColor = buildPhase ? Colors.warning : scoreColor(latestScore);
  const heroScoreLabel = buildPhase
    ? 'Construyendo tu primera lectura'
    : latestScore > 0
      ? scoreLabel(latestScore)
      : 'Todavia no hay lectura suficiente';
  const heroRingValue = buildPhase ? buildProgressPct : latestScore;
  const heroRingText = buildPhase
    ? `${visibleReadinessHistory.length}/7`
    : latestScore > 0
      ? String(latestScore)
      : '--';
  const heroSummaryTitle = buildPhase
    ? `Registra ${Math.max(0, 7 - visibleReadinessHistory.length)} día${7 - visibleReadinessHistory.length === 1 ? '' : 's'} más para desbloquear tu primer VYRA Score`
    : heroScoreLabel;

  const factorCards = useMemo(
    () => buildFactorCards(visibleReadinessHistory, dailyScore?.breakdown ?? null, activeModules),
    [activeModules, dailyScore?.breakdown, visibleReadinessHistory],
  );
  const strongestFactor = [...factorCards].sort((a, b) => b.value - a.value)[0] ?? null;
  const weakestFactor = [...factorCards].sort((a, b) => a.value - b.value)[0] ?? null;

  const heroNarrative = useMemo(() => {
    if (buildPhase) {
      return `Llevas ${visibleReadinessHistory.length}/7 dias con datos. Cuando cierres 7 dias, aparece tu primer VYRA Score.`;
    }
    if (focusActions[0]) {
      const base = similarDayComparison?.message ?? morningNarrative ?? 'La mejor mejora sigue siendo la mas simple.';
      return `${focusActions[0].title}. ${base}`;
    }
    if (crossModuleInsights[0]) return crossModuleInsights[0];
    if (similarDayComparison?.message) return similarDayComparison.message;
    if (morningNarrative) return morningNarrative;
    return 'Cuando registres algunos dias mas, esta pantalla te va a devolver contexto real y no solo datos sueltos.';
  }, [buildPhase, crossModuleInsights, focusActions, morningNarrative, similarDayComparison?.message, visibleReadinessHistory.length]);

  const coachTitle = buildPhase
    ? 'Tu lectura todavia se esta armando'
    : focusActions[0]
      ? 'La siguiente mejor accion'
      : crossModuleInsights[0]
        ? 'Lo que esta semana ya se esta repitiendo'
        : 'Tu lectura todavia se esta armando';
  const coachBody = buildPhase
    ? `Faltan ${Math.max(0, 7 - visibleReadinessHistory.length)} dias para abrir tu primer score.`
    : focusActions[0]
      ? `${focusActions[0].title}. ${weakestFactor ? `${weakestFactor.label} sigue siendo la palanca mas floja de la ventana.` : ''}`.trim()
      : crossModuleInsights[0] ?? similarDayComparison?.message ?? 'Sigue registrando unos dias mas para sacar una senal fuerte.';
  const insightsRoute = buildPhase ? Routes.tabs.home : Routes.progress.insights;
  const coachRoute = focusActions[0]?.route ?? insightsRoute;
  const coachAccent = weakestFactor?.color ?? Colors.brand;

  const goalCopy = useMemo(
    () =>
      buildGoalCopy({
        goal: profile?.primary_goal ?? profile?.goal,
        consumedCalories: Math.round(totals.calories),
        targetCalories: Math.round(simpleTargets.calories),
        activityCalories,
        nutritionStreakDays,
        progressStrings,
      }),
    [
      activityCalories,
      nutritionStreakDays,
      profile?.goal,
      profile?.primary_goal,
      progressStrings,
      simpleTargets.calories,
      totals.calories,
    ],
  );

  const weightCopy = useMemo(
    () =>
      buildWeightCopy({
        goal: profile?.primary_goal ?? profile?.goal,
        current: stats.current,
        target: profile?.weight_goal_kg ?? null,
        weeklyDelta: stats.weeklyDelta,
        weightUnit,
        progressStrings,
      }),
    [
      profile?.goal,
      profile?.primary_goal,
      profile?.weight_goal_kg,
      progressStrings,
      stats.current,
      stats.weeklyDelta,
      weightUnit,
    ],
  );

  const currentProgramLabel = activeProgram
    ? progressStrings.muscle.programProgress
        .replace('{{name}}', activeProgram.name)
        .replace('{{done}}', String(programSessionsDone))
        .replace('{{total}}', String(Math.max(1, activeProgram.days_per_week * activeProgram.duration_weeks)))
    : history[0]
      ? progressStrings.muscle.lastWorkout.replace('{{name}}', getWorkoutDisplayName(history[0].name))
      : progressStrings.muscle.noProgram;
  const needsNutritionKickoff = totals.calories <= 0;
  const needsWeightKickoff = stats.current === null;
  const muscleMapHeight = layout.isTablet ? 320 : 228;
  const stackActionRows = layout.containerWidth < 360;
  const compactModuleCards = layout.containerWidth < 390;

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
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
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{progressStrings.title}</Text>
            <Text style={styles.subtitle}>{progressStrings.subtitle}</Text>
          </View>
          <Pressable
            style={styles.exportButton}
            onPress={() => router.push(Routes.profile.exportData as never)}
            accessibilityRole="button"
            accessibilityLabel={progressStrings.exportAccessibility}
          >
            <Ionicons name="download-outline" size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <SegmentedControl
          value={range}
          options={RANGE_OPTIONS}
          onChange={setRange}
          accessibilityLabel="Cambiar ventana de progreso"
        />

        <Card variant="hero" accentColor={heroScoreColor} decorative elevated style={styles.heroCard}>
          <View style={[styles.heroTop, layout.isTablet && styles.heroTopWide]}>
            <View style={styles.ringColumn}>
              <ProgressCircle
                value={heroRingValue}
                size={layout.isTablet ? 156 : 130}
                strokeWidth={10}
                color={heroScoreColor}
                trackColor={withOpacity(Colors.white, 0.08)}
                accessibilityLabel={buildPhase ? `Progreso de lectura ${heroRingText}` : `Vyra score ${latestScore} sobre 100`}
              >
                <View style={styles.ringContent}>
                  <Text style={styles.ringEyebrow}>Vyra score</Text>
                  <Text style={styles.ringValue}>{heroRingText}</Text>
                  <Text style={[styles.ringLabel, { color: heroScoreColor }]}>{heroScoreLabel}</Text>
                </View>
              </ProgressCircle>

              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color={Colors.premium} />
                <Text style={styles.streakBadgeText}>
                  {streak > 0
                    ? `${streak} dias activos${qualityScoreStreak > 0 ? ` · ${qualityScoreStreak} fuertes` : ''}`
                    : 'Empieza a construir continuidad'}
                </Text>
              </View>
            </View>

            <View style={styles.heroSummary}>
              <Text style={styles.heroWindowLabel}>Lectura de {formatRangeWindow(range)}</Text>
              <Text style={styles.heroSummaryTitle}>{heroSummaryTitle}</Text>
              <Text style={styles.heroSummaryBody}>{heroNarrative}</Text>

              <View style={styles.statGrid}>
                <StatPill label="Promedio" value={averageScoreValue !== null ? String(averageScoreValue) : '--'} toneColor={Colors.premium} />
                <StatPill label="Vs. bloque previo" value={formatDelta(averageDelta)} toneColor={getDeltaTone(averageDelta)} />
                <StatPill label="Proyeccion hoy" value={predictedScore !== null ? String(predictedScore) : '--'} toneColor={Colors.info} />
                <StatPill label="Módulos tocados" value={`${completedToday.size}/${Math.max(activeModules.length, 1)}`} toneColor={Colors.textPrimary} />
              </View>
            </View>
          </View>

          <View style={styles.heroChartWrap}>
            {chartData.length ? (
              <VyraBalanceTrendChart
                data={chartData}
                average={averageScoreValue}
                best={bestScore}
                caption={range === '7d' ? 'ventana semanal' : `ventana ${range}`}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartTitle}>Todavia no hay curva suficiente</Text>
                <Text style={styles.emptyChartBody}>
                  En cuanto cierres algunos dias con registros, aqui veras la tendencia del score sin tener que abrir otro modulo.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.weekRow}>
            {weekDots.map((dot) => (
              <View
                key={dot.key}
                style={[
                  styles.weekDot,
                  dot.done && styles.weekDotDone,
                  dot.isToday && styles.weekDotToday,
                ]}
              />
            ))}
          </View>

          <View style={[styles.heroActions, stackActionRows && styles.actionColumn]}>
            <Button
              onPress={() => router.push(insightsRoute as never)}
              color={Colors.warning}
              style={stackActionRows ? undefined : styles.flexButton}
              fullWidth={stackActionRows}
              size="sm"
            >
              Leer insights
            </Button>
            <Button
              onPress={() => router.push(Routes.progress.history as never)}
              variant="secondary"
              color={Colors.warning}
              style={stackActionRows ? undefined : styles.flexButton}
              fullWidth={stackActionRows}
              size="sm"
            >
              Ver historial
            </Button>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lo que sostiene tu score</Text>
          <Text style={styles.sectionHint}>Cada fila mezcla estado actual, cambio dentro de la ventana y a donde te conviene entrar.</Text>
        </View>

        <Card style={styles.factorCard}>
          <View style={styles.factorHeaderRow}>
            <Text style={styles.factorHeaderTitle}>Desglose real</Text>
            <Text style={styles.factorHeaderHint}>
              {strongestFactor && weakestFactor
                ? `${strongestFactor.label} empuja. ${weakestFactor.label} sigue pidiendo atencion.`
                : 'Aun estamos reuniendo suficiente historial para ordenar mejor las palancas.'}
            </Text>
          </View>

          <View style={styles.factorList}>
            {factorCards.map((factor) => (
              <Pressable
                key={factor.key}
                style={styles.factorRow}
                onPress={() => router.push(factor.route as never)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${factor.label}`}
                accessibilityHint={`Muestra el detalle del modulo ${factor.label}.`}
              >
                <View style={styles.factorTopRow}>
                  <View style={styles.factorTitleRow}>
                    <View style={[styles.factorDot, { backgroundColor: factor.color }]} />
                    <Text style={styles.factorLabel}>{factor.label}</Text>
                  </View>
                  <View style={styles.factorValueWrap}>
                    <Ionicons name={getTrendArrow(factor.delta)} size={13} color={getDeltaTone(factor.delta)} />
                    <Text style={[styles.factorValue, { color: factor.color }]}>{clampPercent(factor.value)}%</Text>
                  </View>
                </View>

                <ProgressBar color={factor.color} progress={factor.value} />

                <View style={styles.factorMetaRow}>
                  <Text style={styles.factorMeta}>
                    {factor.delta === null
                      ? 'Aun no hay comparacion suficiente'
                      : `${factor.delta > 0 ? 'Sube' : factor.delta < 0 ? 'Baja' : 'Se mantiene'} ${Math.abs(factor.delta)} pts en la ventana`}
                  </Text>
                  <MiniSparkline values={factor.series} color={factor.color} width={88} height={24} />
                </View>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card variant="insight" accentColor={coachAccent} style={styles.coachCard}>
          <View style={styles.coachTop}>
            <View style={[styles.coachIconWrap, { backgroundColor: withOpacity(coachAccent, 0.16) }]}>
              <Ionicons name="sparkles" size={18} color={coachAccent} />
            </View>
            <View style={styles.coachCopy}>
              <Text style={styles.coachEyebrow}>Coach inteligente</Text>
              <Text style={styles.coachTitle}>{coachTitle}</Text>
              <Text style={styles.coachBody}>{coachBody}</Text>
            </View>
          </View>
          <View style={[styles.coachActions, stackActionRows && styles.actionColumn]}>
            <Button
              onPress={() => router.push(coachRoute as never)}
              color={coachAccent}
              style={stackActionRows ? undefined : styles.flexButton}
              fullWidth={stackActionRows}
              size="sm"
            >
              Abrir accion sugerida
            </Button>
            <Button
              onPress={() => router.push(insightsRoute as never)}
              variant="ghost"
              color={Colors.textSecondary}
              style={stackActionRows ? undefined : styles.flexButton}
              fullWidth={stackActionRows}
              size="sm"
            >
              Ver lectura extendida
            </Button>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{progressStrings.sections.chosenModules}</Text>
          <Text style={styles.sectionHint}>{progressStrings.sections.chosenModulesHint}</Text>
        </View>

        <View style={styles.moduleGrid}>
          {moduleCards.map((card) => (
            <Card
              key={card.id}
              onPress={() => router.push(card.route as never)}
              style={[styles.moduleCard, compactModuleCards && styles.moduleCardCompact]}
              accessibilityLabel={`Abrir ${card.title}`}
              accessibilityHint={card.note}
            >
              <View style={styles.moduleTop}>
                <View style={styles.moduleCopy}>
                  <Text style={[styles.moduleLabel, { color: card.color }]}>{card.title}</Text>
                  <Text style={styles.moduleValue}>{card.value}</Text>
                  <Text style={styles.moduleMeta}>{card.meta}</Text>
                </View>
                <View style={[styles.modulePercentBadge, { borderColor: withOpacity(card.color, 0.22) }]}>
                  <Text style={[styles.modulePercentText, { color: card.color }]}>{clampPercent(card.progress)}%</Text>
                </View>
              </View>
              <ProgressBar color={card.color} progress={card.progress} />
              <Text style={styles.moduleNote}>{card.note}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{progressStrings.sections.trainedMuscles}</Text>
          <Text style={styles.sectionHint}>{progressStrings.sections.trainedMusclesHint}</Text>
        </View>

        <Card style={styles.muscleCard}>
          <MuscleSilhouette
            musclesWorked={recentWorkoutMuscles}
            sex={profile?.biological_sex ?? profile?.gender ?? 'male'}
            height={muscleMapHeight}
          />
          {!recentWorkoutMuscles.length ? <Text style={styles.emptyText}>{progressStrings.muscle.empty}</Text> : null}
          <Text style={styles.programNote}>{currentProgramLabel}</Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{ProgressPageStrings.sectionEnergy}</Text>
          <Text style={styles.sectionHint}>{ProgressPageStrings.sectionEnergyHint}</Text>
        </View>

        <View style={styles.energyGrid}>
          <Card style={styles.energyCard}>
            <Text style={styles.energyEyebrow}>{ProgressPageStrings.caloriesEyebrow}</Text>
            <Text style={styles.energyTitle}>{goalCopy.title}</Text>
            <Text style={styles.energyBody}>{goalCopy.body}</Text>
            <Text style={styles.energyNote}>{goalCopy.note}</Text>
            {needsNutritionKickoff ? (
              <Button
                onPress={() =>
                  router.push({
                    pathname: Routes.nutrition.log,
                    params: { mealType: 'breakfast' },
                  } as never)
                }
                variant="secondary"
                color={Colors.nutrition}
                fullWidth
                size="sm"
              >
                Registrar primera comida
              </Button>
            ) : null}
          </Card>

          <Card style={styles.energyCard}>
            <Text style={styles.energyEyebrow}>{ProgressPageStrings.weightEyebrow}</Text>
            <Text style={styles.energyTitle}>{weightCopy.title}</Text>
            <Text style={styles.energyBody}>{weightCopy.body}</Text>
            <Text style={styles.energyNote}>{weightCopy.note}</Text>
            {needsWeightKickoff ? (
              <Button
                onPress={() => router.push(Routes.settings.account as never)}
                variant="secondary"
                color={Colors.textPrimary}
                fullWidth
                size="sm"
              >
                Registrar peso actual
              </Button>
            ) : null}
          </Card>
        </View>

        <View style={[styles.footerActions, stackActionRows && styles.actionColumn]}>
          <Button
            onPress={() => router.push(Routes.workout.programs as never)}
            color={Colors.workout}
            style={stackActionRows ? undefined : styles.flexButton}
            fullWidth={stackActionRows}
          >
            {ProgressPageStrings.viewPrograms}
          </Button>
          <Button
            onPress={() => router.push(Routes.tabs.home as never)}
            variant="secondary"
            color={Colors.textPrimary}
            style={stackActionRows ? undefined : styles.flexButton}
            fullWidth={stackActionRows}
          >
            {ProgressPageStrings.backHome}
          </Button>
        </View>

        <ScreenFooterSpacer />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: Spacing[2],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2.5xl'],
    lineHeight: TextLeading['2.5xl'],
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: TextLeading.md,
    color: Colors.textSecondary,
  },
  exportButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.surface3, 0.92),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  heroCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  heroTop: {
    gap: Spacing[4],
  },
  heroTopWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringColumn: {
    gap: Spacing[2],
    alignItems: 'center',
  },
  ringContent: {
    alignItems: 'center',
    gap: 2,
  },
  ringEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  ringValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    lineHeight: TextLeading['3xl'],
    color: Colors.textPrimary,
  },
  ringLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.premium, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.premium, 0.24),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
  },
  streakBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  heroSummary: {
    flex: 1,
    gap: Spacing[2],
  },
  heroWindowLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  heroSummaryTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['lg+'],
    lineHeight: TextLeading['lg+'],
    color: Colors.textPrimary,
  },
  heroSummaryBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  statPill: {
    minWidth: '47%',
    minHeight: 92,
    flexGrow: 1,
    gap: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  statPillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statPillValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  heroChartWrap: {
    borderRadius: Radius.xl,
    backgroundColor: withOpacity(Colors.white, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    padding: Spacing[3],
  },
  emptyChart: {
    gap: Spacing[2],
    paddingVertical: Spacing[3],
  },
  emptyChartTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptyChartBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  weekDot: {
    flex: 1,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
  },
  weekDotDone: {
    backgroundColor: withOpacity(Colors.premium, 0.88),
  },
  weekDotToday: {
    borderWidth: 1,
    borderColor: Colors.white,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  actionColumn: {
    flexDirection: 'column',
  },
  flexButton: {
    flex: 1,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['lg+'],
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  factorCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  factorHeaderRow: {
    gap: 4,
  },
  factorHeaderTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  factorHeaderHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  factorList: {
    gap: Spacing[2.5],
  },
  factorRow: {
    gap: Spacing[2],
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.white, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.05),
    padding: Spacing[3],
  },
  factorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  factorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  factorDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  factorLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  factorValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  factorValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
  },
  factorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  factorMeta: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: TextLeading.xs,
    color: Colors.textSecondary,
  },
  coachCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  coachTop: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  coachIconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachCopy: {
    flex: 1,
    gap: 4,
  },
  coachEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  coachTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  coachBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  coachActions: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  moduleCard: {
    width: '48%',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  moduleCardCompact: {
    width: '100%',
  },
  moduleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  moduleCopy: {
    flex: 1,
    gap: 4,
  },
  moduleLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moduleValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
    lineHeight: TextLeading.base,
    color: Colors.textPrimary,
  },
  moduleMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  modulePercentBadge: {
    minWidth: 58,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
    alignItems: 'center',
  },
  modulePercentText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  moduleNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: TextLeading.xs,
    color: Colors.textSecondary,
  },
  muscleCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  programNote: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  energyGrid: {
    gap: Spacing[3],
  },
  energyCard: {
    gap: Spacing[1.5],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  energyEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  energyTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    lineHeight: TextLeading.xl,
    color: Colors.textPrimary,
  },
  energyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  energyNote: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  footerActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
});
