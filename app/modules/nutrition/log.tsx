import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  MEAL_TYPES,
  useNutrition,
  type FoodItem,
  type FrequentMeal,
  type MealType,
  type RecentMeal,
} from '@/hooks/useNutrition';
import { analyzeNutritionPhoto, type NutritionAIResult } from '@/lib/ai-assist';
import { triggerNotificationHaptic } from '@/lib/haptics';
import {
  calculateNutritionPreview,
  canSubmitManualNutrition,
  getNutritionQuickAmounts,
  normalizeNutritionAmount,
  parseNutritionNumber,
} from '@/lib/nutrition-log';

type LogMode = 'search' | 'photo' | 'barcode' | 'manual';
type LibraryTab = 'frequent' | 'recent';
type SearchUnit = 'g' | 'ml' | 'porciones';

type PhotoComponentDraft = {
  id: string;
  name: string;
  amount: string;
  selected: boolean;
};

const PHOTO_CONFIDENCE_WARNING = 0.65;
const SEARCH_UNITS: SearchUnit[] = ['g', 'ml', 'porciones'];

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function formatMacroValue(value: number) {
  return round1(value).toFixed(value >= 10 ? 0 : 1);
}

function formatRecentStamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function normalizeSearchAmount(value: string, unit: SearchUnit) {
  const fallback = unit === 'porciones' ? 1 : 100;
  const base = normalizeNutritionAmount(value, fallback);
  return unit === 'porciones' ? base * 100 : base;
}

function buildPhotoComponents(draft: NutritionAIResult): PhotoComponentDraft[] {
  if (!draft.components.length) {
    return [
      {
        id: 'single',
        name: draft.food_name,
        amount: String(Math.round(draft.amount_g || 100)),
        selected: true,
      },
    ];
  }

  return draft.components.map((component, index) => ({
    id: `${component.name}-${index}`,
    name: component.name,
    amount: String(Math.round(component.amount_g ?? 100)),
    selected: true,
  }));
}

function buildAdjustedPhotoDraft(
  draft: NutritionAIResult,
  components: PhotoComponentDraft[],
): NutritionAIResult {
  const selected = components.filter((item) => item.selected);
  const originalTotal =
    draft.components.reduce((sum, item) => sum + Math.max(0, Number(item.amount_g ?? 0)), 0) || draft.amount_g || 100;
  const selectedTotal =
    selected.reduce((sum, item) => sum + Math.max(0, normalizeNutritionAmount(item.amount, 0)), 0) || draft.amount_g || 100;
  const ratio = selectedTotal / Math.max(1, originalTotal);
  const foodName = selected.map((item) => item.name).join(', ').trim() || draft.food_name;

  return {
    ...draft,
    food_name: foodName,
    amount_g: Math.round(selectedTotal),
    calories: round1(draft.calories * ratio),
    protein_g: round1(draft.protein_g * ratio),
    carbs_g: round1(draft.carbs_g * ratio),
    fat_g: round1(draft.fat_g * ratio),
    fiber_g: round1(draft.fiber_g * ratio),
    note:
      ratio === 1
        ? draft.note
        : 'Ajustamos porciones según los items que dejaste marcados antes de confirmar.',
    components: selected.map((item) => ({
      name: item.name,
      amount_g: normalizeNutritionAmount(item.amount, 0),
    })),
  };
}

function scalePresetPreview(
  meal: FrequentMeal | RecentMeal,
  amountG: number,
) {
  const ratio = amountG / Math.max(1, meal.amount_g || 100);
  return {
    calories: round1(meal.calories * ratio),
    protein: round1(meal.protein_g * ratio),
    carbs: round1(meal.carbs_g * ratio),
    fat: round1(meal.fat_g * ratio),
    fiber: round1(meal.fiber_g * ratio),
  };
}

function MacroStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={[styles.macroStat, { borderColor: withOpacity(accent, 0.16) }]}>
      <Text style={[styles.macroStatValue, { color: accent }]}>{value}</Text>
      <Text style={styles.macroStatLabel}>{label}</Text>
    </View>
  );
}

