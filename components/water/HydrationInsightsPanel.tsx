import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHydrationInsights } from '@/hooks/useHydrationInsights';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

export function HydrationInsightsPanel() {
  const { insight, metrics, recommendations } = useHydrationInsights();

  const getColorForSeverity = () => {
    switch (insight.severity) {
      case 'critical':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'success':
        return Colors.success;
      default:
        return Colors.info;
    }
  };

  const severityColor = getColorForSeverity();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Insight Card */}
      <View
        style={[
          styles.insightCard,
          { backgroundColor: withOpacity(severityColor, 0.1) },
        ]}
      >
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
          <View style={styles.insightTitleSection}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDesc}>{insight.description}</Text>
          </View>
        </View>

        <View style={[styles.actionBox, { borderColor: severityColor, backgroundColor: withOpacity(severityColor, 0.1) }]}>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: severityColor }]}>{insight.actionTitle}</Text>
            <Text style={styles.actionDesc}>{insight.actionDescription}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={severityColor} />
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderColor: Colors.info }]}>
          <Ionicons name="water" size={24} color={Colors.info} />
          <Text style={styles.metricLabel}>Progreso</Text>
          <Text style={styles.metricValue}>{metrics.dailyProgress}%</Text>
        </View>

        <View style={[styles.metricCard, { borderColor: Colors.warning }]}>
          <Ionicons name="thermometer" size={24} color={Colors.warning} />
          <Text style={styles.metricLabel}>Restante</Text>
          <Text style={styles.metricValue}>{metrics.remainingMl}ml</Text>
        </View>

        <View style={[styles.metricCard, { borderColor: Colors.success }]}>
          <Ionicons name="flame" size={24} color={Colors.success} />
          <Text style={styles.metricLabel}>Racha</Text>
          <Text style={styles.metricValue}>{metrics.daysStreak}d</Text>
        </View>
      </View>

      {/* Status Badge */}
      <View style={styles.statusSection}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: withOpacity(
                metrics.hydrationStatus === 'on-track' || metrics.hydrationStatus === 'ahead'
                  ? Colors.success
                  : metrics.hydrationStatus === 'critical'
                    ? Colors.error
                    : Colors.warning,
                0.15,
              ),
            },
          ]}
        >
          <Ionicons
            name={
              metrics.hydrationStatus === 'ahead'
                ? 'checkmark-circle'
                : metrics.hydrationStatus === 'on-track'
                  ? 'checkmark'
                  : metrics.hydrationStatus === 'critical'
                    ? 'alert'
                    : 'warning'
            }
            size={20}
            color={
              metrics.hydrationStatus === 'on-track' || metrics.hydrationStatus === 'ahead'
                ? Colors.success
                : metrics.hydrationStatus === 'critical'
                  ? Colors.error
                  : Colors.warning
            }
          />
          <Text
            style={[
              styles.statusText,
              {
                color:
                  metrics.hydrationStatus === 'on-track' || metrics.hydrationStatus === 'ahead'
                    ? Colors.success
                    : metrics.hydrationStatus === 'critical'
                      ? Colors.error
                      : Colors.warning,
              },
            ]}
          >
            {metrics.hydrationStatus === 'ahead' && 'Meta alcanzada'}
            {metrics.hydrationStatus === 'on-track' && 'En el ritmo correcto'}
            {metrics.hydrationStatus === 'behind' && 'Ligeramente atrás'}
            {metrics.hydrationStatus === 'critical' && 'Debes beber urgentemente'}
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendaciones personalizadas</Text>
        {recommendations.map((rec, idx) => (
          <View key={idx} style={styles.recCard}>
            <View style={styles.recBullet}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            </View>
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Info */}
      <Text style={styles.infoText}>
        Basado en tu actividad, hora del día y patrones de hidratación históricos.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing[4],
  },
  insightCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightHeader: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  insightIcon: {
    fontSize: 40,
  },
  insightTitleSection: {
    flex: 1,
  },
  insightTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  insightDesc: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing[1],
  },
  actionDesc: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing[3],
    alignItems: 'center',
    borderWidth: 2,
  },
  metricLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing[2],
    textAlign: 'center',
  },
  metricValue: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginTop: Spacing[1],
    textAlign: 'center',
  },
  statusSection: {
    marginBottom: Spacing[5],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radius.md,
    gap: Spacing[2],
  },
  statusText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
  },
  section: {
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[3],
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing[3],
    marginBottom: Spacing[2],
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recBullet: {
    justifyContent: 'center',
  },
  recText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textPrimary,
  },
  infoText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing[4],
    marginBottom: Spacing[4],
    textAlign: 'center',
  },
});
