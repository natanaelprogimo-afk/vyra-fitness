// ============================================================
// VYRA FITNESS — OfflineNotice
// Banner que aparece cuando no hay conexión a internet
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';
import { useUIStore } from '@/stores/uiStore';

export default function OfflineNotice() {
  const isOnline = useUIStore((s) => s.isOnline);
  const opacity  = useSharedValue(0);
  const height   = useSharedValue(0);

  useEffect(() => {
    if (!isOnline) {
      opacity.value = withTiming(1, { duration: 250 });
      height.value  = withTiming(36, { duration: 250 });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      height.value  = withTiming(0, { duration: 250 });
    }
  }, [isOnline]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height:  height.value,
  }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>
        Sin señal — seguí loggeando, lo sincronizo cuando vuelva.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.warningBg,
    paddingHorizontal: Spacing[4],
    gap:             Spacing[2],
    overflow:        'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '44',
  },
  icon: {
    fontSize: FontSize.sm,
  },
  text: {
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.xs,
    color:      Colors.warning,
    flex:       1,
  },
});