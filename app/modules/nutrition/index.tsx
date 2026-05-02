import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import MacroRings, { buildMacroRingItems } from '@/components/nutrition/MacroRings';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { MEAL_TYPES, useNutrition, type MealType } from '@/hooks/useNutrition';
import { visibleRatioPercent } from '@/lib/visual-progress';
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

function QuickAction({
  icon,
  label,
  onPress,
  hint,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  hint: string;
}) {
  return (
    <Pressable
      style={styles.quickAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      hitSlop={8}
    >
      <Ionicons name={icon} size={18} color={Colors.nutrition} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
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
    frequentMeals,
    simpleTargets,
    deleteMeal,
    logFrequentMeal,
    isLogging,
  } = useNutrition();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; food_name: string; meal_type: MealType } | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteRef = useRef<{ id: string; food_name: string; meal_type: MealType } | null>(null);

  const suggestedMealType = inferSuggestedMealType(hasEaten);
  const caloriesPct = Math.max(0, Math.min(100, calorieGoal > 0 ? (totals.calories / calorieGoal) * 100 : 0));
  const maxWeekValue = Math.max(...weeklyData.map((item) => item.calories), calorieGoal, 1);
  const visibleMealsByType = useMemo(
    () =>
      (Object.keys(MEAL_TYPES) as MealType[]).reduce((acc, mealType) => {
        acc[mealType] = mealsByType[mealType].filter((meal) => meal.id !== pendingDelete?.id);
        return acc;
      }, {} as Record<MealType, typeof mealsByType.breakfast>),
    [mealsByType, pendingDelete?.id],
  );

  const clearPendingTimer = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  };

  const finalizePendingDelete = (meal: { id: string } | null) => {
    if (!meal?.id) return;
    deleteMeal(meal.id);
  };

  const handleDeletePress = (meal: { id: string; food_name: string; meal_type: MealType }) => {
    clearPendingTimer();

    if (pendingDelete) {
      finalizePendingDelete(pendingDelete);
    }

    setPendingDelete(meal);
    deleteTimerRef.current = setTimeout(() => {
      finalizePendingDelete(meal);
      setPendingDelete(null);
      deleteTimerRef.current = null;
    }, 4500);
  };

  const handleUndoDelete = () => {
    clearPendingTimer();
    setPendingDelete(null);
  };

  useEffect(() => {
    pendingDeleteRef.current = pendingDelete;
  }, [pendingDelete]);

  useEffect(() => {
    return () => {
      clearPendingTimer();
      if (pendingDeleteRef.current) {
        finalizePendingDelete(pendingDeleteRef.current);
      }
    };
  }, []);

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Nutrición" showBack={showBack} displayTitle={showBack} />
        <ModuleIntroScreen
          accentColor={Colors.nutrition}
          icon="Food"
          title="Nutrición"
          body="Registra tu primera comida y VYRA empieza a entender horarios, calorías y lo que más repites."
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
        title="Nutrición"
        showBack={showBack}
        displayTitle={showBack}
        rightAction={<Text style={styles.headerDate}>{formatTodayLabel()}</Text>}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {pendingDelete ? (
          <Card style={styles.undoCard} shadow={false}>
            <View style={styles.undoRow}>
              <View style={styles.undoCopy}>
                <Text style={styles.undoTitle}>Comida marcada para borrar</Text>
                <Text style={styles.undoBody}>
                  {pendingDelete.food_name} se quitara de {MEAL_TYPES[pendingDelete.meal_type].label.toLowerCase()}.
                  Si fue un toque accidental, puedes deshacerlo ahora.
                </Text>
              </View>
              <Pressable
                onPress={handleUndoDelete}
                style={styles.undoButton}
                accessibilityRole="button"
                accessibilityLabel="Deshacer borrado de comida"
                accessibilityHint="Recupera la comida marcada para borrar."
                hitSlop={8}
              >
                <Text style={styles.undoButtonText}>Deshacer</Text>
              </Pressable>
            </View>
          </Card>
        ) : null}

        <Card style={styles.summaryCard} shadow={false}>
          <Text style={styles.cardEyebrow}>Calorías hoy</Text>
          <Text style={styles.summaryValue}>
            {Math.round(totals.calories)} <Text style={styles.summaryMeta}>de {Math.round(calorieGoal)} kcal</Text>
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${caloriesPct}%` }]} />
          </View>
          <Text style={styles.summaryHint}>{Math.round(caloriesPct)}% del objetivo diario</Text>
          <MacroRings
            items={buildMacroRingItems({
              protein: totals.protein,
              carbs: totals.carbs,
              fat: totals.fat,
              proteinTarget: simpleTargets.protein,
              carbsTarget: simpleTargets.carbs,
              fatTarget: simpleTargets.fat,
            })}
          />
        </Card>

        <View style={styles.quickActions}>
          <QuickAction
            icon="camera-outline"
            label="Foto"
            onPress={() =>
              router.push({
                pathname: Routes.nutrition.log,
                params: { mealType: suggestedMealType, mode: 'photo' },
              } as never)
            }
            hint="Analiza una comida a partir de una foto."
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
            hint="Busca un alimento en la base de datos."
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
            hint="Carga una comida manualmente."
          />
          <QuickAction
            icon="time-outline"
            label="Reciente"
            onPress={() =>
              router.push({
                pathname: Routes.nutrition.log,
                params: { mealType: suggestedMealType, mode: 'search', library: 'recent' },
              } as never)
            }
            hint="Repite algo que ya registraste hace poco."
          />
        </View>

        {frequentMeals.length ? (
          <Card style={styles.recentCard} shadow={false}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Frecuentes</Text>
              <Text style={styles.sectionHint}>Repite en un toque</Text>
            </View>
            <View style={styles.recentRow}>
              {frequentMeals.slice(0, 5).map((item) => (
                <Pressable
                  key={item.key}
                  style={styles.recentPill}
                  disabled={isLogging}
                  onPress={() => logFrequentMeal(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Repetir ${item.food_name}`}
                  accessibilityHint="Registra esta comida frecuente con un solo toque."
                  accessibilityState={{ disabled: isLogging }}
                  hitSlop={8}
                >
                  <Text style={styles.recentPillText}>{item.food_name}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        {(Object.keys(MEAL_TYPES) as MealType[]).map((mealType) => {
          const meta = MEAL_TYPES[mealType];
          const meals = visibleMealsByType[mealType];
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
                  accessibilityRole="button"
                  accessibilityLabel={`Agregar comida en ${meta.label.toLowerCase()}`}
                  accessibilityHint="Abre el registro para esta comida."
                  hitSlop={8}
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
                            {Math.round(meal.calories)} kcal - {Math.round(meal.protein_g)}P - {Math.round(meal.carbs_g)}C - {Math.round(meal.fat_g)}G
                          </Text>
                        </View>
                        <View style={styles.foodActions}>
                          <Pressable
                            onPress={() =>
                              router.push({
                                pathname: Routes.nutrition.log,
                                params: { mealType: meal.meal_type, mode: 'manual', mealId: meal.id },
                              } as never)
                            }
                            style={styles.actionButton}
                            accessibilityRole="button"
                            accessibilityLabel={`Editar ${meal.food_name}`}
                          >
                            <Ionicons name="create-outline" size={16} color={Colors.textMuted} />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeletePress({
                              id: meal.id,
                              food_name: meal.food_name,
                              meal_type: meal.meal_type,
                            })}
                            style={styles.actionButton}
                            accessibilityRole="button"
                            accessibilityLabel={`Borrar ${meal.food_name}`}
                          >
                            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                          </Pressable>
                        </View>
                      </View>
                      {index < meals.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyMealRow}>
                  <Text style={styles.emptyMealText}>Todavía no hay items en esta comida.</Text>
                </View>
              )}
            </Card>
          );
        })}

        <Card style={styles.historyCard} shadow={false}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Historial</Text>
            <Pressable
              onPress={() => router.push(Routes.nutrition.history as never)}
              accessibilityRole="button"
              accessibilityLabel="Ver historial completo de nutricion"
              accessibilityHint="Abre mas dias y registros anteriores."
              hitSlop={8}
            >
              <Text style={styles.historyLink}>Ver más</Text>
            </Pressable>
          </View>
          <View style={styles.historyBars}>
            {weeklyData.slice(-7).map((item) => {
              const heightPct = visibleRatioPercent(item.calories, maxWeekValue);
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
  undoCard: {
    borderWidth: 1,
    borderColor: withOpacity(Colors.nutrition, 0.2),
    backgroundColor: withOpacity(Colors.nutrition, 0.08),
  },
  undoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  undoCopy: {
    flex: 1,
    gap: 4,
  },
  undoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  undoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  undoButton: {
    minHeight: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.nutrition, 0.22),
    backgroundColor: withOpacity(Colors.nutrition, 0.12),
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.nutrition,
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
    fontFamily: FontFamily.black,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  summaryMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.nutrition,
  },
  summaryHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  quickAction: {
    width: '47%',
    minHeight: 76,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    justifyContent: 'center',
    gap: Spacing[2],
  },
  quickActionText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  recentCard: {
    gap: Spacing[3],
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  recentPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  recentPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  mealCard: {
    gap: Spacing[3],
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  mealTitleWrap: {
    gap: 2,
  },
  mealLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  mealMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  inlineAdd: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.nutrition,
  },
  inlineAddText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  mealList: {
    gap: Spacing[2],
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  foodCopy: {
    flex: 1,
    gap: 2,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  foodName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  foodMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  emptyMealRow: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  emptyMealText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
    marginVertical: Spacing[2],
  },
  historyCard: {
    gap: Spacing[3],
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  historyLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  historyBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
    height: 150,
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
    backgroundColor: Colors.bgElevated,
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
