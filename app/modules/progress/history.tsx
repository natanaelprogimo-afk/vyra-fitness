import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

function getWeakMetric(row: ScoreHistory | null) {
  if (!row) return null;
  const metrics = [
    { label: 'agua', value: Number(row.hydration_pct ?? 0) },
    { label: 'sueno', value: Number(row.sleep_pct ?? 0) },
    { label: 'actividad', value: Number(row.activity_pct ?? 0) },
    { label: 'nutricion', value: Number(row.nutrition_pct ?? 0) },
    { label: 'mental', value: Number(row.mental_pct ?? 0) },
  ];
  return [...metrics].sort((a, b) => a.value - b.value)[0] ?? null;
}

function getStrongMetric(row: ScoreHistory | null) {
  if (!row) return null;
  const metrics = [
    { label: 'agua', value: Number(row.hydration_pct ?? 0) },
    { label: 'sueno', value: Number(row.sleep_pct ?? 0) },
    { label: 'actividad', value: Number(row.activity_pct ?? 0) },
    { label: 'nutricion', value: Number(row.nutrition_pct ?? 0) },
    { label: 'mental', value: Number(row.mental_pct ?? 0) },
  ];
  return [...metrics].sort((a, b) => b.value - a.value)[0] ?? null;
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
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

export default function ProgressHistoryScreen() {
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
    qualityScoreStreak,
  } = useReadiness();
  const {
    currentTier,
    dailyChallenge,
    weeklyChallenges,
    monthlyChallenge,
    claimableCount,
    xpIntoLevel,
    xpToNextLevel,
    xpProgressPct,
    completedCount,
    claimedCount,
  } = useGamification();

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history],
  );
  const visibleHistory = sortedHistory.slice(-14);
  const recentWindow = sortedHistory.slice(-7);
  const previousWindow = sortedHistory.slice(-14, -7);
  const hasHistory = sortedHistory.length > 0;
  const latestRow = sortedHistory[sortedHistory.length - 1] ?? null;
  const bestRow = useMemo(
    () => [...sortedHistory].sort((a, b) => Number(b.total_score ?? 0) - Number(a.total_score ?? 0))[0] ?? null,
    [sortedHistory],
  );
  const recentAvg = averageScore(recentWindow);
  const previousAvg = averageScore(previousWindow);
  const scoreDelta = recentAvg !== null && previousAvg !== null ? recentAvg - previousAvg : null;
  const greenDays = recentWindow.filter((row) => Number(row.total_score ?? 0) >= 80).length;
  const solidDays = recentWindow.filter((row) => Number(row.total_score ?? 0) >= 60).length;
  const coachName = profile?.coach_name_preference ?? 'Vyra';
  const focusAction = focusActions[0] ?? null;
  const daysSinceLastScore = getDaysSince(latestRow?.date ?? null);
  const dayScore = dailyScore?.score != null ? Math.round(dailyScore.score) : recentAvg;
  const dayScoreAccent = dayScore !== null ? scoreColor(dayScore) : Colors.brand;
  const scoreVsWeek = dayScore !== null && weeklyAverage !== null ? Math.round(dayScore - weeklyAverage) : scoreDelta;
  const returnMode = !hasHistory
    ? 'Construir'
    : daysSinceLastScore !== null && daysSinceLastScore >= 2
      ? 'Volver'
      : claimableCount > 0
        ? 'Cobrar'
        : scoreDelta !== null && scoreDelta <= -4
          ? 'Corregir'
          : qualityScoreStreak >= 3 || greenDays >= 4
            ? 'Consolidar'
            : 'Empujar';
  const coachTitle = !hasHistory
    ? `${coachName} quiere una base de progreso antes de leer patrones fuertes.`
    : daysSinceLastScore !== null && daysSinceLastScore >= 2
      ? `${coachName} quiere volver a medir antes de sacar conclusiones de la semana.`
      : claimableCount > 0
        ? `${coachName} detecta recompensas vivas y quiere cerrar el loop.`
        : scoreDelta !== null && scoreDelta <= -4
          ? `${coachName} ve una semana enfriandose y quiere corregirla sin drama.`
          : qualityScoreStreak >= 3 || greenDays >= 4
            ? `${coachName} ve una base estable y quiere consolidarla.`
            : `${coachName} ve margen para empujar el siguiente hito.`;
  const coachBody =
    similarDayComparison?.message ??
    morningNarrative ??
    (!hasHistory
      ? 'Tu historial de progreso gana valor cuando deja de mostrar solo numeritos y empieza a marcar si hoy toca construir base o cerrar una accion util.'
      : `Tu ventana visible junta ${visibleHistory.length} dias y ${solidDays} jornadas solidas esta semana. Eso ya alcanza para decidir si toca consolidar, corregir o empujar.`);
  const coachHint = focusAction
    ? `Siguiente lectura util: ${focusAction.title}.`
    : !hasHistory
      ? 'Todavia no hay base suficiente. Entra a progreso y cierra tu primer dia con una accion pequena.'
      : daysSinceLastScore !== null && daysSinceLastScore >= 2
        ? `Ya pasaron ${daysSinceLastScore} dias desde la ultima lectura. Volver hoy limpia mucho la comparativa.`
        : claimableCount > 0
          ? 'Si ya hay recompensa viva, reclamarla primero le da cierre al dia.'
          : scoreDelta !== null && scoreDelta <= -4
            ? 'Si la semana se enfriaba, resumen y coach suelen corregir mejor que perseguir mas metricas.'
            : 'Si la base sigue solida, coach y retos te ayudan a convertir progreso en direccion.';
  const routeActionTitle = !hasHistory
    ? 'Construir la base del historial'
    : daysSinceLastScore !== null && daysSinceLastScore >= 2
      ? 'Volver a medir antes de comparar'
      : claimableCount > 0
        ? 'Cerrar el loop de recompensas'
        : scoreDelta !== null && scoreDelta <= -4
          ? 'Corregir la semana'
          : qualityScoreStreak >= 3 || greenDays >= 4
            ? 'Consolidar el ritmo'
            : 'Empujar el siguiente hito';
  const primaryActionLabel = !hasHistory || (daysSinceLastScore !== null && daysSinceLastScore >= 2)
    ? 'Abrir progreso'
    : claimableCount > 0
      ? 'Abrir retos'
      : focusAction
        ? 'Seguir foco'
        : scoreDelta !== null && scoreDelta <= -4
          ? 'Abrir resumen'
          : 'Abrir coach';
  const weeklyChallengeProgress = weeklyChallenges.length
    ? Math.round(weeklyChallenges.reduce((sum, challenge) => sum + Math.min(100, Math.round((challenge.progress / Math.max(1, challenge.target)) * 100)), 0) / weeklyChallenges.length)
    : 0;
  const bestMetric = getStrongMetric(bestRow);
  const weakMetric = getWeakMetric(latestRow);

  const handlePrimaryAction = () => {
    if (!hasHistory || (daysSinceLastScore !== null && daysSinceLastScore >= 2)) {
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
    router.push((scoreDelta !== null && scoreDelta <= -4 ? Routes.dailySummary : Routes.coach.index) as any);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header
          eyebrow="Historial"
          title="Progreso con memoria real"
          subtitle="Lee si tu semana se esta consolidando, se enfrio o necesita una correccion corta."
          color={Colors.brand}
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
              hint={claimableCount > 0 ? `${claimableCount} reward` : `${qualityScoreStreak} dias fuertes`}
              accent={claimableCount > 0 ? Colors.coins : Colors.brand}
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
            <Button onPress={() => router.push(Routes.progress.insights as any)} label="Abrir insights" size="sm" variant="secondary" color={Colors.coach} />
            <Button onPress={() => router.push(Routes.coach.index as any)} label="Abrir coach" size="sm" variant="secondary" color={Colors.coach} />
            <Button onPress={() => router.push(Routes.dailySummary as any)} label="Abrir resumen" size="sm" variant="ghost" color={Colors.coach} />
          </View>
        </Card>
        <Card style={styles.heroCard} accentColor={Colors.brand}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Ruta del progreso</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>Tu historial ya empieza a decir que conviene hacer hoy.</Text>
              <Text style={styles.heroBody} numberOfLines={2}>
                Nivel {currentTier.name} · {profile?.streak ?? profile?.current_streak ?? 0} dias de racha · {hasHistory ? `${sortedHistory.length} lecturas` : 'sin base aun'}
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeValue}>{dayScore ?? '--'}</Text>
              <Text style={styles.heroBadgeLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Mejor dia</Text>
              <Text style={styles.heroStatValue}>{bestRow ? `${Math.round(Number(bestRow.total_score ?? 0))}` : '--'}</Text>
              <Text style={styles.heroStatHint}>{bestRow ? formatShortDate(bestRow.date) : 'sin base'}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Tier</Text>
              <Text style={styles.heroStatValue}>{currentTier.glyph}</Text>
              <Text style={styles.heroStatHint}>{currentTier.name}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Semana</Text>
              <Text style={[styles.heroStatValue, { color: scoreDelta !== null && scoreDelta < 0 ? Colors.warning : Colors.success }]}>
                {scoreDelta !== null ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta}` : '--'}
              </Text>
              <Text style={styles.heroStatHint}>{scoreDelta !== null ? 'vs anterior' : 'sin comparativa'}</Text>
            </View>
          </View>

          <ProgressBar
            value={xpProgressPct}
            color={Colors.coins}
            label={`XP ${xpIntoLevel}/${xpToNextLevel}`}
            showPct
            style={styles.heroProgress}
          />
        </Card>

        <SectionHeader title="Ritmo del score" hint="Ultimos 14 dias visibles" />
        <Card style={styles.chartCard} accentColor={Colors.brand}>
          {!hasHistory ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Todavia no hay memoria suficiente.</Text>
              <Text style={styles.emptyBody}>
                Cuando el score empiece a guardar dias, aca vas a leer comparativas, consolidacion y semanas que necesiten correccion.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.chartRow}>
                {visibleHistory.map((row) => {
                  const score = Math.round(Number(row.total_score ?? 0));
                  const barColor = scoreColor(score);
                  return (
                    <View key={row.date} style={styles.chartCol}>
                      <Text style={styles.chartValue}>{score}</Text>
                      <View style={styles.chartTrack}>
                        <View
                          style={[
                            styles.chartBar,
                            {
                              height: 18 + Math.max(0, Math.min(82, score)),
                              backgroundColor: withOpacity(barColor, 0.92),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.chartLabel}>{formatShortDate(row.date)}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.chartMetaRow}>
                <View style={styles.chartMetaPill}>
                  <Ionicons name="trending-up-outline" size={14} color={Colors.success} />
                  <Text style={styles.chartMetaText}>{greenDays}/7 dias en verde</Text>
                </View>
                <View style={styles.chartMetaPill}>
                  <Ionicons name="repeat-outline" size={14} color={Colors.brand} />
                  <Text style={styles.chartMetaText}>{qualityScoreStreak} dias fuertes</Text>
                </View>
                <View style={styles.chartMetaPill}>
                  <Ionicons name="pulse-outline" size={14} color={Colors.warning} />
                  <Text style={styles.chartMetaText}>{monthlyAverage !== null ? `mes ${monthlyAverage}` : 'sin mes'}</Text>
                </View>
              </View>
            </>
          )}
        </Card>

        <SectionHeader title="Ruta de recompensas" hint="Lo que ya sostiene o enfria tu progreso" />
        <Card style={styles.rewardCard} accentColor={Colors.coins}>
          <View style={styles.rewardRow}>
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardTitle}>Mision diaria</Text>
              <Text style={styles.rewardBody}>
                {dailyChallenge.completed
                  ? `Lista para cobrar${dailyChallenge.claimed ? ', ya reclamada' : ''}.`
                  : `${dailyChallenge.progress}/${dailyChallenge.target} habitos activos hoy.`}
              </Text>
            </View>
            <Text style={styles.rewardValue}>{Math.min(100, Math.round((dailyChallenge.progress / Math.max(1, dailyChallenge.target)) * 100))}%</Text>
          </View>
          <ProgressBar value={Math.min(100, Math.round((dailyChallenge.progress / Math.max(1, dailyChallenge.target)) * 100))} color={Colors.coins} />

          <View style={styles.rewardDivider} />

          <View style={styles.rewardRow}>
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardTitle}>Semana viva</Text>
              <Text style={styles.rewardBody}>
                {weeklyChallenges.filter((item) => item.completed).length}/{weeklyChallenges.length} desafios completos · {completedCount} completos · {claimedCount} cobrados
              </Text>
            </View>
            <Text style={styles.rewardValue}>{weeklyChallengeProgress}%</Text>
          </View>
          <ProgressBar value={weeklyChallengeProgress} color={Colors.brand} />

          <View style={styles.rewardDivider} />

          <View style={styles.rewardRow}>
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardTitle}>Ruta mensual</Text>
              <Text style={styles.rewardBody}>
                {monthlyChallenge.title} · {monthlyChallenge.progress}/{monthlyChallenge.target} {monthlyChallenge.unit}
              </Text>
            </View>
            <Text style={styles.rewardValue}>{Math.min(100, Math.round((monthlyChallenge.progress / Math.max(1, monthlyChallenge.target)) * 100))}%</Text>
          </View>
          <ProgressBar
            value={Math.min(100, Math.round((monthlyChallenge.progress / Math.max(1, monthlyChallenge.target)) * 100))}
            color={Colors.coach}
          />
        </Card>

        <SectionHeader title="Lectura de la semana" hint="Que se sostuvo y que pide correccion" />
        <View style={styles.insightGrid}>
          <Card style={styles.insightCard} accentColor={Colors.brand}>
            <Text style={styles.insightLabel}>Promedio 7d</Text>
            <Text style={styles.insightValue}>{recentAvg !== null ? recentAvg : '--'}</Text>
            <Text style={styles.insightHint}>{weeklyAverage !== null ? `vs semanal ${weeklyAverage}` : 'sin base'}</Text>
          </Card>
          <Card style={styles.insightCard} accentColor={scoreDelta !== null && scoreDelta < 0 ? Colors.warning : Colors.success}>
            <Text style={styles.insightLabel}>Delta</Text>
            <Text style={styles.insightValue}>{scoreDelta !== null ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta}` : '--'}</Text>
            <Text style={styles.insightHint}>{scoreDelta !== null ? 'vs 7 dias previos' : 'sin comparativa'}</Text>
          </Card>
          <Card style={styles.insightCard} accentColor={Colors.coins}>
            <Text style={styles.insightLabel}>Base solida</Text>
            <Text style={styles.insightValue}>{solidDays}/7</Text>
            <Text style={styles.insightHint}>dias arriba de 60</Text>
          </Card>
        </View>

        <SectionHeader title="Linea reciente" hint="Los ultimos dias que ya estan empujando el relato" />
        <View style={styles.timeline}>
          {(hasHistory ? [...visibleHistory].reverse().slice(0, 6) : []).map((row) => {
            const rowScore = Math.round(Number(row.total_score ?? 0));
            const weak = getWeakMetric(row);
            const strong = getStrongMetric(row);
            return (
              <Card key={row.date} style={styles.timelineCard} accentColor={scoreColor(rowScore)}>
                <View style={styles.timelineTop}>
                  <View>
                    <Text style={styles.timelineDate}>{formatShortDate(row.date)}</Text>
                    <Text style={styles.timelineTitle}>Score {rowScore}</Text>
                  </View>
                  <View style={[styles.scoreBadge, { borderColor: withOpacity(scoreColor(rowScore), 0.32), backgroundColor: withOpacity(scoreColor(rowScore), 0.12) }]}>
                    <Text style={[styles.scoreBadgeText, { color: scoreColor(rowScore) }]}>
                      {rowScore >= 80 ? 'Verde' : rowScore >= 60 ? 'Solido' : 'Ajuste'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.timelineBody}>
                  {strong ? `Lo mejor vino por ${strong.label} (${strong.value}). ` : ''}
                  {weak ? `Lo que mas tiraba hacia abajo fue ${weak.label} (${weak.value}).` : 'Todavia sin lectura suficiente.'}
                </Text>
              </Card>
            );
          })}
        </View>

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
  sectionHeader: {
    marginTop: Spacing[2],
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
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
  heroStatsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  heroStat: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    backgroundColor: withOpacity(Colors.surface3, 0.92),
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 6,
  },
  heroStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroStatHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  heroProgress: {
    marginTop: 2,
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
  chartCard: {
    gap: Spacing[4],
  },
  emptyState: {
    gap: Spacing[2],
  },
  emptyTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chartTrack: {
    width: '100%',
    minHeight: 112,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 2,
    borderRadius: Radius.lg,
    backgroundColor: withOpacity(Colors.surface3, 0.8),
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  chartBar: {
    width: '68%',
    borderRadius: Radius.md,
  },
  chartLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textMuted,
  },
  chartMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chartMetaPill: {
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
  chartMetaText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  rewardCard: {
    gap: Spacing[3],
  },
  rewardRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  rewardCopy: {
    flex: 1,
    gap: 4,
  },
  rewardTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  rewardBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  rewardValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.coins,
  },
  rewardDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  insightGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  insightCard: {
    flex: 1,
    gap: 6,
  },
  insightLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  insightValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  insightHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  timeline: {
    gap: Spacing[3],
  },
  timelineCard: {
    gap: Spacing[3],
  },
  timelineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  timelineDate: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timelineTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  timelineBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  scoreBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  scoreBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
});
