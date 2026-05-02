import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/theme';

function phaseColor(day: number, cycleLength: number) {
  const normalized = day % Math.max(1, cycleLength);
  if (normalized < 5) return '#F87171';
  if (normalized < 13) return '#D8B4FE';
  if (normalized < 16) return Colors.female;
  return '#A855F7';
}

interface CycleDiscProps {
  cycleLength: number;
  currentDay: number;
  phaseLabel: string;
}

export default function CycleDisc({
  cycleLength,
  currentDay,
  phaseLabel,
}: CycleDiscProps) {
  const total = Math.max(20, Math.min(32, cycleLength || 28));
  const dots = Array.from({ length: total }, (_, index) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radius = 54;
    return {
      index,
      x: 66 + Math.cos(angle) * radius,
      y: 66 + Math.sin(angle) * radius,
      color: phaseColor(index, total),
      active: index === currentDay,
    };
  });

  return (
    <View style={styles.wrap}>
      <Svg width={132} height={132} viewBox="0 0 132 132">
        {dots.map((dot) => (
          <Circle
            key={dot.index}
            cx={dot.x}
            cy={dot.y}
            r={dot.active ? 6 : 4}
            fill={dot.color}
            opacity={dot.active ? 1 : 0.45}
            stroke={dot.active ? Colors.textPrimary : 'transparent'}
            strokeWidth={dot.active ? 1.5 : 0}
          />
        ))}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.dayValue}>Día {currentDay + 1}</Text>
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  dayValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  phaseLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
});
