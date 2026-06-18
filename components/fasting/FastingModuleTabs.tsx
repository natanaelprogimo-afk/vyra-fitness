import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { FASTING_TABS, type FastingTabKey } from '@/lib/fasting-module';

export default function FastingModuleTabs({ active }: { active: FastingTabKey }) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="tablist"
      accessibilityLabel="Secciones del modulo de ayuno"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {FASTING_TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Pestana ${tab.label}`}
              accessibilityHint={
                isActive
                  ? `Ya estas en ${tab.label}.`
                  : `Abre ${tab.label} dentro del modulo de ayuno.`
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
  },
  row: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
  },
  pill: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.base, 0.9),
    paddingHorizontal: Spacing[3],
    paddingVertical: 12,
  },
  pillActive: {
    backgroundColor: withOpacity(Colors.fasting, 0.18),
    borderColor: withOpacity(Colors.fasting, 0.6),
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  pillTextActive: {
    color: Colors.fasting,
    fontFamily: FontFamily.bold,
  },
});
