import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWater } from '@/hooks/useWater';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';
import { WaterQuickLogCard } from './WaterQuickLog';

export interface WaterCardProps {
  onPress?: () => void;
}

export function WaterCard({ onPress }: WaterCardProps) {
  const { totalHydro, goal, remaining, hydrationAlert } = useWater();
  const [showQuickLog, setShowQuickLog] = useState(false);

  const progressPct = Math.round((totalHydro / goal) * 100);
  const isGoalMet = totalHydro >= goal;

  // Determine status based on progress
  const getStatusColor = () => {
    if (isGoalMet) return Colors.success;
    if (progressPct >= 75) return Colors.success;
    if (progressPct >= 50) return Colors.info;
    if (progressPct >= 25) return Colors.warning;
    return Colors.error;
  };

  const getStatusLabel = () => {
    if (isGoalMet) return 'Meta alcanzada ✓';
    if (progressPct >= 75) return 'Casi listo';
    if (progressPct >= 50) return 'A mitad de camino';
    if (progressPct >= 25) return 'Comenzando';
    return 'Necesitas agua';
  };

  const statusColor = getStatusColor();

  if (showQuickLog) {
    return (
      <View style={styles.container}>
        <WaterQuickLogCard onLogged={() => setShowQuickLog(false)} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.card, { borderColor: withOpacity(statusColor, 0.3) }]}>
        <View style={[styles.header, { backgroundColor: withOpacity(statusColor, 0.08) }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: withOpacity(statusColor, 0.15) }]}>
              <Ionicons name="water" size={24} color={statusColor} />
            </View>
            <View style={styles.headerTextSection}>
              <Text style={styles.label}>Hidratación</Text>
              <Text style={[styles.status, { color: statusColor }]}>
                {getStatusLabel()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowQuickLog(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add-circle" size={28} color={statusColor} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progressPct, 100)}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {totalHydro}ml / {goal}ml
            {remaining > 0 && <Text style={styles.remainingText}> ({remaining}ml falta)</Text>}
          </Text>
        </View>

        {/* Alert if exists */}
        {hydrationAlert && (
          <View style={[styles.alertBox, { backgroundColor: withOpacity(statusColor, 0.1) }]}>
            <Ionicons name="alert-circle" size={16} color={statusColor} />
            <Text style={[styles.alertText, { color: statusColor }]}>
              {hydrationAlert}
            </Text>
          </View>
        )}

        {/* Footer with info */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText}>Hoy</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerItem}>
            <Text style={styles.footerValue}>
              {Math.round((totalHydro / goal) * 100)}%
            </Text>
            <Text style={styles.footerLabel}>Progreso</Text>
          </View>
          <View style={styles.footerDivider} />
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => setShowQuickLog(true)}
          >
            <Ionicons name="add" size={14} color={Colors.info} />
            <Text style={[styles.footerText, { color: Colors.info }]}>Log</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing[4],
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextSection: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  status: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    marginTop: Spacing[1],
  },
  addBtn: {
    padding: Spacing[1],
  },
  progressSection: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  progressBar: {
    height: 8,
    backgroundColor: withOpacity(Colors.textPrimary, 0.1),
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing[2],
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
    color: Colors.textPrimary,
  },
  remainingText: {
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
    gap: Spacing[2],
  },
  alertText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: withOpacity(Colors.textPrimary, 0.02),
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[1],
  },
  footerText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  footerValue: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  footerLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  footerDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[2],
  },
});
