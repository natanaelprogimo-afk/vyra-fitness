import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import { CoachClosureCard, buildCoachClosure } from '@/components/nutrition/CoachClosure';
import { MacroByMealCard, buildMacroInsightsByMeal } from '@/components/nutrition/MacroByMeal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing, ComponentHeight, ComponentWidth, LineHeight } from '@/constants/theme';
import { MEAL_TYPES, useNutrition, type MealType } from '@/hooks/useNutrition';
import { useNutritionFeedback } from '@/hooks/useNutritionFeedback';
import { visibleRatioPercent } from '@/lib/visual-progress';

const NUTRITION_HOME_HISTORY_HEIGHT = 150;
const NUTRITION_ON_TARGET_MIN = 0.85;
const NUTRITION_ON_TARGET_MAX = 1.15;
const DELETE_UNDO_MS = 4500;
const CORE_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

type MealTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type NutritionCoachCard = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  mealType: MealType;
  color: string;
  feedbackType?: 'protein' | 'carbs' | 'fat' | 'calories';
  feedbackAmount?: number;
  feedbackTarget?: number;
};

function inferSuggestedMealType(
  hasEaten: Record<MealType, boolean>,
  workoutMealTypeSuggestion: MealType | null,
): MealType {
  if (workoutMealTypeSuggestion && !hasEaten[workoutMealTypeSuggestion]) {
    return workoutMealTypeSuggestion;
  }
  const hour = new Date().getHours();
  if (hour < 11) return hasEaten.breakfast ? 'snack' : 'breakfast';
  if (hour < 16) return hasEaten.lunch ? 'snack' : 'lunch';
  if (hour < 21) return hasEaten.dinner ? 'snack' : 'dinner';
  return 'snack';
}

function getGoalOffsetPx(goal: number, maxValue: number) {
  if (maxValue <= 0) return 0;
  return Math.max(
    0,
    Math.min(NUTRITION_HOME_HISTORY_HEIGHT, (goal / maxValue) * NUTRITION_HOME_HISTORY_HEIGHT),
  );
}

