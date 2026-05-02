import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import ModuleIntroScreen from '@/components/modules/ModuleIntroScreen';
import SleepTimeline from '@/components/sleep/SleepTimeline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { visibleRatioPercent } from '@/lib/visual-progress';
import { useSleep } from '@/hooks/useSleep';
import { useWorkout } from '@/hooks/useWorkout';
import { useSettingsStore } from '@/stores/settingsStore';

function sleepStatus(score: number) {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Regular';
  return 'Pobre';
}

export default function SleepScreen() {
  const hasSeenIntro = useSettingsStore((state) => Boolean(state.moduleIntroSeen.sleep));
  const markModuleIntroSeen = useSettingsStore((state) => state.markModuleIntroSeen);
  const { activeSession } = useWorkout();
  const {
    goalHours,
    history,
    lastSleep,
    lastDurationHours,
    lastScore,
    physicalDayState,
    sleepStreakDays,
  } = useSleep();

  const maxHours = Math.max(...history.slice(-7).map((entry) => entry.duration_min / 60), goalHours, 1);

  if (!hasSeenIntro) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Sueño" showBack />
        <ModuleIntroScreen
          accentColor={Colors.sleep}
          icon="Moon"
          title="Sueño"
          body="Registra cuántas horas dormiste y deja que VYRA use eso para ajustar la lectura del día."
          ctaLabel="Registrar primera noche"
          onContinue={() => {
            markModuleIntroSeen('sleep');
            router.push(Routes.sleep.log as never);
          }}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header
        title="Sueño"
        showBack
        rightAction={
          <Pressable
            onPress={() => router.push(Routes.sleep.log as never)}
            accessibilityRole="button"
            accessibilityLabel="Registrar sueño"
            accessibilityHint="Abre el formulario manual de sueño."
            hitSlop={8}
          >
            <Text style={styles.headerLink}>Registrar</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {lastSleep ? (
          <Card style={styles.heroCard} shadow={false}>
            <Text style={styles.eyebrow}>Noche de hoy</Text>
            <Text style={[styles.heroValue, { color: Colors.sleep }]}>{lastDurationHours.toFixed(1)}h</Text>
            <SleepTimeline
              startTime={lastSleep.start_time}
              endTime={lastSleep.end_time}
              durationHours={lastDurationHours}
              color={Colors.sleep}
            />
            <View style={styles.qualityRow}>
              <Text style={styles.qualityValue}>{Math.round(lastScore)}/100</Text>
              <Text style={styles.qualityLabel}>{sleepStatus(lastScore)}</Text>
            </View>
            <Text style={styles.heroMeta}>Racha de sueño: {sleepStreakDays} días</Text>
          </Card>
        ) : (
          <Card style={styles.emptyCard} shadow={false}>
            <Text style={styles.sectionTitle}>Registrar sueño</Text>
            <Text style={styles.sectionBody}>¿Cuántas horas dormiste anoche?</Text>
            <Button onPress={() => router.push(Routes.sleep.log as never)} fullWidth>
              Registrar sueño
            </Button>
          </Card>
        )}

        {lastDurationHours > 0 && lastDurationHours < 6 && activeSession ? (
          <Card style={styles.warningCard} shadow={false}>
            <Text style={styles.sectionTitle}>Conviene bajar intensidad hoy</Text>
            <Text style={styles.sectionBody}>
              Dormiste menos de lo ideal. Considera reducir carga o hacer solo el calentamiento fuerte.
            </Text>
            <Button onPress={() => router.push(Routes.workout.preview as never)} variant="secondary" fullWidth>
              Ver sesión de hoy
            </Button>
          </Card>
        ) : null}

        <Card style={styles.contextCard} shadow={false}>
          <Text style={styles.sectionTitle}>Lectura integrada</Text>
          <Text style={styles.sectionBody}>{physicalDayState.message}</Text>
        </Card>

        <Card style={styles.historyCard} shadow={false}>
          <Text style={styles.sectionTitle}>Últimas 7 noches</Text>
          <View style={styles.bars}>
            {history.slice(-7).map((entry) => {
              const hours = entry.duration_min / 60;
              const isGoalMet = hours >= goalHours;
              const heightPct = visibleRatioPercent(hours, maxHours);
              const label = new Date(entry.end_time)
                .toLocaleDateString('es-UY', { weekday: 'short' })
                .slice(0, 1)
                .toUpperCase();
              return (
                <View key={entry.id} style={styles.barItem}>
                  <View style={styles.barTrack}>
                    <View style={[styles.goalLine, { bottom: `${(goalHours / maxHours) * 100}%` }]} />
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: isGoalMet ? Colors.success : withOpacity(Colors.sleep, 0.72),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
        </Card>
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
    gap: Spacing[3],
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  heroValue: {
    fontFamily: FontFamily.black,
    fontSize: FontSize['3xl'],
    letterSpacing: -2,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  qualityValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  qualityLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  heroMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  emptyCard: {
    gap: Spacing[3],
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
  warningCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.warning, 0.08),
    borderColor: withOpacity(Colors.warning, 0.22),
  },
  contextCard: {
    gap: Spacing[2],
  },
  historyCard: {
    gap: Spacing[3],
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
    height: 150,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  barTrack: {
    width: '100%',
    flex: 1,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withOpacity(Colors.textSecondary, 0.5),
  },
  barLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
