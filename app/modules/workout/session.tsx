import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, View, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeScreen from '@/components/ui/SafeScreen';
import ExerciseMediaSheet from '@/components/workout/ExerciseMediaSheet';
import { Routes } from '@/constants/routes';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { useUIStore } from '@/stores/uiStore';
import { useWorkoutSessionController } from '@/hooks/useWorkoutSessionController';
import { WorkoutSessionHeader } from '@/components/workout/session/WorkoutSessionHeader';
import { PRCelebration } from '@/components/workout/session/PRCelebration';
import { CurrentExercisePanel } from '@/components/workout/session/CurrentExercisePanel';
import { SetLogger } from '@/components/workout/session/SetLogger';
import { RestTimerDock } from '@/components/workout/session/RestTimerDock';
import { ExerciseQueue } from '@/components/workout/session/ExerciseQueue';
import { SessionExitConfirm } from '@/components/workout/session/SessionExitConfirm';
import { ExercisePickerModal } from './components/ExercisePickerModal';
import { RestTimerModal } from './components/RestTimerModal';

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const setWorkoutActive = useUIStore((state) => state.setWorkoutActive);
  const { activeSession, adjustRestTimer, clearRestTimer, exercises } = useWorkout();

  const controller = useWorkoutSessionController();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      router.replace(Routes.tabs.home as never);
    }
  }, [activeSession]);

  useEffect(() => {
    setWorkoutActive(Boolean(activeSession));
    return () => setWorkoutActive(false);
  }, [activeSession, setWorkoutActive]);

  const currentExercise = activeSession?.exercises[activeSession.currentExerciseIndex] ?? null;
  const currentSets = activeSession?.sets.filter(
    (set) => set.exercise_id === currentExercise?.exercise_id,
  ) ?? [];

  if (!activeSession || !currentExercise) return null;

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <StatusBar hidden={controller.fullscreen} />
      <Stack.Screen options={{ gestureEnabled: false }} />

      <PRCelebration visible={Boolean(controller.prBanner)} bannerText={controller.prBanner} />

      <WorkoutSessionHeader
        progressWidth={controller.progressWidth}
        elapsedSeconds={controller.elapsedSeconds}
        onCancel={controller.handleCancel}
        onToggleFullscreen={() => controller.setFullscreen(!controller.fullscreen)}
      />

      {!controller.fullscreen && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <CurrentExercisePanel
              exerciseName={currentExercise.exercise_name}
              setTypeGuidance={controller.currentSetTypeGuidance}
              setType={currentExercise.set_type ?? null}
              previousSessionLabel={controller.previousSessionLabel}
              exerciseMeta={controller.currentExerciseMeta}
              onMediaOpen={() => setMediaOpen(true)}
            />

            <SetLogger
              targetSets={controller.targetSets}
              targetReps={controller.targetReps}
              currentSets={currentSets}
              previousSets={controller.previousSets}
              draftRows={controller.draftRows}
              restRemaining={controller.restRemaining}
              currentRecord={controller.currentRecord}
              currentNote={controller.currentNote}
              noteOpen={noteOpen}
              onNoteDraftChange={(v) => {
                controller.setNoteDraft(v);
                setNoteOpen(true);
              }}
              onDraftChange={controller.handleUpdateDraft}
              onCompleteSet={controller.handleCompleteSet}
              onSaveNote={controller.saveNote}
            />
          </View>
        </ScrollView>
      )}

      <View style={[styles.bottomDock, { paddingBottom: insets.bottom + Spacing[4] }]}>
        {controller.restRemaining > 0 ? (
          <RestTimerDock
            restRemaining={controller.restRemaining}
            nextExerciseName={activeSession?.exercises[activeSession.currentExerciseIndex + 1]?.exercise_name ?? null}
            targetSets={controller.targetSets}
            currentSets={currentSets.length}
            onSkipRest={() => clearRestTimer()}
            onAddTime={() => adjustRestTimer(30)}
          />
        ) : (
          <ExerciseQueue
            currentSetNumber={currentSets.length + 1}
            targetSets={controller.targetSets}
            activeSetPreview={`${currentSets.length + 1}/${controller.targetSets}`}
            onAdjustWeight={(delta) =>
              controller.adjustDraftRow(currentSets.length, 'weight', delta)
            }
            onAdjustReps={(delta) => controller.adjustDraftRow(currentSets.length, 'reps', delta)}
          />
        )}
      </View>

      <ExercisePickerModal
        visible={pickerOpen}
        exercises={exercises}
        currentExerciseId={currentExercise.exercise_id}
        onSelect={() => setPickerOpen(false)}
        onClose={() => setPickerOpen(false)}
      />

      <RestTimerModal visible={false} secondsLeft={0} totalSeconds={60} onAdjust={() => {}} onClose={() => {}} />

      <ExerciseMediaSheet
        visible={mediaOpen}
        onClose={() => setMediaOpen(false)}
        exerciseName={currentExercise.exercise_name}
      />

      <SessionExitConfirm
        visible={controller.confirmAction !== null}
        actionType={controller.confirmAction as 'cancel' | 'finish'}
        actionBusy={controller.actionBusy !== null}
        onConfirm={
          controller.confirmAction === 'cancel'
            ? controller.executeCancel
            : controller.executeFinish
        }
        onDismiss={() => controller.setConfirmAction(null)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 200,
  },
  container: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
});
