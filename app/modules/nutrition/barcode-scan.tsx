import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BarcodeScannerModal from '@/components/ui/BarcodeScannerModal';
import Input from '@/components/ui/Input';
import {
  useNutrition,
  MEAL_TYPES,
  type FoodItem,
  type MealType,
} from '@/hooks/useNutrition';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { triggerNotificationHaptic } from '@/lib/haptics';

export default function BarcodeNutritionScreen() {
  const params = useLocalSearchParams<{ mealType?: string }>();
  const mealType = (params.mealType || 'snack') as MealType;
  const config = MEAL_TYPES[mealType];
  const router = useRouter();

  const { searchByBarcode, logMeal, isLogging } = useNutrition();

  const [showScanner, setShowScanner] = useState(true);
  const [foundFood, setFoundFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState('100');
  const amountGrams = Number.parseFloat(amount) || 100;
  const amountFactor = amountGrams / 100;

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      void triggerNotificationHaptic('success');

      const food = await searchByBarcode(barcode);

      if (food) {
        setFoundFood(food);
        setShowScanner(false);
        return;
      }

      throw new Error(`No encontramos el código ${barcode} en la base de datos actual.`);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('No pudimos procesar el código. Intenta de nuevo.');
    }
  };

  const handleAddFood = () => {
    if (!foundFood) return;

    logMeal({
      meal_type: mealType,
      food_name: foundFood.name,
      food_id: foundFood.id,
      amount_g: amountGrams,
      calories: foundFood.calories_per_100g * amountFactor,
      protein_g: foundFood.protein_g * amountFactor,
      carbs_g: foundFood.carbs_g * amountFactor,
      fat_g: foundFood.fat_g * amountFactor,
      fiber_g: foundFood.fiber_g * amountFactor,
      source: 'barcode',
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
        {foundFood ? (
          <Card style={styles.foodCard}>
            <View style={styles.cardHeader}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{foundFood.name}</Text>
                {foundFood.brand ? (
                  <Text style={styles.foodBrand}>{foundFood.brand}</Text>
                ) : null}
              </View>
              <View style={styles.caloriesBadge}>
                <Text style={styles.caloriesValue}>
                  {Math.round(foundFood.calories_per_100g)}
                </Text>
                <Text style={styles.caloriesLabel}>kcal/100g</Text>
              </View>
            </View>

            <View style={styles.amountSection}>
              <Input
                label="Cantidad"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                unit="g"
                style={styles.amountField}
                inputStyle={styles.amountValue}
              />
            </View>

            <View style={styles.macrosGrid}>
              <MacroIndicator
                label="Kcal"
                value={Math.round(foundFood.calories_per_100g * amountFactor)}
                color={Colors.nutrition}
                wide
              />
              <MacroIndicator
                label="Proteína"
                value={Math.round(foundFood.protein_g * amountFactor)}
                unit="g"
                color={Colors.error}
              />
              <MacroIndicator
                label="Carbos"
                value={Math.round(foundFood.carbs_g * amountFactor)}
                unit="g"
                color={Colors.fasting}
              />
              <MacroIndicator
                label="Grasas"
                value={Math.round(foundFood.fat_g * amountFactor)}
                unit="g"
                color={Colors.warning}
              />
              <MacroIndicator
                label="Fibra"
                value={Math.round(foundFood.fiber_g * amountFactor)}
                unit="g"
                color={Colors.success}
              />
            </View>

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
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}

function MacroIndicator({
  label,
  value,
  unit = '',
  color,
  wide = false,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.macroItem, wide && styles.macroItemWide]}>
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
  amountField: {
    marginBottom: 0,
  },
  amountValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginBottom: Spacing[6],
  },
  macroItem: {
    flexBasis: '47%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
  },
  macroItemWide: {
    flexBasis: '100%',
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
    marginTop: Spacing[1],
  },
});
