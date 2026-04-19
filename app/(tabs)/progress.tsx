import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Card from '@/components/ui/Card';
import WeightTrendChart from '@/components/progress/WeightTrendChart';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';
import { getProfileContextMemory } from '@/lib/profile-context';
import { buildWeightTrendPoints } from '@/lib/progress-insights';
import type { WorkoutSessionDetail } from '@/lib/workout-types';

function buildConsistencyGrid(history: Array<{ started_at: string }>) {
  const activeDays = new Set(history.map((entry) => entry.started_at.slice(0, 10)));
  const entries = Array.from({ length: 56 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (55 - index));
    const iso = date.toISOString().slice(0, 10);
    return {
      iso,
      active: activeDays.has(iso),
      isToday: index === 55,
    };
  });

  return Array.from({ length: 8 }, (_, weekIndex) => ({
    label: `S${weekIndex + 1}`,
    days: entries.slice(weekIndex * 7, weekIndex * 7 + 7),
  }));
}

function withinRange(iso: string, days: number) {
  const date = new Date(iso);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  cutoff.setHours(0, 0, 0, 0);
  return date.getTime() >= cutoff.getTime();
}

function humanizeDate(iso: string) {
  const dayDiff = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dayDiff <= 0) return 'Hoy';
  if (dayDiff === 1) return 'Ayer';
  return `Hace ${dayDiff} dias`;
}

function buildExerciseProgress(
  history: Array<{ id: string; started_at: string }>,
  getSessionDetail: (sessionId: string) => WorkoutSessionDetail | null,
) {
  const now = Date.now();
  const last30 = now - 30 * 24 * 60 * 60 * 1000;
  const prev30 = now - 60 * 24 * 60 * 60 * 1000;

  const map = new Map<
    string,
    {
      exerciseId: string;
      exerciseName: string;
      recentVolume: number;
      previousVolume: number;
      bestWeight: number;
      uses: number;
    }
  >();

  for (const session of history) {
    const detail = getSessionDetail(session.id);
    if (!detail) continue;
    const sessionMs = new Date(session.started_at).getTime();

    for (const set of detail.sets) {
      const current = map.get(set.exercise_id) ?? {
        exerciseId: set.exercise_id,
        exerciseName: set.exercise_name,
        recentVolume: 0,
        previousVolume: 0,
        bestWeight: 0,
        uses: 0,
      };

      const setVolume = Number(set.weight_kg ?? 0) * Number(set.reps ?? 0);
      if (sessionMs >= last30) current.recentVolume += setVolume;
      if (sessionMs >= prev30 && sessionMs < last30) current.previousVolume += setVolume;
      current.bestWeight = Math.max(current.bestWeight, Number(set.weight_kg ?? 0));
      current.uses += 1;
      map.set(set.exercise_id, current);
    }
  }

  return [...map.values()]
    .map((item) => {
      const trendPct =
        item.previousVolume > 0
          ? Math.round(((item.recentVolume - item.previousVolume) / item.previousVolume) * 100)
          : item.recentVolume > 0
            ? 100
            : 0;
      return { ...item, trendPct };
    })
    .sort((left, right) => right.uses - left.uses || right.bestWeight - left.bestWeight)
    .slice(0, 5);
}

