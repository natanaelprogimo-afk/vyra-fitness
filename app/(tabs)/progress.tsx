import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MuscleSilhouette from '@/components/workout/MuscleSilhouette';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { MODULES, type ModuleId } from '@/constants/modules';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkout } from '@/hooks/useWorkout';
import { useNutrition } from '@/hooks/useNutrition';
import { useWater } from '@/hooks/useWater';
import { useSteps } from '@/hooks/useSteps';
import { useSleep } from '@/hooks/useSleep';
import { useWeight } from '@/hooks/useWeight';
import { useEngagementStreak } from '@/hooks/useEngagementStreak';
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

type MuscleCounts = Record<'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs', number>;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getModuleInfo(moduleId: string) {
  return MODULES.find((item) => item.id === moduleId);
}

function normalizeMuscleKey(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes('pecho')) return 'chest';
  if (lower.includes('espalda') || lower.includes('dorsal')) return 'back';
  if (lower.includes('hombro')) return 'shoulders';
  if (
    lower.includes('brazo') ||
    lower.includes('biceps') ||
    lower.includes('triceps') ||
    lower.includes('antebrazo')
  ) {
    return 'arms';
  }
  if (
    lower.includes('pierna') ||
    lower.includes('gluteo') ||
    lower.includes('cuadr') ||
    lower.includes('femoral') ||
    lower.includes('pantorr')
  ) {
    return 'legs';
  }
  if (lower.includes('core') || lower.includes('abd') || lower.includes('oblic')) return 'core';
  return null;
}

function buildMuscleCounts(muscles: string[]): MuscleCounts {
  const counts: MuscleCounts = {
    chest: 0,
    back: 0,
    shoulders: 0,
    arms: 0,
    core: 0,
    legs: 0,
  };

  muscles.forEach((muscle) => {
    const key = normalizeMuscleKey(muscle);
    if (key) counts[key] += 1;
  });

  return counts;
}

function buildGoalCopy(params: {
  goal: string | null | undefined;
  consumedCalories: number;
  targetCalories: number;
  activityCalories: number;
  nutritionStreakDays: number;
}) {
  const { goal, consumedCalories, targetCalories, activityCalories, nutritionStreakDays } = params;
  const remaining = Math.max(0, Math.round(targetCalories - consumedCalories));
  const overTarget = Math.max(0, Math.round(consumedCalories - targetCalories));
  const targetPct = clampPercent((consumedCalories / Math.max(1, targetCalories)) * 100);

  if (goal === 'lose_fat') {
    return {
      title: remaining > 0 ? `${remaining} kcal todavia dentro del plan` : `${overTarget} kcal por encima del plan`,
      body:
        remaining > 0
          ? `Hoy vienes con ${formatCalories(activityCalories)} de actividad y margen limpio para cerrar el dia.`
          : `Te conviene cerrar el dia liviano para no romper el deficit que estas buscando.`,
      note: `Nutricion ${targetPct}% · racha ${nutritionStreakDays} dias`,
    };
  }

  if (goal === 'gain_muscle') {
    return {
      title: remaining > 0 ? `${remaining} kcal para cerrar volumen` : 'Plan calorico cubierto',
      body:
        remaining > 0
          ? `Te faltan calorias utiles para construir mejor y recuperar el entreno.`
          : `Hoy ya cubriste suficiente energia para construir y sostener rendimiento.`,
      note: `Nutricion ${targetPct}% · actividad ${formatCalories(activityCalories)}`,
    };
  }

  if (goal === 'sport_performance' || goal === 'performance') {
    return {
      title: `${targetPct}% del combustible del dia`,
      body: `Actividad ${formatCalories(activityCalories)}. Aqui importa llegar con energia, no solo cumplir numeros.`,
      note: `Objetivo ${formatCalories(targetCalories)} · racha ${nutritionStreakDays} dias`,
    };
  }

  return {
    title: `${targetPct}% del plan diario cubierto`,
    body: `Actividad ${formatCalories(activityCalories)} y ${nutritionStreakDays} dias seguidos registrando comida.`,
    note: `Meta ${formatCalories(targetCalories)}`,
  };
}

