import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getProfileContextMemory } from '@/lib/profile-context';
import {
  adjustRepsValue,
  adjustWeightValue,
  formatWorkoutSessionTime,
  parseWorkoutSetInput,
} from '@/lib/workout-session';
import { ExercisePickerModal } from './components/ExercisePickerModal';

function formatDaysAgo(iso: string) {
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'hace 1 dia';
  return `hace ${diff} dias`;
}

function formatRestClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function WorkoutSessionScreen() {
  const profile = useAuthStore((state) => state.profile);
  const setWorkoutActive = useUIStore((state) => state.setWorkoutActive);
  const {
    activeSession,
    exercises,
    history,
    addSet,
    cancelSession,
    finishSession,
    getSessionDetail,
    setCurrentExerciseIndex,
    settings,
    updateExerciseNote,
  } = useWorkout();
  const contextMemory = getProfileContextMemory(profile);
  const equipmentType =
    typeof contextMemory.equipment_type === 'string' ? contextMemory.equipment_type : null;

  const [reps, setReps] = useState('8');
  const [weight, setWeight] = useState('20.0');
  const [fullscreen, setFullscreen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [editField, setEditField] = useState<'weight' | 'reps' | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [prBanner, setPrBanner] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const lastRestRemainingRef = useRef(0);

  useEffect(() => {
    if (!activeSession) {
      router.replace(Routes.tabs.home as never);
    }
  }, [activeSession]);

  useEffect(() => {
    setWorkoutActive(Boolean(activeSession));
    return () => setWorkoutActive(false);
  }, [activeSession, setWorkoutActive]);

  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const exerciseIndex = activeSession?.currentExerciseIndex ?? 0;
  const currentExercise = activeSession?.exercises[exerciseIndex] ?? null;
  const currentSets =
    activeSession?.sets.filter((set) => set.exercise_id === currentExercise?.exercise_id) ?? [];
  const targetSets = currentExercise?.sets_target ?? 3;
  const targetReps = currentExercise?.reps_target ?? 8;
  const currentNote =
    currentExercise && activeSession?.exerciseNotes
      ? activeSession.exerciseNotes[currentExercise.exercise_id] ?? ''
      : '';
  const nextExercise = activeSession?.exercises[exerciseIndex + 1] ?? null;
  const restRemaining = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000)) : 0;

  useEffect(() => {
    setNoteDraft(currentNote);
  }, [currentNote]);

  useEffect(() => {
    if (!currentExercise) return;
    setReps(String(currentExercise.reps_target ?? 8));
    if (typeof currentExercise.weight_suggestion_kg === 'number') {
      setWeight(currentExercise.weight_suggestion_kg.toFixed(1));
    }
  }, [currentExercise?.exercise_id]);

  useEffect(() => {
    const previous = lastRestRemainingRef.current;

    if (restRemaining <= 0 && previous > 0) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else if (restRemaining === 5 && previous > 5) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } else if (restRemaining > 0 && restRemaining % 10 === 0 && restRemaining !== previous) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    lastRestRemainingRef.current = restRemaining;
  }, [restRemaining]);

  const previousPerformance = useMemo(() => {
    if (!currentExercise) return null;

    for (const session of history) {
      const detail = getSessionDetail(session.id);
      const sets = detail?.sets.filter((set) => set.exercise_id === currentExercise.exercise_id) ?? [];
      if (!sets.length) continue;
      const latestSet = sets[sets.length - 1];
      return {
        text: `Ultima vez: ${sets.length} x ${latestSet?.reps ?? 0} - ${latestSet?.weight_kg ?? 0} kg - ${formatDaysAgo(session.started_at)}`,
      };
    }

    return { text: 'Primera vez con este ejercicio' };
  }, [currentExercise, getSessionDetail, history]);

  const handleCompleteSet = useCallback(async () => {
    if (!currentExercise) return;
    const parsed = parseWorkoutSetInput(reps, weight);
    if (!parsed.isValid) return;

    const result = await addSet({
      exerciseId: currentExercise.exercise_id,
      reps: parsed.reps,
      weightKg: parsed.weight,
      restSec: currentExercise.rest_seconds ?? settings.defaultRestSeconds,
      notes: currentNote || null,
      setType: 'work',
    });

    const completedExercise = currentSets.length + 1 >= targetSets;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (completedExercise) {
      setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }, 100);
    }

    setRestEndsAt(Date.now() + (currentExercise.rest_seconds ?? settings.defaultRestSeconds) * 1000);

    if (result.isPr) {
      const bannerText = `Nuevo record en ${currentExercise.exercise_name} - ${parsed.weight.toFixed(1)} kg`;
      setPrBanner(bannerText);
      setTimeout(() => {
        setPrBanner((current) => (current === bannerText ? null : current));
      }, 3000);
    }

    if (completedExercise && exerciseIndex < (activeSession?.exercises.length ?? 1) - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
    }
  }, [
    activeSession?.exercises.length,
    addSet,
    currentExercise,
    currentNote,
    currentSets.length,
    exerciseIndex,
    reps,
    setCurrentExerciseIndex,
    settings.defaultRestSeconds,
    targetSets,
    weight,
  ]);

  const handleCancel = useCallback(() => {
    Alert.alert('Cancelar sesion', 'Se perderan los sets registrados en esta sesion.', [
      { text: 'Seguir', style: 'cancel' },
      {
        text: 'Cancelar sesion',
        style: 'destructive',
        onPress: async () => {
          await cancelSession();
          router.replace(Routes.tabs.home as never);
        },
      },
    ]);
  }, [cancelSession]);

  const handleFinish = useCallback(() => {
    Alert.alert('Terminar entrenamiento', 'Se cerrara la sesion actual.', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Terminar',
        style: 'destructive',
        onPress: async () => {
          const summary = await finishSession();
          if (!summary) return;
          router.replace({
            pathname: Routes.workout.done,
            params: {
              sessionId: summary.sessionId,
              duration: summary.durationMin,
              volume: summary.totalVolume,
              sets: summary.setsCount,
              prs: summary.prs.length,
              name: summary.name,
            },
          } as never);
        },
      },
    ]);
  }, [finishSession]);

  const saveNote = () => {
    if (!currentExercise) return;
    updateExerciseNote(currentExercise.exercise_id, noteDraft);
    setNoteOpen(false);
  };

  const openNumericEditor = (field: 'weight' | 'reps') => {
    setEditField(field);
    setEditDraft(field === 'weight' ? weight : reps);
  };

  const saveNumericEditor = () => {
    if (editField === 'weight') {
      const parsed = Number(editDraft.replace(',', '.'));
      if (Number.isFinite(parsed) && parsed >= 0) {
        setWeight(parsed.toFixed(1));
      }
    }

    if (editField === 'reps') {
      const parsed = Math.round(Number(editDraft.replace(',', '.')));
      if (Number.isFinite(parsed) && parsed > 0) {
        setReps(String(parsed));
      }
    }

    setEditField(null);
    setEditDraft('');
  };

  if (!activeSession || !currentExercise) return null;

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <StatusBar hidden={fullscreen} />
      <Stack.Screen options={{ gestureEnabled: false }} />

      {prBanner ? (
        <View style={styles.prBanner}>
          <Text style={styles.prBannerText}>{prBanner}</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>X</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {activeSession.name}
        </Text>
        <Pressable onPress={() => setFullscreen((value) => !value)} style={styles.headerButton}>
          <Text style={styles.headerUtility}>{fullscreen ? 'Salir' : 'Full'}</Text>
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((exerciseIndex + Math.min(1, currentSets.length / Math.max(1, targetSets))) / Math.max(1, activeSession.exercises.length)) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sessionBar}>
          <Text style={styles.sessionMeta}>{activeSession.name}</Text>
          <Text style={styles.sessionTimer}>{formatWorkoutSessionTime(elapsedSeconds)}</Text>
        </View>

        <View style={styles.exerciseBlock}>
          <Text style={styles.exerciseLabel}>Ejercicio {exerciseIndex + 1} de {activeSession.exercises.length}</Text>
          <View style={styles.exerciseTitleRow}>
            <Text style={styles.exerciseTitle}>{currentExercise.exercise_name}</Text>
            <Pressable onPress={() => setPickerOpen(true)} onLongPress={() => setNoteOpen(true)} style={styles.swapButton}>
              <Ionicons name="swap-horizontal-outline" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
          <Text style={styles.exerciseConfig}>
            {targetSets} series x {targetReps} reps
            {typeof currentExercise.weight_suggestion_kg === 'number'
              ? ` - ${currentExercise.weight_suggestion_kg.toFixed(1)} kg`
              : ''}
          </Text>
          <Text style={styles.exercisePrevious}>{previousPerformance?.text}</Text>
          {currentNote ? <Text style={styles.notePreview}>Nota: {currentNote}</Text> : null}
        </View>

        <Card style={styles.seriesCard} shadow={false}>
          <View style={styles.seriesHeader}>
            <Text style={styles.seriesHeaderText}>N</Text>
            <Text style={styles.seriesHeaderText}>Reps</Text>
            <Text style={styles.seriesHeaderText}>Peso</Text>
            <Text style={styles.seriesHeaderText}>OK</Text>
          </View>

          {Array.from({ length: targetSets }, (_, index) => {
            const set = currentSets[index] ?? null;
            const isActive = index === currentSets.length && currentSets.length < targetSets;
            const isDone = Boolean(set);

            return (
              <View key={index} style={[styles.seriesRow, isActive && styles.seriesRowActive, isDone && styles.seriesRowDone]}>
                <Text style={[styles.seriesCell, isActive && styles.seriesCellActive]}>{index + 1}</Text>
                <Text style={[styles.seriesCell, isActive && styles.seriesCellActive]}>{set?.reps ?? '--'}</Text>
                <Text style={[styles.seriesCell, isActive && styles.seriesCellActive]}>
                  {typeof set?.weight_kg === 'number' ? `${set.weight_kg.toFixed(1)} kg` : '--'}
                </Text>
                <Text style={[styles.seriesCell, isDone && styles.seriesCellDone]}>{isDone ? 'OK' : ''}</Text>
              </View>
            );
          })}
        </Card>
      </ScrollView>

      <View style={styles.bottomCard}>
        {restRemaining > 0 ? (
          <View style={styles.restWrap}>
            <View style={styles.restCircle}>
              <Text style={styles.restTime}>{formatRestClock(restRemaining)}</Text>
            </View>
            <Text style={styles.restLabel}>Descanso</Text>
            {nextExercise ? <Text style={styles.nextExercise}>Sigue: {nextExercise.exercise_name}</Text> : null}
            <Pressable onPress={() => setRestEndsAt(null)}>
              <Text style={styles.skipRest}>Saltar descanso</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.inputRow}>
              <View style={styles.valueField}>
                <Text style={styles.valueLabel}>Peso</Text>
                <View style={styles.adjustRow}>
                  <Pressable style={styles.adjustButton} onPress={() => setWeight(adjustWeightValue(weight, -2.5))}>
                    <Text style={styles.adjustButtonText}>-</Text>
                  </Pressable>
                  <Pressable style={styles.valueCore} onLongPress={() => openNumericEditor('weight')}>
                    <Text style={styles.valueNumber}>{weight}</Text>
                    <Text style={styles.valueUnit}>kg</Text>
                  </Pressable>
                  <Pressable style={styles.adjustButton} onPress={() => setWeight(adjustWeightValue(weight, 2.5))}>
                    <Text style={styles.adjustButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.valueField}>
                <Text style={styles.valueLabel}>Reps</Text>
                <View style={styles.adjustRow}>
                  <Pressable style={styles.adjustButton} onPress={() => setReps(adjustRepsValue(reps, -1))}>
                    <Text style={styles.adjustButtonText}>-</Text>
                  </Pressable>
                  <Pressable style={styles.valueCore} onLongPress={() => openNumericEditor('reps')}>
                    <Text style={styles.valueNumber}>{reps}</Text>
                  </Pressable>
                  <Pressable style={styles.adjustButton} onPress={() => setReps(adjustRepsValue(reps, 1))}>
                    <Text style={styles.adjustButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Button onPress={() => void handleCompleteSet()} fullWidth size="lg" haptic="medium">
              Completar set
            </Button>
          </>
        )}

        <View style={styles.footerRow}>
          <Pressable disabled={exerciseIndex === 0} onPress={() => setCurrentExerciseIndex(Math.max(0, exerciseIndex - 1))}>
            <Text style={[styles.navText, exerciseIndex === 0 && styles.navTextDisabled]}>Anterior</Text>
          </Pressable>

          <View style={styles.dotRow}>
            {activeSession.exercises.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.exerciseDot,
                  index < exerciseIndex && styles.exerciseDotDone,
                  index === exerciseIndex && styles.exerciseDotActive,
                ]}
              />
            ))}
          </View>

          <Pressable
            disabled={exerciseIndex >= activeSession.exercises.length - 1}
            onPress={() => setCurrentExerciseIndex(Math.min(activeSession.exercises.length - 1, exerciseIndex + 1))}
          >
            <Text
              style={[
                styles.navText,
                exerciseIndex >= activeSession.exercises.length - 1 && styles.navTextDisabled,
              ]}
            >
              Siguiente
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={handleFinish} style={styles.finishLink}>
          <Text style={styles.finishLinkText}>Terminar entrenamiento</Text>
        </Pressable>
      </View>

      <ExercisePickerModal
        visible={pickerOpen}
        exercises={exercises}
        equipmentType={equipmentType}
        onClose={() => setPickerOpen(false)}
        onSelect={(exercise) => {
          const existingIndex = activeSession.exercises.findIndex((item) => item.exercise_id === exercise.id);
          if (existingIndex >= 0) {
            setCurrentExerciseIndex(existingIndex);
          }
          setPickerOpen(false);
        }}
      />

      <Modal visible={noteOpen} transparent animationType="fade" onRequestClose={() => setNoteOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Nota para {currentExercise.exercise_name}</Text>
            <TextInput
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="Como se sintio este ejercicio"
              placeholderTextColor={Colors.textMuted}
              multiline
              style={styles.noteInput}
            />
            <Button onPress={saveNote} fullWidth>
              Guardar nota
            </Button>
            <Button onPress={() => setNoteOpen(false)} variant="ghost" fullWidth>
              Cerrar
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={editField !== null} transparent animationType="fade" onRequestClose={() => setEditField(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editField === 'weight' ? 'Editar peso' : 'Editar reps'}</Text>
            <TextInput
              value={editDraft}
              onChangeText={setEditDraft}
              placeholder={editField === 'weight' ? 'Peso en kg' : 'Cantidad de reps'}
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              style={styles.singleValueInput}
            />
            <Button onPress={saveNumericEditor} fullWidth>
              Guardar valor
            </Button>
            <Button onPress={() => setEditField(null)} variant="ghost" fullWidth>
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.bgPrimary,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontFamily: FontFamily.regular,
    fontSize: 22,
    color: Colors.textSecondary,
  },
  headerUtility: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.bgOverlay,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.action,
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: 340,
    gap: Spacing[5],
  },
  sessionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sessionTimer: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  exerciseBlock: {
    gap: Spacing[2],
  },
  exerciseLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  exerciseTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  exerciseConfig: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  exercisePrevious: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  notePreview: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  seriesCard: {
    gap: Spacing[2],
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  seriesHeaderText: {
    width: '22%',
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seriesRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.05),
  },
  seriesRowActive: {
    backgroundColor: withOpacity(Colors.action, 0.12),
    borderLeftWidth: 3,
    borderLeftColor: Colors.action,
  },
  seriesRowDone: {
    backgroundColor: Colors.bgElevated,
  },
  seriesCell: {
    width: '22%',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  seriesCellActive: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
  },
  seriesCellDone: {
    color: Colors.action,
    fontFamily: FontFamily.semibold,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.08),
    gap: Spacing[3],
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  valueField: {
    flex: 1,
    gap: Spacing[2],
  },
  valueLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  adjustRow: {
    minHeight: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[3],
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  valueCore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 56,
    paddingHorizontal: Spacing[2],
  },
  valueNumber: {
    fontFamily: FontFamily.display,
    fontSize: 44,
    color: Colors.textPrimary,
    lineHeight: 46,
  },
  valueUnit: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  restWrap: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  restCircle: {
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    borderWidth: 10,
    borderColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  restTime: {
    fontFamily: FontFamily.mono,
    fontSize: 32,
    color: Colors.textPrimary,
  },
  restLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  nextExercise: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  skipRest: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  navText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  navTextDisabled: {
    color: Colors.textMuted,
  },
  dotRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  exerciseDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  exerciseDotActive: {
    width: 10,
    height: 10,
    backgroundColor: Colors.action,
  },
  exerciseDotDone: {
    backgroundColor: withOpacity(Colors.action, 0.4),
  },
  finishLink: {
    alignItems: 'center',
  },
  finishLinkText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
  },
  modalSheet: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  modalTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  noteInput: {
    minHeight: 120,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  singleValueInput: {
    minHeight: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[4],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  prBanner: {
    position: 'absolute',
    left: Spacing[5],
    right: Spacing[5],
    top: Spacing[4],
    zIndex: 20,
    borderRadius: Radius.md,
    backgroundColor: Colors.successBg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.22),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  prBannerText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.success,
  },
});
