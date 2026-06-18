// REDESIGNED: 2026-05-21 - Workout now prioritizes readiness, today's block, and recent history
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import SafeScreen from '@/components/ui/SafeScreen';
import CycleAwareTrainingCard from '@/components/workout/CycleAwareTrainingCard';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { WorkoutDifficultyLevels } from '@/constants/strings';
import { useWorkout } from '@/hooks/useWorkout';
import { triggerImpactHaptic } from '@/lib/haptics';
import { getWorkoutPlanSnapshot } from '@/lib/workout-plan';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { useAuthStore } from '@/stores/authStore';

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
  if (exerciseCount >= 7) return WorkoutDifficultyLevels.high;
  if (exerciseCount >= 5) return WorkoutDifficultyLevels.medium;
  return WorkoutDifficultyLevels.base;
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

function formatLastUsed(iso: string) {
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return `Hace ${diff} dias`;
}

function getReadinessTone(level: 'low' | 'moderate' | 'high') {
  if (level === 'high') {
    return {
      badge: 'Recupera',
      title: 'Hoy conviene bajar carga',
      body: 'Tu siguiente buena decision es entrenar mas tecnico o directamente recuperar, no pelearte con una sesion pesada.',
      accent: Colors.warning,
    };
  }

  if (level === 'moderate') {
    return {
      badge: 'Carga moderada',
      title: 'Hay margen para entrenar bien',
      body: 'Puedes sumar una sesion fuerte si mantienes el bloque controlado y no te vas de volumen.',
      accent: Colors.secondary,
    };
  }

  return {
    badge: 'Listo para entrenar',
    title: 'Buen día para empujar',
    body: 'Tu pantalla de entreno deberia dejarte una rutina obvia y un CTA claro, no diez caminos compitiendo.',
    accent: Colors.workout,
  };
}

