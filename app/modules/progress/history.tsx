// REDESIGNED: 2026-05-21 - progress history now reads like a clear trend panel
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import SegmentedControl from '@/components/ui/SegmentedControl';
import VyraBalanceTrendChart from '@/components/progress/VyraBalanceTrendChart';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing, TextLeading } from '@/constants/theme';
import { useReadiness, type ScoreHistory } from '@/hooks/useReadiness';

type HistoryRange = '14d' | '30d' | '90d';

const RANGE_OPTIONS = [
  { value: '14d' as const, label: '14d' },
  { value: '30d' as const, label: '30d' },
  { value: '90d' as const, label: '90d' },
];

const RANGE_DAYS: Record<HistoryRange, number> = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
};

function formatShortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
}

function formatChartLabel(value: string, range: HistoryRange) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  if (range === '14d') {
    return date.toLocaleDateString('es-UY', { weekday: 'short' }).replace('.', '');
  }
  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
}

function averageScore(rows: ScoreHistory[]) {
  if (!rows.length) return null;
  const total = rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0);
  return Math.round(total / rows.length);
}

function factorsForRow(row: ScoreHistory | null) {
  if (!row) return [];

  const items = [
    { label: 'Agua', value: Number(row.hydration_pct ?? 0), color: Colors.water },
    { label: 'Sueño', value: Number(row.sleep_pct ?? 0), color: Colors.sleep },
    { label: 'Actividad', value: Number(row.activity_pct ?? 0), color: Colors.steps },
    { label: 'Nutricion', value: Number(row.nutrition_pct ?? 0), color: Colors.nutrition },
    { label: 'Mental', value: Number(row.mental_pct ?? 0), color: Colors.mental },
  ];

  return items.sort((left, right) => right.value - left.value);
}

