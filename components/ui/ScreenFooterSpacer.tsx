import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ComponentHeight, Spacing } from '@/constants/theme';

interface ScreenFooterSpacerProps {
  extra?: number;
}

export default function ScreenFooterSpacer({ extra = 0 }: ScreenFooterSpacerProps) {
  const insets = useSafeAreaInsets();
  const height = Math.max(ComponentHeight.tabBar + insets.bottom + Spacing[6], 112) + extra;
  return <View style={{ height }} pointerEvents="none" />;
}
