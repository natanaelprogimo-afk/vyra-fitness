import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomSheet from '@/components/ui/BottomSheet';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CycleDisc from '@/components/female/CycleDisc';
import MacroRings, { buildMacroRingItems } from '@/components/nutrition/MacroRings';
import SleepTimeline from '@/components/sleep/SleepTimeline';
import GlowRing from '@/components/ui/GlowRing';
import PulseOrb from '@/components/ui/PulseOrb';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { MODULES } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFasting } from '@/hooks/useFasting';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useNutrition } from '@/hooks/useNutrition';
import { useReadiness } from '@/hooks/useReadiness';
import { useSleep } from '@/hooks/useSleep';
import { useSteps } from '@/hooks/useSteps';
import { useWater } from '@/hooks/useWater';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';
import { getActiveModules } from '@/lib/active-modules';
import {
  buildEngagementWeekDots,
  calculateEngagementStreak,
  createActiveDateSet,
} from '@/lib/engagement-streak';
import { loadRecentNotificationActivity } from '@/lib/notification-activity';
import { syncHomeWidgetSnapshot } from '@/lib/widget-sync';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { getWorkoutPlanSnapshot } from '@/lib/workout-plan';
import { visibleProgressPercent } from '@/lib/visual-progress';
import { useEngagementStreak } from '@/hooks/useEngagementStreak';
import { formatVolume, formatWeight } from '@/utils/formatters';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

type HeroModule =
  | 'fasting'
  | 'workout'
  | 'workout-rest'
  | 'female'
  | 'nutrition'
  | 'steps'
  | 'sleep'
  | 'default';

type QuickMetric = {
  key: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  meta: string;
  color: string;
  progressPct?: number;
  onPress: () => void;
};

type QuickAction = {
  key: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  stamp: string | null;
};

function getFirstName(rawName: string | null | undefined) {
  const token = rawName?.trim().split(/\s+/)[0] ?? 'Usuario';
  return token || 'Usuario';
}

