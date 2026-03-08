import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BarcodeScannerModal from '@/components/ui/BarcodeScannerModal';
import { useNutrition, MEAL_TYPES, type MealType } from '@/hooks/useNutrition';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export default function BarcodeNutritionScreen() {
  const params = useLocalSearchParams<{ mealType?: string }>();
  const mealType = (params.mealType || 'snack') as MealType;
  const config = MEAL_TYPES[mealType];
  const router = useRouter();

  const { searchByBarcode, logMeal, isLogging } = useNutrition();

  const [showScanner, setShowScanner] = useState(true);
  const [foundFood, setFoundFood] = useState<any | null>(null);
  const [amount, setAmount] = useState('100');

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const food = await searchByBarcode(barcode);

      if (food) {
        setFoundFood(food);
        setShowScanner(false);
        return;
      }

      Alert.alert(
        'Producto no encontrado',
        `El código ${barcode} no se encontró en nuestra base de datos.`,
        [
          { text: 'Reintentar', onPress: () => setShowScanner(true) },
          { text: 'Cancelar', style: 'cancel' },
        ],
      );
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'No pudimos procesar el código. Intenta de nuevo.';

      Alert.alert(
        message.toLowerCase().includes('limite') || message.toLowerCase().includes('límite')
          ? 'Límite alcanzado'
          : 'Error',
        message,
        [{ text: 'Reintentar', onPress: () => setShowScanner(true) }],
      );
    }
  };

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
        {foundFood && (
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
              <Text style={styles.label}>Cantidad</Text>
              <View style={styles.amountInput}>
                <Text style={styles.amountValue}>{amount}</Text>
                <Text style={styles.amountUnit}>g</Text>
              </View>
            </View>

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
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgSurface,
  },
  amountValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  amountUnit: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
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
