import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import ExerciseMediaSheet from '@/components/workout/ExerciseMediaSheet';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { useAuthStore } from '@/stores/authStore';
import { formatNumber } from '@/utils/formatters';

function estimateSetCalories(weightKg: number, type?: string | null) {
  const base = type === 'cardio' ? 6 : 8;
  return Math.round(base * Math.max(0.7, weightKg / 80));
}

function BulletList({
  title,
  items,
  tint,
}: {
  title: string;
  items: string[];
  tint: string;
}) {
  if (!items.length) return null;
  return (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: tint }]} />
          <Text style={styles.listItem}>{item}</Text>
        </View>
      ))}
    </Card>
  );
}

export default function WorkoutExerciseDetailScreen() {
  const params = useLocalSearchParams<{ exerciseId?: string }>();
  const {
    exercises,
    routines,
    history,
    getSessionDetail,
    getPersonalRecord,
    toggleFavoriteExercise,
    favoriteExerciseIds,
  } = useWorkout();
  const profile = useAuthStore((state) => state.profile);
  const [mediaOpen, setMediaOpen] = React.useState(false);

  const exercise = exercises.find((item) => item.id === String(params.exerciseId ?? '')) ?? null;
  const relatedRoutines = useMemo(
    () => routines.filter((routine) => routine.exercises.some((entry) => entry.exercise_id === exercise?.id)),
    [exercise?.id, routines],
  );
  const relatedSets = useMemo(() => {
    if (!exercise) return [];
    return history
      .map((entry) => getSessionDetail(entry.id))
      .flatMap((detail) => detail?.sets ?? [])
      .filter((set) => set.exercise_id === exercise.id);
  }, [exercise, getSessionDetail, history]);
  const pr = exercise ? getPersonalRecord(exercise.id) : null;
  const isFavorite = exercise ? favoriteExerciseIds.includes(exercise.id) : false;

  if (!exercise) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header eyebrow="Entreno" title="Detalle de ejercicio" color={Colors.workout} />
        <ScrollView contentContainerStyle={styles.emptyContainer} showsVerticalScrollIndicator={false}>
          <Card accentColor={Colors.workout} style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Ejercicio no disponible</Text>
            <Text style={styles.emptyBody}>
              Puede que haya sido eliminado o que todavia no exista en tu biblioteca.
            </Text>
          </Card>
        </ScrollView>
      </SafeScreen>
    );
  }

  const profileWeight = profile?.weight_current_kg ?? profile?.weight_start_kg ?? 80;
  const setCalories = estimateSetCalories(profileWeight, exercise.type);
  const lastSet = relatedSets[relatedSets.length - 1] ?? null;
  const totalVolume = relatedSets.reduce((sum, set) => sum + set.weight_kg * set.reps, 0);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title={exercise.name} color={Colors.workout} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} decorative style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>{exercise.muscle_group}</Text>
          <Text style={styles.heroBody}>
            {exercise.description?.trim() || exercise.instructions || 'Todavia no hay una descripcion extendida para este ejercicio.'}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>Equipo: {exercise.equipment}</Text>
            </View>
            {exercise.difficulty_level ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>{exercise.difficulty_level}</Text>
              </View>
            ) : null}
            {exercise.type ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>{exercise.type}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <Button
              onPress={() => toggleFavoriteExercise(exercise.id)}
              variant={isFavorite ? 'primary' : 'secondary'}
              color={Colors.workout}
              style={styles.flexButton}
            >
              {isFavorite ? 'En favoritos' : 'Guardar favorito'}
            </Button>
            <Button
              onPress={() =>
                router.push({
                  pathname: Routes.workout.exercises,
                  params: { seedExerciseId: exercise.id },
                } as never)
              }
              variant="secondary"
              color={Colors.workout}
              style={styles.flexButton}
            >
              Crear variante
            </Button>
          </View>

          <Button
            onPress={() =>
              router.push({ pathname: Routes.workout.routineEditor, params: { seedExerciseId: exercise.id } } as never)
            }
            variant="ghost"
            color={Colors.textPrimary}
            fullWidth
          >
            Usar en rutina
          </Button>
        </Card>

        {(exercise.video_url ||
          exercise.gif_url ||
          exercise.cues?.length ||
          exercise.instructions?.trim() ||
          exercise.mistakes?.length ||
          exercise.variations?.length) ? (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Referencia rápida</Text>
            <Text style={styles.resourceBody}>
              Si ya guardaste media o cues técnicos, puedes abrirlos desde aquí sin salir a buscarlos afuera.
            </Text>
            <View style={styles.resourceActions}>
              <Button
                onPress={() => setMediaOpen(true)}
                variant="primary"
                color={Colors.workout}
                style={styles.flexButton}
              >
                {exercise.video_url || exercise.gif_url ? 'Ver dentro de Vyra' : 'Abrir técnica'}
              </Button>
              {exercise.video_url || exercise.gif_url ? (
                <Button
                  onPress={() => setMediaOpen(true)}
                  variant="secondary"
                  color={Colors.workout}
                  style={styles.flexButton}
                >
                  Abrir referencia
                </Button>
              ) : null}
            </View>
          </Card>
        ) : null}

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tu progreso</Text>
          <View style={styles.prRow}>
            <View style={styles.prBox}>
              <Text style={styles.prValue}>{pr?.maxWeight ?? 0}</Text>
              <Text style={styles.prLabel}>kg maximos</Text>
            </View>
            <View style={styles.prBox}>
              <Text style={styles.prValue}>{pr?.maxReps ?? 0}</Text>
              <Text style={styles.prLabel}>reps maximas</Text>
            </View>
            <View style={styles.prBox}>
              <Text style={styles.prValue}>{formatNumber(totalVolume)}</Text>
              <Text style={styles.prLabel}>kg acumulados</Text>
            </View>
          </View>
          <View style={styles.quickInfo}>
            <Text style={styles.quickInfoText}>~{setCalories} kcal por serie a {profileWeight} kg</Text>
            <Text style={styles.quickInfoText}>
              {lastSet ? `Ultimo registro: ${lastSet.weight_kg} kg x ${lastSet.reps}` : 'Sin registros todavia'}
            </Text>
          </View>
        </Card>

        <BulletList title="Cues" items={exercise.cues ?? []} tint={Colors.workout} />
        <BulletList title="Errores comunes" items={exercise.mistakes ?? []} tint={Colors.warning} />
        <BulletList title="Variantes guardadas" items={exercise.variations ?? []} tint={Colors.info} />
        <BulletList title="Aliases" items={exercise.aliases ?? []} tint={Colors.textMuted} />

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rutinas donde aparece</Text>
          {relatedRoutines.length ? (
            relatedRoutines.map((routine) => (
              <View key={routine.id} style={styles.routineRow}>
                <View style={styles.routineCopy}>
                  <Text style={styles.routineTitle}>{routine.name}</Text>
                  <Text style={styles.routineBody}>
                    {routine.exercises.length} ejercicios · {routine.estimated_duration_min ?? 0} min
                  </Text>
                </View>
                <Button
                  onPress={() =>
                    router.push({ pathname: Routes.workout.routineEditor, params: { routineId: routine.id } } as never)
                  }
                  size="sm"
                  variant="secondary"
                  color={Colors.workout}
                >
                  Ver
                </Button>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHint}>Aun no lo usas en ninguna rutina guardada.</Text>
          )}
        </Card>
      </ScrollView>

      <ExerciseMediaSheet
        visible={mediaOpen}
        onClose={() => setMediaOpen(false)}
        exerciseName={exercise.name}
        videoUrl={exercise.video_url}
        gifUrl={exercise.gif_url}
        cues={exercise.cues}
        mistakes={exercise.mistakes}
        variations={exercise.variations}
        instructions={exercise.instructions}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  emptyContainer: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
  },
  emptyCard: { gap: Spacing[3] },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  heroCard: { gap: Spacing[3] },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.workout,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metaPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  metaText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  flexButton: { flex: 1 },
  sectionCard: { gap: Spacing[2] },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  resourceBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  prRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  prBox: {
    flex: 1,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  prValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.workout,
  },
  prLabel: {
    marginTop: 4,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  quickInfo: {
    gap: 6,
  },
  quickInfoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  listItem: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
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
  routineBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  emptyHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
