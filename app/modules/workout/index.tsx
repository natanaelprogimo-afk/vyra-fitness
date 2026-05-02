import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { triggerImpactHaptic } from '@/lib/haptics';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { getWorkoutPlanSnapshot } from '@/lib/workout-plan';
import { useSettingsStore } from '@/stores/settingsStore';

type RoutineFilter = 'all' | 'favorites' | 'recent';

const MUSCLE_COLORS: Record<string, string> = {
  pecho: '#FB7185',
  espalda: '#38BDF8',
  hombro: '#F59E0B',
  brazo: '#F97316',
  piernas: '#84CC16',
  gluteo: '#A78BFA',
  core: '#FACC15',
};

function isoDay(value: string) {
  return value.slice(0, 10);
}

function levelLabel(exerciseCount: number) {
  if (exerciseCount >= 7) return 'Alto';
  if (exerciseCount >= 5) return 'Medio';
  return 'Base';
}

function muscleColor(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes('pecho')) return MUSCLE_COLORS.pecho;
  if (lower.includes('espalda') || lower.includes('dorsal')) return MUSCLE_COLORS.espalda;
  if (lower.includes('hombro')) return MUSCLE_COLORS.hombro;
  if (lower.includes('biceps') || lower.includes('triceps') || lower.includes('brazo')) return MUSCLE_COLORS.brazo;
  if (lower.includes('pierna') || lower.includes('cuadr') || lower.includes('gluteo') || lower.includes('femoral')) return MUSCLE_COLORS.piernas;
  if (lower.includes('core') || lower.includes('abd')) return MUSCLE_COLORS.core;
  return Colors.workout;
}

