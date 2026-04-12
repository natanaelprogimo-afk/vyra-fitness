import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import HistoryAdBanner from '@/components/ui/HistoryAdBanner';
import { useReadiness, type ScoreHistory } from '@/hooks/useReadiness';
import { useGamification } from '@/hooks/useGamification';
import { useAuthStore } from '@/stores/authStore';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';

function formatShortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: 'short',
  });
}

function averageValue(rows: ScoreHistory[], key: keyof ScoreHistory) {
  if (!rows.length) return null;
  return Math.round(rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0) / rows.length);
}

function averageScore(rows: ScoreHistory[]) {
  if (!rows.length) return null;
  return Math.round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / rows.length);
}

function getDaysSince(date: string | null) {
  if (!date) return null;
  const base = new Date(`${date}T12:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - base.getTime()) / (1000 * 60 * 60 * 24)));
}

function InsightRow({
  icon,
  title,
  body,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <View style={styles.insightRow}>
      <View style={[styles.insightIconWrap, { backgroundColor: withOpacity(accent, 0.14), borderColor: withOpacity(accent, 0.28) }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <View style={styles.insightCopy}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightBody}>{body}</Text>
      </View>
    </View>
  );
}

function RouteStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <View style={styles.routeStat}>
      <Text style={styles.routeStatLabel}>{label}</Text>
      <Text style={[styles.routeStatValue, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.routeStatHint}>{hint}</Text>
    </View>
  );
}

function SignalBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | null;
  accent: string;
}) {
  const safeValue = value ?? 0;
  return (
    <View style={styles.signalItem}>
      <View style={styles.signalHeader}>
        <Text style={styles.signalLabel}>{label}</Text>
        <Text style={[styles.signalValue, { color: accent }]}>{value !== null ? `${safeValue}` : '--'}</Text>
      </View>
      <ProgressBar value={safeValue} color={accent} />
    </View>
  );
}

export default function ProgressInsightsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const {
    dailyScore,
    history,
    predictedScore,
    weeklyAverage,
    monthlyAverage,
    scoreColor,
    similarDayComparison,
    focusActions,
    morningNarrative,
    crossModuleInsights,
    qualityScoreStreak,
  } = useReadiness();
  const {
    dailyChallenge,
    weeklyChallenges,
    monthlyChallenge,
    claimableCount,
    currentTier,
  } = useGamification();

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history],
  );
  const recentWindow = sortedHistory.slice(-7);
  const previousWindow = sortedHistory.slice(-14, -7);
  const hasHistory = sortedHistory.length > 0;
  const latestRow = sortedHistory[sortedHistory.length - 1] ?? null;
  const recentAvgScore = averageScore(recentWindow);
  const previousAvgScore = averageScore(previousWindow);
  const hydrationAvg = averageValue(recentWindow, 'hydration_pct');
  const activityAvg = averageValue(recentWindow, 'activity_pct');
  const sleepAvg = averageValue(recentWindow, 'sleep_pct');
  const nutritionAvg = averageValue(recentWindow, 'nutrition_pct');
  const mentalAvg = averageValue(recentWindow, 'mental_pct');
  const daysSinceLast = getDaysSince(latestRow?.date ?? null);
  const coachName = profile?.coach_name_preference ?? 'Vyra';
  const focusAction = focusActions[0] ?? null;
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : recentAvgScore;
  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.brand;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : recentAvgScore !== null && previousAvgScore !== null ? recentAvgScore - previousAvgScore : null;
  const returnMode = !hasHistory
    ? 'Construir'
    : claimableCount > 0
      ? 'Cobrar'
      : daysSinceLast !== null && daysSinceLast >= 2
        ? 'Volver'
        : scoreVsWeek !== null && scoreVsWeek <= -4
          ? 'Corregir'
          : qualityScoreStreak >= 3
            ? 'Sostener'
            : 'Comparar';
  const weeklyChallengeProgress = weeklyChallenges.length
    ? Math.round(weeklyChallenges.reduce((sum, challenge) => sum + Math.min(100, Math.round((challenge.progress / Math.max(1, challenge.target)) * 100)), 0) / weeklyChallenges.length)
    : 0;
  const strongestSignal = useMemo(() => {
    const metrics = [
      { label: 'agua', value: hydrationAvg ?? 0 },
      { label: 'actividad', value: activityAvg ?? 0 },
      { label: 'sueno', value: sleepAvg ?? 0 },
      { label: 'nutricion', value: nutritionAvg ?? 0 },
      { label: 'mental', value: mentalAvg ?? 0 },
    ];
    return [...metrics].sort((a, b) => b.value - a.value)[0] ?? null;
  }, [activityAvg, hydrationAvg, mentalAvg, nutritionAvg, sleepAvg]);
  const weakestSignal = useMemo(() => {
    const metrics = [
      { label: 'agua', value: hydrationAvg ?? 100 },
      { label: 'actividad', value: activityAvg ?? 100 },
      { label: 'sueno', value: sleepAvg ?? 100 },
      { label: 'nutricion', value: nutritionAvg ?? 100 },
      { label: 'mental', value: mentalAvg ?? 100 },
    ];
    return [...metrics].sort((a, b) => a.value - b.value)[0] ?? null;
  }, [activityAvg, hydrationAvg, mentalAvg, nutritionAvg, sleepAvg]);
  const coachTitle = !hasHistory
    ? `${coachName} quiere una base antes de leer correlaciones fuertes.`
    : claimableCount > 0
      ? `${coachName} detecta un loop listo para cobrar antes de seguir analizando.`
      : daysSinceLast !== null && daysSinceLast >= 2
        ? `${coachName} quiere volver a medir antes de tomar decisiones largas.`
        : scoreVsWeek !== null && scoreVsWeek <= -4
          ? `${coachName} ve una semana enfriandose y quiere corregir la palanca correcta.`
          : qualityScoreStreak >= 3
            ? `${coachName} ve consistencia y quiere sostener lo que ya esta funcionando.`
            : `${coachName} quiere comparar con calma para decidir que empujar hoy.`;
  const coachBody =
    similarDayComparison?.message ??
    morningNarrative ??
    (!hasHistory
      ? 'Insights gana valor cuando deja de ser decoracion. Unos pocos dias ya alcanzan para separar ruido de una tendencia util.'
      : 'Esta pantalla ya no solo muestra correlaciones: ahora intenta decirte que palanca conviene tocar hoy para proteger o empujar el score.');
  const coachHint = focusAction
    ? `Siguiente lectura util: ${focusAction.title}.`
    : !hasHistory
      ? 'Tu primer bloque de progreso va a convertir estas correlaciones en decisiones mucho mas utiles.'
      : claimableCount > 0
        ? 'Si ya hay recompensa viva, cobrarla primero suele cerrar mejor el dia.'
        : daysSinceLast !== null && daysSinceLast >= 2
          ? `Hace ${daysSinceLast} dias que no aparece una lectura nueva. Volver hoy limpia mucho la comparativa.`
          : scoreVsWeek !== null && scoreVsWeek <= -4
            ? 'Si el score cae, resumen y coach suelen corregir mejor que perseguir mas indicadores.'
            : 'Si el bloque sigue estable, sostener la palanca fuerte vale mas que inventar correcciones.';
  const routeActionTitle = !hasHistory
    ? 'Construir una primera lectura'
    : claimableCount > 0
      ? 'Cerrar el loop antes de sobreanalizar'
      : daysSinceLast !== null && daysSinceLast >= 2
        ? 'Volver a medir primero'
        : scoreVsWeek !== null && scoreVsWeek <= -4
          ? 'Corregir la palanca mas floja'
          : qualityScoreStreak >= 3
            ? 'Sostener la palanca fuerte'
            : 'Comparar sin perder direccion';
  const primaryActionLabel = !hasHistory || (daysSinceLast !== null && daysSinceLast >= 2)
    ? 'Abrir progreso'
    : claimableCount > 0
      ? 'Abrir retos'
      : focusAction
        ? 'Seguir foco'
        : scoreVsWeek !== null && scoreVsWeek <= -4
          ? 'Abrir resumen'
          : 'Abrir coach';

  const handlePrimaryAction = () => {
    if (!hasHistory || (daysSinceLast !== null && daysSinceLast >= 2)) {
      router.push(Routes.progress.index as any);
      return;
    }
    if (claimableCount > 0) {
      router.push(Routes.gamification.challenges as any);
      return;
    }
    if (focusAction) {
      router.push(focusAction.route as any);
      return;
    }
    router.push((scoreVsWeek !== null && scoreVsWeek <= -4 ? Routes.dailySummary : Routes.coach.index) as any);
  };

  const insightBullets = crossModuleInsights.length
    ? crossModuleInsights
    : [
        !hasHistory
          ? 'Todavia no hay suficiente base para detectar correlaciones fuertes.'
          : strongestSignal && weakestSignal
            ? `Tu señal mas estable en la ultima semana fue ${strongestSignal.label}, y la que mas pide atencion fue ${weakestSignal.label}.`
            : 'Tus proximos dias van a darle a Vyra una lectura mas clara de que esta sosteniendo el score.',
        monthlyAverage !== null && weeklyAverage !== null
          ? `Tu promedio mensual va en ${monthlyAverage}, y la semana actual se mueve en ${weeklyAverage}.`
          : 'A medida que el historial crezca, vas a ver cruces mas utiles entre semanas y mes.',
      ];

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header
          eyebrow="Insights"
          title="Progreso con lectura util"
          subtitle="Correlaciones, palancas y decisiones para no quedarte solo mirando metricas."
          color={Colors.brand}
          rightElement={(
            <Pressable
              style={[styles.headerIconButton, { borderColor: withOpacity(Colors.brand, 0.24) }]}
              onPress={() => router.push(Routes.progress.history as any)}
            >
              <Ionicons name="time-outline" size={18} color={Colors.textPrimary} />
            </Pressable>
          )}
        />

        <Card style={styles.routeCard} accentColor={Colors.coach}>
          <Text style={styles.routeEyebrow}>Coach contextual</Text>
          <Text style={styles.routeTitle}>{coachTitle}</Text>
          <Text style={styles.routeBody} numberOfLines={3}>{coachBody}</Text>

          <View style={styles.routeStatsRow}>
            <RouteStat
              label="Score"
              value={dayScore !== null ? `${dayScore}` : '--'}
              hint={predictedScore !== null ? `cierre ${predictedScore}` : 'sin cierre'}
              accent={dayScoreAccent}
            />
            <RouteStat
              label="Retorno"
              value={returnMode}
              hint={claimableCount > 0 ? `${claimableCount} reward` : `${qualityScoreStreak} dias`}
              accent={claimableCount > 0 ? Colors.coins : Colors.coach}
            />
            <RouteStat
              label="Ritmo"
              value={scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek}` : '--'}
              hint={weeklyAverage !== null ? `vs ${weeklyAverage}` : 'sin semana'}
              accent={scoreVsWeek !== null && scoreVsWeek < 0 ? Colors.warning : Colors.success}
            />
          </View>

          <View style={styles.routeActionRow}>
            <View style={styles.routeActionCopy}>
              <Text style={styles.routeActionLabel}>Siguiente lectura</Text>
              <Text style={styles.routeActionTitle}>{routeActionTitle}</Text>
              <Text style={styles.routeActionHint} numberOfLines={3}>{coachHint}</Text>
            </View>
          </View>

          <View style={styles.routeButtons}>
            <Button onPress={handlePrimaryAction} label={primaryActionLabel} size="sm" color={Colors.coach} />
            <Button onPress={() => router.push(Routes.progress.history as any)} label="Abrir historial" size="sm" variant="secondary" color={Colors.coach} />
            <Button onPress={() => router.push(Routes.coach.index as any)} label="Abrir coach" size="sm" variant="ghost" color={Colors.coach} />
            <Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />
          </View>
        </Card>
        <Card style={styles.heroCard} accentColor={Colors.brand}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Radar de patrones</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>Tus cruces ya pueden empujar una decision mejor.</Text>
              <Text style={styles.heroBody} numberOfLines={2}>
                Tier {currentTier.name} · {qualityScoreStreak} dias fuertes · {hasHistory ? `${sortedHistory.length} lecturas` : 'sin base'}
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeValue}>{dayScore ?? '--'}</Text>
              <Text style={styles.heroBadgeLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroPill}>
              <Ionicons name="git-compare-outline" size={14} color={Colors.brand} />
              <Text style={styles.heroPillText}>{scoreVsWeek !== null ? `${scoreVsWeek > 0 ? '+' : ''}${scoreVsWeek} vs semana` : 'sin comparativa'}</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="sparkles-outline" size={14} color={Colors.coins} />
              <Text style={styles.heroPillText}>{claimableCount > 0 ? `${claimableCount} reward` : 'sin rewards vivas'}</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="trophy-outline" size={14} color={Colors.success} />
              <Text style={styles.heroPillText}>{qualityScoreStreak} dias fuertes</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.signalCard} accentColor={Colors.brand}>
          <Text style={styles.sectionTitle}>Palancas del score</Text>
          <Text style={styles.sectionHint}>Promedio visible de los ultimos 7 dias</Text>
          <View style={styles.signalList}>
            <SignalBar label="Agua" value={hydrationAvg} accent={Colors.water} />
            <SignalBar label="Actividad" value={activityAvg} accent={Colors.steps} />
            <SignalBar label="Sueno" value={sleepAvg} accent={Colors.sleep} />
            <SignalBar label="Nutricion" value={nutritionAvg} accent={Colors.nutrition} />
            <SignalBar label="Mental" value={mentalAvg} accent={Colors.mental} />
          </View>
        </Card>

        <Card style={styles.insightsCard} accentColor={Colors.premium}>
          <Text style={styles.sectionTitle}>Cruces utiles</Text>
          <Text style={styles.sectionHint}>Lecturas que ya valen mas que una grafica sola</Text>
          <View style={styles.insightList}>
            {insightBullets.map((insight, index) => (
              <InsightRow
                key={`${index}-${insight}`}
                icon={index === 0 ? 'shuffle-outline' : index === 1 ? 'pulse-outline' : 'sparkles-outline'}
                title={index === 0 ? 'Cruce principal' : index === 1 ? 'Comparativa' : 'Lectura adicional'}
                body={insight}
                accent={index === 0 ? Colors.brand : index === 1 ? Colors.steps : Colors.coach}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.loopCard} accentColor={Colors.coins}>
          <Text style={styles.sectionTitle}>Loop del progreso</Text>
          <Text style={styles.sectionHint}>Lo que conviene cerrar antes de seguir empujando</Text>

          <View style={styles.loopRow}>
            <View style={styles.loopCopy}>
              <Text style={styles.loopLabel}>Mision diaria</Text>
              <Text style={styles.loopBody}>
                {dailyChallenge.progress}/{dailyChallenge.target} habitos · {dailyChallenge.completed ? 'lista para cerrar' : 'todavia abierta'}
              </Text>
            </View>
            <Text style={styles.loopValue}>{Math.min(100, Math.round((dailyChallenge.progress / Math.max(1, dailyChallenge.target)) * 100))}%</Text>
          </View>
          <ProgressBar value={Math.min(100, Math.round((dailyChallenge.progress / Math.max(1, dailyChallenge.target)) * 100))} color={Colors.coins} />

          <View style={styles.loopDivider} />

          <View style={styles.loopRow}>
            <View style={styles.loopCopy}>
              <Text style={styles.loopLabel}>Desafios semanales</Text>
              <Text style={styles.loopBody}>
                {weeklyChallenges.filter((item) => item.completed).length}/{weeklyChallenges.length} completos
              </Text>
            </View>
            <Text style={styles.loopValue}>{weeklyChallengeProgress}%</Text>
          </View>
          <ProgressBar value={weeklyChallengeProgress} color={Colors.brand} />

          <View style={styles.loopDivider} />

          <View style={styles.loopRow}>
            <View style={styles.loopCopy}>
              <Text style={styles.loopLabel}>Meta mensual</Text>
              <Text style={styles.loopBody}>
                {monthlyChallenge.title} · {monthlyChallenge.progress}/{monthlyChallenge.target} {monthlyChallenge.unit}
              </Text>
            </View>
            <Text style={styles.loopValue}>{Math.min(100, Math.round((monthlyChallenge.progress / Math.max(1, monthlyChallenge.target)) * 100))}%</Text>
          </View>
          <ProgressBar value={Math.min(100, Math.round((monthlyChallenge.progress / Math.max(1, monthlyChallenge.target)) * 100))} color={Colors.coach} />
        </Card>

        <Card style={styles.compareCard} accentColor={Colors.success}>
          <Text style={styles.sectionTitle}>Ventana comparada</Text>
          <Text style={styles.sectionHint}>Como se mueve el bloque frente a la semana previa</Text>
          <View style={styles.compareGrid}>
            <View style={styles.compareCell}>
              <Text style={styles.compareLabel}>Ultimos 7</Text>
              <Text style={styles.compareValue}>{recentAvgScore !== null ? recentAvgScore : '--'}</Text>
              <Text style={styles.compareHint}>promedio</Text>
            </View>
            <View style={styles.compareCell}>
              <Text style={styles.compareLabel}>7 previos</Text>
              <Text style={styles.compareValue}>{previousAvgScore !== null ? previousAvgScore : '--'}</Text>
              <Text style={styles.compareHint}>referencia</Text>
            </View>
            <View style={styles.compareCell}>
              <Text style={styles.compareLabel}>Palanca fuerte</Text>
              <Text style={styles.compareValue}>{strongestSignal?.label ?? '--'}</Text>
              <Text style={styles.compareHint}>{strongestSignal ? `${strongestSignal.value}` : 'sin base'}</Text>
            </View>
            <View style={styles.compareCell}>
              <Text style={styles.compareLabel}>Palanca floja</Text>
              <Text style={styles.compareValue}>{weakestSignal?.label ?? '--'}</Text>
              <Text style={styles.compareHint}>{weakestSignal ? `${weakestSignal.value}` : 'sin base'}</Text>
            </View>
          </View>
          <Text style={styles.compareNarrative}>
            {scoreVsWeek !== null
              ? scoreVsWeek < 0
                ? 'La semana actual viene por debajo de la referencia. Hoy conviene corregir la palanca mas floja antes de querer empujar mas.'
                : 'La semana actual sostiene o mejora la referencia. Hoy conviene consolidar sin meter ruido.'
              : 'A medida que aparezcan mas dias, esta comparativa te va a decir con mas claridad si hoy toca sostener o corregir.'}
          </Text>
        </Card>

        <HistoryAdBanner />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.surface2, 0.94),
    borderWidth: 1,
  },
  heroCard: {
    gap: Spacing[4],
  },
  heroTop: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroBadge: {
    minWidth: 84,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: withOpacity(Colors.brand, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.28),
    alignItems: 'center',
    gap: 4,
  },
  heroBadgeValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.brand,
  },
  heroBadgeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: withOpacity(Colors.surface3, 0.92),
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  heroPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routeCard: {
    gap: Spacing[4],
  },
  routeEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.coach,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  routeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  routeBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  routeStatsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  routeStat: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.surface3, 0.88),
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 4,
  },
  routeStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  routeStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  routeStatHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routeActionRow: {
    borderRadius: Radius.lg,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.coach, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(Colors.coach, 0.24),
  },
  routeActionCopy: {
    gap: 4,
  },
  routeActionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.coach,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  routeActionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  routeActionHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  routeButtons: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionHint: {
    marginTop: 4,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  signalCard: {
    gap: Spacing[3],
  },
  signalList: {
    gap: Spacing[3],
  },
  signalItem: {
    gap: 8,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  signalLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  signalValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  insightsCard: {
    gap: Spacing[3],
  },
  insightList: {
    gap: Spacing[3],
  },
  insightRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  insightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  insightBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  loopCard: {
    gap: Spacing[3],
  },
  loopRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  loopCopy: {
    flex: 1,
    gap: 4,
  },
  loopLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  loopBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  loopValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.coins,
  },
  loopDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  compareCard: {
    gap: Spacing[3],
  },
  compareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  compareCell: {
    width: '47%',
    borderRadius: Radius.lg,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.surface3, 0.92),
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 6,
  },
  compareLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  compareValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  compareHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  compareNarrative: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
