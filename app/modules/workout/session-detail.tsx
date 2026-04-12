import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { formatCalories, formatDateShort, formatDuration, formatTime } from '@/utils/formatters';

export default function WorkoutSessionDetailScreen() {
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const { getSessionDetail } = useWorkout();
  const detail = params.sessionId ? getSessionDetail(String(params.sessionId)) : null;
  const session = detail?.session ?? null;

  if (!detail || !session) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header eyebrow="Entreno" title="Detalle de sesión" color={Colors.workout} />
        <ScrollView contentContainerStyle={styles.emptyContainer} showsVerticalScrollIndicator={false}>
          <Card accentColor={Colors.workout} style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sesión no disponible</Text>
            <Text style={styles.emptyBody}>Puede que esa sesión no exista todavía o que haya sido eliminada del historial.</Text>
          </Card>
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title={session.name} color={Colors.workout} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} decorative style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroTitle}>{formatDateShort(session.started_at)}</Text>
              <Text style={styles.heroBody}>
                {formatTime(session.started_at)} · {formatDuration(detail.durationMin)}
              </Text>
            </View>
            <View style={styles.volumeBox}>
              <Text style={styles.volumeValue}>{session.total_volume_kg}</Text>
              <Text style={styles.volumeLabel}>kg</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricPill}>
              <Text style={styles.metricValue}>{session.sets_count}</Text>
              <Text style={styles.metricLabel}>series</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricValue}>{session.total_reps ?? 0}</Text>
              <Text style={styles.metricLabel}>reps</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricValue}>{formatCalories(session.estimated_calories ?? 0)}</Text>
              <Text style={styles.metricLabel}>kcal</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Desglose por ejercicio</Text>
          {detail.exerciseBreakdown.map((entry) => (
            <View key={entry.exercise_id} style={styles.breakdownRow}>
              <View style={styles.breakdownCopy}>
                <Text style={styles.breakdownTitle}>{entry.exercise_name}</Text>
                <Text style={styles.breakdownBody}>
                  {entry.sets} series · {entry.total_volume_kg} kg
                </Text>
              </View>
              <Text style={styles.breakdownPr}>{entry.prs ? `${entry.prs} PR` : '—'}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Series registradas</Text>
          {detail.sets.map((set) => (
            <View key={set.id ?? `${set.exercise_id}-${set.set_number}`} style={styles.setRow}>
              <View style={styles.setCopy}>
                <Text style={styles.setTitle}>
                  {set.exercise_name} · Serie {set.set_number}
                </Text>
                <Text style={styles.setBody}>
                  {set.reps} reps × {set.weight_kg} kg
                </Text>
              </View>
              <View style={[styles.setTag, set.is_pr && styles.setTagPr]}>
                <Text style={styles.setTagText}>{set.is_pr ? 'PR' : set.set_type ?? 'work'}</Text>
              </View>
            </View>
          ))}
        </Card>

        {session.notes ? (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notesBody}>{session.notes}</Text>
          </Card>
        ) : null}

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Músculos trabajados</Text>
          <View style={styles.chipWrap}>
            {session.muscles_worked.map((muscle, index) => (
              <View
                key={muscle}
                style={[
                  styles.chip,
                  { borderColor: withOpacity(index % 2 === 0 ? Colors.workout : Colors.coach, 0.18) },
                ]}
              >
                <Text style={styles.chipText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  emptyContainer: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
  },
  emptyCard: {
    gap: Spacing[3],
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  heroCard: {
    gap: Spacing[3],
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  heroBody: {
    marginTop: 4,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  volumeBox: {
    minWidth: 96,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  volumeValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.workout,
  },
  volumeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  metricPill: {
    flex: 1,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 4,
  },
  metricValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sectionCard: {
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.06),
  },
  breakdownCopy: {
    flex: 1,
  },
  breakdownTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  breakdownBody: {
    marginTop: 2,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  breakdownPr: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.coins,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.06),
  },
  setCopy: {
    flex: 1,
  },
  setTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  setBody: {
    marginTop: 2,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  setTag: {
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  setTagPr: {
    backgroundColor: withOpacity(Colors.success, 0.14),
  },
  setTagText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.workout,
  },
  notesBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chip: {
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
});
