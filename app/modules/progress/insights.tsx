// REDESIGNED: 2026-05-21 - progress insights now feel like a real weekly reading
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import ProgressCircle from '@/components/charts/ProgressCircle';
import MiniSparkline from '@/components/progress/MiniSparkline';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing, TextLeading } from '@/constants/theme';
import { useReadiness } from '@/hooks/useReadiness';
import { visibleProgressPercent } from '@/lib/visual-progress';

type InsightTone = 'success' | 'warning' | 'info';

function averageScore(rows: Array<{ total_score?: number | null }>) {
  if (!rows.length) return null;
  return Math.round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / rows.length);
}

function getToneColor(tone: InsightTone) {
  if (tone === 'success') return Colors.success;
  if (tone === 'warning') return Colors.warning;
  return Colors.info;
}

function getToneIcon(tone: InsightTone) {
  if (tone === 'success') return 'trophy-outline';
  if (tone === 'warning') return 'alert-circle-outline';
  return 'bulb-outline';
}

export default function ProgressInsightsScreen() {
  const extendedUnlocked = true;
  const {
    dailyScore,
    history,
    similarDayComparison,
    focusActions,
    morningNarrative,
    crossModuleInsights,
    scoreColor,
    scoreLabel,
  } = useReadiness();

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history],
  );
  const recentWindow = sortedHistory.slice(-7);
  const previousWindow = sortedHistory.slice(-14, -7);
  const recentAvgScore = averageScore(recentWindow);
  const previousAvgScore = averageScore(previousWindow);
  const trendDelta = recentAvgScore !== null && previousAvgScore !== null ? recentAvgScore - previousAvgScore : null;
  const currentScore = Math.round(Number(dailyScore?.score ?? recentWindow[recentWindow.length - 1]?.total_score ?? 0));
  const heroColor = scoreColor(currentScore);
  const heroLabel = currentScore > 0 ? scoreLabel(currentScore) : 'Sigue registrando para tener una lectura fuerte';

  const factorBars = dailyScore?.breakdown
    ? (Object.entries(dailyScore.breakdown) as Array<[string, number]>).slice(0, 5)
    : [];
  const strongestFactor = [...factorBars].sort((a, b) => b[1] - a[1])[0] ?? null;
  const weakestFactor = [...factorBars].sort((a, b) => a[1] - b[1])[0] ?? null;
  const factorSeries = factorBars.map(([, value]) => value);

  const editorialCards = useMemo(() => {
    const cards: Array<{ title: string; body: string; action: string; tone: InsightTone }> = [];

    if (crossModuleInsights[0]) {
      cards.push({
        title: 'Hallazgo principal',
        body: crossModuleInsights[0],
        action: 'Convierte esta senal en una decision simple para la proxima semana.',
        tone: trendDelta !== null && trendDelta >= 0 ? 'success' : 'info',
      });
    }

    if (similarDayComparison?.message) {
      cards.push({
        title: 'Comparado con dias parecidos',
        body: similarDayComparison.message,
        action: 'No mires solo hoy: mira el patron que ya se esta repitiendo.',
        tone: 'info',
      });
    }

    if (focusActions[0]) {
      cards.push({
        title: 'Siguiente mejor accion',
        body: `Entre todo lo que podrias tocar, ${focusActions[0].title.toLowerCase()} sigue siendo la palanca mas clara.`,
        action: 'Haz eso primero y vuelve despues a revisar la lectura.',
        tone: weakestFactor && weakestFactor[1] < 55 ? 'warning' : 'success',
      });
    } else if (morningNarrative) {
      cards.push({
        title: 'Panorama del bloque',
        body: morningNarrative,
        action: 'Tomalo como contexto, no como presion extra.',
        tone: 'info',
      });
    }

    return cards.slice(0, 3);
  }, [crossModuleInsights, focusActions, morningNarrative, similarDayComparison?.message, trendDelta, weakestFactor]);

  const canOfferExtended = editorialCards.length > 0 || recentWindow.length >= 4 || factorBars.length >= 3;
  const extendedNotes = useMemo(() => {
    const notes: string[] = [];

    if (recentAvgScore !== null && previousAvgScore !== null) {
      const delta = recentAvgScore - previousAvgScore;
      notes.push(
        delta === 0
          ? 'Tu lectura semanal se mantuvo estable frente al bloque anterior.'
          : `Tu lectura semanal va ${delta > 0 ? 'mejor' : 'mas exigida'} por ${Math.abs(delta)} puntos contra la ventana previa.`,
      );
    }

    if (strongestFactor) {
      notes.push(`La base mas estable ahora mismo es ${strongestFactor[0]} con ${strongestFactor[1]} puntos.`);
    }

    if (weakestFactor) {
      notes.push(`La palanca con mas retorno probable sigue siendo ${weakestFactor[0]} porque hoy va en ${weakestFactor[1]} puntos.`);
    }

    if (similarDayComparison?.message) {
      notes.push(similarDayComparison.message);
    }

    return notes.slice(0, 4);
  }, [previousAvgScore, recentAvgScore, similarDayComparison?.message, strongestFactor, weakestFactor]);

  const heroBody = focusActions[0]
    ? `${focusActions[0].title}. ${similarDayComparison?.message ?? morningNarrative ?? ''}`.trim()
    : crossModuleInsights[0] ?? morningNarrative ?? 'Tus datos ya no solo cuentan registros: empiezan a contar una historia.';

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Lectura semanal"
        subtitle="Lo que de verdad esta moviendo tu progreso"
        showBack
        color={Colors.brand}
        rightAction={
          <Pressable
            onPress={() => router.push(Routes.progress.history as never)}
            accessibilityRole="button"
            accessibilityLabel="Abrir historial"
            accessibilityHint="Muestra la línea reciente día por día."
            hitSlop={8}
          >
            <Text style={styles.headerLink}>Historial</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card variant="hero" accentColor={heroColor} decorative elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <ProgressCircle
              value={currentScore}
              size={122}
              strokeWidth={10}
              color={heroColor}
              trackColor={withOpacity(Colors.white, 0.08)}
            >
              <View style={styles.heroRingContent}>
                <Text style={styles.heroRingValue}>{currentScore > 0 ? currentScore : '--'}</Text>
                <Text style={[styles.heroRingLabel, { color: heroColor }]}>{heroLabel}</Text>
              </View>
            </ProgressCircle>

            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Ventana actual</Text>
              <Text style={styles.heroTitle}>Promedio de 7 dias</Text>
              <Text style={styles.heroBody}>{heroBody}</Text>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Promedio</Text>
                  <Text style={styles.heroStatValue}>{recentAvgScore !== null ? recentAvgScore : '--'}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Vs previo</Text>
                  <Text style={[styles.heroStatValue, { color: trendDelta === null ? Colors.textPrimary : trendDelta >= 0 ? Colors.success : Colors.error }]}>
                    {trendDelta === null ? '--' : `${trendDelta > 0 ? '+' : ''}${trendDelta}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.factorCard}>
          <View style={styles.factorHeader}>
            <Text style={styles.sectionTitle}>Factores de hoy</Text>
            <Text style={styles.sectionHint}>Lo mas alto te sostiene. Lo mas bajo es donde conviene actuar primero.</Text>
          </View>

          <View style={styles.factorList}>
            {factorBars.map(([label, value]) => {
              const currentTone = strongestFactor?.[0] === label ? Colors.success : weakestFactor?.[0] === label ? Colors.warning : Colors.brand;
              return (
                <View key={label} style={styles.factorRow}>
                  <View style={styles.factorTopRow}>
                    <Text style={styles.factorLabel}>{label}</Text>
                    <Text style={[styles.factorValue, { color: currentTone }]}>{Math.round(value)}%</Text>
                  </View>
                  <View style={styles.factorTrack}>
                    <View
                      style={[
                        styles.factorFill,
                        {
                          width: `${visibleProgressPercent(value)}%`,
                          backgroundColor: currentTone,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {factorSeries.length ? (
            <View style={styles.factorSparkRow}>
              <Text style={styles.factorSparkLabel}>Lectura compacta</Text>
              <MiniSparkline values={factorSeries} color={heroColor} width={96} height={28} />
            </View>
          ) : null}
        </Card>

        {editorialCards.map((card) => {
          const toneColor = getToneColor(card.tone);
          return (
            <Card key={card.title} variant="insight" accentColor={toneColor} style={styles.editorialCard}>
              <View style={styles.editorialTop}>
                <View style={[styles.editorialIconWrap, { backgroundColor: withOpacity(toneColor, 0.12) }]}>
                  <Ionicons name={getToneIcon(card.tone)} size={18} color={toneColor} />
                </View>
                <View style={styles.editorialCopy}>
                  <Text style={styles.editorialTitle}>{card.title}</Text>
                  <Text style={styles.editorialBody}>{card.body}</Text>
                </View>
              </View>
              <Text style={[styles.editorialAction, { color: toneColor }]}>{card.action}</Text>
            </Card>
          );
        })}

        {!editorialCards.length ? (
          <Card style={styles.editorialCard}>
            <Text style={styles.editorialBody}>
              Hace falta algo mas de historial para sacar conclusiones fuertes. Sigue registrando unos dias mas.
            </Text>
          </Card>
        ) : null}

        {canOfferExtended ? (
          extendedUnlocked ? (
            <Card style={styles.editorialCard}>
              <Text style={styles.editorialTitle}>Lectura extendida</Text>
              <View style={styles.extendedStack}>
                {extendedNotes.map((note) => (
                  <View key={note} style={styles.extendedRow}>
                    <View style={styles.extendedDot} />
                    <Text style={styles.editorialBody}>{note}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null
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
  heroCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  heroTop: {
    flexDirection: 'row',
    gap: Spacing[4],
    alignItems: 'center',
  },
  heroRingContent: {
    alignItems: 'center',
    gap: 2,
  },
  heroRingValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    lineHeight: TextLeading['2xl'],
    color: Colors.textPrimary,
  },
  heroRingLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: Spacing[2],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    lineHeight: TextLeading.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textSecondary,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  heroStat: {
    flex: 1,
    gap: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  heroStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  heroStatValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
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
  factorCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  factorHeader: {
    gap: 4,
  },
  factorList: {
    gap: Spacing[2.5],
  },
  factorRow: {
    gap: Spacing[1.5],
  },
  factorTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
    color: Colors.textPrimary,
  },
  factorValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.base,
  },
  factorTrack: {
    height: 9,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  factorSparkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    paddingTop: Spacing[1],
  },
  factorSparkLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  editorialCard: {
    gap: Spacing[2.5],
    backgroundColor: withOpacity(Colors.surface2, 0.94),
  },
  editorialTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  editorialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorialCopy: {
    flex: 1,
    gap: 4,
  },
  editorialTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  editorialBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: TextLeading.sm,
    color: Colors.textPrimary,
  },
  editorialAction: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  extendedStack: {
    gap: Spacing[2],
  },
  extendedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  extendedDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    marginTop: 7,
    backgroundColor: Colors.brand,
  },
});
