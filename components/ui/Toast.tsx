// REDESIGNED: 2026-05-21 - toast feedback is lighter, clearer, and more compact
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';
import { useUIStore, type ToastType } from '@/stores/uiStore';

const TOAST_ICON: Record<ToastType, React.ComponentProps<typeof Ionicons>['name']> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'alert-circle',
  info: 'information-circle',
};

const TOAST_COLOR: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.error,
  warning: Colors.warning,
  info: Colors.info,
};

function ToastItem({
  id,
  message,
  type,
}: {
  id: string;
  message: string;
  type: ToastType;
}) {
  const dismissToast = useUIStore((state) => state.dismissToast);
  const { reduceMotionEnabled } = useAccessibilityPreferences();
  const translateY = useSharedValue(reduceMotionEnabled ? 0 : -18);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(reduceMotionEnabled ? 1 : 0);

  React.useEffect(() => {
    if (reduceMotionEnabled) return;
    translateY.value = withTiming(0, { duration: 180 });
    opacity.value = withTiming(1, { duration: 160 });
  }, [opacity, reduceMotionEnabled, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const dismiss = React.useCallback(() => {
    if (reduceMotionEnabled) {
      dismissToast(id);
      return;
    }
    opacity.value = withTiming(0, { duration: 140 });
    translateY.value = withTiming(-12, { duration: 140 });
    dismissToast(id);
  }, [dismissToast, id, opacity, reduceMotionEnabled, translateY]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX;
      opacity.value = Math.max(0.35, 1 - Math.abs(event.translationX) / 180);
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 72 || Math.abs(event.velocityX) > 700) {
        dismissToast(id);
        return;
      }
      translateX.value = withTiming(0, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 });
    });

  const accent = TOAST_COLOR[type];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={dismiss}
          style={[
            styles.toast,
            {
              backgroundColor: Colors.surface2,
              borderColor: Colors.border,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <View style={[styles.iconWrap, { backgroundColor: withOpacity(accent, 0.14) }]}>
            <Ionicons name={TOAST_ICON[type]} size={16} color={accent} />
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const insets = useSafeAreaInsets();
  const firstToast = toasts[0];

  if (!firstToast) return null;

  return (
    <View style={[styles.container, { top: insets.top + Spacing[4] }]} pointerEvents="box-none">
      <ToastItem id={firstToast.id} message={firstToast.message} type={firstToast.type} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 99,
  },
  toast: {
    minHeight: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2.5],
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
