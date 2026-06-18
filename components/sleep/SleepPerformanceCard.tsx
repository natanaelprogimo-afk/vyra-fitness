import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSleep } from '@/hooks/useSleep';
import { useWorkout } from '@/hooks/useWorkout';
import { useSteps } from '@/hooks/useSteps';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

export interface SleepPerformanceCorrelationProps {
  compact?: boolean;
}

type CorrelationType = 'excellent' | 'good' | 'fair' | 'poor' | null;

interface CorrelationInsight {
  type: CorrelationType;
  title: string;
  description: string;
  emoji: string;
  color: string;
  actionable: string;
}

function buildSleepPerformanceCorrelation(
  sleepDebtHours: number,
  _lastWorkoutQuality: number | undefined,
  stepProgress: number,
): CorrelationInsight {
  // Sleep debt levels
  const isWellRested = sleepDebtHours <= 1;
  const isModerateDebt = sleepDebtHours > 1 && sleepDebtHours <= 3;
  const isHighDebt = sleepDebtHours > 3;

  // Step performance baseline: 100% is good
  const stepsAreModerate = stepProgress >= 50 && stepProgress < 80;

  // Correlate: poor sleep + good performance = user pushing through
  if (isHighDebt && stepProgress >= 90) {
    return {
      type: 'good',
      title: 'Empujándote sin descanso',
      description: `${sleepDebtHours.toFixed(1)}h de deuda de sueño pero manteniéndote activo.`,
      emoji: '💪',
      color: Colors.warning,
      actionable: 'Prioriza dormir hoy para recuperarte.',
    };
  }

  // Correlate: good sleep + good performance = optimal state
  if (isWellRested && stepProgress >= 80) {
    return {
      type: 'excellent',
      title: 'En tu mejor momento',
      description: 'Buen descanso + alta actividad. Estado óptimo.',
      emoji: '⭐',
      color: Colors.excellent,
      actionable: 'Aprovecha este pico para entrenar fuerte.',
    };
  }

  // Correlate: poor sleep + poor performance = recovery needed
  if (isHighDebt && stepProgress < 50) {
    return {
      type: 'poor',
      title: 'Necesitas descansar',
      description: `${sleepDebtHours.toFixed(1)}h de deuda + bajo movimiento. Señal de fatiga.`,
      emoji: '😴',
      color: Colors.error,
      actionable: 'Prioriza dormir. El movimiento puede esperar.',
    };
  }

  // Correlate: moderate sleep + moderate performance = normal
  if (isModerateDebt && stepsAreModerate) {
    return {
      type: 'fair',
      title: 'Recuperándote',
      description: `Ligera deuda de sueño (${sleepDebtHours.toFixed(1)}h) pero actividad normal.`,
      emoji: '👌',
      color: Colors.warning,
      actionable: 'Otra noche buena te pone en óptimas condiciones.',
    };
  }

  // Default: good state
  return {
    type: 'good',
    title: 'Buen balance',
    description: 'Tu sueño y actividad están balanceados.',
    emoji: '✅',
    color: Colors.success,
    actionable: 'Mantén la rutina de descanso.',
  };
}

export function SleepPerformanceCard({ compact = false }: SleepPerformanceCorrelationProps) {
  const { sleepDebt } = useSleep();
  const { history: workoutHistory } = useWorkout();
  const { progressPct } = useSteps();

  const lastWorkoutQuality = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) return undefined;
    const last = workoutHistory[0];
    // Estimate quality from volume and sets
    const volume = last?.total_volume_kg ?? 0;
    const sets = last?.sets_count ?? 0;
    return Math.min(5, 2 + (volume + sets) / 500); // rough estimate
  }, [workoutHistory]);

  const insight = useMemo(
    () => buildSleepPerformanceCorrelation(sleepDebt, lastWorkoutQuality, progressPct),
    [sleepDebt, lastWorkoutQuality, progressPct],
  );

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactCard, { borderColor: withOpacity(insight.color, 0.3) }]}>
          <Text style={styles.compactEmoji}>{insight.emoji}</Text>
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle}>{insight.title}</Text>
            <Text style={styles.compactDesc}>{insight.description}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: withOpacity(insight.color, 0.3) }]}>
        <View style={[styles.header, { backgroundColor: withOpacity(insight.color, 0.1) }]}>
          <Text style={styles.emoji}>{insight.emoji}</Text>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{insight.title}</Text>
            <Text style={styles.description}>{insight.description}</Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Ionicons name="moon" size={16} color={Colors.sleep} />
            <Text style={styles.metricLabel}>Deuda de sueño</Text>
            <Text style={styles.metricValue}>{sleepDebt.toFixed(1)}h</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricItem}>
            <Ionicons name="footsteps" size={16} color={Colors.steps} />
            <Text style={styles.metricLabel}>Movimiento hoy</Text>
            <Text style={styles.metricValue}>{Math.round(progressPct)}%</Text>
          </View>

          {lastWorkoutQuality && (
            <>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Ionicons name="fitness" size={16} color={Colors.workout} />
                <Text style={styles.metricLabel}>Último workout</Text>
                <Text style={styles.metricValue}>{lastWorkoutQuality.toFixed(1)}/5</Text>
              </View>
            </>
          )}
        </View>

        <View style={[styles.actionable, { backgroundColor: withOpacity(insight.color, 0.08) }]}>
          <Ionicons name="bulb" size={16} color={insight.color} />
          <Text style={[styles.actionableText, { color: insight.color }]}>{insight.actionable}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[3],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
  },
  emoji: {
    fontSize: 32,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  description: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: withOpacity(Colors.textPrimary, 0.02),
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[1],
  },
  metricLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing[1],
  },
  metricValue: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[3],
  },
  actionable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  actionableText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
  },
  // Compact variant
  compactContainer: {
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[2],
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing[3],
    borderWidth: 1,
    gap: Spacing[3],
  },
  compactEmoji: {
    fontSize: 24,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  compactDesc: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
});
