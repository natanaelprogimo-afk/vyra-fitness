import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export interface HomeDayPlanItem {
  id: string;
  slot: 'Ahora' | 'Despuém?s' | 'Cierre';
  title: string;
  subtitle: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface HomeDayPlanCardProps {
  items: HomeDayPlanItem[];
  onItemPress: (item: HomeDayPlanItem) => void;
}

export default function HomeDayPlanCard({ items, onItemPress }: HomeDayPlanCardProps) {
  return (
    <Card style={styles.card} accentColor={Colors.brand}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Plan del d?a</Text>
          <Text style={styles.title}>Ahora, despues y cierre</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length}/3</Text>
        </View>
      </View>

      <Text style={styles.summary}>
        SA solo abres VYRA una vez, esto es lo que m?s conviene resolver para que el d?a termine bien.
      </Text>

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.row}
            onPress={() => onItemPress(item)}
            accessibilityRole="button"
          >
            <View style={styles.slotWrap}>
              <Text style={styles.slotText}>{item.slot}</Text>
            </View>

            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: withOpacity(item.color, 0.14),
                  borderColor: withOpacity(item.color, 0.28),
                },
              ]}
            >
              <Ionicons name={item.icon} size={16} color={item.color} />
            </View>

            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        ))}
      </View>
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
  slotWrap: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.glassLight,
    paddingHorizontal: Spacing[2.5],
  },
  slotText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
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
});
