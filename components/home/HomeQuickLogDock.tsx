/**
 * HomeQuickLogDock Component
 *
 * Universal Quick Log interface visible on Home.
 * Shows the active module actions in priority order.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export interface QuickLogAction {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  hint: string;
  color: string;
  taps: number;
  onPress: () => void;
}

interface HomeQuickLogDockProps {
  actions: QuickLogAction[];
  loading?: boolean;
}

function TapIndicator({ count }: { count: number }) {
  return (
    <View style={styles.tapRow}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={[styles.tapDot, i < count && styles.tapDotActive]} />
      ))}
    </View>
  );
}

function QuickActionButton({ action }: { action: QuickLogAction }) {
  return (
    <Pressable
      style={[styles.button, { backgroundColor: withOpacity(action.color, 0.1) }]}
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      accessibilityHint={`${action.hint}. ${action.taps} tap${action.taps > 1 ? 's' : ''}.`}
    >
      <View style={[styles.iconBg, { backgroundColor: withOpacity(action.color, 0.16) }]}>
        <Ionicons name={action.icon} size={18} color={action.color} />
      </View>
      <Text style={[styles.label, { color: action.color }]} numberOfLines={2}>
        {action.label}
      </Text>
      <TapIndicator count={action.taps} />
    </Pressable>
  );
}

export default function HomeQuickLogDock({ actions, loading }: HomeQuickLogDockProps) {
  if (actions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro rápido</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <QuickActionButton key={action.key} action={action} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingRight: Spacing[5],
  },
  button: {
    width: 132,
    minHeight: 96,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    padding: Spacing[3],
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  tapRow: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  tapDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: withOpacity(Colors.white, 0.16),
  },
  tapDotActive: {
    backgroundColor: Colors.action,
  },
});