export default function NutritionLogScreen() {
  const params = useLocalSearchParams<{ mealType?: MealType; mode?: LogMode; library?: LibraryTab; mealId?: string }>();
  const mealType = params.mealType ?? 'snack';
  const mealMeta = MEAL_TYPES[mealType];
  const editingMealId = typeof params.mealId === 'string' ? params.mealId : '';
  const isEditingFlow = editingMealId.length > 0;
  const initialMode: LogMode =
    isEditingFlow
      ? 'manual'
      : params.mode === 'photo' || params.mode === 'manual' || params.mode === 'barcode'
      ? params.mode
      : 'search';
  const initialLibraryTab: LibraryTab = params.library === 'recent' ? 'recent' : 'frequent';

  const { logMealAsync, updateMealAsync, isLogging, searchFoods, frequentMeals, recentMeals, todayMeals } = useNutrition();
  const editingMeal = useMemo(
    () => todayMeals.find((meal) => meal.id === editingMealId) ?? null,
    [editingMealId, todayMeals],
  );
  const hydratedMealIdRef = useRef<string | null>(null);

  const [mode, setMode] = useState<LogMode>(initialMode);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>(initialLibraryTab);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedPresetMeal, setSelectedPresetMeal] = useState<FrequentMeal | RecentMeal | null>(null);
  const [amountValue, setAmountValue] = useState('100');
  const [amountUnit, setAmountUnit] = useState<SearchUnit>('g');

  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualGrams, setManualGrams] = useState('100');
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);

  const [photoDraft, setPhotoDraft] = useState<NutritionAIResult | null>(null);
  const [photoItems, setPhotoItems] = useState<PhotoComponentDraft[]>([]);
  const [showPhotoPortions, setShowPhotoPortions] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const quickAmounts = useMemo(() => getNutritionQuickAmounts(mealType), [mealType]);
  const frequentByMeal = useMemo(() => {
    const specific = frequentMeals.filter((item) => item.meal_type === mealType);
    return (specific.length ? specific : frequentMeals).slice(0, 6);
  }, [frequentMeals, mealType]);
  const recentByMeal = useMemo(() => {
    const specific = recentMeals.filter((item) => item.meal_type === mealType);
    return (specific.length ? specific : recentMeals).slice(0, 6);
  }, [mealType, recentMeals]);
  const browseMeals = libraryTab === 'recent' ? recentByMeal : frequentByMeal;
  const normalizedAmount = normalizeSearchAmount(amountValue, amountUnit);
  const isSubmittingMeal = isLogging || isSubmittingEntry;

  const selectedPreview = useMemo(() => {
    if (selectedFood) {
      return calculateNutritionPreview(selectedFood, normalizedAmount);
    }

    if (selectedPresetMeal) {
      return scalePresetPreview(selectedPresetMeal, normalizedAmount);
    }

    return null;
  }, [normalizedAmount, selectedFood, selectedPresetMeal]);

  const photoNeedsFallback = Boolean(
    photoDraft && (photoDraft.confidence < PHOTO_CONFIDENCE_WARNING || photoDraft.components.length === 0),
  );

  const selectedPhotoCount = photoItems.filter((item) => item.selected).length;

  useEffect(() => {
    if (!editingMealId) {
      hydratedMealIdRef.current = null;
      return;
    }

    if (!editingMeal || hydratedMealIdRef.current === editingMealId) {
      return;
    }

    hydratedMealIdRef.current = editingMealId;
    setMode('manual');
    setManualName(editingMeal.food_name);
    setManualGrams(String(Math.round(editingMeal.amount_g || 100)));
    setManualCalories(String(Math.round(editingMeal.calories || 0)));
    setManualProtein(String(round1(editingMeal.protein_g || 0)));
    setManualCarbs(String(round1(editingMeal.carbs_g || 0)));
    setManualFat(String(round1(editingMeal.fat_g || 0)));
    setManualFiber(String(round1(editingMeal.fiber_g || 0)));
    setPhotoDraft(null);
    setPhotoItems([]);
    setPhotoError('');
    setSelectedFood(null);
    setSelectedPresetMeal(null);
  }, [editingMeal, editingMealId]);

  const hydrateManualDraft = useCallback((draft: NutritionAIResult) => {
    setManualName(draft.food_name);
    setManualGrams(String(Math.round(draft.amount_g || 100)));
    setManualCalories(String(Math.round(draft.calories || 0)));
    setManualProtein(String(round1(draft.protein_g || 0)));
    setManualCarbs(String(round1(draft.carbs_g || 0)));
    setManualFat(String(round1(draft.fat_g || 0)));
    setManualFiber(String(round1(draft.fiber_g || 0)));
    setMode('manual');
  }, []);

  const resetSelectionPreview = useCallback(() => {
    setSelectedFood(null);
    setSelectedPresetMeal(null);
  }, []);

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);
      resetSelectionPreview();
      if (value.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const found = await searchFoods(value.trim());
        setResults(found);
      } finally {
        setIsSearching(false);
      }
    },
    [resetSelectionPreview, searchFoods],
  );

  const handleAnalyzePhoto = useCallback(
    async (source: 'camera' | 'library') => {
      setPhotoError('');
      setIsAnalyzingPhoto(true);
      try {
        const permission =
          source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setPhotoError(source === 'camera' ? 'Hace falta permiso de cámara.' : 'Hace falta permiso de galería.');
          return;
        }

        const result =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync({
                quality: 0.65,
                base64: true,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.65,
                base64: true,
                allowsMultipleSelection: false,
              });

        if (result.canceled || !result.assets?.[0]?.base64) {
          return;
        }

        const asset = result.assets[0];
        const imageBase64 = typeof asset.base64 === 'string' ? asset.base64 : '';
        if (!imageBase64) {
          setPhotoError('No pude leer la foto para analizarla.');
          return;
        }

        const parsed = await analyzeNutritionPhoto({
          imageBase64,
          mimeType: asset.mimeType ?? 'image/jpeg',
          description: `${mealMeta.label} del usuario`,
        });

        setPhotoDraft(parsed);
        setPhotoItems(buildPhotoComponents(parsed));
        setShowPhotoPortions(false);
        void triggerNotificationHaptic('success');
      } catch (error) {
        setPhotoError(error instanceof Error ? error.message : 'No pude analizar la foto.');
      } finally {
        setIsAnalyzingPhoto(false);
      }
    },
    [mealMeta.label],
  );

  const handleConfirmPhoto = useCallback(() => {
    if (!photoDraft) return;
    const adjusted = buildAdjustedPhotoDraft(photoDraft, photoItems);
    hydrateManualDraft(adjusted);
  }, [hydrateManualDraft, photoDraft, photoItems]);

  const handleAddSelectedFood = useCallback(async () => {
    if (!selectedPreview || isSubmittingEntry) return;
    setIsSubmittingEntry(true);

    try {
      if (selectedFood) {
        await logMealAsync({
          meal_type: mealType,
          food_name: selectedFood.name,
          food_id: selectedFood.id,
          amount_g: normalizedAmount,
          calories: selectedPreview.calories,
          protein_g: selectedPreview.protein,
          carbs_g: selectedPreview.carbs,
          fat_g: selectedPreview.fat,
          fiber_g: selectedPreview.fiber,
        });
        router.back();
        return;
      }

      if (selectedPresetMeal) {
        await logMealAsync({
          meal_type: mealType,
          food_name: selectedPresetMeal.food_name,
          food_id: selectedPresetMeal.food_id ?? undefined,
          amount_g: normalizedAmount,
          calories: selectedPreview.calories,
          protein_g: selectedPreview.protein,
          carbs_g: selectedPreview.carbs,
          fat_g: selectedPreview.fat,
          fiber_g: selectedPreview.fiber,
        });
        router.back();
      }
    } catch {
      // Toast/error handling already lives in the mutation hook.
    } finally {
      setIsSubmittingEntry(false);
    }
  }, [
    isSubmittingEntry,
    logMealAsync,
    mealType,
    normalizedAmount,
    selectedFood,
    selectedPresetMeal,
    selectedPreview,
  ]);

  const handleAddManual = useCallback(async () => {
    const trimmed = manualName.trim();
    if (isSubmittingEntry || !canSubmitManualNutrition({ name: trimmed, calories: manualCalories })) return;
    setIsSubmittingEntry(true);

    try {
      const preservedFoodId =
        editingMeal?.food_id && editingMeal.food_name.trim().toLowerCase() === trimmed.toLowerCase()
          ? editingMeal.food_id
          : undefined;
      const payload = {
        meal_type: editingMeal?.meal_type ?? mealType,
        food_name: trimmed,
        food_id: preservedFoodId ?? undefined,
        amount_g: normalizeNutritionAmount(manualGrams, 100),
        calories: parseNutritionNumber(manualCalories) ?? 0,
        protein_g: parseNutritionNumber(manualProtein) ?? 0,
        carbs_g: parseNutritionNumber(manualCarbs) ?? 0,
        fat_g: parseNutritionNumber(manualFat) ?? 0,
        fiber_g: parseNutritionNumber(manualFiber) ?? 0,
        source: editingMeal?.source ?? (photoDraft ? 'photo_ai' : 'manual'),
      };

      if (editingMeal) {
        await updateMealAsync({
          mealId: editingMeal.id,
          logged_at: editingMeal.logged_at,
          ...payload,
        });
      } else {
        await logMealAsync(payload);
      }

      router.back();
    } catch {
      // Toast/error handling already lives in the mutation hook.
    } finally {
      setIsSubmittingEntry(false);
    }
  }, [
    isSubmittingEntry,
    logMealAsync,
    updateMealAsync,
    manualCalories,
    manualCarbs,
    manualFat,
    manualFiber,
    manualGrams,
    manualName,
    manualProtein,
    mealType,
    editingMeal,
    photoDraft,
  ]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title={isEditingFlow ? `Editar ${mealMeta.label}` : `Agregar a ${mealMeta.label}`} showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEditingFlow ? (
          <Card style={styles.sectionCard} shadow={false}>
            <Text style={styles.sectionTitle}>Editando registro</Text>
            <Text style={styles.sectionBody}>
              Ajusta nombre, gramos o macros y guarda el cambio sin borrar el registro original.
            </Text>
          </Card>
        ) : (
          <View style={styles.modeRow}>
          {(['search', 'photo', 'barcode', 'manual'] as LogMode[]).map((item) => {
            const isActive = mode === item;
            return (
              <Pressable
                key={item}
                style={[styles.modePill, isActive && styles.modePillActive]}
                onPress={() => {
                  if (item === 'barcode') {
                    router.push(Routes.nutrition.barcode as never);
                    return;
                  }
                  setMode(item);
                }}
                accessibilityRole="radio"
                accessibilityLabel={`Modo ${item === 'search' ? 'buscar' : item === 'photo' ? 'foto' : item === 'barcode' ? 'codigo' : 'manual'}`}
                accessibilityState={{ selected: isActive }}
                hitSlop={8}
              >
                <Text style={[styles.modePillText, isActive && styles.modePillTextActive]}>
                  {item === 'search'
                        ? 'Buscar'
                      : item === 'photo'
                        ? 'Foto'
                        : item === 'barcode'
                        ? 'Código'
                        : 'Manual'}
                </Text>
              </Pressable>
            );
          })}
          </View>
        )}

        {mode === 'search' ? (
          <>
            <Card style={styles.sectionCard} shadow={false}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Biblioteca rápida</Text>
                  <Text style={styles.sectionBody}>Abre algo frecuente o recupera un registro reciente antes de buscar.</Text>
                </View>
                <View style={styles.libraryTabs}>
                  {(['frequent', 'recent'] as LibraryTab[]).map((item) => {
                    const active = libraryTab === item;
                    return (
                      <Pressable
                        key={item}
                        style={[styles.libraryTab, active && styles.libraryTabActive]}
                        onPress={() => setLibraryTab(item)}
                        accessibilityRole="tab"
                        accessibilityLabel={item === 'frequent' ? 'Frecuentes' : 'Recientes'}
                        accessibilityState={{ selected: active }}
                        hitSlop={8}
                      >
                        <Text style={[styles.libraryTabText, active && styles.libraryTabTextActive]}>
                          {item === 'frequent' ? 'Frecuentes' : 'Recientes'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.libraryList}>
                {browseMeals.length ? (
                  browseMeals.map((meal) => {
                    const isRecent = 'logged_at' in meal;
                    return (
                      <Pressable
                        key={meal.key}
                        style={styles.libraryRow}
                        onPress={() => {
                          setSelectedFood(null);
                          setSelectedPresetMeal(meal);
                          setAmountUnit('g');
                          setAmountValue(String(Math.round(meal.amount_g)));
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Usar ${meal.food_name}`}
                        accessibilityHint="Carga esta comida para confirmar cantidad y macros."
                      >
                        <View style={styles.libraryCopy}>
                          <Text style={styles.libraryName}>{meal.food_name}</Text>
                          <Text style={styles.libraryMeta}>
                            {Math.round(meal.calories)} kcal | {Math.round(meal.amount_g)} g
                            {isRecent ? ` | ${formatRecentStamp((meal as RecentMeal).logged_at)}` : ''}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={styles.emptyHint}>
                    {libraryTab === 'frequent'
                      ? 'Todavía no hay alimentos frecuentes para esta comida.'
                      : 'Todavía no hay alimentos recientes para mostrar.'}
                  </Text>
                )}
              </View>
            </Card>

            <Input
              label="Buscar alimento"
              placeholder="Ej: arroz, yogur, pollo..."
              value={query}
              onChangeText={(value) => void handleSearch(value)}
              autoFocus
            />

            {isSearching ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.textSecondary} />
                <Text style={styles.loadingText}>Buscando alimentos...</Text>
              </View>
            ) : null}

            {results.length ? (
              <Card style={styles.sectionCard} shadow={false}>
                <Text style={styles.sectionTitle}>Resultados</Text>
                <View style={styles.resultsList}>
                  {results.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.resultRow}
                      onPress={() => {
                        setSelectedPresetMeal(null);
                        setSelectedFood(item);
                        setAmountUnit('g');
                        setAmountValue('100');
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Seleccionar ${item.name}`}
                      accessibilityHint="Abre la confirmación con macros y cantidad."
                    >
                      <View style={styles.resultCopy}>
                        <Text style={styles.resultName}>{item.name}</Text>
                        <Text style={styles.resultMeta}>
                          {item.brand ? `${item.brand} | ` : ''}
                          {Math.round(item.calories_per_100g)} kcal/100g
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              </Card>
            ) : null}

            {(selectedFood || selectedPresetMeal) && selectedPreview ? (
              <Card style={styles.previewCard} shadow={false}>
                <View style={styles.confirmHeader}>
                  <Text style={styles.sectionTitle}>
                    {selectedFood?.name ?? selectedPresetMeal?.food_name ?? 'Alimento'}
                  </Text>
                  <Text style={styles.confirmHint}>Confirma macros y cantidad antes de agregar.</Text>
                </View>

                <View style={styles.macroGrid}>
                  <MacroStat label="Kcal" value={formatMacroValue(selectedPreview.calories)} accent={Colors.action} />
                  <MacroStat label="Prot" value={`${formatMacroValue(selectedPreview.protein)}g`} accent={Colors.success} />
                  <MacroStat label="Carb" value={`${formatMacroValue(selectedPreview.carbs)}g`} accent={Colors.warning} />
                  <MacroStat label="Grasa" value={`${formatMacroValue(selectedPreview.fat)}g`} accent={Colors.error} />
                </View>
                <MacroStat label="Fibra" value={`${formatMacroValue(selectedPreview.fiber)}g`} accent={Colors.textPrimary} />

                <Input
                  label="Cantidad"
                  value={amountValue}
                  onChangeText={setAmountValue}
                  keyboardType="numeric"
                  inputStyle={styles.amountInputText}
                  style={styles.amountInputWrap}
                />

                <View style={styles.unitRow}>
                  {SEARCH_UNITS.map((unit) => {
                    const active = amountUnit === unit;
                    return (
                        <Pressable
                          key={unit}
                          style={[styles.unitChip, active && styles.unitChipActive]}
                          onPress={() => setAmountUnit(unit)}
                          accessibilityRole="radio"
                          accessibilityLabel={`Unidad ${unit}`}
                          accessibilityState={{ selected: active }}
                          hitSlop={8}
                        >
                        <Text style={[styles.unitChipText, active && styles.unitChipTextActive]}>{unit}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {amountUnit === 'porciones' ? (
                  <Text style={styles.portionHint}>1 porción se estima como 100g para está confirmación.</Text>
                ) : null}

                <View style={styles.amountRow}>
                  {quickAmounts.map((value) => (
                    <Pressable
                      key={`${value}-${mealType}`}
                      style={[
                        styles.amountChip,
                        normalizedAmount === value && amountUnit === 'g' && styles.amountChipActive,
                      ]}
                      onPress={() => {
                        setAmountUnit('g');
                        setAmountValue(String(value));
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Cantidad rápida ${value} gramos`}
                      accessibilityState={{ selected: normalizedAmount === value && amountUnit === 'g' }}
                      hitSlop={8}
                    >
                      <Text
                        style={[
                          styles.amountChipText,
                          normalizedAmount === value && amountUnit === 'g' && styles.amountChipTextActive,
                        ]}
                      >
                        {value}g
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Button onPress={() => void handleAddSelectedFood()} loading={isSubmittingMeal} fullWidth>
                  Agregar a {mealMeta.label}
                </Button>
              </Card>
            ) : null}
          </>
        ) : null}

        {mode === 'photo' ? (
          <>
            <Card style={styles.sectionCard} shadow={false}>
              <Text style={styles.sectionTitle}>Foto IA</Text>
              <Text style={styles.sectionBody}>
                Saca una foto, revisa lo que VYRA detecta y ajusta porciones antes de confirmar.
              </Text>
              <Button
                onPress={() => void handleAnalyzePhoto('camera')}
                loading={isAnalyzingPhoto}
                fullWidth
              >
                Tomar foto
              </Button>
              <Button
                onPress={() => void handleAnalyzePhoto('library')}
                variant="ghost"
                fullWidth
                disabled={isAnalyzingPhoto}
              >
                Elegir de galería
              </Button>
              {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
            </Card>

            {photoDraft ? (
              <Card style={styles.previewCard} shadow={false}>
                <Text style={styles.sectionTitle}>Esto detectó la IA</Text>
                <Text style={styles.previewMeta}>
                  {Math.round(photoDraft.calories)} kcal | confianza {Math.round(photoDraft.confidence * 100)}%
                </Text>

                {photoNeedsFallback ? (
                  <View style={styles.warningBanner}>
                    <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
                    <Text style={styles.warningBannerText}>
                      La deteccion tiene baja confianza. Conviene revisar o pasar a busqueda manual.
                      
                    </Text>
                  </View>
                ) : null}

                <View style={styles.componentList}>
                  {photoItems.map((component) => (
                    <View key={component.id} style={styles.componentItem}>
                      <Pressable
                        style={styles.componentCheck}
                        onPress={() =>
                          setPhotoItems((current) =>
                            current.map((item) =>
                              item.id === component.id ? { ...item, selected: !item.selected } : item,
                            ),
                          )
                        }
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Incluir ${component.name}`}
                        accessibilityState={{ checked: component.selected }}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={component.selected ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={component.selected ? Colors.action : Colors.textMuted}
                        />
                      </Pressable>
                      <View style={styles.componentCopy}>
                        <Text style={styles.componentName}>{component.name}</Text>
                        <Text style={styles.componentMeta}>
                          {normalizeNutritionAmount(component.amount, 0)
                            ? `${Math.round(normalizeNutritionAmount(component.amount, 0))} g estimados`
                            : 'Sin cantidad estimada'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Button
                  onPress={() => setShowPhotoPortions((value) => !value)}
                  variant="ghost"
                  fullWidth
                >
                  {showPhotoPortions ? 'Ocultar ajuste de porciones' : 'Ajustar porciones'}
                </Button>

                {showPhotoPortions ? (
                  <View style={styles.photoAdjustList}>
                    {photoItems.map((component) => (
                      <View key={`adjust-${component.id}`} style={styles.photoAdjustRow}>
                        <Text style={styles.photoAdjustLabel}>{component.name}</Text>
                        <Input
                          value={component.amount}
                          onChangeText={(value) =>
                            setPhotoItems((current) =>
                              current.map((item) =>
                                item.id === component.id ? { ...item, amount: value } : item,
                              ),
                            )
                          }
                          keyboardType="numeric"
                          unit="g"
                          style={styles.photoAdjustInput}
                        />
                      </View>
                    ))}
                  </View>
                ) : null}

                <Text style={styles.photoSummary}>
                  {selectedPhotoCount > 0
                    ? `${selectedPhotoCount} item${selectedPhotoCount > 1 ? 's' : ''} marcado${selectedPhotoCount > 1 ? 's' : ''}.`
                    : 'Marca al menos un item para confirmar.'}
                </Text>

                <Button
                  onPress={handleConfirmPhoto}
                  fullWidth
                  disabled={selectedPhotoCount === 0}
                >
                  Confirmar deteccion
                </Button>
                {photoNeedsFallback ? (
                  <Button onPress={() => setMode('search')} variant="ghost" fullWidth>
                    Buscar manualmente
                  </Button>
                ) : null}
              </Card>
            ) : null}
          </>
        ) : null}

        {mode === 'manual' ? (
          <Card style={styles.manualCard} shadow={false}>
            <Text style={styles.sectionTitle}>Carga manual</Text>
            {photoDraft?.note ? <Text style={styles.sectionBody}>{photoDraft.note}</Text> : null}
            <Input label="Nombre" value={manualName} onChangeText={setManualName} placeholder="Ej: arroz con pollo" />
            <Input
              label="Cantidad"
              value={manualGrams}
              onChangeText={setManualGrams}
              keyboardType="numeric"
              unit="g"
            />
            <View style={styles.manualGrid}>
              <Input label="Kcal" value={manualCalories} onChangeText={setManualCalories} keyboardType="numeric" />
              <Input label="Proteína" value={manualProtein} onChangeText={setManualProtein} keyboardType="numeric" unit="g" />
            </View>
            <View style={styles.manualGrid}>
              <Input label="Carbos" value={manualCarbs} onChangeText={setManualCarbs} keyboardType="numeric" unit="g" />
              <Input label="Grasas" value={manualFat} onChangeText={setManualFat} keyboardType="numeric" unit="g" />
            </View>
            <Input label="Fibra" value={manualFiber} onChangeText={setManualFiber} keyboardType="numeric" unit="g" />
            <Button
              onPress={() => void handleAddManual()}
              loading={isSubmittingMeal}
              fullWidth
              disabled={isSubmittingMeal || !canSubmitManualNutrition({ name: manualName.trim(), calories: manualCalories })}
            >
              {isEditingFlow ? 'Guardar cambios' : `Agregar a ${mealMeta.label}`}
            </Button>
          </Card>
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  modePill: {
    minHeight: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  modePillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  modePillTextActive: {
    color: Colors.white,
  },
  sectionCard: {
    gap: Spacing[3],
  },
  cardHeaderRow: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  libraryTabs: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  libraryTab: {
    minHeight: 34,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  libraryTabActive: {
    borderColor: Colors.actionBorder,
    backgroundColor: Colors.actionBg,
  },
  libraryTabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  libraryTabTextActive: {
    color: Colors.action,
  },
  libraryList: {
    gap: Spacing[2],
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
  },
  libraryCopy: {
    flex: 1,
    gap: 4,
  },
  libraryName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  libraryMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  emptyHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  loadingText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  resultsList: {
    gap: Spacing[2],
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  resultMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  previewCard: {
    gap: Spacing[3],
  },
  confirmHeader: {
    gap: 4,
  },
  confirmHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  previewMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  macroStat: {
    minWidth: 78,
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 2,
  },
  macroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  macroStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  amountInputWrap: {
    marginBottom: 0,
  },
  amountInputText: {
    fontFamily: FontFamily.black,
    fontSize: 30,
    textAlign: 'center',
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  unitChip: {
    minHeight: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitChipActive: {
    borderColor: Colors.actionBorder,
    backgroundColor: withOpacity(Colors.action, 0.12),
  },
  unitChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  unitChipTextActive: {
    color: Colors.action,
  },
  portionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  amountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  amountChip: {
    minHeight: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountChipActive: {
    backgroundColor: withOpacity(Colors.action, 0.1),
    borderColor: Colors.actionBorder,
  },
  amountChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  amountChipTextActive: {
    color: Colors.action,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.warning, 0.28),
    backgroundColor: withOpacity(Colors.warning, 0.1),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  warningBannerText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  componentList: {
    gap: Spacing[2],
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  componentCheck: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentCopy: {
    flex: 1,
    gap: 4,
  },
  componentName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  componentMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  photoAdjustList: {
    gap: Spacing[2],
  },
  photoAdjustRow: {
    gap: Spacing[1],
  },
  photoAdjustLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  photoAdjustInput: {
    marginBottom: 0,
  },
  photoSummary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  manualCard: {
    gap: Spacing[3],
  },
  manualGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.error,
  },
});
