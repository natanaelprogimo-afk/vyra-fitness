import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type TrendPoint = {
  label: string;
  value: number;
};

interface VyraBalanceTrendChartProps {
  data: TrendPoint[];
  average: number | null;
  best: number | null;
  caption: string;
}

function buildPath(data: TrendPoint[], width: number, height: number, padding: number) {
  if (!data.length) return '';
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  return data
    .map((point, index) => {
      const x = padding + stepX * index;
      const y = padding + innerHeight - (Math.max(0, Math.min(100, point.value)) / 100) * innerHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export default function VyraBalanceTrendChart({
  data,
  average,
  best,
  caption,
}: VyraBalanceTrendChartProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.max(240, windowWidth - 96);
  const height = 180;
  const padding = 18;
  const path = buildPath(data, width, height, padding);

  return (
    <View style={styles.wrap}>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Promedio: {average !== null ? Math.round(average) : '--'}</Text>
        <Text style={styles.metaText}>Mejor: {best !== null ? Math.round(best) : '--'}</Text>
        <Text style={styles.metaText}>{caption}</Text>
      </View>

      <View style={styles.chartWrap}>
        <View style={styles.axisLabels}>
          {[100, 75, 50, 25, 0].map((value) => (
            <Text key={value} style={styles.axisLabel}>
              {value}
            </Text>
          ))}
        </View>

        <View style={styles.chartBody}>
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {[0, 25, 50, 75, 100].map((value) => {
              const y = padding + (height - padding * 2) - (value / 100) * (height - padding * 2);
              return (
                <Line
                  key={value}
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke={withOpacity(Colors.white, 0.08)}
                  strokeWidth={1}
                />
              );
            })}
            {path ? (
              <Path
                d={path}
                stroke={Colors.action}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </Svg>

          <View style={styles.labelsRow}>
            {data.map((point) => (
              <Text key={point.label} style={styles.dayLabel}>
                {point.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  metaText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chartWrap: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  axisLabels: {
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 24,
  },
  axisLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  chartBody: {
    flex: 1,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[2],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
