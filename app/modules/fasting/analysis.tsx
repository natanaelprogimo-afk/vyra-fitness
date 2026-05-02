import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import ModuleScaffold from '@/components/modules/ModuleScaffold';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useFasting } from '@/hooks/useFasting';

// FIX #12: Extract Colors.sleep fallback as a module-level constant instead
// of inlining `Colors.sleep ?? '#8B5CF6'` everywhere. Centralizes the fallback.
const SLEEP_COLOR: string = Colors.sleep ?? '#8B5CF6';

function buildScore(avgHours: number, streakDays: number, targetHours: number, completedFasts: number) {
  const adherence = Math.min(1, avgHours / Math.max(targetHours, 1));
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
  const SEGMENTS = 24;
  const filled = Math.round((score / 100) * SEGMENTS);

  const getSegmentColor = (index: number, total: number) => {
    const ratio = index / total;
    if (ratio < 0.45) return Colors.success;
    if (ratio < 0.70) return Colors.warning;
    return color;
  };

  return (
    <View style={scoreBarStyles.row}>
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const isFilled = i < filled;
        const segColor = isFilled ? getSegmentColor(i, SEGMENTS) : Colors.bgElevated;
        return (
          <View
            key={i}
            style={[
              scoreBarStyles.segment,
              {
                height: isFilled ? 8 + (i / SEGMENTS) * 16 : 6,
                backgroundColor: segColor,
                opacity: isFilled ? 0.5 + (i / SEGMENTS) * 0.5 : 1,
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

  // Map JS getDay() (0=Sun) to Spanish short labels
  const DAY_NAMES = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <View style={weeklyStyles.container}>
      {data.slice(0, 7).map((hours, i) => {
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
              <View style={[weeklyStyles.targetLine, { bottom: `${(targetHours / maxVal) * 100}%` }]} />
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
    height: 72,
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
    backgroundColor: Colors.bgElevated,
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
    borderLeftWidth: 3,
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

  // Separate sessions by protocol type to show 5:2 specific insights
  const weeklySessions = useMemo(() => (history ?? []).filter((s) => s.protocol_type === 'weekly'), [history]);

  const score = buildScore(avgHours, fastingStreakDays, targetHours, completedFasts);
  const quality = qualityLabel(score);

  // FIX #9: Memoize lastSeven and previousSeven so weeklyHours and insights
  // useMemos actually benefit from caching (plain slice() returns a new reference
  // every render, defeating the purpose of the downstream memos).
  const lastSeven = useMemo(() => history.slice(0, 7), [history]);
  const previousSeven = useMemo(() => history.slice(7, 14), [history]);

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
        color: SLEEP_COLOR,
      },
    ];
  }, [delta, isFirstWeek, lastSeven, protocolSuggestion?.reason]);

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
            {/* FIX #6: FontSize['2xl'] may be undefined in some configs;
                use a numeric fallback only as a last resort. '2xl' token
                should ideally be defined in your theme constants. */}
            <Text style={[styles.scoreAvg, { fontSize: FontSize['2xl'] ?? 28 }]}>
              {Math.round(currentAvg * 10) / 10}h
            </Text>
            <Text style={styles.scoreAvgLabel}>promedio semanal</Text>
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
                width: `${Math.min(100, (avgHours / Math.max(targetHours, 1)) * 100)}%`,
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
      {weeklySessions.length > 0 && (
        <Card style={styles.weekSummaryCard}>
          <SectionHeader
            eyebrow="Protocolo 5:2"
            title="Días cumplidos"
            subtitle="Adherencia semanal a tus días de ayuno programados."
          />
          <Text style={styles.weekSummaryMeta}>
            {weeklySessions.filter((s) => s.status === 'completed').length}/{weeklySessions.length} días completados
          </Text>
          <View style={styles.weekDays}>
            {weeklySessions.slice(0, 7).map((day) => (
              <View key={day.id} style={styles.weekDayItem}>
                <Text style={styles.weekDayLabel}>
                  {new Date((day.scheduled_date ?? day.start_time ?? Date.now()) as string).toLocaleDateString('es-UY', { weekday: 'narrow' })}
                </Text>
                <View style={[
                  styles.weekDayDot,
                  {
                    backgroundColor:
                      day.status === 'completed' ? Colors.fasting :
                      day.status === 'missed' ? Colors.error :
                      day.status === 'active' ? Colors.warning :
                      day.status === 'planned' ? withOpacity(Colors.fasting, 0.3) :
                      Colors.bgElevated,
                  }
                ]} />
                {day.total_hours != null && (
                  <Text style={styles.weekDayHours}>{Number(day.total_hours).toFixed(0)}h</Text>
                )}
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* ─── Gráfico semanal ────────────────────────── */}
      {weeklyHours.length > 0 && (
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
      )}

      {/* ─── Tres ideas útiles ─────────────────────── */}
      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Lectura semanal"
          title="Tres ideas útiles"
          subtitle="Basadas en tus últimos 7 días de registro."
        />
        <View style={styles.insightsColumn}>
          {insights.map((insight) => (
            <InsightRow
              key={insight.text}
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
    backgroundColor: Colors.bgElevated,
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