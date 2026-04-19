import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export type WaterTabKey = 'home' | 'week' | 'settings';

const TABS: Array<{ key: WaterTabKey; label: string; route: string }> = [
  { key: 'home', label: 'Hoy', route: Routes.water.index },
  { key: 'week', label: 'Tu semana', route: Routes.water.history },
  { key: 'settings', label: 'Ajustes', route: Routes.water.settings },
];

export default function WaterModuleTabs({ active }: { active: WaterTabKey }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                if (!isActive) router.push(tab.route as any);
              }}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -Spacing[5],
  },
  row: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.bgFloating, 0.9),
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
  },
  pillActive: {
    backgroundColor: withOpacity(Colors.water, 0.16),
    borderColor: withOpacity(Colors.water, 0.42),
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.water,
  },
});
