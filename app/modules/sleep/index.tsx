// REDESIGNED: 2026-05-22 - sleep now reads as last night, weekly average, and daily guidance
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import SleepModuleTabs from '@/components/sleep/SleepModuleTabs';
import SleepTimeline from '@/components/sleep/SleepTimeline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useSleep } from '@/hooks/useSleep';
import { useWorkout } from '@/hooks/useWorkout';
import {
  buildSleepHistoryBars,
  getSleepGoalOffsetPx,
  getSleepStatusLabel,
  SLEEP_APP_LOCALE,
  SLEEP_BAR_TRACK_HEIGHT,
} from '@/lib/sleep-module';

function formatSleepClock(value: string) {
  return new Date(value).toLocaleTimeString(SLEEP_APP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatPill({ label, value, tone = Colors.sleep }: { label: string; value: string; tone?: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text style={[styles.statPillValue, { color: tone }]}>{value}</Text>
    </View>
  );
}

function ActionPill({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionPill, primary && styles.actionPillPrimary]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Text style={[styles.actionPillText, primary && styles.actionPillTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

export default function SleepScreen() {
  const { activeSession } = useWorkout();
  const {
    goalHours,
    history,
    isLoading,
    lastSleep,
    lastDurationHours,
    lastScore,
    physicalDayState,
    sleepDebt,
    sleepDebtMessage,
    sleepStreakDays,
  } = useSleep();

  const bars = buildSleepHistoryBars(history, goalHours, 7);
  const maxHours = Math.max(...bars.map((entry) => entry.hours), goalHours, 1);
  const goalOffsetPx = getSleepGoalOffsetPx(goalHours, maxHours);
  const missingNights = Math.max(0, 7 - history.length);
  const shouldWarnShortNight = lastDurationHours > 0 && lastDurationHours < 6;
  const averageHours =
    history.length > 0
      ? history.reduce((sum, entry) => sum + entry.duration_min / 60, 0) / history.length
      : 0;
  const averageDelta = averageHours - goalHours;
  const goalDaysInLastWeek = history.slice(-7).filter((entry) => entry.duration_min / 60 >= goalHours).length;
  const scoreLabel = lastScore > 0 ? getSleepStatusLabel(lastScore) : 'Sin lectura';
  const debtValueLabel = sleepDebt > 0 ? `${sleepDebt.toFixed(1)}h` : '0h';

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Sueño" showBack />
      <SleepModuleTabs active="home" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Card style={styles.loadingCard} shadow={false}>
            <Text style={styles.eyebrow}>Última noche</Text>
            <Text style={styles.loadingTitle}>Cargando sueño reciente</Text>
            <Text style={styles.loadingBody}>
              Estamos armando tu última noche, el promedio semanal y la lectura del día.
            </Text>
          </Card>
        ) : lastSleep ? (
          <Card style={styles.heroCard} shadow={false}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>Última noche</Text>
                <Text style={styles.heroValue}>{lastDurationHours.toFixed(1)}h</Text>
                <Text style={styles.heroBody}>
                  {formatSleepClock(lastSleep.start_time)} → {formatSleepClock(lastSleep.end_time)}
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeValue}>{Math.round(lastScore)}/100</Text>
                <Text style={styles.heroBadgeLabel}>{scoreLabel}</Text>
              </View>
            </View>

            <SleepTimeline
              startTime={lastSleep.start_time}
              endTime={lastSleep.end_time}
              durationHours={lastDurationHours}
              color={Colors.sleep}
            />

            <View style={styles.statsRow}>
              <StatPill label="Meta" value={`${goalHours.toFixed(1)}h`} />
              <StatPill label="Racha" value={sleepStreakDays > 0 ? `${sleepStreakDays}d` : '0d'} />
              <StatPill
                label="Deuda"
                value={debtValueLabel}
                tone={sleepDebt > 0 ? Colors.warning : Colors.success}
              />
            </View>

            <Text style={styles.heroCaption}>
              {new Date(lastSleep.end_time).toLocaleDateString(SLEEP_APP_LOCALE, {
                day: 'numeric',
                month: 'short',
              })}
              {' · '}
              {sleepStreakDays > 1 ? `Racha activa de ${sleepStreakDays} días` : 'Primera noche reciente registrada'}
            </Text>
          </Card>
        ) : (
          <Card style={styles.emptyHeroCard} shadow={false}>
            <Text style={styles.eyebrow}>Última noche</Text>
            <Text style={styles.emptyHeroTitle}>Todavía no registraste anoche</Text>
            <Text style={styles.emptyHeroBody}>
              Deja una noche cargada y este módulo pasa de estar vacío a mostrar promedio, contexto y guía real.
            </Text>
            <Button onPress={() => router.push(Routes.sleep.log)} color={Colors.sleep} fullWidth>
              Registrar sueño
            </Button>
            <Text style={styles.emptyHeroHint}>Meta actual: {goalHours.toFixed(1)}h por noche.</Text>
          </Card>
        )}

        {shouldWarnShortNight ? (
          <Card style={styles.warningCard} shadow={false}>
            <Text style={styles.sectionTitle}>Hoy conviene bajar intensidad</Text>
            <Text style={styles.sectionBody}>
              Dormiste menos de lo ideal. El mejor uso del día es bajar carga, cuidar técnica y recuperar margen.
            </Text>
            <Button
              onPress={() => router.push(activeSession ? Routes.workout.preview : Routes.sleep.insights)}
              variant="secondary"
              color={Colors.warning}
              fullWidth
            >
              {activeSession ? 'Ver sesión de hoy' : 'Ver insights'}
            </Button>
          </Card>
        ) : null}

        <Card style={styles.weekCard} shadow={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Promedio 7 días</Text>
              <Text style={styles.sectionHint}>
                {averageHours > 0
                  ? averageDelta >= 0
                    ? `Vas ${averageDelta.toFixed(1)}h por encima de tu meta reciente.`
                    : `Te faltan ${Math.abs(averageDelta).toFixed(1)}h para cerrar tu promedio ideal.`
                  : 'Cuando registres varias noches, aquí vas a ver la curva real de tu semana.'}
              </Text>
            </View>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeValue}>{averageHours > 0 ? `${averageHours.toFixed(1)}h` : '--'}</Text>
              <Text style={styles.weekBadgeLabel}>promedio</Text>
            </View>
          </View>

          <View style={styles.bars}>
            {bars.map((entry) => {
              const label = entry.label.slice(0, 1).toUpperCase();
              return (
                <View key={entry.key} style={styles.barItem}>
                  <View style={[styles.barTrack, { height: SLEEP_BAR_TRACK_HEIGHT }]}>
                    <View style={[styles.goalLine, { bottom: goalOffsetPx }]} />
                    {entry.hasEntry ? (
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${(entry.hours / maxHours) * 100}%`,
                            backgroundColor: entry.isGoal ? Colors.success : withOpacity(Colors.sleep, 0.7),
                          },
                        ]}
                      />
                    ) : (
                      <View style={styles.barStub} />
                    )}
                  </View>
                  <Text style={styles.barLabel}>{label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.weekStatsRow}>
            <StatPill label="Meta" value={`${goalHours.toFixed(1)}h`} />
            <StatPill label="Días en meta" value={`${goalDaysInLastWeek}/7`} tone={Colors.success} />
            <StatPill label="Sin registro" value={`${missingNights}`} tone={Colors.textSecondary} />
          </View>

          {missingNights > 0 ? (
            <Text style={styles.historyHint}>
              {history.length <= 1
                ? 'Completa algunas noches más para que esta vista empiece a mostrar tu patrón.'
                : `Faltan ${missingNights} noche${missingNights === 1 ? '' : 's'} para completar la semana visual.`}
            </Text>
          ) : null}
        </Card>

        <Card style={styles.insightCard} shadow={false}>
          <Text style={styles.sectionTitle}>Lectura del día</Text>
          <Text style={styles.sectionBody}>{physicalDayState.message}</Text>
          <View style={styles.actionRow}>
            <ActionPill label="Registrar sueño" onPress={() => router.push(Routes.sleep.log)} primary />
            <ActionPill label="Historial" onPress={() => router.push(Routes.sleep.history)} />
            <ActionPill label="Insights" onPress={() => router.push(Routes.sleep.insights)} />
          </View>
        </Card>

        {sleepDebtMessage ? (
          <Card style={styles.debtCard} shadow={false}>
            <Text style={styles.sectionTitle}>Deuda de sueño</Text>
            <Text style={styles.sectionBody}>{sleepDebtMessage}</Text>
            <Text style={styles.debtMeta}>
              Acumulas {sleepDebt.toFixed(1)}h por debajo de tu meta reciente.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  loadingCard: {
    gap: Spacing[2],
  },
  loadingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  loadingBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  heroCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.sleep, 0.07),
    borderColor: withOpacity(Colors.sleep, 0.18),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['3xl'],
    letterSpacing: -2,
    color: Colors.textPrimary,
  },
  heroBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  heroBadge: {
    minWidth: 110,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.22),
    backgroundColor: withOpacity(Colors.bgSurface, 0.72),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    alignItems: 'flex-end',
    gap: 2,
  },
  heroBadgeValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize.xl,
    color: Colors.sleep,
  },
  heroBadgeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  statPill: {
    width: '49%',
    minHeight: 74,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: withOpacity(Colors.bgSurface, 0.72),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: 6,
  },
  statPillLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statPillValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
  },
  heroCaption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  emptyHeroCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.sleep, 0.06),
    borderColor: withOpacity(Colors.sleep, 0.16),
  },
  emptyHeroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  emptyHeroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  emptyHeroHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  warningCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.warning, 0.08),
    borderColor: withOpacity(Colors.warning, 0.22),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  sectionCopy: {
    flex: 1,
    gap: 6,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sectionBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  weekCard: {
    gap: Spacing[3],
  },
  weekBadge: {
    minWidth: 92,
    alignItems: 'flex-end',
    gap: 2,
  },
  weekBadgeValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize.xl,
    color: Colors.sleep,
  },
  weekBadgeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bars: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  barTrack: {
    width: '100%',
    maxWidth: 36,
    borderRadius: Radius.xl,
    backgroundColor: withOpacity(Colors.white, 0.05),
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: withOpacity(Colors.sleep, 0.45),
    zIndex: 1,
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.xl,
  },
  barStub: {
    width: '100%',
    height: 12,
    borderRadius: Radius.xl,
    backgroundColor: withOpacity(Colors.white, 0.06),
  },
  barLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weekStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    justifyContent: 'center',
  },
  historyHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  insightCard: {
    gap: Spacing[3],
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  actionPill: {
    minHeight: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.bgSurface, 0.68),
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillPrimary: {
    borderColor: withOpacity(Colors.sleep, 0.24),
    backgroundColor: withOpacity(Colors.sleep, 0.16),
  },
  actionPillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  actionPillTextPrimary: {
    color: Colors.sleep,
  },
  debtCard: {
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.warning, 0.07),
    borderColor: withOpacity(Colors.warning, 0.18),
  },
  debtMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.warning,
  },
});
