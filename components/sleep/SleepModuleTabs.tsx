import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { SLEEP_INPUT_BG, SLEEP_TABS, type SleepTabKey } from '@/lib/sleep-module';

export default function SleepModuleTabs({ active }: { active: SleepTabKey }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {SLEEP_TABS.map((tab) => {
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
    borderColor: withOpacity(Colors.sleep, 0.14),
    backgroundColor: SLEEP_INPUT_BG,
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
  },
  pillActive: {
    backgroundColor: withOpacity(Colors.sleep, 0.18),
    borderColor: withOpacity(Colors.sleep, 0.3),
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.sleep,
  },
});
