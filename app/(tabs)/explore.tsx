import { useCallback, useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SafeScreen from '@/components/ui/SafeScreen';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useReadiness } from '@/hooks/useReadiness';
import { useWorkout } from '@/hooks/useWorkout';
import { preloadPlacement, tryShowInterstitialPlacement } from '@/lib/ads/runtime';
import { getActiveModules } from '@/lib/active-modules';
import { getWorkoutDisplayName } from '@/lib/workout-data';
import { useAuthStore } from '@/stores/authStore';

type ExploreCard = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  route: string;
  accent: string;
};

function getGoalLabel(goal: string | null | undefined) {
  switch (goal) {
    case 'lose_fat':
      return 'Perder grasa';
    case 'gain_muscle':
      return 'Ganar musculo';
    case 'performance':
    case 'sport_performance':
      return 'Rendimiento';
    case 'health':
    case 'general_health':
      return 'Ordenar hábitos';
    case 'mental':
    case 'mental_wellbeing':
      return 'Recuperación';
    default:
      return 'Tu camino actual';
  }
}

function getWeekNumber(historyCount: number, daysPerWeek: number) {
  return Math.max(1, Math.floor(historyCount / Math.max(1, daysPerWeek)) + 1);
}

function isWithinLastDays(iso: string, days: number) {
  const date = new Date(iso);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  cutoff.setHours(0, 0, 0, 0);
  return date.getTime() >= cutoff.getTime();
}

