import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export type WorkoutTabKey = 'home' | 'routines' | 'exercises' | 'programs' | 'history' | 'settings';

const TABS: Array<{ key: WorkoutTabKey; label: string; route: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'home', label: 'Hoy', route: Routes.workout.index, icon: 'sparkles-outline' },
  { key: 'routines', label: 'Rutinas', route: Routes.workout.routines, icon: 'albums-outline' },
  { key: 'exercises', label: 'Ejercicios', route: Routes.workout.exercises, icon: 'barbell-outline' },
  { key: 'programs', label: 'Programas', route: Routes.workout.programs, icon: 'layers-outline' },
  { key: 'history', label: 'Historial', route: Routes.workout.history, icon: 'time-outline' },
  { key: 'settings', label: 'Ajustes', route: Routes.workout.settings, icon: 'options-outline' },
];

export default function WorkoutTabs({ active }: { active: WorkoutTabKey }) {
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
              <Ionicons name={tab.icon} size={14} color={isActive ? Colors.workout : Colors.textMuted} />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{tab.label}</Text>
              {isActive ? <View style={styles.activeDot} /> : null}
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
  },
  row: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingBottom: 4,
  },
  pill: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.bgFloating, 0.9),
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[1.75],
  },
  pillActive: {
    borderColor: withOpacity(Colors.workout, 0.4),
    backgroundColor: withOpacity(Colors.workout, 0.16),
    shadowColor: Colors.workout,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.workout,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
  },
});