function buildWeightCopy(params: {
  goal: string | null | undefined;
  current: number | null;
  target: number | null;
  weeklyDelta: number | null;
  weightUnit: 'kg' | 'lb';
}) {
  const { goal, current, target, weeklyDelta, weightUnit } = params;

  if (current === null) {
    return {
      title: 'Todavia no hay peso reciente',
      body: 'Cuando registres peso real, aqui veras la direccion del cambio y no solo el numero suelto.',
      note: 'Abre progreso y registra una medicion para empezar.',
    };
  }

  const deltaText =
    weeklyDelta === null
      ? 'Sin tendencia semanal todavia'
      : `${weeklyDelta > 0 ? '+' : ''}${formatWeight(Math.abs(weeklyDelta), weightUnit).replace(/^(0 )?/, '')} esta semana`;

  if (target !== null) {
    const difference = Math.round((current - target) * 10) / 10;
    if (goal === 'lose_fat' && difference > 0) {
      return {
        title: `${formatWeight(difference, weightUnit)} para tu objetivo`,
        body: `Peso actual ${formatWeight(current, weightUnit)}. Lo importante ahora es sostener la tendencia, no mirar un dia aislado.`,
        note: deltaText,
      };
    }

    if (goal === 'gain_muscle' && difference < 0) {
      return {
        title: `${formatWeight(Math.abs(difference), weightUnit)} para tu objetivo`,
        body: `Peso actual ${formatWeight(current, weightUnit)}. Un superavit consistente vale mas que una subida rapida sin control.`,
        note: deltaText,
      };
    }
  }

  return {
    title: `Peso actual ${formatWeight(current, weightUnit)}`,
    body: 'La lectura buena no es solo cuanto pesas, sino si la tendencia acompana el objetivo que elegiste.',
    note: deltaText,
  };
}

