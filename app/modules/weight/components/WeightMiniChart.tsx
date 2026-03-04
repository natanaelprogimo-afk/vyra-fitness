import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/theme';

interface ChartPoint {
  date: string;
  weight: number;
}

interface WeightMiniChartProps {
  data: ChartPoint[];
  color: string;
}

const CHART_HEIGHT = 120;
const CHART_PADDING = { top: 16, bottom: 24, left: 8, right: 8 };

export function WeightMiniChart({ data, color }: WeightMiniChartProps) {
  const { width } = Dimensions.get('window');
  const chartWidth = width - 80; // padding horizontal de la card

  if (data.length < 2) return null;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  const innerW = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const toX = (i: number) =>
    CHART_PADDING.left + (i / (data.length - 1)) * innerW;
  const toY = (w: number) =>
    CHART_PADDING.top + (1 - (w - minW) / range) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.weight)}`).join(' ');

  // Mostrar solo primer, medio y último label de fecha
  const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <View>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {/* Línea del gráfico */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Puntos */}
        {data.map((d, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(d.weight)}
            r={i === data.length - 1 ? 5 : 3}
            fill={i === data.length - 1 ? color : `${color}80`}
          />
        ))}

        {/* Labels de fecha */}
        {labelIndices.map((i) => (
          <SvgText
            key={i}
            x={toX(i)}
            y={CHART_HEIGHT - 4}
            textAnchor="middle"
            fill={Colors.textMuted}
            fontSize={10}
          >
            {data[i].date}
          </SvgText>
        ))}

        {/* Valor del último punto */}
        <SvgText
          x={toX(data.length - 1)}
          y={toY(data[data.length - 1].weight) - 8}
          textAnchor="middle"
          fill={color}
          fontSize={12}
          fontWeight="bold"
        >
          {data[data.length - 1].weight.toFixed(1)}
        </SvgText>
      </Svg>
    </View>
  );
}