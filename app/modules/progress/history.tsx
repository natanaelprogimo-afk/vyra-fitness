import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useReadiness, type ScoreHistory } from '@/hooks/useReadiness';

function formatShortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
}

function factorsForRow(row: ScoreHistory | null) {
  if (!row) return [];

  const items = [
    { label: 'Agua', value: Number(row.hydration_pct ?? 0) },
    { label: 'Sueno', value: Number(row.sleep_pct ?? 0) },
    { label: 'Actividad', value: Number(row.activity_pct ?? 0) },
    { label: 'Nutricion', value: Number(row.nutrition_pct ?? 0) },
    { label: 'Mental', value: Number(row.mental_pct ?? 0) },
  ];

  return items.sort((left, right) => right.value - left.value);
}

export default function ProgressHistoryScreen() {
  const { history } = useReadiness();
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history],
  );
  const visibleHistory = sortedHistory.slice(-14);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    visibleHistory[visibleHistory.length - 1]?.date ?? null,
  );

  const selectedRow =
    visibleHistory.find((item) => item.date === selectedDate) ??
    visibleHistory[visibleHistory.length - 1] ??
    null;
  const selectedFactors = factorsForRow(selectedRow);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Historial de recuperacion"
        subtitle="Los ultimos 14 dias por defecto"
        showBack
        color={Colors.brand}
        rightElement={
          <Pressable onPress={() => router.push(Routes.progress.insights as never)}>
            <Text style={styles.headerLink}>Informe</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Linea reciente</Text>
          <View style={styles.chartWrap}>
            {visibleHistory.map((row) => {
              const score = Number(row.total_score ?? 0);
              const active = row.date === selectedRow?.date;

              return (
                <Pressable key={row.date} onPress={() => setSelectedDate(row.date)} style={styles.dayColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(6, Math.min(100, score))}%`,
                          backgroundColor: active ? Colors.brand : withOpacity(Colors.brand, 0.45),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barValue, active && styles.barValueActive]}>{score}</Text>
                  <Text style={styles.barLabel}>{formatShortDate(row.date)}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.detailCard}>
          <Text style={styles.sectionTitle}>
            {selectedRow ? `Detalle de ${formatShortDate(selectedRow.date)}` : 'Sin historial'}
          </Text>

          {selectedRow ? (
            <>
              <Text style={styles.detailScore}>{Number(selectedRow.total_score ?? 0)}</Text>
              <View style={styles.factorList}>
                {selectedFactors.slice(0, 2).map((factor) => (
                  <View key={factor.label} style={styles.factorRow}>
                    <Text style={styles.factorLabel}>{factor.label}</Text>
                    <Text style={styles.factorValue}>{factor.value}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.helperText}>
                Toca cualquier dia del grafico para ver que factores estuvieron mas fuertes o mas flojos.
              </Text>
            </>
          ) : (
            <Text style={styles.helperText}>Aun no hay historial suficiente para esta vista.</Text>
          )}
        </Card>

        {sortedHistory.length > 14 ? (
          <Card style={styles.listCard}>
            <Text style={styles.sectionTitle}>Mas atras</Text>
            <View style={styles.historyList}>
              {[...sortedHistory].reverse().slice(14, 24).map((row) => (
                <View key={`row-${row.date}`} style={styles.historyRow}>
                  <Text style={styles.historyRowDate}>{formatShortDate(row.date)}</Text>
                  <Text style={styles.historyRowScore}>{Number(row.total_score ?? 0)}</Text>
                </View>
              ))}
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
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: '100%',
    height: 110,
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.white, 0.06),
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.lg,
  },
  barValue: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  barValueActive: {
    color: Colors.textPrimary,
  },
  barLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  detailCard: {
    gap: Spacing[3],
  },
  detailScore: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  factorList: {
    gap: Spacing[2],
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[1],
  },
  factorLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  factorValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  helperText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  listCard: {
    gap: Spacing[3],
  },
  historyList: {
    gap: Spacing[2],
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyRowDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  historyRowScore: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
});
