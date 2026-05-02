import { StyleSheet, Text, View } from 'react-native';
import GlowRing from '@/components/ui/GlowRing';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

type MacroRingItem = {
  key: string;
  label: string;
  current: number;
  target: number;
  color: string;
};

interface MacroRingsProps {
  items: MacroRingItem[];
}

function ringState(value: number) {
  if (value >= 100) return 'complete';
  if (value >= 85) return 'active';
  if (value <= 0) return 'empty';
  return 'active';
}

export default function MacroRings({ items }: MacroRingsProps) {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const pct = item.target > 0 ? (item.current / item.target) * 100 : 0;
        return (
          <View key={item.key} style={styles.item}>
            <GlowRing
              value={pct}
              state={ringState(pct)}
              size={72}
              strokeWidth={7}
              color={item.color}
            >
              <Text style={styles.value}>{Math.round(item.current)}g</Text>
            </GlowRing>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.meta}>de {Math.round(item.target)}g</Text>
          </View>
        );
      })}
    </View>
  );
}

export function buildMacroRingItems(input: {
  protein: number;
  carbs: number;
  fat: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}) {
  return [
    {
      key: 'protein',
      label: 'Proteína',
      current: input.protein,
      target: input.proteinTarget,
      color: Colors.nutrition,
    },
    {
      key: 'carbs',
      label: 'Carbos',
      current: input.carbs,
      target: input.carbsTarget,
      color: Colors.warning,
    },
    {
      key: 'fat',
      label: 'Grasas',
      current: input.fat,
      target: input.fatTarget,
      color: Colors.fasting,
    },
  ] satisfies MacroRingItem[];
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[1],
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
