import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/layout/Header';
import WorkoutTabs from '@/components/workout/WorkoutTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';
import { getRoutineLastSession, getRoutineWeeklyCompletions } from '@/lib/workout-metrics';

type RoutineFilter = 'program' | 'all' | 'base' | 'recent';

function formatLastUsed(iso: string | null | undefined) {
  if (!iso) return 'Todavía no la usaste en tu historial.';
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (diff === 0) return 'Última vez hoy';
  if (diff === 1) return 'Última vez ayer';
  return `Última vez hace ${diff} días`;
}

function splitLabel(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : 'Bloque libre';
}

export default function WorkoutRoutinesScreen() {
  const params = useLocalSearchParams<{ programId?: string }>();
  const { routines, programs, history, getActiveProgram } = useWorkout();
  const requestedProgramId = typeof params.programId === 'string' ? params.programId : '';
  const activeProgram = getActiveProgram();
  const requestedProgram = programs.find((program) => program.id === requestedProgramId) ?? null;
  const focusProgram = requestedProgram ?? activeProgram;
  const [filter, setFilter] = useState<RoutineFilter>(focusProgram ? 'program' : 'all');

  const programRoutineIds = useMemo(
    () => new Set(focusProgram?.routine_ids ?? []),
    [focusProgram?.routine_ids],
  );

  const visibleRoutines = useMemo(() => {
    const recentIds = new Set(history.map((entry) => entry.routine_id).filter(Boolean));

    const source = routines.filter((routine) => {
      if (filter === 'program') {
        return focusProgram ? programRoutineIds.has(routine.id) : true;
      }
      if (filter === 'base') return routine.is_primary;
      if (filter === 'recent') return recentIds.has(routine.id);
      return true;
    });

    return [...source].sort((left, right) => {
      const leftLast = getRoutineLastSession(left.id, history)?.started_at ?? '';
      const rightLast = getRoutineLastSession(right.id, history)?.started_at ?? '';
      const leftPinned = programRoutineIds.has(left.id) ? 1 : 0;
      const rightPinned = programRoutineIds.has(right.id) ? 1 : 0;

      return (
        rightPinned - leftPinned ||
        new Date(rightLast).getTime() - new Date(leftLast).getTime() ||
        left.name.localeCompare(right.name)
      );
    });
  }, [filter, focusProgram, history, programRoutineIds, routines]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title="Rutinas" color={Colors.workout} />
      <WorkoutTabs active="routines" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {focusProgram ? (
          <Card accentColor={Colors.brand} decorative style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>Programa en foco</Text>
                <Text style={styles.heroTitle}>{focusProgram.name}</Text>
                <Text style={styles.heroBody}>
                  {focusProgram.objective ?? 'Rutinas ordenadas para avanzar con contexto.'}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(Routes.workout.programs as never)}
                accessibilityRole="button"
                accessibilityLabel="Ver programas"
                accessibilityHint="Abre la lista completa de programas."
                hitSlop={8}
              >
                <Text style={styles.heroLink}>Ver programas</Text>
              </Pressable>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{focusProgram.routine_ids.length}</Text>
                <Text style={styles.heroStatLabel}>rutinas</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{focusProgram.days_per_week}</Text>
                <Text style={styles.heroStatLabel}>días/sem</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{focusProgram.duration_weeks}</Text>
                <Text style={styles.heroStatLabel}>semanas</Text>
              </View>
            </View>
          </Card>
        ) : null}

        <View style={styles.filterRow}>
          {(focusProgram
            ? [
                { id: 'program', label: 'Programa' },
                { id: 'all', label: 'Todas' },
                { id: 'base', label: 'Base' },
                { id: 'recent', label: 'Recientes' },
              ]
            : [
                { id: 'all', label: 'Todas' },
                { id: 'base', label: 'Base' },
                { id: 'recent', label: 'Recientes' },
              ]
          ).map((item) => {
            const active = filter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setFilter(item.id as RoutineFilter)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                accessibilityRole="radio"
                accessibilityLabel={`Filtro ${item.label}`}
                accessibilityState={{ selected: active }}
                hitSlop={8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          onPress={() => router.push(Routes.workout.routineEditor as never)}
          variant="secondary"
          color={Colors.workout}
          fullWidth
        >
          Nueva rutina
        </Button>

        {visibleRoutines.length ? (
          visibleRoutines.map((routine) => {
            const lastSession = getRoutineLastSession(routine.id, history);
            const weeklyCompletions = getRoutineWeeklyCompletions(routine.id, history);
            const isFromProgram = programRoutineIds.has(routine.id);

            return (
              <Card key={routine.id} accentColor={Colors.workout} style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={styles.copy}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{routine.name}</Text>
                      {routine.is_primary ? (
                        <View style={styles.baseBadge}>
                          <Text style={styles.baseBadgeText}>Base</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.cardBody}>
                      {routine.description?.trim() || 'Bloque listo para entrenar sin abrir el editor.'}
                    </Text>
                  </View>

                  {isFromProgram ? (
                    <View style={styles.programBadge}>
                      <Ionicons name="layers-outline" size={12} color={Colors.brand} />
                      <Text style={styles.programBadgeText}>Programa</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.metaWrap}>
                  <View style={styles.metaChip}>
                    <Ionicons name="albums-outline" size={12} color={Colors.workout} />
                    <Text style={styles.metaChipText}>{splitLabel(routine.split_tag)}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="barbell-outline" size={12} color={Colors.workout} />
                    <Text style={styles.metaChipText}>{routine.exercises.length} ejercicios</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color={Colors.workout} />
                    <Text style={styles.metaChipText}>{routine.estimated_duration_min ?? 30} min</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="repeat-outline" size={12} color={Colors.workout} />
                    <Text style={styles.metaChipText}>{weeklyCompletions}x esta semana</Text>
                  </View>
                </View>

                <Text style={styles.sessionHint}>{formatLastUsed(lastSession?.started_at)}</Text>

                <View style={styles.actionRow}>
                  <Button
                    onPress={() =>
                      router.push({
                        pathname: Routes.workout.preview,
                        params: { routineId: routine.id, name: routine.name },
                      } as never)
                    }
                    color={Colors.workout}
                    style={styles.flexButton}
                  >
                    Abrir rutina
                  </Button>
                  <Button
                    onPress={() =>
                      router.push({
                        pathname: Routes.workout.routineEditor,
                        params: { routineId: routine.id },
                      } as never)
                    }
                    variant="secondary"
                    color={Colors.workout}
                    style={styles.flexButton}
                  >
                    Editar
                  </Button>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="Barra"
            title="No hay rutinas para este filtro"
            description="Prueba otro filtro o vuelve a programas para cambiar el bloque activo."
          />
        )}
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
  heroCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.18),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  heroStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: withOpacity(Colors.white, 0.08),
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  filterChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  filterChipActive: {
    borderColor: withOpacity(Colors.workout, 0.28),
    backgroundColor: withOpacity(Colors.workout, 0.12),
  },
  filterChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.workout,
  },
  card: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  cardTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  cardBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  baseBadge: {
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
  },
  baseBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  programBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.24),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
  },
  programBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.16),
    backgroundColor: withOpacity(Colors.workout, 0.08),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
  },
  metaChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sessionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  flexButton: {
    flex: 1,
  },
});

