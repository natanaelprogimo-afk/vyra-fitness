import React, { useMemo } from 'react';
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
import { useAuthStore } from '@/stores/authStore';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import type { WorkoutProgram } from '@/lib/workout-types';

type ProgramTheme = {
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
};

function getProgramTheme(program: WorkoutProgram): ProgramTheme {
  const slug = (program.slug ?? '').toLowerCase();

  if (slug.includes('glutes')) {
    return {
      accent: '#F973A8',
      icon: 'barbell-outline',
      badge: 'Gluteos + piernas',
    };
  }

  if (slug.includes('strength')) {
    return {
      accent: Colors.workout,
      icon: 'flash-outline',
      badge: 'Fuerza guiada',
    };
  }

  if (slug.includes('home')) {
    return {
      accent: '#4ADE80',
      icon: 'home-outline',
      badge: 'Casa sin friccion',
    };
  }

  if (slug.includes('rebuild')) {
    return {
      accent: '#F59E0B',
      icon: 'refresh-outline',
      badge: 'Reenganche rapido',
    };
  }

  return {
    accent: Colors.brand,
    icon: 'layers-outline',
    badge: 'Base con continuidad',
  };
}

function levelColor(level: string) {
  const value = level.toLowerCase();
  if (value.includes('inter')) return Colors.warning;
  if (value.includes('avan')) return Colors.error;
  return Colors.success;
}

function pickRecommendedProgram(programs: WorkoutProgram[], goal: string | null | undefined) {
  if (!programs.length) return null;

  const bySlug = (fragment: string) => programs.find((item) => (item.slug ?? '').includes(fragment)) ?? null;

  if (goal === 'gain_muscle' || goal === 'sport_performance' || goal === 'performance') {
    return bySlug('strength') ?? programs[0] ?? null;
  }

  if (goal === 'lose_fat') {
    return bySlug('foundation') ?? bySlug('rebuild') ?? programs[0] ?? null;
  }

  return bySlug('foundation') ?? programs[0] ?? null;
}

function buildProgramJourney(
  program: WorkoutProgram,
  routineNameById: Map<string, string>,
  completedSessions: number,
) {
  const totalSessions = Math.max(1, program.days_per_week * program.duration_weeks);
  const currentIndex = Math.min(totalSessions, completedSessions + 1);
  const start = Math.max(1, currentIndex - 1);
  const end = Math.min(totalSessions, start + 3);

  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const sessionIndex = start + offset;
    const routineId = program.routine_ids[(sessionIndex - 1) % Math.max(1, program.routine_ids.length)];
    const routineName = routineNameById.get(routineId) ?? `Dia ${sessionIndex}`;
    const status =
      sessionIndex <= completedSessions
        ? 'completed'
        : sessionIndex === currentIndex && completedSessions < totalSessions
          ? 'current'
          : 'locked';

    return {
      sessionIndex,
      status,
      routineName,
    };
  });
}

function StatChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={12} color={Colors.textMuted} />
      <Text style={styles.statChipText}>{label}</Text>
    </View>
  );
}

function ProgramCard({
  program,
  isRecommended,
  onStart,
  onView,
}: {
  program: WorkoutProgram;
  isRecommended: boolean;
  onStart: () => void;
  onView: () => void;
}) {
  const theme = getProgramTheme(program);
  const levelTint = levelColor(program.difficulty_level);
  const totalSessions = Math.max(1, program.days_per_week * program.duration_weeks);

  return (
    <Card accentColor={theme.accent} style={styles.programCard}>
      <View style={styles.programHeader}>
        <View style={styles.programTitleWrap}>
          <View style={styles.programEyebrowRow}>
            <Text style={[styles.programEyebrow, { color: theme.accent }]}>
              {isRecommended ? 'Recomendado para ti' : 'Programa'}
            </Text>
            <View style={styles.includedBadge}>
              <Text style={styles.includedBadgeText}>Incluido</Text>
            </View>
          </View>
          <View style={styles.programNameRow}>
            <Ionicons name={theme.icon} size={18} color={theme.accent} />
            <Text style={styles.programTitle}>{program.name}</Text>
          </View>
          <Text style={styles.programBody}>{program.objective ?? program.structure ?? 'Programa guiado para sostener continuidad real.'}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: withOpacity(levelTint, 0.15), borderColor: withOpacity(levelTint, 0.28) }]}>
          <Text style={[styles.levelText, { color: levelTint }]}>{program.difficulty_level}</Text>
        </View>
      </View>

      <View style={styles.metaWrap}>
        <StatChip icon="calendar-outline" label={`${program.days_per_week} d/sem`} />
        <StatChip icon="time-outline" label={`${program.estimated_session_min} min`} />
        <StatChip icon="hourglass-outline" label={`${program.duration_weeks} semanas`} />
        <StatChip icon="layers-outline" label={`${totalSessions} dias guiados`} />
      </View>

      <View style={styles.programPillRow}>
        <View style={[styles.themePill, { backgroundColor: withOpacity(theme.accent, 0.12) }]}>
          <Text style={[styles.themePillText, { color: theme.accent }]}>{theme.badge}</Text>
        </View>
        {program.next_program_name ? (
          <View style={styles.themePill}>
            <Text style={styles.themePillText}>Luego: {program.next_program_name}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.programNote}>
        {program.structure ?? 'No es una rutina suelta: te guia semana a semana para que sepas exactamente que sigue manana.'}
      </Text>

      <View style={styles.actionRow}>
        <Button onPress={onStart} color={theme.accent} style={styles.flexButton}>
          Empezar programa
        </Button>
        <Button onPress={onView} variant="secondary" color={theme.accent} style={styles.flexButton}>
          Ver dias
        </Button>
      </View>
    </Card>
  );
}

