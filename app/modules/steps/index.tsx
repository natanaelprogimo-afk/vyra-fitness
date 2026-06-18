// REDESIGNED: 2026-05-22 - steps now leads with daily movement, readable weekly bars, and calmer data-source support
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { StepsProgressMessages } from '@/constants/strings';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSteps } from '@/hooks/useSteps';
import { formatDistance } from '@/lib/format-distance';
import { visibleRatioPercent } from '@/lib/visual-progress';
import { useSettingsStore } from '@/stores/settingsStore';

const STEPS_WEEK_TRACK_HEIGHT = 120;

function getStepsMessage(progressPct: number, remaining: number, totalSteps: number) {
  if (progressPct >= 100) {
    return StepsProgressMessages.goalMet.replace('{{totalSteps}}', totalSteps.toLocaleString('es-UY'));
  }
  if (progressPct >= 60) {
    return StepsProgressMessages.almostThere.replace('{{remaining}}', remaining.toLocaleString('es-UY'));
  }
  if (progressPct >= 30) {
    return StepsProgressMessages.goodProgress;
  }
  return StepsProgressMessages.justStarted;
}

function getGoalOffsetPx(goal: number, maxWeekly: number) {
  if (maxWeekly <= 0) return 0;
  return Math.max(0, Math.min(STEPS_WEEK_TRACK_HEIGHT, (goal / maxWeekly) * STEPS_WEEK_TRACK_HEIGHT));
}

function getSourceSummary(status: string) {
  if (status === 'ready') {
    return {
      title: 'Fuente lista',
      body: 'Health Connect ya complementa los pasos del telefono para recuperar mejor tu movimiento.',
      tone: 'ready' as const,
    };
  }

  return {
    title: 'Contando con el telefono',
    body: 'El sensor del dispositivo ya funciona. Puedes sumar Health Connect si tambien usas otras apps.',
    tone: 'phone' as const,
  };
}

function getDayLabel(value: string) {
  return new Date(`${value}T12:00:00`)
    .toLocaleDateString('es-UY', { weekday: 'short' })
    .slice(0, 1)
    .toUpperCase();
}

function MetaPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.metaPill, accent && styles.metaPillAccent]}>
      <Text style={[styles.metaPillLabel, accent && styles.metaPillLabelAccent]}>{label}</Text>
      <Text style={[styles.metaPillValue, accent && styles.metaPillValueAccent]}>{value}</Text>
    </View>
  );
}

function WeekBar({
  label,
  steps,
  goal,
  maxWeekly,
  isToday,
}: {
  label: string;
  steps: number;
  goal: number;
  maxWeekly: number;
  isToday: boolean;
}) {
  const fillHeight = visibleRatioPercent(steps, maxWeekly);
  const isGoalMet = steps >= goal;
  const goalOffset = getGoalOffsetPx(goal, maxWeekly);

  return (
    <View style={styles.weekItem}>
      <View
        style={styles.weekTrack}
        accessibilityLabel={`${label}: ${steps.toLocaleString('es-UY')} pasos${isGoalMet ? ', meta alcanzada' : ''}`}
      >
        <View style={[styles.goalLine, { bottom: goalOffset }]} />
        <View
          style={[
            styles.weekFill,
            {
              height: `${fillHeight}%`,
              backgroundColor: isGoalMet ? Colors.steps : withOpacity(Colors.steps, 0.4),
            },
          ]}
        />
      </View>
      <Text style={[styles.weekLabel, isToday && styles.weekLabelToday]}>{label}</Text>
    </View>
  );
}

