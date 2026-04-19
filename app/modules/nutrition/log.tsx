import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
  type MealType,
} from '@/hooks/useNutrition';
import { analyzeNutritionPhoto, type NutritionAIResult } from '@/lib/ai-assist';
import {
  calculateNutritionPreview,
  canSubmitManualNutrition,
  getNutritionQuickAmounts,
  normalizeNutritionAmount,
  parseNutritionNumber,
} from '@/lib/nutrition-log';

type LogMode = 'search' | 'photo' | 'barcode' | 'manual';

export default function NutritionLogScreen() {
  const params = useLocalSearchParams<{ mealType?: MealType; mode?: LogMode }>();
  const mealType = params.mealType ?? 'snack';
  const mealMeta = MEAL_TYPES[mealType];
  const initialMode: LogMode =
    params.mode === 'photo' || params.mode === 'manual' || params.mode === 'barcode'
      ? params.mode
      : 'search';

  const { logMeal, isLogging, searchFoods, frequentMeals } = useNutrition();

  const [mode, setMode] = useState<LogMode>(initialMode);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amountG, setAmountG] = useState('100');

  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualGrams, setManualGrams] = useState('100');

  const [photoDraft, setPhotoDraft] = useState<NutritionAIResult | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const quickAmounts = useMemo(() => getNutritionQuickAmounts(mealType), [mealType]);
  const quickMeals = useMemo(() => {
    const specific = frequentMeals.filter((item) => item.meal_type === mealType);
    return (specific.length ? specific : frequentMeals).slice(0, 6);
  }, [frequentMeals, mealType]);

  const preview = selectedFood
    ? calculateNutritionPreview(selectedFood, normalizeNutritionAmount(amountG, 100))
    : null;

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);
      setSelectedFood(null);
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
    [searchFoods],
  );

  const applyPhotoDraft = useCallback((draft: NutritionAIResult) => {
    setPhotoDraft(draft);
    setManualName(draft.food_name);
    setManualGrams(String(Math.round(draft.amount_g || 100)));
    setManualCalories(String(Math.round(draft.calories || 0)));
    setManualProtein(String(Math.round(draft.protein_g || 0)));
    setManualCarbs(String(Math.round(draft.carbs_g || 0)));
    setManualFat(String(Math.round(draft.fat_g || 0)));
    setManualFiber(String(Math.round(draft.fiber_g || 0)));
    setMode('manual');
  }, []);

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
          setPhotoError(source === 'camera' ? 'Hace falta permiso de camara.' : 'Hace falta permiso de galeria.');
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        applyPhotoDraft(parsed);
      } catch (error) {
        setPhotoError(error instanceof Error ? error.message : 'No pude analizar la foto.');
      } finally {
        setIsAnalyzingPhoto(false);
      }
    },
    [applyPhotoDraft, mealMeta.label],
  );

  const handleAddSelectedFood = () => {
    if (!selectedFood || !preview) return;
    logMeal({
      meal_type: mealType,
      food_name: selectedFood.name,
      food_id: selectedFood.id,
      amount_g: normalizeNutritionAmount(amountG, 100),
      calories: preview.calories,
      protein_g: preview.protein,
      carbs_g: preview.carbs,
      fat_g: preview.fat,
      fiber_g: preview.fiber,
    });
    router.back();
  };

  const handleAddManual = () => {
    const trimmed = manualName.trim();
    if (!canSubmitManualNutrition({ name: trimmed, calories: manualCalories })) return;
    logMeal({
      meal_type: mealType,
      food_name: trimmed,
      amount_g: normalizeNutritionAmount(manualGrams, 100),
      calories: parseNutritionNumber(manualCalories) ?? 0,
      protein_g: parseNutritionNumber(manualProtein) ?? 0,
      carbs_g: parseNutritionNumber(manualCarbs) ?? 0,
      fat_g: parseNutritionNumber(manualFat) ?? 0,
      fiber_g: parseNutritionNumber(manualFiber) ?? 0,
      source: photoDraft ? 'photo_ai' : 'manual',
    });
    router.back();
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title={`Agregar a ${mealMeta.label}`} showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              >
                <Text style={[styles.modePillText, isActive && styles.modePillTextActive]}>
                  {item === 'search'
                    ? 'Buscar'
                    : item === 'photo'
                      ? 'Foto'
                      : item === 'barcode'
                        ? 'Codigo'
                        : 'Manual'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'search' ? (
          <>
            {quickMeals.length ? (
              <Card style={styles.sectionCard} shadow={false}>
                <Text style={styles.sectionTitle}>Frecuentes</Text>
                <View style={styles.quickMealsWrap}>
                  {quickMeals.map((meal) => (
                    <Pressable
                      key={meal.key}
                      style={styles.quickMealChip}
                      onPress={() => {
                        logMeal({
                          meal_type: mealType,
                          food_name: meal.food_name,
                          food_id: meal.food_id ?? undefined,
                          amount_g: meal.amount_g,
                          calories: meal.calories,
                          protein_g: meal.protein_g,
                          carbs_g: meal.carbs_g,
                          fat_g: meal.fat_g,
                          fiber_g: meal.fiber_g,
                        });
                        router.back();
                      }}
                    >
                      <Text style={styles.quickMealName} numberOfLines={1}>
                        {meal.food_name}
                      </Text>
                      <Text style={styles.quickMealMeta}>
                        {Math.round(meal.calories)} kcal · {meal.amount_g} g
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            ) : null}

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
                  {results.map((item, index) => (
                    <Pressable
                      key={item.id}
                      style={styles.resultRow}
                      onPress={() => {
                        setSelectedFood(item);
                        setAmountG('100');
                      }}
                    >
                      <View style={styles.resultCopy}>
                        <Text style={styles.resultName}>{item.name}</Text>
                        <Text style={styles.resultMeta}>
                          {item.brand ? `${item.brand} · ` : ''}
                          {Math.round(item.calories_per_100g)} kcal/100g
                        </Text>
                      </View>
                      <Text style={styles.resultArrow}>{'>'}</Text>
                      {index < results.length - 1 ? <View style={styles.resultDivider} /> : null}
                    </Pressable>
                  ))}
                </View>
              </Card>
            ) : null}

            {selectedFood && preview ? (
              <Card style={styles.previewCard} shadow={false}>
                <Text style={styles.sectionTitle}>{selectedFood.name}</Text>
                <Text style={styles.previewMeta}>
                  {preview.calories} kcal · {preview.protein}P · {preview.carbs}C · {preview.fat}G
                </Text>
                <View style={styles.amountRow}>
                  {quickAmounts.map((value) => (
                    <Pressable
                      key={value}
                      style={[
                        styles.amountChip,
                        normalizeNutritionAmount(amountG, 100) === value && styles.amountChipActive,
                      ]}
                      onPress={() => setAmountG(String(value))}
                    >
                      <Text
                        style={[
                          styles.amountChipText,
                          normalizeNutritionAmount(amountG, 100) === value && styles.amountChipTextActive,
                        ]}
                      >
                        {value}g
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Input
                  label="Cantidad"
                  value={amountG}
                  onChangeText={setAmountG}
                  keyboardType="numeric"
                  unit="g"
                />
                <Button onPress={handleAddSelectedFood} loading={isLogging} fullWidth>
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
                Haz una foto, revisa lo que VYRA detecta y corrige antes de guardar.
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
                Elegir de galeria
              </Button>
              {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
            </Card>

            {photoDraft ? (
              <Card style={styles.previewCard} shadow={false}>
                <Text style={styles.sectionTitle}>Detecte esto</Text>
                <Text style={styles.previewMeta}>
                  {Math.round(photoDraft.calories)} kcal · confianza {Math.round(photoDraft.confidence * 100)}%
                </Text>
                <View style={styles.componentList}>
                  {photoDraft.components.map((component) => (
                    <View key={`${component.name}-${component.amount_g ?? 'na'}`} style={styles.componentRow}>
                      <Text style={styles.componentName}>{component.name}</Text>
                      <Text style={styles.componentMeta}>
                        {component.amount_g ? `${Math.round(component.amount_g)} g` : 'sin cantidad'}
                      </Text>
                    </View>
                  ))}
                </View>
                <Button onPress={() => setMode('manual')} fullWidth>
                  Confirmar y corregir
                </Button>
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
              <Input label="Proteina" value={manualProtein} onChangeText={setManualProtein} keyboardType="numeric" unit="g" />
            </View>
            <View style={styles.manualGrid}>
              <Input label="Carbos" value={manualCarbs} onChangeText={setManualCarbs} keyboardType="numeric" unit="g" />
              <Input label="Grasas" value={manualFat} onChangeText={setManualFat} keyboardType="numeric" unit="g" />
            </View>
            <Input label="Fibra" value={manualFiber} onChangeText={setManualFiber} keyboardType="numeric" unit="g" />
            <Button
              onPress={handleAddManual}
              loading={isLogging}
              fullWidth
              disabled={!canSubmitManualNutrition({ name: manualName.trim(), calories: manualCalories })}
            >
              Agregar a {mealMeta.label}
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
  quickMealsWrap: {
    gap: Spacing[2],
  },
  quickMealChip: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 4,
  },
  quickMealName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  quickMealMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 56,
    paddingVertical: Spacing[2],
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
  resultArrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  resultDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -Spacing[1],
    height: 1,
    backgroundColor: Colors.border,
  },
  previewCard: {
    gap: Spacing[3],
  },
  previewMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
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
  componentList: {
    gap: Spacing[2],
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  componentName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  componentMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
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
