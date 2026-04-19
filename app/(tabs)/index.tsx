import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useFasting } from '@/hooks/useFasting';
import { useFemaleHealth } from '@/hooks/useFemaleHealth';
import { useNutrition } from '@/hooks/useNutrition';
import { useSleep } from '@/hooks/useSleep';
import { useSteps } from '@/hooks/useSteps';
import { useWater } from '@/hooks/useWater';
import { useWeight } from '@/hooks/useWeight';
import { useWorkout } from '@/hooks/useWorkout';
import { getActiveModules } from '@/lib/active-modules';
import { getWorkoutPlanSnapshot } from '@/lib/workout-plan';

type QuickChipId = 'water' | 'sleep' | 'weight' | null;
type HeroModule =
  | 'fasting'
  | 'workout'
  | 'workout-rest'
  | 'female'
  | 'nutrition'
  | 'steps'
  | 'sleep'
  | 'default';

function getFirstName(rawName: string | null | undefined) {
  const token = rawName?.trim().split(/\s+/)[0] ?? 'Usuario';
  return token || 'Usuario';
}

function todayKey(offset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatDaysAgo(dayIso: string | null) {
  if (!dayIso) return null;
  const start = new Date(`${dayIso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - start.getTime()) / 86400000);
}

function formatSleepHours(hours: number) {
  return `${hours.toFixed(1)} h`;
}

function formatHeroCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getHeroModule(
  modules: string[],
  state: {
    fastingActive: boolean;
    workoutScheduledToday: boolean;
    workoutModuleEnabled: boolean;
    cyclePhase: string | null;
  },
): HeroModule {
  if (modules.includes('fasting') && state.fastingActive) return 'fasting';
  if (state.workoutModuleEnabled && state.workoutScheduledToday) return 'workout';
  if (state.workoutModuleEnabled && !state.workoutScheduledToday) return 'workout-rest';
  if (modules.includes('female') && state.cyclePhase) return 'female';
  if (modules.includes('nutrition')) return 'nutrition';
  if (modules.includes('steps')) return 'steps';
  if (modules.includes('sleep') && modules.length === 1) return 'sleep';
  return 'default';
}

function buildContextLine(input: {
  name: string;
  streak: number;
  fastingActive: boolean;
  isRestDay: boolean;
  lastCompletionDaysAgo: number | null;
}) {
  if (input.fastingActive) return 'Tu ayuno sigue en marcha.';
  if (input.isRestDay) return 'Hoy descansas. Manana volvemos fuerte.';
  if (input.streak >= 7) return 'Una semana completa. Ya es un habito.';
  if (input.streak >= 3) return `Llevas ${input.streak} dias seguidos. No pares ahora.`;
  if (input.lastCompletionDaysAgo !== null && input.lastCompletionDaysAgo >= 3) {
    return `Estuviste ${input.lastCompletionDaysAgo} dias. Volviste. Eso importa.`;
  }
  const weekday = new Date().getDay();
  if (weekday === 1) return 'Lunes. Buen dia para empezar la semana.';
  if (weekday === 5) return 'Ultimo dia de semana. Cierrala bien.';
  return `Hola, ${input.name}. Asi empieza todo.`;
}

function buildWeekDots(isCompleted: (dayIso: string) => boolean) {
  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return Array.from({ length: 7 }, (_, index) => {
    const dayOffset = 6 - index;
    const iso = todayKey(-dayOffset);
    return {
      key: iso,
      label: labels[index] ?? '',
      dayNumber: Number(iso.slice(8, 10)),
      done: isCompleted(iso),
      isToday: dayOffset === 0,
    };
  });
}

function levelDots(exerciseCount: number) {
  const filled = Math.min(4, Math.max(1, Math.round(exerciseCount / 2)));
  return `${'●'.repeat(filled)}${'○'.repeat(Math.max(0, 4 - filled))}`;
}

function ModuleChip({
  icon,
  label,
  value,
  color,
  active = false,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.quickChip, active && styles.quickChipActive]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={color} />
      <View style={styles.quickChipCopy}>
        <Text style={styles.quickChipLabel}>{label}</Text>
        <Text style={styles.quickChipValue}>{value}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const profile = useAuthStore((state) => state.profile);
  const name = getFirstName(profile?.name);
  const streak = Number(profile?.current_streak ?? profile?.streak ?? 0);
  const activeModules = getActiveModules(profile);

  const { totalHydro, logWater, isLogging: waterSaving } = useWater();
  const { lastDurationHours, lastSleep, logSleepAsync, isLogging: sleepSaving } = useSleep();
  const { stats, logWeight, saving: weightSaving } = useWeight();
  const { totalSteps, goal: stepGoal, progressPct: stepProgress, remaining: stepsRemaining } = useSteps();
  const { totals, simpleTargets, weeklyData: nutritionWeekly } = useNutrition();
  const { isActive: fastingActive, elapsedSeconds, remainingMs, progressPct: fastingPct, protocol, completeFast } =
    useFasting();
  const { currentPhase, daysInPhase, history: femaleHistory, isInCycle } = useFemaleHealth();
  const { activeSession, history, routines, getActiveProgram, getRecommendedRoutine } = useWorkout();

  const [activeChip, setActiveChip] = useState<QuickChipId>(null);
  const [waterValue, setWaterValue] = useState('300');
  const [sleepValue, setSleepValue] = useState(lastDurationHours ? lastDurationHours.toFixed(1) : '7.5');
  const [weightValue, setWeightValue] = useState(stats.current ? stats.current.toFixed(1) : '');
  const [showAlternatives, setShowAlternatives] = useState(false);

  const activeProgram = useMemo(() => getActiveProgram(), [getActiveProgram]);
  const recommendedRoutine = useMemo(() => getRecommendedRoutine().routine, [getRecommendedRoutine]);
  const workoutPlan = useMemo(
    () =>
      getWorkoutPlanSnapshot({
        routines,
        history,
        activeProgram,
        fallbackRoutine: recommendedRoutine,
      }),
    [activeProgram, history, recommendedRoutine, routines],
  );

  const currentRoutine = workoutPlan.todayRoutine ?? workoutPlan.nextRoutine ?? recommendedRoutine;
  const workoutScheduledToday = Boolean(activeSession) || Boolean(workoutPlan.todayRoutine);
  const heroModule = getHeroModule(activeModules, {
    fastingActive,
    workoutScheduledToday,
    workoutModuleEnabled: activeModules.includes('workout'),
    cyclePhase: isInCycle ? currentPhase : null,
  });

  const workoutHistoryDays = useMemo(() => new Set(history.map((item) => item.started_at.slice(0, 10))), [history]);
  const nutritionHistoryDays = useMemo(
    () => new Set(nutritionWeekly.filter((item) => Number(item.calories ?? 0) > 0).map((item) => item.date)),
    [nutritionWeekly],
  );
  const sleepHistoryDays = useMemo(
    () => new Set((lastSleep ? [lastSleep.end_time.slice(0, 10)] : [])),
    [lastSleep],
  );
  const fastingHistoryDays = useMemo(() => {
    const set = new Set<string>();
    if (fastingActive) set.add(todayKey());
    return set;
  }, [fastingActive]);
  const femaleHistoryDays = useMemo(
    () => new Set(femaleHistory.map((entry) => entry.logged_at.slice(0, 10))),
    [femaleHistory],
  );

  const isCompletedByHero = (dayIso: string) => {
    switch (heroModule) {
      case 'fasting':
        return fastingHistoryDays.has(dayIso);
      case 'female':
        return femaleHistoryDays.has(dayIso);
      case 'nutrition':
        return nutritionHistoryDays.has(dayIso);
      case 'sleep':
        return sleepHistoryDays.has(dayIso);
      case 'steps':
        return dayIso === todayKey() ? stepProgress >= 50 : false;
      case 'workout':
      case 'workout-rest':
      default:
        return workoutHistoryDays.has(dayIso);
    }
  };

  const weekDots = useMemo(
    () => buildWeekDots(isCompletedByHero),
    [heroModule, workoutHistoryDays, nutritionHistoryDays, sleepHistoryDays, fastingHistoryDays, femaleHistoryDays, stepProgress],
  );

  const lastCompletionDaysAgo = useMemo(() => {
    switch (heroModule) {
      case 'fasting':
        return fastingActive ? 0 : null;
      case 'female':
        return femaleHistory[0]?.logged_at ? formatDaysAgo(femaleHistory[0].logged_at.slice(0, 10)) : null;
      case 'nutrition':
        return nutritionWeekly[nutritionWeekly.length - 1]?.date
          ? formatDaysAgo(nutritionWeekly[nutritionWeekly.length - 1]?.date ?? null)
          : null;
      case 'sleep':
        return lastSleep?.end_time ? formatDaysAgo(lastSleep.end_time.slice(0, 10)) : null;
      case 'steps':
        return stepProgress >= 50 ? 0 : null;
      case 'workout':
      case 'workout-rest':
      default:
        return history[0]?.started_at ? formatDaysAgo(history[0].started_at.slice(0, 10)) : null;
    }
  }, [fastingActive, femaleHistory, heroModule, history, lastSleep?.end_time, nutritionWeekly, stepProgress]);

  const contextLine = buildContextLine({
    name,
    streak,
    fastingActive,
    isRestDay: workoutPlan.isRestDay,
    lastCompletionDaysAgo,
  });

  const alternatives = useMemo(() => {
    if (!currentRoutine) return routines.slice(0, 4);
    return routines.filter((routine) => routine.id !== currentRoutine.id).slice(0, 4);
  }, [currentRoutine, routines]);

  const activeProgramWeek = useMemo(() => {
    if (!activeProgram) return 1;
    const sessionsPerWeek = Math.max(1, activeProgram.days_per_week || 4);
    return Math.min(
      activeProgram.duration_weeks || 4,
      Math.max(1, Math.floor(history.length / sessionsPerWeek) + 1),
    );
  }, [activeProgram, history.length]);

  const handleWorkout = () => {
    if (activeSession) {
      router.push(Routes.workout.session as never);
      return;
    }

    if (currentRoutine) {
      router.push({
        pathname: Routes.workout.preview,
        params: { routineId: currentRoutine.id, name: currentRoutine.name },
      } as never);
      return;
    }

    router.push({
      pathname: Routes.workout.preview,
      params: { free: '1', name: 'Sesion libre' },
    } as never);
  };

  const handleQuickSave = async () => {
    if (activeChip === 'water') {
      const parsed = Number(waterValue.replace(',', '.'));
      if (Number.isFinite(parsed) && parsed > 0) {
        logWater(Math.round(parsed));
        setActiveChip(null);
      }
      return;
    }

    if (activeChip === 'sleep') {
      const parsed = Number(sleepValue.replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed < 1) return;
      const wakeMinutes = profile?.wake_time_minutes ?? 420;
      const wake = new Date();
      wake.setHours(Math.floor(wakeMinutes / 60), wakeMinutes % 60, 0, 0);
      const bedtime = new Date(wake.getTime() - parsed * 60 * 60 * 1000);
      await logSleepAsync({
        bedtime,
        wakeTime: wake,
        quality: 3,
        deepSleep: 22,
        remSleep: 23,
      });
      setActiveChip(null);
      return;
    }

    if (activeChip === 'weight') {
      const parsed = Number(weightValue.replace(',', '.'));
      if (Number.isFinite(parsed) && parsed > 0) {
        await logWeight(parsed);
        setActiveChip(null);
      }
    }
  };

  const quickSaving = waterSaving || sleepSaving || weightSaving;
  const showStreakInHeader = streak >= 3;
  const showNutritionChip = activeModules.includes('nutrition') && heroModule !== 'nutrition';
  const showWaterChip = activeModules.includes('water');
  const showSleepChip = activeModules.includes('sleep');
  const showPauseBanner = lastCompletionDaysAgo !== null && lastCompletionDaysAgo >= 2;

  const renderHero = () => {
    if (heroModule === 'fasting') {
      return (
        <Card style={styles.heroCard} shadow={false}>
          <View style={[styles.heroAccent, { backgroundColor: Colors.fasting }]} />
          <Text style={[styles.heroEyebrow, { color: Colors.fasting }]}>Ayuno activo</Text>
          <Text style={styles.heroBigNumber}>{formatHeroCountdown(remainingMs)}</Text>
          <Text style={styles.heroMeta}>
            restantes · Protocolo {protocol} · {Math.floor(elapsedSeconds / 3600)}h{' '}
            {Math.floor((elapsedSeconds % 3600) / 60)}m completadas
          </Text>
          <View style={styles.inlineProgressTrack}>
            <View
              style={[
                styles.inlineProgressFill,
                { width: `${fastingPct}%`, backgroundColor: Colors.fasting },
              ]}
            />
          </View>
          <Button onPress={() => void completeFast()} fullWidth size="lg" haptic="medium">
            Completar ayuno
          </Button>
        </Card>
      );
    }

    if (heroModule === 'female') {
      return (
        <Card style={styles.heroCard} shadow={false}>
          <View style={[styles.heroAccent, { backgroundColor: Colors.female }]} />
          <Text style={[styles.heroEyebrow, { color: Colors.female }]}>Ciclo</Text>
          <Text style={styles.heroTitle}>{`Fase ${currentPhase} · Dia ${daysInPhase + 1}`}</Text>
          <Text style={styles.heroMeta}>
            {currentPhase === 'ovulation'
              ? 'Energia alta. Buen momento para entrenar fuerte o hacer actividad intensa.'
              : 'Tu fase actual ya esta disponible como contexto del dia.'}
          </Text>
          <Button onPress={() => router.push(Routes.female.index as never)} fullWidth size="lg" haptic="medium">
            Registrar hoy
          </Button>
        </Card>
      );
    }

    if (heroModule === 'nutrition') {
      return (
        <Card style={styles.heroCard} shadow={false}>
          <View style={[styles.heroAccent, { backgroundColor: Colors.nutrition }]} />
          <Text style={[styles.heroEyebrow, { color: Colors.nutrition }]}>Nutricion</Text>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                {Math.round(totals.calories).toLocaleString('es-UY')} /{' '}
                {Math.round(simpleTargets.calories).toLocaleString('es-UY')} kcal
              </Text>
              <Text style={styles.heroMeta}>
                P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · G {Math.round(totals.fat)}g
              </Text>
            </View>
            <Pressable style={styles.swapButton} onPress={() => router.push(Routes.nutrition.log as never)}>
              <Ionicons name="swap-horizontal-outline" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
          <Button
            onPress={() =>
              router.push({ pathname: Routes.nutrition.log, params: { mealType: 'lunch' } } as never)
            }
            fullWidth
            size="lg"
            haptic="medium"
          >
            Registrar comida
          </Button>
        </Card>
      );
    }

    if (heroModule === 'steps') {
      return (
        <Card style={styles.heroCard} shadow={false}>
          <View style={[styles.heroAccent, { backgroundColor: Colors.steps }]} />
          <Text style={[styles.heroEyebrow, { color: Colors.steps }]}>Pasos</Text>
          <Text style={styles.heroBigNumber}>{Math.round(totalSteps).toLocaleString('es-UY')}</Text>
          <Text style={styles.heroMeta}>
            {Math.round(stepProgress)}% de {stepGoal.toLocaleString('es-UY')} pasos ·{' '}
            {Math.round(stepsRemaining).toLocaleString('es-UY')} para la meta
          </Text>
          <Pressable style={styles.ghostHeroLink} onPress={() => router.push(Routes.steps.index as never)}>
            <Text style={styles.ghostHeroLinkText}>Ver detalles</Text>
          </Pressable>
        </Card>
      );
    }

    if (heroModule === 'sleep') {
      return (
        <Card style={styles.heroCard} shadow={false}>
          <View style={[styles.heroAccent, { backgroundColor: Colors.sleep }]} />
          <Text style={[styles.heroEyebrow, { color: Colors.sleep }]}>Sueno</Text>
          <Text style={styles.heroTitle}>
            {lastDurationHours ? formatSleepHours(lastDurationHours) : 'Sin dato de anoche'}
          </Text>
          <Text style={styles.heroMeta}>
            {lastDurationHours && lastDurationHours >= 7
              ? 'Dormiste bien. Puedes sostener una carga normal hoy.'
              : 'Registra tu sueno para contextualizar mejor el dia.'}
          </Text>
          <Button onPress={() => router.push(Routes.sleep.index as never)} fullWidth size="lg" haptic="medium">
            {lastDurationHours ? 'Ver sueno' : 'Registrar sueno'}
          </Button>
        </Card>
      );
    }

    if (heroModule === 'workout-rest') {
      return (
        <Card style={styles.heroCard} shadow={false}>
          <View style={[styles.heroAccent, { backgroundColor: Colors.workout }]} />
          <Text style={[styles.heroEyebrow, { color: Colors.workout }]}>Hoy · descanso</Text>
          <Text style={styles.heroTitle}>{currentRoutine?.name ?? 'Recuperacion activa'}</Text>
          <Text style={styles.heroMeta}>
            Hoy toca bajar carga. Si quieres, puedes mirar la siguiente sesion del bloque.
          </Text>
          <Button
            onPress={() => router.push(Routes.workout.preview as never)}
            variant="ghost"
            fullWidth
            color={Colors.textSecondary}
          >
            Ver manana
          </Button>
        </Card>
      );
    }

    return (
      <Card style={styles.heroCard} shadow={false}>
        <View style={[styles.heroAccent, { backgroundColor: Colors.workout }]} />
        <Text style={[styles.heroEyebrow, { color: Colors.workout }]}>Hoy</Text>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              {activeSession ? activeSession.name || 'Sesion en curso' : currentRoutine?.name ?? 'Entrena hoy'}
            </Text>
            <Text style={styles.heroMeta}>
              {activeSession
                ? `${activeSession.exercises.length || activeSession.sets.length} ejercicios · sesion abierta`
                : `${currentRoutine?.exercises.length ?? 4} ejercicios · ~${currentRoutine?.estimated_duration_min ?? 30} min · Semana ${activeProgramWeek}/${activeProgram?.duration_weeks ?? 4}`}
            </Text>
          </View>
          {!activeSession ? (
            <Pressable style={styles.swapButton} onPress={() => setShowAlternatives((value) => !value)}>
              <Ionicons name="swap-horizontal-outline" size={18} color={Colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.heroStats}>
          <Text style={styles.heroStat}>
            Musculos:{' '}
            {currentRoutine?.exercises
              .slice(0, 2)
              .map((item) => item.exercise_name.split(' ')[0])
              .join(', ') || 'Total body'}
          </Text>
          <Text style={styles.heroStat}>Nivel: {levelDots(currentRoutine?.exercises.length ?? 4)}</Text>
        </View>

        {showAlternatives && alternatives.length ? (
          <View style={styles.alternatives}>
            {alternatives.map((routine) => (
              <Pressable
                key={routine.id}
                style={styles.alternativeRow}
                onPress={() =>
                  router.push({
                    pathname: Routes.workout.preview,
                    params: { routineId: routine.id, name: routine.name },
                  } as never)
                }
              >
                <Text style={styles.alternativeName}>{routine.name}</Text>
                <Text style={styles.alternativeMeta}>
                  {routine.exercises.length} ejercicios · {routine.estimated_duration_min ?? 30} min
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Button onPress={handleWorkout} fullWidth size="lg" haptic="medium">
          {activeSession ? 'Volver al entreno' : 'Entrenar ahora'}
        </Button>
      </Card>
    );
  };

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.greeting}>Hola, {name}</Text>
          </View>

          <Pressable style={styles.profileButton} onPress={() => router.push(Routes.profile.index as never)}>
            <Ionicons name="person-circle-outline" size={24} color={Colors.textMuted} />
            {showStreakInHeader ? <Text style={styles.streak}>🔥 {streak}</Text> : null}
          </Pressable>
        </View>

        <Text style={styles.contextLine}>{contextLine}</Text>

        {renderHero()}

        <View style={styles.weekSection}>
          <Text style={styles.sectionLabel}>Esta semana</Text>
          <View style={styles.weekRow}>
            {weekDots.map((day) => (
              <View
                key={day.key}
                style={[
                  styles.weekDot,
                  day.done && styles.weekDotDone,
                  day.isToday && !day.done && styles.weekDotToday,
                ]}
              >
                <Text style={[styles.weekDotText, day.done && styles.weekDotTextDone]}>
                  {day.dayNumber}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.quickRow}>
          {showWaterChip ? (
            <ModuleChip
              icon="water-outline"
              label="Agua"
              value={`${Math.round(totalHydro)} ml`}
              color={Colors.water}
              active={activeChip === 'water'}
              onPress={() => setActiveChip(activeChip === 'water' ? null : 'water')}
            />
          ) : null}

          {showSleepChip ? (
            <ModuleChip
              icon="moon-outline"
              label="Sueno"
              value={lastDurationHours ? formatSleepHours(lastDurationHours) : 'sin dato'}
              color={Colors.sleep}
              active={activeChip === 'sleep'}
              onPress={() => setActiveChip(activeChip === 'sleep' ? null : 'sleep')}
            />
          ) : null}

          <ModuleChip
            icon="scale-outline"
            label="Peso"
            value={stats.current ? `${stats.current.toFixed(1)} kg` : 'sin dato'}
            color={Colors.textSecondary}
            active={activeChip === 'weight'}
            onPress={() => setActiveChip(activeChip === 'weight' ? null : 'weight')}
          />

          {showNutritionChip ? (
            <ModuleChip
              icon="restaurant-outline"
              label="Nutricion"
              value={`${Math.round(totals.calories).toLocaleString('es-UY')} kcal`}
              color={Colors.nutrition}
              onPress={() => router.push(Routes.nutrition.index as never)}
            />
          ) : null}
        </View>

        {activeChip ? (
          <Card style={styles.inlineCard} shadow={false}>
            <Text style={styles.inlineTitle}>
              {activeChip === 'water'
                ? 'Registrar agua'
                : activeChip === 'sleep'
                  ? 'Registrar sueno'
                  : 'Registrar peso'}
            </Text>

            {activeChip === 'water' ? (
              <View style={styles.quickPresetRow}>
                {[250, 500, 750].map((amount) => (
                  <Pressable
                    key={amount}
                    style={styles.quickPreset}
                    onPress={() => setWaterValue(String(amount))}
                  >
                    <Text style={styles.quickPresetText}>{amount}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Input
              value={activeChip === 'water' ? waterValue : activeChip === 'sleep' ? sleepValue : weightValue}
              onChangeText={(value) => {
                if (activeChip === 'water') setWaterValue(value);
                if (activeChip === 'sleep') setSleepValue(value);
                if (activeChip === 'weight') setWeightValue(value);
              }}
              keyboardType="decimal-pad"
              unit={activeChip === 'water' ? 'ml' : activeChip === 'sleep' ? 'h' : 'kg'}
              placeholder={activeChip === 'sleep' ? 'Horas dormidas' : ''}
            />
            <Button onPress={() => void handleQuickSave()} fullWidth loading={quickSaving}>
              Guardar
            </Button>
          </Card>
        ) : null}

        {showPauseBanner ? (
          <View style={styles.pauseBanner}>
            <Text style={styles.pauseText}>Tu racha esta en pausa. Hoy puedes reactivarla.</Text>
            <Pressable
              onPress={
                heroModule === 'workout' || heroModule === 'workout-rest'
                  ? handleWorkout
                  : () => router.push(Routes.tabs.home as never)
              }
            >
              <Text style={styles.pauseLink}>Empezar</Text>
            </Pressable>
          </View>
        ) : null}
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.actionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.action,
  },
  greeting: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  profileButton: {
    minWidth: 32,
    alignItems: 'flex-end',
    gap: 2,
  },
  streak: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.action,
  },
  contextLine: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  heroCard: {
    minHeight: 230,
    gap: Spacing[3],
    padding: Spacing[5],
    overflow: 'hidden',
    backgroundColor: Colors.bgSurface,
  },
  heroAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  heroEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  heroCopy: {
    flex: 1,
    gap: Spacing[1],
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  heroBigNumber: {
    fontFamily: FontFamily.display,
    fontSize: 42,
    lineHeight: 44,
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  heroMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  heroStats: {
    gap: Spacing[1],
    marginTop: 'auto',
  },
  heroStat: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  alternatives: {
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    overflow: 'hidden',
  },
  alternativeRow: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(Colors.white, 0.05),
    gap: 2,
  },
  alternativeName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  alternativeMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  inlineProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  inlineProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  ghostHeroLink: {
    alignSelf: 'flex-start',
  },
  ghostHeroLinkText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  weekSection: {
    gap: Spacing[2],
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotDone: {
    backgroundColor: Colors.action,
  },
  weekDotToday: {
    borderWidth: 1.5,
    borderColor: Colors.action,
    backgroundColor: 'transparent',
  },
  weekDotText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekDotTextDone: {
    color: Colors.white,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  quickChip: {
    minHeight: 44,
    minWidth: 124,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  quickChipActive: {
    borderWidth: 1,
    borderColor: Colors.actionBorder,
    backgroundColor: Colors.actionBg,
  },
  quickChipCopy: {
    gap: 1,
  },
  quickChipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  quickChipValue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  inlineCard: {
    gap: Spacing[2],
  },
  inlineTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  quickPresetRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  quickPreset: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  quickPresetText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  pauseBanner: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.action,
    borderRadius: Radius.sm,
    backgroundColor: Colors.actionBg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  pauseText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pauseLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.action,
  },
});
