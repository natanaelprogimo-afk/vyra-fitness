// ============================================================
// VYRA FITNESS - BottomSheet
// Bottom sheet con drag, snap points y gestures nativos
// ============================================================

import React, { useCallback, useEffect } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const SCREEN_H = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapHeight?: number;
  style?: ViewStyle;
  showHandle?: boolean;
  showClose?: boolean;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  title,
  snapHeight = SCREEN_H * 0.55,
  style,
  showHandle = true,
  showClose = false,
}: BottomSheetProps) {
  const translateY = useSharedValue(snapHeight);
  const opacity = useSharedValue(0);
  const context = useSharedValue(0);

  const open = useCallback(() => {
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 180 });
  }, [opacity, translateY]);

  const close = useCallback(() => {
    opacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(snapHeight, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  }, [onClose, opacity, snapHeight, translateY]);

  useEffect(() => {
    if (visible) {
      open();
      return;
    }
    close();
  }, [close, open, visible]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value + event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > snapHeight * 0.3 || event.velocityY > 600) {
        runOnJS(close)();
      } else {
        translateY.value = withTiming(0, { duration: 160 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible ? 'auto' : 'none',
  }));

  if (!visible && translateY.value >= snapHeight) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: Colors.overlay },
          backdropStyle,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Cerrar hoja"
          accessibilityHint="Toca fuera de la hoja para cerrarla."
        />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.sheet,
            {
              height: snapHeight,
              backgroundColor: Colors.surface2,
              borderColor: Colors.border,
            },
            sheetStyle,
            style,
          ]}
        >
          {showHandle ? (
            <View
              style={[
                styles.handle,
                { backgroundColor: Colors.surface3 },
              ]}
            />
          ) : null}

          {title || showClose ? (
            <View style={styles.header}>
              {title ? (
                <Text style={[styles.title, { color: Colors.textPrimary }]}>{title}</Text>
              ) : null}
              {showClose ? (
                <Pressable
                  onPress={close}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                >
                  <Text style={[styles.closeText, { color: Colors.textMuted }]}>x</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    borderTopWidth: 1,
    zIndex: 51,
    overflow: 'hidden',
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing[3],
    marginBottom: Spacing[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[5],
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
  },
  closeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
  },
});
