import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useAuthStore } from '@/stores/authStore';
import { getWorkoutCycleGuidance } from '@/lib/workout-cycle';

interface CycleAwareTrainingCardProps {
  compact?: boolean;
  sessionName?: string | null;
  routineName?: string | null;
}

function buildPhaseBody(input: {
  sessionAdjustment: string;
  sessionName?: string | null;
  routineName?: string | null;
}) {
  if (input.sessionName?.trim()) {
    return `Sesion abierta: ${input.sessionName}. Hoy ${input.sessionAdjustment}.`;
  }
  if (input.routineName?.trim()) {
    return `${input.routineName} encaja bien hoy si respetas este tono: ${input.sessionAdjustment}.`;
  }
  return `Si entrenas hoy, ${input.sessionAdjustment}.`;
}

function formatUpcomingWindow(daysUntilWindow: number) {
  if (daysUntilWindow <= 0) return 'desde hoy';
  if (daysUntilWindow === 1) return 'desde manana';
  return `en ${daysUntilWindow} dias`;
}

export default function CycleAwareTrainingCard({
  compact = false,
  sessionName,
  routineName,
}: CycleAwareTrainingCardProps) {
  const profile = useAuthStore((state) => state.profile);
  const {
    currentPhase,
    cycleLength,
    daysInPhase,
    isInCycle,
    isLoading,
    phaseGuidance,
    symptomPredictions,
  } = useFemaleHealth();

  const isEnabled = Boolean(profile?.female_health_enabled);
  const safeCycleLength = Math.max(21, Math.min(35, Math.round(cycleLength || 28)));

  const topPrediction = symptomPredictions[0] ?? null;
  const trainingPlan = useMemo(
    () => getWorkoutCycleGuidance(currentPhase),
    [currentPhase],
  );

  if (!isEnabled || !isInCycle || isLoading) {
    return null;
  }

  return (
    <Card
      style={[
        styles.card,
        compact && styles.cardCompact,
        { borderColor: withOpacity(trainingPlan.cardColor, 0.24) },
      ]}
      shadow={false}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Ajuste por ciclo</Text>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            {trainingPlan.label}
          </Text>
        </View>
        <View
          style={[
            styles.phaseBadge,
            { backgroundColor: withOpacity(trainingPlan.cardColor, 0.14) },
          ]}
        >
          <Text style={[styles.phaseBadgeText, { color: trainingPlan.cardColor }]}>
            Día {daysInPhase + 1}/{safeCycleLength}
          </Text>
        </View>
      </View>

      <Text style={styles.body}>
        {buildPhaseBody({
          sessionAdjustment: trainingPlan.sessionAdjustment,
          sessionName,
          routineName,
        })}
      </Text>

      <View style={styles.metricRow}>
        <View style={styles.metricChip}>
          <Text style={styles.metricLabel}>RPE</Text>
          <Text style={styles.metricValue}>{`<= ${trainingPlan.loadProfile.intensityCapRpe}`}</Text>
        </View>
        <View style={styles.metricChip}>
          <Text style={styles.metricLabel}>Volumen</Text>
          <Text style={styles.metricValue}>
            {`${trainingPlan.loadProfile.volumeMultiplier >= 1 ? '+' : ''}${Math.round((trainingPlan.loadProfile.volumeMultiplier - 1) * 100)}%`}
          </Text>
        </View>
        <View style={styles.metricChip}>
          <Text style={styles.metricLabel}>Foco</Text>
          <Text style={styles.metricValue}>{trainingPlan.loadProfile.preferredFocus}</Text>
        </View>
      </View>

      <Text style={styles.hint}>
        {phaseGuidance.training}
        {phaseGuidance.hydrationBoostMl > 0
          ? ` Suma ${phaseGuidance.hydrationBoostMl} ml extra de agua para acompanar la fase.`
          : ''}
      </Text>

      {topPrediction ? (
        <View style={styles.patternBlock}>
          <Text style={styles.patternTitle}>Patron que se viene</Text>
          <Text style={styles.patternBody}>
            {topPrediction.label} {formatUpcomingWindow(topPrediction.daysUntilWindow)}.{' '}
            {topPrediction.trainingHint}
          </Text>
        </View>
      ) : null}

      {!compact ? (
        <Button
          onPress={() => router.push(Routes.female.index as never)}
          variant="secondary"
          color={trainingPlan.cardColor}
          fullWidth
        >
          Abrir contexto de ciclo
        </Button>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
    borderWidth: 1,
  },
  cardCompact: {
    gap: Spacing[2],
    padding: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  titleCompact: {
    fontSize: FontSize.base,
  },
  phaseBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  phaseBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metricChip: {
    flexGrow: 1,
    minWidth: 92,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  patternBlock: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing[3],
    gap: Spacing[1],
  },
  patternTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  patternBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
