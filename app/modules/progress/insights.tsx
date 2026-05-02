import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import RewardedUnlockCard from '@/components/ads/RewardedUnlockCard';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { preloadPlacement, showRewardedPlacement } from '@/lib/ads/runtime';
import { useReadiness } from '@/hooks/useReadiness';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';
import { visibleProgressPercent } from '@/lib/visual-progress';
import { useUIStore } from '@/stores/uiStore';

function averageScore(rows: Array<{ total_score?: number | null }>) {
  if (!rows.length) return null;
  return Math.round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / rows.length);
}

export default function ProgressInsightsScreen() {
  const [isUnlockingExtended, setIsUnlockingExtended] = useState(false);
  const [extendedUnlocked, setExtendedUnlocked] = useState(false);
  const {
    dailyScore,
    history,
    similarDayComparison,
    focusActions,
    morningNarrative,
    crossModuleInsights,
  } = useReadiness();
  const showToast = useUIStore((state) => state.showToast);
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
        action: 'Convierte está señal en una decisión semanal concreta.',
      });
    }

    if (similarDayComparison?.message) {
      cards.push({
        title: 'Comparado con días parecidos',
        body: similarDayComparison.message,
        action: 'Mira que se repite y que se puede simplificar.',
      });
    }

    if (focusActions[0]) {
      cards.push({
        title: 'Siguiente mejor acción',
        body: `Entre todas las opciones, ${focusActions[0].title.toLowerCase()} sigue siendo lo que más mueve la aguja.`,
        action: 'Haz eso primero y luego revisa otra vez.',
      });
    } else if (morningNarrative) {
      cards.push({
        title: 'Panorama del día',
        body: morningNarrative,
        action: 'Usalo como contexto, no como presion extra.',
      });
    }

    return cards.slice(0, 3);
  }, [crossModuleInsights, focusActions, morningNarrative, similarDayComparison?.message]);

  const factorBars = dailyScore?.breakdown
    ? (Object.entries(dailyScore.breakdown) as Array<[string, number]>).slice(0, 5)
    : [];
  const strongestFactor = [...factorBars].sort((a, b) => b[1] - a[1])[0] ?? null;
  const weakestFactor = [...factorBars].sort((a, b) => a[1] - b[1])[0] ?? null;
  const canOfferExtended = editorialCards.length > 0 || recentWindow.length >= 4 || factorBars.length >= 3;
  const extendedNotes = useMemo(() => {
    const notes: string[] = [];

    if (recentAvgScore !== null && previousAvgScore !== null) {
      const delta = recentAvgScore - previousAvgScore;
      notes.push(
        delta === 0
          ? 'Tu señal semanal se mantuvo plana frente a la ventana anterior.'
          : `Tu señal semanal va ${delta > 0 ? 'mejor' : 'más exigida'} por ${Math.abs(delta)} puntos contra la semana previa.`,
      );
    }

    if (strongestFactor) {
      notes.push(`La base más estable ahora mismo es ${strongestFactor[0]} con ${strongestFactor[1]} puntos.`);
    }

    if (weakestFactor) {
      notes.push(`La palanca con más retorno probable es ${weakestFactor[0]} porque hoy va en ${weakestFactor[1]} puntos.`);
    }

    if (similarDayComparison?.message) {
      notes.push(similarDayComparison.message);
    }

    return notes.slice(0, 4);
  }, [previousAvgScore, recentAvgScore, similarDayComparison?.message, strongestFactor, weakestFactor]);

  useEffect(() => {
    if (!canOfferExtended) return;
    void preloadPlacement('progress_insights_extended').catch((e) => {
      console.debug?.('[progress/insights] preloadPlacement failed', e);
    });
  }, [canOfferExtended]);

  const handleUnlockExtended = useCallback(async () => {
    setIsUnlockingExtended(true);

    try {
      const outcome = await showRewardedPlacement('progress_insights_extended');
      if (!outcome.shown) {
        if (outcome.reason === 'capped') {
          showToast('Ya abriste varios extras hoy. Vuelve más tarde para otra lectura extendida.', 'info');
          return;
        }

        showToast('El video recompensado no está listo todavía.', 'error');
        return;
      }

      if (!outcome.result.completed) {
        showToast('Necesitas ver el video completo para abrir esta lectura extendida.', 'info');
        return;
      }

      setExtendedUnlocked(true);
      showToast('Lectura extendida desbloqueada.', 'success');
    } catch {
      showToast('No pudimos abrir el video recompensado ahora mismo.', 'error');
    } finally {
      setIsUnlockingExtended(false);
    }
  }, [showToast]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Lo que tus datos dicen esta semana"
        subtitle="Menos dashboard, más lectura útil"
        showBack
        color={Colors.brand}
        rightElement={
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
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Panorama rápido</Text>
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
              <Text style={styles.summaryLabel}>señal semanal</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.factorCard}>
          <Text style={styles.sectionTitle}>Contexto de recuperación</Text>
          <View style={styles.factorList}>
            {factorBars.map(([label, value]) => (
              <View key={label} style={styles.factorRow}>
                <Text style={styles.factorLabel}>{label}</Text>
                <View style={styles.factorTrack}>
                  <View style={[styles.factorFill, { width: `${visibleProgressPercent(value)}%` }]} />
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.contextNote}>
            Esto aporta contexto de recuperación y carga. Peso, consistencia y PRs siguen siendo
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
              Hace falta algo más de historial para sacar conclusiones fuertes. Sigue registrando unos días más.
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
          ) : (
            <RewardedUnlockCard
              title="Desbloquea una lectura extendida de la semana"
              body="Abrimos una capa más fina de tendencia y palancas de mejora sin meter anuncios en tu flujo principal."
              buttonLabel="Ver lectura extendida"
              loading={isUnlockingExtended}
              accent={Colors.brand}
              onPress={() => {
                void handleUnlockExtended();
              }}
            />
          )
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
