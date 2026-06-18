/**
 * HomeRecoveryNote Component
 * 
 * Shows contextual guidance:
 * - Recovery recommendation based on readiness
 * - Water/sleep balance
 * - Cycle phase guidance (if female + enabled)
 * 
 * Secondary layer - not primary focus
 */

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export interface RecoveryNote {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  accent: string;
}

interface HomeRecoveryNoteProps {
  note: RecoveryNote | null;
  loading?: boolean;
}

export default function HomeRecoveryNote({ note, loading }: HomeRecoveryNoteProps) {
  if (!note) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(note.accent, 0.08),
          borderColor: withOpacity(note.accent, 0.16),
        },
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={note.title}
      accessibilityHint={note.body}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: withOpacity(note.accent, 0.14) }]}>
          <Ionicons name={note.icon} size={18} color={note.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: note.accent }]}>{note.title}</Text>
          <Text style={styles.body}>{note.body}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing[3],
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  row: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: Spacing[1],
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
