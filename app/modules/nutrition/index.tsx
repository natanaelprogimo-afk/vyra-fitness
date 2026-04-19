import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { MEAL_TYPES, useNutrition, type MealType } from '@/hooks/useNutrition';
import { useSettingsStore } from '@/stores/settingsStore';

function inferSuggestedMealType(hasEaten: Record<MealType, boolean>): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return hasEaten.breakfast ? 'snack' : 'breakfast';
  if (hour < 16) return hasEaten.lunch ? 'snack' : 'lunch';
  if (hour < 21) return hasEaten.dinner ? 'snack' : 'dinner';
  return 'snack';
}

function formatTodayLabel() {
  return new Date().toLocaleDateString('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export default function NutritionScreen({ showBack = true }: { showBack?: boolean }) {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.nutrition));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const {
    mealsByType,
    hasEaten,
    totals,
    calorieGoal,
    weeklyData,
    remaining,
    deleteMeal,
  } = useNutrition();

  const suggestedMealType = inferSuggestedMealType(hasEaten);
  const caloriesPct = Math.max(0, Math.min(100, calorieGoal > 0 ? (totals.calories / calorieGoal) * 100 : 0));
  const maxWeekValue = Math.max(...weeklyData.map((item) => item.calories), calorieGoal, 1);

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Nutricion" showBack={showBack} displayTitle={showBack} />
        <ModuleIntroScreen
          accentColor={Colors.nutrition}
          icon="🥗"
          title="Nutricion"
          body="Registra tu primera comida y VYRA empieza a entender horarios, calorias y lo que mas repites."
          ctaLabel="Registrar primera comida"
          onContinue={() => {
            markModuleIntroSeen('nutrition');
            router.push({
              pathname: Routes.nutrition.log,
              params: { mealType: suggestedMealType },
            } as never);
          }}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Nutricion"
        showBack={showBack}
        displayTitle={showBack}
        rightAction={<Text style={styles.headerDate}>{formatTodayLabel()}</Text>}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard} shadow={false}>
          <Text style={styles.cardEyebrow}>Hoy</Text>
          <Text style={styles.summaryValue}>
            {Math.round(totals.calories)} / {calorieGoal} kcal
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${caloriesPct}%` }]} />
          </View>
          <View style={styles.macroRow}>
            <MacroStat label="P" value={`${Math.round(totals.protein)}g`} />
            <MacroStat label="C" value={`${Math.round(totals.carbs)}g`} />
            <MacroStat label="G" value={`${Math.round(totals.fat)}g`} />
          </View>
          <Text style={styles.summaryHint}>
            {remaining > 0 ? `Restan ${Math.round(remaining)} kcal para tu meta.` : 'Objetivo de hoy cubierto.'}
          </Text>
        </Card>

        <View style={styles.quickActions}>
          <QuickAction
            icon="camera-outline"
            label="Foto IA"
            onPress={() =>
              router.push({
                pathname: Routes.nutrition.log,
                params: { mealType: suggestedMealType, mode: 'photo' },
              } as never)
            }
          />
          <QuickAction
            icon="search-outline"
            label="Buscar"
            onPress={() =>
              router.push({
                pathname: Routes.nutrition.log,
                params: { mealType: suggestedMealType, mode: 'search' },
              } as never)
            }
          />
          <QuickAction
            icon="create-outline"
            label="Manual"
            onPress={() =>
              router.push({
                pathname: Routes.nutrition.log,
                params: { mealType: suggestedMealType, mode: 'manual' },
              } as never)
            }
          />
        </View>

        {(Object.keys(MEAL_TYPES) as MealType[]).map((mealType) => {
          const meta = MEAL_TYPES[mealType];
          const meals = mealsByType[mealType];
          const mealCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

          return (
            <Card key={mealType} style={styles.mealCard} shadow={false}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleWrap}>
                  <Text style={styles.mealLabel}>{meta.label.toUpperCase()}</Text>
                  <Text style={styles.mealMeta}>{Math.round(mealCalories)} kcal</Text>
                </View>
                <Pressable
                  style={styles.inlineAdd}
                  onPress={() =>
                    router.push({
                      pathname: Routes.nutrition.log,
                      params: { mealType },
                    } as never)
                  }
                >
                  <Text style={styles.inlineAddText}>+</Text>
                </Pressable>
              </View>

              {meals.length ? (
                <View style={styles.mealList}>
                  {meals.map((meal, index) => (
                    <View key={meal.id}>
                      <View style={styles.foodRow}>
                        <View style={styles.foodCopy}>
                          <Text style={styles.foodName}>{meal.food_name}</Text>
                          <Text style={styles.foodMeta}>
                            {Math.round(meal.calories)} kcal · {Math.round(meal.protein_g)}P · {Math.round(meal.carbs_g)}C · {Math.round(meal.fat_g)}G
                          </Text>
                        </View>
                        <Pressable onPress={() => deleteMeal(meal.id)} style={styles.deleteButton}>
                          <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                        </Pressable>
                      </View>
                      {index < meals.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyMealText}>Todavia no hay alimentos cargados aqui.</Text>
              )}
            </Card>
          );
        })}

        <Card style={styles.historyCard} shadow={false}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Historial</Text>
            <Pressable onPress={() => router.push(Routes.nutrition.history as never)}>
              <Text style={styles.historyLink}>Ver mas</Text>
            </Pressable>
          </View>
          <View style={styles.historyBars}>
            {weeklyData.slice(-7).map((item) => {
              const heightPct = Math.max(8, (item.calories / maxWeekValue) * 100);
              const withinRange = item.calories >= calorieGoal * 0.85 && item.calories <= calorieGoal * 1.05;
              const overflow = item.calories > calorieGoal * 1.05;
              const fillColor = withinRange
                ? Colors.success
                : overflow
                  ? Colors.warning
                  : Colors.bgElevated;
              const label = new Date(`${item.date}T12:00:00`)
                .toLocaleDateString('es-UY', { weekday: 'short' })
                .slice(0, 1)
                .toUpperCase();
              return (
                <View key={item.date} style={styles.historyItem}>
                  <View style={styles.historyTrack}>
                    <View style={[styles.historyFill, { height: `${heightPct}%`, backgroundColor: fillColor }]} />
                  </View>
                  <Text style={styles.historyDay}>{label}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.nutrition} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  summaryCard: {
    gap: Spacing[3],
  },
  cardEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.nutrition,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  macroItem: {
    flex: 1,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 2,
  },
  macroLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  macroValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  summaryHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  quickAction: {
    flex: 1,
    minHeight: 72,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[2],
  },
  quickActionText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  mealCard: {
    gap: Spacing[3],
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealTitleWrap: {
    gap: 4,
  },
  mealLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  mealMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  inlineAdd: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.actionBg,
  },
  inlineAddText: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.action,
    lineHeight: 22,
  },
  mealList: {
    gap: Spacing[2.5],
  },
  foodRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  foodCopy: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  foodMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    marginTop: Spacing[2.5],
    height: 1,
    backgroundColor: Colors.border,
  },
  emptyMealText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  historyCard: {
    gap: Spacing[3],
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  historyLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  historyBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
    height: 96,
  },
  historyItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  historyTrack: {
    width: '100%',
    flex: 1,
    borderRadius: Radius.sm,
    backgroundColor: withOpacity(Colors.white, 0.04),
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  historyFill: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  historyDay: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
