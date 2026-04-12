import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import FastingModuleTabs from '@/components/fasting/FastingModuleTabs';
import SafeScreen from '@/components/ui/SafeScreen';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useFasting } from '@/hooks/useFasting';

const SCREEN_BG = '#160f0d';
const CARD_BG = '#1e1412';
const TILE_BG = '#261916';
const BORDER = 'rgba(243, 112, 53, 0.14)';

function buildScore(avgHours: number, streakDays: number, targetHours: number, completedFasts: number) {
  const adherence = Math.min(1, avgHours / Math.max(targetHours, 1));
  const streak = Math.min(1, streakDays / 7);
  const volume = Math.min(1, completedFasts / 5);
  return Math.max(0, Math.min(100, Math.round(adherence * 45 + streak * 30 + volume * 25)));
}

function qualityLabel(score: number) {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Muy bueno';
  if (score >= 55) return 'Creciendo';
  return 'Empezando';
}

export default function FastingAnalysisScreen() {
  const { avgHours, fastingStreakDays, completedFasts, targetHours, history, protocolSuggestion } = useFasting();

  const score = buildScore(avgHours, fastingStreakDays, targetHours, completedFasts);
  const lastSeven = history.slice(0, 7);
  const previousSeven = history.slice(7, 14);
  const currentAvg = lastSeven.length ? lastSeven.reduce((sum, item) => sum + Number(item.total_hours ?? 0), 0) / lastSeven.length : avgHours;
  const previousAvg = previousSeven.length ? previousSeven.reduce((sum, item) => sum + Number(item.total_hours ?? 0), 0) / previousSeven.length : currentAvg;
  const delta = previousAvg > 0 ? Math.round(((currentAvg - previousAvg) / previousAvg) * 100) : 0;

  const insights = useMemo(() => {
    const worstDay = lastSeven.reduce((lowest, item) => (Number(item.total_hours ?? 0) < Number(lowest?.total_hours ?? 999) ? item : lowest), lastSeven[0] ?? null);
    const bestDay = lastSeven.reduce((best, item) => (Number(item.total_hours ?? 0) > Number(best?.total_hours ?? 0) ? item : best), lastSeven[0] ?? null);
    return [
      `${delta >= 0 ? '+' : ''}${delta}% vs semana pasada. Tu consistencia ya se nota más estable.`,
      bestDay ? `Tu mejor día fue ${new Date(bestDay.end_time ?? bestDay.start_time ?? Date.now()).toLocaleDateString('es-UY', { weekday: 'long' })}. Conviene repetir ese contexto.` : 'Todavía faltan más cierres para encontrar tu mejor patrón.',
      protocolSuggestion?.reason ?? (worstDay ? `Cuando bajás, suele pasar cerca de ${Math.round(Number(worstDay.total_hours ?? 0))}h. Bajá una etapa antes de forzar.` : 'Sostener una ventana clara vale más que buscar la más extrema.'),
    ];
  }, [delta, lastSeven, protocolSuggestion?.reason]);

  return (
    <SafeScreen backgroundColor={SCREEN_BG} disableAtmosphere padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Análisis</Text>
            <Text style={styles.subtitle}>Score y 3 ideas útiles</Text>
          </View>
          <Text style={styles.headerLink}>semana</Text>
        </View>

        <FastingModuleTabs active="analysis" />

        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>{qualityLabel(score)}</Text>
          <Text style={styles.scoreMeta}>{delta >= 0 ? '+' : ''}{delta}% vs semana pasada</Text>
        </View>

        <View style={styles.insightsColumn}>
          {insights.slice(0, 3).map((insight, index) => (
            <View key={insight} style={styles.insightRow}>
              <View style={[styles.insightDot, { backgroundColor: index === 0 ? '#7fd89e' : index === 1 ? '#f59e42' : '#b6a0ff' }]} />
              <Text style={styles.insightText}>{insight}</Text>
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
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#fff',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#a9928b',
  },
  headerLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#ffd2bf',
    marginTop: 8,
  },
  scoreCard: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: Spacing[6],
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: FontFamily.bold,
    fontSize: 52,
    color: '#7fd89e',
    lineHeight: 56,
  },
  scoreLabel: {
    marginTop: 4,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: '#fff',
  },
  scoreMeta: {
    marginTop: 4,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#a9928b',
  },
  insightsColumn: {
    gap: Spacing[2],
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    backgroundColor: TILE_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: Spacing[4],
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  insightText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#d3b5aa',
    lineHeight: 20,
  },
});
