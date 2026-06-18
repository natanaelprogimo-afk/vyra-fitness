// REDESIGNED: 2026-05-21 - bottom sheet is calmer, safer, and more consistent
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const insets = useSafeAreaInsets();
  const resolvedHeight = useMemo(
    () => Math.min(snapHeight, SCREEN_H * 0.9),
    [snapHeight],
  );
  const [isMounted, setIsMounted] = useState(visible);

  const translateY = useSharedValue(resolvedHeight);
  const opacity = useSharedValue(0);
  const dragStart = useSharedValue(0);

  const animateIn = useCallback(() => {
    opacity.value = withTiming(1, { duration: 180 });
    translateY.value = withTiming(0, { duration: 220 });
  }, [opacity, translateY]);

  const animateOut = useCallback(
    (callback?: () => void) => {
      opacity.value = withTiming(0, { duration: 160 });
      translateY.value = withTiming(resolvedHeight, { duration: 180 }, () => {
        if (callback) {
          runOnJS(callback)();
        }
      });
    },
    [opacity, resolvedHeight, translateY],
  );

  const requestClose = useCallback(() => {
    animateOut(() => {
      setIsMounted(false);
      onClose();
    });
  }, [animateOut, onClose]);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        animateIn();
      });
      return;
    }

    if (isMounted) {
      animateOut(() => setIsMounted(false));
    }
  }, [animateIn, animateOut, isMounted, visible]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      dragStart.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, dragStart.value + event.translationY);
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > resolvedHeight * 0.22 || event.velocityY > 850;

      if (shouldClose) {
        runOnJS(requestClose)();
        return;
      }

      translateY.value = withTiming(0, { duration: 180 });
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isMounted) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: Colors.overlay },
          backdropStyle,
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={requestClose}
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
              height: resolvedHeight,
              backgroundColor: Colors.surface2,
              borderColor: Colors.border,
              paddingBottom: insets.bottom + Spacing[4],
            },
            sheetStyle,
            style,
          ]}
        >
          {showHandle ? <View style={styles.handle} /> : null}

          {(title || showClose) ? (
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                {title ? (
                  <Text
                    style={styles.title}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.2}
                  >
                    {title}
                  </Text>
                ) : null}
              </View>

              {showClose ? (
                <Pressable
                  onPress={requestClose}
                  style={styles.closeButton}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  accessibilityHint="Cierra esta hoja."
                >
                  <Ionicons name="close" size={18} color={Colors.textMuted} />
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
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 51,
    overflow: 'hidden',
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    borderTopWidth: 1,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    lineHeight: 22,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
  },
});
