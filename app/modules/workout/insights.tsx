import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';

export default function WorkoutInsightsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initial = (params.tab as string) ?? 'history';
  const [tab, setTab] = useState<'history' | 'stats' | 'prs'>(initial as any);

  const {
    history,
    getWeeklyStats,
    getConsistencyStats,
    personalRecords,
    exercises,
  } = useWorkout();

  const weekly = useMemo(() => getWeeklyStats(), [getWeeklyStats, history]);
  const consistency = useMemo(() => getConsistencyStats(), [getConsistencyStats, history]);

  const prsList = useMemo(() => {
    return Object.values(personalRecords || {}).map((r) => ({
      ...r,
      name: exercises.find((e) => e.id === r.exercise_id)?.name ?? r.exercise_id,
    })).sort((a, b) => (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
  }, [personalRecords, exercises]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Entrenamiento — Insights</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setTab('history')} style={[styles.tabBtn, tab === 'history' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('stats')} style={[styles.tabBtn, tab === 'stats' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'stats' && styles.tabTextActive]}>Estadísticas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('prs')} style={[styles.tabBtn, tab === 'prs' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'prs' && styles.tabTextActive]}>Records</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'history' && (
          <View style={styles.section}>
            {history.length === 0 ? (
              <EmptyState icon="📋" title="Sin entrenos" description="Todavía no registraste entrenos." />
            ) : (
              history.map((session) => (
                <Card key={session.id} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyName}>{session.name}</Text>
                      <Text style={styles.historyDate}>{new Date(session.started_at).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })} · {session.duration_min ?? '-'} min</Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyVolume}>{session.total_volume_kg.toLocaleString()} kg</Text>
                      <Text style={styles.historyVolumeLabel}>volumen</Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {tab === 'stats' && (
          <View style={styles.section}>
            <Card style={styles.statsCard}>
              <Text style={styles.sectionTitle}>Esta semana</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{weekly.sessions}</Text>
                  <Text style={styles.statLabel}>Entrenos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round(weekly.volume)}</Text>
                  <Text style={styles.statLabel}>Volumen (kg)</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{consistency.currentStreak}</Text>
                  <Text style={styles.statLabel}>Racha</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {tab === 'prs' && (
          <View style={styles.section}>
            {prsList.length === 0 ? (
              <EmptyState icon="🏆" title="Sin records" description="No hay records personales registrados todavía." />
            ) : (
              prsList.map((r) => (
                <Card key={r.exercise_id} style={styles.prCard}>
                  <Text style={styles.prName}>{r.name}</Text>
                  <Text style={styles.prMeta}>Peso máximo: {r.maxWeight} kg · Reps: {r.maxReps}</Text>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  tabBtn: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgSurface,
  },
  tabActive: {
    backgroundColor: Colors.workout,
  },
  tabText: {
    fontFamily: FontFamily.semibold,
    color: Colors.textPrimary,
  },
  tabTextActive: {
    color: '#fff',
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[3],
  },
  section: {
    gap: Spacing[3],
  },
  historyCard: {},
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyLeft: { flex: 1, gap: 4 },
  historyName: { fontFamily: FontFamily.bold, fontSize: 16, color: Colors.textPrimary },
  historyDate: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
  historyRight: { alignItems: 'center' },
  historyVolume: { fontFamily: FontFamily.bold, fontSize: 16, color: Colors.workout },
  historyVolumeLabel: { fontFamily: FontFamily.regular, fontSize: 11, color: Colors.textSecondary },
  statsCard: { padding: Spacing[4] },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 16, color: Colors.textPrimary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: FontFamily.bold, fontSize: 22, color: Colors.workout },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
  prCard: { padding: Spacing[4] },
  prName: { fontFamily: FontFamily.bold, fontSize: 16, color: Colors.textPrimary },
  prMeta: { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary },
});
