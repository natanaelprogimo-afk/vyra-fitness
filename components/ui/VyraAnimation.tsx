import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { getVyraAnimation, type VyraAnimationId } from '@/lib/vyra-animations';

type VyraAnimationProps = {
  variant: VyraAnimationId;
  size?: number;
  style?: StyleProp<ViewStyle>;
  loop?: boolean;
};

export default function VyraAnimation({
  variant,
  size = 72,
  style,
  loop = true,
}: VyraAnimationProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        source={getVyraAnimation(variant) as any}
        autoPlay
        loop={loop}
        resizeMode="contain"
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}
