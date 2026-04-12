import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { formatNumber } from '@/utils/formatters';

function getLast7Days() {
  const days: Array<{ key: string; label: string }> = [];
  const labels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().split('T')[0] ?? '';
    days.push({ key, label: labels[date.getDay()] ?? 'D' });
  }
  return days;
}

function HorizontalBars({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <View style={styles.barGroup}>
      {data.map((item) => (
        <View key={item.label} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(item.value / max) * 100}%` }]} />
          </View>
          <Text style={styles.barValue}>{formatNumber(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}

export default function WorkoutCaloriesScreen() {
  const { history } = useWorkout();

  const weekly = useMemo(() => {
    const limit = Date.now() - 7 * 86400000;
    return history.filter((entry) => new Date(entry.started_at).getTime() >= limit);
  }, [history]);

  const monthly = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return history.filter((entry) => entry.started_at.startsWith(monthKey));
  }, [history]);

  const weeklyCalories = weekly.reduce((sum, entry) => sum + Number(entry.estimated_calories ?? 0), 0);
  const monthlyCalories = monthly.reduce((sum, entry) => sum + Number(entry.estimated_calories ?? 0), 0);
  const avgPerSession = weekly.length ? Math.round(weeklyCalories / weekly.length) : 0;
  const topSessionCalories = Math.max(0, ...monthly.map((entry) => Number(entry.estimated_calories ?? 0)));

  const series = useMemo(() => {
    const days = getLast7Days();
    return days.map((day) => {
      const total = history
        .filter((entry) => entry.started_at.startsWith(day.key))
        .reduce((sum, entry) => sum + Number(entry.estimated_calories ?? 0), 0);
      return { label: day.label, value: total };
    });
  }, [history]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title="Calorías" color={Colors.workout} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} decorative style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Gasto del bloque</Text>
          <Text style={styles.heroTitle}>Las calorías ahora viven dentro del módulo, no como un apéndice suelto.</Text>
          <Text style={styles.heroBody}>Acá ves el ritmo semanal, el promedio por sesión y el máximo reciente con una lectura mucho más clara.</Text>
        </Card>

        <View style={styles.grid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Kcal semana</Text>
            <Text style={styles.metricValue}>{formatNumber(weeklyCalories)}</Text>
            <Text style={styles.metricHint}>{weekly.length} sesiones</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Promedio sesión</Text>
            <Text style={styles.metricValue}>{formatNumber(avgPerSession)}</Text>
            <Text style={styles.metricHint}>kcal/sesión</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Kcal mes</Text>
            <Text style={styles.metricValue}>{formatNumber(monthlyCalories)}</Text>
            <Text style={styles.metricHint}>últimos 30 días</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Sesión top</Text>
            <Text style={styles.metricValue}>{formatNumber(topSessionCalories)}</Text>
            <Text style={styles.metricHint}>máximo del mes</Text>
          </Card>
        </View>

        <Card accentColor={Colors.workout} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Gasto de 7 días</Text>
          <Text style={styles.sectionBody}>Lectura rápida del gasto por día en la última semana.</Text>
          <HorizontalBars data={series} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Comparativa</Text>
          <Text style={styles.sectionBody}>Cuando conectemos nutrición, esta vista va a cruzar calorías quemadas con consumo real.</Text>
          <View style={styles.compareRow}>
            <View style={styles.comparePill}>
              <Text style={styles.compareLabel}>Quemadas</Text>
              <Text style={styles.compareValue}>{formatNumber(weeklyCalories)} kcal</Text>
            </View>
            <View style={styles.comparePill}>
              <Text style={styles.compareLabel}>Consumidas</Text>
              <Text style={styles.compareValue}>0 kcal</Text>
            </View>
            <View style={styles.comparePill}>
              <Text style={styles.compareLabel}>Balance</Text>
              <Text style={styles.compareValue}>0 kcal</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[3],
  },
  heroCard: {
    gap: Spacing[2],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.workout,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metricCard: {
    width: '48%',
    gap: Spacing[1],
    minHeight: 78,
    backgroundColor: Colors.surface2,
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  metricValue: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  metricHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sectionCard: {
    gap: Spacing[3],
    backgroundColor: Colors.surface2,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  barGroup: {
    gap: Spacing[2],
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  barLabel: {
    width: 18,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
  },
  barValue: {
    width: 52,
    textAlign: 'right',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  compareRow: {
    gap: Spacing[2],
  },
  comparePill: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compareLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  compareValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
});
