import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import type { FocusAction, ScoreReason } from '@/hooks/useReadiness';

interface HomeReadinessCardProps {
  predictedScore: number | null;
  scoreReasons: ScoreReason[];
  focusActions: FocusAction[];
  comparisonText?: string | null;
  insightText?: string | null;
  onFocusActionPress: (action: FocusAction) => void;
}

export default function HomeReadinessCard({
  predictedScore,
  scoreReasons,
  focusActions,
  comparisonText,
  insightText,
  onFocusActionPress,
}: HomeReadinessCardProps) {
  return (
    <Card style={styles.card} accentColor={Colors.brand}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Lectura del d?a</Text>
          <Text style={styles.title}>Como puede terminar tu d?a</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeLabel}>Cierre</Text>
          <Text style={styles.scoreBadgeValue}>{predictedScore != null ? Math.round(predictedScore) : '--'}</Text>
        </View>
      </View>

      {comparisonText ? <Text style={styles.comparison}>{comparisonText}</Text> : null}

      <View style={styles.reasonList}>
        {scoreReasons.slice(0, 3).map((reason) => (
          <View key={reason.text} style={styles.reasonRow}>
            <View
              style={[
                styles.reasonIcon,
                reason.type === 'positive' ? styles.reasonIconPositive : styles.reasonIconNegative,
              ]}
            >
              <Ionicons
                name={reason.type === 'positive' ? 'arrow-up' : 'arrow-down'}
                size={12}
                color={reason.type === 'positive' ? Colors.success : Colors.error}
              />
            </View>
            <Text style={styles.reasonText}>{reason.text}</Text>
          </View>
        ))}
      </View>

      {focusActions.length > 0 ? (
        <View style={styles.actions}>
          {focusActions.slice(0, 2).map((action) => (
            <Pressable
              key={`${action.metric}-${action.route}`}
              style={styles.actionPill}
              onPress={() => onFocusActionPress(action)}
              accessibilityRole="button"
            >
              <Text style={styles.actionText}>{action.title}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.brandLight} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {insightText ? (
        <View style={styles.insight}>
          <Ionicons name="analytics" size={14} color={Colors.brandLight} />
          <Text style={styles.insightText}>{insightText}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: Colors.brandLight,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  scoreBadge: {
    minWidth: 78,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.24),
    backgroundColor: withOpacity(Colors.brand, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    alignItems: 'center',
    gap: 2,
  },
  scoreBadgeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  scoreBadgeValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  comparison: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  reasonList: {
    gap: Spacing[2],
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  reasonIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  reasonIconPositive: {
    borderColor: withOpacity(Colors.success, 0.24),
    backgroundColor: withOpacity(Colors.success, 0.12),
  },
  reasonIconNegative: {
    borderColor: withOpacity(Colors.error, 0.24),
    backgroundColor: withOpacity(Colors.error, 0.12),
  },
  reasonText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  actions: {
    gap: Spacing[2],
  },
  actionPill: {
    minHeight: 46,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.2),
    backgroundColor: Colors.glassLight,
    paddingHorizontal: Spacing[4],
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  actionText: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.86),
    padding: Spacing[3],
  },
  insightText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
