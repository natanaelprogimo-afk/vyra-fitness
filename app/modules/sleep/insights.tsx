import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import SleepModuleTabs from '@/components/sleep/SleepModuleTabs';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useSleep } from '@/hooks/useSleep';
import {
  getSleepConsistencyPercent,
  SLEEP_APP_LOCALE,
  SLEEP_CORRELATION_DISPLAY_DAYS,
  SLEEP_CORRELATION_LOOKBACK_DAYS,
  SLEEP_STEPS_VISUAL_MAX,
} from '@/lib/sleep-module';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { daysAgoISO } from '@/utils/dates';

const SLEEP_TIPS = [
  { id: 'consistency', emoji: '⛰', tip: 'Manten un horario fijo de sueño, incluso los fines de semana.' },
  { id: 'screen', emoji: '📱', tip: 'Apaga las pantallas una hora antes de dormir para mejorar la calidad del descanso.' },
  { id: 'temp', emoji: '🌡️', tip: 'Dormir con la habitación entre 18 y 20 C suele ayudar a un sueño más profundo.' },
  { id: 'caffeine', emoji: '☕', tip: 'Evita la cafeína después de las 14 h si notas que te cuesta conciliar el sueño.' },
  { id: 'exercise', emoji: '🏃', tip: 'El ejercicio moderado ayuda, pero evita hacerlo pegado a la hora de dormir.' },
] as const;

function buildSleepTips(params: {
  avgHours: number;
  avgScore: number;
  goalHours: number;
  consistencyPct: number;
  hasSleepData: boolean;
}) {
  const tips: Array<{ id: string; emoji: string; tip: string }> = [];

  if (!params.hasSleepData) {
    return [SLEEP_TIPS[0], SLEEP_TIPS[1], SLEEP_TIPS[2], SLEEP_TIPS[4]];
  }

  if (params.avgHours < params.goalHours - 0.4) {
    tips.push({
      id: 'duration-gap',
      emoji: '🌙',
      tip: 'Tu duración todavía viene corta. Intentar cerrar el día 20 o 30 minutos antes ya puede mover mucho la semana.',
    });
  }

  if (params.consistencyPct > 0 && params.consistencyPct < 70) {
    tips.push({
      id: 'consistency-gap',
      emoji: '⏰',
      tip: 'La constancia pesa más que una noche aislada. Repetir una hora parecida de sueño te va a dar una señal mucho más estable.',
    });
  }

  if (params.avgScore < 70) {
    tips.push({
      id: 'quality-gap',
      emoji: '🌡️',
      tip: 'La calidad todavia esta baja. Temperatura, luz y ruido suelen mover mas el descanso de lo que parece.',
    });
  }

  if (params.avgHours >= params.goalHours && params.avgScore >= 75) {
    tips.push({
      id: 'maintain-rhythm',
      emoji: '✨',
      tip: 'El descanso ya viene bastante bien. La clave ahora es sostener el ritmo para que el modulo gane contexto real.',
    });
  }

  const usedIds = new Set(tips.map((tip) => tip.id));
  for (const tip of SLEEP_TIPS) {
    if (tips.length >= 4) break;
    if (usedIds.has(tip.id)) continue;
    tips.push(tip);
  }

  return tips.slice(0, 4);
}