export default function ProgressScreen() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const profile = useAuthStore((state) => state.profile);
  const { history, getConsistencyStats, getSessionDetail } = useWorkout();
  const { logs, stats } = useWeight();

  const sessionsInRange = useMemo(
    () => history.filter((entry) => withinRange(entry.started_at, range)),
    [history, range],
  );
  const totalVolume = sessionsInRange.reduce((sum, entry) => sum + Number(entry.total_volume_kg ?? 0), 0);
  const totalMinutes = sessionsInRange.reduce((sum, entry) => sum + Number(entry.duration_min ?? 0), 0);
  const weeklyAverage =
    range > 0 ? (sessionsInRange.length / Math.max(1, Math.round(range / 7))).toFixed(1) : '0';
  const consistencyRows = useMemo(() => buildConsistencyGrid(history), [history]);
  const weightPoints = useMemo(() => buildWeightTrendPoints(logs, '30d'), [logs]);
  const consistencyStats = getConsistencyStats();
  const currentStreak = Number(profile?.current_streak ?? profile?.streak ?? consistencyStats.currentStreak ?? 0);
  const bestStreak = Number(profile?.best_streak ?? profile?.longest_streak ?? currentStreak ?? 0);
  const contextMemory = getProfileContextMemory(profile);
  const freezeCount =
    typeof profile?.streak_freeze_count === 'number'
      ? profile.streak_freeze_count
      : typeof contextMemory.streak_freeze_count === 'number'
        ? Number(contextMemory.streak_freeze_count)
        : Math.max(0, Math.floor(currentStreak / 7));
  const exerciseProgress = useMemo(
    () => buildExerciseProgress(history, getSessionDetail),
    [getSessionDetail, history],
  );

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tu progreso</Text>
          <View style={styles.rangeRow}>
            {[7, 30, 90].map((value) => {
              const active = range === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setRange(value as 7 | 30 | 90)}
                  style={[styles.rangePill, active && styles.rangePillActive]}
                >
                  <Text style={[styles.rangePillText, active && styles.rangePillTextActive]}>
                    {value}D
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={styles.streakCard} shadow={false}>
          <Text style={styles.streakLabel}>Racha actual</Text>
          <Text style={[styles.streakValue, currentStreak === 0 && styles.streakValueMuted]}>
            {currentStreak}
          </Text>
          <Text style={styles.streakBody}>dias consecutivos</Text>
          <Text style={styles.streakMeta}>Mejor racha: {bestStreak} dias</Text>
          <Text style={styles.streakMeta}>
            {freezeCount > 0
              ? `🛡️ ${freezeCount} streak freeze disponible`
              : 'Sin freezes disponibles'}
          </Text>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard} shadow={false}>
            <Text style={styles.statValue}>{sessionsInRange.length}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </Card>
          <Card style={styles.statCard} shadow={false}>
            <Text style={styles.statValue}>{Math.round(totalVolume).toLocaleString('es-UY')}</Text>
            <Text style={styles.statLabel}>Volumen total kg</Text>
          </Card>
          <Card style={styles.statCard} shadow={false}>
            <Text style={styles.statValue}>{Math.round(totalMinutes)}</Text>
            <Text style={styles.statLabel}>Tiempo total min</Text>
          </Card>
          <Card style={styles.statCard} shadow={false}>
            <Text style={styles.statValue}>{weeklyAverage}</Text>
            <Text style={styles.statLabel}>Promedio/semana</Text>
          </Card>
        </View>

        <Card style={styles.consistencyCard} shadow={false}>
          <Text style={styles.sectionTitle}>Consistencia - 8 semanas</Text>
          <View style={styles.consistencyRows}>
            {consistencyRows.map((row) => (
              <View key={row.label} style={styles.consistencyRow}>
                <Text style={styles.weekLabel}>{row.label}</Text>
                <View style={styles.consistencyDayRow}>
                  {row.days.map((day) => (
                    <View
                      key={day.iso}
                      style={[
                        styles.consistencyDot,
                        day.active && styles.consistencyDotActive,
                        day.isToday && !day.active && styles.consistencyDotToday,
                      ]}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {weightPoints.length >= 2 ? (
          <Card style={styles.weightCard} shadow={false}>
            <View style={styles.weightHeader}>
              <Text style={styles.sectionTitle}>Peso</Text>
              <Pressable
                style={styles.weightButton}
                onPress={() => router.push(Routes.profile.index as never)}
              >
                <Text style={styles.weightButtonText}>+ Peso</Text>
              </Pressable>
            </View>
            <WeightTrendChart data={weightPoints} />
            <Text style={styles.weightHint}>
              {stats.weeklyDelta === null
                ? 'Aun sin tendencia'
                : `${stats.weeklyDelta > 0 ? '+' : ''}${stats.weeklyDelta.toFixed(1)} kg este mes`}
            </Text>
          </Card>
        ) : null}

        {exerciseProgress.length ? (
          <Card style={styles.exerciseCard} shadow={false}>
            <Text style={styles.sectionTitle}>Progreso por ejercicio</Text>
            <View style={styles.exerciseList}>
              {exerciseProgress.map((item, index) => (
                <View key={item.exerciseId}>
                  <Pressable
                    style={styles.exerciseRow}
                    onPress={() => router.push(Routes.workout.exercises as never)}
                  >
                    <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                    <Text style={styles.exerciseMeta}>
                      {item.trendPct > 0 ? '↑' : item.trendPct < 0 ? '↓' : '→'}{' '}
                      {Math.abs(item.trendPct)}% · Mejor: {Math.round(item.bestWeight)} kg
                    </Text>
                  </Pressable>
                  {index < exerciseProgress.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <View style={styles.sessionsBlock}>
          <Text style={styles.sectionTitle}>Ultimas sesiones</Text>
          <View style={styles.sessionList}>
            {history.slice(0, 8).map((session, index) => (
              <View key={session.id}>
                <Pressable
                  style={styles.sessionRow}
                  onPress={() =>
                    router.push({
                      pathname: Routes.workout.sessionDetail,
                      params: { id: session.id },
                    } as never)
                  }
                >
                  <View style={styles.sessionCopy}>
                    <Text style={styles.sessionTitle}>{session.name}</Text>
                    <Text style={styles.sessionMeta}>
                      {humanizeDate(session.started_at)} · {session.duration_min ?? 0} min ·{' '}
                      {Math.round(session.total_volume_kg ?? 0).toLocaleString('es-UY')} kg
                    </Text>
                  </View>
                </Pressable>
                {index < Math.min(history.length, 8) - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: 120,
    gap: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  rangePill: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rangePillActive: {
    backgroundColor: Colors.bgElevated,
    borderColor: Colors.actionBorder,
  },
  rangePillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  rangePillTextActive: {
    color: Colors.action,
  },
  streakCard: {
    borderTopWidth: 4,
    borderTopColor: Colors.action,
    gap: Spacing[1],
  },
  streakLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  streakValue: {
    fontFamily: FontFamily.display,
    fontSize: 72,
    lineHeight: 72,
    color: Colors.action,
  },
  streakValueMuted: {
    color: Colors.textMuted,
  },
  streakBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  streakMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  statCard: {
    width: '47%',
    gap: Spacing[1],
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  consistencyCard: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  consistencyRows: {
    gap: 8,
  },
  consistencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekLabel: {
    width: 20,
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textMuted,
  },
  consistencyDayRow: {
    flexDirection: 'row',
    gap: 6,
  },
  consistencyDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  consistencyDotActive: {
    backgroundColor: Colors.action,
  },
  consistencyDotToday: {
    borderWidth: 1.5,
    borderColor: Colors.action,
    backgroundColor: 'transparent',
  },
  weightCard: {
    gap: Spacing[3],
  },
  weightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  weightButton: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.action,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  weightButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  weightHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  exerciseCard: {
    gap: Spacing[3],
  },
  exerciseList: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  exerciseRow: {
    paddingVertical: Spacing[2.5],
    gap: 4,
  },
  exerciseName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  exerciseMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sessionsBlock: {
    gap: Spacing[3],
  },
  sessionList: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  sessionRow: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  sessionCopy: {
    gap: 2,
  },
  sessionTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sessionMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
});
