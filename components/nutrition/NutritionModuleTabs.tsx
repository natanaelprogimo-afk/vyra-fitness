import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export type NutritionTabKey = 'home' | 'log' | 'history' | 'settings';

const TABS: Array<{ key: NutritionTabKey; label: string; route: string }> = [
  { key: 'home', label: 'Hoy', route: Routes.nutrition.index },
  { key: 'log', label: 'Registro', route: Routes.nutrition.log },
  { key: 'history', label: 'Historial', route: Routes.nutrition.history },
  { key: 'settings', label: 'Ajustes', route: Routes.nutrition.settings },
];

export default function NutritionModuleTabs({ active }: { active: NutritionTabKey }) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="tablist"
      accessibilityLabel="Secciones del módulo de nutrición"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Pestaña ${tab.label}`}
              accessibilityHint={
                isActive
                  ? `Ya estás en ${tab.label}.`
                  : `Abre ${tab.label} dentro del módulo de nutrición.`
              }
              hitSlop={8}
              onPress={() => {
                if (!isActive) router.push(tab.route as never);
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
    marginBottom: Spacing[3],
  },
  row: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
  },
  pill: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.base, 0.9),
    paddingHorizontal: Spacing[3.5],
    paddingVertical: 10,
  },
  pillActive: {
    backgroundColor: withOpacity(Colors.nutrition, 0.16),
    borderColor: withOpacity(Colors.nutrition, 0.4),
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.nutrition,
  },
});
