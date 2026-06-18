import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import SleepTimeField from '@/components/sleep/SleepTimeField';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import {
  getAccessibleOnboardingRoute,
  getFirstIncompleteOnboardingRoute,
} from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';

function minutesToDate(minutes: number) {
  const value = new Date();
  value.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return value;
}

function dateToMinutes(value: Date) {
  return value.getHours() * 60 + value.getMinutes();
}

function formatGoalHours(hours: number) {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`;
}

export default function StepSleepScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [sleepTime, setSleepTime] = useState<Date | null>(minutesToDate(1380));
  const [wakeTime, setWakeTime] = useState<Date | null>(minutesToDate(420));
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  const sleepGoalHours = useMemo(() => {
    if (!sleepTime || !wakeTime) return 8;

    const sleepMinutes = dateToMinutes(sleepTime);
    const wakeMinutes = dateToMinutes(wakeTime);
    const normalizedWake = wakeMinutes <= sleepMinutes ? wakeMinutes + 1440 : wakeMinutes;
    return Math.round((((normalizedWake - sleepMinutes) / 60) + Number.EPSILON) * 10) / 10;
  }, [sleepTime, wakeTime]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.sleep,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.sleep) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setSleepTime(
        typeof progress.data?.sleep_time_minutes === 'number'
          ? minutesToDate(progress.data.sleep_time_minutes)
          : minutesToDate(1380),
      );
      setWakeTime(
        typeof progress.data?.wake_time_minutes === 'number'
          ? minutesToDate(progress.data.wake_time_minutes)
          : minutesToDate(420),
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (!sleepTime || !wakeTime || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        sleep_time_minutes: dateToMinutes(sleepTime),
        wake_time_minutes: dateToMinutes(wakeTime),
      });

      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        sleep_time_minutes: dateToMinutes(sleepTime),
        wake_time_minutes: dateToMinutes(wakeTime),
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Sleep] Failed to continue:', err);
      setSaveError('No pudimos guardar tus horarios. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.sleep}
      eyebrow="Sueño"
      title={<Text style={styles.title}>¿A qué hora sueles acostarte y levantarte?</Text>}
      subtitle="Esto define tu ventana esperada de descanso y tu meta diaria."
      scrollable
      contentStyle={styles.content}
      footer={
        <View>
          {saveError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          )}
          <Button onPress={handleContinue} fullWidth size="md" haptic="medium" loading={isProcessing} disabled={isProcessing}>
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.stack}>
        <SleepTimeField
          label="Hora de acostarte"
          value={sleepTime}
          placeholder="22:00"
          defaultHour={22}
          onChange={setSleepTime}
        />
        <SleepTimeField
          label="Hora de levantarte"
          value={wakeTime}
          placeholder="07:00"
          defaultHour={7}
          onChange={setWakeTime}
        />
      </View>

      {/* Sleep Duration Visualization */}
      <View style={styles.sleepTimeline}>
        <View style={styles.timelineBar}>
          <View style={[styles.timelineIndicator, { left: '0%' }]}>
            <Text style={styles.timelineLabel}>Acostarse</Text>
          </View>
          <View style={[styles.timelineIndicator, { right: '0%', alignItems: 'flex-end' }]}>
            <Text style={styles.timelineLabel}>Levantarse</Text>
          </View>
        </View>
        <Text style={styles.sleepDurationText}>
          {formatGoalHours(sleepGoalHours)} de descanso
        </Text>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Meta calculada</Text>
        <Text style={styles.noteBody}>
          {formatGoalHours(sleepGoalHours)} por noche, ajustable después desde Sueño.
        </Text>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[2.5],
    paddingTop: Spacing[1],
    paddingBottom: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    lineHeight: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  stack: {
    gap: Spacing[1.75],
  },
  noteBox: {
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  noteTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  noteBody: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  sleepTimeline: {
    gap: Spacing[1.5],
  },
  timelineBar: {
    height: 3,
    backgroundColor: Colors.sleep,
    borderRadius: 1.5,
    position: 'relative',
  },
  timelineIndicator: {
    position: 'absolute',
    top: -18,
    alignItems: 'flex-start',
  },
  timelineLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  sleepDurationText: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.error, 0.1),
    borderLeftColor: Colors.error,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    borderRadius: Radius.sm,
    marginBottom: Spacing[2],
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.error,
  },
});
