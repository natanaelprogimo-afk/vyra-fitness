/**
 * HomeTodayAction Component
 * 
 * Displays the single most important action for today based on:
 * - Active workout session
 * - Scheduled workout + readiness
 * - Nutrition progress
 * - Hydration status
 * - Sleep registration
 * - Steps progress
 * 
 * Rule: ONE dominant action per day
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export interface TodayAction {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  color: string;
  onPress: () => void;
}

interface HomeTodayActionProps {
  action: TodayAction | null;
  loading?: boolean;
}

export default function HomeTodayAction({ action, loading }: HomeTodayActionProps) {
  if (!action) return null;

  return (
    <Pressable
      style={[
        styles.card,
        {
          borderColor: withOpacity(action.color, 0.24),
          backgroundColor: withOpacity(action.color, 0.08),
        },
      ]}
      onPress={action.onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={action.title}
      accessibilityHint={action.body}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: action.color }]}>{action.eyebrow}</Text>
          <Text style={styles.title}>{action.title}</Text>
          <Text style={styles.body}>{action.body}</Text>
        </View>
        <View style={[styles.iconWrap, { backgroundColor: withOpacity(action.color, 0.14) }]}>
          <Ionicons name={action.icon} size={24} color={action.color} />
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.cta, { color: action.color }]}>{action.cta}</Text>
        <Ionicons name="arrow-forward" size={16} color={action.color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    gap: Spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  copy: {
    flex: 1,
    gap: Spacing[1.5],
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  cta: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
});
