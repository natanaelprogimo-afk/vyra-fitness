import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { FEMALE_TABS, type FemaleTabKey } from '@/lib/female-module';

export default function FemaleModuleTabs({ active }: { active: FemaleTabKey }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {FEMALE_TABS.map((tab) => {
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
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  row: {
    gap: Spacing[2],
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.female, 0.16),
    backgroundColor: '#1E1B2E',
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
