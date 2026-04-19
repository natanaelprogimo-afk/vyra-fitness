import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { getOnboardingStepMeta, ONBOARDING_STEPS } from '@/constants/onboardingFlow';

interface OnboardingProgressProps {
  pathname: string;
}

export default function OnboardingProgress({ pathname }: OnboardingProgressProps) {
  const meta = getOnboardingStepMeta(pathname);
  if (!meta) return null;

  return (
    <View style={styles.row}>
      {ONBOARDING_STEPS.map((step) => {
        const isActive = step.order === meta.order;
        const isComplete = step.order < meta.order;
        return (
          <View key={step.pathname} style={styles.track}>
            <View
              style={[
                styles.fill,
                isComplete && styles.fillComplete,
                isActive && styles.fillActive,
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  track: {
    flex: 1,
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    width: '0%',
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.action, 0.22),
  },
  fillComplete: {
    width: '100%',
    backgroundColor: Colors.action,
  },
  fillActive: {
    width: '100%',
    backgroundColor: Colors.action,
  },
});