export default function ExploreScreen() {
  const profile = useAuthStore((state) => state.profile);
  const streak = Number(profile?.current_streak ?? profile?.streak ?? 0);
  const activeModules = getActiveModules(profile);
  const { crossModuleInsights, morningNarrative, focusActions } = useReadiness();
  const {
    activeSession,
    history,
    getActiveProgram,
    getRecommendedRoutine,
  } = useWorkout();

  const activeProgram = useMemo(() => getActiveProgram(), [getActiveProgram]);
  const recommendedRoutine = useMemo(() => getRecommendedRoutine().routine, [getRecommendedRoutine]);
  const activeGoal = getGoalLabel(profile?.primary_goal ?? profile?.goal ?? null);
  const weeklyGoal = Math.max(1, activeProgram?.days_per_week ?? 4);
  const sessionsThisWeek = history.filter((item) => isWithinLastDays(item.started_at, 7)).length;
  const programProgressPct = activeProgram
    ? Math.min(
        100,
        Math.round(
          (history.length / Math.max(1, (activeProgram.days_per_week || 4) * (activeProgram.duration_weeks || 4))) * 100,
        ),
      )
    : null;
  const programWeek = getWeekNumber(history.length, weeklyGoal);
  const nextWorkoutRoute = activeSession
    ? Routes.workout.session
    : recommendedRoutine
      ? Routes.workout.preview
      : Routes.workout.programs;
  const nextWorkoutParams = activeSession
    ? undefined
    : recommendedRoutine
      ? { routineId: recommendedRoutine.id, name: getWorkoutDisplayName(recommendedRoutine.name) }
      : undefined;
  const mainCoachingLine =
    crossModuleInsights[0] ??
    morningNarrative ??
    'Sostener una sola decisión bien elegida esta semana mueve más la aguja que abrir diez caminos a la vez.';
  const nextFocus = focusActions[0];

  const recommendations = useMemo<ExploreCard[]>(() => {
    const cards: ExploreCard[] = [];

    if (nextFocus?.route) {
      cards.push({
        key: 'next-focus',
        eyebrow: 'Siguiente ajuste',
        title: nextFocus.title,
        body: 'La lectura contextual de hoy ya encontro lo que más conviene empujar primero.',
        route: nextFocus.route,
        accent: Colors.action,
      });
    }

    if (activeModules.includes('workout')) {
      cards.push({
        key: 'workout-program',
        eyebrow: 'Entrenamiento',
        title: activeProgram ? 'Abrir tu bloque actual' : 'Elegir un programa guiado',
        body: activeProgram
          ? 'Revisa semanas, días y continuidad de carga sin salirte del camino principal.'
          : 'Empieza con una ruta clara en vez de navegar rutinas sueltas sin prioridad.',
        route: Routes.workout.programs,
        accent: Colors.workout,
      });
    }

    if (activeModules.includes('nutrition')) {
      cards.push({
        key: 'nutrition-reset',
        eyebrow: 'Nutrición',
        title: 'Reset nutricional simple',
        body: 'Un día bien registrado vale más que una planilla compleja que no llegas a usar.',
        route: Routes.nutrition.log,
        accent: Colors.nutrition,
      });
    }

    if (activeModules.includes('sleep')) {
      cards.push({
        key: 'sleep-track',
        eyebrow: 'Recuperación',
        title: 'Dormir mejor esta semana',
        body: 'Ajusta descanso antes de pedirle más fuerza y más constancia al día.',
        route: Routes.sleep.index,
        accent: Colors.sleep,
      });
    }

    if (activeModules.includes('water')) {
      cards.push({
        key: 'water-rhythm',
        eyebrow: 'Recuperación',
        title: 'Rutina de hidratación',
        body: 'Una base simple de agua y ritmo diario hace que el resto del sistema rinda mejor.',
        route: Routes.water.index,
        accent: Colors.water,
      });
    }

    return cards.slice(0, 4);
  }, [activeModules, activeProgram, nextFocus?.route, nextFocus?.title]);

  const libraryCards = useMemo<ExploreCard[]>(() => {
    const cards: ExploreCard[] = [];

    if (activeModules.includes('workout')) {
      cards.push({
        key: 'planner',
        eyebrow: 'Biblioteca útil',
        title: 'Plan semanal',
        body: 'Visualiza la semana y prepara el siguiente bloque sin abrir módulos de más.',
        route: Routes.workout.planner,
        accent: Colors.workout,
      });
    }

    if (activeModules.includes('nutrition')) {
      cards.push({
        key: 'nutrition-log',
        eyebrow: 'Biblioteca útil',
        title: 'Registrar una comida',
        body: 'Vuelve a lo básico y deja el día más claro en dos pasos.',
        route: Routes.nutrition.log,
        accent: Colors.nutrition,
      });
    }

    if (activeModules.includes('sleep')) {
      cards.push({
        key: 'sleep-hub',
        eyebrow: 'Biblioteca útil',
        title: 'Ver descanso',
        body: 'Lee la última noche y baja o sube carga con más criterio.',
        route: Routes.sleep.index,
        accent: Colors.sleep,
      });
    }

    cards.push({
      key: 'progress',
      eyebrow: 'Biblioteca útil',
      title: 'Leer progreso real',
      body: 'Si quieres contexto más profundo, aquí ves tendencia y no solo registros sueltos.',
      route: Routes.tabs.progress,
      accent: Colors.brand,
    });

    return cards.slice(0, 4);
  }, [activeModules]);

  const milestoneCopy =
    sessionsThisWeek >= weeklyGoal
      ? 'Semana encaminada. Ahora toca sostener la calidad del bloque y no sumar ruido.'
      : `Te faltan ${weeklyGoal - sessionsThisWeek} sesiones para cerrar tu objetivo semanal.`;

  useEffect(() => {
    void preloadPlacement('explore_deep_dive').catch((e) => {
      console.debug?.('[explore] preloadPlacement failed', e);
    });
  }, []);

  const handleExploreNavigation = useCallback(
    async (
      route: string,
      params?: Record<string, string>,
    ) => {
      const destination = params
        ? ({ pathname: route, params } as never)
        : (route as never);

      try {
        await tryShowInterstitialPlacement('explore_deep_dive');
      } catch {
        // Si el interstitial falla, igual seguimos navegando sin ruido.
      } finally {
        router.push(destination);
      }
    },
    [],
  );

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <Header title="Explorar" showBack={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard} shadow={false} accentColor={Colors.action}>
          <Text style={styles.eyebrow}>Objetivo activo</Text>
          <Text style={styles.heroTitle}>{activeGoal}</Text>
          <Text style={styles.heroBody}>
            Explorar ya no actua como una segunda home: desde aquí deberías ver tu camino, tu bloque y el siguiente paso útil.
          </Text>
        </Card>

        <Card style={styles.programCard} shadow={false} accentColor={Colors.workout}>
          <View style={styles.programHeader}>
            <View style={styles.programCopy}>
              <Text style={styles.sectionTitle}>Programa activo</Text>
              <Text style={styles.programName}>
                {activeProgram?.name ?? getWorkoutDisplayName(recommendedRoutine?.name) ?? 'Todavía no hay un programa elegido'}
              </Text>
              <Text style={styles.sectionBody}>
                {activeProgram
                  ? `Semana ${programWeek}. El bloque ya está corriendo y la siguiente decisión debería salir de aquí.`
                  : recommendedRoutine
                    ? 'No hay un programa activo, pero ya hay una rutina sugerida para empezar con dirección.'
                    : 'Lo mejor ahora es elegir una ruta guiada en vez de navegar el catalogo completo.'}
              </Text>
            </View>
            <View style={styles.programBadge}>
              <Ionicons name="layers-outline" size={20} color={Colors.workout} />
            </View>
          </View>

          <View style={styles.programStats}>
            <View style={styles.programStat}>
              <Text style={styles.programStatLabel}>Siguiente acción</Text>
              <Text style={styles.programStatValue}>
                {activeSession
                  ? 'Volver a sesión'
                  : getWorkoutDisplayName(recommendedRoutine?.name) ?? 'Elegir programa'}
              </Text>
            </View>
            <View style={styles.programStat}>
              <Text style={styles.programStatLabel}>Progreso</Text>
              <Text style={styles.programStatValue}>
                {programProgressPct !== null ? `${programProgressPct}%` : `${sessionsThisWeek}/${weeklyGoal} esta semana`}
              </Text>
            </View>
          </View>

          {programProgressPct !== null ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${programProgressPct}%` }]} />
            </View>
          ) : null}

          <Button
            onPress={() =>
              router.push(
                nextWorkoutParams
                  ? ({ pathname: nextWorkoutRoute, params: nextWorkoutParams } as never)
                  : (nextWorkoutRoute as never),
              )
            }
            fullWidth
            color={Colors.workout}
          >
            {activeProgram || activeSession ? 'Seguir programa' : 'Elegir programa'}
          </Button>
        </Card>

        <Card shadow={false}>
          <Text style={styles.sectionTitle}>Recomendados para ti</Text>
          <View style={styles.stack}>
            {recommendations.map((item) => (
              <Pressable
                key={item.key}
                style={[styles.recommendationCard, { borderColor: withOpacity(item.accent, 0.22) }]}
                onPress={() => {
                  void handleExploreNavigation(item.route);
                }}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                accessibilityHint={item.body}
              >
                <Text style={[styles.recommendationEyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
                <Text style={styles.recommendationTitle}>{item.title}</Text>
                <Text style={styles.recommendationBody}>{item.body}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card shadow={false}>
          <Text style={styles.sectionTitle}>Coaching contextual</Text>
          <Text style={styles.sectionBody}>{mainCoachingLine}</Text>
          {nextFocus?.title ? (
            <View style={styles.coachingBand}>
              <Text style={styles.coachingLabel}>Prioridad de esta semana</Text>
              <Text style={styles.coachingTitle}>{nextFocus.title}</Text>
            </View>
          ) : null}
        </Card>

        <Card shadow={false}>
          <Text style={styles.sectionTitle}>Challenges y momentum</Text>
          <View style={styles.momentumRow}>
            <View style={styles.momentumCard}>
              <Text style={styles.momentumValue}>{streak}</Text>
              <Text style={styles.momentumLabel}>racha</Text>
            </View>
            <View style={styles.momentumCard}>
              <Text style={styles.momentumValue}>{sessionsThisWeek}</Text>
              <Text style={styles.momentumLabel}>sesiones semana</Text>
            </View>
          </View>
          <Text style={styles.sectionBody}>{milestoneCopy}</Text>
        </Card>

        <Card shadow={false}>
          <Text style={styles.sectionTitle}>Biblioteca útil</Text>
          <View style={styles.stack}>
            {libraryCards.map((item) => (
              <Pressable
                key={item.key}
                style={[styles.libraryRow, { borderColor: withOpacity(item.accent, 0.18) }]}
                onPress={() => {
                  void handleExploreNavigation(item.route);
                }}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                accessibilityHint={item.body}
              >
                <View style={styles.libraryCopy}>
                  <Text style={[styles.libraryEyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
                  <Text style={styles.libraryTitle}>{item.title}</Text>
                  <Text style={styles.libraryBody}>{item.body}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </Card>
        <ScreenFooterSpacer />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.action, 0.08),
    borderColor: withOpacity(Colors.action, 0.2),
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.action,
  },
  heroTitle: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'],
    letterSpacing: -2,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  programCard: {
    gap: Spacing[3],
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  programCopy: {
    flex: 1,
    gap: 6,
  },
  programBadge: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.workout, 0.12),
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  programName: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  programStats: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  programStat: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.16),
    backgroundColor: withOpacity(Colors.workout, 0.06),
    padding: Spacing[3],
    gap: 4,
  },
  programStatLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  programStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
  },
  stack: {
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  recommendationCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
    gap: 4,
  },
  recommendationEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recommendationTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  recommendationBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  coachingBand: {
    marginTop: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.action, 0.2),
    backgroundColor: withOpacity(Colors.action, 0.07),
    padding: Spacing[3],
    gap: 4,
  },
  coachingLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.action,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coachingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  momentumRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
  },
  momentumCard: {
    flex: 1,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    padding: Spacing[3],
    gap: 4,
  },
  momentumValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'],
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  momentumLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  libraryCopy: {
    flex: 1,
    gap: 4,
  },
  libraryEyebrow: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  libraryTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  libraryBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
