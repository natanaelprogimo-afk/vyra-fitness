import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { FEMALE_TABS, type FemaleTabKey } from '@/lib/female-module';

export default function FemaleModuleTabs({ active }: { active: FemaleTabKey }) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="tablist"
      accessibilityLabel="Secciones del modulo de salud femenina"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {FEMALE_TABS.map((tab) => {
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
                  : `Abre ${tab.label} dentro del modulo de salud femenina.`
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
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  row: {
    gap: Spacing[2],
  },
  pill: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.bgFloating, 0.9),
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
  },
  pillActive: {
    backgroundColor: withOpacity(Colors.female, 0.16),
    borderColor: withOpacity(Colors.female, 0.32),
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.female,
  },
});
