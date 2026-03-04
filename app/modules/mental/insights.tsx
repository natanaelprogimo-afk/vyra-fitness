// ============================================================
// VYRA FITNESS — Módulo Mental: Insights y correlaciones
// Tendencias, correlación humor↔sueño↔pasos, tips Premium
// ============================================================

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import PremiumLock from '@/components/ui/PremiumLock';
import { useMental, getMentalScoreInfo } from '@/hooks/useMental';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { daysAgoISO } from '@/utils/dates';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';

const MENTAL_TIPS = [
  { emoji: '🧘', tip: 'Dedicá 5 minutos de respiración profunda al levantarte. Baja el cortisol mañanero.' },
  { emoji: '📵', tip: 'Evitá las redes sociales la primera hora del día. Empezá desde un estado neutro.' },
  { emoji: '🚶', tip: 'Caminar 20 minutos al aire libre tiene el mismo efecto ansiolítico que una dosis baja de medicación.' },
  { emoji: '✍️', tip: 'Escribí 3 cosas por las que estás agradecido. Recalibra el cerebro hacia el positivo.' },
  { emoji: '😴', tip: 'El sueño es la base de la salud mental. Sin 7-8h, todo lo demás es parche.' },
  { emoji: '🤝', tip: 'La conexión social reduce el estrés más que cualquier técnica de bienestar individual.' },
];

