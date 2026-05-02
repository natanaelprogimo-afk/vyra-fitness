import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/theme';

interface GradientTextProps {
  children: string;
  colors?: readonly [string, string];
  style?: TextStyle;
  fontSize?: number;
  fontWeight?: 'bold' | 'semibold';
}

export default function GradientText({
  children,
  colors = Colors.gradients.brand,
  style,
  fontSize = 24,
  fontWeight = 'bold',
}: GradientTextProps) {
  const fontFamily = fontWeight === 'bold' ? FontFamily.bold : FontFamily.semibold;

  // Fallback seguro mientras el componente siga usando texto nativo.
  return (
    <Text
      style={[
        {
          fontSize,
          fontFamily,
          color: colors[0],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
