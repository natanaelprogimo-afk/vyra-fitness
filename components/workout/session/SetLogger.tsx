import React from 'react';
import { Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  DraftRow,
  formatPreviousSet,
  formatWeightValue,
  parseDraftValue,
} from '@/hooks/useWorkoutSessionController';
import type { WorkoutPersonalRecord } from '@/lib/workout-types';

interface SetLoggerProps {
  targetSets: number;
  targetReps: number;
  currentSets: Array<{ reps: number; weight_kg: number; set_number: number }>;
  previousSets: Array<{ reps: number; weight_kg: number }>;
  draftRows: DraftRow[];
  restRemaining: number;
  currentRecord: WorkoutPersonalRecord | null;
  currentNote: string;
  noteOpen: boolean;
  onNoteDraftChange: (value: string) => void;
  onDraftChange: (index: number, field: keyof DraftRow, value: string) => void;
  onCompleteSet: (index: number) => void;
  onSaveNote: () => void;
}

export function SetLogger({
  targetSets,
  targetReps,
  currentSets,
  previousSets,
  draftRows,
  restRemaining,
  currentRecord,
  currentNote,
  noteOpen,
  onNoteDraftChange,
  onDraftChange,
  onCompleteSet,
  onSaveNote,
}: SetLoggerProps) {
  return (
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
            key={`${index}`}
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
                    onChangeText={(value) => onDraftChange(index, 'weight', value)}
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
                    onChangeText={(value) => onDraftChange(index, 'reps', value)}
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
              onPress={() => onCompleteSet(index)}
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
            value={currentNote}
            onChangeText={onNoteDraftChange}
            placeholder="Nota opcional para este ejercicio"
            placeholderTextColor={Colors.textMuted}
            multiline
            style={styles.noteInput}
            accessibilityLabel="Nota del ejercicio"
            maxFontSizeMultiplier={1.3}
          />
          <Pressable
            onPress={onSaveNote}
            style={styles.noteSave}
            accessibilityRole="button"
            accessibilityLabel="Guardar nota del ejercicio"
          >
            <Text style={styles.noteSaveText}>Guardar nota</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  seriesCard: {
    marginVertical: Spacing[3],
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.06),
  },
  seriesHeaderText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  setColumn: {
    width: 42,
  },
  previousColumn: {
    flex: 1,
  },
  todayColumn: {
    flex: 1,
  },
  todayColumnPr: {
    backgroundColor: withOpacity(Colors.success, 0.06),
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[1],
  },
  checkColumn: {
    width: 42,
  },
  seriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.03),
    borderRadius: Radius.lg,
  },
  seriesRowActive: {
    backgroundColor: withOpacity(Colors.secondary, 0.08),
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
    backgroundColor: Colors.elevated,
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
    backgroundColor: Colors.secondaryBg,
  },
  noteSaveText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.secondary,
  },
});