function todayKey(offset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatDaysAgo(dayIso: string | null) {
  if (!dayIso) return null;
  const start = new Date(`${dayIso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - start.getTime()) / 86400000);
}

function formatSleepHours(hours: number) {
  if (!hours) return 'Sin datos';
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${wholeHours}h`;
  return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
}

function formatHeroCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function suggestMealType() {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

function formatNotificationStamp(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('es-UY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function pickString(source: Record<string, unknown>, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}

function getHeroModule(
  modules: string[],
  state: {
    fastingActive: boolean;
    workoutScheduledToday: boolean;
    workoutModuleEnabled: boolean;
    cyclePhase: string | null;
  },
): HeroModule {
  if (modules.includes('fasting') && state.fastingActive) return 'fasting';
  if (state.workoutModuleEnabled && state.workoutScheduledToday) return 'workout';
  if (state.workoutModuleEnabled && !state.workoutScheduledToday) return 'workout-rest';
  if (modules.includes('female') && state.cyclePhase) return 'female';
  if (modules.includes('nutrition')) return 'nutrition';
  if (modules.includes('steps')) return 'steps';
  if (modules.includes('sleep') && modules.length === 1) return 'sleep';
  return 'default';
}

function getModuleIcon(module: HeroModule): ComponentProps<typeof Ionicons>['name'] {
  switch (module) {
    case 'fasting':
      return 'timer-outline';
    case 'female':
      return 'flower-outline';
    case 'nutrition':
      return 'restaurant-outline';
    case 'steps':
      return 'footsteps-outline';
    case 'sleep':
      return 'moon-outline';
    case 'workout':
    case 'workout-rest':
    default:
      return 'barbell-outline';
  }
}

function getModuleColor(module: HeroModule) {
  switch (module) {
    case 'fasting':
      return Colors.fasting;
    case 'female':
      return Colors.female;
    case 'nutrition':
      return Colors.nutrition;
    case 'steps':
      return Colors.steps;
    case 'sleep':
      return Colors.sleep;
    case 'workout':
    case 'workout-rest':
    default:
      return Colors.workout;
  }
}

function QuickMetricCard({ metric }: { metric: QuickMetric }) {
  return (
    <Pressable
      style={styles.metricCard}
      onPress={metric.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${metric.label}: ${metric.value}`}
      accessibilityHint={metric.meta}
    >
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconWrap, { backgroundColor: withOpacity(metric.color, 0.12) }]}>
          <Ionicons name={metric.icon} size={18} color={metric.color} />
        </View>
        <Text style={styles.metricLabel}>{metric.label}</Text>
      </View>
      <Text style={styles.metricValue}>{metric.value}</Text>
      {typeof metric.progressPct === 'number' ? (
        <View style={styles.metricTrack}>
          <View
            style={[
              styles.metricFill,
              {
                width: `${visibleProgressPercent(metric.progressPct)}%`,
                backgroundColor: metric.color,
              },
            ]}
          />
        </View>
      ) : null}
      <Text style={styles.metricMeta}>{metric.meta}</Text>
    </Pressable>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Pressable
      style={styles.quickActionCard}
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      accessibilityHint="Abre este atajo rapido."
    >
      <View style={[styles.quickActionIcon, { backgroundColor: withOpacity(action.color, 0.12) }]}>
        <Ionicons name={action.icon} size={18} color={action.color} />
      </View>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
    </Pressable>
  );
}

function SecondaryModulePill({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.secondaryPill, { borderColor: withOpacity(color, 0.35) }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre este modulo secundario."
    >
      <View style={[styles.secondaryPillDot, { backgroundColor: color }]} />
      <Text style={styles.secondaryPillLabel}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const volumeUnit = useSettingsStore((state) => state.volumeUnit);
  const weightUnit = useSettingsStore((state) => state.weightUnit);
  const name = getFirstName(profile?.name);
  const activeModules = getActiveModules(profile);
  const { activeDates: engagementDates } = useEngagementStreak(60);
  const {
    dailyScore,
    refresh,
    refreshing,
    focusActions,
    weeklyAverage,
    qualityScoreStreak,
  } = useReadiness();
  const { totalHydro, goal: waterGoal, progressPct: waterPct } = useWater();
  const { lastDurationHours, lastSleep, lastScore, goalHours, qualityInfo } = useSleep();
  const { logs: weightLogs, stats } = useWeight();
  const { totalSteps, goal: stepGoal, progressPct: stepProgress, calories, weeklyData: stepWeeklyData } = useSteps();
  const { totals, simpleTargets, weeklyData: nutritionWeeklyData } = useNutrition();
  const {
    isActive: fastingActive,
    elapsedSeconds,
    remainingMs,
    progressPct: fastingPct,
    protocol,
    completeFast,
    currentPhase: fastingPhase,
    cycleAwareNotice,
  } = useFasting();
  const { currentPhase, daysInPhase, phaseGuidance, isInCycle } = useFemaleHealth();
  const {
    activeSession,
    history,
    routines,
    exercises,
    getActiveProgram,
    getRecommendedRoutine,
    getSessionDetail,
  } = useWorkout();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const loadNotifications = async () => {
      if (!profile?.id) {
        if (alive) setNotifications([]);
        return;
      }

      try {
        const data = await loadRecentNotificationActivity(profile.id, 3);
        if (!alive) return;

        const next = (Array.isArray(data) ? data : []).map((row, index) => {
          const record = row as Record<string, unknown>;
          return {
            id: String(record.id ?? index),
            title: pickString(record, ['title', 'notification_title', 'type'], 'Notificación Vyra'),
            body: pickString(
              record,
              ['body', 'notification_body', 'copy', 'message'],
              'Actividad reciente disponible.',
            ),
            stamp:
              (typeof record.scheduled_for === 'string' ? record.scheduled_for : null) ??
              (typeof record.created_at === 'string' ? record.created_at : null),
          } satisfies NotificationRow;
        });

        setNotifications(next);
      } catch {
        if (alive) setNotifications([]);
      }
    };

    void loadNotifications();
    return () => {
      alive = false;
    };
  }, [profile?.id]);

  useEffect(() => {
    let alive = true;

    const loadProactive = async () => {
      if (!session?.access_token || !BACKEND_URL) {
        if (alive) setProactiveMessage(null);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/ai/context-proactive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        });

        if (!res.ok) return;
        const payload = (await res.json()) as { message?: string | null };
        if (alive) {
          setProactiveMessage(typeof payload.message === 'string' && payload.message.trim() ? payload.message.trim() : null);
        }
      } catch {
        if (alive) setProactiveMessage(null);
      }
    };

    void loadProactive();
    return () => {
      alive = false;
    };
  }, [session?.access_token, dailyScore?.date]);

  const activeProgram = useMemo(() => getActiveProgram(), [getActiveProgram]);
  const recommendedRoutine = useMemo(() => getRecommendedRoutine().routine, [getRecommendedRoutine]);
  const workoutPlan = useMemo(
    () =>
      getWorkoutPlanSnapshot({
        routines,
        history,
        activeProgram,
        fallbackRoutine: recommendedRoutine,
      }),
    [activeProgram, history, recommendedRoutine, routines],
  );

  const currentRoutine = workoutPlan.todayRoutine ?? workoutPlan.nextRoutine ?? recommendedRoutine;
  const workoutScheduledToday = Boolean(activeSession) || Boolean(workoutPlan.todayRoutine);
  const activeWorkoutExerciseCount = activeSession ? activeSession.exercises.length || activeSession.sets.length : 0;
  const heroModule = getHeroModule(activeModules, {
    fastingActive,
    workoutScheduledToday,
    workoutModuleEnabled: activeModules.includes('workout'),
    cyclePhase: isInCycle ? currentPhase : null,
  });
  const heroColor = getModuleColor(heroModule);
  const heroIcon = getModuleIcon(heroModule);

  const workoutHistoryDays = useMemo(() => history.map((item) => item.started_at.slice(0, 10)), [history]);
  const liveEngagementDates = useMemo(
    () =>
      createActiveDateSet([
        workoutHistoryDays,
        stepWeeklyData.filter((row) => Number(row.steps ?? 0) > 0).map((row) => row.logged_date),
        nutritionWeeklyData.filter((row) => Number(row.calories ?? 0) > 0).map((row) => row.date),
        lastSleep?.end_time ? [lastSleep.end_time.slice(0, 10)] : [],
        totalHydro > 0 ? [todayKey()] : [],
      ]),
    [lastSleep?.end_time, nutritionWeeklyData, stepWeeklyData, totalHydro, workoutHistoryDays],
  );
  const activeStreakDates = useMemo(
    () => createActiveDateSet([engagementDates, liveEngagementDates]),
    [engagementDates, liveEngagementDates],
  );
  const streak = useMemo(() => calculateEngagementStreak(activeStreakDates), [activeStreakDates]);
  const weekDots = useMemo(() => buildEngagementWeekDots(activeStreakDates), [activeStreakDates]);
  const completedWeekCount = weekDots.filter((item) => item.done).length;

  const lastCompletionDaysAgo = useMemo(() => {
    const recentDates = [...activeStreakDates].sort().reverse();
    return recentDates[0] ? formatDaysAgo(recentDates[0]) : null;
  }, [activeStreakDates]);

  const recentWeightDaysAgo = weightLogs[0]?.logged_at ? formatDaysAgo(weightLogs[0].logged_at.slice(0, 10)) : null;
  const showPauseBanner = (dailyScore?.score ?? 100) < 45 && (lastCompletionDaysAgo ?? 0) >= 2;
  const pauseCtaRoute = focusActions[0]?.route ?? Routes.workout.index;

  const routineMuscles = useMemo(() => {
    if (!currentRoutine) return [] as string[];
    const exerciseMap = new Map(exercises.map((item) => [item.id, item]));
    return [...new Set(
      currentRoutine.exercises
        .map((item) => exerciseMap.get(item.exercise_id)?.muscle_group ?? '')
        .filter(Boolean)
        .map((item) => item.replace(/_/g, ' ')),
    )].slice(0, 4);
  }, [currentRoutine, exercises]);

  const lastSessionPrYesterday = useMemo(() => {
    const lastSession = history[0];
    if (!lastSession) return false;
    const daysAgo = formatDaysAgo(lastSession.started_at.slice(0, 10));
    if (daysAgo !== 1) return false;
    return Boolean(getSessionDetail(lastSession.id)?.sets.some((item) => item.is_pr));
  }, [getSessionDetail, history]);

  const programProgressPct = useMemo(() => {
    if (!activeProgram) return null;
    const totalSessions = Math.max(1, (activeProgram.days_per_week || 4) * (activeProgram.duration_weeks || 4));
    return Math.min(100, Math.round((history.length / totalSessions) * 100));
  }, [activeProgram, history.length]);

  const workoutProgramCopy = useMemo(() => {
    if (activeProgram && programProgressPct !== null) {
      return {
        left: `Semana ${Math.max(1, Math.floor(history.length / Math.max(1, activeProgram.days_per_week || 4)) + 1)} · ${workoutPlan.dayLabel}`,
        right: `${programProgressPct}% del bloque`,
      };
    }

    if (!currentRoutine) {
      return null;
    }

    return {
      left: workoutPlan.todayRoutine ? `${workoutPlan.dayLabel} · rutina del día` : `${workoutPlan.dayLabel} · siguiente sugerencia`,
      right: activeSession ? 'Sesión activa' : `${currentRoutine.exercises.length} ejercicios`,
    };
  }, [
    activeProgram,
    activeSession,
    currentRoutine,
    history.length,
    programProgressPct,
    workoutPlan.dayLabel,
    workoutPlan.todayRoutine,
  ]);

  const quickMetrics = useMemo(() => {
    const items: QuickMetric[] = [];

    if (activeModules.includes('water')) {
      items.push({
        key: 'water',
        icon: 'water-outline',
        label: 'Agua',
        value: `${formatVolume(totalHydro, volumeUnit)} / ${formatVolume(waterGoal, volumeUnit)}`,
        meta: `${Math.round(waterPct)}% de la meta`,
        color: Colors.water,
        progressPct: waterPct,
        onPress: () => router.push(Routes.water.index as never),
      });
    }

    if (activeModules.includes('sleep')) {
      items.push({
        key: 'sleep',
        icon: 'moon-outline',
        label: 'Sueño',
        value: formatSleepHours(lastDurationHours),
        meta: lastDurationHours >= goalHours ? qualityInfo.label : 'Por debajo de la meta',
        color: Colors.sleep,
        progressPct: goalHours > 0 ? (lastDurationHours / goalHours) * 100 : 0,
        onPress: () => router.push(Routes.sleep.index as never),
      });
    }

    if (activeModules.includes('steps')) {
      items.push({
        key: 'steps',
        icon: 'footsteps-outline',
        label: 'Pasos',
        value: `${Math.round(totalSteps).toLocaleString('es-UY')} / ${Math.round(stepGoal).toLocaleString('es-UY')}`,
        meta: `${Math.round(stepProgress)}% · ${Math.round(calories)} kcal`,
        color: Colors.steps,
        progressPct: stepProgress,
        onPress: () => router.push(Routes.steps.index as never),
      });
    }

    if (activeModules.includes('nutrition')) {
      items.push({
        key: 'nutrition',
        icon: 'restaurant-outline',
        label: 'Nutrición',
        value: `${Math.round(totals.calories)} / ${Math.round(simpleTargets.calories)} kcal`,
        meta: `${Math.round(totals.protein)}P · ${Math.round(totals.carbs)}C · ${Math.round(totals.fat)}G`,
        color: Colors.nutrition,
        progressPct: simpleTargets.calories > 0 ? (totals.calories / simpleTargets.calories) * 100 : 0,
        onPress: () => router.push(Routes.nutrition.index as never),
      });
    }

    if ((recentWeightDaysAgo ?? 99) <= 3 && stats.current) {
        items.push({
          key: 'weight',
          icon: 'scale-outline',
          label: 'Peso',
          value: formatWeight(stats.current, weightUnit),
          meta:
            stats.weeklyDelta === null
            ? 'Tendencia aún corta'
            : `${stats.weeklyDelta > 0 ? '+' : ''}${stats.weeklyDelta.toFixed(1)} kg esta semana`,
          color: Colors.textPrimary,
          onPress: () => router.push(Routes.tabs.progress as never),
      });
    }

    return items;
  }, [
    activeModules,
    calories,
    goalHours,
    lastDurationHours,
    qualityInfo.label,
    recentWeightDaysAgo,
    simpleTargets.calories,
    stats.current,
    stats.weeklyDelta,
    stepGoal,
    stepProgress,
    totals.calories,
    totals.carbs,
    totals.fat,
    totals.protein,
    totalHydro,
    totalSteps,
    volumeUnit,
    waterGoal,
    waterPct,
    weightUnit,
  ]);

  const streakCompletedToday = activeStreakDates.has(todayKey());
  const streakTitle = streak > 0 ? `${streak} días en racha` : 'Empieza tu racha hoy';
  const streakBody = streakCompletedToday
    ? 'Hoy ya cuenta. Mantener una acción pequeña sostiene tu continuidad.'
    : 'Te basta con agua, pasos, nutrición o entreno para salvar el día.';

  const widgetAction = useMemo(() => {
    if (activeSession) {
      return {
        label: 'Volver al entreno',
        path: Routes.workout.session.replace(/^\//, ''),
        focus: 'workout',
      };
    }

    switch (heroModule) {
      case 'nutrition':
        return {
          label: 'Registrar comida',
          path: Routes.nutrition.log.replace(/^\//, ''),
          focus: 'nutrition',
        };
      case 'steps':
        return {
          label: 'Seguir caminata',
          path: Routes.steps.index.replace(/^\//, ''),
          focus: 'steps',
        };
      case 'sleep':
        return {
          label: 'Ver descanso',
          path: Routes.sleep.index.replace(/^\//, ''),
          focus: 'sleep',
        };
      case 'fasting':
        return {
          label: 'Abrir ayuno',
          path: Routes.fasting.index.replace(/^\//, ''),
          focus: 'fasting',
        };
      case 'female':
        return {
          label: 'Abrir ciclo',
          path: Routes.female.index.replace(/^\//, ''),
          focus: 'female',
        };
      case 'workout':
      case 'workout-rest':
        return {
          label: activeProgram ? 'Continuar programa' : 'Abrir entreno',
          path: (activeProgram ? Routes.workout.programs : Routes.workout.index).replace(/^\//, ''),
          focus: 'workout',
        };
      default:
        return {
          label: streakCompletedToday ? 'Ver racha' : 'Salvar racha',
          path: (streakCompletedToday ? Routes.tabs.progress : Routes.water.index).replace(/^\//, ''),
          focus: streakCompletedToday ? 'streak' : 'water',
        };
    }
  }, [activeProgram, activeSession, heroModule, streakCompletedToday]);

  useEffect(() => {
    const workoutWeeklySessions = history.filter((entry) => {
      const daysAgo = formatDaysAgo(entry.started_at.slice(0, 10));
      return daysAgo !== null && daysAgo <= 6;
    }).length;

    syncHomeWidgetSnapshot({
      widgetFocus: widgetAction.focus,
      score: dailyScore?.score ?? null,
      weeklyAverage,
      streak,
      qualityStreak: qualityScoreStreak,
      pendingAction: widgetAction.label,
      pendingActionPath: widgetAction.path,
      comparison: `${completedWeekCount}/7 días activos esta semana`,
      phaseName:
        heroModule === 'female'
          ? String(currentPhase)
          : heroModule === 'fasting' && fastingPhase
            ? String(fastingPhase)
            : null,
      phaseTone: (dailyScore?.score ?? 0) >= 75 ? 'push' : (dailyScore?.score ?? 0) < 45 ? 'recovery' : 'neutral',
      phaseContext: streakBody,
      stepsCurrent: Math.round(totalSteps),
      stepsGoal: Math.round(stepGoal),
      waterCurrent: Math.round(totalHydro),
      waterGoal: Math.round(waterGoal),
      workoutWeeklySessions,
      workoutProgramName: activeProgram?.name ?? currentRoutine?.name ?? null,
      workoutStatus: activeSession ? 'session_active' : activeProgram ? 'program_active' : null,
      sleepHours: lastDurationHours || null,
      sleepGoalHours: goalHours || null,
      sleepScore: lastScore ?? null,
      recoveryScore: dailyScore?.score ?? null,
      recoveryStatus: showPauseBanner ? 'low' : 'stable',
      recoveryFocus: focusActions[0]?.title ?? null,
      nutritionCalories: Math.round(totals.calories),
      nutritionGoal: Math.round(simpleTargets.calories),
      nutritionProtein: Math.round(totals.protein),
      nutritionProteinGoal: Math.round(simpleTargets.protein),
      fastingHours: elapsedSeconds > 0 ? Number((elapsedSeconds / 3600).toFixed(1)) : null,
      fastingTargetHours: protocol ? Number(String(protocol).split(':')[0] ?? 0) || null : null,
      fastingPhaseLabel: fastingPhase ? String(fastingPhase) : null,
      weightCurrent: stats.current ?? null,
      weightDelta: stats.weeklyDelta ?? null,
      weightTrend:
        stats.weeklyDelta === null ? null : stats.weeklyDelta > 0 ? 'up' : stats.weeklyDelta < 0 ? 'down' : 'flat',
      weightUnit,
      volumeUnit,
      femalePhase: isInCycle ? currentPhase : null,
      femaleTip: isInCycle ? phaseGuidance.training : null,
      updatedAt: new Date().toISOString(),
    });
  }, [
    activeProgram,
    activeSession,
    completedWeekCount,
    currentPhase,
    currentRoutine?.name,
    dailyScore?.score,
    elapsedSeconds,
    fastingPhase,
    focusActions,
    goalHours,
    heroModule,
    history,
    isInCycle,
    lastDurationHours,
    lastScore,
    phaseGuidance.training,
    protocol,
    qualityScoreStreak,
    showPauseBanner,
    simpleTargets.calories,
    simpleTargets.protein,
    stats.current,
    stats.weeklyDelta,
    stepGoal,
    streak,
    streakBody,
    totalHydro,
    totalSteps,
    totals.calories,
    totals.protein,
    volumeUnit,
    waterGoal,
    weeklyAverage,
    weightUnit,
    widgetAction,
  ]);

  const secondaryModules = useMemo(() => {
    const heroKey = heroModule === 'workout-rest' ? 'workout' : heroModule;
    const moduleMap = new Map(MODULES.map((item) => [item.id, item]));
    const items = activeModules
      .filter((item) => item !== heroKey)
      .map((item) => moduleMap.get(item))
      .filter((item): item is (typeof MODULES)[number] => Boolean(item))
      .slice(0, 5);

    if ((recentWeightDaysAgo ?? 99) <= 3 && stats.current) {
      items.unshift({
        id: 'weight',
        name: 'Peso',
        shortName: 'Peso',
        emoji: '⚖️',
        color: Colors.textPrimary,
        route: Routes.tabs.progress,
        description: 'Lectura reciente de peso',
        tier: 'contextual',
      });
    }

    return items.slice(0, 5);
  }, [activeModules, heroModule, recentWeightDaysAgo, stats.current]);

  const handleWorkout = useMemo(
    () => () => {
      if (activeSession) {
        router.push(Routes.workout.session as never);
        return;
      }

      if (currentRoutine) {
        router.push({
          pathname: Routes.workout.preview,
          params: { routineId: currentRoutine.id, name: getWorkoutDisplayName(currentRoutine.name) },
        } as never);
        return;
      }

      router.push(Routes.workout.index as never);
    },
    [activeSession, currentRoutine],
  );

  const quickActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [];

    if (activeModules.includes('nutrition')) {
      actions.push({
        key: 'nutrition',
        icon: 'restaurant-outline',
        label: 'Registrar comida',
        color: Colors.nutrition,
        onPress: () =>
          router.push({
            pathname: Routes.nutrition.log,
            params: { mealType: suggestMealType() },
          } as never),
      });
    }

    if (activeModules.includes('water')) {
      actions.push({
        key: 'water',
        icon: 'water-outline',
        label: 'Agregar agua',
        color: Colors.water,
        onPress: () => router.push(Routes.water.index as never),
      });
    }

    if (activeModules.includes('workout')) {
      actions.push({
        key: 'workout',
        icon: 'barbell-outline',
        label: activeSession ? 'Volver al entreno' : 'Entrenar ahora',
        color: Colors.workout,
        onPress: handleWorkout,
      });
    }

    if (actions.length < 3 && activeModules.includes('sleep')) {
      actions.push({
        key: 'sleep',
        icon: 'moon-outline',
        label: 'Registrar sueño',
        color: Colors.sleep,
        onPress: () => router.push(Routes.sleep.log as never),
      });
    }

    return actions.slice(0, 3);
  }, [activeModules, activeSession, handleWorkout]);

  const renderHero = () => {
    if (heroModule === 'fasting') {
      const isEatingWindow = remainingMs <= 0;
      return (
        <Card
          style={[styles.heroCard, { borderColor: withOpacity(isEatingWindow ? Colors.success : Colors.fasting, 0.28) }]}
          shadow={false}
          accentColor={isEatingWindow ? Colors.success : Colors.fasting}
        >
          <View style={styles.heroTopBar}>
            <View>
              <Text style={[styles.heroEyebrow, { color: Colors.fasting }]}>Ayuno activo</Text>
              <Text style={styles.heroTitle}>Protocolo {protocol}</Text>
            </View>
            <Ionicons name={heroIcon} size={20} color={withOpacity(Colors.fasting, 0.7)} />
          </View>

          <View style={styles.fastingHeroRow}>
            <GlowRing
              value={fastingPct}
              size={148}
              strokeWidth={12}
              color={isEatingWindow ? Colors.success : Colors.fasting}
              state={isEatingWindow ? 'complete' : 'active'}
              pulse={!isEatingWindow}
            >
              <Text style={[styles.heroTimer, { color: isEatingWindow ? Colors.success : Colors.textPrimary }]}>
                {isEatingWindow ? 'OK' : formatHeroCountdown(remainingMs)}
              </Text>
            </GlowRing>

            <View style={styles.heroCopyBlock}>
              <Text style={[styles.heroPhase, { color: isEatingWindow ? Colors.success : Colors.fasting }]}>
                {isEatingWindow ? 'Ventana de comer abierta' : fastingPhase.label}
              </Text>
              <Text style={styles.heroMeta}>
                {Math.floor(elapsedSeconds / 3600)}h {Math.floor((elapsedSeconds % 3600) / 60)}m acumuladas.
              </Text>
              {cycleAwareNotice ? <Text style={styles.heroHint}>{cycleAwareNotice}</Text> : null}
            </View>
          </View>

          <Button onPress={() => void completeFast()} fullWidth>
            {isEatingWindow ? 'Cerrar ayuno' : 'Completar ayuno'}
          </Button>
        </Card>
      );
    }

    if (heroModule === 'female' && isInCycle) {
      const softerPhase = currentPhase === 'menstrual' || currentPhase === 'luteal';
      return (
        <Card
          style={[styles.heroCard, { borderColor: withOpacity(Colors.female, 0.28) }]}
          shadow={false}
          accentColor={Colors.female}
        >
          <View style={styles.heroTopBar}>
            <View>
              <Text style={[styles.heroEyebrow, { color: Colors.female }]}>Ciclo</Text>
              <Text style={styles.heroTitle}>
                Fase {currentPhase} · Día {daysInPhase + 1}
              </Text>
            </View>
            <Ionicons name={heroIcon} size={20} color={withOpacity(Colors.female, 0.7)} />
          </View>

          <View style={styles.femaleHeroRow}>
            <CycleDisc cycleLength={profile?.female_cycle_length ?? 28} currentDay={daysInPhase} phaseLabel={currentPhase} />
            <View style={styles.heroCopyBlock}>
              <Text style={[styles.heroPhase, { color: softerPhase ? withOpacity(Colors.female, 0.85) : Colors.female }]}>
                {softerPhase ? 'Prioriza recuperación y regularidad' : 'Buen día para entrenar fuerte'}
              </Text>
              <Text style={styles.heroMeta}>{phaseGuidance.training}</Text>
              <Text style={styles.heroHint}>{phaseGuidance.nutrition}</Text>
            </View>
          </View>

          <Button onPress={() => router.push(Routes.female.index as never)} fullWidth>
            Registrar hoy
          </Button>
        </Card>
      );
    }

    if (heroModule === 'nutrition') {
      const caloriePct = simpleTargets.calories > 0 ? (totals.calories / simpleTargets.calories) * 100 : 0;
      return (
        <Card
          style={[styles.heroCard, { borderColor: withOpacity(Colors.nutrition, 0.28) }]}
          shadow={false}
          accentColor={Colors.nutrition}
        >
          <View style={styles.heroTopBar}>
            <View>
              <Text style={[styles.heroEyebrow, { color: Colors.nutrition }]}>Nutrición</Text>
              <Text style={styles.heroTitle}>{Math.round(caloriePct)}% de calorías hoy</Text>
            </View>
            <Ionicons name={heroIcon} size={20} color={withOpacity(Colors.nutrition, 0.7)} />
          </View>

          <Text style={styles.heroMeta}>
            {Math.round(totals.calories)} de {Math.round(simpleTargets.calories)} kcal
          </Text>
          <MacroRings
            items={buildMacroRingItems({
              protein: totals.protein,
              carbs: totals.carbs,
              fat: totals.fat,
              proteinTarget: simpleTargets.protein,
              carbsTarget: simpleTargets.carbs,
              fatTarget: simpleTargets.fat,
            })}
          />

          <Button onPress={() => router.push(Routes.nutrition.log as never)} fullWidth>
            Registrar comida
          </Button>
        </Card>
      );
    }

    if (heroModule === 'steps') {
      return (
        <Card
          style={[styles.heroCard, { borderColor: withOpacity(Colors.steps, 0.28) }]}
          shadow={false}
          accentColor={Colors.steps}
        >
          <View style={styles.heroTopBar}>
            <View>
              <Text style={[styles.heroEyebrow, { color: Colors.steps }]}>Pasos</Text>
              <Text style={styles.heroTitle}>Objetivo de hoy</Text>
            </View>
            <Ionicons name={heroIcon} size={20} color={withOpacity(Colors.steps, 0.7)} />
          </View>

          <View style={styles.stepsHeroRow}>
            <GlowRing value={stepProgress} size={124} strokeWidth={10} color={Colors.steps} state={stepProgress >= 100 ? 'complete' : 'active'}>
              <Text style={styles.stepsHeroValue}>{Math.round(stepProgress)}%</Text>
            </GlowRing>
            <View style={styles.heroCopyBlock}>
              <Text style={styles.heroTitle}>{Math.round(totalSteps).toLocaleString('es-UY')}</Text>
              <Text style={styles.heroMeta}>de {Math.round(stepGoal).toLocaleString('es-UY')} pasos</Text>
              <Text style={styles.heroHint}>{Math.round(calories)} kcal estimadas.</Text>
            </View>
          </View>

          <Button onPress={() => router.push(Routes.steps.index as never)} fullWidth>
            Ver detalles
          </Button>
        </Card>
      );
    }

    if (heroModule === 'sleep') {
      return (
        <Card
          style={[styles.heroCard, { borderColor: withOpacity(Colors.sleep, 0.28) }]}
          shadow={false}
          accentColor={Colors.sleep}
        >
          <View style={styles.heroTopBar}>
            <View>
              <Text style={[styles.heroEyebrow, { color: Colors.sleep }]}>Sueño</Text>
              <Text style={styles.heroTitle}>{formatSleepHours(lastDurationHours)}</Text>
            </View>
            <Ionicons name={heroIcon} size={20} color={withOpacity(Colors.sleep, 0.7)} />
          </View>

          <SleepTimeline
            startTime={lastSleep?.start_time}
            endTime={lastSleep?.end_time}
            durationHours={lastDurationHours}
            color={Colors.sleep}
          />
          <Text style={styles.heroMeta}>
            {lastDurationHours >= goalHours
              ? 'Base sólida para sostener una carga normal hoy.'
              : 'Dormiste menos de lo ideal. Conviene modular intensidad.'}
          </Text>

          <Button onPress={() => router.push(Routes.sleep.index as never)} fullWidth>
            {lastSleep ? 'Ver sueño' : 'Registrar sueño'}
          </Button>
        </Card>
      );
    }

    if (heroModule === 'workout-rest') {
      return (
        <Card
          style={[styles.heroCard, { borderColor: withOpacity(Colors.workout, 0.28) }]}
          shadow={false}
          accentColor={Colors.workout}
        >
          <View style={styles.heroTopBar}>
            <View>
              <Text style={[styles.heroEyebrow, { color: Colors.workout }]}>Hoy · descanso</Text>
              <Text style={styles.heroTitle}>{getWorkoutDisplayName(currentRoutine?.name) || 'Recuperación activa'}</Text>
            </View>
            <Ionicons name={heroIcon} size={20} color={withOpacity(Colors.workout, 0.7)} />
          </View>
          <Text style={styles.heroMeta}>
            Hoy conviene bajar carga. Puedes revisar la siguiente sesión del bloque sin apurarte.
          </Text>
          <Button onPress={() => router.push(Routes.workout.index as never)} variant="secondary" fullWidth>
            Ver mañana
          </Button>
        </Card>
      );
    }

    const workoutCtaLabel = activeSession ? 'Volver al entreno' : 'Entrenar ahora';

    return (
      <Card
        style={[styles.heroCard, { borderColor: withOpacity(Colors.workout, 0.28) }]}
        shadow={false}
        accentColor={Colors.workout}
      >
        <View style={styles.heroTopBar}>
          <View>
            <Text style={[styles.heroEyebrow, { color: Colors.workout }]}>Hoy</Text>
            <Text style={styles.heroTitle}>
              {activeSession
                ? getWorkoutDisplayName(activeSession.name) || 'Sesión en curso'
                : getWorkoutDisplayName(currentRoutine?.name) || 'Entrena hoy'}
            </Text>
          </View>
          <Ionicons name={heroIcon} size={20} color={withOpacity(Colors.workout, 0.7)} />
        </View>

        {lastSessionPrYesterday ? (
          <View style={styles.prBadge}>
            <Text style={styles.prBadgeText}>PR ayer</Text>
          </View>
        ) : null}

        <Text style={styles.heroMeta}>
          {activeSession
            ? `${activeSession.exercises.length || activeSession.sets.length} ejercicios · sesión abierta`
            : currentRoutine
              ? `${currentRoutine.exercises.length} ejercicios · ~${currentRoutine.estimated_duration_min ?? 30} min`
              : 'Todavía no hay una rutina lista para hoy.'}
        </Text>

        {activeSession ? (
          <Button onPress={handleWorkout} fullWidth>
            {workoutCtaLabel}
          </Button>
        ) : null}

        {!activeSession && routineMuscles.length ? (
          <View style={styles.muscleRow}>
            {routineMuscles.map((muscle) => (
              <View key={muscle} style={styles.musclePill}>
                <Text style={styles.musclePillText}>{muscle}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {!activeSession && workoutProgramCopy ? (
          <View style={styles.programRow}>
            <Text style={styles.programLabel}>{workoutProgramCopy.left}</Text>
            <Text style={styles.programLabel}>{workoutProgramCopy.right}</Text>
          </View>
        ) : null}
        {!activeSession && programProgressPct !== null ? (
          <View style={styles.programTrack}>
            <View style={[styles.programFill, { width: `${programProgressPct}%` }]} />
          </View>
        ) : null}

        {!activeSession ? (
          <Button onPress={handleWorkout} fullWidth>
            {workoutCtaLabel}
          </Button>
        ) : null}
      </Card>
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl tintColor={Colors.action} refreshing={refreshing} onRefresh={() => void refresh()} />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
                Hola, {name}
              </Text>
              {streak > 0 ? (
                <Pressable
                  style={styles.streakPill}
                  onPress={() => router.push(Routes.tabs.progress as never)}
                  accessibilityRole="button"
                  accessibilityLabel={`Racha actual: ${streak} dias`}
                  accessibilityHint="Abre progreso para ver tu consistencia."
                >
                  <Ionicons name="flame-outline" size={14} color={Colors.action} />
                  <Text style={styles.streakPillText}>{streak}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() => setShowNotifications(true)}
              accessibilityRole="button"
              accessibilityLabel="Abrir notificaciones recientes"
              accessibilityHint="Muestra el historial corto de actividad y avisos recientes."
            >
              <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
              {notifications.length ? <View style={styles.unreadDot} /> : null}
            </Pressable>
            <Pressable
              style={styles.headerIconButton}
              onPress={() => router.push(Routes.profile.sheet as never)}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
              accessibilityHint="Abre tu cuenta, modulos y ajustes."
            >
              <Ionicons name="person-circle-outline" size={22} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {activeSession ? (
          <Card
            style={styles.activeWorkoutBanner}
            shadow={false}
            accentColor={Colors.workout}
          >
            <View
              style={styles.activeWorkoutBannerTop}
              accessible
              accessibilityLabel={`Sesion activa, ${getWorkoutDisplayName(activeSession.name) || 'Entrenamiento en curso'}, ${activeWorkoutExerciseCount} ejercicios en curso`}
            >
              <View style={styles.activeWorkoutCopy}>
                <Text style={styles.activeWorkoutEyebrow}>Sesion activa</Text>
                <Text style={styles.activeWorkoutTitle}>
                  {getWorkoutDisplayName(activeSession.name) || 'Entrenamiento en curso'}
                </Text>
                <Text style={styles.activeWorkoutMeta}>
                  {activeWorkoutExerciseCount} ejercicios en curso en este dispositivo.
                </Text>
              </View>
              <View style={styles.activeWorkoutIconWrap}>
                <Ionicons name="barbell-outline" size={20} color={Colors.workout} />
              </View>
            </View>
            <Button onPress={handleWorkout} fullWidth size="sm">
              Volver al entreno
            </Button>
          </Card>
        ) : null}

        <Card style={styles.streakCard} shadow={false} accentColor={heroColor}>
          <View style={styles.streakTopRow}>
            <View style={styles.streakCopy}>
              <Text style={styles.streakEyebrow}>Racha</Text>
              <Text style={styles.streakTitle}>{streakTitle}</Text>
              <Text style={styles.streakBody}>{streakBody}</Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: withOpacity(heroColor, 0.14) }]}>
              <Ionicons name="flame-outline" size={20} color={heroColor} />
            </View>
          </View>
          <Button
            onPress={() =>
              router.push((streakCompletedToday ? Routes.tabs.progress : Routes.water.index) as never)
            }
            variant={streakCompletedToday ? 'secondary' : 'primary'}
            fullWidth
            size="sm"
          >
            {streakCompletedToday ? 'Ver racha y progreso' : 'Salvar mi racha ahora'}
          </Button>
        </Card>

        {renderHero()}

        {quickActions.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Acciones rápidas</Text>
            <View style={styles.quickActionRow}>
              {quickActions.map((action) => (
                <QuickActionCard key={action.key} action={action} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Esta semana</Text>
          <View style={styles.weekRow}>
            {weekDots.map((day) => (
              <View
                key={day.key}
                accessible
                accessibilityLabel={
                  day.done
                    ? `${day.dayNumber}: dia completado de esta semana`
                    : day.isToday
                      ? `${day.dayNumber}: hoy aun pendiente`
                      : `${day.dayNumber}: sin completar`
                }
                style={[
                  styles.weekDot,
                  { borderColor: day.done ? heroColor : withOpacity(Colors.white, 0.08) },
                  day.done && { backgroundColor: heroColor },
                  day.isToday && !day.done && { borderColor: heroColor },
                ]}
              >
                {day.isToday && !day.done ? <PulseOrb color={heroColor} size={6} style={styles.weekPulse} /> : null}
                <Text style={[styles.weekDotText, day.done && styles.weekDotTextDone]}>{day.dayNumber}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionHint}>{completedWeekCount} de 7 días esta semana</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lectura rápida</Text>
          {quickMetrics.length > 4 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricScroll}>
              {quickMetrics.map((metric) => (
                <View key={metric.key} style={styles.metricScrollItem}>
                  <QuickMetricCard metric={metric} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.metricGrid}>
              {quickMetrics.map((metric) => (
                <QuickMetricCard key={metric.key} metric={metric} />
              ))}
            </View>
          )}
        </View>

        {showPauseBanner ? (
          <View style={styles.pauseBanner}>
            <Text style={styles.pauseText}>
              Llevas {lastCompletionDaysAgo} días sin registrar. Retoma hoy con algo pequeño.
            </Text>
            <Pressable
              onPress={() => router.push(pauseCtaRoute as never)}
              accessibilityRole="button"
              accessibilityLabel="Retomar ahora"
              accessibilityHint="Abre la accion sugerida para volver a registrar actividad."
            >
              <Text style={styles.pauseLink}>Retomar ahora</Text>
            </Pressable>
          </View>
        ) : null}

        {secondaryModules.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Modulos secundarios</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.secondaryRow}>
              {secondaryModules.map((item) => (
                <SecondaryModulePill
                  key={item.id}
                  label={item.shortName ?? item.name}
                  color={item.color}
                  onPress={() => router.push(item.route as never)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {proactiveMessage ? (
          <Card style={styles.aiCard} shadow={false}>
            <Text style={styles.aiEyebrow}>VYRA sugiere</Text>
            <Text style={styles.aiBody}>{proactiveMessage}</Text>
          </Card>
        ) : null}

        <ScreenFooterSpacer />
      </ScrollView>

      <BottomSheet
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Ultimas notificaciones"
        snapHeight={420}
      >
        <View style={styles.notificationSheet}>
          {notifications.length ? (
            notifications.map((item) => (
              <View key={item.id} style={styles.notificationItem}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationBody}>{item.body}</Text>
                {item.stamp ? <Text style={styles.notificationStamp}>{formatNotificationStamp(item.stamp)}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyNotifications}>Todavía no hay actividad reciente para mostrar aquí.</Text>
          )}

          <Pressable
            style={styles.notificationsLink}
            onPress={() => {
              setShowNotifications(false);
              router.push(Routes.settings.notificationsHistory as never);
            }}
            accessibilityRole="button"
            accessibilityLabel="Ver todas las notificaciones"
            accessibilityHint="Abre el historial completo de notificaciones y su actividad reciente."
          >
            <Text style={styles.notificationsLinkText}>Ver todas</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[6],
    gap: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.actionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.action,
  },
  identityCopy: {
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  streakPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.actionBg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  streakPillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.action,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexShrink: 0,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.error,
  },
  streakCard: {
    gap: Spacing[3],
    borderWidth: 1,
    backgroundColor: Colors.bgSurface,
  },
  streakTopRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  streakCopy: {
    flex: 1,
    gap: 6,
  },
  streakEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  streakTitle: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    color: Colors.textPrimary,
    letterSpacing: -1.2,
  },
  streakBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  streakBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    gap: Spacing[3],
    borderWidth: 1,
  },
  activeWorkoutBanner: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.24),
    backgroundColor: withOpacity(Colors.workout, 0.08),
  },
  activeWorkoutBannerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  activeWorkoutCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  activeWorkoutEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.workout,
  },
  activeWorkoutTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  activeWorkoutMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  activeWorkoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.workout, 0.14),
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  heroEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  heroMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  heroHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  heroCopyBlock: {
    flex: 1,
    gap: Spacing[2],
  },
  heroPhase: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
  },
  heroTimer: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['4xl'],
    letterSpacing: -3,
    lineHeight: FontSize['4xl'],
  },
  fastingHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  femaleHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  stepsHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  stepsHeroValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  prBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.success, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  prBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  musclePill: {
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.workout, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  musclePillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  programLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  programTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  programFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
  },
  section: {
    gap: Spacing[2],
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    color: Colors.textMuted,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  quickActionCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  weekDot: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  weekPulse: {
    position: 'absolute',
  },
  weekDotText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekDotTextDone: {
    color: Colors.white,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  metricScroll: {
    gap: Spacing[3],
    paddingRight: Spacing[5],
  },
  metricScrollItem: {
    width: 214,
  },
  metricCard: {
    width: '48%',
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    padding: Spacing[4],
    gap: Spacing[2],
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  metricTrack: {
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  metricMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  pauseBanner: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.action,
    borderRadius: Radius.lg,
    backgroundColor: Colors.actionBg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  pauseText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pauseLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.action,
  },
  secondaryRow: {
    gap: Spacing[2],
    paddingRight: Spacing[5],
  },
  secondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  secondaryPillDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  secondaryPillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  aiCard: {
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.18),
    backgroundColor: withOpacity(Colors.action, 0.06),
  },
  aiEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    color: Colors.action,
  },
  aiBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  notificationSheet: {
    gap: Spacing[3],
    paddingBottom: Spacing[5],
  },
  notificationItem: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgElevated,
    padding: Spacing[4],
    gap: Spacing[1],
  },
  notificationTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  notificationBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  notificationStamp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  emptyNotifications: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  notificationsLink: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: Colors.actionBg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  notificationsLinkText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.action,
  },
});
