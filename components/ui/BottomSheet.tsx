// ============================================================
// VYRA FITNESS — BottomSheet
// Bottom sheet con drag, snap points y gestures nativos
// ============================================================

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, FontSize, FontFamily } from '@/constants/theme';

const SCREEN_H = Dimensions.get('window').height;

interface BottomSheetProps {
  visible:    boolean;
  onClose:    () => void;
  children:   React.ReactNode;
  title?:     string;
  snapHeight?: number;              // px del alto del sheet (default 50% pantalla)
  style?:     ViewStyle;
  showHandle?:boolean;
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
  showClose  = false,
}: BottomSheetProps) {
  const translateY = useSharedValue(snapHeight);
  const opacity    = useSharedValue(0);
  const context    = useSharedValue(0);

  const open = useCallback(() => {
    opacity.value    = withTiming(1, { duration: 200 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, []);

  const close = useCallback(() => {
    opacity.value    = withTiming(0, { duration: 180 });
    translateY.value = withTiming(snapHeight, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  }, [snapHeight]);

  useEffect(() => {
    if (visible) open();
    else close();
  }, [visible]);

  // Drag gesture
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, context.value + e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > snapHeight * 0.3 || e.velocityY > 600) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
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
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Sheet */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.sheet,
            { height: snapHeight },
            sheetStyle,
            style,
          ]}
        >
          {/* Handle */}
          {showHandle && <View style={styles.handle} />}

          {/* Header */}
          {(title || showClose) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showClose && (
                <Pressable onPress={close} hitSlop={12}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    zIndex:          50,
  },
  sheet: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: Colors.surface2,
    borderTopLeftRadius:  Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    borderTopWidth:       1,
    borderColor:          Colors.border,
    zIndex:               51,
    overflow:             'hidden',
  },
  handle: {
    width:           42,
    height:          5,
    borderRadius:    Radius.full,
    backgroundColor: Colors.surface3,
    alignSelf:       'center',
    marginTop:       Spacing[3],
    marginBottom:    Spacing[1],
  },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[5],
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize:   FontSize.base,
    color:      Colors.textPrimary,
  },
  closeText: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.sm,
    color:      Colors.textMuted,
  },
  content: {
    flex:              1,
    paddingHorizontal: Spacing[5],
  },
});