export default function WorkoutScreen({ showBack = true }: { showBack?: boolean }) {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.workout));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const {
    activeSession,
    exercises,
    routines,
    history,
    getActiveProgram,
    getRecommendedRoutine,
    getSessionDetail,
    refresh,
    loading,
  } = useWorkout();
  const [filter, setFilter] = useState<RoutineFilter>('all');

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
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySession = history.find((item) => isoDay(item.started_at) === todayKey) ?? null;
  const todaySessionDetail = todaySession ? getSessionDetail(todaySession.id) : null;

  const sessionsThisWeek = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return history.filter((item) => new Date(item.started_at).getTime() >= start.getTime()).length;
  }, [history]);

  const activeProgramWeek = useMemo(() => {
    if (!activeProgram) return 1;
    const sessionsPerWeek = Math.max(1, activeProgram.days_per_week || 4);
    return Math.min(
      activeProgram.duration_weeks || 4,
      Math.max(1, Math.floor(history.length / sessionsPerWeek) + 1),
    );
  }, [activeProgram, history.length]);

  const programProgress = useMemo(() => {
    if (!activeProgram) return 0;
    const totalSessions = Math.max(1, activeProgram.duration_weeks * Math.max(1, activeProgram.days_per_week || 4));
    return Math.min(100, Math.round((history.length / totalSessions) * 100));
  }, [activeProgram, history.length]);

  const todayMuscles = useMemo(() => {
    if (!currentRoutine) return [];
    const set = new Set<string>();
    currentRoutine.exercises.forEach((item) => {
      const meta = exercises.find((entry) => entry.id === item.exercise_id);
      if (meta?.muscle_group) set.add(meta.muscle_group);
      meta?.muscles_secondary?.forEach((muscle) => set.add(muscle));
    });
    return [...set].slice(0, 5);
  }, [currentRoutine, exercises]);

  const recentRoutineIds = useMemo(() => {
    const ids = new Set<string>();
    history.forEach((item) => {
      if (item.routine_id) ids.add(item.routine_id);
    });
    return ids;
  }, [history]);

  const filteredRoutines = useMemo(() => {
    if (filter === 'favorites') {
      return routines.filter(
        (routine) =>
          routine.is_primary ||
          Boolean(activeProgram?.routine_ids.includes(routine.id)),
      );
    }

    if (filter === 'recent') {
      return [...routines]
        .filter((routine) => recentRoutineIds.has(routine.id))
        .sort((left, right) => {
          const leftLast = history.find((item) => item.routine_id === left.id)?.started_at ?? '';
          const rightLast = history.find((item) => item.routine_id === right.id)?.started_at ?? '';
          return new Date(rightLast).getTime() - new Date(leftLast).getTime();
        });
    }

    return routines;
  }, [activeProgram?.routine_ids, filter, history, recentRoutineIds, routines]);

  const handleStart = async () => {
    await triggerImpactHaptic('medium');

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

    router.push({
      pathname: Routes.workout.preview,
      params: { free: '1', name: 'Sesión libre' },
    } as never);
  };

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Entreno" showBack={showBack} color={Colors.workout} />
        <ModuleIntroScreen
          accentColor={Colors.workout}
          icon="Fuerza"
          title="Entreno"
          body="Este modulo te deja ver el bloque del dia, abrir la sesion correcta y evitar que tu siguiente decision se sienta caotica."
          ctaLabel="Entrar al modulo"
          onContinue={() => markModuleIntroSeen('workout')}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Entreno" showBack={showBack} color={Colors.workout} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={Colors.workout} />}
      >
        {activeSession ? (
          <Card style={[styles.heroCard, styles.heroActive]} shadow={false}>
            <Text style={styles.heroEyebrow}>Sesión abierta</Text>
            <Text style={styles.heroTitle}>{getWorkoutDisplayName(activeSession.name)}</Text>
            <Text style={styles.heroMeta}>
              {activeSession.exercises.length} ejercicios | {activeSession.sets.length} series ya registradas
            </Text>
            <Button onPress={() => void handleStart()} fullWidth size="lg" haptic="medium">
              Volver al entreno
            </Button>
          </Card>
        ) : todaySession ? (
          <Card style={[styles.heroCard, styles.heroDone]} shadow={false}>
            <Text style={[styles.heroEyebrow, styles.heroEyebrowSuccess]}>Hoy ya entrenaste</Text>
            <Text style={styles.heroTitle}>{getWorkoutDisplayName(todaySession.name)}</Text>
            <Text style={styles.heroMeta}>
              {Math.round(todaySession.duration_min ?? 0)} min |{' '}
              {Math.round(todaySession.total_volume_kg ?? 0).toLocaleString('es-UY')} kg |{' '}
              {todaySession.sets_count} series
            </Text>
            <Text style={styles.heroBody}>
              Suma hecha. Si quieres repetir, puedes abrir el detalle o guardar una sesión libre extra.
            </Text>
            <Button
              onPress={() =>
                router.push({
                  pathname: Routes.workout.sessionDetail,
                  params: { sessionId: todaySession.id },
                } as never)
              }
              fullWidth
            >
              Ver detalle
            </Button>
          </Card>
        ) : currentRoutine ? (
          <Card style={styles.heroCard} shadow={false}>
            <Text style={styles.heroEyebrow}>{history.length === 0 ? 'Primer bloque' : 'Hoy'}</Text>
            <Text style={styles.heroTitle}>{getWorkoutDisplayName(currentRoutine.name)}</Text>
            <Text style={styles.heroMeta}>
              Ejercicios: {currentRoutine.exercises.length} | ~{currentRoutine.estimated_duration_min ?? 30} min
            </Text>
            {history.length === 0 ? (
              <Text style={styles.heroBody}>
                Empezamos con una rutina clara para que la primera sesión no se sienta como elegir entre demasiadas opciones.
              </Text>
            ) : null}

            <View style={styles.muscleRow}>
              {todayMuscles.map((muscle) => (
                <View
                  key={muscle}
                  style={[styles.musclePill, { backgroundColor: withOpacity(muscleColor(muscle), 0.14) }]}
                >
                  <Text style={[styles.musclePillText, { color: muscleColor(muscle) }]}>{muscle}</Text>
                </View>
              ))}
            </View>

            <View style={styles.heroFooter}>
              <View style={styles.heroWeekCopy}>
                <Text style={styles.heroWeekTitle}>Semana {activeProgramWeek}</Text>
                <Text style={styles.heroWeekSub}>Día listo para empujar el bloque</Text>
              </View>
              <View style={styles.heroProgressTrack}>
                <View style={[styles.heroProgressFill, { width: `${programProgress}%` }]} />
              </View>
            </View>

            <Button onPress={() => void handleStart()} fullWidth size="lg" haptic="medium">
              Entrenar ahora
            </Button>
          </Card>
        ) : (
          <Card style={styles.heroCard} shadow={false}>
            <Text style={styles.heroEyebrow}>Día de descarga</Text>
            <Text style={styles.heroTitle}>Hoy toca recuperar</Text>
            <Text style={styles.heroBody}>
              No hay una rutina marcada para hoy. Puedes usar este margen para movilidad, caminar o dejar el bloque respirar.
            </Text>
            <Button
              onPress={() => router.push(Routes.workout.preview as never)}
              variant="secondary"
              fullWidth
            >
              Abrir sesión libre
            </Button>
          </Card>
        )}

        {activeProgram ? (
          <Card style={styles.programCard} shadow={false}>
            <View style={styles.programTop}>
              <View style={styles.programCopy}>
                <Text style={styles.sectionLabel}>Programa activo</Text>
                <Text style={styles.programTitle}>{activeProgram.name}</Text>
                <Text style={styles.programBody}>
                  Semana {activeProgramWeek} de {activeProgram.duration_weeks} | {sessionsThisWeek} sesiones esta semana
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(Routes.workout.programs as never)}
                accessibilityRole="button"
                accessibilityLabel="Ver programas"
                accessibilityHint="Abre la lista completa de programas."
                hitSlop={8}
              >
                <Text style={styles.sectionLink}>Ver programas</Text>
              </Pressable>
            </View>
            <View style={styles.programTrack}>
              <View style={[styles.programFill, { width: `${programProgress}%` }]} />
            </View>
            <Text style={styles.programMeta}>{programProgress}% del bloque completado</Text>
          </Card>
        ) : null}

        <Card style={styles.weekCard} shadow={false}>
          <Text style={styles.sectionLabel}>Esta semana</Text>
          <Text style={styles.weekValue}>{sessionsThisWeek} sesiones</Text>
          <Text style={styles.weekBody}>
            El objetivo del módulo es dejarte la siguiente acción obvia y el contexto justo.
          </Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Rutinas</Text>
        </View>

        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'favorites', label: 'Favoritos' },
            { id: 'recent', label: 'Recientes' },
          ].map((option) => {
            const active = filter === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setFilter(option.id as RoutineFilter)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                accessibilityRole="radio"
                accessibilityLabel={`Filtro ${option.label}`}
                accessibilityState={{ selected: active }}
                hitSlop={8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredRoutines.length === 0 ? (
          <EmptyState
            icon="Barra"
            title="Sin rutinas para este filtro"
            description="Cambia el filtro o crea una sesión libre para no cortar el ritmo."
          />
        ) : (
          filteredRoutines.slice(0, 6).map((routine) => {
            const lastUsed = history.find((item) => item.routine_id === routine.id) ?? null;
            const weeklyCompletions = history.filter((item) => {
              const started = new Date(item.started_at);
              const limit = new Date();
              limit.setDate(limit.getDate() - 6);
              limit.setHours(0, 0, 0, 0);
              return item.routine_id === routine.id && started.getTime() >= limit.getTime();
            }).length;

            return (
              <Card key={routine.id} style={styles.routineCard} shadow={false}>
                <View style={styles.routineTop}>
                  <View style={styles.routineCopy}>
                    <Text style={styles.routineName}>{getWorkoutDisplayName(routine.name)}</Text>
                    <Text style={styles.routineMeta}>
                      {weeklyCompletions || 0}x/sem | {levelLabel(routine.exercises.length)} |{' '}
                      {routine.estimated_duration_min ?? 30} min
                    </Text>
                  </View>
                  {routine.is_primary ? (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Base</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.routineHint}>
                  {lastUsed
                    ? `Última vez ${formatLastUsed(lastUsed.started_at)}`
                    : 'Todavía no la usaste en el historial reciente'}
                </Text>

                <Button
                  onPress={() =>
                    router.push({
                      pathname: Routes.workout.preview,
                      params: { routineId: routine.id, name: getWorkoutDisplayName(routine.name) },
                    } as never)
                  }
                  fullWidth
                >
                  Abrir rutina
                </Button>
              </Card>
            );
          })
        )}

        {todaySessionDetail?.exerciseBreakdown?.length ? (
          <Card style={styles.historyCard} shadow={false}>
            <Text style={styles.sectionLabel}>Lo que más moviste hoy</Text>
            {todaySessionDetail.exerciseBreakdown.slice(0, 3).map((item, index) => (
              <View key={`${item.exercise_id}-${index}`} style={styles.breakdownRow}>
                <Text style={styles.breakdownName}>{item.exercise_name}</Text>
                <Text style={styles.breakdownMeta}>
                  {item.sets} series | {Math.round(item.total_volume_kg).toLocaleString('es-UY')} kg
                </Text>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}

function formatLastUsed(iso: string) {
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'hace 1 día';
  return `hace ${diff} días`;
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[3],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.22),
    backgroundColor: withOpacity(Colors.workout, 0.08),
  },
  heroActive: {
    borderColor: withOpacity(Colors.action, 0.24),
    backgroundColor: withOpacity(Colors.action, 0.08),
  },
  heroDone: {
    borderColor: withOpacity(Colors.success, 0.24),
    backgroundColor: withOpacity(Colors.success, 0.08),
  },
  heroEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.workout,
  },
  heroEyebrowSuccess: {
    color: Colors.success,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    lineHeight: 34,
    color: Colors.textPrimary,
  },
  heroMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  musclePill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
  },
  musclePillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  heroFooter: {
    gap: Spacing[2],
  },
  heroWeekCopy: {
    gap: 2,
  },
  heroWeekTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  heroWeekSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  heroProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
  },
  programCard: {
    gap: Spacing[3],
  },
  programTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  programCopy: {
    flex: 1,
    gap: 4,
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  sectionLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  programTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  programBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  programTrack: {
    width: '100%',
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  programFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.action,
  },
  programMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  weekCard: {
    gap: Spacing[2],
  },
  weekValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  weekBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  filterChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  filterChipActive: {
    backgroundColor: Colors.actionBg,
    borderColor: Colors.actionBorder,
  },
  filterChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.action,
  },
  routineCard: {
    gap: Spacing[3],
  },
  routineTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  routineCopy: {
    flex: 1,
    gap: 4,
  },
  routineName: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  routineMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  routineHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  primaryBadge: {
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.workout, 0.12),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
  },
  primaryBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.workout,
  },
  historyCard: {
    gap: Spacing[3],
  },
  breakdownRow: {
    gap: 2,
  },
  breakdownName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  breakdownMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