export default function MentalInsightsScreen() {
  const {
    history, dailyScores, weeklyAvgScore,
    avgMood, avgEnergy, avgStress, moodTrend,
  } = useMental();
  const userId     = useAuthStore(s => s.profile?.id);
  const scoreInfo  = getMentalScoreInfo(weeklyAvgScore);

  // Correlación humor ↔ sueño + pasos (Premium)
  const { data: correlData } = useQuery({
    queryKey: ['mental_correlations', userId],
    queryFn: async () => {
      if (!userId) return null;
      const [mentalRes, sleepRes, stepsRes] = await Promise.all([
        supabase.from('mental_checkins').select('check_date, mood, energy, stress').eq('user_id', userId).gte('check_date', daysAgoISO(13)).order('check_date'),
        supabase.from('sleep_logs').select('end_time, quality_score, duration_min').eq('user_id', userId).gte('end_time', `${daysAgoISO(13)}T00:00:00`),
        supabase.from('step_logs').select('logged_date, steps').eq('user_id', userId).gte('logged_date', daysAgoISO(13)),
      ]);

      const byDate: Record<string, { mood?: number; sleepScore?: number; steps?: number }> = {};

      for (const m of mentalRes.data ?? []) {
        byDate[m.check_date] = { ...byDate[m.check_date], mood: m.mood };
      }
      for (const s of sleepRes.data ?? []) {
        const date = s.end_time.split('T')[0];
        byDate[date] = { ...byDate[date], sleepScore: s.quality_score };
      }
      for (const s of stepsRes.data ?? []) {
        byDate[s.logged_date] = { ...byDate[s.logged_date], steps: s.steps };
      }

      return Object.entries(byDate)
        .filter(([, v]) => v.mood !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v }));
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  // Sub-scores como porcentajes para barras
  const moodPct  = (avgMood / 5) * 100;
  const energyPct = (avgEnergy / 10) * 100;
  const calmPct   = ((10 - avgStress) / 10) * 100;  // invertido

  return (
    <SafeScreen>
      <Header title="Insights mentales" showBack color={Colors.mental} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Resumen semanal */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Bienestar de la semana</Text>
            <View style={[styles.scoreBadge, { backgroundColor: `${scoreInfo.color}20` }]}>
              <Text style={[styles.scoreBadgeText, { color: scoreInfo.color }]}>
                {scoreInfo.emoji} {weeklyAvgScore}/100
              </Text>
            </View>
          </View>

          <View style={styles.subBars}>
            <SubBar label="Humor"        pct={moodPct}   color="#F472B6" value={`${avgMood.toFixed(1)}/5`} />
            <SubBar label="Energía"      pct={energyPct} color={Colors.fasting} value={`${avgEnergy.toFixed(1)}/10`} />
            <SubBar label="Calma"        pct={calmPct}   color={Colors.steps}   value={`${(10 - avgStress).toFixed(1)}/10`} />
          </View>

          {/* Tendencia */}
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Tendencia de humor:</Text>
            <Text style={[styles.trendValue, {
              color: moodTrend > 0.2 ? Colors.steps : moodTrend < -0.2 ? Colors.error : Colors.fasting,
            }]}>
              {moodTrend > 0.2 ? '↗ Mejorando' : moodTrend < -0.2 ? '↘ Bajando' : '→ Estable'}
            </Text>
          </View>
        </Card>

        {/* Correlaciones (Premium) */}
        <PremiumLock feature="Correlaciones humor-sueño-actividad" trigger="mental_insights">
          <Card style={styles.correlCard}>
            <Text style={styles.correlTitle}>¿Qué afecta tu humor?</Text>
            {correlData && correlData.length >= 3 ? (
              <View style={styles.correlChart}>
                {correlData.slice(-10).map((d, i) => {
                  const dateLabel = new Date(d.date + 'T12:00:00')
                    .toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
                  return (
                    <View key={i} style={styles.correlRow}>
                      <Text style={styles.correlDate}>{dateLabel}</Text>
                      <View style={styles.correlBars}>
                        <View style={[styles.corrBar, { width: `${(d.mood ?? 0) / 5 * 100}%`, backgroundColor: '#F472B6' }]} />
                        {d.sleepScore !== undefined && (
                          <View style={[styles.corrBar, { width: `${d.sleepScore}%`, backgroundColor: Colors.sleep }]} />
                        )}
                        {d.steps !== undefined && (
                          <View style={[styles.corrBar, { width: `${Math.min(100, d.steps / 150)}%`, backgroundColor: Colors.steps }]} />
                        )}
                      </View>
                    </View>
                  );
                })}
                <View style={styles.legend}>
                  <LegendItem color="#F472B6" label="Humor" />
                  <LegendItem color={Colors.sleep} label="Sueño" />
                  <LegendItem color={Colors.steps} label="Pasos" />
                </View>
              </View>
            ) : (
              <Text style={styles.correlEmpty}>
                Necesitás al menos 3 días de datos combinados para ver correlaciones.
              </Text>
            )}
          </Card>
        </PremiumLock>

        {/* Distribución de estrés */}
        {history.length > 0 && (
          <Card style={styles.stressCard}>
            <Text style={styles.stressTitle}>Distribución de estrés (30 días)</Text>
            {[
              { label: 'Bajo (1-3)',    range: [1, 3],  color: Colors.steps  },
              { label: 'Medio (4-6)',   range: [4, 6],  color: Colors.fasting },
              { label: 'Alto (7-10)',   range: [7, 10], color: Colors.error  },
            ].map(({ label, range, color }) => {
              const count = history.filter(e => e.stress >= range[0] && e.stress <= range[1]).length;
              const pct   = history.length ? (count / history.length) * 100 : 0;
              return (
                <View key={label} style={styles.stressRow}>
                  <Text style={styles.stressLabel}>{label}</Text>
                  <View style={styles.stressBarWrap}>
                    <View style={[styles.stressBar, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.stressPct, { color }]}>{Math.round(pct)}%</Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Tips */}
        <Text style={styles.tipsTitle}>Tips de bienestar mental</Text>
        {MENTAL_TIPS.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <Text style={styles.tipText}>{tip.tip}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}

function SubBar({ label, pct, color, value }: { label: string; pct: number; color: string; value: string }) {
  return (
    <View style={styles.subBar}>
      <View style={styles.subBarHeader}>
        <Text style={styles.subBarLabel}>{label}</Text>
        <Text style={[styles.subBarValue, { color }]}>{value}</Text>
      </View>
      <ProgressBar value={pct} color={color} height={5} animated />
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard:    { marginBottom: Spacing[4] },
  summaryHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[4] },
  summaryTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  scoreBadge:     { paddingVertical: Spacing[1], paddingHorizontal: Spacing[3], borderRadius: Radius.full },
  scoreBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  subBars:        { gap: Spacing[3], marginBottom: Spacing[3] },
  subBar:         {},
  subBarHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[1.5] },
  subBarLabel:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  subBarValue:    { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  trendRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[2] },
  trendLabel:     { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  trendValue:     { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  correlCard:     { marginBottom: Spacing[4] },
  correlTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[4] },
  correlChart:    { gap: Spacing[2] },
  correlRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  correlDate:     { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.textMuted, width: 52 },
  correlBars:     { flex: 1, gap: 3 },
  corrBar:        { height: 6, borderRadius: 3, minWidth: 4 },
  correlEmpty:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing[4] },
  legend:         { flexDirection: 'row', gap: Spacing[4], marginTop: Spacing[3] },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  legendDot:      { width: 8, height: 8, borderRadius: 4 },
  legendLabel:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted },
  stressCard:     { marginBottom: Spacing[5] },
  stressTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[4] },
  stressRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  stressLabel:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary, width: 80 },
  stressBarWrap:  { flex: 1, height: 8, backgroundColor: Colors.bgElevated, borderRadius: 4, overflow: 'hidden' },
  stressBar:      { height: '100%', borderRadius: 4, minWidth: 4 },
  stressPct:      { fontFamily: FontFamily.bold, fontSize: FontSize.sm, width: 36, textAlign: 'right' },
  tipsTitle:      { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing[3] },
  tipRow:         { flexDirection: 'row', gap: Spacing[3], paddingVertical: Spacing[2.5], borderBottomWidth: 1, borderBottomColor: Colors.divider, alignItems: 'flex-start' },
  tipEmoji:       { fontSize: 18, marginTop: 2 },
  tipText:        { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
});