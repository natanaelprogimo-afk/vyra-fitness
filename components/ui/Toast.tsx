// ============================================================
// VYRA FITNESS — Toast System
// Notificaciones in-app con animación y auto-dismiss
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useUIStore, type ToastType } from '@/stores/uiStore';

// ─── Toast individual ────────────────────────────────────────

interface ToastItemProps {
  message: string;
  type:    ToastType;
}

const toastConfig: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: Colors.successBg, icon: '✅', border: Colors.success },
  error:   { bg: Colors.errorBg,   icon: '❌', border: Colors.error   },
  warning: { bg: Colors.warningBg, icon: '⚠️', border: Colors.warning },
  info:    { bg: Colors.infoBg,    icon: 'ℹ️', border: Colors.info    },
  coins:   { bg: Colors.coinsBg,   icon: '🪙', border: Colors.coins   },
};

function ToastItem({ message, type }: ToastItemProps) {
  const translateY = useSharedValue(-80);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    opacity.value    = withTiming(1, { duration: 180 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity:   opacity.value,
  }));

  const config = toastConfig[type];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.bg,
          borderLeftColor: config.border,
        },
        animStyle,
      ]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

// ─── Container global — montar en _layout.tsx ────────────────

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { top: insets.top + Spacing[4] }]}
      pointerEvents="none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} type={t.type} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left:     Spacing[4],
    right:    Spacing[4],
    zIndex:   99,
    gap:      Spacing[2],
  },
  toast: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   Radius.xl,
    paddingVertical:   Spacing[3],
    paddingHorizontal: Spacing[4],
    borderLeftWidth:   4,
    gap:            Spacing[2.5],
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius:   8,
    elevation:      8,
  },
  icon: {
    fontSize: FontSize.base,
  },
  message: {
    flex:       1,
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.sm,
    color:      Colors.textPrimary,
  },
});