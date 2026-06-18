import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import MuscleSilhouette from '@/components/workout/MuscleSilhouette';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { triggerImpactHaptic } from '@/lib/haptics';
import { useAuthStore } from '@/stores/authStore';
import { useWorkout } from '@/hooks/useWorkout';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { getWorkoutWarmupPlan } from '@/lib/workout-session';
import type { Routine } from '@/lib/workout-types';

function normalizeWorkoutName(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

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

function formatWorkoutLimitationLabel(value: string) {
  if (value === 'back') return 'Espalda';
  if (value === 'shoulder') return 'Hombro';
  if (value === 'knee') return 'Rodilla';
  if (value === 'wrist') return 'Muñeca';
  if (value === 'hip') return 'Cadera';
  return value;
}

function formatMuscleFocusLabel(value: string) {
  const normalized = normalizeWorkoutName(value);
  if (!normalized) return 'General';
  if (normalized.includes('pecho') || normalized.includes('pectoral')) return 'Pecho';
  if (normalized.includes('dorsal') || normalized.includes('lat')) return 'Dorsales';
  if (normalized.includes('trap')) return 'Trapecio';
  if (normalized.includes('lumbar')) return 'Lumbares';
  if (normalized.includes('espalda')) return 'Espalda';
  if (normalized.includes('hombro') || normalized.includes('deltoid')) return 'Hombros';
  if (normalized.includes('bicep')) return 'Biceps';
  if (normalized.includes('tricep')) return 'Triceps';
  if (normalized.includes('antebrazo') || normalized.includes('forearm')) return 'Antebrazos';
  if (normalized.includes('abd') || normalized.includes('core')) return 'Core';
  if (normalized.includes('oblic')) return 'Oblicuos';
  if (normalized.includes('glute')) return 'Gluteos';
  if (normalized.includes('cuadr') || normalized.includes('quad')) return 'Cuadriceps';
  if (normalized.includes('isquio') || normalized.includes('hamstring') || normalized.includes('femoral')) return 'Isquios';
  if (normalized.includes('pantorr') || normalized.includes('calf') || normalized.includes('gemelo')) return 'Pantorrillas';
  if (normalized.includes('aductor') || normalized.includes('adductor')) return 'Aductores';
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function WorkoutSessionPreviewScreen() {
  const params = useLocalSearchParams<{ routineId?: string; free?: string; name?: string }>();
  const profile = useAuthStore((state) => state.profile);
  const { routines, history, activeSession, startSession, exercises } = useWorkout();
  const [starting, setStarting] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  const selectedRoutine = useMemo(() => {
    if (params.routineId) {
      return routines.find((routine) => routine.id === params.routineId) ?? null;
    }

    const normalizedRequestedName = normalizeWorkoutName(params.name);
    if (!normalizedRequestedName) return null;

    return (
      routines.find((routine) => {
        const candidates = [routine.name, getWorkoutDisplayName(routine.name), routine.slug ?? ''];
        return candidates.some(
          (candidate) => normalizeWorkoutName(candidate) === normalizedRequestedName,
        );
      }) ?? null
    );
  }, [params.name, params.routineId, routines]);

  const isFreeSession = params.free === '1' && !selectedRoutine;
  const routineName = getWorkoutDisplayName(selectedRoutine?.name ?? params.name ?? 'Sesión libre');
  const exerciseList = selectedRoutine?.exercises ?? [];
  const warmupPlan = useMemo(
    () => getWorkoutWarmupPlan(exerciseList.map((item) => item.exercise_name)),
    [exerciseList],
  );
  const lastSession = useMemo(() => lastSessionLabel(selectedRoutine, history), [history, selectedRoutine]);
  const workoutLimitations = useMemo(() => {
    const raw = profile?.context_memory_json?.workout_limitations;
    return Array.isArray(raw)
      ? raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];
  }, [profile?.context_memory_json]);
  const muscleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};

    exerciseList.forEach((exercise) => {
      const meta = exercises.find((item) => item.id === exercise.exercise_id);
      const load = Math.max(1, exercise.sets_target || 1);
      const muscles = [meta?.muscle_group, ...(meta?.muscles_secondary ?? [])].filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      );

      muscles.forEach((muscle, index) => {
        counts[muscle] = (counts[muscle] ?? 0) + load * (index === 0 ? 1 : 0.55);
      });
    });

    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const focus = Object.entries(counts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label, value]) => ({
        label: formatMuscleFocusLabel(label),
        percent: total > 0 ? Math.max(10, Math.round((value / total) * 100)) : 0,
      }));

    return {
      muscles: Object.keys(counts),
      counts,
      focus,
    };
  }, [exerciseList, exercises]);

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

  const playCountdown = useCallback(async () => {
    for (const value of [3, 2, 1]) {
      setCountdownValue(value);
      await triggerImpactHaptic('medium');
      await new Promise((resolve) => setTimeout(resolve, 620));
    }
    setCountdownValue(null);
  }, []);

  const handleStart = async () => {
    if (starting || countdownValue !== null) return;

    if (activeSession) {
      router.replace(Routes.workout.session as never);
      return;
    }

    await playCountdown();
    setStarting(true);
    try {
      await startSession(routineName, isFreeSession ? null : selectedRoutine?.id ?? null);
      router.replace(Routes.workout.session as never);
    } finally {
      setStarting(false);
    }
  };

  const handleEditRoutine = useCallback(() => {
    if (!selectedRoutine) return;
    router.push({
      pathname: Routes.workout.routineEditor,
      params: { routineId: selectedRoutine.id },
    } as never);
  }, [selectedRoutine]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      {countdownValue !== null ? (
        <View style={styles.countdownOverlay} pointerEvents="none">
          <View style={styles.countdownRingOuter}>
            <View style={styles.countdownRingInner}>
              <Text style={styles.countdownLabel}>Respira. Arrancamos.</Text>
              <Text style={styles.countdownValue}>{countdownValue}</Text>
              <Text style={styles.countdownMeta}>Tu bloque arranca en segundos</Text>
            </View>
          </View>
        </View>
      ) : null}

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
          {selectedRoutine ? (
            <Pressable
              onPress={handleEditRoutine}
              style={styles.adaptButton}
              accessibilityRole="button"
              accessibilityLabel="Adaptar entrenamiento"
              accessibilityHint="Abre el editor para ajustar ejercicios, orden o volumen."
              hitSlop={10}
            >
              <Ionicons name="sparkles-outline" size={16} color={Colors.secondary} />
              <Text style={styles.adaptButtonText}>Adaptar</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <Text style={styles.heroTitle}>{routineName}</Text>
        <Text style={styles.heroMeta}>
          {selectedRoutine
            ? `Bloque listo · ${selectedRoutine.exercises.length} ejercicios · ${selectedRoutine.estimated_duration_min ?? 30} min`
            : 'Sesión libre para entrenar hoy sin plan fijo.'}
        </Text>
        <Text style={styles.heroSubmeta}>{lastSession}</Text>

        {selectedRoutine && muscleDistribution.muscles.length ? (
          <Card style={styles.distributionCard} shadow={false}>
            <View style={styles.distributionHeader}>
              <View style={styles.distributionCopy}>
                <Text style={styles.eyebrow}>Distribución muscular</Text>
                <Text style={styles.distributionTitle}>Así se reparte el bloque de hoy</Text>
              </View>
              <Pressable
                onPress={handleEditRoutine}
                style={styles.inlineAdaptChip}
                accessibilityRole="button"
                accessibilityLabel="Editar entrenamiento"
                accessibilityHint="Abre el editor de la rutina actual."
                hitSlop={8}
              >
                <Text style={styles.inlineAdaptChipText}>Editar</Text>
              </Pressable>
            </View>

            <MuscleSilhouette
              musclesWorked={muscleDistribution.muscles}
              counts={muscleDistribution.counts}
              sex={profile?.gender ?? 'male'}
              height={210}
              showSummary={false}
            />

            <View style={styles.focusRow}>
              {muscleDistribution.focus.map((item) => (
                <View key={`${item.label}-${item.percent}`} style={styles.focusChip}>
                  <Text style={styles.focusLabel}>{item.label}</Text>
                  <Text style={styles.focusPercent}>{item.percent}%</Text>
                </View>
              ))}
            </View>

            {workoutLimitations.length ? (
              <View style={styles.limitationsCard}>
                <Text style={styles.limitationsTitle}>Zonas a cuidar hoy</Text>
                <Text style={styles.limitationsBody}>
                  Vyra deja visible que conviene cuidar{' '}
                  {workoutLimitations.map(formatWorkoutLimitationLabel).join(', ')} antes de arrancar o adaptar la rutina.
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        <Card style={styles.planCard} shadow={false}>
          <Text style={styles.eyebrow}>{selectedRoutine ? `${selectedRoutine.exercises.length} ejercicios` : 'Sesión libre'}</Text>
          <Text style={styles.planName}>{selectedRoutine ? 'Lo que vas a hacer' : routineName}</Text>
          <Text style={styles.planMeta}>
            {selectedRoutine
              ? 'Antes de empezar, puedes revisar el orden y la dosis real del bloque.'
              : 'Agrega ejercicios sobre la marcha y deja la sesión igualmente registrada.'}
          </Text>

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

        <Card style={styles.quickAddCard} shadow={false}>
          <Text style={styles.eyebrow}>Flexibilidad real</Text>
          <Text style={styles.quickAddTitle}>Si el bloque se queda corto, no te frenes.</Text>
          <Text style={styles.quickAddBody}>
            Dentro de la sesión tendrás el acceso &quot;Agregar rápido&quot; para sumar, reemplazar o saltar a un ejercicio ya cargado.
          </Text>
        </Card>

        <View style={styles.actions}>
          {selectedRoutine ? (
            <Button onPress={handleEditRoutine} variant="secondary" fullWidth disabled={countdownValue !== null}>
              Editar entrenamiento
            </Button>
          ) : null}
          <Button
            onPress={() => void handleStart()}
            fullWidth
            size="lg"
            loading={starting}
            disabled={countdownValue !== null}
          >
            Empezar
          </Button>
          {!selectedRoutine ? (
            <Button onPress={() => router.push(Routes.workout.index as never)} variant="ghost" fullWidth>
              Volver al hub
            </Button>
          ) : null}
        </View>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.bgPrimary, 0.92),
  },
  countdownRingOuter: {
    width: 280,
    height: 280,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 10,
    borderColor: withOpacity(Colors.action, 0.28),
    backgroundColor: withOpacity(Colors.surface2, 0.34),
    shadowColor: Colors.action,
    shadowOpacity: 0.24,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
  },
  countdownRingInner: {
    width: 224,
    height: 224,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    backgroundColor: withOpacity(Colors.bgPrimary, 0.84),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  countdownLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  countdownValue: {
    fontFamily: FontFamily.display,
    fontSize: 92,
    lineHeight: 96,
    color: Colors.textPrimary,
    letterSpacing: -3,
  },
  countdownMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
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
    backgroundColor: Colors.elevated,
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
    width: 74,
    height: 44,
  },
  adaptButton: {
    minHeight: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.secondary, 0.28),
    backgroundColor: withOpacity(Colors.secondary, 0.08),
    paddingHorizontal: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1.5],
  },
  adaptButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
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
  heroSubmeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  distributionCard: {
    gap: Spacing[3],
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.secondary, 0.18),
    backgroundColor: withOpacity(Colors.secondary, 0.06),
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  distributionCopy: {
    flex: 1,
    gap: 4,
  },
  distributionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  inlineAdaptChip: {
    minHeight: 34,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.secondary, 0.22),
    backgroundColor: withOpacity(Colors.secondary, 0.1),
    paddingHorizontal: Spacing[2.5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAdaptChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  focusChip: {
    minWidth: 86,
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: withOpacity(Colors.white, 0.04),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 2,
  },
  focusLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  focusPercent: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  limitationsCard: {
    gap: 4,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.warning, 0.18),
    backgroundColor: withOpacity(Colors.warning, 0.08),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  limitationsTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  limitationsBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.secondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  planCard: {
    gap: Spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
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
  exerciseList: {
    gap: Spacing[2],
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
  quickAddCard: {
    gap: Spacing[2],
    borderRadius: Radius['3xl'],
    backgroundColor: withOpacity(Colors.secondary, 0.08),
    borderColor: withOpacity(Colors.secondary, 0.16),
  },
  quickAddTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  quickAddBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing[2],
  },
});

