import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useReadiness } from '@/hooks/useReadiness';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';

function averageScore(rows: Array<{ total_score?: number | null }>) {
  if (!rows.length) return null;
  return Math.round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / rows.length);
}

export default function ProgressInsightsScreen() {
  const {
    dailyScore,
    history,
    similarDayComparison,
    focusActions,
    morningNarrative,
    crossModuleInsights,
  } = useReadiness();
  const { stats } = useWeight();
  const { getConsistencyStats } = useWorkout();
  const workoutConsistency = getConsistencyStats();

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history],
  );
  const recentWindow = sortedHistory.slice(-7);
  const previousWindow = sortedHistory.slice(-14, -7);
  const recentAvgScore = averageScore(recentWindow);
  const previousAvgScore = averageScore(previousWindow);

  const editorialCards = useMemo(() => {
    const cards: Array<{ title: string; body: string; action: string }> = [];

    if (crossModuleInsights[0]) {
      cards.push({
        title: 'Hallazgo principal',
        body: crossModuleInsights[0],
        action: 'Convierte esta senal en una decision semanal concreta.',
      });
    }

    if (similarDayComparison?.message) {
      cards.push({
        title: 'Comparado con dias parecidos',
        body: similarDayComparison.message,
        action: 'Mira que se repite y que se puede simplificar.',
      });
    }

    if (focusActions[0]) {
      cards.push({
        title: 'Siguiente mejor accion',
        body: `Entre todas las opciones, ${focusActions[0].title.toLowerCase()} sigue siendo lo que mas mueve la aguja.`,
        action: 'Haz eso primero y luego revisa otra vez.',
      });
    } else if (morningNarrative) {
      cards.push({
        title: 'Panorama del dia',
        body: morningNarrative,
        action: 'Usalo como contexto, no como presion extra.',
      });
    }

    return cards.slice(0, 3);
  }, [crossModuleInsights, focusActions, morningNarrative, similarDayComparison?.message]);

  const factorBars = dailyScore?.breakdown
    ? (Object.entries(dailyScore.breakdown) as Array<[string, number]>).slice(0, 5)
    : [];

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Lo que tus datos dicen esta semana"
        subtitle="Menos dashboard, mas lectura util"
        showBack
        color={Colors.brand}
        rightElement={
          <Pressable onPress={() => router.push(Routes.progress.history as never)}>
            <Text style={styles.headerLink}>Historial</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Panorama rapido</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{workoutConsistency.sessionsLast30}</Text>
              <Text style={styles.summaryLabel}>sesiones 30d</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{workoutConsistency.currentStreak}</Text>
              <Text style={styles.summaryLabel}>racha activa</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.current != null ? `${stats.current.toFixed(1)} kg` : '--'}</Text>
              <Text style={styles.summaryLabel}>peso actual</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {recentAvgScore !== null && previousAvgScore !== null ? recentAvgScore - previousAvgScore : '--'}
              </Text>
              <Text style={styles.summaryLabel}>senal semanal</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.factorCard}>
          <Text style={styles.sectionTitle}>Contexto de recuperacion</Text>
          <View style={styles.factorList}>
            {factorBars.map(([label, value]) => (
              <View key={label} style={styles.factorRow}>
                <Text style={styles.factorLabel}>{label}</Text>
                <View style={styles.factorTrack}>
                  <View style={[styles.factorFill, { width: `${Math.max(8, Math.min(100, value))}%` }]} />
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.contextNote}>
            Esto aporta contexto de recuperacion y carga. Peso, consistencia y PRs siguen siendo
            los protagonistas del progreso.
          </Text>
        </Card>

        {editorialCards.map((card) => (
          <Card key={card.title} style={styles.editorialCard}>
            <Text style={styles.editorialTitle}>{card.title}</Text>
            <Text style={styles.editorialBody}>{card.body}</Text>
            <Text style={styles.editorialAction}>{card.action}</Text>
          </Card>
        ))}

        {!editorialCards.length ? (
          <Card style={styles.editorialCard}>
            <Text style={styles.editorialBody}>
              Hace falta algo mas de historial para sacar conclusiones fuertes. Sigue registrando unos dias mas.
            </Text>
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
  summaryCard: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  factorCard: {
    gap: Spacing[3],
  },
  factorList: {
    gap: Spacing[2.5],
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  factorLabel: {
    width: 84,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  factorTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
  },
  contextNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  editorialCard: {
    gap: Spacing[2],
  },
  editorialTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  editorialBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  editorialAction: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
});
