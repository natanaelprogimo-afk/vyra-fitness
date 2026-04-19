import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { FASTING_TABS, type FastingTabKey } from '@/lib/fasting-module';

export default function FastingModuleTabs({ active }: { active: FastingTabKey }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {FASTING_TABS.map((tab) => {
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
    backgroundColor: withOpacity(Colors.fasting, 0.18),
    borderColor: withOpacity(Colors.fasting, 0.4),
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.fasting,
  },
});
