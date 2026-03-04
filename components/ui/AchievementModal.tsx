// ============================================================
// VYRA FITNESS — AchievementModal
// Modal fullscreen de celebración para logros, PRs y level ups
// ============================================================

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useUIStore } from '@/stores/uiStore';
import Button from './Button';

export default function AchievementModal() {
  const { achievementModal, hideAchievement } = useUIStore();
  const { visible, type, title, subtitle, coins, xp } = achievementModal;

  const scale   = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    // Haptic celebration
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Animaciones
    opacity.value    = withTiming(1, { duration: 200 });
    scale.value      = withSpring(1, { damping: 12, stiffness: 200 });
    emojiScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.3, { damping: 8, stiffness: 250 }),
        withSpring(1.0, { damping: 12, stiffness: 200 })
      )
    );
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const config = typeConfig[type ?? 'badge'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.container, containerStyle]}>
          {/* Emoji/ícono */}
          <Animated.Text style={[styles.emoji, emojiStyle]}>
            {config.emoji}
          </Animated.Text>

          {/* Tipo */}
          <Text style={[styles.type, { color: config.color }]}>
            {config.typeLabel}
          </Text>

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Subtítulo */}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}

          {/* Rewards */}
          <View style={styles.rewards}>
            {coins > 0 && (
              <View style={styles.reward}>
                <Text style={styles.rewardIcon}>🪙</Text>
                <Text style={styles.rewardText}>+{coins}</Text>
              </View>
            )}
            {xp > 0 && (
              <View style={styles.reward}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={styles.rewardText}>+{xp} XP</Text>
              </View>
            )}
          </View>

          {/* CTA */}
          <Button
            onPress={hideAchievement}
            variant="primary"
            fullWidth
            haptic="medium"
            style={styles.cta}
          >
            ¡Genial! 🎉
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
}

const typeConfig: Record<string, { emoji: string; typeLabel: string; color: string }> = {
  badge:   { emoji: '🏅', typeLabel: '¡Logro desbloqueado!', color: Colors.rarityEpic    },
  pr:      { emoji: '🏆', typeLabel: '¡Récord personal!',   color: Colors.coins          },
  levelup: { emoji: '⚡', typeLabel: '¡Subiste de nivel!',  color: Colors.brand          },
  streak:  { emoji: '🔥', typeLabel: '¡Racha épica!',       color: Colors.fasting        },
};

const styles = StyleSheet.create({
  backdrop: {
    flex:           1,
    backgroundColor:Colors.overlayLight,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        Spacing[6],
  },
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius['3xl'],
    padding:         Spacing[8],
    alignItems:      'center',
    width:           '100%',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  emoji: {
    fontSize:     72,
    marginBottom: Spacing[4],
  },
  type: {
    fontFamily:    FontFamily.semibold,
    fontSize:      FontSize.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  Spacing[2],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize['2xl'],
    color:      Colors.textPrimary,
    textAlign:  'center',
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.base,
    color:      Colors.textSecondary,
    textAlign:  'center',
    marginBottom: Spacing[5],
    lineHeight: FontSize.base * 1.5,
  },
  rewards: {
    flexDirection:  'row',
    gap:            Spacing[4],
    marginBottom:   Spacing[6],
  },
  reward: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing[1],
    backgroundColor: Colors.bgElevated,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius:    Radius.full,
  },
  rewardIcon: {
    fontSize: FontSize.base,
  },
  rewardText: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.base,
    color:      Colors.textPrimary,
  },
  cta: {
    marginTop: 0,
  },
});