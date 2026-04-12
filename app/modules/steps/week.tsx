import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SafeScreen from '@/components/ui/SafeScreen';
import StepsTabs from '@/components/steps/StepsTabs';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSteps } from '@/hooks/useSteps';
import { useStepsRoutes } from '@/hooks/useStepsRoutes';
import { useSettingsStore } from '@/stores/settingsStore';

const SCREEN_BG = '#171a0f';
const CARD_BG = '#1d2114';
const TILE_BG = '#232818';
const BORDER = 'rgba(249, 142, 45, 0.14)';

function formatDistance(valueKm: number, unit: 'km' | 'mi') {
  const converted = unit === 'mi' ? valueKm * 0.621371 : valueKm;
  return `${converted.toFixed(1)}km`;
}

export default function StepsWeekScreen() {
  const { weeklyAvg, weeklyData, goal } = useSteps();
  const { storedRoutes } = useStepsRoutes();
  const distUnit = useSettingsStore((state) => state.distUnit);

  const previousWeek = weeklyData.slice(7, 14);
  const previousAvg = previousWeek.length ? Math.round(previousWeek.reduce((sum, item) => sum + item.steps, 0) / previousWeek.length) : weeklyAvg;
  const delta = previousAvg > 0 ? Math.round(((weeklyAvg - previousAvg) / previousAvg) * 100) : 0;

  const distribution = useMemo(() => {
    const low = weeklyData.filter((item) => item.steps < 4000).length;
    const medium = weeklyData.filter((item) => item.steps >= 4000 && item.steps < goal).length;
    const high = weeklyData.filter((item) => item.steps >= goal).length;
    return { low, medium, high };
  }, [goal, weeklyData]);

  const topRoutes = storedRoutes.slice(0, 2);
  const insight = distribution.low >= 3
    ? 'Los días suaves todavía pesan demasiado. Una caminata corta el lunes te cambia la semana.'
    : delta >= 0
      ? 'Venís arriba de la semana anterior. Repetir tu ruta más larga una vez más te deja mejor parado.'
      : 'La semana bajó un poco. Recuperala con una salida breve antes de que cierre el día.';

  return (
    <SafeScreen backgroundColor={SCREEN_BG} disableAtmosphere padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Semana</Text>
            <Text style={styles.subtitle}>Distribución y rutas</Text>
          </View>
          <Text style={styles.headerLink}>resumen</Text>
        </View>

        <StepsTabs active="week" />

        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{weeklyAvg.toLocaleString('es-UY')}</Text>
          <Text style={styles.scoreLabel}>promedio diario</Text>
          <Text style={[styles.scoreMeta, { color: delta >= 0 ? '#a6d97a' : '#ffb56a' }]}>{delta >= 0 ? '+' : ''}{delta}% vs semana anterior</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Actividad por zona</Text>
          <View style={styles.distributionBar}>
            <View style={[styles.distributionFill, { flex: Math.max(distribution.low, 1), backgroundColor: '#6c7b47' }]} />
            <View style={[styles.distributionFill, { flex: Math.max(distribution.medium, 1), backgroundColor: '#f59e42' }]} />
            <View style={[styles.distributionFill, { flex: Math.max(distribution.high, 1), backgroundColor: '#a6d97a' }]} />
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendText}>Ligero {distribution.low}d</Text>
            <Text style={[styles.legendText, { color: '#f59e42' }]}>Activo {distribution.medium}d</Text>
            <Text style={[styles.legendText, { color: '#a6d97a' }]}>Meta {distribution.high}d</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Rutas más usadas</Text>
          {topRoutes.length ? (
            topRoutes.map((route, index) => (
              <View key={route.id} style={styles.routeRow}>
                <Text style={styles.routeName}>Ruta {index + 1}</Text>
                <Text style={styles.routeDistance}>{formatDistance(route.distanceKm, distUnit)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Todavía no hay recorridos suficientes para destacar una ruta.</Text>
          )}
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#959d78',
  },
  headerLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#ffd19b',
    marginTop: 8,
  },
  scoreCard: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: Spacing[6],
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: FontFamily.bold,
    fontSize: 44,
    color: '#f59e42',
  },
  scoreLabel: {
    marginTop: 4,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#c5cdad',
  },
  scoreMeta: {
    marginTop: 2,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: Spacing[4],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: '#959d78',
    marginBottom: Spacing[3],
  },
  distributionBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: '#2b2f1d',
    marginBottom: Spacing[3],
  },
  distributionFill: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  legendText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#c5cdad',
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  routeName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  routeDistance: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#ffd19b',
  },
  emptyText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#959d78',
    lineHeight: 18,
  },
  insightCard: {
    backgroundColor: '#263218',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(151, 216, 112, 0.18)',
    padding: Spacing[4],
  },
  insightText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#b5d98d',
    lineHeight: 18,
  },
});
