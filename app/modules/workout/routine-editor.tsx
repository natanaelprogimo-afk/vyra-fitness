import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout, type RoutineExercise } from '@/hooks/useWorkout';
import type { Routine } from '@/lib/workout-types';
import { estimateRoutineCalories } from '@/lib/workout-metrics';
import { useAuthStore } from '@/stores/authStore';
import { formatNumber } from '@/utils/formatters';

const SPLIT_OPTIONS = ['Full body', 'Upper', 'Lower', 'Push', 'Pull', 'Legs', 'Cardio', 'Core', 'Custom'];
const SET_TYPES = ['Normal', 'Superserie', 'Drop set', 'AMRAP', 'Por tiempo', 'EMOM'];
const REST_PRESETS = [60, 90, 120, 180];

function formatSetSummary(exercise: RoutineExercise) {
  const weight = exercise.weight_suggestion_kg ?? 0;
  return `${exercise.sets_target} × ${exercise.reps_target} @ ${weight} kg`;
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
  const params = useLocalSearchParams<{ routineId?: string }>();
  const { routines, exercises, updateRoutine, history, getSessionDetail } = useWorkout();
  const profile = useAuthStore((state) => state.profile);
  const routine = routines.find((item) => item.id === String(params.routineId ?? '')) ?? null;
  const [name, setName] = useState(routine?.name ?? '');
  const [description, setDescription] = useState(routine?.description ?? '');
  const [splitTag, setSplitTag] = useState(routine?.split_tag ?? 'Full body');
  const [duration, setDuration] = useState(String(routine?.estimated_duration_min ?? 45));
  const [selected, setSelected] = useState<RoutineExercise[]>(routine?.exercises ?? []);
  const [saving, setSaving] = useState(false);

  const formReady = useMemo(() => !!routine && name.trim().length >= 3 && selected.length > 0, [name, routine, selected.length]);

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

  const patchExercise = (exerciseId: string, patch: Partial<RoutineExercise>) => {
    setSelected((current) => current.map((item) => (item.exercise_id === exerciseId ? { ...item, ...patch } : item)));
  };

  const removeExercise = (exerciseId: string) => {
    setSelected((current) => current.filter((item) => item.exercise_id !== exerciseId));
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
      return copy;
    });
  };

  const summary = useMemo(() => {
    const totalSets = selected.reduce((sum, item) => sum + item.sets_target, 0);
    const totalVolume = selected.reduce(
      (sum, item) => sum + (item.weight_suggestion_kg ?? 0) * item.reps_target * item.sets_target,
      0,
    );
    const routineForEstimate: Routine | null = routine
      ?  {
          ...routine,
          exercises: selected,
          estimated_duration_min: Number(duration) || 45,
          name: name.trim(),
        }
      : null;
    const estimate = estimateRoutineCalories(routineForEstimate, exercises, profile);
    return {
      totalSets,
      totalVolume,
      minutes: estimate.minutes,
      calories: estimate.total,
    };
  }, [duration, exercises, name, profile, routine, selected]);

  const handleSave = async () => {
    if (!routine || !formReady) return;
    setSaving(true);
    const ok = await updateRoutine(routine.id, {
      name: name.trim(),
      description: description.trim() || null,
      split_tag: splitTag.trim() || null,
      estimated_duration_min: Number(duration) || 45,
      exercises: selected.map((item, index) => ({ ...item, order: index })),
    });
    setSaving(false);
    if (ok) router.back();
  };

  if (!routine) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header eyebrow="Entreno" title="Editar rutina" color={Colors.workout} />
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Rutina no disponible</Text>
          </Card>
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title="Editar rutina" color={Colors.workout} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} decorative style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Edición fina</Text>
          <Text style={styles.heroTitle}>Ajustá el bloque sin perder contexto de volumen, tiempo y energía.</Text>
          <Text style={styles.heroBody}>La idea acá es que todo sea más claro: menos ruido visual y más control real sobre cada ejercicio.</Text>
        </Card>

        <Card accentColor={Colors.workout} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Base</Text>
          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Nombre de rutina" />
          <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Resumen corto del bloque" />

          <Text style={styles.blockLabel}>Split</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {SPLIT_OPTIONS.map((option) => (
              <SelectPill key={option} label={option} active={splitTag === option} onPress={() => setSplitTag(option)} />
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <Input
              label="Minutos"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="45"
              style={styles.inputHalf}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ejercicios activos</Text>
          {selected.map((exercise) => {
            const lastSet = lastSetByExercise.get(exercise.exercise_id);
            return (
              <View key={exercise.exercise_id} style={styles.exerciseRow}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseCopy}>
                    <Text style={styles.exerciseTitle}>{exercise.exercise_name}</Text>
                    <Text style={styles.exerciseBody}>{formatSetSummary(exercise)}</Text>
                    {lastSet ? (
                      <Text style={styles.exerciseHint}>Último: {lastSet.weight_kg} kg × {lastSet.reps}</Text>
                    ) : null}
                  </View>

                  <View style={styles.exerciseActions}>
                    <Pressable
                      onPress={() => moveExercise(exercise.exercise_id, 'up')}
                      style={styles.iconButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Subir ${exercise.exercise_name}`}
                      accessibilityHint="Mueve este ejercicio una posición hacia arriba."
                      hitSlop={8}
                    >
                      <Ionicons name="chevron-up" size={16} color={Colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={() => moveExercise(exercise.exercise_id, 'down')}
                      style={styles.iconButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Bajar ${exercise.exercise_name}`}
                      accessibilityHint="Mueve este ejercicio una posición hacia abajo."
                      hitSlop={8}
                    >
                      <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={() => removeExercise(exercise.exercise_id)}
                      style={styles.iconButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar ${exercise.exercise_name}`}
                      accessibilityHint="Elimina este ejercicio de la rutina."
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
                    onChangeText={(value) => patchExercise(exercise.exercise_id, { sets_target: Number(value) || 0 })}
                    keyboardType="numeric"
                    style={styles.targetInput}
                  />
                  <Input
                    label="Reps"
                    value={String(exercise.reps_target)}
                    onChangeText={(value) => patchExercise(exercise.exercise_id, { reps_target: Number(value) || 0 })}
                    keyboardType="numeric"
                    style={styles.targetInput}
                  />
                  <Input
                    label="Kg"
                    value={String(exercise.weight_suggestion_kg ?? 0)}
                    onChangeText={(value) =>
                      patchExercise(exercise.exercise_id, { weight_suggestion_kg: Number(value) || 0 })
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

                <View style={styles.targetRow}>
                  <Input
                    label="RIR"
                    value={String(exercise.rir_target ?? '')}
                    onChangeText={(value) => patchExercise(exercise.exercise_id, { rir_target: Number(value) || 0 })}
                    keyboardType="numeric"
                    placeholder="0-4"
                    style={styles.targetInput}
                  />
                  <Input
                    label="RPE"
                    value={String(exercise.rpe_target ?? '')}
                    onChangeText={(value) => patchExercise(exercise.exercise_id, { rpe_target: Number(value) || 0 })}
                    keyboardType="numeric"
                    placeholder="6-10"
                    style={styles.targetInput}
                  />
                  <Input
                    label="Notas"
                    value={exercise.notes ?? ''}
                    onChangeText={(value) => patchExercise(exercise.exercise_id, { notes: value })}
                    placeholder="Técnica o lesión"
                    style={styles.targetInput}
                  />
                </View>
              </View>
            );
          })}
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
          Guardar cambios
        </Button>
      </ScrollView>
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
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  blockLabel: {
    marginTop: Spacing[2],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillRow: {
    gap: Spacing[2],
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: Colors.surface2,
  },
  pillActive: {
    borderColor: Colors.workout,
    backgroundColor: Colors.workoutBg,
  },
  pillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.workout,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  inputHalf: { flex: 1 },
  exerciseRow: {
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.06),
    gap: Spacing[2],
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  exerciseCopy: { flex: 1, gap: 4 },
  exerciseTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  exerciseBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  exerciseHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  exerciseActions: {
    gap: Spacing[1.5],
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  targetInput: { flex: 1, marginBottom: 0 },
  inlineRow: {
    gap: Spacing[2],
  },
  inlineBlock: {
    gap: Spacing[1],
  },
  inlineLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  inlinePills: {
    gap: Spacing[2],
  },
  summaryCard: {
    gap: Spacing[2],
    backgroundColor: Colors.surface2,
  },
  summaryTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  summaryValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
});

