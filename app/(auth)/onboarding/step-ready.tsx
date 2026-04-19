import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useWorkout } from '@/hooks/useWorkout';
import {
  loadOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';
import type { OnboardingData } from '@/types/user';
import type { Routine } from '@/lib/workout-types';

type WorkoutExerciseMeta = {
  id: string;
  equipment: string;
};

function goalPriority(goal: OnboardingDraft['goal']) {
  switch (goal) {
    case 'gain_muscle':
      return ['hipertrofia', 'fuerza', 'base'];
    case 'lose_fat':
      return ['continuidad', 'resistencia', 'cardio'];
    case 'sport_performance':
      return ['potencia', 'fuerza', 'resistencia'];
    default:
      return ['continuidad', 'bienestar', 'funcional', 'recuperacion'];
  }
}

function equipmentScore(equipment: string | undefined, routine: Routine, exercises: WorkoutExerciseMeta[]) {
  if (!equipment) return 0;
  const routineExercises = routine.exercises
    .map((item) => exercises.find((exercise) => exercise.id === item.exercise_id))
    .filter(Boolean) as WorkoutExerciseMeta[];

  if (!routineExercises.length) return 0;

  const labels = routineExercises.map((item) => item.equipment.toLowerCase());
  const hasBarbell = labels.some((label) => label.includes('barra'));
  const hasMachine = labels.some((label) => label.includes('maquina') || label.includes('polea'));
  const allBodyweightOrBands = labels.every(
    (label) =>
      label.includes('peso corporal') ||
      label.includes('banda') ||
      label.includes('mancuerna') ||
      label.includes('colchoneta'),
  );

  if (equipment === 'gym_full') {
    return hasBarbell || hasMachine ? 3 : 1;
  }

  if (equipment === 'home_basic') {
    if (hasMachine) return -2;
    return allBodyweightOrBands ? 3 : hasBarbell ? -1 : 2;
  }

  if (equipment === 'bodyweight') {
    return allBodyweightOrBands ? 3 : hasMachine || hasBarbell ? -3 : 1;
  }

  return 0;
}

function pickRoutine({
  goal,
  equipment,
  routines,
  exercises,
}: {
  goal: OnboardingDraft['goal'];
  equipment: string | undefined;
  routines: Routine[];
  exercises: WorkoutExerciseMeta[];
}) {
  if (!routines.length) return null;
  const priorities = goalPriority(goal);
  const scored = routines.map((routine) => {
    const goalLabel = (routine.goal_tag ?? '').toLowerCase();
    const goalScore = priorities.findIndex((value) => goalLabel.includes(value));
    return {
      routine,
      score:
        (goalScore === -1 ? 0 : 10 - goalScore) +
        equipmentScore(equipment, routine, exercises) +
        (routine.is_primary ? 1 : 0),
    };
  });

  return scored.sort((left, right) => right.score - left.score)[0]?.routine ?? routines[0] ?? null;
}

function buildFallbackRoutine(goal: OnboardingDraft['goal'], equipment: string | undefined) {
  if (equipment === 'bodyweight') {
    return {
      name: 'Full Body - Inicio',
      estimated_duration_min: 25,
      exercises: [
        { exercise_name: 'Sentadilla con peso corporal', reps_target: 15 },
        { exercise_name: 'Flexiones', reps_target: 10 },
        { exercise_name: 'Zancadas alternadas', reps_target: 12 },
        { exercise_name: 'Plancha frontal', reps_target: 40 },
      ],
    };
  }

  if (goal === 'gain_muscle') {
    return {
      name: 'Full Body - Base',
      estimated_duration_min: 30,
      exercises: [
        { exercise_name: 'Press con mancuernas', reps_target: 10 },
        { exercise_name: 'Remo con mancuerna', reps_target: 12 },
        { exercise_name: 'Sentadilla goblet', reps_target: 12 },
        { exercise_name: 'Peso muerto rumano', reps_target: 10 },
      ],
    };
  }

  return {
    name: 'Full Body - Inicio',
    estimated_duration_min: 25,
    exercises: [
      { exercise_name: 'Sentadilla goblet', reps_target: 12 },
      { exercise_name: 'Press inclinado', reps_target: 10 },
      { exercise_name: 'Remo apoyado', reps_target: 12 },
      { exercise_name: 'Plancha frontal', reps_target: 40 },
    ],
  };
}

function buildStepGoal(goal: OnboardingDraft['goal']) {
  switch (goal) {
    case 'lose_fat':
      return 7500;
    case 'gain_muscle':
      return 8000;
    case 'sport_performance':
      return 9000;
    default:
      return 6500;
  }
}

export default function StepReadyScreen() {
  const { saveOnboarding, isLoading } = useAuth();
  const { routines, exercises } = useWorkout();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      setDraft(progress.data ?? null);
    })();
    return () => {
      active = false;
    };
  }, []);

  const primaryModule = useMemo(() => {
    const activeModules = Array.isArray(draft?.active_modules) ? draft.active_modules : [];
    return activeModules[0] ?? 'workout';
  }, [draft?.active_modules]);

  const suggestedRoutine = useMemo(() => {
    const picked = pickRoutine({
      goal: draft?.goal,
      equipment: draft?.equipment,
      routines,
      exercises,
    });

    if (picked) return picked;
    return buildFallbackRoutine(draft?.goal, draft?.equipment);
  }, [draft?.equipment, draft?.goal, exercises, routines]);

  const onboardingData = useMemo(() => {
    const name = draft?.name?.trim() || 'Usuario';
    return {
      name,
      age: 25,
      goal: draft?.goal ?? 'general_health',
      gender: draft?.gender ?? 'prefer_not_to_say',
      height_cm: 170,
      weight_start_kg: 70,
      activity_level: 1,
      water_goal_ml: draft?.water_goal_ml ?? 2400,
      step_goal: draft?.step_goal ?? buildStepGoal(draft?.goal),
      sleep_goal_hours: 8,
      equipment: draft?.equipment,
      active_modules: Array.isArray(draft?.active_modules) && draft.active_modules.length
        ? draft.active_modules
        : ['workout'],
      wake_time_minutes: 420,
      sleep_time_minutes: 1380,
      fasting_protocol: null,
      context_display_name: name,
      coach_display_name: name,
      notifications_permission_state: 'skipped',
      terms_accepted: true,
      privacy_accepted: true,
    } satisfies OnboardingData;
  }, [draft]);

  const completeOnboarding = async () => {
    return saveOnboarding(onboardingData);
  };

  const handlePrimaryAction = async () => {
    const ok = await completeOnboarding();
    if (!ok) return;

    if (primaryModule === 'nutrition') {
      router.replace({
        pathname: Routes.nutrition.log,
        params: { mealType: 'breakfast' },
      } as never);
      return;
    }

    if (primaryModule === 'sleep') {
      router.replace(Routes.sleep.log as never);
      return;
    }

    if (primaryModule === 'steps') {
      router.replace(Routes.tabs.home as never);
      return;
    }

    const routineId = suggestedRoutine && 'id' in suggestedRoutine ? suggestedRoutine.id : null;
    router.replace({
      pathname: Routes.workout.preview,
      params: routineId
        ? { routineId, name: suggestedRoutine.name }
        : { free: '1', name: suggestedRoutine?.name ?? 'Sesion libre' },
    } as never);
  };

  const handleExplore = async () => {
    const ok = await completeOnboarding();
    if (!ok) return;
    router.replace(Routes.tabs.home as never);
  };

  const primaryCta =
    primaryModule === 'nutrition'
      ? 'Registrar mi primera comida'
      : primaryModule === 'sleep'
        ? 'Registrar sueno de anoche'
        : primaryModule === 'steps'
          ? 'Entrar a VYRA'
          : 'Empezar mi primera rutina';

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.ready}
      eyebrow="Paso 4 de 4"
      title={
        <View>
          <Text style={styles.title}>Todo listo, {draft?.name?.trim() || 'Usuario'}.</Text>
        </View>
      }
      subtitle="Ya hay una primera accion clara esperandote."
      footer={
        <View style={styles.footer}>
          <Button onPress={handlePrimaryAction} fullWidth size="lg" haptic="medium" loading={isLoading}>
            {primaryCta}
          </Button>
          <Button onPress={handleExplore} variant="ghost" fullWidth disabled={isLoading}>
            Explorar primero
          </Button>
        </View>
      }
    >
      <Card style={styles.card} shadow={false}>
        <View style={styles.heroAccent} />
        <Text style={styles.eyebrow}>Listo para hoy</Text>

        {primaryModule === 'nutrition' ? (
          <>
            <Text style={styles.heroTitle}>Empieza registrando tu proxima comida</Text>
            <Text style={styles.heroMeta}>Tu hub de nutricion ya esta listo para foto, busqueda o log manual.</Text>
          </>
        ) : primaryModule === 'steps' ? (
          <>
            <Text style={styles.heroTitle}>Meta diaria de pasos activa</Text>
            <Text style={styles.heroMeta}>Objetivo inicial: {onboardingData.step_goal.toLocaleString('es-UY')} pasos.</Text>
          </>
        ) : primaryModule === 'sleep' ? (
          <>
            <Text style={styles.heroTitle}>Registra cuando dormiste anoche</Text>
            <Text style={styles.heroMeta}>Con ese primer dato ya podemos contextualizar mejor tus dias.</Text>
          </>
        ) : (
          <>
            <Text style={styles.heroTitle}>{suggestedRoutine?.name ?? 'Full Body - Inicio'}</Text>
            <Text style={styles.heroMeta}>
              {(suggestedRoutine?.exercises.length ?? 4)} ejercicios · {suggestedRoutine?.estimated_duration_min ?? 25} min
            </Text>
            <View style={styles.divider} />
            <View style={styles.exerciseList}>
              {(suggestedRoutine?.exercises ?? []).slice(0, 4).map((exercise) => (
                <View key={exercise.exercise_name} style={styles.exerciseRow}>
                  <Text style={styles.exerciseBullet}>○</Text>
                  <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                  <Text style={styles.exerciseReps}>3 x {exercise.reps_target}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.textPrimary,
    letterSpacing: -1.5,
  },
  footer: {
    gap: Spacing[2],
  },
  card: {
    gap: Spacing[2],
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.action,
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.action,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  heroMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.08),
    marginVertical: Spacing[1],
  },
  exerciseList: {
    gap: Spacing[2],
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  exerciseBullet: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  exerciseName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  exerciseReps: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
