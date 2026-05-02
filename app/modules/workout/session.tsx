import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeScreen from '@/components/ui/SafeScreen';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';
import { useWorkout } from '@/hooks/useWorkout';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getProfileContextMemory } from '@/lib/profile-context';
import { ExercisePickerModal } from './components/ExercisePickerModal';

type DraftRow = {
  reps: string;
  weight: string;
};

function formatDaysAgo(iso: string) {
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'hace 1 día';
  return `hace ${diff} días`;
}

function formatRestClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatWeightValue(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--';
  return value % 1 === 0 ? `${value.toFixed(0)}kg` : `${value.toFixed(1)}kg`;
}

function formatPreviousSet(weight: number | null | undefined, reps: number | null | undefined) {
  if (typeof reps !== 'number' || !Number.isFinite(reps)) return '--';
  return `${formatWeightValue(weight)} x ${Math.round(reps)}`;
}

function parseDraftValue(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function buildInitialDraftRows(
  targetSets: number,
  targetReps: number,
  weightSuggestion: number | null | undefined,
  previousSets: Array<{ reps: number; weight_kg: number }>,
  currentSets: Array<{ reps: number; weight_kg: number }>,
): DraftRow[] {
  return Array.from({ length: targetSets }, (_, index) => {
    const current = currentSets[index] ?? null;
    const previous = previousSets[index] ?? null;
    const draftWeight =
      current?.weight_kg ??
      previous?.weight_kg ??
      (typeof weightSuggestion === 'number' ? weightSuggestion : 0);
    const draftReps = current?.reps ?? previous?.reps ?? targetReps;

    return {
      weight: draftWeight > 0 ? draftWeight.toFixed(draftWeight % 1 === 0 ? 0 : 1) : '0',
      reps: String(Math.max(1, draftReps)),
    };
  });
}

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((state) => state.profile);
  const setWorkoutActive = useUIStore((state) => state.setWorkoutActive);
  const {
    activeSession,
    exercises,
    history,
    addSet,
    cancelSession,
    finishSession,
    getPersonalRecord,
    getSessionDetail,
    setCurrentExerciseIndex,
    settings,
    updateExerciseNote,
  } = useWorkout();
  const contextMemory = getProfileContextMemory(profile);
  const equipmentType =
    typeof contextMemory.equipment_type === 'string' ? contextMemory.equipment_type : null;

  const [fullscreen, setFullscreen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [prBanner, setPrBanner] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [draftRows, setDraftRows] = useState<DraftRow[]>([]);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'finish' | null>(null);
  const [actionBusy, setActionBusy] = useState<'cancel' | 'finish' | null>(null);
  const [bottomCardHeight, setBottomCardHeight] = useState(0);
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

  const previousSets = useMemo(() => {
    if (!currentExercise) return [];

    for (const session of history) {
      const detail = getSessionDetail(session.id);
      const sets =
        detail?.sets
          .filter((set) => set.exercise_id === currentExercise.exercise_id)
          .sort((left, right) => left.set_number - right.set_number) ?? [];
      if (sets.length) return sets;
    }

    return [];
  }, [currentExercise, getSessionDetail, history]);

  const previousSessionLabel = useMemo(() => {
    if (!currentExercise) return 'Primera vez con este ejercicio';

    for (const session of history) {
      const detail = getSessionDetail(session.id);
      const sets = detail?.sets.filter((set) => set.exercise_id === currentExercise.exercise_id) ?? [];
      if (!sets.length) continue;
      const latestSet = sets[sets.length - 1] ?? null;
      return `Última vez: ${sets.length} series · ${formatPreviousSet(latestSet?.weight_kg, latestSet?.reps)} · ${formatDaysAgo(session.started_at)}`;
    }

    return 'Primera vez con este ejercicio';
  }, [currentExercise, getSessionDetail, history]);

  useEffect(() => {
    if (!currentExercise) return;
    setDraftRows(
      buildInitialDraftRows(
        targetSets,
        targetReps,
        currentExercise.weight_suggestion_kg,
        previousSets,
        currentSets,
      ),
    );
  }, [currentExercise?.exercise_id, currentExercise?.weight_suggestion_kg, previousSets, targetReps, targetSets]);

  useEffect(() => {
    setNoteDraft(currentNote);
  }, [currentNote]);

  useEffect(() => {
    const previous = lastRestRemainingRef.current;

    if (restRemaining <= 0 && previous > 0) {
      void triggerImpactHaptic('medium');
    } else if (restRemaining === 5 && previous > 5) {
      void triggerNotificationHaptic('warning');
    }

    lastRestRemainingRef.current = restRemaining;
  }, [restRemaining]);

  const currentRecord = useMemo(
    () => (currentExercise ? getPersonalRecord(currentExercise.exercise_id) : null),
    [currentExercise, getPersonalRecord],
  );

  const executeCancel = useCallback(async () => {
    setActionBusy('cancel');
    try {
      await cancelSession();
      setConfirmAction(null);
      router.replace(Routes.tabs.home as never);
    } finally {
      setActionBusy(null);
    }
  }, [cancelSession]);

  const executeFinish = useCallback(async () => {
    setActionBusy('finish');
    try {
      const summary = await finishSession();
      if (!summary) return;
      setConfirmAction(null);
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
    } finally {
      setActionBusy(null);
    }
  }, [finishSession]);

  const handleCancel = useCallback(() => {
    setConfirmAction('cancel');
  }, []);

  const handleFinish = useCallback(() => {
    setConfirmAction('finish');
  }, []);

  const handleUpdateDraft = (index: number, field: keyof DraftRow, value: string) => {
    setDraftRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]:
                field === 'reps'
                  ? value.replace(/[^\d]/g, '')
                  : value.replace(/[^0-9.,]/g, ''),
            }
          : row,
      ),
    );
  };

  const saveNote = () => {
    if (!currentExercise) return;
    updateExerciseNote(currentExercise.exercise_id, noteDraft);
    setNoteOpen(false);
  };

  const handleCompleteSet = async (index: number) => {
    if (!currentExercise || index !== currentSets.length) return;
    const row = draftRows[index] ?? null;
    if (!row) return;

    const reps = Math.round(parseDraftValue(row.reps));
    const weight = parseDraftValue(row.weight);
    if (!Number.isFinite(reps) || reps <= 0 || !Number.isFinite(weight) || weight < 0) return;

    const result = await addSet({
      exerciseId: currentExercise.exercise_id,
      reps,
      weightKg: weight,
      restSec: currentExercise.rest_seconds ?? settings.defaultRestSeconds,
      notes: currentNote || null,
      setType: 'work',
    });

    await triggerImpactHaptic('medium');
    setRestEndsAt(Date.now() + (currentExercise.rest_seconds ?? settings.defaultRestSeconds) * 1000);

    if (result.isPr) {
      const bannerText = `Nuevo PR en ${currentExercise.exercise_name}`;
      setPrBanner(bannerText);
      setTimeout(() => {
        setPrBanner((current) => (current === bannerText ? null : current));
      }, 2600);
    }

    const completedExercise = index + 1 >= targetSets;
    if (completedExercise && exerciseIndex < (activeSession?.exercises.length ?? 1) - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
    }
  };

  const progressWidth: `${number}%` = activeSession
    ? `${((exerciseIndex + Math.min(1, currentSets.length / Math.max(1, targetSets))) / Math.max(1, activeSession.exercises.length)) * 100}%`
    : '0%';

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

      {!fullscreen ? (
        <View style={styles.header}>
          <Pressable
            onPress={handleCancel}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Cancelar sesión"
            accessibilityHint="Abre una confirmación antes de descartar esta sesión."
          >
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeSession.name}
          </Text>
          <Pressable
            onPress={() => setFullscreen(true)}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Activar pantalla completa"
            accessibilityHint="Oculta parte de la interfaz para concentrarte en la sesión."
          >
            <Text style={styles.headerUtility}>Full</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.fullscreenTop}>
          <Pressable
            onPress={() => setFullscreen(false)}
            style={styles.fullscreenChip}
            accessibilityRole="button"
            accessibilityLabel="Salir de pantalla completa"
          >
            <Text style={styles.fullscreenChipText}>Salir</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(bottomCardHeight + insets.bottom + Spacing[4], 220) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!fullscreen ? (
          <View style={styles.sessionBar}>
            <Text style={styles.sessionMeta}>{activeSession.name}</Text>
            <Text style={styles.sessionTimer}>{Math.floor(elapsedSeconds / 60)} min</Text>
          </View>
        ) : null}

        <View style={styles.exerciseBlock}>
          <Text style={styles.exerciseLabel}>
            Ejercicio {exerciseIndex + 1} de {activeSession.exercises.length}
          </Text>
          <View style={styles.exerciseTitleRow}>
            <Text style={styles.exerciseTitle}>{currentExercise.exercise_name}</Text>
            <Pressable
              onPress={() => setNoteOpen((value) => !value)}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel={noteOpen || currentNote ? 'Ocultar nota del ejercicio' : 'Mostrar nota del ejercicio'}
              accessibilityHint="Abre o cierra el campo para guardar una nota opcional."
            >
              <Ionicons
                name={noteOpen || currentNote ? 'document-text' : 'document-text-outline'}
                size={18}
                color={noteOpen || currentNote ? Colors.action : Colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Cambiar ejercicio"
              accessibilityHint="Abre el selector de ejercicios disponibles."
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
          <Text style={styles.exerciseConfig}>
            {targetSets} series · objetivo {targetReps} reps
            {typeof currentExercise.weight_suggestion_kg === 'number'
              ? ` · sugerido ${formatWeightValue(currentExercise.weight_suggestion_kg)}`
              : ''}
          </Text>
          <Text style={styles.exercisePrevious}>{previousSessionLabel}</Text>
        </View>

        <Card style={styles.seriesCard} shadow={false}>
          <View style={styles.seriesHeader}>
            <Text style={[styles.seriesHeaderText, styles.setColumn]}>Serie</Text>
            <Text style={[styles.seriesHeaderText, styles.previousColumn]}>Anterior</Text>
            <Text style={[styles.seriesHeaderText, styles.todayColumn]}>Hoy</Text>
            <Text style={[styles.seriesHeaderText, styles.checkColumn]}>OK</Text>
          </View>

          {Array.from({ length: targetSets }, (_, index) => {
            const completedSet = currentSets[index] ?? null;
            const previousSet = previousSets[index] ?? null;
            const draft = draftRows[index] ?? { reps: String(targetReps), weight: '0' };
            const isDone = Boolean(completedSet);
            const isActiveRow = index === currentSets.length && currentSets.length < targetSets;
            const repsValue = Math.round(parseDraftValue(draft.reps));
            const weightValue = parseDraftValue(draft.weight);
            const canComplete =
              isActiveRow &&
              Number.isFinite(repsValue) &&
              repsValue > 0 &&
              Number.isFinite(weightValue) &&
              weightValue >= 0;
            const isPrCandidate =
              !isDone &&
              canComplete &&
              currentRecord &&
              (weightValue > currentRecord.maxWeight || repsValue > currentRecord.maxReps);

            return (
              <View
                key={`${currentExercise.exercise_id}-${index}`}
                style={[
                  styles.seriesRow,
                  isActiveRow && styles.seriesRowActive,
                  isDone && styles.seriesRowDone,
                ]}
              >
                <Text style={[styles.setNumber, isDone && styles.setNumberDone]}>{index + 1}</Text>

                <View style={styles.previousColumn}>
                  <Text style={styles.previousValue}>
                    {formatPreviousSet(previousSet?.weight_kg, previousSet?.reps)}
                  </Text>
                </View>

                <View style={[styles.todayColumn, isPrCandidate && styles.todayColumnPr]}>
                  {isDone ? (
                    <Text style={styles.completedValue}>
                      {formatPreviousSet(completedSet?.weight_kg, completedSet?.reps)}
                    </Text>
                  ) : (
                    <View style={styles.inlineInputs}>
                      <TextInput
                        value={draft.weight}
                        onChangeText={(value) => handleUpdateDraft(index, 'weight', value)}
                        keyboardType="decimal-pad"
                        style={styles.inlineInput}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        editable={!restRemaining}
                        accessibilityLabel={`Peso de la serie ${index + 1}`}
                        maxFontSizeMultiplier={1.3}
                      />
                      <Text style={styles.inlineDivider}>x</Text>
                      <TextInput
                        value={draft.reps}
                        onChangeText={(value) => handleUpdateDraft(index, 'reps', value)}
                        keyboardType="number-pad"
                        style={styles.inlineInput}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        editable={!restRemaining}
                        accessibilityLabel={`Repeticiones de la serie ${index + 1}`}
                        maxFontSizeMultiplier={1.3}
                      />
                    </View>
                  )}
                </View>

                <Pressable
                  disabled={!canComplete || restRemaining > 0}
                  onPress={() => void handleCompleteSet(index)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canComplete || restRemaining > 0 }}
                  accessibilityLabel={
                    isDone
                      ? `Serie ${index + 1} ya completada`
                      : `Marcar serie ${index + 1} como completada`
                  }
                  accessibilityHint={
                    isDone
                      ? 'La serie ya quedó registrada.'
                      : 'Guarda el peso y las repeticiones de esta serie.'
                  }
                  style={[
                    styles.checkButton,
                    isDone && styles.checkButtonDone,
                    canComplete && !isDone && styles.checkButtonReady,
                  ]}
                >
                  <Ionicons
                    name={isDone ? 'checkmark' : 'ellipse-outline'}
                    size={18}
                    color={
                      isDone
                        ? Colors.success
                        : canComplete && restRemaining <= 0
                          ? Colors.textPrimary
                          : Colors.textMuted
                    }
                  />
                </Pressable>
              </View>
            );
          })}

          {noteOpen ? (
            <View style={styles.noteBlock}>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Nota opcional para este ejercicio"
                placeholderTextColor={Colors.textMuted}
                multiline
                style={styles.noteInput}
                accessibilityLabel="Nota del ejercicio"
                maxFontSizeMultiplier={1.3}
              />
              <Pressable
                onPress={saveNote}
                style={styles.noteSave}
                accessibilityRole="button"
                accessibilityLabel="Guardar nota del ejercicio"
              >
                <Text style={styles.noteSaveText}>Guardar nota</Text>
              </Pressable>
            </View>
          ) : null}
        </Card>
      </ScrollView>

      <View
        style={[styles.bottomCard, { paddingBottom: Spacing[4] + insets.bottom }]}
        onLayout={(event) => {
          const nextHeight = Math.ceil(event.nativeEvent.layout.height);
          setBottomCardHeight((current) => (Math.abs(current - nextHeight) > 2 ? nextHeight : current));
        }}
      >
        {restRemaining > 0 ? (
          <View style={styles.restWrap}>
            <Pressable
              onPress={() => setRestEndsAt(null)}
              style={styles.skipRestButton}
              accessibilityRole="button"
              accessibilityLabel="Saltar descanso"
              accessibilityHint="Termina el temporizador y vuelve al registro de la siguiente serie."
            >
              <Text style={styles.skipRestText}>Saltar descanso</Text>
            </Pressable>

            <View style={styles.restCircle}>
              <Text style={styles.restTime}>{formatRestClock(restRemaining)}</Text>
              <Text style={styles.restMeta}>descanso</Text>
            </View>

            {nextExercise ? (
              <View style={styles.nextExerciseCard}>
                <View style={styles.nextExerciseIcon}>
                  <Ionicons name="barbell-outline" size={16} color={Colors.workout} />
                </View>
                <View style={styles.nextExerciseCopy}>
                  <Text style={styles.nextExerciseLabel}>Sigue</Text>
                  <Text style={styles.nextExerciseTitle}>{nextExercise.exercise_name}</Text>
                  <Text style={styles.nextExerciseMeta}>
                    {nextExercise.sets_target} series · {nextExercise.reps_target} reps
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.nextExerciseMeta}>Último bloque de la sesión.</Text>
            )}
          </View>
        ) : (
          <View style={styles.readyBlock}>
            <Text style={styles.readyTitle}>
              Serie {Math.min(targetSets, currentSets.length + 1)} de {targetSets}
            </Text>
            <Text style={styles.readyBody}>
              Edita la fila activa arriba y marca el check cuando completes la serie.
            </Text>
          </View>
        )}

        {!fullscreen ? (
          <View style={styles.footerRow}>
            <Pressable
              disabled={exerciseIndex === 0}
              onPress={() => setCurrentExerciseIndex(Math.max(0, exerciseIndex - 1))}
              accessibilityRole="button"
              accessibilityState={{ disabled: exerciseIndex === 0 }}
              accessibilityLabel="Ejercicio anterior"
            >
              <Text style={[styles.navText, exerciseIndex === 0 && styles.navTextDisabled]}>
                Anterior
              </Text>
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
              onPress={() =>
                setCurrentExerciseIndex(Math.min(activeSession.exercises.length - 1, exerciseIndex + 1))
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: exerciseIndex >= activeSession.exercises.length - 1 }}
              accessibilityLabel="Siguiente ejercicio"
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
        ) : null}

        <Pressable
          onPress={handleFinish}
          style={styles.finishLink}
          accessibilityRole="button"
          accessibilityLabel="Terminar entrenamiento"
          accessibilityHint="Abre una confirmación antes de cerrar esta sesión."
        >
          <Text style={styles.finishLinkText}>Terminar entrenamiento</Text>
        </Pressable>
      </View>

      <BottomSheet
        visible={confirmAction !== null}
        onClose={() => {
          if (!actionBusy) setConfirmAction(null);
        }}
        title={confirmAction === 'cancel' ? 'Cancelar sesión' : 'Terminar entrenamiento'}
        snapHeight={300}
      >
        <View style={styles.confirmSheet}>
          <Text style={styles.confirmBody}>
            {confirmAction === 'cancel'
              ? 'Se perderán los sets registrados en esta sesión si sales ahora.'
              : 'Se cerrará la sesión actual y se abrirá el resumen final del entreno.'}
          </Text>
          <Button
            onPress={() => {
              if (!actionBusy) setConfirmAction(null);
            }}
            variant="secondary"
            fullWidth
            disabled={Boolean(actionBusy)}
          >
            Volver
          </Button>
          <Button
            onPress={() => {
              if (confirmAction === 'cancel') {
                void executeCancel();
                return;
              }
              void executeFinish();
            }}
            variant="danger"
            fullWidth
            loading={actionBusy === confirmAction}
          >
            {confirmAction === 'cancel' ? 'Cancelar sesión' : 'Terminar ahora'}
          </Button>
        </View>
      </BottomSheet>

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
  fullscreenTop: {
    position: 'absolute',
    top: Spacing[6],
    right: Spacing[5],
    zIndex: 20,
  },
  fullscreenChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  fullscreenChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
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
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  exerciseTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  iconButton: {
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
    lineHeight: 20,
  },
  seriesCard: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  seriesHeaderText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  setColumn: {
    width: 42,
  },
  previousColumn: {
    flex: 1,
  },
  todayColumn: {
    width: 134,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
  },
  todayColumnPr: {
    borderWidth: 1,
    borderColor: withOpacity(Colors.warning, 0.55),
  },
  checkColumn: {
    width: 42,
    textAlign: 'center',
  },
  seriesRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[1],
    paddingVertical: Spacing[2],
  },
  seriesRowActive: {
    backgroundColor: withOpacity(Colors.action, 0.08),
  },
  seriesRowDone: {
    opacity: 0.76,
  },
  setNumber: {
    width: 42,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  setNumberDone: {
    color: Colors.textSecondary,
  },
  previousValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  inlineInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  inlineInput: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.md,
    backgroundColor: withOpacity(Colors.white, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.05),
    paddingHorizontal: Spacing[2],
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  inlineDivider: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  completedValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  checkButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonReady: {
    backgroundColor: withOpacity(Colors.white, 0.03),
  },
  checkButtonDone: {
    backgroundColor: withOpacity(Colors.success, 0.08),
  },
  noteBlock: {
    gap: Spacing[2],
    marginTop: Spacing[2],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.06),
  },
  noteInput: {
    minHeight: 78,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  noteSave: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.actionBg,
  },
  noteSaveText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.action,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.white, 0.08),
    gap: Spacing[3],
  },
  restWrap: {
    alignItems: 'center',
    gap: Spacing[3],
  },
  skipRestButton: {
    alignSelf: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  skipRestText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  restCircle: {
    width: 152,
    height: 152,
    borderRadius: Radius.full,
    borderWidth: 12,
    borderColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  restTime: {
    fontFamily: FontFamily.mono,
    fontSize: 34,
    color: Colors.textPrimary,
  },
  restMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  nextExerciseCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgElevated,
  },
  nextExerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.workout, 0.12),
  },
  nextExerciseCopy: {
    flex: 1,
    gap: 2,
  },
  nextExerciseLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  nextExerciseTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  nextExerciseMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  readyBlock: {
    gap: Spacing[1],
  },
  readyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  readyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
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
  confirmSheet: {
    gap: Spacing[3],
    paddingBottom: Spacing[5],
  },
  confirmBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  prBanner: {
    position: 'absolute',
    left: Spacing[5],
    right: Spacing[5],
    top: Spacing[4],
    zIndex: 30,
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
