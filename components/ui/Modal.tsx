// ============================================================
// VYRA FITNESS - Modal
// Modal con backdrop animado y acciones opcionales
// ============================================================

import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import Button from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showClose?: boolean;
  ctaLabel?: string;
  onCta?: () => void;
  ctaVariant?: 'primary' | 'danger' | 'premium';
  ctaLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  style?: ViewStyle;
  fullscreen?: boolean;
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  showClose = true,
  ctaLabel,
  onCta,
  ctaVariant = 'primary',
  ctaLoading = false,
  secondaryLabel,
  onSecondary,
  style,
  fullscreen = false,
}: ModalProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      return;
    }

    opacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(40, { duration: 180 });
  }, [opacity, translateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const contentStyle = useAnimatedStyle(() => ({
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
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: Colors.overlay },
            backdropStyle,
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={showClose ? onClose : undefined}
            accessibilityRole="button"
            accessibilityLabel="Cerrar modal"
            accessibilityHint="Toca fuera del contenido para cerrar esta ventana."
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.container,
            fullscreen && styles.fullscreen,
            {
              backgroundColor: Colors.bgSurface,
              borderColor: Colors.border,
            },
            contentStyle,
            style,
          ]}
        >
          {title || showClose ? (
            <View style={styles.header}>
              {title ? (
                <Text style={[styles.title, { color: Colors.textPrimary }]}>{title}</Text>
              ) : null}
              {showClose ? (
                <Pressable
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: Colors.bgElevated },
                  ]}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                >
                  <Text style={[styles.closeIcon, { color: Colors.textMuted }]}>x</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View style={styles.body}>{children}</View>

          {ctaLabel || secondaryLabel ? (
            <View style={styles.footer}>
              {ctaLabel && onCta ? (
                <Button
                  onPress={onCta}
                  variant={ctaVariant}
                  fullWidth
                  loading={ctaLoading}
                  haptic="medium"
                >
                  {ctaLabel}
                </Button>
              ) : null}
              {secondaryLabel ? (
                <Button
                  onPress={onSecondary ?? onClose}
                  variant="ghost"
                  fullWidth
                  style={{ marginTop: Spacing[2] }}
                >
                  {secondaryLabel}
                </Button>
              ) : null}
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  fullscreen: {
    maxHeight: '95%',
    borderRadius: Radius['3xl'],
    margin: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  body: {
    flexGrow: 1,
  },
  footer: {
    marginTop: Spacing[5],
  },
});