function SummaryEmpty({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={styles.emptyBlock}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export default function StepsScreen() {
  const distUnit = useSettingsStore((state) => state.distUnit);
  const {
    totalSteps,
    goal,
    progressPct,
    distanceKm,
    calories,
    remaining,
    currentWeekData,
    weeklyAvg,
    bestDaySteps,
    daysMetGoal,
    healthConnectStatus,
    refreshHealthConnect,
    isLoading,
    loadError,
    refetch,
    activityZone,
    activeRatio,
  } = useSteps();

  const weeklyTotal = currentWeekData.reduce((sum, day) => sum + Number(day.steps ?? 0), 0);
  const maxWeekly = Math.max(...currentWeekData.map((day) => Number(day.steps ?? 0)), goal, 1);
  const hasWeeklyMovement = currentWeekData.some((day) => Number(day.steps ?? 0) > 0);
  const sourceSummary = getSourceSummary(healthConnectStatus);
  const progressWidth: `${number}%` = `${Math.min(100, Math.max(4, progressPct))}%`;
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Pasos"
        showBack
        rightAction={(
          <Pressable onPress={() => router.push(Routes.steps.settings)} hitSlop={8}>
            <Text style={styles.headerLink}>Meta</Text>
          </Pressable>
        )}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loadError ? (
          <NoticeCard
            title="No pudimos actualizar todos los pasos"
            body="El sensor del telefono sigue contando igual. Si quieres, reintentamos ahora."
            tone="warning"
            actionLabel="Reintentar"
            onAction={() => {
              void refetch();
            }}
          />
        ) : null}

        <Card variant="hero" accentColor={Colors.steps} style={styles.heroCard} shadow={false}>
          <SectionHeader
            eyebrow="Hoy"
            title="Saber cuanto te moviste hoy"
            subtitle="Tu progreso del día, sin vueltas y con la meta siempre visible."
          />

          <View style={styles.heroValueBlock}>
            <Text style={styles.heroValue}>{isLoading ? '...' : totalSteps.toLocaleString('es-UY')}</Text>
            <Text style={styles.heroUnit}>pasos</Text>
          </View>

          <Text style={styles.heroTarget}>Meta: {goal.toLocaleString('es-UY')} pasos</Text>

          <View style={styles.progressRail}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <View style={styles.progressMetaRow}>
            <Text style={styles.progressMetaText}>{Math.round(progressPct)}%</Text>
            <Text style={styles.progressMetaText}>
              {remaining > 0 ? `${remaining.toLocaleString('es-UY')} pendientes` : 'Meta cumplida'}
            </Text>
          </View>

          <View style={styles.metaGrid}>
            <MetaPill label="Distancia" value={formatDistance(distanceKm, distUnit)} />
            <MetaPill label="Energia" value={`${Math.round(calories)} kcal`} />
            <MetaPill label="Activo" value={`${activeRatio}%`} />
            <MetaPill label="Zona" value={activityZone.label} accent />
          </View>

          <Text style={styles.message}>
            {isLoading ? 'Cargando pasos de hoy...' : getStepsMessage(progressPct, remaining, totalSteps)}
          </Text>

          <Button
            onPress={() => router.push(Routes.steps.week)}
            color={Colors.steps}
            fullWidth
          >
            Ver semana detallada
          </Button>
        </Card>

        {Platform.OS === 'android' ? (
          <Card variant="inset" style={styles.sourceCard} shadow={false}>
            <SectionHeader
              eyebrow="Fuente de datos"
              title={sourceSummary.title}
              subtitle={sourceSummary.body}
            />

            <View style={styles.sourceRows}>
              <View style={styles.sourceRowActive}>
                <Text style={styles.sourceName}>Sensor del telefono</Text>
                <Text style={styles.sourceBody}>Activo ahora mismo para contar sin configuracion extra.</Text>
              </View>

              {healthConnectStatus !== 'ready' ? (
                <Pressable
                  style={styles.sourceRow}
                  onPress={() => {
                    void refreshHealthConnect(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Conectar Health Connect"
                  accessibilityHint="Intenta enlazar Health Connect para sumar datos de otras apps."
                >
                  <Text style={styles.sourceName}>Health Connect</Text>
                  <Text style={styles.sourceBody}>Suma continuidad si tambien usas Google Fit, Fitbit u otras apps.</Text>
                </Pressable>
              ) : (
                <View style={styles.sourceRow}>
                  <Text style={styles.sourceName}>Health Connect</Text>
                  <Text style={styles.sourceBody}>Ya está ayudando a recuperar mejor tus pasos del día.</Text>
                </View>
              )}
            </View>
          </Card>
        ) : null}

        <Card style={styles.weekCard} shadow={false}>
          <SectionHeader
            eyebrow="Esta semana"
            title="Tu patron de movimiento"
            subtitle="Siete dias, una sola lectura: cuando te moviste bien y cuando te quedaste corto."
          />

          {hasWeeklyMovement ? (
            <>
              <View style={styles.weekBars}>
                {currentWeekData.map((day) => (
                  <WeekBar
                    key={day.logged_date}
                    label={getDayLabel(day.logged_date)}
                    steps={Number(day.steps ?? 0)}
                    goal={goal}
                    maxWeekly={maxWeekly}
                    isToday={day.logged_date === todayIso}
                  />
                ))}
              </View>

              <View style={styles.weekLegend}>
                <Text style={styles.legendText}>La linea marca tu meta diaria.</Text>
                <Text style={styles.legendText}>
                  {daysMetGoal}/7 dias en meta
                </Text>
              </View>
            </>
          ) : (
            <SummaryEmpty
              title="Empieza a caminar para ver tu semana"
              body="Cuando registres movimiento real, aqui apareceran tus barras, tus dias fuertes y el contexto de la meta."
            />
          )}
        </Card>

        {hasWeeklyMovement ? (
          <View style={styles.metricGrid}>
            <MetricCard
              value={weeklyAvg.toLocaleString('es-UY')}
              label="Promedio diario"
              note="Cuánto te estás moviendo por día en este bloque."
              accentColor={Colors.steps}
            />
            <MetricCard
              value={`${daysMetGoal}/7`}
              label="Dias en meta"
              note="Cuantos dias ya quedaron arriba de tu objetivo."
              accentColor={Colors.success}
            />
            <MetricCard
              value={bestDaySteps.toLocaleString('es-UY')}
              label="Mejor día"
              note="Tu pico mas fuerte dentro de la semana actual."
              accentColor={Colors.steps}
            />
            <MetricCard
              value={weeklyTotal.toLocaleString('es-UY')}
              label="Total semanal"
              note="La suma completa de pasos que llevas esta semana."
              accentColor={Colors.textPrimary}
            />
          </View>
        ) : (
          <Card variant="inset" style={styles.emptyStatsCard} shadow={false}>
            <SummaryEmpty
              title="Todavia no hay una lectura util"
              body="Apenas sumes algunos pasos reales, esta parte se llena sola con promedio, mejor día y total semanal."
            />
          </Card>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  headerLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  heroCard: {
    gap: Spacing[4],
  },
  heroValueBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
  },
  heroValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['3.5xl'],
    lineHeight: 52,
    letterSpacing: -1.3,
    color: Colors.textPrimary,
  },
  heroUnit: {
    marginBottom: 6,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  heroTarget: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  progressRail: {
    height: 12,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
  },
  progressFill: {
    height: '100%',
    minWidth: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.steps,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  progressMetaText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  metaPill: {
    width: '49%',
    gap: 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  metaPillAccent: {
    borderColor: withOpacity(Colors.steps, 0.22),
    backgroundColor: withOpacity(Colors.steps, 0.1),
  },
  metaPillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaPillLabelAccent: {
    color: withOpacity(Colors.steps, 0.9),
  },
  metaPillValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  metaPillValueAccent: {
    color: Colors.steps,
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  heroActions: {
    gap: Spacing[2],
  },
  heroSecondaryActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  secondaryAction: {
    flex: 1,
  },
  sourceCard: {
    gap: Spacing[3],
  },
  sourceRows: {
    gap: Spacing[3],
  },
  sourceRow: {
    gap: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  sourceRowActive: {
    gap: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.steps, 0.24),
    backgroundColor: withOpacity(Colors.steps, 0.08),
    padding: Spacing[3],
  },
  sourceName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  sourceBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  weekCard: {
    gap: Spacing[4],
  },
  weekBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
    height: 152,
  },
  weekItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  weekTrack: {
    width: '100%',
    height: STEPS_WEEK_TRACK_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface2,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withOpacity(Colors.steps, 0.6),
  },
  weekFill: {
    width: '100%',
    minHeight: 4,
    borderRadius: Radius.sm,
  },
  weekLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekLabelToday: {
    color: Colors.steps,
  },
  weekLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  legendText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  emptyBlock: {
    gap: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    padding: Spacing[4],
  },
  emptyTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  emptyStatsCard: {
    padding: 0,
  },
});