export default function ProgressHistoryScreen() {
  const [range, setRange] = useState<HistoryRange>('14d');
  const { history, fetchHistory } = useReadiness();

  useEffect(() => {
    void fetchHistory(RANGE_DAYS[range]);
  }, [fetchHistory, range]);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history],
  );
  const visibleHistory = useMemo(() => sortedHistory.slice(-RANGE_DAYS[range]), [range, sortedHistory]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(visibleHistory[visibleHistory.length - 1]?.date ?? null);
  }, [visibleHistory]);

  const selectedRow =
    visibleHistory.find((item) => item.date === selectedDate) ??
    visibleHistory[visibleHistory.length - 1] ??
    null;
  const selectedFactors = factorsForRow(selectedRow);
  const average = averageScore(visibleHistory);
  const best = visibleHistory.length
    ? Math.max(...visibleHistory.map((row) => Number(row.total_score ?? 0)))
    : null;
  const latest = visibleHistory[visibleHistory.length - 1]?.total_score ?? null;
  const chartData = useMemo(
    () =>
      visibleHistory.map((row) => ({
        label: formatChartLabel(row.date, range),
        value: Number(row.total_score ?? 0),
      })),
    [range, visibleHistory],
  );

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Historial de score"
        subtitle="Tendencia limpia para leer el bloque sin ruido"
        showBack
        color={Colors.brand}
        rightAction={
          <Pressable
            onPress={() => router.push(Routes.progress.insights as never)}
            accessibilityRole="button"
            accessibilityLabel="Abrir insights"
            accessibilityHint="Muestra la lectura semanal de progreso."
            hitSlop={8}
          >
            <Text style={styles.headerLink}>Insights</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SegmentedControl
          value={range}
          options={RANGE_OPTIONS}
          onChange={setRange}
          accessibilityLabel="Cambiar ventana del historial"
        />

        <Card variant="hero" accentColor={Colors.brand} decorative elevated style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartHeaderCopy}>
              <Text style={styles.sectionTitle}>Linea reciente</Text>
              <Text style={styles.sectionHint}>Cada punto representa el score total del día.</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Promedio</Text>
                <Text style={styles.summaryValue}>{average !== null ? average : '--'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Mejor</Text>
                <Text style={styles.summaryValue}>{best !== null ? best : '--'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ultimo</Text>
                <Text style={styles.summaryValue}>{latest !== null ? latest : '--'}</Text>
              </View>
            </View>
          </View>

          {chartData.length ? (
            <VyraBalanceTrendChart
              data={chartData}
              average={average}
              best={best}
              caption={range === '14d' ? '14 dias' : range === '30d' ? '30 dias' : '90 dias'}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Aun no hay historial suficiente</Text>
              <Text style={styles.emptyStateBody}>Cuando cierres algunos dias, aqui veras la curva completa del score.</Text>
            </View>
          )}
        </Card>

        <Card style={styles.detailCard}>
          <Text style={styles.sectionTitle}>
            {selectedRow ? `Detalle de ${formatShortDate(selectedRow.date)}` : 'Sin historial'}
          </Text>

          {selectedRow ? (
            <>
              <View style={styles.detailHero}>
                <Text style={styles.detailScore}>{Number(selectedRow.total_score ?? 0)}</Text>
                <Text style={styles.detailCaption}>score total del día</Text>
              </View>

              <View style={styles.factorGrid}>
                {selectedFactors.map((factor) => (
                  <View key={factor.label} style={styles.factorChip}>
                    <View style={[styles.factorDot, { backgroundColor: factor.color }]} />
                    <Text style={styles.factorChipLabel}>{factor.label}</Text>
                    <Text style={[styles.factorChipValue, { color: factor.color }]}>{factor.value}%</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.helperText}>
                Toca cualquier día del gráfico para ver qué factores estuvieron más fuertes o más flojos.
              </Text>
            </>
          ) : (
            <Text style={styles.helperText}>Todavia no hay historial suficiente para esta vista.</Text>
          )}
        </Card>

        {visibleHistory.length ? (
          <Card style={styles.listCard}>
            <Text style={styles.sectionTitle}>Dias del bloque</Text>
            <View style={styles.historyList}>
              {[...visibleHistory].reverse().map((row) => {
                const score = Number(row.total_score ?? 0);
                const isActive = row.date === selectedRow?.date;

                return (
                  <Pressable
                    key={`row-${row.date}`}
                    style={[styles.historyRow, isActive && styles.historyRowActive]}
                    onPress={() => setSelectedDate(row.date)}
                    accessibilityRole="button"
                    accessibilityLabel={`Seleccionar ${formatShortDate(row.date)}`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <View style={styles.historyRowLeft}>
                      <Text style={styles.historyRowDate}>{formatShortDate(row.date)}</Text>
                      <View style={styles.historyTrack}>
                        <View
                          style={[
                            styles.historyFill,
                            {
                              width: `${Math.max(6, Math.min(100, score))}%`,
                              backgroundColor: isActive ? Colors.brand : withOpacity(Colors.brand, 0.5),
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.historyRowScore}>{score}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  headerLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  chartCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  chartHeader: {
    gap: Spacing[3],
  },
  chartHeaderCopy: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  summaryItem: {
    flex: 1,
    gap: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  summaryLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  summaryValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptyState: {
    gap: Spacing[2],
  },
  emptyStateTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptyStateBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  detailCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  detailHero: {
    gap: 4,
  },
  detailScore: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    lineHeight: TextLeading['3xl'],
    color: Colors.textPrimary,
  },
  detailCaption: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  factorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  factorChip: {
    minWidth: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  factorDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  factorChipLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  factorChipValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
  },
  helperText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  listCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  historyList: {
    gap: Spacing[2],
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.05),
    backgroundColor: withOpacity(Colors.white, 0.02),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  historyRowActive: {
    borderColor: withOpacity(Colors.brand, 0.2),
    backgroundColor: withOpacity(Colors.brand, 0.08),
  },
  historyRowLeft: {
    flex: 1,
    gap: Spacing[1.5],
  },
  historyRowDate: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  historyTrack: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  historyFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  historyRowScore: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
});
