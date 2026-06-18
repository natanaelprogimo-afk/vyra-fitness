/**
 * HomeDailyPulse Component
 *
 * Shows the active module widgets for today in a compact grid.
 * Every active module gets a visible tile, and the last tile spans
 * the full width when the count is odd.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export interface DailyMetric {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  meta: string;
  color: string;
  progressPct?: number;
  onPress: () => void;
}

interface HomeDailyPulseProps {
  metrics: DailyMetric[];
  loading?: boolean;
}

function MetricCard({
  metric,
  fullWidth = false,
}: {
  metric: DailyMetric;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      style={[styles.card, fullWidth && styles.cardFullWidth]}
      onPress={metric.onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${metric.label}: ${metric.value}`}
      accessibilityHint={metric.meta}
    >
      <View style={[styles.iconWrap, { backgroundColor: withOpacity(metric.color, 0.12) }]}>
        <Ionicons name={metric.icon} size={18} color={metric.color} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.label}>{metric.label}</Text>
        <Text style={styles.value}>{metric.value}</Text>
      </View>

      {typeof metric.progressPct === 'number' ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(100, metric.progressPct))}%`,
                backgroundColor: metric.color,
              },
            ]}
          />
        </View>
      ) : null}

      <Text style={styles.meta} numberOfLines={1}>
        {metric.meta}
      </Text>
    </Pressable>
  );
}

export default function HomeDailyPulse({ metrics, loading }: HomeDailyPulseProps) {
  if (metrics.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.key}
            metric={metric}
            fullWidth={metrics.length % 2 === 1 && index === metrics.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
  },
  card: {
    width: '49%',
    minHeight: 124,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.1),
    backgroundColor: Colors.surface1,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  cardFullWidth: {
    width: '100%',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copy: {
    gap: Spacing[1],
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.06),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
