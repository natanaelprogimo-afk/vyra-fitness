import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import type { ModuleId } from '@/constants/modules';

export interface HomeAgendaItem {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  actionLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  moduleId?: ModuleId;
}

interface HomeAgendaCardProps {
  items: HomeAgendaItem[];
  summary: string;
  onItemPress: (item: HomeAgendaItem) => void;
}

export default function HomeAgendaCard({
  items,
  summary,
  onItemPress,
}: HomeAgendaCardProps) {
  return (
    <Card style={styles.card} accentColor={Colors.brand}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Agenda inmediata</Text>
          <Text style={styles.title}>Qu conviene hacer ahora</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length > 0 ? `${items.length} hoy` : 'En orden'}</Text>
        </View>
      </View>

      <Text style={styles.summary}>{summary}</Text>

      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => onItemPress(item)}
              accessibilityRole="button"
            >
              <View style={[styles.iconWrap, { backgroundColor: withOpacity(item.color, 0.14), borderColor: withOpacity(item.color, 0.24) }]}>
                <Ionicons name={item.icon} size={16} color={item.color} />
              </View>

              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              </View>

              <View style={styles.action}>
                <Text style={styles.actionText}>{item.actionLabel}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={styles.emptyText}>Tu agenda va al d?a. Abre un m?dulo para sumar otra victoria r?pida.</Text>
        </View>
      )}
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
  badge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.glassLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
  },
  badgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  summary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  list: {
    gap: Spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.9),
    padding: Spacing[4],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  rowSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  action: {
    alignItems: 'flex-end',
    gap: 2,
  },
  actionText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.22),
    backgroundColor: withOpacity(Colors.success, 0.08),
    padding: Spacing[4],
  },
  emptyText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
});
