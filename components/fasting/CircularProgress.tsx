import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { withOpacity } from '@/constants/colors';

interface Props {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
}

export default function CircularProgress({ progress, size, strokeWidth, color }: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={withOpacity(color, 0.15)}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </Svg>
  );
}
