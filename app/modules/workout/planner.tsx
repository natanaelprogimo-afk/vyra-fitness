import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWorkout } from '@/hooks/useWorkout';

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getWeekDates() {
  const today = new Date();
  const day = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return WEEK_DAYS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { label, date };
  });
}

export default function WorkoutPlannerScreen() {
  const { routines, history, getActiveProgram } = useWorkout();
  const activeProgram = getActiveProgram();

  const completedDays = useMemo(() => {
    const set = new Set<string>();
    history.forEach((entry) => set.add(entry.started_at.split('T')[0] ?? ''));
    return set;
  }, [history]);

  const schedule = useMemo(() => {
    const week = getWeekDates();
    if (!activeProgram?.routine_ids?.length) {
      return week.map((entry) => ({ ...entry, routine: null, completed: completedDays.has(entry.date.toISOString().split('T')[0] ?? '') }));
    }
    return week.map((entry, index) => {
      const routineId = activeProgram.routine_ids[index % activeProgram.routine_ids.length];
      const routine = routines.find((item) => item.id === routineId) ?? null;
      const dayKey = entry.date.toISOString().split('T')[0] ?? '';
      return { ...entry, routine, completed: completedDays.has(dayKey) };
    });
  }, [activeProgram, completedDays, routines]);

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header eyebrow="Entreno" title="Plan semanal" color={Colors.workout} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card accentColor={Colors.workout} decorative style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Semana en una vista</Text>
          <Text style={styles.heroTitle}>{activeProgram?.name ?? 'Semana libre'}</Text>
          <Text style={styles.heroBody}>
            {activeProgram
              ?  'Podés leer el bloque completo de la semana y ver rápido qué días ya quedaron hechos.'
              : 'No hay programa activo. Usá esta vista para decidir cuándo empujar y cuándo recuperar.'}
          </Text>
        </Card>

        {schedule.map((entry) => (
          <Card key={`${entry.label}-${entry.date.toISOString()}`} style={styles.dayCard}>
            <View style={styles.dayRow}>
              <View style={[styles.dayBadge, entry.completed && styles.dayBadgeCompleted]}>
                <Text style={[styles.dayBadgeText, entry.completed && styles.dayBadgeTextCompleted]}>{entry.label}</Text>
              </View>
              <View style={styles.dayCopy}>
                <Text style={styles.dayTitle}>{entry.routine?.name ?? 'Descanso / movilidad'}</Text>
                <Text style={styles.dayBody}>
                  {entry.routine?.estimated_duration_min
                    ?  `${entry.routine.estimated_duration_min} min · ${entry.routine.exercises.length} ejercicios`
                    : 'Sesión libre o recuperación'}
                </Text>
              </View>
              <View style={styles.dayMeta}>
                <Text style={styles.dayDate}>{entry.date.getDate()}</Text>
                <Text style={[styles.dayStatus, { color: entry.completed ? Colors.success : Colors.textMuted }]}>
                  {entry.completed ? 'Hecho' : 'Pend.'}
                </Text>
              </View>
            </View>
          </Card>
        ))}

        <Card style={styles.legendCard}>
          <Text style={styles.legendTitle}>Lectura rápida</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendText}>día con entrenamiento registrado</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: withOpacity(Colors.workout, 0.18) }]} />
            <Text style={styles.legendText}>día planificado pendiente</Text>
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
    gap: Spacing[3],
  },
  heroCard: {
    gap: Spacing[2],
  },
  heroEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.workout,
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
  dayCard: {
    paddingVertical: Spacing[3],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  dayBadge: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg,
    backgroundColor: Colors.workoutBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.workout,
  },
  dayBadgeCompleted: {
    backgroundColor: withOpacity(Colors.success, 0.16),
    borderColor: Colors.success,
  },
  dayBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.workout,
  },
  dayBadgeTextCompleted: {
    color: Colors.success,
  },
  dayCopy: {
    flex: 1,
    gap: 4,
  },
  dayTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  dayBody: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dayMeta: {
    width: 44,
    alignItems: 'flex-end',
    gap: 2,
  },
  dayDate: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  dayStatus: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  legendCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface2, 0.82),
  },
  legendTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  legendText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