function buildRescueRoute(activeModules: ModuleId[], completedToday: Set<string>) {
  const priority: ModuleId[] = ['water', 'steps', 'nutrition', 'workout', 'sleep', 'fasting', 'supplements', 'female'];
  const target = priority.find((moduleId) => activeModules.includes(moduleId) && !completedToday.has(moduleId));
  return getModuleInfo(target ?? activeModules[0] ?? 'workout')?.route ?? Routes.tabs.home;
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

export default function ProgressScreen() {
  const profile = useAuthStore((state) => state.profile);
  const hasSeenGuide = useSettingsStore((state) => Boolean(state.moduleIntroSeen.progress));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
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
  const { lastDurationHours, goalHours, qualityInfo, daysWithGoal, getLastNight } = useSleep();
  const { stats } = useWeight();

  const activeProgram = getActiveProgram();
  const weeklyWorkout = getWeeklyStats();
  const lastSleep = getLastNight();
  const today = todayKey();

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
    return set;
  }, [nutritionToday, sleepTracked, stepsToday, waterToday, workoutToday]);

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

  const rescueRoute = useMemo(
    () => buildRescueRoute(activeModules, completedToday),
    [activeModules, completedToday],
  );

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
  const muscleCounts = useMemo(() => buildMuscleCounts(recentWorkoutMuscles), [recentWorkoutMuscles]);
  const topMuscles = useMemo(
    () =>
      Object.entries(muscleCounts)
        .sort((left, right) => right[1] - left[1])
        .filter(([, value]) => value > 0)
        .slice(0, 3),
    [muscleCounts],
  );

  const programSessionsDone = useMemo(() => {
    if (!activeProgram) return 0;
    return history.filter((entry) => activeProgram.routine_ids.includes(entry.routine_id ?? '')).length;
  }, [activeProgram, history]);

  const moduleCards = useMemo<ModuleProgressCard[]>(() => {
    const cards: ModuleProgressCard[] = [];

    activeModules.forEach((moduleId) => {
      const definition = getModuleInfo(moduleId);
      if (!definition) return;

      if (moduleId === 'workout') {
        const targetSessions = activeProgram?.days_per_week ?? 3;
        const programTitle = activeProgram?.name ?? 'Entreno semanal';
        cards.push({
          id: moduleId,
          title: definition.name,
          color: definition.color,
          value: `${weeklyWorkout.sessions}/${targetSessions} sesiones`,
          meta: activeProgram ? programTitle : 'Tu semana de fuerza',
          note:
            weeklyWorkout.sessions > 0
              ? `${formatDuration(Math.max(weeklyWorkout.sessions * 45, 30))} aprox. · ${programSessionsDone} sesiones del programa`
              : 'Empieza una sesion y la racha ya cuenta desde hoy.',
          cta: activeProgram ? 'Continuar programa' : 'Empezar entreno',
          progress: (weeklyWorkout.sessions / Math.max(1, targetSessions)) * 100,
          route: activeProgram ? Routes.workout.programs : Routes.workout.index,
        });
        return;
      }

      if (moduleId === 'nutrition') {
        cards.push({
          id: moduleId,
          title: definition.name,
          color: definition.color,
          value: `${Math.round(totals.calories)} / ${Math.round(simpleTargets.calories)} kcal`,
          meta: `${Math.round(totals.protein)}g proteina · racha ${nutritionStreakDays} dias`,
          note: `${nutritionWeeklyData.filter((row) => Number(row.calories ?? 0) > 0).length}/7 dias registrados esta semana`,
          cta: 'Abrir nutricion',
          progress: (totals.calories / Math.max(1, simpleTargets.calories)) * 100,
          route: Routes.nutrition.index,
        });
        return;
      }

      if (moduleId === 'water') {
        cards.push({
          id: moduleId,
          title: definition.name,
          color: definition.color,
          value: `${formatVolume(totalHydro, volumeUnit)} / ${formatVolume(waterGoal, volumeUnit)}`,
          meta: `Racha ${hydrationStreak.streakDays} dias`,
          note: hydrationStreak.metToday ? 'Ya cumpliste hidratacion hoy.' : 'Un registro mas puede salvar la racha.',
          cta: 'Abrir agua',
          progress: (totalHydro / Math.max(1, waterGoal)) * 100,
          route: Routes.water.index,
        });
        return;
      }

      if (moduleId === 'steps') {
        cards.push({
          id: moduleId,
          title: definition.name,
          color: definition.color,
          value: `${Math.round(totalSteps).toLocaleString('es-UY')} / ${Math.round(stepGoal).toLocaleString('es-UY')}`,
          meta: `${daysMetGoal}/7 dias cerrando meta`,
          note: `${formatDistance(Number(distanceKm) * 1000, distUnit)} caminados hoy`,
          cta: 'Abrir pasos',
          progress: (totalSteps / Math.max(1, stepGoal)) * 100,
          route: Routes.steps.index,
        });
        return;
      }

      if (moduleId === 'sleep') {
        cards.push({
          id: moduleId,
          title: definition.name,
          color: definition.color,
          value: `${lastDurationHours.toFixed(1)}h / ${goalHours.toFixed(1)}h`,
          meta: `${daysWithGoal}/7 noches cerrando meta`,
          note: qualityInfo.label,
          cta: 'Abrir sueno',
          progress: (lastDurationHours / Math.max(1, goalHours)) * 100,
          route: Routes.sleep.index,
        });
        return;
      }

      cards.push({
        id: moduleId,
        title: definition.name,
        color: definition.color,
        value: 'Activo',
        meta: definition.description,
        note: 'Este modulo sigue disponible para tu plan actual.',
        cta: 'Abrir modulo',
        progress: completedToday.has(moduleId) ? 100 : 0,
        route: definition.route,
      });
    });

    return cards;
  }, [
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
    nutritionStreakDays,
    nutritionWeeklyData,
    programSessionsDone,
    qualityInfo.label,
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

  const goalCopy = useMemo(
    () =>
      buildGoalCopy({
        goal: profile?.primary_goal ?? profile?.goal,
        consumedCalories: Math.round(totals.calories),
        targetCalories: Math.round(simpleTargets.calories),
        activityCalories,
        nutritionStreakDays,
      }),
    [activityCalories, nutritionStreakDays, profile?.goal, profile?.primary_goal, simpleTargets.calories, totals.calories],
  );

  const weightCopy = useMemo(
    () =>
      buildWeightCopy({
        goal: profile?.primary_goal ?? profile?.goal,
        current: stats.current,
        target: profile?.weight_goal_kg ?? null,
        weeklyDelta: stats.weeklyDelta,
        weightUnit,
      }),
    [profile?.goal, profile?.primary_goal, profile?.weight_goal_kg, stats.current, stats.weeklyDelta, weightUnit],
  );

  const currentProgramLabel = activeProgram
    ? `${activeProgram.name} · ${programSessionsDone}/${Math.max(1, activeProgram.days_per_week * activeProgram.duration_weeks)} sesiones`
    : history[0]
      ? `Ultimo entreno: ${getWorkoutDisplayName(history[0].name)}`
      : 'Sin programa activo todavia';

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!hasSeenGuide ? (
          <NoticeCard
            title="Como leer Progreso"
            body="Aqui manda la constancia: primero mira la racha, luego tus modulos elegidos y al final que musculos y objetivos se estan moviendo de verdad."
            tone="info"
            actionLabel="Entendido"
            onAction={() => markModuleIntroSeen('progress')}
          />
        ) : null}

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Tu progreso real</Text>
            <Text style={styles.subtitle}>
              Menos ruido, mas direccion. Aqui solo vive lo que te ayuda a sostener el plan.
            </Text>
          </View>
          <Pressable
            style={styles.exportButton}
            onPress={() => router.push(Routes.profile.exportData as never)}
            accessibilityRole="button"
            accessibilityLabel="Exportar tus datos"
          >
            <Ionicons name="share-social-outline" size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <Card accentColor={Colors.brand} decorative style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroNumberWrap}>
              <Text style={styles.heroEyebrow}>Lo mas importante hoy</Text>
              <Text style={styles.heroNumber}>{streak}</Text>
              <Text style={styles.heroLabel}>{streak === 1 ? 'dia de racha' : 'dias de racha'}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="flame" size={14} color={Colors.brand} />
              <Text style={styles.heroBadgeText}>
                {completedToday.size}/{Math.max(1, activeModules.length)} modulos tocados hoy
              </Text>
            </View>
          </View>

          <Text style={styles.heroBody}>
            {completedToday.size > 0
              ? 'Ya moviste el dia. Una accion chica tambien sostiene el progreso grande.'
              : 'Todavia estas a tiempo de salvar hoy con una accion simple y mantener la continuidad viva.'}
          </Text>

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

          <View style={styles.heroActions}>
            <Button
              onPress={() => router.push((completedToday.size > 0 ? Routes.workout.programs : rescueRoute) as never)}
              color={Colors.brand}
              style={styles.flexButton}
            >
              {completedToday.size > 0 ? 'Ver mi progreso de hoy' : 'Salvar mi racha ahora'}
            </Button>
            <Button
              onPress={() => router.push(Routes.settings.modules as never)}
              variant="secondary"
              color={Colors.brand}
              style={styles.flexButton}
            >
              Ajustar modulos
            </Button>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Modulos que elegiste</Text>
          <Text style={styles.sectionHint}>Solo lo que realmente empuja tu objetivo.</Text>
        </View>

        <View style={styles.moduleList}>
          {moduleCards.map((card) => (
            <Card key={card.id} style={styles.moduleCard}>
              <View style={styles.moduleTop}>
                <View style={styles.moduleCopy}>
                  <Text style={[styles.moduleLabel, { color: card.color }]}>{card.title}</Text>
                  <Text style={styles.moduleValue}>{card.value}</Text>
                  <Text style={styles.moduleMeta}>{card.meta}</Text>
                </View>
                <View style={[styles.modulePercentBadge, { borderColor: withOpacity(card.color, 0.25) }]}>
                  <Text style={[styles.modulePercentText, { color: card.color }]}>{clampPercent(card.progress)}%</Text>
                </View>
              </View>
              <ProgressBar color={card.color} progress={card.progress} />
              <Text style={styles.moduleNote}>{card.note}</Text>
              <Button
                onPress={() => router.push(card.route as never)}
                variant="secondary"
                color={card.color}
                fullWidth
              >
                {card.cta}
              </Button>
            </Card>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Musculos que mejor vienes trabajando</Text>
          <Text style={styles.sectionHint}>Basado en tus ultimos 30 dias de entreno real.</Text>
        </View>

        <Card style={styles.muscleCard}>
          <MuscleSilhouette counts={muscleCounts} />
          {topMuscles.length ? (
            <View style={styles.muscleChipRow}>
              {topMuscles.map(([key, value]) => (
                <View key={key} style={styles.muscleChip}>
                  <Text style={styles.muscleChipTitle}>{key.toUpperCase()}</Text>
                  <Text style={styles.muscleChipBody}>{value} sesiones con foco</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Cuando completes mas sesiones, aqui vas a ver rapido si tu trabajo real esta cayendo en piernas, espalda, core o torso.
            </Text>
          )}
          <Text style={styles.programNote}>{currentProgramLabel}</Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Energia y peso</Text>
          <Text style={styles.sectionHint}>Lo importante cambia segun el objetivo que elegiste.</Text>
        </View>

        <View style={styles.energyGrid}>
          <Card style={styles.energyCard}>
            <Text style={styles.energyEyebrow}>Calorias de hoy</Text>
            <Text style={styles.energyTitle}>{goalCopy.title}</Text>
            <Text style={styles.energyBody}>{goalCopy.body}</Text>
            <Text style={styles.energyNote}>{goalCopy.note}</Text>
          </Card>

          <Card style={styles.energyCard}>
            <Text style={styles.energyEyebrow}>Peso y direccion</Text>
            <Text style={styles.energyTitle}>{weightCopy.title}</Text>
            <Text style={styles.energyBody}>{weightCopy.body}</Text>
            <Text style={styles.energyNote}>{weightCopy.note}</Text>
          </Card>
        </View>

        <View style={styles.footerActions}>
          <Button
            onPress={() => router.push(Routes.workout.programs as never)}
            color={Colors.workout}
            style={styles.flexButton}
          >
            Ver programas
          </Button>
          <Button
            onPress={() => router.push(Routes.tabs.home as never)}
            variant="secondary"
            color={Colors.textPrimary}
            style={styles.flexButton}
          >
            Volver a inicio
          </Button>
        </View>

        <ScreenFooterSpacer />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
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
    gap: 6,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  exportButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.surface3, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  heroCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.9),
  },
  heroTopRow: {
    gap: Spacing[3],
  },
  heroNumberWrap: {
    gap: 2,
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.brand,
  },
  heroNumber: {
    fontFamily: FontFamily.display,
    fontSize: 56,
    lineHeight: 58,
    color: Colors.textPrimary,
  },
  heroLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.brand, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.2),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  heroBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  weekDot: {
    flex: 1,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
  },
  weekDotDone: {
    backgroundColor: withOpacity(Colors.brand, 0.88),
  },
  weekDotToday: {
    borderWidth: 1,
    borderColor: Colors.white,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  flexButton: {
    flex: 1,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  moduleList: {
    gap: Spacing[3],
  },
  moduleCard: {
    gap: Spacing[2.5],
    backgroundColor: withOpacity(Colors.surface2, 0.9),
  },
  moduleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
    alignItems: 'flex-start',
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
    fontSize: 28,
    lineHeight: 34,
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
    height: 9,
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
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  muscleCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.9),
  },
  muscleChipRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  muscleChip: {
    minWidth: 92,
    borderRadius: Radius.xl,
    backgroundColor: withOpacity(Colors.surface3, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: 2,
  },
  muscleChipTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.textPrimary,
  },
  muscleChipBody: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
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
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface2, 0.9),
  },
  energyEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  energyTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  energyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
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
