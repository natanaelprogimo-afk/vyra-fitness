import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFasting } from '@/hooks/useFasting';

const FASTING_INSIGHT_COLOR = Colors.fasting;
const SCORE_SEGMENTS = 24;
const WEEKLY_BAR_HEIGHT = 72;
const WEEKLY_DISPLAY_DAYS = 7;

function buildScore(
  avgHours: number,
  streakDays: number,
  targetHours: number,
  completedFasts: number,
  weeklyAdherencePct?: number | null,
) {
  const adherenceBase = weeklyAdherencePct !== null && weeklyAdherencePct !== undefined
    ? weeklyAdherencePct / 100
    : avgHours / Math.max(targetHours, 1);
  const adherence = Math.min(1, adherenceBase);
  const streak = Math.min(1, streakDays / 7);
  const volume = Math.min(1, completedFasts / 5);
  return Math.max(0, Math.min(100, Math.round(adherence * 45 + streak * 30 + volume * 25)));
}

function qualityLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 85) return { label: 'Excelente', emoji: '🔥', color: Colors.fasting };
  if (score >= 70) return { label: 'Muy bueno', emoji: '⚡', color: Colors.success };
  if (score >= 55) return { label: 'Creciendo', emoji: '🌱', color: Colors.warning };
  return { label: 'Empezando', emoji: '🌙', color: Colors.textSecondary };
}

/** Barra de score estilo ecualizador con colores progresivos */
function ScoreBar({ score, color }: { score: number; color: string }) {
  const filled = Math.round((score / 100) * SCORE_SEGMENTS);

  const getSegmentColor = (index: number, total: number) => {
    const ratio = index / total;
    if (ratio < 0.45) return Colors.success;
    if (ratio < 0.70) return Colors.warning;
    return color;
  };

  return (
    <View style={scoreBarStyles.row}>
      {Array.from({ length: SCORE_SEGMENTS }).map((_, i) => {
        const isFilled = i < filled;
        const segColor = isFilled ? getSegmentColor(i, SCORE_SEGMENTS) : Colors.elevated;
        return (
          <View
            key={i}
            style={[
              scoreBarStyles.segment,
              {
                height: isFilled ? 8 + (i / SCORE_SEGMENTS) * 16 : 6,
                backgroundColor: segColor,
                opacity: isFilled ? 0.5 + (i / SCORE_SEGMENTS) * 0.5 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const scoreBarStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2.5,
    paddingVertical: Spacing[1],
    height: 32,
  },
  segment: {
    flex: 1,
    borderRadius: 2,
  },
});

// FIX #8: WeeklyBars now derives day labels from actual dates in the history
// instead of a fixed array indexed by position, which produced wrong labels.
function WeeklyBars({ data, targetHours, dates }: {
  data: number[];
  targetHours: number;
  dates: string[];    // ISO date strings corresponding to each data point
}) {
  const maxVal = Math.max(...data, targetHours, 1);
  const targetOffset = Math.max(0, Math.min(WEEKLY_BAR_HEIGHT, (targetHours / maxVal) * WEEKLY_BAR_HEIGHT));

  // Map JS getDay() (0=Sun) to Spanish short labels
  const DAY_NAMES = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <View style={weeklyStyles.container}>
      {data.slice(0, WEEKLY_DISPLAY_DAYS).map((hours, i) => {
        const pct = (hours / maxVal) * 100;
        const reached = hours >= targetHours * 0.9;
        const barColor = reached ? Colors.fasting : Colors.warning;

        // FIX #8: Use actual date to get correct day-of-week label
        const dayLabel = dates[i]
          ? DAY_NAMES[new Date(dates[i]).getDay()]
          : '?';

        return (
          <View key={i} style={weeklyStyles.barCol}>
            <View style={weeklyStyles.barTrack}>
              <View style={[
                weeklyStyles.barFill,
                { height: `${pct}%`, backgroundColor: barColor, opacity: 0.75 + (pct / 100) * 0.25 }
              ]} />
              {/* Línea de objetivo */}
              <View style={[weeklyStyles.targetLine, { bottom: targetOffset }]} />
            </View>
            <Text style={weeklyStyles.dayLabel}>{dayLabel}</Text>
          </View>
        );
      })}
    </View>
  );
}

const weeklyStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing[1.5],
    alignItems: 'flex-end',
    height: WEEKLY_BAR_HEIGHT,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[1],
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    overflow: 'visible',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  targetLine: {
    position: 'absolute',
    width: '140%',
    left: '-20%',
    height: 1,
    backgroundColor: withOpacity(Colors.fasting, 0.3),
  },
  dayLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textMuted,
  },
});

/** Tarjeta de insight con color y icono */
function InsightRow({ text, icon, color }: { text: string; icon: string; color: string }) {
  return (
    <View style={[insightStyles.row, { borderLeftColor: color }]}>
      <Text style={insightStyles.icon}>{icon}</Text>
      <Text style={insightStyles.text}>{text}</Text>
    </View>
  );
}

const insightStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    backgroundColor: Colors.surface2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 5,
    padding: Spacing[4],
  },
  icon: { fontSize: 16, marginTop: 1 },
  text: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});

