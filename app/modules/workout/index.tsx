import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { getWorkoutPlanSnapshot } from '@/lib/workout-plan';

function levelDots(exerciseCount: number) {
  const filled = Math.min(4, Math.max(1, Math.round(exerciseCount / 2)));
  return `${'●'.repeat(filled)}${'○'.repeat(Math.max(0, 4 - filled))}`;
}

export default function WorkoutScreen({ showBack = true }: { showBack?: boolean }) {
  const { activeSession, routines, history, getActiveProgram, getRecommendedRoutine } = useWorkout();

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
  const activeProgramWeek = useMemo(() => {
    if (!activeProgram) return 1;
    const sessionsPerWeek = Math.max(1, activeProgram.days_per_week || 4);
    return Math.min(
      activeProgram.duration_weeks || 4,
      Math.max(1, Math.floor(history.length / sessionsPerWeek) + 1),
    );
  }, [activeProgram, history.length]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    if (activeSession) {
      router.push(Routes.workout.session as never);
      return;
    }

    if (currentRoutine) {
      router.push({
        pathname: Routes.workout.preview,
        params: { routineId: currentRoutine.id, name: currentRoutine.name },
      } as never);
      return;
    }

    router.push({
      pathname: Routes.workout.preview,
      params: { free: '1', name: 'Sesion libre' },
    } as never);
  };

  const handleStartFree = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: Routes.workout.preview,
      params: { free: '1', name: 'Sesion libre' },
    } as never);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Entreno" showBack={showBack} color={Colors.workout} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} shadow={false}>
          <View style={styles.heroAccent} />
          <Text style={styles.heroEyebrow}>Plan de hoy</Text>
          <Text style={styles.heroTitle}>
            {activeSession ? activeSession.name : currentRoutine?.name ?? 'Sesion libre'}
          </Text>
          <Text style={styles.heroMeta}>
            {activeSession
              ? `${activeSession.exercises.length || activeSession.sets.length} ejercicios · sesion abierta`
              : `${currentRoutine?.exercises.length ?? 4} ejercicios · ~${currentRoutine?.estimated_duration_min ?? 30} min · Semana ${activeProgramWeek}/${activeProgram?.duration_weeks ?? 4}`}
          </Text>
          <Text style={styles.heroHint}>
            Nivel: {levelDots(currentRoutine?.exercises.length ?? 4)}
          </Text>
          <Button onPress={() => void handleStart()} fullWidth size="lg" haptic="medium">
            {activeSession ? 'Volver al entreno' : 'Entrenar ahora'}
          </Button>
          <Button onPress={() => void handleStartFree()} variant="secondary" fullWidth>
            Sesion libre
          </Button>
        </Card>

        {activeProgram ? (
          <Card style={styles.infoCard} shadow={false}>
            <Text style={styles.sectionLabel}>Bloque activo</Text>
            <Text style={styles.sectionTitle}>{activeProgram.name}</Text>
            <Text style={styles.sectionBody}>
              Semana {activeProgramWeek} de {activeProgram.duration_weeks}. Este bloque ya esta ordenando el dia y el historial reciente.
            </Text>
          </Card>
        ) : null}

        <Card style={styles.infoCard} shadow={false}>
          <Text style={styles.sectionLabel}>Esta semana</Text>
          <Text style={styles.sectionTitle}>{history.filter((item) => {
            const date = new Date(item.started_at);
            const start = new Date();
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            return date.getTime() >= start.getTime();
          }).length} sesiones</Text>
          <Text style={styles.sectionBody}>
            El foco del modulo es que vuelvas rapido al siguiente entreno, no navegar un dashboard.
          </Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Rutinas</Text>
          <Pressable onPress={() => router.push(Routes.workout.routines as never)}>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </Pressable>
        </View>

        {routines.length === 0 ? (
          <EmptyState
            icon="Barra"
            title="Sin rutinas aun"
            description="Puedes arrancar con una sesion libre y dejar el historial igual de ordenado."
          />
        ) : (
          routines.slice(0, 4).map((routine) => (
            <Card key={routine.id} style={styles.routineCard} shadow={false}>
              <View style={styles.routineHeader}>
                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.routineMeta}>
                  {routine.exercises.length} ejercicios · {routine.estimated_duration_min ?? 30} min
                </Text>
              </View>
              <View style={styles.exerciseList}>
                {routine.exercises.slice(0, 4).map((exercise) => (
                  <View key={`${routine.id}-${exercise.exercise_id}`} style={styles.exerciseRow}>
                    <Text style={styles.exerciseBullet}>○</Text>
                    <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                    <Text style={styles.exerciseTarget}>
                      {exercise.sets_target}×{exercise.reps_target}
                    </Text>
                  </View>
                ))}
              </View>
              <Button
                onPress={() =>
                  router.push({
                    pathname: Routes.workout.preview,
                    params: { routineId: routine.id, name: routine.name },
                  } as never)
                }
                fullWidth
              >
                Empezar
              </Button>
            </Card>
          ))
        )}

        {history.length ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>Ultimos entrenos</Text>
              <Pressable onPress={() => router.push(Routes.workout.history as never)}>
                <Text style={styles.sectionLink}>Historial</Text>
              </Pressable>
            </View>

            <Card style={styles.historyCard} shadow={false}>
              {history.slice(0, 4).map((session, index) => (
                <View key={session.id}>
                  <Pressable
                    style={styles.historyRow}
                    onPress={() =>
                      router.push({
                        pathname: Routes.workout.sessionDetail,
                        params: { id: session.id },
                      } as never)
                    }
                  >
                    <View style={styles.historyCopy}>
                      <Text style={styles.historyTitle}>{session.name}</Text>
                      <Text style={styles.historyMeta}>
                        {Math.round(session.duration_min ?? 0)} min ·{' '}
                        {Math.round(session.total_volume_kg ?? 0).toLocaleString('es-UY')} kg
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(session.started_at).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>
                  </Pressable>
                  {index < Math.min(history.length, 4) - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </Card>
          </>
        ) : null}
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
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    backgroundColor: Colors.workout,
  },
  heroEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.workout,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  heroMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  heroHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  infoCard: {
    gap: Spacing[2],
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionHeaderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  routineCard: {
    gap: Spacing[3],
  },
  routineHeader: {
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
  exerciseList: {
    gap: Spacing[2],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.06),
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  exerciseBullet: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  exerciseName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  exerciseTarget: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  historyCard: {
    paddingVertical: 0,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  historyCopy: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  historyMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  historyDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
});
