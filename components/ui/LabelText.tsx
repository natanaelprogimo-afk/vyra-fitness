import React from 'react';
import { Text, type TextProps } from 'react-native';

type LabelTextProps = TextProps & {
  text?: string;
  minScale?: number;
};

export default function LabelText({
  text,
  children,
  minScale = 0.8,
  numberOfLines,
  ellipsizeMode,
  adjustsFontSizeToFit,
  minimumFontScale,
  ...props
}: LabelTextProps) {
  const content = text ?? children;
  const raw = typeof content === 'string' ? content : null;
  const isSingleWord = raw ? !/\s/.test(raw.trim()) : false;

  return (
    <Text
      {...props}
      numberOfLines={isSingleWord ? 1 : numberOfLines}
      ellipsizeMode={isSingleWord ? 'tail' : ellipsizeMode}
      adjustsFontSizeToFit={isSingleWord ? true : adjustsFontSizeToFit}
      minimumFontScale={isSingleWord ? minScale : minimumFontScale}
    >
      {content}
    </Text>
  );
}
