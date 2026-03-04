// ============================================================
// VYRA FITNESS — Nutrición: Historial semanal
// Barchart calorías 7 días, promedios de macros
// ============================================================

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { useNutrition } from '@/hooks/useNutrition';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function NutritionHistoryScreen() {
  const { weeklyData, calorieGoal, macroGoals } = useNutrition();

  const maxKcal = Math.max(...weeklyData.map(d => d.calories), calorieGoal);

  const avgCalories = weeklyData.length
    ? weeklyData.reduce((s, d) => s + d.calories, 0) / weeklyData.length : 0;
  const avgProtein = weeklyData.length
    ? weeklyData.reduce((s, d) => s + d.protein, 0) / weeklyData.length : 0;
  const avgCarbs = weeklyData.length
    ? weeklyData.reduce((s, d) => s + d.carbs, 0) / weeklyData.length : 0;
  const avgFat = weeklyData.length
    ? weeklyData.reduce((s, d) => s + d.fat, 0) / weeklyData.length : 0;

  const daysOnTarget = weeklyData.filter(
    d => d.calories >= calorieGoal * 0.85 && d.calories <= calorieGoal * 1.15
  ).length;

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Historial nutricional" showBack color={Colors.nutrition} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Barchart kcal */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Calorías — últimos 7 días</Text>
          {weeklyData.length > 0 ? (
            <View style={styles.bars}>
              {weeklyData.map((d, i) => {
                const pct      = (d.calories / maxKcal) * 100;
                const onTarget = d.calories >= calorieGoal * 0.85 && d.calories <= calorieGoal * 1.15;
                const over     = d.calories > calorieGoal * 1.15;
                const dayLabel = new Date(d.date + 'T12:00:00')
                  .toLocaleDateString('es', { weekday: 'short' });
                const isToday  = d.date === new Date().toISOString().split('T')[0];

                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={styles.barVal}>
                      {d.calories >= 1000
                        ? `${(d.calories / 1000).toFixed(1)}k`
                        : Math.round(d.calories)}
                    </Text>
                    <View style={styles.barTrack}>
                      {/* Línea de meta */}
                      <View style={[styles.goalLine, { bottom: `${(calorieGoal / maxKcal) * 100}%` as any }]} />
                      <View style={[styles.barFill, {
                        height: `${pct}%`,
                        backgroundColor: over
                          ? Colors.error
                          : onTarget ? Colors.nutrition : `${Colors.nutrition}55`,
                      }]} />
                    </View>
                    <Text style={[styles.barDay,
                      isToday && { color: Colors.nutrition, fontFamily: FontFamily.bold }
                    ]}>
                      {isToday ? 'Hoy' : dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyChart}>Sin datos suficientes aún.</Text>
          )}

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.nutrition }]} />
              <Text style={styles.legendText}>En meta ±15%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
              <Text style={styles.legendText}>Sobre meta</Text>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{daysOnTarget}/7</Text>
            <Text style={styles.statLabel}>Días en meta</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{Math.round(avgCalories)}</Text>
            <Text style={styles.statLabel}>Kcal promedio</Text>
          </Card>
        </View>

        {/* Macros promedio */}
        <Text style={styles.sectionTitle}>Macros promedio diario</Text>
        <Card>
          <MacroRow
            label="Proteínas"
            avg={Math.round(avgProtein)}
            goal={macroGoals.protein}
            color="#FF6B6B"
          />
          <MacroRow
            label="Carbohidratos"
            avg={Math.round(avgCarbs)}
            goal={macroGoals.carbs}
            color={Colors.fasting}
          />
          <MacroRow
            label="Grasas"
            avg={Math.round(avgFat)}
            goal={macroGoals.fat}
            color="#FFD43B"
          />
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

function MacroRow({ label, avg, goal, color }: { label: string; avg: number; goal: number; color: string }) {
  const pct = Math.min(100, (avg / goal) * 100);
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroBarWrap}>
        <View style={[styles.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.macroValue, { color }]}>{avg}g</Text>
      <Text style={styles.macroGoal}>/{goal}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content:      { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  chartCard:    { marginBottom: Spacing[4] },
  chartTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[3] },
  bars:         { flexDirection: 'row', gap: Spacing[1.5], height: 120, alignItems: 'flex-end', marginBottom: Spacing[3] },
  barCol:       { flex: 1, alignItems: 'center', gap: 3 },
  barVal:       { fontSize: 8, fontFamily: FontFamily.regular, color: Colors.textMuted },
  barTrack:     { width: '100%', flex: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, overflow: 'hidden', position: 'relative', justifyContent: 'flex-end' },
  goalLine:     { position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: Colors.nutrition, opacity: 0.5, zIndex: 1 },
  barFill:      { borderRadius: Radius.sm, minHeight: 4 },
  barDay:       { fontSize: 8, fontFamily: FontFamily.medium, color: Colors.textMuted },
  emptyChart:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing[4] },
  legend:       { flexDirection: 'row', gap: Spacing[4] },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  legendDot:    { width: 8, height: 8, borderRadius: 4 },
  legendText:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  statsRow:     { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[5] },
  statCard:     { flex: 1, alignItems: 'center', paddingVertical: Spacing[4] },
  statEmoji:    { fontSize: 22, marginBottom: Spacing[1] },
  statValue:    { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.textPrimary },
  statLabel:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  macroRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingVertical: Spacing[2.5], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  macroLabel:   { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary, width: 100 },
  macroBarWrap: { flex: 1, height: 8, backgroundColor: Colors.bgElevated, borderRadius: 4, overflow: 'hidden' },
  macroBarFill: { height: '100%', borderRadius: 4, minWidth: 4 },
  macroValue:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm, width: 40, textAlign: 'right' },
  macroGoal:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, width: 40 },
});