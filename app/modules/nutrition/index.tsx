// ============================================================
// VYRA FITNESS — Módulo Nutrición: Pantalla Principal
// Resumen diario kcal, barras de macros, 4 tarjetas de comida
// ============================================================

import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Button from '@/components/ui/Button';
import { useNutrition, MEAL_TYPES, type MealType } from '@/hooks/useNutrition';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function NutritionScreen() {
  const {
    mealsByType, hasEaten,
    totals, caloriePct, remaining,
    calorieGoal, macroGoals,
    deleteMeal, isLoading,
  } = useNutrition();

  const proteinPct = Math.min(100, (totals.protein / macroGoals.protein) * 100);
  const carbsPct   = Math.min(100, (totals.carbs   / macroGoals.carbs)   * 100);
  const fatPct     = Math.min(100, (totals.fat     / macroGoals.fat)     * 100);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Nutrición"
        showBack
        color={Colors.nutrition}
        rightAction={
          <Pressable onPress={() => router.push('/modules/nutrition/history' as any)} style={styles.histBtn}>
            <Text style={styles.histText}>Historial</Text>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Calorías del día */}
        <Card style={styles.calorieCard}>
          <View style={styles.calorieRow}>
            <View>
              <Text style={styles.calorieLabel}>Consumidas</Text>
              <AnimatedNumber
                value={Math.round(totals.calories)}
                style={styles.calorieValue}
                duration={600}
              />
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.calorieLabel}>Meta</Text>
              <Text style={[styles.calorieValue, { color: Colors.textSecondary }]}>{calorieGoal}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View>
              <Text style={styles.calorieLabel}>Restantes</Text>
              <Text style={[styles.calorieValue, {
                color: remaining <= 0 ? Colors.error : remaining < 300 ? Colors.fasting : Colors.steps,
              }]}>
                {remaining <= 0 ? '0' : remaining}
              </Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </View>
          <ProgressBar
            value={caloriePct}
            color={caloriePct > 105 ? Colors.error : Colors.nutrition}
            height={8}
            animated
            style={styles.calorieProg}
          />
          {remaining <= 0 && (
            <Text style={styles.overText}>
              {Math.abs(remaining)} kcal sobre la meta de hoy
            </Text>
          )}
        </Card>

        {/* Macros */}
        <Card style={styles.macroCard}>
          <Text style={styles.macroTitle}>Macronutrientes</Text>
          <View style={styles.macroRow}>
            <MacroBar
              label="Proteínas"
              value={Math.round(totals.protein)}
              goal={macroGoals.protein}
              pct={proteinPct}
              unit="g"
              color="#FF6B6B"
            />
            <MacroBar
              label="Carbos"
              value={Math.round(totals.carbs)}
              goal={macroGoals.carbs}
              pct={carbsPct}
              unit="g"
              color={Colors.fasting}
            />
            <MacroBar
              label="Grasas"
              value={Math.round(totals.fat)}
              goal={macroGoals.fat}
              pct={fatPct}
              unit="g"
              color="#FFD43B"
            />
            <MacroBar
              label="Fibra"
              value={Math.round(totals.fiber)}
              goal={25}
              pct={Math.min(100, (totals.fiber / 25) * 100)}
              unit="g"
              color={Colors.steps}
            />
          </View>
        </Card>

        {/* Comidas del día */}
        <Text style={styles.sectionTitle}>Comidas de hoy</Text>
        {(Object.keys(MEAL_TYPES) as MealType[]).map((type) => {
          const config  = MEAL_TYPES[type];
          const meals   = mealsByType[type];
          const total   = meals.reduce((s, m) => s + m.calories, 0);

          return (
            <Card key={type} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealEmoji}>{config.emoji}</Text>
                  <Text style={styles.mealName}>{config.label}</Text>
                  {hasEaten[type] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.mealRight}>
                  {total > 0 && (
                    <Text style={styles.mealKcal}>{Math.round(total)} kcal</Text>
                  )}
                  <Pressable
                    onPress={() => router.push({ pathname: '/modules/nutrition/log', params: { mealType: type } } as any)}
                    style={styles.addBtn}
                  >
                    <Text style={styles.addBtnText}>+ Agregar</Text>
                  </Pressable>
                </View>
              </View>

              {meals.length > 0 && (
                <View style={styles.mealItems}>
                  {meals.map((meal) => (
                    <View key={meal.id} style={styles.mealItem}>
                      <View style={styles.mealItemInfo}>
                        <Text style={styles.mealItemName} numberOfLines={1}>{meal.food_name}</Text>
                        <Text style={styles.mealItemMeta}>
                          {meal.amount_g}g · P: {Math.round(meal.protein_g)}g · C: {Math.round(meal.carbs_g)}g · G: {Math.round(meal.fat_g)}g
                        </Text>
                      </View>
                      <View style={styles.mealItemRight}>
                        <Text style={styles.mealItemKcal}>{Math.round(meal.calories)}</Text>
                        <Text style={styles.mealItemKcalUnit}>kcal</Text>
                        <Pressable onPress={() => deleteMeal(meal.id)} style={styles.deleteBtn}>
                          <Text style={styles.deleteBtnText}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {meals.length === 0 && (
                <Text style={styles.mealEmpty}>Sin registros aún</Text>
              )}
            </Card>
          );
        })}

        {/* Botón historial */}
        <Button
          onPress={() => router.push('/modules/nutrition/history' as any)}
          variant="secondary"
          fullWidth
          size="md"
          style={styles.historyBtn}
        >
          Ver historial semanal 📊
        </Button>
      </ScrollView>
    </SafeScreen>
  );
}

function MacroBar({
  label, value, goal, pct, unit, color,
}: {
  label: string; value: number; goal: number; pct: number; unit: string; color: string;
}) {
  return (
    <View style={styles.macroBar}>
      <Text style={[styles.macroPct, { color }]}>{Math.round(pct)}%</Text>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { height: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>{value}{unit}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroGoal}>/{goal}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content:       { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  histBtn:       { paddingHorizontal: Spacing[2] },
  histText:      { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.nutrition },

  // Calorías
  calorieCard:   { marginBottom: Spacing[4] },
  calorieRow:    { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: Spacing[4] },
  calorieLabel:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginBottom: 2 },
  calorieValue:  { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.nutrition, textAlign: 'center' },
  calorieUnit:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  calorieDivider:{ width: 1, height: 48, backgroundColor: Colors.divider },
  calorieProg:   {},
  overText:      { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.error, marginTop: Spacing[1], textAlign: 'center' },

  // Macros
  macroCard:     { marginBottom: Spacing[5] },
  macroTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[4] },
  macroRow:      { flexDirection: 'row', gap: Spacing[3] },
  macroBar:      { flex: 1, alignItems: 'center', gap: 3 },
  macroPct:      { fontFamily: FontFamily.bold, fontSize: FontSize.xs },
  macroTrack:    { width: '100%', height: 80, backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  macroFill:     { borderRadius: Radius.sm, minHeight: 4 },
  macroValue:    { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textPrimary },
  macroLabel:    { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.textSecondary },
  macroGoal:     { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.textMuted },

  // Comidas
  sectionTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  mealCard:      { marginBottom: Spacing[3] },
  mealHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2] },
  mealTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  mealEmoji:     { fontSize: 20 },
  mealName:      { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  checkmark:     { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.steps, marginLeft: Spacing[1] },
  mealRight:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  mealKcal:      { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textMuted },
  addBtn:        { paddingVertical: Spacing[1], paddingHorizontal: Spacing[2.5], borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.nutrition, backgroundColor: `${Colors.nutrition}12` },
  addBtnText:    { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.nutrition },
  mealItems:     { gap: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: Spacing[2] },
  mealItem:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  mealItemInfo:  { flex: 1 },
  mealItemName:  { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textPrimary },
  mealItemMeta:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  mealItemRight: { alignItems: 'flex-end', gap: 1 },
  mealItemKcal:  { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.nutrition },
  mealItemKcalUnit:{ fontFamily: FontFamily.regular, fontSize: 9, color: Colors.textMuted },
  deleteBtn:     { padding: Spacing[1] },
  deleteBtnText: { fontSize: 12, color: Colors.textMuted },
  mealEmpty:     { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing[2] },
  historyBtn:    { marginTop: Spacing[2] },
});