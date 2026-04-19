import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/theme';

interface BmiGaugeProps {
  bmi: number;
  category: string;
}

const BMI_RANGES = [
  { label: 'Bajo', min: 0, max: 18.5, color: '#60A5FA' },
  { label: 'Normal', min: 18.5, max: 25, color: Colors.success },
  { label: 'Sobrepeso', min: 25, max: 30, color: Colors.warning },
  { label: 'Obesidad', min: 30, max: 45, color: Colors.error },
];

function bmiToAngle(bmi: number): number {
  const clamped = Math.max(10, Math.min(45, bmi));
  return ((clamped - 10) / (45 - 10)) * 180 - 90;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

export default function BmiGauge({ bmi, category }: BmiGaugeProps) {
  const cx = 100;
  const cy = 90;
  const radius = 70;
  const angle = bmiToAngle(bmi);
  const needle = polarToCartesian(cx, cy, radius - 10, angle);
  const categoryColor =
    BMI_RANGES.find((range) => bmi >= range.min && bmi < range.max)?.color ?? Colors.error;

  return (
    <View style={styles.container}>
      <Svg width={200} height={110} viewBox="0 0 200 110">
        {BMI_RANGES.map((range) => {
          const startAngle = ((range.min - 10) / 35) * 180 - 90;
          const endAngle = ((Math.min(range.max, 45) - 10) / 35) * 180 - 90;
          const start = polarToCartesian(cx, cy, radius, startAngle);
          const end = polarToCartesian(cx, cy, radius, endAngle);
          return (
            <Path
              key={range.label}
              d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
              stroke={range.color}
              strokeWidth={16}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}

        <Path
          d={`M ${cx} ${cy} L ${needle.x} ${needle.y}`}
          stroke={Colors.textPrimary}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Circle cx={cx} cy={cy} r={5} fill={Colors.textPrimary} />

        <SvgText
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fill={categoryColor}
          fontSize={22}
          fontWeight="bold"
        >
          {bmi.toFixed(1)}
        </SvgText>
      </Svg>

      <View style={styles.legend}>
        {BMI_RANGES.map((range) => (
          <View key={range.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: range.color }]} />
            <Text
              style={[
                styles.legendText,
                bmi >= range.min && bmi < range.max ? styles.legendActive : null,
              ]}
            >
              {range.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.category, { color: categoryColor }]}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textMuted,
  },
  legendActive: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
  },
  category: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
  },
});
