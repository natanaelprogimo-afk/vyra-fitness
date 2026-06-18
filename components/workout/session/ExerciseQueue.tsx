import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface ReadyBlockProps {
  currentSetNumber: number;
  targetSets: number;
  activeSetPreview: string;
  onAdjustWeight: (delta: number) => void;
  onAdjustReps: (delta: number) => void;
}

export function ExerciseQueue({
  currentSetNumber,
  targetSets,
  activeSetPreview,
  onAdjustWeight,
  onAdjustReps,
}: ReadyBlockProps) {
  return (
    <View style={styles.readyBlock}>
      <View style={styles.readyHeader}>
        <View style={styles.readyHeaderCopy}>
          <Text style={styles.readyEyebrow}>Serie activa</Text>
          <Text style={styles.readyTitle}>
            Serie {currentSetNumber} de {targetSets}
          </Text>
          <Text style={styles.readyBody}>
            Ajusta la fila activa arriba y cierra la serie desde aqui sin buscar el check.
          </Text>
        </View>
        <View style={styles.readyBadge}>
          <Text style={styles.readyBadgeText}>
            {currentSetNumber - 1}/{targetSets}
          </Text>
        </View>
      </View>

      <View style={styles.activeSetCard}>
        <View style={styles.activeSetTop}>
          <Text style={styles.activeSetLabel}>Vista previa</Text>
          <Text style={styles.activeSetPreview}>{activeSetPreview}</Text>
        </View>

        <View style={styles.quickAdjustRow}>
          <View style={styles.quickAdjustGroup}>
            <Text style={styles.quickAdjustLabel}>Peso</Text>
            <View style={styles.quickAdjustButtons}>
              <Button
                onPress={() => onAdjustWeight(-5)}
                variant="secondary"
                size="sm"
              >
                -5kg
              </Button>
              <Button
                onPress={() => onAdjustWeight(5)}
                variant="secondary"
                size="sm"
              >
                +5kg
              </Button>
            </View>
          </View>

          <View style={styles.quickAdjustGroup}>
            <Text style={styles.quickAdjustLabel}>Reps</Text>
            <View style={styles.quickAdjustButtons}>
              <Button
                onPress={() => onAdjustReps(-1)}
                variant="secondary"
                size="sm"
              >
                -1
              </Button>
              <Button
                onPress={() => onAdjustReps(1)}
                variant="secondary"
                size="sm"
              >
                +1
              </Button>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readyBlock: {
    gap: Spacing[3],
  },
  readyHeader: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  readyHeaderCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  readyEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.workout,
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
  readyBadge: {
    minWidth: 56,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.workout, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.18),
    alignItems: 'center',
  },
  readyBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.workout,
  },
  activeSetCard: {
    gap: Spacing[3],
    borderRadius: Radius.xl,
    backgroundColor: withOpacity(Colors.workout, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.18),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  activeSetTop: {
    gap: Spacing[1],
  },
  activeSetLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  activeSetPreview: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  quickAdjustRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  quickAdjustGroup: {
    flex: 1,
    gap: Spacing[2],
  },
  quickAdjustLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  quickAdjustButtons: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
});
