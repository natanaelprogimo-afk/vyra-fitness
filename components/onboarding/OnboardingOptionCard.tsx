/**
 * OnboardingOptionCard - Standardized selection component for onboarding
 * 
 * Features:
 * - Full-card highlight on selection (consistent across all steps)
 * - Haptic feedback on tap
 * - Reduced opacity for unselected cards
 * - Animated scale on press (memoized for performance)
 * - Min 44x44px touch targets
 * - Optional icon/emoji support
 * - Optional subtitle/description
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

interface OnboardingOptionCardProps {
  /** Unique identifier for this option */
  id: string;
  /** Main label text */
  label: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional emoji or icon content */
  icon?: string;
  /** Whether this option is selected */
  isSelected: boolean;
  /** Callback when pressed */
  onPress: (id: string) => void;
  /** Optional custom style override */
  style?: ViewStyle;
  /** Optional color accent for the card */
  accentColor?: string;
  /** Optional flag to disable this option */
  disabled?: boolean;
}

// Memoized animated component to avoid recreating on every render
const MemoizedAnimatedPressable = React.memo(
  Animated.createAnimatedComponent(Pressable),
);

function OnboardingOptionCardContent({
  id,
  label,
  subtitle,
  icon,
  isSelected,
  onPress,
  style,
  accentColor = Colors.action,
  disabled = false,
}: OnboardingOptionCardProps) {
  const scale = useSharedValue(1);
  const [expanded, setExpanded] = useState(false);

  const handlePress = useCallback(() => {
    if (disabled) return;

    // If already selected, toggle expand instead of reselecting
    if (isSelected) {
      setExpanded((prev) => !prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    scale.value = withSpring(0.96, {
      damping: 10,
      mass: 1,
      overshootClamping: true,
    });

    // Haptic feedback on selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Trigger callback and animate back
    onPress(id);
    setExpanded(false); // Reset expand on new selection

    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
  }, [isSelected, disabled, id, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const memoizedAnimatedStyle = useMemo(() => animatedStyle, [animatedStyle]);

  return (
    <MemoizedAnimatedPressable
      style={[
        styles.container,
        expanded && styles.containerExpanded,
        isSelected && styles.selected,
        isSelected && { borderColor: accentColor, borderWidth: 2 },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      accessibilityHint={subtitle}
    >
      {/* Background highlight on selection */}
      {isSelected && (
        <View
          style={[
            styles.selectedBg,
            { backgroundColor: withOpacity(accentColor, 0.08) },
          ]}
        />
      )}

      {/* Content container */}
      <View style={styles.content}>
        {/* Icon/Emoji area */}
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}

        {/* Text area */}
        <View style={[styles.textContainer, icon ? { flex: 1 } : styles.fullWidth]}>
          <Text
            style={[
              styles.label,
              isSelected && styles.labelSelected,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>

          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                isSelected && styles.subtitleSelected,
                expanded && styles.subtitleExpanded,
              ]}
              numberOfLines={expanded ? 0 : 1}
            >
              {subtitle}
              {isSelected && !expanded && <Text style={styles.expandIndicator}> ↓</Text>}
            </Text>
          )}
        </View>

        {/* Checkmark indicator when selected */}
        {isSelected && (
          <View style={styles.checkContainer}>
            <View style={[styles.checkBackground, { backgroundColor: accentColor }]} />
            <Text style={[styles.checkmark, { color: Colors.white }]}>✓</Text>
          </View>
        )}
      </View>
    </MemoizedAnimatedPressable>
  );
}

// Export memoized version to prevent unnecessary re-renders in parent components
const MemoizedOnboardingOptionCard = React.memo(
  OnboardingOptionCardContent,
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.isSelected === next.isSelected &&
      prev.disabled === next.disabled &&
      prev.label === next.label &&
      prev.subtitle === next.subtitle &&
      prev.icon === next.icon &&
      prev.accentColor === next.accentColor
    );
  },
);

export default MemoizedOnboardingOptionCard;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 44, // Min touch target
    minWidth: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface1, 0.6),
    padding: Spacing[3],
    gap: Spacing[2],
    overflow: 'hidden',
  },
  containerExpanded: {
    minHeight: 'auto',
    paddingVertical: Spacing[4],
  },
  selected: {
    backgroundColor: withOpacity(Colors.surface1, 1),
    borderColor: Colors.action,
    borderWidth: 2,
  },
  selectedBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: withOpacity(Colors.white, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    justifyContent: 'center',
    gap: Spacing[1],
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  labelSelected: {
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  subtitleSelected: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  subtitleExpanded: {
    fontSize: FontSize.sm,
    lineHeight: 18,
    marginTop: Spacing[1],
  },
  expandIndicator: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.semibold,
  },
  checkContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  checkBackground: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: withOpacity(Colors.action, 0.1),
  },
  checkmark: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.white,
    position: 'absolute',
  },
});
