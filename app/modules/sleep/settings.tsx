import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Header from '@/components/layout/Header';
import SleepModuleTabs from '@/components/sleep/SleepModuleTabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { computeSleepSmartAlarmMinute } from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

const SLEEP_GOALS = [6.5, 7, 7.5, 8, 8.5, 9];

function buildMinuteOptions(startHour: number, endHour: number, stepMinutes = 30) {
  const values: number[] = [];
  const start = startHour * 60;
  const end = endHour * 60;

  for (let value = start; value <= end; value += stepMinutes) {
    values.push(value % 1440);
  }

  return values;
}

const BED_OPTIONS = buildMinuteOptions(21, 25, 30);
const WAKE_OPTIONS = buildMinuteOptions(5, 9, 30);
const SMART_WINDOW_OPTIONS = buildMinuteOptions(5, 10, 15);

function formatMinutes(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hh = Math.floor(normalized / 60);
  const mm = normalized % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function SleepSettingsScreen() {
  const { updateUserProfile, isLoading } = useAuth();
  const profile = useAuthStore((s) => s.profile);
  const sleepSmartAlarmEnabled = useSettingsStore((state) => state.sleepSmartAlarmEnabled);
  const sleepSmartAlarmWindowStart = useSettingsStore((state) => state.sleepSmartAlarmWindowStart);
  const sleepSmartAlarmWindowEnd = useSettingsStore((state) => state.sleepSmartAlarmWindowEnd);
  const setSleepSmartAlarmEnabled = useSettingsStore((state) => state.setSleepSmartAlarmEnabled);
  const setSleepSmartAlarmWindowStart = useSettingsStore((state) => state.setSleepSmartAlarmWindowStart);
  const setSleepSmartAlarmWindowEnd = useSettingsStore((state) => state.setSleepSmartAlarmWindowEnd);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [goalHours, setGoalHours] = useState<number>(profile?.sleep_goal_hours ?? 8);
  const [sleepTime, setSleepTime] = useState<number>(profile?.sleep_time_minutes ?? 1380);
  const [wakeTime, setWakeTime] = useState<number>(profile?.wake_time_minutes ?? 420);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setGoalHours(profile?.sleep_goal_hours ?? 8);
    setSleepTime(profile?.sleep_time_minutes ?? 1380);
    setWakeTime(profile?.wake_time_minutes ?? 420);
  }, [profile?.sleep_goal_hours, profile?.sleep_time_minutes, profile?.wake_time_minutes]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const sleepWindowHours = useMemo(() => {
    const start = sleepTime;
    const end = wakeTime <= sleepTime ? wakeTime + 1440 : wakeTime;
    return Math.round(((end - start) / 60) * 10) / 10;
  }, [sleepTime, wakeTime]);

  const windowFallsShort = sleepWindowHours < goalHours;
  const smartAlarmPreview = useMemo(
    () =>
      computeSleepSmartAlarmMinute(
        sleepTime,
        sleepSmartAlarmWindowStart,
        sleepSmartAlarmWindowEnd,
      ),
    [sleepSmartAlarmWindowEnd, sleepSmartAlarmWindowStart, sleepTime],
  );

  const save = async () => {
    setSaved(false);
    setSaveError(null);

    const ok = await updateUserProfile({
      sleep_goal_hours: goalHours,
      sleep_time_minutes: sleepTime,
      wake_time_minutes: wakeTime,
    });

    if (ok) {
      setSaved(true);
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
      savedTimerRef.current = setTimeout(() => {
        setSaved(false);
        savedTimerRef.current = null;
      }, 3000);
      return;
    }

    setSaveError('No se pudo guardar. Intenta de nuevo.');
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Ajustes de sueño" showBack color={Colors.sleep} />
      <SleepModuleTabs active="settings" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Text style={styles.sectionTitle}>Meta de sueño diario</Text>
          <View style={styles.rowWrap}>
            {SLEEP_GOALS.map((goal) => {
              const active = goalHours === goal;
              return (
                <Pressable
                  key={goal}
                  onPress={() => setGoalHours(goal)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="radio"
                  accessibilityLabel={`${goal} horas`}
                  accessibilityState={{ checked: active }}
                  hitSlop={8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{goal}h</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Hora de dormir</Text>
          <View style={styles.rowWrap}>
            {BED_OPTIONS.map((value) => {
              const active = sleepTime === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setSleepTime(value)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="radio"
                  accessibilityLabel={`Dormir a las ${formatMinutes(value)}`}
                  accessibilityState={{ checked: active }}
                  hitSlop={8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {formatMinutes(value)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Hora de despertar</Text>
          <View style={styles.rowWrap}>
            {WAKE_OPTIONS.map((value) => {
              const active = wakeTime === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setWakeTime(value)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="radio"
                  accessibilityLabel={`Despertar a las ${formatMinutes(value)}`}
                  accessibilityState={{ checked: active }}
                  hitSlop={8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {formatMinutes(value)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryText}>Ventana actual: {sleepWindowHours.toFixed(1)} horas</Text>
          <Text style={styles.summaryHint}>Objetivo recomendado: 7.5h a 8.5h por noche.</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Smart alarm</Text>
          <Text style={styles.summaryHint}>
            Usa tu hora objetivo de dormir y una ventana de despertar para buscar el cierre mas amable de un ciclo de 90 minutos.
          </Text>
          <View style={styles.rowWrap}>
            <Pressable
              onPress={() => setSleepSmartAlarmEnabled(true)}
              style={[styles.chip, sleepSmartAlarmEnabled && styles.chipActive]}
              accessibilityRole="radio"
              accessibilityLabel="Activar smart alarm"
              accessibilityState={{ checked: sleepSmartAlarmEnabled }}
              hitSlop={8}
            >
              <Text style={[styles.chipText, sleepSmartAlarmEnabled && styles.chipTextActive]}>
                Activada
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSleepSmartAlarmEnabled(false)}
              style={[styles.chip, !sleepSmartAlarmEnabled && styles.chipActive]}
              accessibilityRole="radio"
              accessibilityLabel="Desactivar smart alarm"
              accessibilityState={{ checked: !sleepSmartAlarmEnabled }}
              hitSlop={8}
            >
              <Text style={[styles.chipText, !sleepSmartAlarmEnabled && styles.chipTextActive]}>
                Pausada
              </Text>
            </Pressable>
          </View>

          {sleepSmartAlarmEnabled ? (
            <View style={styles.smartAlarmBlock}>
              <Text style={styles.sectionTitle}>Ventana de despertar</Text>
              <View style={styles.windowBlock}>
                <Text style={styles.windowLabel}>Desde</Text>
                <View style={styles.rowWrap}>
                  {SMART_WINDOW_OPTIONS.map((value) => {
                    const active = sleepSmartAlarmWindowStart === value;
                    return (
                      <Pressable
                        key={`start-${value}`}
                        onPress={() => setSleepSmartAlarmWindowStart(value)}
                        style={[styles.chip, active && styles.chipActive]}
                        accessibilityRole="radio"
                        accessibilityLabel={`Desde ${formatMinutes(value)}`}
                        accessibilityState={{ checked: active }}
                        hitSlop={8}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {formatMinutes(value)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.windowBlock}>
                <Text style={styles.windowLabel}>Hasta</Text>
                <View style={styles.rowWrap}>
                  {SMART_WINDOW_OPTIONS.map((value) => {
                    const active = sleepSmartAlarmWindowEnd === value;
                    return (
                      <Pressable
                        key={`end-${value}`}
                        onPress={() => setSleepSmartAlarmWindowEnd(value)}
                        style={[styles.chip, active && styles.chipActive]}
                        accessibilityRole="radio"
                        accessibilityLabel={`Hasta ${formatMinutes(value)}`}
                        accessibilityState={{ checked: active }}
                        hitSlop={8}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {formatMinutes(value)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <NoticeCard
                title="Vista previa de mañana"
                body={
                  smartAlarmPreview.fallbackUsed
                    ? `Si te duermes a las ${formatMinutes(sleepTime)}, la alarma cae a las ${formatMinutes(smartAlarmPreview.minute)} porque no hay un final de ciclo limpio dentro de la ventana.`
                    : `Si te duermes a las ${formatMinutes(sleepTime)}, VYRA buscara despertarte a las ${formatMinutes(smartAlarmPreview.minute)} cerca del final del ciclo ${smartAlarmPreview.cycleCount}.`
                }
                tone={smartAlarmPreview.fallbackUsed ? 'info' : 'success'}
              />
            </View>
          ) : null}
        </Card>

        {windowFallsShort ? (
          <NoticeCard
            title="La ventana no alcanza tu meta"
            body={`Tu ventana actual deja ${sleepWindowHours.toFixed(1)}h disponibles, pero tu objetivo está en ${goalHours.toFixed(1)}h.`}
            tone="warning"
          />
        ) : null}

        {saveError ? (
          <NoticeCard
            title="No pudimos guardar los ajustes"
            body={saveError}
            tone="error"
          />
        ) : null}

        <Button onPress={save} disabled={isLoading} color={Colors.sleep}>
          {isLoading ? 'Guardando...' : 'Guardar ajustes'}
        </Button>

        {saved ? <Text style={styles.saved}>Ajustes guardados correctamente.</Text> : null}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[1],
    paddingBottom: Spacing[10],
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    backgroundColor: Colors.bgSurface,
  },
  chipActive: {
    borderColor: Colors.sleep,
    backgroundColor: `${Colors.sleep}20`,
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.sleep,
    fontFamily: FontFamily.bold,
  },
  summaryCard: {
    borderColor: `${Colors.sleep}40`,
  },
  summaryText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  smartAlarmBlock: {
    gap: Spacing[3],
    marginTop: Spacing[3],
  },
  windowBlock: {
    gap: Spacing[2],
  },
  windowLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  saved: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.success,
    textAlign: 'center',
  },
});
