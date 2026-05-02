import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import StepsTabs from '@/components/steps/StepsTabs';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import NoticeCard from '@/components/ui/NoticeCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSteps } from '@/hooks/useSteps';
import { useStepsRoutes } from '@/hooks/useStepsRoutes';
import { useSettingsStore } from '@/stores/settingsStore';

function formatDistance(valueKm: number, unit: 'km' | 'mi') {
  const converted = unit === 'mi' ? valueKm * 0.621371 : valueKm;
  return `${converted.toFixed(1)} ${unit}`;
}

export default function StepsWeekScreen() {
  const { weeklyAvg, weeklyData, goal } = useSteps();
  const { storedRoutes } = useStepsRoutes();
  const distUnit = useSettingsStore((state) => state.distUnit);

  const previousWeek = weeklyData.slice(7, 14);
  const previousAvg = previousWeek.length
    ? Math.round(previousWeek.reduce((sum, item) => sum + item.steps, 0) / previousWeek.length)
    : weeklyAvg;
  const delta = previousAvg > 0 ? Math.round(((weeklyAvg - previousAvg) / previousAvg) * 100) : 0;

  const distribution = useMemo(() => {
    const low = weeklyData.filter((item) => item.steps < 4000).length;
    const medium = weeklyData.filter((item) => item.steps >= 4000 && item.steps < goal).length;
    const high = weeklyData.filter((item) => item.steps >= goal).length;
    return { low, medium, high };
  }, [goal, weeklyData]);

  const topRoutes = storedRoutes.slice(0, 2);
  const insight =
    distribution.low >= 3
      ? 'Los días suaves todavía pesan demasiado. Una caminata corta al inicio de la semana te cambia el ritmo.'
      : delta >= 0
        ? 'Vienes arriba de la semana anterior. Repetir tu ruta más larga una vez más puede cerrar mejor el bloque.'
        : 'La semana bajó un poco. Recuperarla con una salida breve hoy vale más que esperar al próximo lunes.';

  return (
    <ModuleScaffold
      title="Semana de pasos"
      subtitle="Distribución, rutas y lectura útil"
      color={Colors.steps}
      tabs={<StepsTabs active="week" />}
    >
      <View style={styles.metricGrid}>
        <MetricCard
          value={weeklyAvg.toLocaleString('es-UY')}
          label="Promedio diario"
          note={`${delta >= 0 ? '+' : ''}${delta}% vs semana anterior`}
          accentColor={Colors.steps}
        />
        <MetricCard
          value={`${distribution.high}d`}
          label="Días en meta"
          note={`${distribution.medium} activos · ${distribution.low} suaves`}
          accentColor={Colors.success}
        />
      </View>

      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Distribución"
          title="Actividad por zona"
          subtitle="Una sola barra evita micrográficas separadas para bajo, medio y alto."
        />
        <View style={styles.distributionBar}>
          <View style={[styles.distributionFill, { flex: Math.max(distribution.low, 1), backgroundColor: withOpacity(Colors.textMuted, 0.7) }]} />
          <View style={[styles.distributionFill, { flex: Math.max(distribution.medium, 1), backgroundColor: Colors.warning }]} />
          <View style={[styles.distributionFill, { flex: Math.max(distribution.high, 1), backgroundColor: Colors.steps }]} />
        </View>
        <View style={styles.legendRow}>
          <Text style={styles.legendText}>Suave {distribution.low}d</Text>
          <Text style={[styles.legendText, { color: Colors.warning }]}>Activo {distribution.medium}d</Text>
          <Text style={[styles.legendText, { color: Colors.steps }]}>Meta {distribution.high}d</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Rutas"
          title="Recorridos más usados"
          subtitle="La distancia ahora respeta tu unidad real en vez de forzar km siempre."
        />

        {topRoutes.length ? (
          <View style={styles.routeStack}>
            {topRoutes.map((route, index) => (
              <View key={route.id} style={styles.routeRow}>
                <Text style={styles.routeName}>Ruta {index + 1}</Text>
                <Text style={styles.routeDistance}>{formatDistance(route.distanceKm, distUnit)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <NoticeCard
            title="Todavía faltan recorridos"
            body="Cuando guardes más salidas, aquí vas a ver qué ruta sostienes mejor y cuál te conviene repetir."
            tone="info"
          />
        )}
      </Card>

      <NoticeCard title="Lectura semanal" body={insight} tone="success" />
    </ModuleScaffold>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  card: {
    gap: Spacing[4],
  },
  distributionBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
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
    color: Colors.textSecondary,
  },
  routeStack: {
    gap: Spacing[2],
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  routeName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  routeDistance: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.steps,
  },
});
