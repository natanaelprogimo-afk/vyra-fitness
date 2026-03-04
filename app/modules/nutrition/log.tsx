// ============================================================
// VYRA FITNESS — Nutrición: Log de comida
// Búsqueda en BD + entrada manual, cálculo por gramos
// ============================================================

import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView,
  Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useNutrition, MEAL_TYPES, type MealType, type FoodItem } from '@/hooks/useNutrition';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

type LogMode = 'search' | 'barcode' | 'manual';

export default function NutritionLogScreen() {
  const params    = useLocalSearchParams<{ mealType: MealType }>();
  const mealType  = params.mealType ?? 'snack';
  const config    = MEAL_TYPES[mealType];

  const { logMeal, isLogging, searchFoods } = useNutrition();

  const [mode,        setMode]       = useState<LogMode>('search');
  const [query,       setQuery]      = useState('');
  const [results,     setResults]    = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching]= useState(false);
  const [selected,    setSelected]   = useState<FoodItem | null>(null);
  const [amountG,     setAmountG]    = useState('100');

  // Manual mode fields
  const [manualName,  setManualName] = useState('');
  const [manualKcal,  setManualKcal] = useState('');
  const [manualProt,  setManualProt] = useState('');
  const [manualCarbs, setManualCarbs]= useState('');
  const [manualFat,   setManualFat]  = useState('');
  const [manualFiber, setManualFiber]= useState('');
  const [manualGrams, setManualGrams]= useState('100');

  // Buscar con debounce
  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    setSelected(null);
    if (text.length < 2) { setResults([]); return; }
    setIsSearching(true);
    const found = await searchFoods(text).finally(() => setIsSearching(false));
    setResults(found);
  }, []);

  // Calcular macros según gramos al seleccionar un alimento
  const calcForAmount = (food: FoodItem, grams: number) => {
    const factor = grams / 100;
    return {
      calories: food.calories_per_100g * factor,
      protein:  food.protein_g         * factor,
      carbs:    food.carbs_g           * factor,
      fat:      food.fat_g             * factor,
      fiber:    food.fiber_g           * factor,
    };
  };

  const preview = selected
    ? calcForAmount(selected, parseFloat(amountG) || 100)
    : null;

  const handleLogFromSearch = () => {
    if (!selected || !preview) return;
    const g = parseFloat(amountG) || 100;
    logMeal({
      meal_type: mealType,
      food_name: selected.name,
      food_id:   selected.id,
      amount_g:  g,
      calories:  preview.calories,
      protein_g: preview.protein,
      carbs_g:   preview.carbs,
      fat_g:     preview.fat,
      fiber_g:   preview.fiber,
    });
    router.back();
  };

  const handleLogManual = () => {
    const name = manualName.trim();
    if (!name || !manualKcal) return;
    logMeal({
      meal_type: mealType,
      food_name: name,
      amount_g:  parseFloat(manualGrams) || 100,
      calories:  parseFloat(manualKcal)  || 0,
      protein_g: parseFloat(manualProt)  || 0,
      carbs_g:   parseFloat(manualCarbs) || 0,
      fat_g:     parseFloat(manualFat)   || 0,
      fiber_g:   parseFloat(manualFiber) || 0,
    });
    router.back();
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title={`Agregar a ${config.label}`}
        showBack
        color={Colors.nutrition}
      />

      {/* Toggle mode */}
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeBtn, mode === 'search' && styles.modeBtnActive]}
          onPress={() => setMode('search')}
        >
          <Text style={[styles.modeBtnText, mode === 'search' && { color: Colors.nutrition }]}>
            🔍 Buscar
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'barcode' && styles.modeBtnActive]}
          onPress={() => router.push('/modules/nutrition/barcode-scan' as any)}
        >
          <Text style={[styles.modeBtnText, mode === 'barcode' && { color: Colors.nutrition }]}>
            📱 Código
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]}
          onPress={() => setMode('manual')}
        >
          <Text style={[styles.modeBtnText, mode === 'manual' && { color: Colors.nutrition }]}>
            ✏️ Manual
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        {mode === 'search' ? (
          <>
            {/* Search bar */}
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={handleSearch}
              placeholder="Buscar alimento (ej: arroz, pollo, manzana)..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
              returnKeyType="search"
            />

            {isSearching && (
              <ActivityIndicator color={Colors.nutrition} style={styles.spinner} />
            )}

            {/* Resultados */}
            {results.map((food) => (
              <Pressable
                key={food.id}
                onPress={() => {
                  setSelected(food);
                  setResults([]);
                  Haptics.selectionAsync().catch(() => {});
                }}
                style={[styles.resultRow, selected?.id === food.id && styles.resultRowActive]}
              >
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{food.name}</Text>
                  {food.brand && <Text style={styles.resultBrand}>{food.brand}</Text>}
                </View>
                <Text style={styles.resultKcal}>{Math.round(food.calories_per_100g)} kcal/100g</Text>
              </Pressable>
            ))}

            {/* Alimento seleccionado */}
            {selected && (
              <Card style={styles.selectedCard}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                {selected.brand && <Text style={styles.selectedBrand}>{selected.brand}</Text>}

                <Input
                  label="Cantidad"
                  value={amountG}
                  onChangeText={setAmountG}
                  keyboardType="numeric"
                  unit="g"
                  style={styles.amountInput}
                />

                {preview && (
                  <View style={styles.previewRow}>
                    <PreviewMacro label="Kcal"  value={Math.round(preview.calories)} color={Colors.nutrition} />
                    <PreviewMacro label="Prot"  value={Math.round(preview.protein)}  color="#FF6B6B" unit="g" />
                    <PreviewMacro label="Carbs" value={Math.round(preview.carbs)}    color={Colors.fasting}  unit="g" />
                    <PreviewMacro label="Grasas" value={Math.round(preview.fat)}     color="#FFD43B" unit="g" />
                  </View>
                )}

                <Button
                  onPress={handleLogFromSearch}
                  variant="primary"
                  fullWidth
                  loading={isLogging}
                  style={styles.logBtn}
                >
                  Agregar a {config.label}
                </Button>
              </Card>
            )}

            {results.length === 0 && query.length >= 2 && !isSearching && !selected && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No encontramos "{query}"</Text>
                <Pressable onPress={() => setMode('manual')}>
                  <Text style={styles.noResultsLink}>→ Ingresarlo manualmente</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          // Manual entry
          <View>
            <Text style={styles.manualTitle}>Ingresá la información nutricional</Text>
            <Input label="Nombre del alimento *" value={manualName} onChangeText={setManualName} style={styles.field} />
            <Input label="Cantidad" value={manualGrams} onChangeText={setManualGrams} keyboardType="numeric" unit="g" style={styles.field} />
            <Input label="Calorías *" value={manualKcal}  onChangeText={setManualKcal}  keyboardType="numeric" unit="kcal" style={styles.field} />
            <View style={styles.macroRow}>
              <Input label="Proteínas"   value={manualProt}  onChangeText={setManualProt}  keyboardType="numeric" unit="g" style={[styles.field, styles.halfField]} />
              <Input label="Carbohidrat" value={manualCarbs} onChangeText={setManualCarbs} keyboardType="numeric" unit="g" style={[styles.field, styles.halfField]} />
            </View>
            <View style={styles.macroRow}>
              <Input label="Grasas"   value={manualFat}   onChangeText={setManualFat}   keyboardType="numeric" unit="g" style={[styles.field, styles.halfField]} />
              <Input label="Fibra"    value={manualFiber} onChangeText={setManualFiber} keyboardType="numeric" unit="g" style={[styles.field, styles.halfField]} />
            </View>
            <Button
              onPress={handleLogManual}
              variant="primary"
              fullWidth
              loading={isLogging}
              disabled={!manualName.trim() || !manualKcal}
              style={styles.logBtn}
            >
              Agregar a {config.label}
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function PreviewMacro({ label, value, color, unit = '' }: { label: string; value: number; color: string; unit?: string }) {
  return (
    <View style={styles.previewMacro}>
      <Text style={[styles.previewValue, { color }]}>{value}{unit}</Text>
      <Text style={styles.previewLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modeToggle:     { flexDirection: 'row', marginHorizontal: Spacing[5], marginBottom: Spacing[4], backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, padding: 3 },
  modeBtn:        { flex: 1, paddingVertical: Spacing[2], alignItems: 'center', borderRadius: Radius.lg },
  modeBtnActive:  { backgroundColor: Colors.bgElevated },
  modeBtnText:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textMuted },
  content:        { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  searchInput: {
    backgroundColor:  Colors.bgSurface,
    borderRadius:     Radius.xl,
    borderWidth:      1,
    borderColor:      Colors.border,
    paddingHorizontal:Spacing[4],
    paddingVertical:  Spacing[3],
    color:            Colors.textPrimary,
    fontFamily:       FontFamily.regular,
    fontSize:         FontSize.base,
    marginBottom:     Spacing[3],
  },
  spinner:        { marginVertical: Spacing[4] },
  resultRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  resultRowActive:{ backgroundColor: `${Colors.nutrition}10`, borderRadius: Radius.lg, paddingHorizontal: Spacing[2] },
  resultInfo:     { flex: 1 },
  resultName:     { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textPrimary },
  resultBrand:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  resultKcal:     { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textMuted },
  selectedCard:   { marginTop: Spacing[4] },
  selectedName:   { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: 2 },
  selectedBrand:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing[4] },
  amountInput:    { marginBottom: Spacing[4] },
  previewRow:     { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing[3], backgroundColor: Colors.bgElevated, borderRadius: Radius.lg, marginBottom: Spacing[4] },
  previewMacro:   { alignItems: 'center' },
  previewValue:   { fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  previewLabel:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  logBtn:         {},
  noResults:      { alignItems: 'center', paddingVertical: Spacing[6] },
  noResultsText:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing[2] },
  noResultsLink:  { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.nutrition },
  manualTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: Spacing[4] },
  field:          { marginBottom: Spacing[3] },
  macroRow:       { flexDirection: 'row', gap: Spacing[3] },
  halfField:      { flex: 1 },
});