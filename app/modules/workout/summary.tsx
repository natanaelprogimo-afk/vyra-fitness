import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import MuscleSilhouette from '@/components/workout/MuscleSilhouette';
import { buildWorkoutShareSvg, writeWorkoutShareSvgFile } from '@/lib/workout-share-image';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useWorkout } from '@/hooks/useWorkout';
import { formatDuration } from '@/utils/formatters';

function wasFreezeUsedYesterday(iso: string | null | undefined) {
  if (!iso) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const used = new Date(iso);
  used.setHours(0, 0, 0, 0);
  return used.getTime() === yesterday.getTime();
}

function normalizeMuscleKey(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes('pecho')) return 'chest';
  if (lower.includes('espalda') || lower.includes('dorsal')) return 'back';
  if (lower.includes('hombro')) return 'shoulders';
  if (lower.includes('biceps') || lower.includes('triceps') || lower.includes('brazo')) return 'arms';
  if (lower.includes('pierna') || lower.includes('gluteo') || lower.includes('femoral') || lower.includes('cuadr')) return 'legs';
  if (lower.includes('core') || lower.includes('abd')) return 'core';
  return lower;
}

function buildMuscleCounts(
  exerciseIds: string[],
  sets: Array<{ exercise_id: string }>,
  exercises: Array<{
    id: string;
    muscle_group: string;
    muscles_secondary?: string[];
  }>,
) {
  const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const counts: Record<string, number> = {};

  sets.forEach((set) => {
    if (!exerciseIds.includes(set.exercise_id)) return;
    const exercise = exerciseMap.get(set.exercise_id);
    if (!exercise) return;

    const names = [exercise.muscle_group, ...(exercise.muscles_secondary ?? [])].filter(Boolean);
    names.forEach((name) => {
      const key = normalizeMuscleKey(name);
      counts[key] = (counts[key] ?? 0) + 1;
    });
  });

  return counts;
}

function buildComparison(currentVolume: number, previousVolume: number | null) {
  if (!previousVolume || previousVolume <= 0) return null;
  const deltaPct = Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
  if (deltaPct === 0) return 'Mismo nivel que tu ultima sesion.';
  return `${deltaPct > 0 ? '+' : ''}${deltaPct}% vs tu ultima sesion.`;
}

function buildCooldownPlan(muscleCounts: Record<string, number>) {
  const topFocus = Object.entries(muscleCounts)
    .sort((left, right) => right[1] - left[1])
    .map(([key]) => key)[0] ?? 'full';

  if (topFocus === 'legs') {
    return {
      title: 'Cierre para piernas',
      body: 'Tres minutos para bajar pulsaciones y soltar cadera, glúteos y gemelos antes de seguir el día.',
      moves: ['Estiramiento de flexor de cadera · 45s por lado', 'Glúteo sentado · 45s por lado', 'Gemelo en pared · 45s por lado'],
    };
  }

  if (topFocus === 'back' || topFocus === 'shoulders') {
    return {
      title: 'Cierre para espalda y hombros',
      body: 'Vale la pena salir con hombros más sueltos y respiración más baja para que la sesión cierre mejor.',
      moves: ['Child pose con alcance lateral · 60s', 'Apertura de pecho en marco de puerta · 45s por lado', 'Respiración nasal + brazos arriba · 60s'],
    };
  }

  if (topFocus === 'chest' || topFocus === 'arms') {
    return {
      title: 'Cierre para empuje',
      body: 'Afloja pecho, bíceps y tríceps para que la tensión no se quede prendida después del bloque.',
      moves: ['Apertura de pecho en pared · 45s por lado', 'Estiramiento de tríceps arriba · 45s por lado', 'Respiración larga tumbado · 60s'],
    };
  }

  return {
    title: 'Cool-down corto',
    body: 'Un cierre breve sigue sumando: baja revoluciones, respira y deja que la recuperación arranque antes.',
    moves: ['Respiración nasal lenta · 60s', 'Movilidad torácica suave · 60s', 'Estiramiento global de cadena posterior · 60s'],
  };
}

