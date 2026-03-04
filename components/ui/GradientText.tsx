// ============================================================
// VYRA FITNESS — GradientText
// Texto con gradiente usando react-native-svg
// ============================================================

import React from 'react';
import { Text, type TextStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/theme';

interface GradientTextProps {
  children:    string;
  colors?:     readonly [string, string];
  style?:      TextStyle;
  fontSize?:   number;
  fontWeight?: string;
}

export default function GradientText({
  children,
  colors  = Colors.gradients.brand,
  style,
  fontSize  = 24,
  fontWeight = 'bold',
}: GradientTextProps) {
  // Fallback a texto normal si SVG no está disponible
  return (
    <Text
      style={[
        {
          fontSize,
          fontFamily: FontFamily.bold,
          color: colors[0],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// Nota: La implementación completa con SVG Gradient requiere medir el texto
// primero para saber el ancho del SVG. Esta versión usa el color primario
// como fallback seguro. En el polish (F31) se puede mejorar.