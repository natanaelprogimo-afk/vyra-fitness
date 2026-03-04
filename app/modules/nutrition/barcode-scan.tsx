// ============================================================
// VYRA FITNESS — Nutrición: Escaneo de código de barras
// Integración con BarcodeScannerModal y useBarcodeScan
// ============================================================

import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BarcodeScannerModal from '@/components/ui/BarcodeScannerModal';
import { useNutrition, MEAL_TYPES, type MealType } from '@/hooks/useNutrition';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function BarcodeNutritionScreen() {
  const params = useLocalSearchParams<{ mealType?: string }>();
  const mealType = (params.mealType || 'snack') as MealType;
  const config = MEAL_TYPES[mealType];
  const router = useRouter();

  const { searchFoods, logMeal, isLogging } = useNutrition();

  const [showScanner, setShowScanner] = useState(true);
  const [foundFood, setFoundFood] = useState<any | null>(null);
  const [amount, setAmount] = useState('100');

  // Callback cuando se escanea un código
  const handleBarcodeScanned = async (barcode: string, type: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Buscar el código en Open Food Facts
      const foods = await searchFoods(barcode);
      
      if (foods && foods.length > 0) {
        setFoundFood(foods[0]);
        setShowScanner(false);
      } else {
        Alert.alert(
          'Producto no encontrado',
          `El código ${barcode} no se encontró en nuestra base de datos.`,
          [
            { text: 'Reintentar', onPress: () => setShowScanner(true) },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No pudimos procesar el código. Intenta de nuevo.',
        [{ text: 'Reintentar', onPress: () => setShowScanner(true) }]
      );
    }
  };

  // Agregar el alimento al log
  const handleAddFood = () => {
    if (!foundFood) return;

    const grams = parseFloat(amount) || 100;
    const factor = grams / 100;

    logMeal({
      meal_type: mealType,
      food_name: foundFood.name,
      food_id: foundFood.id,
      amount_g: grams,
      calories: foundFood.calories_per_100g * factor,
      protein_g: foundFood.protein_g * factor,
      carbs_g: foundFood.carbs_g * factor,
      fat_g: foundFood.fat_g * factor,
      fiber_g: foundFood.fiber_g * factor,
    });

    router.back();
  };

  if (showScanner) {
    return (
      <BarcodeScannerModal
        onBarcodeScanned={handleBarcodeScanned}
        onClose={() => router.back()}
        title="Escanear alimento"
        subtitle="Apuntá a un código de barras"
      />
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title={`Agregar a ${config.label}`}
        showBack
        color={Colors.nutrition}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {foundFood && (
          <Card style={styles.foodCard}>
            <View style={styles.cardHeader}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{foundFood.name}</Text>
                {foundFood.brand && (
                  <Text style={styles.foodBrand}>{foundFood.brand}</Text>
                )}
              </View>
              <View style={styles.caloriesBadge}>
                <Text style={styles.caloriesValue}>
                  {Math.round(foundFood.calories_per_100g)}
                </Text>
                <Text style={styles.caloriesLabel}>kcal/100g</Text>
              </View>
            </View>

            {/* Cantidad */}
            <View style={styles.amountSection}>
              <Text style={styles.label}>Cantidad</Text>
              <View style={styles.amountInput}>
                <Text style={styles.amountValue}>{amount}</Text>
                <Text style={styles.amountUnit}>g</Text>
              </View>
            </View>

            {/* Macros por cantidad */}
            <View style={styles.macrosGrid}>
              <MacroIndicator
                label="Kcal"
                value={Math.round(foundFood.calories_per_100g * (parseFloat(amount) / 100))}
                color={Colors.nutrition}
              />
              <MacroIndicator
                label="Proteína"
                value={Math.round(foundFood.protein_g * (parseFloat(amount) / 100))}
                unit="g"
                color="#FF6B6B"
              />
              <MacroIndicator
                label="Carbos"
                value={Math.round(foundFood.carbs_g * (parseFloat(amount) / 100))}
                unit="g"
                color={Colors.fasting}
              />
              <MacroIndicator
                label="Grasas"
                value={Math.round(foundFood.fat_g * (parseFloat(amount) / 100))}
                unit="g"
                color="#FFD43B"
              />
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              <Button
                onPress={handleAddFood}
                variant="primary"
                fullWidth
                loading={isLogging}
                style={styles.confirmBtn}
              >
                Agregar a {config.label}
              </Button>
              <Button
                onPress={() => {
                  setShowScanner(true);
                  setFoundFood(null);
                  setAmount('100');
                }}
                variant="ghost"
                fullWidth
              >
                Escanear otro
              </Button>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function MacroIndicator({
  label,
  value,
  unit = '',
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
}) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, { color }]}>
        {value}
        {unit}
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
  },
  foodCard: {
    marginTop: Spacing[6],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[6],
  },
  foodInfo: {
    flex: 1,
    marginRight: Spacing[4],
  },
  foodName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  foodBrand: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  caloriesBadge: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    alignItems: 'center',
  },
  caloriesValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.nutrition,
  },
  caloriesLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  amountSection: {
    marginBottom: Spacing[6],
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing[2],
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  amountValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  amountUnit: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    marginLeft: Spacing[2],
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    marginBottom: Spacing[6],
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    marginBottom: Spacing[1],
  },
  macroLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  actions: {
    gap: Spacing[3],
  },
  confirmBtn: {
    marginBottom: Spacing[2],
  },
});