export default function SleepInsightsScreen() {
  const { history, avgHours, avgScore, goalHours, sleepDebt, sleepDebtMessage } = useSleep();
  const userId = useAuthStore((state) => state.profile?.id);

  const last3 = history.slice(-3);
  const hasSleepData = last3.length > 0;
  const recoveryIndex = last3.length
    ? Math.round(last3.reduce((sum, entry) => sum + entry.quality_score, 0) / last3.length)
    : 0;
  const recoveryColor =
    recoveryIndex >= 80 ? Colors.success : recoveryIndex >= 60 ? Colors.sleep : Colors.warning;
  const consistencyPct = getSleepConsistencyPercent(history, goalHours);
  const sleepTips = buildSleepTips({
    avgHours,
    avgScore,
    goalHours,
    consistencyPct,
    hasSleepData,
  });
  const subScores = [
    {
      label: 'Duracion',
      pct: hasSleepData ? Math.min(100, (avgHours / goalHours) * 100) : 0,
      color: Colors.sleep,
      valueLabel: hasSleepData ? `${Math.round(Math.min(100, (avgHours / goalHours) * 100))}%` : '—',
    },
    {
      label: 'Calidad',
      pct: hasSleepData ? avgScore : 0,
      color: '#CE93D8',
      valueLabel: hasSleepData ? `${Math.round(avgScore)}%` : '—',
    },
    {
      label: 'Consistencia',
      pct: history.length > 1 ? consistencyPct : history.length === 1 ? 100 : 0,
      color: Colors.brand,
      valueLabel: history.length > 1 ? `${Math.round(consistencyPct)}%` : history.length === 1 ? '100%' : 'Aun sin base',
    },
  ];

  const { data: correlationData, isLoading: isLoadingCorrelation } = useQuery({
    queryKey: ['sleep_steps_correlation', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [sleepRes, stepsRes] = await Promise.all([
        supabase
          .from('sleep_logs')
          .select('end_time, quality_score')
          .eq('user_id', userId)
          .gte('end_time', `${daysAgoISO(SLEEP_CORRELATION_LOOKBACK_DAYS - 1)}T00:00:00`)
          .order('end_time'),
        supabase
          .from('step_logs')
          .select('logged_date, steps')
          .eq('user_id', userId)
          .gte('logged_date', daysAgoISO(SLEEP_CORRELATION_LOOKBACK_DAYS - 1))
          .order('logged_date'),
      ]);

      const sleepByDate = Object.fromEntries(
        (sleepRes.data ?? []).map((entry) => [entry.end_time.split('T')[0], entry]),
      );
      const stepsByDate = Object.fromEntries(
        (stepsRes.data ?? []).map((entry) => [entry.logged_date, Number(entry.steps ?? 0)]),
      );

      return Object.entries(sleepByDate)
        .filter(([date]) => stepsByDate[date] !== undefined)
        .map(([date, sleep]) => ({
          date,
          sleep: (sleep as { quality_score: number }).quality_score,
          steps: stepsByDate[date],
        }));
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Insights de sueño" showBack color={Colors.sleep} />
      <SleepModuleTabs active="insights" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.readinessCard}>
          <Text style={styles.readinessTitle}>Indice de descanso</Text>
          <View style={styles.readinessRow}>
            <Text style={[styles.readinessScore, { color: hasSleepData ? recoveryColor : Colors.textMuted }]}>
              {hasSleepData ? recoveryIndex : '—'}
            </Text>
            <View style={styles.readinessInfo}>
              <Text style={[styles.readinessLabel, { color: hasSleepData ? recoveryColor : Colors.textPrimary }]}>
                {!hasSleepData
                  ? 'Registra tu primera noche'
                  : recoveryIndex >= 80
                    ? 'Listo para rendir'
                    : recoveryIndex >= 60
                      ? 'Bien recuperado'
                      : 'Conviene recuperar mas'}
              </Text>
              <Text style={styles.readinessDesc}>
                {!hasSleepData
                  ? 'Necesitamos al menos una noche para construir tu indice.'
                  : `Basado en las ultimas ${last3.length} noche${last3.length === 1 ? '' : 's'}`}
              </Text>
            </View>
          </View>
          <ProgressBar
            value={recoveryIndex}
            color={recoveryColor}
            height={8}
            animated
            showPct={false}
            style={styles.readinessBar}
          />

          <View style={styles.subScores}>
            {subScores.map((item) => (
              <View key={item.label} style={styles.subScoreItem}>
                <View style={styles.subScoreHeader}>
                  <Text style={styles.subScoreLabel}>{item.label}</Text>
                  <Text style={[styles.subScoreValue, { color: item.color }]}>
                    {item.valueLabel}
                  </Text>
                </View>
                <ProgressBar value={item.pct} color={item.color} height={4} animated />
              </View>
            ))}
          </View>
        </Card>

        {sleepDebtMessage ? (
          <Card style={styles.debtCard}>
            <Text style={styles.debtTitle}>Compensación sugerida</Text>
            <Text style={styles.debtBody}>{sleepDebtMessage}</Text>
            <Text style={styles.debtMeta}>
              Tu deuda reciente va en {sleepDebt.toFixed(1)}h.
            </Text>
          </Card>
        ) : null}

        <Card style={styles.correlationCard}>
          <Text style={styles.correlationTitle}>Sueño vs pasos</Text>
          {isLoadingCorrelation ? (
            <Text style={styles.correlationEmpty}>
              Cargando correlaciones de descanso y movimiento...
            </Text>
          ) : correlationData && correlationData.length > 0 ? (
            <View style={styles.correlationChart}>
              {correlationData.slice(-SLEEP_CORRELATION_DISPLAY_DAYS).map((entry) => (
                <View key={entry.date} style={styles.correlationRow}>
                  <Text style={styles.correlationDate}>
                    {new Date(`${entry.date}T12:00:00`).toLocaleDateString(SLEEP_APP_LOCALE, {
                      weekday: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <View style={styles.correlationBars}>
                    <View
                      style={[
                        styles.corrBar,
                        { width: `${entry.sleep}%`, backgroundColor: Colors.sleep },
                      ]}
                    />
                    <View
                      style={[
                        styles.corrBar,
                        {
                          width: `${Math.min(
                            100,
                            (Number(entry.steps ?? 0) / SLEEP_STEPS_VISUAL_MAX) * 100,
                          )}%`,
                          backgroundColor: Colors.steps,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
              <View style={styles.correlationLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.sleep }]} />
                  <Text style={styles.legendText}>Calidad del sueño</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.steps }]} />
                  <Text style={styles.legendText}>Pasos</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.correlationEmpty}>
              Cuando registres más noches y más pasos, acá vas a ver si dormir mejor también empuja tu actividad.
            </Text>
          )}
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consejos para mejorar</Text>
          {sleepTips.map((tip) => (
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
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  readinessCard: { gap: Spacing[3] },
  debtCard: {
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: `${Colors.sleep}33`,
    backgroundColor: `${Colors.sleep}14`,
  },
  debtTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  debtBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  debtMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.sleep,
  },
  readinessTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  readinessScore: { fontFamily: FontFamily.bold, fontSize: 52, lineHeight: 56 },
  readinessInfo: { flex: 1 },
  readinessLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  readinessDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  readinessBar: { marginBottom: Spacing[1] },
  subScores: { gap: Spacing[3] },
  subScoreItem: {},
  subScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[1.5],
  },
  subScoreLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  subScoreValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  correlationCard: { gap: Spacing[3] },
  correlationTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  correlationChart: { gap: Spacing[2] },
  correlationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  correlationDate: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    width: 72,
  },
  correlationBars: { flex: 1, gap: 3 },
  corrBar: { height: 6, borderRadius: 3, minWidth: 4 },
  correlationLegend: { flexDirection: 'row', gap: Spacing[4], marginTop: Spacing[2] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  correlationEmpty: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing[4],
  },
  section: { gap: Spacing[2] },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  tipRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingVertical: Spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    alignItems: 'flex-start',
  },
  tipEmoji: { fontSize: 18, marginTop: 2 },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
});
