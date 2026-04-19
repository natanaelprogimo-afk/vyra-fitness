import React from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import type { WeightTrendEvent } from '@/lib/progress-insights';

interface WeightTrendPoint {
  date: string;
  weight: number;
  isoDate?: string;
}

interface WeightTrendChartProps {
  data: WeightTrendPoint[];
  color?: string;
  events?: WeightTrendEvent[];
}

const CHART_HEIGHT = 120;
const CHART_PADDING = { top: 16, bottom: 24, left: 8, right: 8 };

export default function WeightTrendChart({
  data,
  color = Colors.weight,
  events = [],
}: WeightTrendChartProps) {
  const { width } = Dimensions.get('window');
  const chartWidth = width - 80;

  if (data.length < 2) return null;

  const weights = data.map((item) => item.weight);
  const minWeight = Math.min(...weights) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const range = maxWeight - minWeight || 1;

  const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const toX = (index: number) =>
    CHART_PADDING.left + (index / (data.length - 1)) * innerWidth;
  const toY = (weight: number) =>
    CHART_PADDING.top + (1 - (weight - minWeight) / range) * innerHeight;

  const points = data.map((item, index) => `${toX(index)},${toY(item.weight)}`).join(' ');
  const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
  const eventColorByTone = {
    milestone: Colors.brand,
    goal: Colors.success,
    context: Colors.warning,
  } as const;

  return (
    <View>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((item, index) => (
          <Circle
            key={`${item.date}-${index}`}
            cx={toX(index)}
            cy={toY(item.weight)}
            r={index === data.length - 1 ? 5 : 3}
            fill={index === data.length - 1 ? color : `${color}80`}
          />
        ))}

        {events.map((event) => {
          const index = data.findIndex((item) => item.isoDate === event.isoDate);
          if (index < 0) return null;

          const eventColor = eventColorByTone[event.tone] ?? Colors.brand;
          return (
            <React.Fragment key={`${event.isoDate}-${event.label}`}>
              <Circle
                cx={toX(index)}
                cy={toY(data[index]?.weight ?? 0)}
                r={6}
                fill={eventColor}
                stroke={Colors.bgSurface}
                strokeWidth={2}
              />
              <SvgText
                x={toX(index)}
                y={Math.max(12, toY(data[index]?.weight ?? 0) - 12)}
                textAnchor="middle"
                fill={eventColor}
                fontSize={10}
                fontWeight="bold"
              >
                {event.label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {labelIndices.map((index) => (
          <SvgText
            key={`label-${index}`}
            x={toX(index)}
            y={CHART_HEIGHT - 4}
            textAnchor="middle"
            fill={Colors.textMuted}
            fontSize={10}
          >
            {data[index]?.date}
          </SvgText>
        ))}

        <SvgText
          x={toX(data.length - 1)}
          y={toY(data[data.length - 1]?.weight ?? 0) - 8}
          textAnchor="middle"
          fill={color}
          fontSize={12}
          fontWeight="bold"
        >
          {data[data.length - 1]?.weight.toFixed(1)}
        </SvgText>
      </Svg>
    </View>
  );
}
