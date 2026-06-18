import { View, Text, StyleSheet } from 'react-native';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import type { MealType } from '@/hooks/useNutrition';

export interface MacroInsightByMeal {
  mealType: MealType;
  mealLabel: string;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  caloriesLogged: number;
  isEmpty: boolean;
}

export function buildMacroInsightsByMeal(params: {
  mealsByType: Record<MealType, Array<{ protein_g: number; carbs_g: number; fat_g: number; calories: number }>>;
  allMealTypes: MealType[];
  mealLabels: Record<MealType, { label: string }>;
}): MacroInsightByMeal[] {
  const { mealsByType, allMealTypes, mealLabels } = params;

  return allMealTypes.map((mealType) => {
    const meals = mealsByType[mealType] || [];
    const isEmpty = meals.length === 0;

    const totals = meals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.protein_g,
        carbs: acc.carbs + meal.carbs_g,
        fat: acc.fat + meal.fat_g,
        calories: acc.calories + meal.calories,
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0 },
    );

    return {
      mealType,
      mealLabel: mealLabels[mealType]?.label || mealType,
      proteinGrams: Math.round(totals.protein),
      carbsGrams: Math.round(totals.carbs),
      fatGrams: Math.round(totals.fat),
      caloriesLogged: Math.round(totals.calories),
      isEmpty,
    };
  });
}

function getMealEmoji(mealType: string): string {
  switch (mealType) {
    case 'breakfast':
      return '🌅';
    case 'lunch':
      return '☀️';
    case 'dinner':
      return '🌙';
    case 'snack':
      return '⚡';
    default:
      return '🍽️';
  }
}

export function MacroByMealCard({ insight }: { insight: MacroInsightByMeal }) {
  if (insight.isEmpty) {
    return (
      <View style={styles.mealRow}>
        <View style={styles.mealLabel}>
          <Text style={styles.emoji}>{getMealEmoji(insight.mealType)}</Text>
          <Text style={styles.mealName}>{insight.mealLabel}</Text>
        </View>
        <Text style={styles.emptyText}>Sin registros</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mealRow, styles.mealRowFilled]}>
      <View style={styles.mealLabel}>
        <Text style={styles.emoji}>{getMealEmoji(insight.mealType)}</Text>
        <View style={styles.mealLabelText}>
          <Text style={styles.mealName}>{insight.mealLabel}</Text>
          <Text style={styles.caloriesValue}>{insight.caloriesLogged} kcal</Text>
        </View>
      </View>
      <View style={styles.macrosMini}>
        <View style={styles.macroMiniItem}>
          <Text style={[styles.macroMiniValue, { color: '#FF6B6B' }]}>{insight.proteinGrams}g</Text>
          <Text style={styles.macroMiniLabel}>Pro</Text>
        </View>
        <View style={styles.macroMiniItem}>
          <Text style={[styles.macroMiniValue, { color: Colors.fasting }]}>{insight.carbsGrams}g</Text>
          <Text style={styles.macroMiniLabel}>Carbs</Text>
        </View>
        <View style={styles.macroMiniItem}>
          <Text style={[styles.macroMiniValue, { color: '#FFD43B' }]}>{insight.fatGrams}g</Text>
          <Text style={styles.macroMiniLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.06),
  },
  mealRowFilled: {
    backgroundColor: withOpacity(Colors.nutrition, 0.06),
    borderBottomColor: withOpacity(Colors.nutrition, 0.12),
  },
  mealLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  emoji: {
    fontSize: 18,
  },
  mealLabelText: {
    gap: 2,
  },
  mealName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  caloriesValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  macrosMini: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  macroMiniItem: {
    alignItems: 'center',
    gap: 2,
  },
  macroMiniValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  macroMiniLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
