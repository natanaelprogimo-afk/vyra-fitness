/**
 * HomeMiniProgress Component
 * 
 * Shows:
 * - Daily completions (checklist items done)
 * - Streak status
 * - Week consistency grid
 * 
 * Minimal, encouraging, not overwhelming
 */

import { StyleSheet, Text, View } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface HomeMiniProgressProps {
  completedToday: number;
  totalDaily: number;
  currentStreak: number;
  weekConsistency: number[]; // 7 days, 0-1 for fill level
  loading?: boolean;
}

export default function HomeMiniProgress({
  completedToday,
  totalDaily,
  currentStreak,
  weekConsistency,
  loading,
}: HomeMiniProgressProps) {
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const completionPct = totalDaily > 0 ? (completedToday / totalDaily) * 100 : 0;
  const streakColor = currentStreak >= 7 ? Colors.success : currentStreak >= 3 ? Colors.action : Colors.warning;

  return (
    <View style={styles.container}>
      {/* Completion Bar */}
      <View style={styles.section}>
        <View style={styles.completionRow}>
          <Text style={styles.label}>Progreso hoy</Text>
          <Text style={styles.value}>
            {completedToday}/{totalDaily}
          </Text>
        </View>
        <View style={styles.bar}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.max(0, Math.min(100, completionPct))}%`,
                backgroundColor: Colors.action,
              },
            ]}
          />
        </View>
      </View>

      {/* Streak & Week Grid */}
      <View style={styles.row}>
        {/* Streak */}
        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>Racha</Text>
          <Text style={[styles.streakValue, { color: streakColor }]}>
            {currentStreak}
          </Text>
          <Text style={styles.streakUnit}>día{currentStreak === 1 ? '' : 's'}</Text>
        </View>

        {/* Week Grid */}
        <View style={styles.weekGrid}>
          {weekDays.map((day, idx) => {
            const fill = weekConsistency[idx] ?? 0;
            return (
              <View
                key={day}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: withOpacity(
                      Colors.action,
                      Math.max(0.2, fill),
                    ),
                  },
                ]}
              >
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    marginBottom: Spacing[3],
    gap: Spacing[3],
  },
  section: {
    gap: Spacing[2],
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-end',
  },
  streakCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.base, 0.8),
    padding: Spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  streakLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  streakValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    marginVertical: Spacing[1],
  },
  streakUnit: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing[1],
  },
  dayCell: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
