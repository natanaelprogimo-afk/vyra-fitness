import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { formatRestClock } from '@/hooks/useWorkoutSessionController';

interface RestTimerDockProps {
  restRemaining: number;
  nextExerciseName: string | null;
  targetSets: number;
  currentSets: number;
  onSkipRest: () => void;
  onAddTime: () => void;
}

export function RestTimerDock({
  restRemaining,
  nextExerciseName,
  targetSets,
  currentSets,
  onSkipRest,
  onAddTime,
}: RestTimerDockProps) {
  if (restRemaining <= 0) return null;

  return (
    <View style={styles.restWrap}>
      <View style={styles.restHeader}>
        <Text style={styles.restEyebrow}>Descanso</Text>
        <Text style={styles.restBody}>
          Suelta tension, respira y deja lista la siguiente serie antes de volver.
        </Text>
      </View>

      <View style={styles.restCircle}>
        <Text style={styles.restTime}>{formatRestClock(restRemaining)}</Text>
        <Text style={styles.restMeta}>descanso</Text>
      </View>

      <View style={styles.restActionsRow}>
        <Pressable
          onPress={onSkipRest}
          style={styles.restSecondaryAction}
          accessibilityRole="button"
          accessibilityLabel="Saltar descanso"
          accessibilityHint="Termina el temporizador y vuelve al registro de la siguiente serie."
        >
          <Text style={styles.restSecondaryActionText}>Saltar</Text>
        </Pressable>
        <Pressable
          onPress={onAddTime}
          style={styles.restPrimaryAction}
          accessibilityRole="button"
          accessibilityLabel="Sumar treinta segundos de descanso"
          accessibilityHint="Agrega medio minuto al temporizador actual."
        >
          <Ionicons name="add" size={16} color={Colors.bgPrimary} />
          <Text style={styles.restPrimaryActionText}>+30 seg</Text>
        </Pressable>
      </View>

      {nextExerciseName && (
        <View style={styles.nextExerciseCard}>
          <View style={styles.nextExerciseIcon}>
            <Ionicons name="barbell-outline" size={16} color={Colors.workout} />
          </View>
          <View style={styles.nextExerciseCopy}>
            <Text style={styles.nextExerciseLabel}>Proximo</Text>
            <Text style={styles.nextExerciseTitle}>{nextExerciseName}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  restWrap: {
    alignItems: 'center',
    gap: Spacing[3],
  },
  restHeader: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  restEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.secondary,
  },
  restBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  restActionsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing[2],
  },
  restSecondaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  restSecondaryActionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  restPrimaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing[1],
    backgroundColor: Colors.workout,
  },
  restPrimaryActionText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.bgPrimary,
  },
  restCircle: {
    width: 152,
    height: 152,
    borderRadius: Radius.full,
    borderWidth: 12,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.elevated,
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
    backgroundColor: Colors.elevated,
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
});
