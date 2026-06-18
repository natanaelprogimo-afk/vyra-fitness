import { View, Text, StyleSheet } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import Card from '@/components/ui/Card';

export type CoachClosureType = 'protein_boost' | 'carbs_timing' | 'portion_size' | 'hydration' | 'perfect_meal' | null;

export interface CoachClosureData {
  type: CoachClosureType;
  title: string;
  body: string;
  emoji: string;
  color: string;
}

export function buildCoachClosure(params: {
  proteinLogged: number;
  proteinTarget: number;
  carbsLogged: number;
  carbsTarget: number;
  fatLogged: number;
  fatTarget: number;
  caloriesLogged: number;
  calorieTarget: number;
  mealType: string;
  hour: number;
  hasNextWorkout: boolean;
  isExerciseDay?: boolean;
}): CoachClosureData | null {
  const {
    proteinLogged,
    proteinTarget,
    carbsLogged,
    carbsTarget,
    caloriesLogged,
    calorieTarget,
    mealType,
    hour,
    hasNextWorkout,
  } = params;

  const proteinRatio = proteinTarget > 0 ? proteinLogged / proteinTarget : 0;
  const carbsRatio = carbsTarget > 0 ? carbsLogged / carbsTarget : 0;
  const caloriesRatio = calorieTarget > 0 ? caloriesLogged / calorieTarget : 0;

  // Perfect meal scenario
  if (proteinRatio >= 0.85 && proteinRatio <= 1.15 && caloriesRatio >= 0.8 && caloriesRatio <= 1.2) {
    return {
      type: 'perfect_meal',
      title: 'Comida equilibrada',
      body: 'Bien proporcionada. Hidrátate en la próxima hora.',
      emoji: '✅',
      color: Colors.success,
    };
  }

  // Protein boost opportunity (low protein)
  if (proteinRatio < 0.7 && mealType !== 'snack') {
    return {
      type: 'protein_boost',
      title: 'Proteína baja',
      body: `Faltan ${Math.round(proteinLogged)}g. Suma un huevo o lácteo.`,
      emoji: '🥚',
      color: Colors.error,
    };
  }

  // Carbs timing for activity
  if (hasNextWorkout && hour >= 9 && hour <= 17) {
    if (carbsRatio < 0.8) {
      return {
        type: 'carbs_timing',
        title: 'Energía para entrenar',
        body: `Agrega ${Math.round(carbsTarget - carbsLogged)}g de carbos antes del entreno.`,
        emoji: '⚡',
        color: Colors.warning,
      };
    }
  }

  // Portion size coaching
  if (caloriesRatio < 0.6) {
    return {
      type: 'portion_size',
      title: 'Porción pequeña',
      body: `${Math.round(caloriesLogged)}kcal es poco. Agrega más o un snack en 2h.`,
      emoji: '📐',
      color: Colors.warning,
    };
  }

  // Hydration reminder
  if (mealType === 'lunch' || mealType === 'dinner') {
    return {
      type: 'hydration',
      title: 'Hidrátate',
      body: 'Toma 500ml de agua en la próxima hora.',
      emoji: '💧',
      color: Colors.info,
    };
  }

  return null;
}

export function CoachClosureCard({ closure }: { closure: CoachClosureData }) {
  return (
    <Card
      style={[
        styles.card,
        {
          borderColor: withOpacity(closure.color, 0.18),
          backgroundColor: withOpacity(closure.color, 0.08),
        },
      ]}
      shadow={false}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{closure.emoji}</Text>
        <Text style={[styles.title, { color: closure.color }]}>{closure.title}</Text>
      </View>
      <Text style={styles.body}>{closure.body}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    flex: 1,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
