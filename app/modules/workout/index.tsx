import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import { Header } from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';
import { Spacing, Radius, FontFamily } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';

export default function WorkoutScreen() {
  const { routines, history, loading, getWeeklyStats, startSession, fatigueRisk } = useWorkout();
  const [starting, setStarting] = useState(false);

  const weeklyStats = getWeeklyStats();

  const handleStartFree = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStarting(true);
    await startSession('Entreno libre');
    setStarting(false);
    router.push('/modules/workout/session' as any);
  };

  const handleStartRoutine = async (routineId: string, routineName: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStarting(true);
    await startSession(routineName, routineId);
    setStarting(false);
    router.push('/modules/workout/session' as any);
  };

  if (loading) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Entrenamientos" showBack color={Colors.workout} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Skeleton height={100} style={styles.skeleton} />
          <Skeleton height={180} style={styles.skeleton} />
          <Skeleton height={200} style={styles.skeleton} />
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Entrenamientos" showBack color={Colors.workout} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats semana */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Esta semana</Text>
          <View style={styles.statsRow}>
            <StatItem value={weeklyStats.sessions} label="Entrenos" />
            <StatItem
              value={weeklyStats.volume > 0 ? `${Math.round(weeklyStats.volume / 1000)}k` : '0'}
              label="Volumen (kg)"
            />
            <StatItem value={weeklyStats.muscles.length} label="Músculos" />
          </View>
        </Card>

        {fatigueRisk.level !== 'low' && fatigueRisk.message ? (
          <Card
            style={[
              styles.fatigueCard,
              fatigueRisk.level === 'high' ? styles.fatigueHigh : styles.fatigueModerate,
            ]}
          >
            <Text style={styles.fatigueTitle}>
              {fatigueRisk.level === 'high' ? 'Fatiga acumulada alta' : 'Atencion a la fatiga'}
            </Text>
            <Text style={styles.fatigueMessage}>{fatigueRisk.message}</Text>
            <View style={styles.fatigueMetaRow}>
              <Text style={styles.fatigueMetaText}>Dias seguidos: {fatigueRisk.consecutiveTrainingDays}</Text>
              {typeof fatigueRisk.avgSleepHoursLast3 === 'number' ? (
                <Text style={styles.fatigueMetaText}>Sueno: {fatigueRisk.avgSleepHoursLast3}h</Text>
              ) : null}
              {typeof fatigueRisk.avgStressLast3 === 'number' ? (
                <Text style={styles.fatigueMetaText}>Estres: {fatigueRisk.avgStressLast3}/10</Text>
              ) : null}
            </View>
          </Card>
        ) : null}

        {fatigueRisk.cycleAdjustedRecommendation ? (
          <Card style={styles.cycleAdjustCard}>
            <Text style={styles.cycleAdjustTitle}>Ajuste por fase del ciclo</Text>
            <Text style={styles.cycleAdjustText}>{fatigueRisk.cycleAdjustedRecommendation}</Text>
            {fatigueRisk.cycleLoadProfile ? (
              <View style={styles.cycleMetaGrid}>
                <Text style={styles.cycleMetaText}>
                  RPE max: {fatigueRisk.cycleLoadProfile.intensityCapRpe}
                </Text>
                <Text style={styles.cycleMetaText}>
                  Volumen: {Math.round(fatigueRisk.cycleLoadProfile.volumeMultiplier * 100)}%
                </Text>
                <Text style={styles.cycleMetaText}>
                  Pasos: {fatigueRisk.cycleLoadProfile.stepGoalAdjustmentPct > 0 ? '+' : ''}
                  {fatigueRisk.cycleLoadProfile.stepGoalAdjustmentPct}%
                </Text>
                <Text style={styles.cycleMetaText}>
                  Prioriza: {fatigueRisk.cycleLoadProfile.preferredFocus}
                </Text>
                <Text style={styles.cycleMetaText}>
                  Evita: {fatigueRisk.cycleLoadProfile.avoidFocus}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* Botón sesión libre */}
        <Button
          label={starting ? 'Iniciando...' : '🏋️ Sesión libre'}
          onPress={handleStartFree}
          disabled={starting}
          color={Colors.workout}
          size="large"
          style={styles.freeBtn}
        />

        {/* Rutinas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis rutinas</Text>
          <TouchableOpacity onPress={() => router.push('/modules/workout/routines' as any)}>
            <Text style={styles.seeAll}>Gestionar →</Text>
          </TouchableOpacity>
        </View>

        {routines.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Sin rutinas aún"
            description="Creá tu primera rutina o usá una sesión libre para empezar"
          />
        ) : (
          routines.map((routine) => (
            <Card key={routine.id} style={styles.routineCard}>
              <View style={styles.routineHeader}>
                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.routineExercises}>
                  {routine.exercises.length} ejercicios
                </Text>
              </View>

              <View style={styles.routineExList}>
                {routine.exercises.slice(0, 3).map((ex, i) => (
                  <Text key={i} style={styles.routineEx}>
                    • {ex.exercise_name} — {ex.sets_target}×{ex.reps_target}
                  </Text>
                ))}
                {routine.exercises.length > 3 && (
                  <Text style={styles.routineMore}>
                    +{routine.exercises.length - 3} más...
                  </Text>
                )}
              </View>

              <Button
                label="▶ Iniciar"
                onPress={() => handleStartRoutine(routine.id, routine.name)}
                color={Colors.workout}
                size="small"
                disabled={starting}
                style={styles.startBtn}
              />
            </Card>
          ))
        )}

        {/* Historial reciente */}
        {history.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimos entrenos</Text>
              <TouchableOpacity onPress={() => router.push('/modules/workout/history' as any)}>
                <Text style={styles.seeAll}>Ver todo →</Text>
              </TouchableOpacity>
            </View>

            {history.slice(0, 3).map((session) => {
              const durationMin = session.ended_at
                ? Math.round(
                    (new Date(session.ended_at).getTime() -
                      new Date(session.started_at).getTime()) /
                      60000,
                  )
                : null;

              return (
                <Card key={session.id} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyName}>{session.name}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(session.started_at).toLocaleDateString('es-AR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}
                        {durationMin ? ` · ${durationMin} min` : ''}
                      </Text>
                      {session.muscles_worked.length > 0 && (
                        <View style={styles.musclePills}>
                          {session.muscles_worked.slice(0, 3).map((m) => (
                            <View key={m} style={styles.musclePill}>
                              <Text style={styles.musclePillText}>{m}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyVolume}>
                        {session.total_volume_kg.toLocaleString()} kg
                      </Text>
                      <Text style={styles.historyVolumeLabel}>volumen</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function StatItem({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  skeleton: {
    borderRadius: Radius.xl,
    marginBottom: Spacing[3],
  },
  statsCard: {},
  fatigueCard: {
    borderWidth: 1,
    gap: Spacing[1],
  },
  fatigueHigh: {
    borderColor: `${Colors.warning}66`,
    backgroundColor: `${Colors.warning}16`,
  },
  fatigueModerate: {
    borderColor: `${Colors.workout}55`,
    backgroundColor: `${Colors.workout}10`,
  },
  fatigueTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  fatigueMessage: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  fatigueMetaRow: {
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  fatigueMetaText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  cycleAdjustCard: {
    borderWidth: 1,
    borderColor: `${Colors.female}55`,
    backgroundColor: `${Colors.female}10`,
    gap: Spacing[1],
  },
  cycleAdjustTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.female,
  },
  cycleAdjustText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  cycleMetaGrid: {
    marginTop: Spacing[2],
    gap: Spacing[1],
  },
  cycleMetaText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.workout,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  freeBtn: {
    marginTop: Spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.workout,
  },
  routineCard: {
    gap: Spacing[3],
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineName: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  routineExercises: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  routineExList: {
    gap: 4,
  },
  routineEx: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  routineMore: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  startBtn: {
    alignSelf: 'flex-end',
  },
  historyCard: {},
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyLeft: {
    flex: 1,
    gap: Spacing[1],
  },
  historyName: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  historyDate: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  musclePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  musclePill: {
    backgroundColor: `${Colors.workout}20`,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  musclePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.workout,
  },
  historyRight: {
    alignItems: 'center',
  },
  historyVolume: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.workout,
  },
  historyVolumeLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