export default function WorkoutProgramsScreen() {
  const profile = useAuthStore((state) => state.profile);
  const { programs, routines, history, getActiveProgram, setActiveProgram } = useWorkout();
  const activeProgram = getActiveProgram();

  const routineNameById = useMemo(
    () => new Map(routines.map((routine) => [routine.id, getWorkoutDisplayName(routine.name)])),
    [routines],
  );

  const completedSessionsByProgram = useMemo(
    () =>
      new Map(
        programs.map((program) => [
          program.id,
          history.filter((entry) => program.routine_ids.includes(entry.routine_id ?? '')).length,
        ]),
      ),
    [history, programs],
  );

  const recommendedProgram = useMemo(
    () => pickRecommendedProgram(programs, profile?.primary_goal ?? profile?.goal),
    [profile?.goal, profile?.primary_goal, programs],
  );

  const listedPrograms = useMemo(
    () => programs.filter((program) => program.id !== activeProgram?.id),
    [activeProgram?.id, programs],
  );

  const activeTheme = activeProgram ? getProgramTheme(activeProgram) : null;
  const activeCompletedSessions = activeProgram ? completedSessionsByProgram.get(activeProgram.id) ?? 0 : 0;
  const activeTotalSessions = activeProgram
    ? Math.max(1, activeProgram.days_per_week * activeProgram.duration_weeks)
    : 0;
  const activeProgressPct = activeProgram
    ? Math.round((activeCompletedSessions / Math.max(1, activeTotalSessions)) * 100)
    : 0;
  const activeJourney = activeProgram
    ? buildProgramJourney(activeProgram, routineNameById, activeCompletedSessions)
    : [];

  const handleStartProgram = async (programId: string) => {
    const ok = await setActiveProgram(programId);
    if (ok) {
      router.push({
        pathname: Routes.workout.routines,
        params: { programId },
      } as never);
    }
  };

  const openProgramDays = (programId: string) => {
    router.push({
      pathname: Routes.workout.routines,
      params: { programId },
    } as never);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title="Programas" color={Colors.workout} />
      <WorkoutTabs active="programs" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {activeProgram ? (
          <Card accentColor={activeTheme?.accent ?? Colors.brand} decorative style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.activeCopy}>
                <Text style={[styles.activeEyebrow, { color: activeTheme?.accent ?? Colors.brand }]}>
                  Programa activo
                </Text>
                <Text style={styles.activeTitle}>{activeProgram.name}</Text>
                <Text style={styles.activeBody}>
                  {activeProgram.objective ?? 'Tu camino principal ya esta activo y listo para continuar.'}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Ionicons name={activeTheme?.icon ?? 'flash-outline'} size={14} color={activeTheme?.accent ?? Colors.brand} />
                <Text style={[styles.activeBadgeText, { color: activeTheme?.accent ?? Colors.brand }]}>En marcha</Text>
              </View>
            </View>

            <Card style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Progreso del programa</Text>
                <Text style={styles.progressValue}>{activeProgressPct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(4, activeProgressPct)}%`,
                      backgroundColor: activeTheme?.accent ?? Colors.brand,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                Dia {Math.min(activeTotalSessions, activeCompletedSessions + 1)} de {activeTotalSessions} · {activeCompletedSessions} sesiones ya hechas
              </Text>
            </Card>

            <View style={styles.metaWrap}>
              <StatChip icon="calendar-outline" label={`${activeProgram.days_per_week} d/sem`} />
              <StatChip icon="time-outline" label={`${activeProgram.estimated_session_min} min`} />
              <StatChip icon="hourglass-outline" label={`${activeProgram.duration_weeks} semanas`} />
              <StatChip icon="sparkles-outline" label={activeTheme?.badge ?? 'Programa guiado'} />
            </View>

            <Card style={styles.journeyCard}>
              <Text style={styles.journeyTitle}>Tu camino ahora</Text>
              <View style={styles.journeyList}>
                {activeJourney.map((item) => {
                  const iconName =
                    item.status === 'completed'
                      ? 'checkmark-circle'
                      : item.status === 'current'
                        ? 'play-circle'
                        : 'lock-closed';
                  const iconColor =
                    item.status === 'completed'
                      ? Colors.success
                      : item.status === 'current'
                        ? activeTheme?.accent ?? Colors.brand
                        : Colors.textMuted;

                  return (
                    <View key={`${activeProgram.id}_${item.sessionIndex}`} style={styles.journeyRow}>
                      <Ionicons name={iconName} size={18} color={iconColor} />
                      <View style={styles.journeyCopy}>
                        <Text style={styles.journeyDay}>Dia {item.sessionIndex}</Text>
                        <Text style={styles.journeyRoutine}>{item.routineName}</Text>
                      </View>
                      <Text style={styles.journeyState}>
                        {item.status === 'completed' ? 'Listo' : item.status === 'current' ? 'Sigue aqui' : 'Se desbloquea despues'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            <View style={styles.actionRow}>
              <Button
                onPress={() => openProgramDays(activeProgram.id)}
                color={activeTheme?.accent ?? Colors.brand}
                style={styles.flexButton}
              >
                Continuar programa
              </Button>
              <Button
                onPress={() => router.push(Routes.workout.index as never)}
                variant="secondary"
                color={activeTheme?.accent ?? Colors.brand}
                style={styles.flexButton}
              >
                Abrir entreno
              </Button>
            </View>
          </Card>
        ) : recommendedProgram ? (
          <Card accentColor={getProgramTheme(recommendedProgram).accent} decorative style={styles.recommendedHero}>
            <Text style={styles.recommendedEyebrow}>Recomendado para ti</Text>
            <Text style={styles.recommendedTitle}>{recommendedProgram.name}</Text>
            <Text style={styles.recommendedBody}>
              {recommendedProgram.objective ?? 'Empieza aqui si quieres un camino claro desde el primer dia.'}
            </Text>
            <View style={styles.metaWrap}>
              <StatChip icon="calendar-outline" label={`${recommendedProgram.days_per_week} d/sem`} />
              <StatChip icon="time-outline" label={`${recommendedProgram.estimated_session_min} min`} />
              <StatChip icon="hourglass-outline" label={`${recommendedProgram.duration_weeks} semanas`} />
            </View>
            <View style={styles.actionRow}>
              <Button
                onPress={() => void handleStartProgram(recommendedProgram.id)}
                color={getProgramTheme(recommendedProgram).accent}
                style={styles.flexButton}
              >
                Empezar programa
              </Button>
              <Button
                onPress={() => openProgramDays(recommendedProgram.id)}
                variant="secondary"
                color={getProgramTheme(recommendedProgram).accent}
                style={styles.flexButton}
              >
                Ver dias
              </Button>
            </View>
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mas programas</Text>
          <Text style={styles.sectionHint}>
            Aqui no eliges dias sueltos: eliges un camino con progreso y una siguiente accion clara.
          </Text>
        </View>

        {listedPrograms.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            isRecommended={program.id === recommendedProgram?.id}
            onStart={() => void handleStartProgram(program.id)}
            onView={() => openProgramDays(program.id)}
          />
        ))}
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
    backgroundColor: withOpacity(Colors.surface2, 0.9),
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  activeCopy: {
    flex: 1,
    gap: 6,
  },
  activeEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  activeTitle: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  activeBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.white, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
  },
  activeBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  progressCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface3, 0.88),
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
    backgroundColor: withOpacity(Colors.white, 0.08),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
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
    backgroundColor: withOpacity(Colors.surface3, 0.82),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.25],
  },
  statChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  journeyCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface3, 0.88),
  },
  journeyTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  journeyList: {
    gap: Spacing[2],
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  journeyCopy: {
    flex: 1,
    gap: 2,
  },
  journeyDay: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  journeyRoutine: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  journeyState: {
    maxWidth: 92,
    textAlign: 'right',
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  flexButton: {
    flex: 1,
  },
  recommendedHero: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.9),
  },
  recommendedEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: Colors.brand,
  },
  recommendedTitle: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  recommendedBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    gap: 4,
    marginTop: Spacing[1],
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  programCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.9),
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  programTitleWrap: {
    flex: 1,
    gap: 6,
  },
  programEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  programEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  includedBadge: {
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.success, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.24),
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
  },
  includedBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.success,
  },
  programNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programTitle: {
    flex: 1,
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  programBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  levelBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
  },
  levelText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
  },
  programPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  themePill: {
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.surface3, 0.82),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  themePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  programNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