export default function WorkoutDoneScreen() {
  const [isSharing, setIsSharing] = useState(false);
  const extendedInsightsUnlocked = true;
  const params = useLocalSearchParams<{
    sessionId?: string;
    duration?: string;
    volume?: string;
    sets?: string;
    prs?: string;
    name?: string;
  }>();
  const profile = useAuthStore((state) => state.profile);
  const {
    history,
    exercises,
    getConsistencyStats,
    getSessionDetail,
    getActiveProgram,
  } = useWorkout();

  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';
  const fallbackDuration = Number(params.duration ?? 0) || 0;
  const fallbackVolume = Number(params.volume ?? 0) || 0;
  const fallbackSets = Number(params.sets ?? 0) || 0;
  const fallbackPrs = Number(params.prs ?? 0) || 0;
  const name = typeof params.name === 'string' ? params.name : 'Entrenamiento';
  const detail = sessionId ? getSessionDetail(sessionId) : null;
  const activeProgram = getActiveProgram();
  const programHistory = useMemo(() => {
    if (!activeProgram) return [];
    const routineIds = new Set(activeProgram.routine_ids);
    return history.filter((entry) => entry.routine_id && routineIds.has(entry.routine_id));
  }, [activeProgram, history]);
  const streak = Number(profile?.current_streak ?? profile?.streak ?? getConsistencyStats().currentStreak ?? 0);
  const freezeUsedYesterday = wasFreezeUsedYesterday(profile?.streak_freeze_last_used_at ?? null);
  const previousSession = history.find((entry) => entry.id !== sessionId) ?? null;
  const duration = detail?.session?.duration_min ?? detail?.durationMin ?? fallbackDuration;
  const totalVolume = detail?.session?.total_volume_kg ?? fallbackVolume;
  const sets = detail?.session?.sets_count ?? fallbackSets;
  const prs = detail?.sets.filter((set) => set.is_pr).length ?? fallbackPrs;
  const estimatedCalories =
    detail?.session?.estimated_calories ??
    Math.round(Math.max(12, duration) * 5.6);
  const muscleLabels = (detail?.session?.muscles_worked ?? []).slice(0, 4);
  const prExerciseName = detail?.sets.find((set) => set.is_pr)?.exercise_name ?? null;
  const muscleCounts = useMemo(
    () =>
      buildMuscleCounts(
        detail?.sets.map((set) => set.exercise_id) ?? [],
        detail?.sets ?? [],
        exercises,
      ),
    [detail?.sets, exercises],
  );

  const totalProgramSessions = activeProgram
    ? Math.max(1, (activeProgram.days_per_week || 4) * (activeProgram.duration_weeks || 4))
    : null;
  const completedProgramSessions = totalProgramSessions
    ? Math.min(totalProgramSessions, programHistory.length)
    : null;
  const programProgressPct = totalProgramSessions && completedProgramSessions !== null
    ? Math.min(100, Math.round((completedProgramSessions / totalProgramSessions) * 100))
    : null;
  const programDayLabel = completedProgramSessions && totalProgramSessions
    ? `Día ${completedProgramSessions} de ${totalProgramSessions}`
    : null;
  const xpEarned = Math.min(150, 25 + sets * 2 + prs * 10);

  const weekCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = history.filter((entry) => new Date(entry.started_at).getTime() >= weekCutoff);
  const otherWeekSessions = weekSessions.filter((entry) => entry.id !== sessionId);
  const isHardestSessionThisWeek =
    otherWeekSessions.length > 0 &&
    otherWeekSessions.every((entry) => Number(entry.total_volume_kg ?? 0) <= totalVolume);

  const headerTitle = activeProgram && programDayLabel ? `${programDayLabel} completado` : 'Sesion completada';
  const headerSubtitle = freezeUsedYesterday
    ? 'Ayer protegiste la racha y hoy la reforzaste.'
    : prExerciseName
      ? `Gran cierre en ${prExerciseName}.`
      : 'Buen trabajo. Ya quedo registrado y cuenta para tu progreso.';

  const comparisonText = buildComparison(totalVolume, previousSession?.total_volume_kg ?? null);
  const quickInsights = useMemo(() => {
    const items: string[] = [];
    if (comparisonText) items.push(comparisonText);
    if (prExerciseName) items.push(`Mejor ejercicio de hoy: ${prExerciseName}.`);
    if (muscleLabels.length) items.push(`Enfoque principal: ${muscleLabels.join(', ')}.`);
    if (isHardestSessionThisWeek) items.push('Fue tu sesion mas exigente de la semana.');
    return items.slice(0, 3);
  }, [comparisonText, isHardestSessionThisWeek, muscleLabels, prExerciseName]);

  const extendedInsights = useMemo(() => {
    const items: string[] = [];
    if (comparisonText) items.push(`Comparacion de carga: ${comparisonText}`);
    if (totalVolume > 0) items.push(`Volumen total registrado: ${Math.round(totalVolume).toLocaleString('es-UY')} kg.`);
    if (muscleLabels.length) items.push(`Musculos mas trabajados: ${muscleLabels.join(', ')}.`);
    if (streak > 0) items.push(`Racha actual después de esta sesión: ${streak} día${streak === 1 ? '' : 's'}.`);
    return items;
  }, [comparisonText, muscleLabels, streak, totalVolume]);
  const cooldownPlan = useMemo(() => buildCooldownPlan(muscleCounts), [muscleCounts]);

  const handleShare = useCallback(async () => {
    const userName = profile?.name?.trim() || 'Usuario';
    setIsSharing(true);

    try {
      const svg = buildWorkoutShareSvg({
        sessionName: name,
        title: headerTitle,
        subtitle: headerSubtitle,
        userName,
        dateLabel: new Intl.DateTimeFormat('es-UY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date()),
        durationMin: duration,
        sets,
        volumeKg: totalVolume,
        prs,
        streak,
        muscleLabels,
        comparisonText,
        streakImpact: programDayLabel,
      });
      const uri = await writeWorkoutShareSvgFile(svg, name);
      const canShareFile = await Sharing.isAvailableAsync();

      if (canShareFile) {
        try {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/svg+xml',
            UTI: 'public.svg-image',
            dialogTitle: 'Compartir imagen',
          });
          return;
        } catch {
          // Fall back to plain share when the target app does not accept SVG files.
        }
      }

      await Share.share({
        title: 'Compartir imagen',
        message: `${name}\n${formatDuration(duration)} | ${sets} series | ${estimatedCalories} kcal\nRacha actual: ${streak} día${streak === 1 ? '' : 's'}\nVYRA`,
      });
    } finally {
      setIsSharing(false);
    }
  }, [comparisonText, duration, estimatedCalories, headerSubtitle, headerTitle, muscleLabels, name, profile?.name, programDayLabel, prs, sets, streak, totalVolume]);

  const handlePrimaryAction = () => {
    if (activeProgram) {
      router.push(Routes.workout.programs as never);
      return;
    }
    router.replace(Routes.workout.index as never);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.closeRow}>
          <Pressable
            onPress={() => router.replace(Routes.tabs.home as never)}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar resumen"
            accessibilityHint="Vuelve al inicio despues de terminar la sesion."
            hitSlop={8}
          >
            <Ionicons name="close" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.checkWrap}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={42} color={Colors.white} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Lo hiciste</Text>
          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        <Card style={styles.highlightCard} shadow={false}>
          <View style={styles.highlightRow}>
            <View style={styles.highlightMain}>
              <Text style={styles.highlightValue}>{formatDuration(duration)}</Text>
              <Text style={styles.highlightLabel}>tiempo real completado</Text>
            </View>
            <View style={styles.highlightSide}>
              <Text style={styles.highlightSideValue}>{estimatedCalories}</Text>
              <Text style={styles.highlightSideLabel}>kcal est.</Text>
            </View>
          </View>

          {activeProgram && programProgressPct !== null ? (
            <View style={styles.programStrip}>
              <View style={styles.programStripTop}>
                <Text style={styles.programStripTitle}>{activeProgram.name}</Text>
                <Text style={styles.programStripMeta}>{programProgressPct}%</Text>
              </View>
              <Text style={styles.programStripBody}>
                {programDayLabel} · {activeProgram.days_per_week} dias por semana
              </Text>
              <View style={styles.programTrack}>
                <View style={[styles.programFill, { width: `${programProgressPct}%` }]} />
              </View>
            </View>
          ) : (
            <Text style={styles.highlightHelper}>
              Esta sesion ya cuenta para tu progreso general y para tu racha.
            </Text>
          )}
        </Card>

        <View style={styles.statsGrid}>
          <StatCard icon="barbell-outline" label="Series" value={sets} />
          <StatCard icon="sparkles-outline" label="PRs" value={prs} />
          <StatCard icon="game-controller-outline" label="XP" value={xpEarned} />
        </View>

        <Card style={styles.streakCard} shadow={false}>
          <View style={styles.streakRow}>
            <View>
              <Text style={styles.cardTitle}>Gamificacion</Text>
              <Text style={styles.streakValue}>+{xpEarned} XP · Racha {streak} día{streak === 1 ? '' : 's'}</Text>
            </View>
            <Ionicons name="flame-outline" size={20} color={Colors.secondary} />
          </View>
        </Card>

        <Card style={styles.insightsCard} shadow={false}>
          <Text style={styles.cardTitle}>Lo importante de hoy</Text>
          <View style={styles.insightsList}>
            {quickInsights.length ? (
              quickInsights.map((insight) => (
                <View key={insight} style={styles.insightRow}>
                  <View style={styles.insightDot} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.insightText}>
                Cerraste una sesion mas y eso ya sostiene tu direccion.
              </Text>
            )}
          </View>
        </Card>

        <Card style={styles.silhouetteCard} shadow={false}>
          <Text style={styles.cardTitle}>Mapa muscular</Text>
          <MuscleSilhouette
            counts={muscleCounts}
            musclesWorked={detail?.session?.muscles_worked ?? []}
            width={260}
            height={170}
            showSummary={false}
          />
          {muscleLabels.length ? (
            <View style={styles.muscleRow}>
              {muscleLabels.map((label) => (
                <View key={label} style={styles.musclePill}>
                  <Text style={styles.musclePillText}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <Card style={styles.cooldownCard} shadow={false}>
          <Text style={styles.cooldownEyebrow}>Cierre sugerido · 3 min</Text>
          <Text style={styles.cardTitle}>{cooldownPlan.title}</Text>
          <Text style={styles.cooldownBody}>{cooldownPlan.body}</Text>
          <View style={styles.cooldownList}>
            {cooldownPlan.moves.map((move) => (
              <View key={move} style={styles.insightRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightText}>{move}</Text>
              </View>
            ))}
          </View>
        </Card>

        {extendedInsightsUnlocked ? (
          <Card style={styles.extendedCard} shadow={false}>
            <Text style={styles.cardTitle}>Analisis extendido</Text>
            <View style={styles.insightsList}>
              {extendedInsights.map((insight) => (
                <View key={insight} style={styles.insightRow}>
                  <View style={styles.insightDot} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button onPress={handlePrimaryAction} fullWidth size="lg" haptic="medium">
            {activeProgram ? 'Continuar programa' : 'Volver a entreno'}
          </Button>
          <Button onPress={() => router.push(Routes.tabs.progress as never)} variant="secondary" fullWidth>
            Ver progreso
          </Button>
          <Button onPress={() => void handleShare()} variant="secondary" fullWidth loading={isSharing}>
            Compartir
          </Button>
          <Button onPress={() => router.replace(Routes.tabs.home as never)} variant="ghost" fullWidth>
            Volver al inicio
          </Button>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
}) {
  return (
    <Card style={styles.statCard} shadow={false}>
      <Ionicons name={icon} size={18} color={Colors.workout} />
      <AnimatedNumber value={value} duration={900} style={styles.statValue} />
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  closeRow: {
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrap: {
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: Radius.full,
    backgroundColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    lineHeight: 42,
    color: Colors.textPrimary,
    letterSpacing: -1.8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlightCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.22),
    backgroundColor: withOpacity(Colors.workout, 0.08),
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  highlightMain: {
    flex: 1,
    gap: 4,
  },
  highlightValue: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  highlightLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  highlightSide: {
    alignItems: 'flex-end',
    gap: 2,
  },
  highlightSideValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.workout,
  },
  highlightSideLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  highlightHelper: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  programStrip: {
    gap: Spacing[2],
  },
  programStripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
    alignItems: 'center',
  },
  programStripTitle: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  programStripMeta: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.workout,
  },
  programStripBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  programTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.workout, 0.12),
    overflow: 'hidden',
  },
  programFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.workout,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  streakCard: {
    gap: Spacing[2],
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  streakValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  insightsCard: {
    gap: Spacing[3],
  },
  insightsList: {
    gap: Spacing[2],
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    marginTop: 7,
    backgroundColor: Colors.workout,
  },
  insightText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  silhouetteCard: {
    gap: Spacing[3],
    alignItems: 'center',
  },
  cooldownCard: {
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: withOpacity(Colors.workout, 0.18),
    backgroundColor: withOpacity(Colors.workout, 0.06),
  },
  cooldownEyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.workout,
  },
  cooldownBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  cooldownList: {
    gap: Spacing[2],
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  musclePill: {
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.workout, 0.12),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  musclePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.workout,
  },
  extendedCard: {
    gap: Spacing[3],
  },
  actions: {
    gap: Spacing[2],
  },
});
