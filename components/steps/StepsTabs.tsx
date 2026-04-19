import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export type StepsRouteKey = 'index' | 'history' | 'settings' | 'week';

const TABS: Array<{ key: StepsRouteKey; label: string; route: string }> = [
  { key: 'index', label: 'Hoy', route: Routes.steps.index },
  { key: 'history', label: 'Historial', route: Routes.steps.history },
  { key: 'settings', label: 'Ajustes', route: Routes.steps.settings },
  { key: 'week', label: 'Semana', route: Routes.steps.week },
];

export default function StepsTabs({ active }: { active: StepsRouteKey }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => {
                if (!isActive) router.push(tab.route as any);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
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
  tab: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.bgFloating, 0.9),
  },
  tabActive: {
    borderColor: withOpacity(Colors.steps, 0.36),
    backgroundColor: withOpacity(Colors.steps, 0.18),
  },
  tabText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  tabTextActive: {
    color: Colors.steps,
  },
});
