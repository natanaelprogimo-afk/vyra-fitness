import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useUIStore, type ToastType } from '@/stores/uiStore';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';

const TOAST_BORDER: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.error,
  warning: Colors.warning,
  info: Colors.brand,
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
  const translateY = useSharedValue(reduceMotionEnabled ? 0 : -24);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(reduceMotionEnabled ? 1 : 0);

  React.useEffect(() => {
    if (reduceMotionEnabled) return;
    translateY.value = withTiming(0, { duration: 220 });
    opacity.value = withTiming(1, { duration: 180 });
  }, [opacity, reduceMotionEnabled, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const dismiss = React.useCallback(() => {
    if (reduceMotionEnabled) {
      dismissToast(id);
      return;
    }
    opacity.value = withTiming(0, { duration: 140 });
    translateY.value = withTiming(-18, { duration: 140 });
    translateX.value = withTiming(0, { duration: 140 });
    dismissToast(id);
  }, [dismissToast, id, opacity, reduceMotionEnabled, translateX, translateY]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX;
      opacity.value = Math.max(0.35, 1 - Math.abs(event.translationX) / 180);
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 72 || Math.abs(event.velocityX) > 700) {
        runOnJS(dismissToast)(id);
        return;
      }
      translateX.value = withTiming(0, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 });
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animStyle}>
        <Pressable
          onPress={dismiss}
          style={[
            styles.toast,
            {
              borderLeftColor: TOAST_BORDER[type],
              backgroundColor: Colors.surface2,
              borderColor: Colors.border,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Text style={[styles.message, { color: Colors.textPrimary }]} numberOfLines={2}>
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
    borderRadius: Radius.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing[5],
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  message: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
