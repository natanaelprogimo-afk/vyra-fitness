// ============================================================
// VYRA FITNESS — Módulo Mental: Historial
// Gráfico de línea 30 días con 4 métricas, lista de entradas
// ============================================================

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { useMental, getMentalScoreInfo } from '@/hooks/useMental';
import { calculateMentalScore } from '@/utils/calculations';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

type MetricKey = 'score' | 'mood' | 'energy' | 'stress' | 'motivation';

const METRICS: { key: MetricKey; label: string; color: string; max: number }[] = [
  { key: 'score',      label: 'Score',      color: Colors.mental,  max: 100 },
  { key: 'mood',       label: 'Humor',      color: '#F472B6',      max: 5   },
  { key: 'energy',     label: 'Energía',    color: Colors.fasting, max: 10  },
  { key: 'stress',     label: 'Estrés',     color: Colors.error,   max: 10  },
  { key: 'motivation', label: 'Motivación', color: Colors.steps,   max: 10  },
];

export default function MentalHistoryScreen() {
  const { history, dailyScores } = useMental();
  const [activeMetric, setActiveMetric] = useState<MetricKey>('score');

  const metric   = METRICS.find(m => m.key === activeMetric)!;
  const last14   = dailyScores.slice(-14);
  const maxVal   = metric.max;
  const chartH   = 100;

  // Construir puntos SVG-like con percentages
  const points = last14.map((d, i) => {
    const val  = d[activeMetric as keyof typeof d] as number;
    const xPct = (i / Math.max(last14.length - 1, 1)) * 100;
    const yPct = 100 - (val / maxVal) * 100;
    return { x: xPct, y: yPct, val, date: d.date };
  });

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Historial mental" showBack color={Colors.mental} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Selector de métrica */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricScroll}
          contentContainerStyle={styles.metricRow}>
          {METRICS.map(m => (
            <Pressable
              key={m.key}
              onPress={() => setActiveMetric(m.key)}
              style={[styles.metricChip, activeMetric === m.key && { backgroundColor: `${m.color}20`, borderColor: m.color }]}
            >
              <Text style={[styles.metricChipText, activeMetric === m.key && { color: m.color }]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Mini barchart 14 días */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>{metric.label} — últimos 14 días</Text>
          {last14.length > 0 ? (
            <View style={styles.barsRow}>
              {last14.map((d, i) => {
                const val     = d[activeMetric as keyof typeof d] as number;
                const pct     = (val / maxVal) * 100;
                const dayLabel = new Date(d.date + 'T12:00:00')
                  .toLocaleDateString('es', { weekday: 'short' });
                const isToday  = d.date === new Date().toISOString().split('T')[0];

                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={styles.barVal}>{activeMetric === 'score' ? val : val}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, {
                        height:          `${pct}%`,
                        backgroundColor: metric.color,
                        opacity:         isToday ? 1 : 0.6,
                      }]} />
                    </View>
                    <Text style={[styles.barDay, isToday && { color: metric.color, fontFamily: FontFamily.bold }]}>
                      {isToday ? 'Hoy' : dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyChart}>Sin datos suficientes aún.</Text>
          )}
        </Card>

        {/* Lista de entradas */}
        <Text style={styles.sectionTitle}>Entradas recientes</Text>
        {history.slice().reverse().slice(0, 20).map((entry) => {
          const score     = calculateMentalScore(entry.mood, entry.energy, entry.stress, entry.motivation);
          const scoreInfo = getMentalScoreInfo(score);
          const dateLabel = new Date(entry.check_date + 'T12:00:00')
            .toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' });

          return (
            <Card key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{dateLabel}</Text>
                <View style={[styles.entryBadge, { backgroundColor: `${scoreInfo.color}20` }]}>
                  <Text style={[styles.entryScore, { color: scoreInfo.color }]}>
                    {scoreInfo.emoji} {score}
                  </Text>
                </View>
              </View>
              <View style={styles.entryMetrics}>
                <EntryMetric label="😊" value={`${entry.mood}/5`} />
                <EntryMetric label="⚡" value={`${entry.energy}/10`} />
                <EntryMetric label="😤" value={`${entry.stress}/10`} />
                <EntryMetric label="🔥" value={`${entry.motivation}/10`} />
              </View>
              {entry.notes && (
                <Text style={styles.entryNotes} numberOfLines={2}>"{entry.notes}"</Text>
              )}
            </Card>
          );
        })}

        {history.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧠</Text>
            <Text style={styles.emptyText}>
              Todavía no hay check-ins registrados. Empezá hoy.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function EntryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.entryMetric}>
      <Text style={styles.entryMetricEmoji}>{label}</Text>
      <Text style={styles.entryMetricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content:      { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  metricScroll: { marginBottom: Spacing[4] },
  metricRow:    { gap: Spacing[2], paddingRight: Spacing[5] },
  metricChip:   { paddingVertical: Spacing[1.5], paddingHorizontal: Spacing[3], borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgSurface },
  metricChipText:{ fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textMuted },
  chartCard:    { marginBottom: Spacing[5] },
  chartTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[3] },
  barsRow:      { flexDirection: 'row', gap: Spacing[1], height: 110, alignItems: 'flex-end' },
  barCol:       { flex: 1, alignItems: 'center', gap: 3 },
  barVal:       { fontSize: 8, fontFamily: FontFamily.regular, color: Colors.textMuted },
  barTrack:     { width: '100%', flex: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill:      { borderRadius: Radius.sm },
  barDay:       { fontSize: 8, fontFamily: FontFamily.medium, color: Colors.textMuted },
  emptyChart:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing[4] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  entryCard:    { marginBottom: Spacing[3] },
  entryHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2] },
  entryDate:    { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textPrimary, textTransform: 'capitalize' },
  entryBadge:   { paddingVertical: 2, paddingHorizontal: Spacing[2], borderRadius: Radius.full },
  entryScore:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  entryMetrics: { flexDirection: 'row', gap: Spacing[4] },
  entryMetric:  { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  entryMetricEmoji:{ fontSize: 14 },
  entryMetricValue:{ fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  entryNotes:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing[2], fontStyle: 'italic', lineHeight: FontSize.xs * 1.5 },
  empty:        { alignItems: 'center', paddingVertical: Spacing[10] },
  emptyEmoji:   { fontSize: 48, marginBottom: Spacing[3] },
  emptyText:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
});