function formatTodayLabel() {
  return new Date().toLocaleDateString('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function clampPercent(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, (current / target) * 100));
}

function buildMealTotals(meals: Array<{ calories: number; protein_g: number; carbs_g: number; fat_g: number }>): MealTotals {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein_g,
      carbs: acc.carbs + meal.carbs_g,
      fat: acc.fat + meal.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function buildNutritionCoach(params: {
  suggestedMealType: MealType;
  hasEaten: Record<MealType, boolean>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  calorieGoal: number;
  simpleTargets: { protein: number; carbs: number; fat: number };
}): NutritionCoachCard {
  const { suggestedMealType, hasEaten, totals, calorieGoal, simpleTargets } = params;
  const mealLabel = MEAL_TYPES[suggestedMealType].label.toLowerCase();
  const proteinLeft = Math.max(0, Math.round(simpleTargets.protein - totals.protein));
  const carbsLeft = Math.max(0, Math.round(simpleTargets.carbs - totals.carbs));
  const fatLeft = Math.max(0, Math.round(simpleTargets.fat - totals.fat));
  const caloriesLeft = Math.max(0, Math.round(calorieGoal - totals.calories));
  const completionRatio = calorieGoal > 0 ? totals.calories / calorieGoal : 0;

  if (totals.calories <= 0) {
    return {
      eyebrow: 'Siguiente mejor paso',
      title: `Arranca por ${mealLabel}`,
      body: 'Deja una comida real cargada ahora y el resto del día deja de sentirse vacío.',
      cta: `Agregar ${mealLabel}`,
      mealType: suggestedMealType,
      color: Colors.nutrition,
    };
  }

  const nextCoreMeal = CORE_MEAL_TYPES.find((mealType) => !hasEaten[mealType] && mealType !== 'snack');
  if (nextCoreMeal) {
    const nextLabel = MEAL_TYPES[nextCoreMeal].label.toLowerCase();
    return {
      eyebrow: 'Orden del día',
      title: `Todavía falta ${nextLabel}`,
      body: `Si cierras ${nextLabel} con una comida simple, el día queda mucho más claro que sumando snacks sueltos.`,
      cta: `Registrar ${nextLabel}`,
      mealType: nextCoreMeal,
      color: Colors.nutrition,
    };
  }

  if (proteinLeft >= Math.max(18, Math.round(simpleTargets.protein * 0.18))) {
    return {
      eyebrow: 'Lo que más conviene ahora',
      title: `Te faltan ${proteinLeft}g de proteína`,
      body: 'Cierra con una fuente simple: yogur griego, huevos, pollo, atún o un batido si vienes de entrenar.',
      cta: `Agregar ${mealLabel}`,
      mealType: suggestedMealType,
      color: Colors.error,
      feedbackType: 'protein' as const,
      feedbackAmount: proteinLeft,
      feedbackTarget: simpleTargets.protein,
    };
  }

  if (carbsLeft >= Math.max(24, Math.round(simpleTargets.carbs * 0.16))) {
    return {
      eyebrow: 'Energía útil',
      title: `Todavía faltan ${carbsLeft}g de carbohidratos`,
      body: 'Si te toca entrenar o cerrar el día con energía, suma fruta, arroz, avena o papa antes de improvisar.',
      cta: `Registrar ${mealLabel}`,
      mealType: suggestedMealType,
      color: Colors.warning,
      feedbackType: 'carbs' as const,
      feedbackAmount: carbsLeft,
      feedbackTarget: simpleTargets.carbs,
    };
  }

  if (fatLeft >= Math.max(10, Math.round(simpleTargets.fat * 0.18))) {
    return {
      eyebrow: 'Ajuste fino',
      title: `Te quedan ${fatLeft}g de grasas`,
      body: 'Puedes completarlas mejor con palta, frutos secos, aceite de oliva o un lácteo con más saciedad.',
      cta: `Agregar ${mealLabel}`,
      mealType: suggestedMealType,
      color: Colors.secondary,
      feedbackType: 'fat' as const,
      feedbackAmount: fatLeft,
      feedbackTarget: simpleTargets.fat,
    };
  }

  if (completionRatio > NUTRITION_ON_TARGET_MAX) {
    return {
      eyebrow: 'Cierre inteligente',
      title: 'Hoy ya cubriste el objetivo',
      body: 'Si vuelves a registrar algo, conviene que sea liviano y con buena proteína para no pasarte por ruido.',
      cta: `Agregar ${mealLabel}`,
      mealType: suggestedMealType,
      color: Colors.success,
    };
  }

  return {
    eyebrow: 'Cierre recomendado',
    title: `${caloriesLeft} kcal para cerrar bien el día`,
    body: 'Vas ordenado. Repite una comida frecuente o deja un cierre corto y claro antes de terminar.',
    cta: `Registrar ${mealLabel}`,
    mealType: suggestedMealType,
    color: Colors.success,
    feedbackType: 'calories' as const,
    feedbackAmount: caloriesLeft,
    feedbackTarget: calorieGoal,
  };
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

function MacroProgressRow({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  const progress = clampPercent(current, target);

  return (
    <View style={styles.macroProgressRow}>
      <View style={styles.macroProgressHeader}>
        <View style={styles.macroProgressTitleRow}>
          <View style={[styles.macroProgressDot, { backgroundColor: color }]} />
          <Text style={styles.macroProgressLabel}>{label}</Text>
        </View>
        <Text style={styles.macroProgressValue}>
          {Math.round(current)}g <Text style={styles.macroProgressTarget}>de {Math.round(target)}g</Text>
        </Text>
      </View>
      <View style={styles.macroProgressTrack}>
        <View
          style={[
            styles.macroProgressFill,
            {
              width: `${progress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function NutritionScreen({ showBack = true }: { showBack?: boolean }) {
  const {
    mealsByType,
    hasEaten,
    totals,
    remaining,
    calorieGoal,
    weeklyData,
    frequentMeals,
    simpleTargets,
    workoutMealTypeSuggestion,
    deleteMeal,
    logFrequentMeal,
    isLoading,
    isLogging,
  } = useNutrition();
  const { submitFeedback, submitting: feedbackSubmitting } = useNutritionFeedback();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    food_name: string;
    meal_type: MealType;
    token: number;
  } | null>(null);
  const [feedbackShared, setFeedbackShared] = useState(false);
  const [coachClosure, setCoachClosure] = useState(
    buildCoachClosure({
      proteinLogged: 0,
      proteinTarget: 0,
      carbsLogged: 0,
      carbsTarget: 0,
      fatLogged: 0,
      fatTarget: 0,
      caloriesLogged: 0,
      calorieTarget: 0,
      mealType: 'breakfast',
      hour: new Date().getHours(),
      hasNextWorkout: false,
      isExerciseDay: false,
    }),
  );
  const [loggingFrequentKey, setLoggingFrequentKey] = useState<string | null>(null);
  const [showGoalContext, setShowGoalContext] = useState(false);
  const lastTotalsRef = useRef(totals.calories);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteRef = useRef<{
    id: string;
    food_name: string;
    meal_type: MealType;
    token: number;
  } | null>(null);
  const deleteTokenRef = useRef(0);
  const finalizedDeleteTokensRef = useRef<Set<number>>(new Set());
  const allMealTypes = useMemo(() => Object.keys(MEAL_TYPES) as MealType[], []);

  const suggestedMealType = inferSuggestedMealType(hasEaten, workoutMealTypeSuggestion);
  const caloriesPct = Math.max(0, Math.min(100, calorieGoal > 0 ? (totals.calories / calorieGoal) * 100 : 0));
  const maxWeekValue = Math.max(...weeklyData.map((item) => item.calories), calorieGoal, 1);
  const goalOffset = getGoalOffsetPx(calorieGoal, maxWeekValue);
  const hasWeeklyHistory = weeklyData.some((item) => item.calories > 0);
  const visibleMealsByType = useMemo(
    () =>
      allMealTypes.reduce((acc, mealType) => {
        acc[mealType] = mealsByType[mealType].filter((meal) => meal.id !== pendingDelete?.id);
        return acc;
      }, {} as Record<MealType, typeof mealsByType.breakfast>),
    [allMealTypes, mealsByType, pendingDelete?.id],
  );
  const visibleMealTypes = useMemo(
    () => CORE_MEAL_TYPES,
    [],
  );
  const macroInsightsByMeal = useMemo(
    () =>
      buildMacroInsightsByMeal({
        mealsByType: mealsByType,
        allMealTypes: visibleMealTypes,
        mealLabels: MEAL_TYPES,
      }),
    [mealsByType, visibleMealTypes],
  );
  const coachCard = useMemo(
    () =>
      buildNutritionCoach({
        suggestedMealType,
        hasEaten,
        totals,
        calorieGoal,
        simpleTargets,
      }),
    [calorieGoal, hasEaten, simpleTargets, suggestedMealType, totals],
  );

  const clearPendingTimer = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  };

  const finalizePendingDelete = (meal: { id: string; token: number } | null) => {
    if (!meal?.id) return;
    if (finalizedDeleteTokensRef.current.has(meal.token)) return;
    finalizedDeleteTokensRef.current.add(meal.token);
    deleteMeal(meal.id);
  };

  const handleDeletePress = (meal: { id: string; food_name: string; meal_type: MealType }) => {
    clearPendingTimer();

    if (pendingDelete) {
      finalizePendingDelete(pendingDelete);
    }

    const token = deleteTokenRef.current + 1;
    deleteTokenRef.current = token;
    const nextPendingDelete = { ...meal, token };
    setPendingDelete(nextPendingDelete);
    deleteTimerRef.current = setTimeout(() => {
      finalizePendingDelete(nextPendingDelete);
      setPendingDelete(null);
      deleteTimerRef.current = null;
    }, DELETE_UNDO_MS);
  };

  const handleUndoDelete = () => {
    clearPendingTimer();
    if (pendingDeleteRef.current) {
      finalizedDeleteTokensRef.current.delete(pendingDeleteRef.current.token);
    }
    setPendingDelete(null);
  };

  const handleFrequentMealPress = async (item: (typeof frequentMeals)[number]) => {
    setLoggingFrequentKey(item.key);
    try {
      await logFrequentMeal(item);
    } finally {
      setLoggingFrequentKey(null);
    }
  };

  const handleShareFeedback = async () => {
    if (!coachCard.feedbackType || coachCard.feedbackAmount === undefined) return;

    const success = await submitFeedback({
      date: new Date().toISOString().split('T')[0],
      meal_type: coachCard.mealType,
      suggestion_type: coachCard.feedbackType,
      amount_missing: coachCard.feedbackAmount,
      logged_amount: totals[coachCard.feedbackType === 'calories' ? 'calories' : coachCard.feedbackType],
      target_amount: coachCard.feedbackTarget || 0,
      user_accepted: true,
    });

    if (success) {
      setFeedbackShared(true);
      setTimeout(() => setFeedbackShared(false), 3000);
    }
  };

  useEffect(() => {
    pendingDeleteRef.current = pendingDelete;
  }, [pendingDelete]);

  // Detect when a meal is logged and show coach closure
  useEffect(() => {
    const caloriesDiff = totals.calories - lastTotalsRef.current;
    let closeupTimer: ReturnType<typeof setTimeout> | null = null;

    if (caloriesDiff > 10) {
      // Calories increased, likely a new meal was logged
      const hour = new Date().getHours();
      const lastMealType = Object.entries(mealsByType).find(
        ([, meals]) => meals.length > 0,
      )?.[0] as MealType | undefined;

      if (lastMealType) {
        const closure = buildCoachClosure({
          proteinLogged: totals.protein,
          proteinTarget: simpleTargets.protein,
          carbsLogged: totals.carbs,
          carbsTarget: simpleTargets.carbs,
          fatLogged: totals.fat,
          fatTarget: simpleTargets.fat,
          caloriesLogged: totals.calories,
          calorieTarget: calorieGoal,
          mealType: lastMealType,
          hour,
          hasNextWorkout: false,
          isExerciseDay: false,
        });

        if (closure) {
          setCoachClosure(closure);
          // Auto-hide after 8 seconds
          closeupTimer = setTimeout(() => {
            setCoachClosure(null);
          }, 8000);
        }
      }
    }
    lastTotalsRef.current = totals.calories;

    return () => {
      if (closeupTimer) clearTimeout(closeupTimer);
    };
  }, [totals.calories, totals.protein, totals.carbs, totals.fat, calorieGoal, simpleTargets, mealsByType]);

  useEffect(() => {
    return () => {
      clearPendingTimer();
      if (pendingDeleteRef.current) {
        finalizePendingDelete(pendingDeleteRef.current);
      }
    };
  }, []);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Nutrición"
        showBack={showBack}
        displayTitle={showBack}
        rightAction={<Text style={styles.headerDate}>{formatTodayLabel()}</Text>}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Card style={styles.loadingCard} shadow={false}>
            <Text style={styles.sectionTitle}>Cargando tu día nutricional</Text>
            <Text style={styles.sectionBody}>
              Estamos preparando calorias, comidas frecuentes y contexto para esta jornada.
            </Text>
          </Card>
        ) : null}

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
          <View style={styles.summaryHeader}>
            <Text style={styles.cardEyebrow}>Calorias hoy</Text>
            <Pressable
              onPress={() => setShowGoalContext((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel="Como se calcula este objetivo"
              accessibilityHint="Muestra una explicacion breve del objetivo diario."
              hitSlop={8}
            >
              <Text style={styles.summaryLink}>Como se calcula?</Text>
            </Pressable>
          </View>
          <Text style={styles.summaryValue}>
            {Math.round(totals.calories)} <Text style={styles.summaryMeta}>de {Math.round(calorieGoal)} kcal</Text>
          </Text>
          <View style={styles.summarySnapshotRow}>
            <View style={styles.summarySnapshot}>
              <Text style={styles.summarySnapshotLabel}>Restan</Text>
              <Text style={styles.summarySnapshotValue}>{Math.max(0, Math.round(remaining))} kcal</Text>
            </View>
            <View style={styles.summarySnapshot}>
              <Text style={styles.summarySnapshotLabel}>Siguiente</Text>
              <Text style={styles.summarySnapshotValue}>{MEAL_TYPES[coachCard.mealType].label}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${caloriesPct}%` }]} />
          </View>
          <Text style={styles.summaryHint}>
            {Math.round(caloriesPct)}% del objetivo diario y te quedan {Math.round(remaining)} kcal
          </Text>
          {showGoalContext ? (
            <Text style={styles.summaryContext}>
              Este objetivo parte de tu perfil actual y se ajusta con tu meta principal. Usalo como referencia diaria, no como una regla rigida.
            </Text>
          ) : null}
          <View style={styles.macroProgressGroup}>
            <MacroProgressRow
              label="Proteina"
              current={totals.protein}
              target={simpleTargets.protein}
              color={Colors.nutrition}
            />
            <MacroProgressRow
              label="Carbos"
              current={totals.carbs}
              target={simpleTargets.carbs}
              color={Colors.warning}
            />
            <MacroProgressRow
              label="Grasas"
              current={totals.fat}
              target={simpleTargets.fat}
              color={Colors.secondary}
            />
          </View>
        </Card>

        {coachClosure ? <CoachClosureCard closure={coachClosure} /> : null}

        <Card
          style={[
            styles.coachCard,
            {
              borderColor: withOpacity(coachCard.color, 0.18),
              backgroundColor: withOpacity(coachCard.color, 0.08),
            },
          ]}
          shadow={false}
        >
          <Text style={[styles.cardEyebrow, { color: coachCard.color }]}>{coachCard.eyebrow}</Text>
          <Text style={styles.coachTitle}>{coachCard.title}</Text>
          <Text style={styles.sectionBody}>{coachCard.body}</Text>
          <View style={styles.coachActions}>
            <Button
              onPress={() =>
                router.push({
                  pathname: Routes.nutrition.log,
                  params: { mealType: coachCard.mealType },
                } as never)
              }
              variant="secondary"
              fullWidth={!coachCard.feedbackType}
              color={coachCard.color}
            >
              {coachCard.cta}
            </Button>
            {coachCard.feedbackType && (
              <Pressable
                onPress={handleShareFeedback}
                disabled={feedbackSubmitting || feedbackShared}
                style={[
                  styles.feedbackButton,
                  (feedbackSubmitting || feedbackShared) && styles.feedbackButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Enviar feedback de macro"
                accessibilityHint={
                  feedbackShared
                    ? 'Feedback enviado con éxito'
                    : 'Envía esta sugerencia de macro a Vyra para mejorar las recomendaciones'
                }
              >
                <Ionicons
                  name={feedbackShared ? 'checkmark-circle' : 'send-outline'}
                  size={16}
                  color={feedbackShared ? Colors.success : Colors.textMuted}
                />
                <Text style={[styles.feedbackButtonText, feedbackShared && styles.feedbackButtonTextActive]}>
                  {feedbackSubmitting ? 'Enviando...' : feedbackShared ? 'Enviado' : 'Enviar'}
                </Text>
              </Pressable>
            )}
          </View>
        </Card>

        <Card style={styles.inputCard} shadow={false}>
          <View style={styles.inputHeader}>
            <Text style={styles.sectionTitle}>Como registrar</Text>
            <Text style={styles.sectionHint}>Elige la vía más rápida según lo que tienes delante.</Text>
          </View>
          <View style={styles.quickActions}>
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
              icon="camera-outline"
              label="Foto IA"
              onPress={() =>
                router.push({
                  pathname: Routes.nutrition.log,
                  params: { mealType: suggestedMealType, mode: 'photo' },
                } as never)
              }
              hint="Analiza una comida a partir de una foto."
            />
            <QuickAction
              icon="barcode-outline"
              label="Codigo"
              onPress={() =>
                router.push({
                  pathname: Routes.nutrition.barcode,
                  params: { mealType: suggestedMealType },
                } as never)
              }
              hint="Escanea un codigo de barras para cargar un alimento."
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
          </View>
        </Card>

        {frequentMeals.length ? (
          <Card style={styles.recentCard} shadow={false}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Repetir rapido</Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: Routes.nutrition.log,
                    params: { mealType: suggestedMealType, mode: 'search', library: 'recent' },
                  } as never)
                }
                accessibilityRole="button"
                accessibilityLabel="Abrir recientes"
                accessibilityHint="Muestra tus registros recientes para repetirlos."
                hitSlop={8}
              >
                <Text style={styles.sectionLink}>Ver recientes</Text>
              </Pressable>
            </View>
            <View style={styles.recentRow}>
              {frequentMeals.slice(0, 5).map((item) => (
                <Pressable
                  key={item.key}
                  style={[
                    styles.recentPill,
                    loggingFrequentKey === item.key && styles.recentPillActive,
                    isLogging && loggingFrequentKey !== item.key && styles.recentPillDisabled,
                  ]}
                  disabled={isLogging}
                  onPress={() => void handleFrequentMealPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Repetir ${item.food_name}`}
                  accessibilityHint="Registra esta comida frecuente con un solo toque."
                  accessibilityState={{ disabled: isLogging }}
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.recentPillText,
                      loggingFrequentKey === item.key && styles.recentPillTextActive,
                    ]}
                  >
                    {loggingFrequentKey === item.key ? `Guardando ${item.food_name}...` : item.food_name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        <Card style={styles.mealRailCard} shadow={false}>
          <View style={styles.mealRailHeader}>
            <Text style={styles.sectionTitle}>Comidas de hoy</Text>
            <Text style={styles.sectionHint}>Una fila por decision clara, no una lista infinita.</Text>
          </View>
          <View style={styles.mealRailRow}>
            {visibleMealTypes.map((mealType) => {
              const meta = MEAL_TYPES[mealType];
              const meals = visibleMealsByType[mealType];
              const active = mealType === coachCard.mealType;
              return (
                <Pressable
                  key={mealType}
                  style={[styles.mealRailPill, active && styles.mealRailPillActive]}
                  onPress={() =>
                    router.push({
                      pathname: Routes.nutrition.log,
                      params: { mealType },
                    } as never)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${meta.label.toLowerCase()}`}
                  accessibilityHint="Registra o revisa esta comida."
                >
                  <Text style={[styles.mealRailTitle, active && styles.mealRailTitleActive]}>{meta.label}</Text>
                  <Text style={styles.mealRailMeta}>
                    {meals.length
                      ? `${meals.length} item${meals.length > 1 ? 's' : ''}`
                      : active
                        ? 'Prioridad'
                        : 'Pendiente'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.mealBreakdownCard} shadow={false}>
          <View style={styles.mealBreakdownHeader}>
            <Text style={styles.sectionTitle}>Macros por comida</Text>
            <Text style={styles.sectionHint}>Lectura rápida de cómo se reparte el día</Text>
          </View>
          {macroInsightsByMeal.map((insight) => (
            <MacroByMealCard key={insight.mealType} insight={insight} />
          ))}
        </Card>

        {visibleMealTypes.map((mealType) => {
          const meta = MEAL_TYPES[mealType];
          const meals = visibleMealsByType[mealType];
          const mealTotals = buildMealTotals(meals);
          const isSuggestedMeal = mealType === coachCard.mealType && meals.length === 0;

          return (
            <Card key={mealType} style={[styles.mealCard, isSuggestedMeal && styles.mealCardSuggested]} shadow={false}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleWrap}>
                  <View style={styles.mealTitleRow}>
                    <Text style={styles.mealLabel}>{meta.label}</Text>
                    {isSuggestedMeal ? (
                      <View style={styles.mealSuggestedBadge}>
                        <Text style={styles.mealSuggestedBadgeText}>Siguiente</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.mealMeta}>
                    {meals.length
                      ? `${meals.length} item${meals.length > 1 ? 's' : ''} · ${Math.round(mealTotals.calories)} kcal`
                      : 'Todavia sin registro'}
                  </Text>
                </View>
                <View style={styles.mealHeaderActions}>
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
              </View>

              <View style={styles.mealMacroRow}>
                <View style={styles.mealMacroChip}>
                  <Text style={styles.mealMacroChipText}>{Math.round(mealTotals.protein)}P</Text>
                </View>
                <View style={styles.mealMacroChip}>
                  <Text style={styles.mealMacroChipText}>{Math.round(mealTotals.carbs)}C</Text>
                </View>
                <View style={styles.mealMacroChip}>
                  <Text style={styles.mealMacroChipText}>{Math.round(mealTotals.fat)}G</Text>
                </View>
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
                  <Text style={styles.emptyMealText}>
                    {isSuggestedMeal
                      ? 'Este es el mejor lugar para seguir. Usa + y deja esta comida visible con una entrada simple.'
                      : 'Todavía no hay items en esta comida. Usa + para dejarla cargada en un toque.'}
                  </Text>
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
          {hasWeeklyHistory ? (
            <View style={styles.historyBars}>
              {weeklyData.slice(-7).map((item) => {
                const heightPct = visibleRatioPercent(item.calories, maxWeekValue);
                const withinRange =
                  item.calories >= calorieGoal * NUTRITION_ON_TARGET_MIN &&
                  item.calories <= calorieGoal * NUTRITION_ON_TARGET_MAX;
                const overflow = item.calories > calorieGoal * NUTRITION_ON_TARGET_MAX;
                const fillColor = withinRange
                  ? Colors.success
                  : overflow
                    ? Colors.warning
                    : Colors.elevated;
                const label = new Date(`${item.date}T12:00:00`)
                  .toLocaleDateString('es-UY', { weekday: 'short' })
                  .slice(0, 1)
                  .toUpperCase();
                return (
                  <View key={item.date} style={styles.historyItem}>
                    <View style={styles.historyTrack}>
                      <View style={[styles.historyGoalLine, { bottom: goalOffset }]} />
                      <View style={[styles.historyFill, { height: `${heightPct}%`, backgroundColor: fillColor }]} />
                    </View>
                    <Text style={styles.historyDay}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyTitle}>Aún no hay una semana para leer</Text>
              <Text style={styles.historyEmptyBody}>
                Cuando dejes varios días con comidas reales, aquí vas a ver ritmo, desvíos y días bien cerrados.
              </Text>
            </View>
          )}
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
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.px20,
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
  coachCard: {
    gap: Spacing[3],
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  loadingCard: {
    gap: Spacing[2],
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
  summarySnapshotRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  summarySnapshot: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: 4,
  },
  summarySnapshotLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  summarySnapshotValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
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
  summaryLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.nutrition,
  },
  summaryContext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.px20,
    color: Colors.textSecondary,
  },
  macroProgressGroup: {
    gap: Spacing[2],
  },
  macroProgressRow: {
    gap: Spacing[1.5],
  },
  macroProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  macroProgressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  macroProgressDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  macroProgressLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  macroProgressValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  macroProgressTarget: {
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  macroProgressTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.elevated,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  macroSnapshotRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  macroSnapshot: {
    flex: 1,
    borderRadius: Radius.xl,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 2,
  },
  macroSnapshotValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  macroSnapshotLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  coachTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  inputCard: {
    gap: Spacing[3],
  },
  inputHeader: {
    gap: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  quickAction: {
    width: ComponentWidth.quickAction,
    minHeight: ComponentHeight.quickActionNutrition,
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
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
  sectionLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.nutrition,
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  recentPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  recentPillActive: {
    backgroundColor: withOpacity(Colors.nutrition, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.nutrition, 0.24),
  },
  recentPillDisabled: {
    opacity: 0.55,
  },
  recentPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  recentPillTextActive: {
    color: Colors.nutrition,
  },
  mealRailCard: {
    gap: Spacing[3],
  },
  mealRailHeader: {
    gap: 4,
  },
  mealRailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  mealRailPill: {
    width: '49%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    gap: 4,
  },
  mealRailPillActive: {
    borderColor: withOpacity(Colors.nutrition, 0.2),
    backgroundColor: withOpacity(Colors.nutrition, 0.1),
  },
  mealRailTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  mealRailTitleActive: {
    color: Colors.nutrition,
  },
  mealRailMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  emptyDayCard: {
    gap: Spacing[3],
  },
  mealCard: {
    gap: Spacing[3],
  },
  mealCardSuggested: {
    borderWidth: 1,
    borderColor: withOpacity(Colors.nutrition, 0.18),
    backgroundColor: withOpacity(Colors.nutrition, 0.06),
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  mealTitleWrap: {
    flex: 1,
    gap: 2,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  mealHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  mealLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  mealMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  mealSuggestedBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.nutrition, 0.2),
    backgroundColor: withOpacity(Colors.nutrition, 0.1),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: 6,
  },
  mealSuggestedBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.nutrition,
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
  mealMacroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  mealMacroChip: {
    borderRadius: Radius.full,
    backgroundColor: Colors.elevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  mealMacroChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.elevated,
  },
  emptyMealRow: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
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
    height: ComponentHeight.historyBars,
  },
  historyItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  historyTrack: {
    width: '100%',
    flex: 1,
    position: 'relative',
    borderRadius: Radius.sm,
    backgroundColor: Colors.elevated,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  historyGoalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withOpacity(Colors.nutrition, 0.24),
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
  historyEmpty: {
    gap: Spacing[1],
    borderRadius: Radius.lg,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  historyEmptyTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  historyEmptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  coachActions: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'center',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.textMuted, 0.08),
  },
  feedbackButtonDisabled: {
    opacity: 0.5,
  },
  feedbackButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  feedbackButtonTextActive: {
    color: Colors.success,
  },
  mealBreakdownCard: {
    gap: Spacing[0],
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  mealBreakdownHeader: {
    gap: Spacing[1],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.06),
  },
});
