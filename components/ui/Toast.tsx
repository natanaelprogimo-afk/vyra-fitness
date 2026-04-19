import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useUIStore, type ToastType } from '@/stores/uiStore';

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
  const translateY = useSharedValue(-24);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 220 });
    opacity.value = withTiming(1, { duration: 180 });
  }, [opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const dismiss = React.useCallback(() => {
    opacity.value = withTiming(0, { duration: 140 });
    translateY.value = withTiming(-18, { duration: 140 });
    translateX.value = withTiming(0, { duration: 140 });
    dismissToast(id);
  }, [dismissToast, id, opacity, translateX, translateY]);

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
        <Pressable onPress={dismiss} style={[styles.toast, { borderLeftColor: TOAST_BORDER[type] }]}>
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
    <Animated.View style={[styles.container, { top: insets.top + Spacing[4] }]}>
      <ToastItem id={firstToast.id} message={firstToast.message} type={firstToast.type} />
    </Animated.View>
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
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    borderLeftWidth: 4,
  },
  message: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
});