export default function WorkoutScreen({ showBack = true }: { showBack?: boolean }) {
  const profile = useAuthStore((state) => state.profile);
  const {
    activeSession,
    exercises,
    routines,
    history,
    getActiveProgram,
    getFatigueRisk,
    getRecommendedRoutine,
    refresh,
    loading,
  } = useWorkout();
  const [filter, setFilter] = useState<RoutineFilter>('all');

  const workoutCycleKey = [
    profile?.female_health_enabled ? '1' : '0',
    profile?.female_last_period_date ?? '',
    profile?.female_cycle_length ?? '',
    profile?.gender ?? '',
  ].join('|');

  const activeProgram = useMemo(() => getActiveProgram(), [getActiveProgram, history, routines]);
  const programHistory = useMemo(() => {
    if (!activeProgram) return [];
    const routineIds = new Set(activeProgram.routine_ids);
    return history.filter((entry) => entry.routine_id && routineIds.has(entry.routine_id));
  }, [activeProgram, history]);
  const fatigueRisk = useMemo(() => getFatigueRisk(), [getFatigueRisk, history, workoutCycleKey]);
  const recommendedRoutineData = useMemo(
    () => getRecommendedRoutine(),
    [getRecommendedRoutine, history, routines, workoutCycleKey],
  );
  const recommendedRoutine = recommendedRoutineData.routine;
  const readinessTone = getReadinessTone(fatigueRisk.level);
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
  const recentSessions = useMemo(
    () =>
      [...history]
        .sort((left, right) => new Date(right.started_at).getTime() - new Date(left.started_at).getTime())
        .slice(0, 3),
    [history],
  );
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySession = recentSessions.find((item) => isoDay(item.started_at) === todayKey) ?? null;
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
      Math.max(1, Math.floor(programHistory.length / sessionsPerWeek) + 1),
    );
  }, [activeProgram, programHistory.length]);

  const programProgress = useMemo(() => {
    if (!activeProgram) return 0;
    const totalSessions = Math.max(1, activeProgram.duration_weeks * Math.max(1, activeProgram.days_per_week || 4));
    return Math.min(100, Math.round((programHistory.length / totalSessions) * 100));
  }, [activeProgram, programHistory.length]);

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

  const signalReasons = useMemo(
    () => [...recommendedRoutineData.reasons, ...fatigueRisk.reasons].filter(Boolean).slice(0, 2),
    [fatigueRisk.reasons, recommendedRoutineData.reasons],
  );

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
      params: { free: '1', name: 'Sesion libre' },
    } as never);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Entreno" showBack={showBack} color={Colors.workout} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={Colors.workout} />}
      >
        <Card
          style={[
            styles.heroCard,
            activeSession
              ? styles.heroActive
              : todaySession
                ? styles.heroComplete
                : { borderColor: withOpacity(readinessTone.accent, 0.2), backgroundColor: withOpacity(readinessTone.accent, 0.08) },
          ]}
          shadow={false}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroEyebrow, { color: activeSession ? Colors.secondary : todaySession ? Colors.success : readinessTone.accent }]}>
                {activeSession ? 'Sesion abierta' : todaySession ? 'Hoy ya entrenaste' : 'Readiness hoy'}
              </Text>
              <Text style={styles.heroTitle}>
                {activeSession
                  ? getWorkoutDisplayName(activeSession.name)
                  : todaySession
                    ? getWorkoutDisplayName(todaySession.name)
                    : currentRoutine
                      ? readinessTone.title
                      : 'Hoy conviene recuperar'}
              </Text>
              <Text style={styles.heroBody}>
                {activeSession
                  ? 'Tu sesion sigue abierta. Volver deberia ser el gesto mas facil de esta pantalla.'
                  : todaySession
                    ? 'El bloque principal del día ya quedó hecho. Si vuelves a entrar, que sea para revisar o sumar algo puntual.'
                    : fatigueRisk.cycleAdjustedRecommendation ?? fatigueRisk.message ?? readinessTone.body}
              </Text>
            </View>

            <View
              style={[
                styles.heroBadge,
                {
                  backgroundColor: withOpacity(activeSession ? Colors.secondary : todaySession ? Colors.success : readinessTone.accent, 0.14),
                  borderColor: withOpacity(activeSession ? Colors.secondary : todaySession ? Colors.success : readinessTone.accent, 0.2),
                },
              ]}
            >
              <Text
                style={[
                  styles.heroBadgeText,
                  { color: activeSession ? Colors.secondary : todaySession ? Colors.success : readinessTone.accent },
                ]}
              >
                {activeSession ? 'Volver' : todaySession ? 'Cerrado' : readinessTone.badge}
              </Text>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Bloque</Text>
              <Text style={styles.heroStatValue}>
                {currentRoutine ? getWorkoutDisplayName(currentRoutine.name) : 'Libre'}
              </Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Semana</Text>
              <Text style={styles.heroStatValue}>
                {activeProgram ? `${activeProgramWeek}/${activeProgram.duration_weeks}` : `${sessionsThisWeek} sesiones`}
              </Text>
            </View>
          </View>

          {signalReasons.length ? (
            <View style={styles.reasonStack}>
              {signalReasons.map((reason) => (
                <View key={reason} style={styles.reasonRow}>
                  <View style={styles.reasonDot} />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Button
            onPress={() => {
              if (todaySession && !activeSession) {
                router.push({
                  pathname: Routes.workout.sessionDetail,
                  params: { sessionId: todaySession.id },
                } as never);
                return;
              }

              void handleStart();
            }}
            fullWidth
            size="lg"
            color={Colors.workout}
            haptic="medium"
          >
            {activeSession ? 'Volver al entreno' : todaySession ? 'Ver detalle de hoy' : 'Empezar entreno rapido'}
          </Button>
        </Card>

        <Card style={styles.blockCard} shadow={false}>
          <View style={styles.sectionTop}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionEyebrow}>Mi bloque</Text>
              <Text style={styles.sectionTitle}>
                {currentRoutine ? getWorkoutDisplayName(currentRoutine.name) : 'Todavia no hay una rutina elegida'}
              </Text>
              <Text style={styles.sectionBody}>
                {currentRoutine
                  ? `${currentRoutine.exercises.length} ejercicios · ${currentRoutine.estimated_duration_min ?? 30} min. La pantalla tiene que dejar este bloque clarisimo.`
                  : 'Si hoy no hay rutina marcada, la salida correcta es abrir una sesion libre o entrar a programas.'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(Routes.workout.programs as never)}
              accessibilityRole="button"
              accessibilityLabel="Ver programas"
              accessibilityHint="Abre la lista completa de programas."
              hitSlop={8}
            >
              <Text style={styles.sectionLink}>Programas</Text>
            </Pressable>
          </View>

          {todayMuscles.length ? (
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
          ) : null}

          {activeProgram ? (
            <>
              <View style={styles.programMetaRow}>
                <Text style={styles.programMetaValue}>{activeProgram.name}</Text>
                <Text style={styles.programMetaHint}>{programProgress}% del bloque</Text>
              </View>
              <View style={styles.programTrack}>
                <View style={[styles.programFill, { width: `${programProgress}%` }]} />
              </View>
            </>
          ) : null}

          <Button
            onPress={() => {
              if (currentRoutine) {
                router.push({
                  pathname: Routes.workout.preview,
                  params: { routineId: currentRoutine.id, name: getWorkoutDisplayName(currentRoutine.name) },
                } as never);
                return;
              }

              router.push(Routes.workout.programs as never);
            }}
            fullWidth
            variant={currentRoutine ? 'secondary' : 'primary'}
            color={Colors.workout}
          >
            {currentRoutine ? 'Abrir bloque del día' : 'Elegir programa'}
          </Button>
        </Card>

        <CycleAwareTrainingCard
          sessionName={activeSession ? getWorkoutDisplayName(activeSession.name) : null}
          routineName={!activeSession && currentRoutine ? getWorkoutDisplayName(currentRoutine.name) : null}
        />

        <Card shadow={false}>
          <View style={styles.sectionTop}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionEyebrow}>Historial reciente</Text>
              <Text style={styles.sectionTitle}>Tus ultimas sesiones</Text>
              <Text style={styles.sectionBody}>Cuando ya entrenaste, esta zona deberia contar historia en pocas filas y sin ruido.</Text>
            </View>
          </View>

          {recentSessions.length ? (
            <View style={styles.historyStack}>
              {recentSessions.map((session) => (
                <Pressable
                  key={session.id}
                  style={styles.historyRow}
                  onPress={() =>
                    router.push({
                      pathname: Routes.workout.sessionDetail,
                      params: { sessionId: session.id },
                    } as never)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={getWorkoutDisplayName(session.name)}
                  accessibilityHint="Abre el detalle de la sesion."
                >
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyTitle}>{getWorkoutDisplayName(session.name)}</Text>
                    <Text style={styles.historyMeta}>
                      {formatLastUsed(session.started_at)} · {Math.round(session.duration_min ?? 0)} min · {session.sets_count} series
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="Barra"
              title="Todavia no hay sesiones cerradas"
              description="En cuanto completes tu primer entreno, el historial va a resumir ritmo, volumen y continuidad sin perder claridad."
            />
          )}
        </Card>

        <Card shadow={false}>
          <View style={styles.sectionTop}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionEyebrow}>Rutinas</Text>
              <Text style={styles.sectionTitle}>Biblioteca rapida</Text>
              <Text style={styles.sectionBody}>Las rutinas viven abajo para que primero decidas si hoy entrenas, y despues con que.</Text>
            </View>
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
              description="Cambia el filtro o abre una sesion libre para no cortar el ritmo."
            />
          ) : (
            <View style={styles.routineStack}>
              {filteredRoutines.slice(0, 4).map((routine) => {
                const lastUsed = history.find((item) => item.routine_id === routine.id) ?? null;
                const isPrimary = routine.is_primary || Boolean(activeProgram?.routine_ids.includes(routine.id));

                return (
                  <Pressable
                    key={routine.id}
                    style={styles.routineCard}
                    onPress={() =>
                      router.push({
                        pathname: Routes.workout.preview,
                        params: { routineId: routine.id, name: getWorkoutDisplayName(routine.name) },
                      } as never)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={getWorkoutDisplayName(routine.name)}
                    accessibilityHint="Abre la vista previa de esta rutina."
                  >
                    <View style={styles.routineTop}>
                      <View style={styles.routineCopy}>
                        <Text style={styles.routineTitle}>{getWorkoutDisplayName(routine.name)}</Text>
                        <Text style={styles.routineMeta}>
                          {routine.exercises.length} ejercicios · {routine.estimated_duration_min ?? 30} min · {levelLabel(routine.exercises.length)}
                        </Text>
                      </View>
                      {isPrimary ? (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Base</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.routineHint}>
                      {lastUsed ? `${formatLastUsed(lastUsed.started_at)} · usada recientemente` : 'Aun no aparece en tu historial reciente'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[3],
    borderWidth: 1,
  },
  heroActive: {
    borderColor: withOpacity(Colors.secondary, 0.22),
    backgroundColor: withOpacity(Colors.secondary, 0.08),
  },
  heroComplete: {
    borderColor: withOpacity(Colors.success, 0.22),
    backgroundColor: withOpacity(Colors.success, 0.08),
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xl,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.px20,
    color: Colors.textSecondary,
  },
  heroBadge: {
    minHeight: 34,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  heroStat: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 4,
  },
  heroStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  heroStatValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  reasonStack: {
    gap: Spacing[2],
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  reasonDot: {
    width: 8,
    height: 8,
    marginTop: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
  },
  reasonText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  blockCard: {
    gap: Spacing[3],
  },
  sectionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
  },
  sectionEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.px20,
    color: Colors.textSecondary,
  },
  sectionLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.workout,
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
  programMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  programMetaValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  programMetaHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
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
    backgroundColor: Colors.workout,
  },
  historyStack: {
    gap: Spacing[2],
  },
  historyRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  historyCopy: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  historyMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  filterChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
  },
  filterChipActive: {
    backgroundColor: withOpacity(Colors.workout, 0.12),
    borderColor: withOpacity(Colors.workout, 0.2),
  },
  filterChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.workout,
  },
  routineStack: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  routineCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 6,
  },
  routineTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  routineCopy: {
    flex: 1,
    gap: 2,
  },
  routineTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  routineMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routineHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
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
});
