import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import WorkoutTabs from '@/components/workout/WorkoutTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { getRoutineLastSession } from '@/lib/workout-metrics';

function levelColor(level: string) {
  const value = level.toLowerCase();
  if (value.includes('avan')) return Colors.error;
  if (value.includes('inter')) return Colors.warning;
  return Colors.success;
}

function programIcon(name: string) {
  const value = name.toLowerCase();
  if (value.includes('fuerza')) return 'flash-outline' as const;
  if (value.includes('funda')) return 'build-outline' as const;
  if (value.includes('rebuild') || value.includes('restore')) return 'refresh-outline' as const;
  if (value.includes('cardio')) return 'pulse-outline' as const;
  return 'layers-outline' as const;
}

function StatChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={12} color={Colors.textMuted} />
      <Text style={styles.statChipText}>{label}</Text>
    </View>
  );
}

export default function WorkoutProgramsScreen() {
  const { programs, routines, history, getActiveProgram, getProgramPhase, setActiveProgram } = useWorkout();
  const activeProgram = getActiveProgram();
  const phase = getProgramPhase();
  const listedPrograms = programs.filter((program) => program.id !== activeProgram?.id);
  const completedThisProgram = activeProgram
    ? history.filter((entry) => activeProgram.routine_ids.includes(entry.routine_id ?? '')).length
    : 0;
  const activeProgressPct = activeProgram && phase ? Math.round((phase.week / phase.totalWeeks) * 100) : 0;
  const nextRoutine = activeProgram
    ? (() => {
        const routineIds = activeProgram.routine_ids ?? [];
        if (routineIds.length === 0) return null;

        const firstPendingRoutine =
          routines.find((routine) => {
            const lastSession = getRoutineLastSession(routine.id, history);
            return routineIds.includes(routine.id) && !lastSession;
          }) ?? null;

        if (firstPendingRoutine) return firstPendingRoutine;

        const fallbackRoutineId = routineIds[completedThisProgram % routineIds.length];
        return routines.find((routine) => routine.id === fallbackRoutineId) ?? null;
      })()
    : null;

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title="Programas" color={Colors.workout} />
      <WorkoutTabs active="programs" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {activeProgram ? (
          <Card accentColor={Colors.brand} decorative style={styles.activeCard}>
            <View style={styles.rowBetween}>
              <View style={styles.copy}>
                <Text style={styles.heroEyebrow}>Activo ahora</Text>
                <Text style={styles.heroTitle}>{activeProgram.name}</Text>
                <Text style={styles.heroBody}>
                  {activeProgram.objective}
                  {phase ? ` · ${phase.label} ${phase.week}/${phase.totalWeeks}` : ''}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Ionicons name={programIcon(activeProgram.name)} size={14} color={Colors.success} />
                <Text style={styles.activeBadgeText}>Activo</Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Progreso del programa</Text>
                <Text style={styles.progressValue}>{activeProgressPct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${activeProgressPct}%` }]} />
              </View>
              <Text style={styles.progressHint}>
                Semana {phase?.week ?? 1} de {phase?.totalWeeks ?? activeProgram.duration_weeks}
              </Text>
            </View>

            <View style={styles.metaWrap}>
              <StatChip icon="calendar-outline" label={`${activeProgram.days_per_week} d/sem`} />
              <StatChip icon="time-outline" label={`${activeProgram.estimated_session_min} min`} />
              <StatChip icon="hourglass-outline" label={`${activeProgram.duration_weeks} semanas`} />
              <StatChip icon="albums-outline" label={`${completedThisProgram} sesiones hechas`} />
            </View>

            <Card style={styles.previewCard}>
              <Text style={styles.previewEyebrow}>Siguiente bloque</Text>
              <Text style={styles.previewTitle}>{nextRoutine?.name ?? 'Rutina del programa'}</Text>
              <Text style={styles.previewBody}>
                {nextRoutine
                  ? `${nextRoutine.exercises.length} ejercicios · ${nextRoutine.estimated_duration_min ?? activeProgram.estimated_session_min} min`
                  : 'Puedes abrir las rutinas del plan para revisar el detalle completo.'}
              </Text>
              <Text style={styles.previewHint}>
                Llevas {completedThisProgram} sesiones dentro de este programa.
              </Text>
            </Card>

            <View style={styles.actionRow}>
              <Button onPress={() => router.push(Routes.workout.routines as never)} fullWidth color={Colors.brand} style={styles.flexButton}>
                Ver rutinas
              </Button>
              <Button onPress={() => void setActiveProgram(null)} variant="secondary" color={Colors.brand} fullWidth style={styles.flexButton}>
                Pausar
              </Button>
            </View>
          </Card>
        ) : null}

        {listedPrograms.map((program) => {
          const levelTint = levelColor(program.difficulty_level);

          return (
            <Card key={program.id} accentColor={Colors.workout} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.copy}>
                  <View style={styles.programTitleRow}>
                    <Ionicons name={programIcon(program.name)} size={16} color={Colors.workout} />
                    <Text style={styles.cardTitle}>{program.name}</Text>
                  </View>
                  <Text style={styles.cardBody}>
                    {program.objective ?? program.structure ?? 'Programa progresivo listo para usar.'}
                  </Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: withOpacity(levelTint, 0.14), borderColor: withOpacity(levelTint, 0.28) }]}>
                  <Text style={[styles.levelText, { color: levelTint }]}>{program.difficulty_level}</Text>
                </View>
              </View>

              <View style={styles.metaWrap}>
                <StatChip icon="calendar-outline" label={`${program.days_per_week} d/sem`} />
                <StatChip icon="time-outline" label={`${program.estimated_session_min} min`} />
                <StatChip icon="hourglass-outline" label={`${program.duration_weeks} semanas`} />
                <StatChip icon="albums-outline" label={`${program.routine_ids.length} bloques`} />
              </View>

              <Text style={styles.totalText}>
                Hecho para {program.objective ?? 'avanzar con una estructura clara'} y sostenerse varias semanas, no para perseguir calorias.
              </Text>

              <View style={styles.actionRow}>
                <Button onPress={() => router.push(Routes.workout.routines as never)} variant="secondary" color={Colors.workout} style={styles.flexButton}>
                  Ver rutinas
                </Button>
                <Button onPress={() => void setActiveProgram(program.id)} color={Colors.workout} style={styles.flexButton}>
                  Activar programa
                </Button>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[3],
  },
  activeCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  card: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  rowBetween: {
    flexDirection: 'row',
    gap: Spacing[2],
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.24),
    backgroundColor: Colors.successBg,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
  },
  activeBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  progressCard: {
    gap: Spacing[2],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.22),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    padding: Spacing[3],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  progressTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  progressValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
  },
  progressHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface3, 0.76),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.25],
  },
  statChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  previewCard: {
    gap: Spacing[1],
    backgroundColor: Colors.surface2,
  },
  previewEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  previewTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  previewBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  previewHint: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  flexButton: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  cardBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  levelText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  totalText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
