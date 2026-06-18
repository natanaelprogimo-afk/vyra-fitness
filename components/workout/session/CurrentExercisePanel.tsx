import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { formatDaysAgo, getSetTypeGuidance } from '@/hooks/useWorkoutSessionController';
import type { Exercise } from '@/lib/workout-types';

interface CurrentExercisePanelProps {
  exerciseName: string;
  setTypeGuidance: string | null;
  setType: string | null;
  previousSessionLabel: string;
  exerciseMeta: Exercise | null;
  onMediaOpen: () => void;
}

export function CurrentExercisePanel({
  exerciseName,
  setTypeGuidance,
  setType,
  previousSessionLabel,
  exerciseMeta,
  onMediaOpen,
}: CurrentExercisePanelProps) {
  return (
    <ScrollView style={styles.container} scrollEnabled={false}>
      <View style={styles.header}>
        <Text style={styles.exerciseTitle}>{exerciseName}</Text>

        {setType ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{setType}</Text>
          </View>
        ) : null}
      </View>

      {setTypeGuidance ? (
        <Text style={styles.exerciseGuidance}>{setTypeGuidance}</Text>
      ) : null}

      <Text style={styles.exercisePrevious}>{previousSessionLabel}</Text>

      {exerciseMeta?.cues?.length ||
      exerciseMeta?.variations?.length ||
      exerciseMeta?.video_url ||
      exerciseMeta?.gif_url ? (
        <Card style={styles.referenceCard} shadow={false}>
          <View style={styles.referenceHeader}>
            <Text style={styles.referenceTitle}>Referencia rápida</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: Routes.workout.exercises,
                  params: { seedExerciseId: exerciseMeta?.id },
                } as never)
              }
              accessibilityRole="button"
              accessibilityLabel="Guardar variante propia"
              style={styles.referenceGhost}
            >
              <Text style={styles.referenceGhostText}>Guardar variante</Text>
            </Pressable>
          </View>

          {exerciseMeta?.cues?.length ? (
            <Text style={styles.referenceBody}>
              {exerciseMeta.cues.slice(0, 2).join(' · ')}
            </Text>
          ) : null}

          {exerciseMeta?.variations?.length ? (
            <View style={styles.referenceChipRow}>
              {exerciseMeta.variations.slice(0, 3).map((variation: string) => (
                <View key={variation} style={styles.referenceChip}>
                  <Text style={styles.referenceChipText}>{variation}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.referenceActionRow}>
            <Button
              onPress={onMediaOpen}
              variant="primary"
              color={Colors.workout}
              style={styles.referenceActionButton}
            >
              {exerciseMeta?.video_url || exerciseMeta?.gif_url
                ? 'Ver dentro de Vyra'
                : 'Abrir técnica'}
            </Button>
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  exerciseTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  metaChip: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.secondary, 0.12),
  },
  metaChipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.secondary,
  },
  exerciseGuidance: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
    lineHeight: 20,
  },
  exercisePrevious: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing[3],
  },
  referenceCard: {
    marginTop: Spacing[3],
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  referenceTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  referenceGhost: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  referenceGhostText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.secondary,
  },
  referenceBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  referenceChipRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[3],
    flexWrap: 'wrap',
  },
  referenceChip: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.secondary, 0.08),
  },
  referenceChipText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.secondary,
  },
  referenceActionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  referenceActionButton: {
    flex: 1,
  },
});
