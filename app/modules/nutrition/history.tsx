import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import useScreenBanner from '@/hooks/useScreenBanner';
import { useNutrition } from '@/hooks/useNutrition';

export default function NutritionHistoryScreen() {
  const { weeklyData, calorieGoal, macroGoals } = useNutrition();
  useScreenBanner('nutrition_history_banner');

  const maxKcal = Math.max(...weeklyData.map((item) => item.calories), calorieGoal, 1);
  const avgCalories = weeklyData.length
    ? weeklyData.reduce((sum, item) => sum + item.calories, 0) / weeklyData.length
    : 0;
  const avgProtein = weeklyData.length
    ? weeklyData.reduce((sum, item) => sum + item.protein, 0) / weeklyData.length
    : 0;
  const avgCarbs = weeklyData.length
    ? weeklyData.reduce((sum, item) => sum + item.carbs, 0) / weeklyData.length
    : 0;
  const avgFat = weeklyData.length
    ? weeklyData.reduce((sum, item) => sum + item.fat, 0) / weeklyData.length
    : 0;

  const daysOnTarget = weeklyData.filter(
    (item) => item.calories >= calorieGoal * 0.85 && item.calories <= calorieGoal * 1.15,
  ).length;

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <Header title="Historial nutricional" showBack color={Colors.nutrition} />

      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Calorias · ultimos 7 dias</Text>
            {weeklyData.length > 0 ? (
              <View style={styles.bars}>
                {weeklyData.map((item, index) => {
                  const pct = (item.calories / maxKcal) * 100;
                  const onTarget =
                    item.calories >= calorieGoal * 0.85 && item.calories <= calorieGoal * 1.15;
                  const over = item.calories > calorieGoal * 1.15;
                  const dayLabel = new Date(`${item.date}T12:00:00`).toLocaleDateString('es', {
                    weekday: 'short',
                  });
                  const isToday = item.date === new Date().toISOString().split('T')[0];

                  return (
                    <View key={index} style={styles.barCol}>
                      <Text style={styles.barVal}>
                        {item.calories >= 1000
                          ? `${(item.calories / 1000).toFixed(1)}k`
                          : Math.round(item.calories)}
                      </Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[styles.goalLine, { bottom: `${(calorieGoal / maxKcal) * 100}%` }]}
                        />
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${pct}%`,
                              backgroundColor: over
                                ? Colors.error
                                : onTarget
                                  ? Colors.nutrition
                                  : `${Colors.nutrition}55`,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.barDay,
                          isToday && { color: Colors.nutrition, fontFamily: FontFamily.bold },
                        ]}
                      >
                        {isToday ? 'Hoy' : dayLabel}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyChart}>Sin datos suficientes aun.</Text>
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

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statEmoji}>OBJ</Text>
              <Text style={styles.statValue}>{daysOnTarget}/7</Text>
              <Text style={styles.statLabel}>Dias en meta</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statEmoji}>KCAL</Text>
              <Text style={styles.statValue}>{Math.round(avgCalories)}</Text>
              <Text style={styles.statLabel}>Promedio diario</Text>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>Macros promedio diario</Text>
          <Card>
            <MacroRow
              label="Proteinas"
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
      </View>
    </SafeScreen>
  );
}

function MacroRow({
  label,
  avg,
  goal,
  color,
}: {
  label: string;
  avg: number;
  goal: number;
  color: string;
}) {
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
  screen: { flex: 1 },
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: 148,
  },
  chartCard: {
    marginBottom: Spacing[4],
  },
  chartTitle: {
    marginBottom: Spacing[3],
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[1.5],
    height: 120,
    marginBottom: Spacing[3],
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  barVal: {
    fontFamily: FontFamily.regular,
    fontSize: 8,
    color: Colors.textMuted,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    height: 1.5,
    backgroundColor: Colors.nutrition,
    opacity: 0.5,
  },
  barFill: {
    minHeight: 4,
    borderRadius: Radius.sm,
  },
  barDay: {
    fontFamily: FontFamily.medium,
    fontSize: 8,
    color: Colors.textMuted,
  },
  emptyChart: {
    paddingVertical: Spacing[4],
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[4],
  },
  statEmoji: {
    marginBottom: Spacing[1],
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  statLabel: {
    marginTop: 2,
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sectionTitle: {
    marginBottom: Spacing[3],
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  macroLabel: {
    width: 100,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  macroBarWrap: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: Colors.bgElevated,
  },
  macroBarFill: {
    minWidth: 4,
    height: '100%',
    borderRadius: 4,
  },
  macroValue: {
    width: 40,
    textAlign: 'right',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  macroGoal: {
    width: 40,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
