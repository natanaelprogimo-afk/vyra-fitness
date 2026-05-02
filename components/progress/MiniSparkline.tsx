import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, withOpacity } from '@/constants/colors';

interface MiniSparklineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}

function buildPath(values: number[], width: number, height: number) {
  if (!values.length) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export default function MiniSparkline({
  values,
  color = Colors.action,
  width = 84,
  height = 24,
}: MiniSparklineProps) {
  const path = buildPath(values, width, height);

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {path ? (
          <Path
            d={path}
            stroke={color}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <Path
            d={`M 0 ${height / 2} L ${width} ${height / 2}`}
            stroke={withOpacity(Colors.white, 0.12)}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
  },
});
