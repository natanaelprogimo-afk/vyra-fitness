import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { getWorkoutWarmupPlan } from '@/lib/workout-session';
import type { Routine } from '@/lib/workout-types';

function lastSessionLabel(routine: Routine | null, history: Array<{ routine_id?: string | null; name: string; started_at: string }>) {
  const match = history.find((entry) =>
    routine ? entry.routine_id === routine.id || entry.name === routine.name : false,
  );

  if (!match) return 'Última vez: primera vez';
  const days = Math.max(0, Math.round((Date.now() - new Date(match.started_at).getTime()) / 86400000));
  if (days === 0) return 'Última vez: hoy';
  if (days === 1) return 'Última vez: hace 1 día';
  return `Última vez: hace ${days} días`;
}

export default function WorkoutSessionPreviewScreen() {
  const params = useLocalSearchParams<{ routineId?: string; free?: string; name?: string }>();
  const { routines, history, activeSession, startSession } = useWorkout();
  const [starting, setStarting] = useState(false);

  const selectedRoutine = useMemo(() => {
    if (!params.routineId) return null;
    return routines.find((routine) => routine.id === params.routineId) ?? null;
  }, [params.routineId, routines]);

  const isFreeSession = params.free === '1' || !selectedRoutine;
  const routineName = getWorkoutDisplayName(selectedRoutine?.name ?? params.name ?? 'Sesión libre');
  const exerciseList = selectedRoutine?.exercises ?? [];
  const warmupPlan = useMemo(
    () => getWorkoutWarmupPlan(exerciseList.map((item) => item.exercise_name)),
    [exerciseList],
  );
  const lastSession = useMemo(() => lastSessionLabel(selectedRoutine, history), [history, selectedRoutine]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return true;
    }

    router.replace(Routes.workout.index as never);
    return true;
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => subscription.remove();
  }, [handleBack]);

  const handleStart = async () => {
    if (activeSession) {
      router.replace(Routes.workout.session as never);
      return;
    }

    setStarting(true);
    try {
      await startSession(routineName, isFreeSession ? null : selectedRoutine?.id ?? null);
      router.replace(Routes.workout.session as never);
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            accessibilityHint="Regresa a la pantalla anterior del modulo de entrenamiento."
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {routineName}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.heroTitle}>{routineName}</Text>
        <Text style={styles.heroMeta}>
          {selectedRoutine
            ? `Bloque listo · ${selectedRoutine.exercises.length} ejercicios · ${selectedRoutine.estimated_duration_min ?? 30} min`
            : 'Sesión libre para entrenar hoy sin plan fijo.'}
        </Text>

        <Card style={styles.planCard} shadow={false}>
          <Text style={styles.eyebrow}>Para hoy</Text>
          <Text style={styles.planName}>{routineName}</Text>
          <Text style={styles.planMeta}>
            {selectedRoutine
              ? `${selectedRoutine.exercises.length} ejercicios · ${selectedRoutine.estimated_duration_min ?? 30} min`
              : 'Agrega ejercicios sobre la marcha y deja la sesión igualmente registrada.'}
          </Text>
          <Text style={styles.planHint}>{lastSession}</Text>

          {exerciseList.length ? (
            <View style={styles.exerciseList}>
              {exerciseList.map((exercise) => (
                <View key={`${routineName}-${exercise.exercise_id}`} style={styles.exerciseRow}>
                  <Text style={styles.exerciseBullet}>○</Text>
                  <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets_target}×{exercise.reps_target}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Puedes arrancar vacío y sumar ejercicios durante la sesión.</Text>
          )}
        </Card>

        <Card style={styles.warmupCard} shadow={false}>
          <Text style={styles.eyebrow}>Calentamiento sugerido</Text>
          <Text style={styles.warmupTitle}>{warmupPlan.label}</Text>
          <Text style={styles.warmupMeta}>5 minutos · activar antes de arrancar</Text>
          <View style={styles.warmupList}>
            {warmupPlan.moves.map((move) => (
              <Text key={move.title} style={styles.warmupItem}>
                · {move.title} ({move.seconds}s)
              </Text>
            ))}
          </View>
        </Card>

        <View style={styles.actions}>
          <Button onPress={() => void handleStart()} fullWidth size="lg" loading={starting}>
            Empezar
          </Button>
          <Button onPress={() => router.push(Routes.workout.index as never)} variant="ghost" fullWidth>
            Volver al hub
          </Button>
        </View>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 34,
    color: Colors.textPrimary,
    letterSpacing: -1.2,
  },
  heroMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.action,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  planCard: {
    gap: Spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: Colors.action,
  },
  planName: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  planMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  planHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
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
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  exerciseMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  warmupCard: {
    gap: Spacing[2],
  },
  warmupTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  warmupMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  warmupList: {
    gap: Spacing[1],
  },
  warmupItem: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing[2],
  },
});