export default function FastingAnalysisScreen() {
  const { avgHours, fastingStreakDays, completedFasts, targetHours, history, protocolSuggestion } =
    useFasting();

  const analysisHistory = useMemo(
    () => history.filter((item) => (item.status === 'completed' || item.status === 'interrupted') && Number(item.total_hours ?? 0) > 0),
    [history],
  );
  const weeklySessions = useMemo(() => (history ?? []).filter((s) => s.protocol_type === 'weekly'), [history]);
  const weeklySummaries = useMemo(() => {
    const grouped = new Map<string, { key: string; label: string; completed: number; target: number }>();

    for (const session of weeklySessions) {
      const key = `${session.year ?? 'na'}-${session.week_number ?? 'na'}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          label: `Semana ${session.week_number ?? '-'}`,
          completed: 0,
          target: 2,
        });
      }
      if (session.status === 'completed') {
        grouped.get(key)!.completed += 1;
      }
    }

    return [...grouped.values()].sort((left, right) => right.key.localeCompare(left.key));
  }, [weeklySessions]);
  const weeklyAdherencePct = weeklySummaries.length
    ? (weeklySummaries.reduce((sum, week) => sum + Math.min(1, week.completed / Math.max(1, week.target)), 0) / weeklySummaries.length) * 100
    : null;

  const score = buildScore(avgHours, fastingStreakDays, targetHours, completedFasts, weeklyAdherencePct);
  const quality = qualityLabel(score);

  // FIX #9: Memoize lastSeven and previousSeven so weeklyHours and insights
  // useMemos actually benefit from caching (plain slice() returns a new reference
  // every render, defeating the purpose of the downstream memos).
  const lastSeven = useMemo(() => analysisHistory.slice(0, 7), [analysisHistory]);
  const previousSeven = useMemo(() => analysisHistory.slice(7, 14), [analysisHistory]);

  const currentAvg = lastSeven.length
    ? lastSeven.reduce((sum, item) => sum + Number(item.total_hours ?? 0), 0) / lastSeven.length
    : avgHours;
  const previousAvg = previousSeven.length
    ? previousSeven.reduce((sum, item) => sum + Number(item.total_hours ?? 0), 0) / previousSeven.length
    : 0;

  // FIX #10: isFirstWeek was checking `previousAvg === 0` which is wrong when
  // the user simply didn't fast the previous week. Now correctly checks if there
  // are zero records in the previous period.
  const isFirstWeek = previousSeven.length === 0;
  const delta = !isFirstWeek && previousAvg > 0
    ? Math.round(((currentAvg - previousAvg) / previousAvg) * 100)
    : 0;
  const deltaLabel = isFirstWeek
    ? 'Primera semana'
    : `${delta >= 0 ? '+' : ''}${delta}% vs semana anterior`;

  // FIX #8 + FIX #9: weeklyHours now also collects the date strings so
  // WeeklyBars can derive correct day-of-week labels.
  const { weeklyHours, weeklyDates } = useMemo(() => ({
    weeklyHours: lastSeven.map(item => Number(item.total_hours ?? 0)),
    // Use end_time if available, fall back to start_time for the day label
    weeklyDates: lastSeven.map(item => (item.end_time ?? item.start_time) as string),
  }), [lastSeven]);

  const insights = useMemo(() => {
    // FIX #11: Guard against empty lastSeven before running reduce operations.
    // reduce() on an empty array without an explicit initialValue throws TypeError.
    if (lastSeven.length === 0) {
      return [
        {
          text: 'Todavía no hay registros esta semana. Completá tu primer ayuno para ver insights.',
          icon: '🌱',
          color: Colors.fasting,
        },
      ];
    }

    const worstDay = lastSeven.reduce(
      (lowest, item) =>
        Number(item.total_hours ?? 0) < Number(lowest?.total_hours ?? 999) ? item : lowest,
      lastSeven[0],
    );
    const bestDay = lastSeven.reduce(
      (best, item) =>
        Number(item.total_hours ?? 0) > Number(best?.total_hours ?? 0) ? item : best,
      lastSeven[0],
    );

    return [
      {
        text: isFirstWeek
          ? 'Primera semana registrada. Cada ayuno que cerrás construye la base del hábito.'
          : `${delta >= 0 ? '+' : ''}${delta}% vs semana pasada. ${delta >= 0 ? 'Tu consistencia va en la dirección correcta.' : 'Fluctuar es normal. Lo importante es sostenerse.'}`,
        icon: isFirstWeek ? '🌱' : delta >= 0 ? '📈' : '💪',
        color: isFirstWeek ? Colors.fasting : delta >= 0 ? Colors.success : Colors.warning,
      },
      {
        text: bestDay
          ? `Mejor día: ${new Date(bestDay.end_time ?? bestDay.start_time ?? Date.now()).toLocaleDateString('es-UY', { weekday: 'long' })}. Conviene repetir ese contexto.`
          : 'Todavía faltan más cierres para encontrar tu mejor patrón.',
        icon: '🏆',
        color: Colors.warning,
      },
      {
        text: protocolSuggestion?.reason ??
          (worstDay
            ? `Cuando bajás, suele pasar cerca de ${Math.round(Number(worstDay.total_hours ?? 0))}h. Bajá una etapa antes de forzar.`
            : 'Sostener una ventana clara vale más que buscar la más extrema.'),
        icon: '💡',
        // FIX #12: use the module-level constant instead of inline ?? fallback
        color: FASTING_INSIGHT_COLOR,
      },
    ];
  }, [isFirstWeek, lastSeven, protocolSuggestion?.reason, delta]);

  return (
    <ModuleScaffold
      title="Análisis de ayuno"
      subtitle="Score semanal y señales útiles"
      color={Colors.fasting}
      tabs={<FastingModuleTabs active="analysis" />}
    >
      {/* ─── Hero de score ──────────────────────────────── */}
      <Card style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <View style={[styles.scoreBadge, { backgroundColor: withOpacity(quality.color, 0.12) }]}>
              <Text style={styles.scoreBadgeEmoji}>{quality.emoji}</Text>
              <Text style={[styles.scoreQuality, { color: quality.color }]}>{quality.label}</Text>
            </View>
          </View>
          <View style={styles.scoreRight}>
            <Text style={[styles.scoreAvg, { fontSize: FontSize['2xl'] }]}>
              {Math.round(currentAvg * 10) / 10}h
            </Text>
            <Text style={styles.scoreAvgLabel}>{lastSeven.length === 0 ? 'promedio histórico' : 'promedio semanal'}</Text>
            <View style={[
              styles.deltaBadge,
              { backgroundColor: withOpacity(delta >= 0 || isFirstWeek ? Colors.success : Colors.warning, 0.1) }
            ]}>
              <Text style={[styles.scoreDelta, {
                color: delta >= 0 || isFirstWeek ? Colors.success : Colors.warning
              }]}>
                {deltaLabel}
              </Text>
            </View>
          </View>
        </View>

        <ScoreBar score={score} color={Colors.fasting} />

        <View style={styles.scoreFactors}>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Adherencia</Text>
            <View style={styles.factorBar}>
              <View style={[styles.factorFill, {
                width: `${Math.min(100, weeklyAdherencePct ?? ((avgHours / Math.max(targetHours, 1)) * 100))}%`,
                backgroundColor: Colors.fasting
              }]} />
            </View>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Racha</Text>
            <View style={styles.factorBar}>
              <View style={[styles.factorFill, {
                width: `${Math.min(100, (fastingStreakDays / 7) * 100)}%`,
                backgroundColor: Colors.success
              }]} />
            </View>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Volumen</Text>
            <View style={styles.factorBar}>
              <View style={[styles.factorFill, {
                width: `${Math.min(100, (completedFasts / 5) * 100)}%`,
                backgroundColor: Colors.warning
              }]} />
            </View>
          </View>
        </View>

        <Text style={styles.scoreHint}>
          Score basado en adherencia al protocolo, racha activa y volumen semanal
        </Text>
      </Card>

      {/* ─── Métricas clave ─────────────────────────── */}
      <View style={styles.metricGrid}>
        <MetricCard
          value={`${fastingStreakDays}d`}
          label="Racha actual"
          note={fastingStreakDays >= 7 ? '🔥 Una semana seguida' : fastingStreakDays > 0 ? 'Seguí así' : 'Sin racha activa'}
          accentColor={Colors.fasting}
        />
        <MetricCard
          value={completedFasts}
          label="Completados"
          note="Ayunos cerrados"
          accentColor={Colors.success}
        />
      </View>

      {/* 5:2 weekly summary (if any weekly sessions present) */}
      {weeklySummaries.length > 0 && (
        <Card style={styles.weekSummaryCard}>
          <SectionHeader
            eyebrow="Protocolo 5:2"
            title="Semanas cumplidas"
            subtitle="Adherencia semanal a tus días de ayuno programados."
          />
          <Text style={styles.weekSummaryMeta}>
            {weeklySummaries[0]?.completed ?? 0}/{weeklySummaries[0]?.target ?? 2} completados en la semana actual
          </Text>
          <View style={styles.weekDays}>
            {weeklySummaries.slice(0, 4).map((day) => (
              <View key={day.key} style={styles.weekDayItem}>
                <Text style={styles.weekDayLabel}>{day.label}</Text>
                <View style={[
                  styles.weekDayDot,
                  {
                    backgroundColor: day.completed >= day.target ? Colors.fasting : withOpacity(Colors.warning, 0.9),
                  }
                ]} />
                <Text style={styles.weekDayHours}>{day.completed}/{day.target}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* ─── Gráfico semanal ────────────────────────── */}
      {weeklyHours.length > 0 ? (
        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Esta semana"
            title="Horas por día"
            subtitle="La línea punteada marca tu objetivo de protocolo."
          />
          {/* FIX #8: Pass weeklyDates so bars show real day names */}
          <WeeklyBars
            data={weeklyHours}
            targetHours={targetHours}
            dates={weeklyDates}
          />
        </Card>
      ) : (
        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Esta semana"
            title="Horas por día"
            subtitle="Cuando cierres tu primer ayuno, esta vista mostrará tu ritmo semanal."
          />
          <View style={styles.emptyWeekState}>
            <Text style={styles.emptyWeekTitle}>Todavía no hay una semana para comparar</Text>
            <Text style={styles.emptyWeekBody}>
              Completá tu primer ayuno para ver horas por día y una lectura más útil de tu progreso.
            </Text>
            <View style={styles.emptyWeekActions}>
              <Button
                label="Empezar ahora"
                onPress={() => router.push(Routes.fasting.index as never)}
                color={Colors.fasting}
                fullWidth
              />
              <Button
                label="Ver protocolos"
                onPress={() => router.push(Routes.fasting.protocols as never)}
                variant="ghost"
                color={Colors.fasting}
                fullWidth
              />
            </View>
          </View>
        </Card>
      )}

      {/* ─── Tres ideas útiles ─────────────────────── */}
      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Lectura semanal"
          title="Tres ideas útiles"
          subtitle="Basadas en tus últimos 7 días de registro."
        />
        <View style={styles.insightsColumn}>
          {insights.map((insight, index) => (
            <InsightRow
              key={`${insight.icon}-${index}`}
              text={insight.text}
              icon={insight.icon}
              color={insight.color}
            />
          ))}
        </View>
      </Card>
    </ModuleScaffold>
  );
}

const styles = StyleSheet.create({
  scoreCard: { gap: Spacing[3] },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scoreLeft: {
    gap: Spacing[1],
  },
  scoreNumber: {
    fontFamily: FontFamily.bold,
    fontSize: 64,
    lineHeight: 68,
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  scoreBadgeEmoji: { fontSize: 12, color: Colors.textPrimary },
  scoreQuality: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreRight: {
    alignItems: 'flex-end',
    gap: Spacing[1],
    paddingTop: Spacing[2],
  },
  scoreAvg: {
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  scoreAvgLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  deltaBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  scoreDelta: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  scoreFactors: {
    gap: Spacing[2],
    paddingTop: Spacing[1],
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  factorLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    width: 70,
  },
  factorBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.elevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: Radius.full,
    opacity: 0.8,
  },
  scoreHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  card: { gap: Spacing[4] },
  emptyWeekState: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    padding: Spacing[4],
    gap: Spacing[1],
  },
  emptyWeekActions: {
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  emptyWeekTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  emptyWeekBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  insightsColumn: { gap: Spacing[2] },
  weekSummaryCard: { gap: Spacing[2] },
  weekSummaryMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  weekDays: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'center',
  },
  weekDayItem: {
    alignItems: 'center',
    gap: 4,
  },
  weekDayLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textMuted,
  },
  weekDayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  weekDayHours: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});

