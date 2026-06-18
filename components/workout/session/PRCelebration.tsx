import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

interface PRCelebrationProps {
  visible: boolean;
  bannerText: string | null;
}

export function PRCelebration({ visible, bannerText }: PRCelebrationProps) {
  if (!visible || !bannerText) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>{bannerText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  bannerText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.bgPrimary,
    textAlign: 'center',
  },
});
