// ============================================================
// VYRA FITNESS — Modal
// Modal con backdrop animado, swipe-to-close, keyboard aware
// ============================================================

import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Radius, Spacing } from '@/constants/theme';
import Button from './Button';

interface ModalProps {
  visible:      boolean;
  onClose:      () => void;
  title?:       string;
  children:     React.ReactNode;
  showClose?:   boolean;
  ctaLabel?:    string;
  onCta?:       () => void;
  ctaVariant?:  'primary' | 'danger' | 'premium';
  ctaLoading?:  boolean;
  secondaryLabel?: string;
  onSecondary?:    () => void;
  style?:       ViewStyle;
  fullscreen?:  boolean;
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  showClose    = true,
  ctaLabel,
  onCta,
  ctaVariant   = 'primary',
  ctaLoading   = false,
  secondaryLabel,
  onSecondary,
  style,
  fullscreen   = false,
}: ModalProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      opacity.value    = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    } else {
      opacity.value    = withTiming(0, { duration: 180 });
      translateY.value = withTiming(40, { duration: 180 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const contentStyle  = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={showClose ? onClose : undefined} />
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={[
            styles.container,
            fullscreen && styles.fullscreen,
            contentStyle,
            style,
          ]}
        >
          {/* Header */}
          {(title || showClose) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showClose && (
                <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
                  <Text style={styles.closeIcon}>✕</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Body */}
          <View style={styles.body}>{children}</View>

          {/* Footer */}
          {(ctaLabel || secondaryLabel) && (
            <View style={styles.footer}>
              {ctaLabel && onCta && (
                <Button
                  onPress={onCta}
                  variant={ctaVariant}
                  fullWidth
                  loading={ctaLoading}
                  haptic="medium"
                >
                  {ctaLabel}
                </Button>
              )}
              {secondaryLabel && (
                <Button
                  onPress={onSecondary ?? onClose}
                  variant="ghost"
                  fullWidth
                  style={{ marginTop: Spacing[2] }}
                >
                  {secondaryLabel}
                </Button>
              )}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex:           1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  container: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius:  Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    paddingHorizontal:    Spacing[5],
    paddingBottom:        Spacing[8],
    borderTopWidth:       1,
    borderColor:          Colors.border,
    maxHeight:            '90%',
  },
  fullscreen: {
    maxHeight:        '95%',
    borderRadius:     Radius['3xl'],
    margin:           Spacing[4],
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingTop:     Spacing[5],
    paddingBottom:  Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.xl,
    color:      Colors.textPrimary,
    flex:       1,
  },
  closeBtn: {
    width:          32,
    height:         32,
    borderRadius:   16,
    backgroundColor:Colors.bgElevated,
    alignItems:     'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.sm,
    color:      Colors.textMuted,
  },
  body: {
    flexGrow: 1,
  },
  footer: {
    marginTop: Spacing[5],
  },
});
