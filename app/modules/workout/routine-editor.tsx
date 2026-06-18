import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout, type RoutineExercise } from '@/hooks/useWorkout';
import type { Exercise, Routine } from '@/lib/workout-types';
import { estimateRoutineCalories } from '@/lib/workout-metrics';
import { useAuthStore } from '@/stores/authStore';
import { formatNumber } from '@/utils/formatters';
import { ExercisePickerModal } from './components/ExercisePickerModal';

const SPLIT_OPTIONS = ['Full body', 'Upper', 'Lower', 'Push', 'Pull', 'Legs', 'Cardio', 'Core', 'Custom'];
const SET_TYPES = ['Normal', 'Superserie', 'Drop set', 'AMRAP', 'Por tiempo', 'EMOM'];
const REST_PRESETS = [60, 90, 120, 180];

function formatSetSummary(exercise: RoutineExercise) {
  const weight = exercise.weight_suggestion_kg ?? 0;
  return `${exercise.sets_target} x ${exercise.reps_target} @ ${weight} kg`;
}

function sanitizePositiveInt(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^\d]/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed);
}

function sanitizeNonNegative(value: string, fallback: number) {
  const parsed = Number(value.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

function toRoutineExercise(exercise: Exercise, order: number, defaultRestSeconds: number): RoutineExercise {
  return {
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    sets_target: exercise.type === 'cardio' ? 2 : 3,
    reps_target: exercise.type === 'cardio' ? 2 : 10,
    weight_suggestion_kg:
      exercise.type === 'bodyweight' || exercise.type === 'cardio' ? 0 : 20,
    order,
    rest_seconds: defaultRestSeconds,
    set_type: 'Normal',
  };
}

function SelectPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={8}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function WorkoutRoutineEditorScreen() {
  const params = useLocalSearchParams<{ routineId?: string; seedExerciseId?: string }>();
  const {
    routines,
    exercises,
    favoriteExerciseIds,
    settings,
    createRoutine,
    updateRoutine,
    history,
    getSessionDetail,
  } = useWorkout();
  const profile = useAuthStore((state) => state.profile);
  const routineId = typeof params.routineId === 'string' ? params.routineId : '';
  const seedExerciseId = typeof params.seedExerciseId === 'string' ? params.seedExerciseId : '';
  const routine = routines.find((item) => item.id === routineId) ?? null;
  const seedExercise = exercises.find((item) => item.id === seedExerciseId) ?? null;

  const [name, setName] = useState(
    routine?.name ?? (seedExercise ? `Rutina ${seedExercise.name}` : 'Nueva rutina'),
  );
  const [description, setDescription] = useState(routine?.description ?? '');
  const [splitTag, setSplitTag] = useState(routine?.split_tag ?? 'Full body');
  const [duration, setDuration] = useState(String(routine?.estimated_duration_min ?? 45));
  const [selected, setSelected] = useState<RoutineExercise[]>(routine?.exercises ?? []);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!seedExercise) return;
    setSelected((current) => {
      if (current.some((item) => item.exercise_id === seedExercise.id)) return current;
      return [...current, toRoutineExercise(seedExercise, current.length, settings.defaultRestSeconds)];
    });
  }, [seedExercise, settings.defaultRestSeconds]);

  const formReady = useMemo(() => name.trim().length >= 3 && selected.length > 0, [name, selected.length]);

  const lastSetByExercise = useMemo(() => {
    const map = new Map<string, { weight_kg: number; reps: number }>();
    history.forEach((entry) => {
      const detail = getSessionDetail(entry.id);
      detail?.sets.forEach((set) => {
        if (!map.has(set.exercise_id)) {
          map.set(set.exercise_id, { weight_kg: set.weight_kg, reps: set.reps });
        }
      });
    });
    return map;
  }, [getSessionDetail, history]);
  const recentExerciseIds = useMemo(() => {
    const ids: string[] = [];
    for (const entry of history) {
      const detail = getSessionDetail(entry.id);
      for (const set of detail?.sets ?? []) {
        if (ids.includes(set.exercise_id)) continue;
        ids.push(set.exercise_id);
        if (ids.length >= 12) return ids;
      }
    }
    return ids;
  }, [getSessionDetail, history]);

  const patchExercise = (exerciseId: string, patch: Partial<RoutineExercise>) => {
    setSelected((current) =>
      current.map((item) => (item.exercise_id === exerciseId ? { ...item, ...patch } : item)),
    );
  };

  const removeExercise = (exerciseId: string) => {
    setSelected((current) =>
      current
        .filter((item) => item.exercise_id !== exerciseId)
        .map((item, index) => ({ ...item, order: index })),
    );
  };

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    setSelected((current) => {
      const index = current.findIndex((item) => item.exercise_id === exerciseId);
      if (index < 0) return current;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [removed] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, removed);
      return copy.map((item, order) => ({ ...item, order }));
    });
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelected((current) => {
      const existingIndex = current.findIndex((item) => item.exercise_id === exercise.id);
      if (existingIndex >= 0) return current;
      return [...current, toRoutineExercise(exercise, current.length, settings.defaultRestSeconds)];
    });
    setPickerOpen(false);
  };

  const summary = useMemo(() => {
    const totalSets = selected.reduce((sum, item) => sum + item.sets_target, 0);
    const totalVolume = selected.reduce(
      (sum, item) => sum + (item.weight_suggestion_kg ?? 0) * item.reps_target * item.sets_target,
      0,
    );
    const routineForEstimate: Routine = {
      id: routine?.id ?? 'draft',
      name: name.trim() || 'Rutina',
      description: description.trim() || null,
      split_tag: splitTag.trim() || null,
      estimated_duration_min: Number(duration) || 45,
      schedule_day: routine?.schedule_day ?? null,
      goal_tag: routine?.goal_tag ?? null,
      is_primary: routine?.is_primary ?? false,
      exercises: selected,
      source: routine?.source ?? 'user',
    };
    const estimate = estimateRoutineCalories(routineForEstimate, exercises, profile);
    return {
      totalSets,
      totalVolume,
      minutes: estimate.minutes,
      calories: estimate.total,
    };
  }, [description, duration, exercises, name, profile, routine, selected, splitTag]);

  const handleSave = async () => {
    if (!formReady) return;

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      split_tag: splitTag.trim() || null,
      estimated_duration_min: Number(duration) || 45,
      exercises: selected.map((item, index) => ({ ...item, order: index })),
    };

    try {
      if (routine) {
        const ok = await updateRoutine(routine.id, payload);
        if (ok) router.back();
        return;
      }

      const createdId = await createRoutine({
        ...payload,
        is_primary: false,
      });
      if (createdId) {
        router.replace({
          pathname: Routes.workout.routineEditor,
          params: { routineId: createdId },
        } as never);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        eyebrow="Entreno"
        title={routine ? 'Editar rutina' : 'Nueva rutina'}
        color={Colors.workout}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} decorative style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>{routine ? 'Edicion fina' : 'Construccion guiada'}</Text>
          <Text style={styles.heroTitle}>
            {routine
              ? 'Ajusta el bloque sin perder contexto de volumen, tiempo y energia.'
              : 'Crea una rutina real y sumale ejercicios sin salir del flujo.'}
          </Text>
          <Text style={styles.heroBody}>
            {routine
              ? 'Menos ruido visual y mas control sobre cada ejercicio.'
              : 'Puedes empezar vacio o sembrar esta rutina desde un ejercicio puntual.'}
          </Text>
        </Card>

        <Card accentColor={Colors.workout} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Base</Text>
          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Nombre de rutina" />
          <Input
            label="Descripcion"
            value={description}
            onChangeText={setDescription}
            placeholder="Resumen corto del bloque"
          />

          <Text style={styles.blockLabel}>Split</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {SPLIT_OPTIONS.map((option) => (
              <SelectPill
                key={option}
                label={option}
                active={splitTag === option}
                onPress={() => setSplitTag(option)}
              />
            ))}
          </ScrollView>

          <Input
            label="Minutos"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="45"
            style={styles.durationInput}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ejercicios activos</Text>
            <Button onPress={() => setPickerOpen(true)} variant="secondary" color={Colors.workout}>
              Agregar ejercicio
            </Button>
          </View>

          {selected.length ? (
            selected.map((exercise) => {
              const lastSet = lastSetByExercise.get(exercise.exercise_id);
              return (
                <View key={exercise.exercise_id} style={styles.exerciseRow}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseCopy}>
                      <Text style={styles.exerciseTitle}>{exercise.exercise_name}</Text>
                      <Text style={styles.exerciseBody}>{formatSetSummary(exercise)}</Text>
                      {lastSet ? (
                        <Text style={styles.exerciseHint}>
                          Ultimo: {lastSet.weight_kg} kg x {lastSet.reps}
                        </Text>
                      ) : (
                        <Text style={styles.exerciseHint}>Todavia no tiene historial en esta cuenta.</Text>
                      )}
                    </View>

                    <View style={styles.exerciseActions}>
                      <Pressable
                        onPress={() => moveExercise(exercise.exercise_id, 'up')}
                        style={styles.iconButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Subir ${exercise.exercise_name}`}
                        hitSlop={8}
                      >
                        <Ionicons name="chevron-up" size={16} color={Colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => moveExercise(exercise.exercise_id, 'down')}
                        style={styles.iconButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Bajar ${exercise.exercise_name}`}
                        hitSlop={8}
                      >
                        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => removeExercise(exercise.exercise_id)}
                        style={styles.iconButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Quitar ${exercise.exercise_name}`}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.targetRow}>
                    <Input
                      label="Series"
                      value={String(exercise.sets_target)}
                      onChangeText={(value) =>
                        patchExercise(exercise.exercise_id, {
                          sets_target: sanitizePositiveInt(value, exercise.sets_target || 1),
                        })
                      }
                      keyboardType="numeric"
                      style={styles.targetInput}
                    />
                    <Input
                      label="Reps"
                      value={String(exercise.reps_target)}
                      onChangeText={(value) =>
                        patchExercise(exercise.exercise_id, {
                          reps_target: sanitizePositiveInt(value, exercise.reps_target || 1),
                        })
                      }
                      keyboardType="numeric"
                      style={styles.targetInput}
                    />
                    <Input
                      label="Kg"
                      value={String(exercise.weight_suggestion_kg ?? 0)}
                      onChangeText={(value) =>
                        patchExercise(exercise.exercise_id, {
                          weight_suggestion_kg: sanitizeNonNegative(
                            value,
                            exercise.weight_suggestion_kg ?? 0,
                          ),
                        })
                      }
                      keyboardType="numeric"
                      style={styles.targetInput}
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <View style={styles.inlineBlock}>
                      <Text style={styles.inlineLabel}>Descanso</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inlinePills}>
                        {REST_PRESETS.map((rest) => (
                          <SelectPill
                            key={rest}
                            label={`${rest}s`}
                            active={(exercise.rest_seconds ?? 90) === rest}
                            onPress={() => patchExercise(exercise.exercise_id, { rest_seconds: rest })}
                          />
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.inlineBlock}>
                      <Text style={styles.inlineLabel}>Tipo</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inlinePills}>
                        {SET_TYPES.map((item) => (
                          <SelectPill
                            key={item}
                            label={item}
                            active={(exercise.set_type ?? 'Normal') === item}
                            onPress={() => patchExercise(exercise.exercise_id, { set_type: item })}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  <Input
                    label="Bloque"
                    value={exercise.group_label ?? ''}
                    onChangeText={(value) =>
                      patchExercise(exercise.exercise_id, { group_label: value.trim() || null })
                    }
                    placeholder="Ej. Superset A o Finisher"
                  />

                  <View style={styles.targetRow}>
                    <Input
                      label="RIR"
                      value={String(exercise.rir_target ?? '')}
                      onChangeText={(value) =>
                        patchExercise(exercise.exercise_id, {
                          rir_target: sanitizeNonNegative(value, exercise.rir_target ?? 0),
                        })
                      }
                      keyboardType="numeric"
                      placeholder="0-4"
                      style={styles.targetInput}
                    />
                    <Input
                      label="RPE"
                      value={String(exercise.rpe_target ?? '')}
                      onChangeText={(value) =>
                        patchExercise(exercise.exercise_id, {
                          rpe_target: sanitizeNonNegative(value, exercise.rpe_target ?? 0),
                        })
                      }
                      keyboardType="numeric"
                      placeholder="6-10"
                      style={styles.targetInput}
                    />
                    <Input
                      label="Notas"
                      value={exercise.notes ?? ''}
                      onChangeText={(value) => patchExercise(exercise.exercise_id, { notes: value })}
                      placeholder="Tecnica o lesion"
                      style={styles.targetInput}
                    />
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>Todavia no hay ejercicios</Text>
              <Text style={styles.emptyBody}>
                Empieza agregando el primero. Desde aqui ya puedes construir una rutina completa.
              </Text>
            </View>
          )}
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del bloque</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>{formatNumber(summary.totalVolume)} kg</Text>
            <Text style={styles.summaryValue}>~{summary.calories} kcal</Text>
            <Text style={styles.summaryValue}>{summary.totalSets} series</Text>
            <Text style={styles.summaryValue}>~{summary.minutes} min</Text>
          </View>
        </Card>

        <Button onPress={() => void handleSave()} loading={saving} disabled={!formReady} fullWidth color={Colors.workout}>
          {routine ? 'Guardar cambios' : 'Crear rutina'}
        </Button>
      </ScrollView>

      <ExercisePickerModal
        visible={pickerOpen}
        exercises={exercises}
        activeExerciseIds={selected.map((exercise) => exercise.exercise_id)}
        favoriteExerciseIds={favoriteExerciseIds}
        recentExerciseIds={recentExerciseIds}
        activeLabel="Ya en rutina"
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectExercise}
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
  heroCard: {
    gap: Spacing[2],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.workout,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionCard: {
    gap: Spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  blockLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing[1],
  },
  pillRow: {
    gap: Spacing[2],
    paddingVertical: Spacing[1],
  },
  pill: {
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.elevated,
  },
  pillActive: {
    backgroundColor: withOpacity(Colors.workout, 0.12),
    borderColor: Colors.workout,
  },
  pillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.textPrimary,
  },
  durationInput: {
    marginTop: Spacing[2],
  },
  emptyBlock: {
    gap: Spacing[1],
    paddingVertical: Spacing[2],
  },
  emptyTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  exerciseRow: {
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  exerciseCopy: {
    flex: 1,
    gap: 4,
  },
  exerciseTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  exerciseBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.workout,
  },
  exerciseHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  targetInput: {
    flex: 1,
  },
  inlineRow: {
    gap: Spacing[3],
  },
  inlineBlock: {
    gap: Spacing[2],
  },
  inlineLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  inlinePills: {
    gap: Spacing[2],
  },
  summaryCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.workout, 0.06),
    borderColor: withOpacity(Colors.workout, 0.16),
  },
  summaryTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  summaryValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

