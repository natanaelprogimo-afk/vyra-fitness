import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { useSleepPerformanceCorrelation } from '@/hooks/useSleepPerformanceCorrelation';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

interface SleepPerformanceDashboardProps {
  _onInsightPress?: () => void;
}

export function SleepPerformanceDashboard({ _onInsightPress }: SleepPerformanceDashboardProps) {
  const { metrics, insight, recommendations, correlationScore } = useSleepPerformanceCorrelation();
  const [scoreAnim] = useState(new Animated.Value(0));

  // Animate score on mount
  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: correlationScore,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [correlationScore, scoreAnim]);

  // Determine colors based on insight severity
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

      {/* Correlation Score */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreLabel}>Puntuación de correlación</Text>
        <ScoreCircle score={scoreAnim} max={100} />
        <Text style={styles.scoreSubtext}>
          {correlationScore < 50 && 'Necesitas mejorar sueño y actividad'}
          {correlationScore >= 50 && correlationScore < 75 && 'Buen balance, con oportunidades de mejora'}
          {correlationScore >= 75 && 'Excelente correlación sueño-rendimiento'}
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderColor: Colors.sleep }]}>
          <Ionicons name="moon" size={24} color={Colors.sleep} />
          <Text style={styles.metricCardLabel}>Calidad de sueño</Text>
          <Text style={styles.metricCardValue}>{metrics.sleepQuality}</Text>
        </View>

        <View style={[styles.metricCard, { borderColor: Colors.steps }]}>
          <Ionicons name="footsteps" size={24} color={Colors.steps} />
          <Text style={styles.metricCardLabel}>Nivel de actividad</Text>
          <Text style={styles.metricCardValue}>{metrics.activityLevel}</Text>
        </View>

        <View style={[styles.metricCard, { borderColor: Colors.workout }]}>
          <Ionicons name="fitness" size={24} color={Colors.workout} />
          <Text style={styles.metricCardLabel}>Entrenamientos</Text>
          <Text style={styles.metricCardValue}>
            {metrics.workoutQuality ? `${metrics.workoutQuality}/5` : 'N/A'}
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

      {/* Info Text */}
      <Text style={styles.infoText}>
        Las correlaciones se basan en tus últimos 7 días de datos de sueño, actividad y entrenamientos.
      </Text>
    </ScrollView>
  );
}

interface ScoreCircleProps {
  score: Animated.Value;
  max: number;
}

function ScoreCircle({ score, max }: ScoreCircleProps) {
  const animatedText = score.interpolate({
    inputRange: [0, max],
    outputRange: ['0', `${max}`],
  });

  return (
    <View style={styles.scoreCircleContainer}>
      <View style={styles.scoreCircle}>
        <Animated.Text
          style={[
            styles.scoreCircleText,
            {
              color: score.interpolate({
                inputRange: [0, 50, 75, max],
                outputRange: [Colors.error, Colors.warning, Colors.info, Colors.success],
              }),
            },
          ]}
        >
          {animatedText}
        </Animated.Text>
      </View>
    </View>
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
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreLabel: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginVertical: Spacing[4],
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: withOpacity(Colors.info, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.info,
  },
  scoreCircleText: {
    fontSize: 48,
    fontFamily: FontFamily.bold,
  },
  scoreSubtext: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[4],
    textAlign: 'center',
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
  metricCardLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing[2],
    textAlign: 'center',
  },
  metricCardValue: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginTop: Spacing[1],
    textAlign: 'center',
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

SleepPerformanceDashboard.propTypes = {
  _onInsightPress: PropTypes.func,
};
