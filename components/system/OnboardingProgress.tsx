import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { getOnboardingStepMeta, ONBOARDING_STEPS } from '@/constants/onboardingFlow';

interface OnboardingProgressProps {
  pathname: string;
}

export default function OnboardingProgress({ pathname }: OnboardingProgressProps) {
  const meta = getOnboardingStepMeta(pathname);
  const fillWidth = useSharedValue(0);

  if (!meta) return null;

  const progress = Math.max(0, Math.min(1, meta.order / ONBOARDING_STEPS.length));

  // Animate progress fill width
  useEffect(() => {
    fillWidth.value = withTiming(progress * 100, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  }, [progress, fillWidth]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value}%`,
  }));

  // Color gradient: starting from accent, transitioning to action at 50%, to success near end
  const getProgressColor = () => {
    if (progress < 0.5) {
      return Colors.action;
    } else if (progress < 0.85) {
      return Colors.action;
    }
    return Colors.success;
  };

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            animatedFillStyle,
            { backgroundColor: getProgressColor() },
          ]}
        />
      </View>
      <View style={styles.dots}>
        {ONBOARDING_STEPS.map((_, index) => {
          const stepProgress = (index + 1) / ONBOARDING_STEPS.length;
          const isActive = index < meta.order;
          const isCurrent = index === meta.order - 1;

          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && styles.dotActive,
                isCurrent && styles.dotCurrent,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing[2],
  },
  track: {
    width: '100%',
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  dotActive: {
    backgroundColor: Colors.action,
  },
  dotCurrent: {
    backgroundColor: Colors.success,
    height: 5,
  },
});
