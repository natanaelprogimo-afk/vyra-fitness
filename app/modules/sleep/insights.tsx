// ============================================================
// VYRA FITNESS — Sueño: Insights y correlaciones
// Readiness score, correlación sueño↔pasos↔ánimo, consejos
// ============================================================

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import PremiumLock from '@/components/ui/PremiumLock';
import { useSleep } from '@/hooks/useSleep';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { daysAgoISO } from '@/utils/dates';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

// Consejos de sueño por score
const SLEEP_TIPS = [
  { id: 'consistency', emoji: '⏰', tip: 'Mantené un horario fijo de sueño, incluso los fines de semana.' },
  { id: 'screen',      emoji: '📵', tip: 'Apagá las pantallas 1h antes de dormir para mejorar la melatonina.' },
  { id: 'temp',        emoji: '🌡️', tip: 'Dormí con la habitación entre 18-20°C para un sueño más profundo.' },
  { id: 'caffeine',    emoji: '☕', tip: 'Evitá la cafeína después de las 14h para no impactar el sueño.' },
  { id: 'exercise',    emoji: '🏃', tip: 'El ejercicio moderado mejora la calidad del sueño, pero no lo hagas justo antes de dormir.' },
];

export default function SleepInsightsScreen() {
  const { lastSleep, history, avgHours, avgScore, goalHours } = useSleep();
  const userId = useAuthStore((s) => s.profile?.id);

  // Readiness score = media ponderada de las últimas 3 noches
  const last3     = history.slice(-3);
  const readiness = last3.length
    ? Math.round(last3.reduce((s, h) => s + h.quality_score, 0) / last3.length)
    : 0;
  const readinessColor = readiness >= 80 ? Colors.steps : readiness >= 60 ? Colors.fasting : Colors.warning;

  // Correlación sueño ↔ pasos (Premium)
  const { data: correlationData } = useQuery({
    queryKey: ['sleep_steps_correlation', userId],
    queryFn: async () => {
      if (!userId) return null;
      const [sleepRes, stepsRes] = await Promise.all([
        supabase.from('sleep_logs').select('end_time, quality_score, duration_min').eq('user_id', userId).gte('end_time', `${daysAgoISO(13)}T00:00:00`).order('end_time'),
        supabase.from('step_logs').select('logged_date, steps').eq('user_id', userId).gte('logged_date', daysAgoISO(13)).order('logged_date'),
      ]);

      const sleepByDate = Object.fromEntries(
        (sleepRes.data ?? []).map(s => [s.end_time.split('T')[0], s])
      );
      const stepsByDate = Object.fromEntries(
        (stepsRes.data ?? []).map(s => [s.logged_date, s.steps])
      );

      const pairs = Object.entries(sleepByDate)
        .filter(([date]) => stepsByDate[date])
        .map(([date, sleep]) => ({ date, sleep: (sleep as any).quality_score, steps: stepsByDate[date] }));

      return pairs;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <SafeScreen>
      <Header title="Insights de sueño" showBack color={Colors.sleep} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Readiness score */}
        <Card style={styles.readinessCard}>
          <Text style={styles.readinessTitle}>Índice de recuperación</Text>
          <View style={styles.readinessRow}>
            <Text style={[styles.readinessScore, { color: readinessColor }]}>{readiness}</Text>
            <View style={styles.readinessInfo}>
              <Text style={[styles.readinessLabel, { color: readinessColor }]}>
                {readiness >= 80 ? 'Listo para rendir' : readiness >= 60 ? 'Bien recuperado' : 'Necesitás descansar'}
              </Text>
              <Text style={styles.readinessDesc}>Basado en las últimas 3 noches</Text>
            </View>
          </View>
          <ProgressBar value={readiness} color={readinessColor} height={8} animated showPct={false} style={styles.readinessBar} />

          {/* Sub-scores */}
          <View style={styles.subScores}>
            {[
              { label: 'Duración',  pct: Math.min(100, (avgHours / goalHours) * 100), color: Colors.sleep },
              { label: 'Calidad',   pct: avgScore, color: '#CE93D8' },
              { label: 'Consistencia', pct: history.filter(h => h.duration_min/60 >= goalHours).length / Math.max(1, history.length) * 100, color: Colors.brand },
            ].map((s) => (
              <View key={s.label} style={styles.subScoreItem}>
                <View style={styles.subScoreHeader}>
                  <Text style={styles.subScoreLabel}>{s.label}</Text>
                  <Text style={[styles.subScoreValue, { color: s.color }]}>{Math.round(s.pct)}%</Text>
                </View>
                <ProgressBar value={s.pct} color={s.color} height={4} animated />
              </View>
            ))}
          </View>
        </Card>

        {/* Correlación (Premium) */}
        <PremiumLock feature="Correlación sueño-rendimiento" trigger="sleep_insights">
          <Card style={styles.correlationCard}>
            <Text style={styles.correlationTitle}>Sueño vs Pasos</Text>
            {correlationData && correlationData.length > 0 ? (
              <View style={styles.correlationChart}>
                {correlationData.slice(-7).map((d, i) => (
                  <View key={i} style={styles.correlationRow}>
                    <Text style={styles.correlationDate}>
                      {new Date(d.date + 'T12:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}
                    </Text>
                    <View style={styles.correlationBars}>
                      <View style={[styles.corrBar, { width: `${d.sleep}%`, backgroundColor: Colors.sleep }]} />
                      <View style={[styles.corrBar, { width: `${Math.min(100, d.steps/150)}%`, backgroundColor: Colors.steps }]} />
                    </View>
                  </View>
                ))}
                <View style={styles.correlationLegend}>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.sleep }]} /><Text style={styles.legendText}>Calidad sueño</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.steps }]} /><Text style={styles.legendText}>Pasos</Text></View>
                </View>
              </View>
            ) : (
              <Text style={styles.correlationEmpty}>Necesitás al menos 7 días de datos para ver la correlación.</Text>
            )}
          </Card>
        </PremiumLock>

        {/* Consejos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consejos para mejorar</Text>
          {SLEEP_TIPS.map((tip) => (
            <View key={tip.id} style={styles.tipRow}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  readinessCard:       { marginBottom: Spacing[4] },
  readinessTitle:      { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  readinessRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], marginBottom: Spacing[3] },
  readinessScore:      { fontFamily: FontFamily.bold, fontSize: 52, lineHeight: 56 },
  readinessInfo:       { flex: 1 },
  readinessLabel:      { fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  readinessDesc:       { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  readinessBar:        { marginBottom: Spacing[4] },
  subScores:           { gap: Spacing[3] },
  subScoreItem:        {},
  subScoreHeader:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[1.5] },
  subScoreLabel:       { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  subScoreValue:       { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  correlationCard:     { marginBottom: Spacing[4] },
  correlationTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[4] },
  correlationChart:    { gap: Spacing[2] },
  correlationRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  correlationDate:     { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted, width: 60 },
  correlationBars:     { flex: 1, gap: 3 },
  corrBar:             { height: 6, borderRadius: 3, minWidth: 4 },
  correlationLegend:   { flexDirection: 'row', gap: Spacing[4], marginTop: Spacing[3] },
  legendItem:          { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  legendDot:           { width: 8, height: 8, borderRadius: 4 },
  legendText:          { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  correlationEmpty:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing[4] },
  section:             { marginBottom: Spacing[6] },
  sectionTitle:        { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  tipRow:              { flexDirection: 'row', gap: Spacing[3], paddingVertical: Spacing[2.5], borderBottomWidth: 1, borderBottomColor: Colors.divider, alignItems: 'flex-start' },
  tipEmoji:            { fontSize: 18, marginTop: 2 },
  tipText:             { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
});