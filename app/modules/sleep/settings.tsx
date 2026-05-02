import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const SLEEP_GOALS = [6.5, 7, 7.5, 8, 8.5, 9];
const BED_OPTIONS = [1260, 1320, 1380, 1410, 30]; // 21:00, 22:00, 23:00, 23:30, 00:30
const WAKE_OPTIONS = [300, 360, 390, 420, 450, 480]; // 05:00..08:00

function formatMinutes(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hh = Math.floor(normalized / 60);
  const mm = normalized % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function SleepSettingsScreen() {
  const { updateUserProfile, isLoading } = useAuth();
  const profile = useAuthStore((s) => s.profile);

  const [goalHours, setGoalHours] = useState<number>(profile?.sleep_goal_hours ?? 8);
  const [sleepTime, setSleepTime] = useState<number>(profile?.sleep_time_minutes ?? 1380);
  const [wakeTime, setWakeTime] = useState<number>(profile?.wake_time_minutes ?? 420);
  const [saved, setSaved] = useState(false);

  const sleepWindow = useMemo(() => {
    const start = sleepTime;
    const end = wakeTime <= sleepTime ? wakeTime + 1440 : wakeTime;
    return ((end - start) / 60).toFixed(1);
  }, [sleepTime, wakeTime]);

  const save = async () => {
    setSaved(false);
    const ok = await updateUserProfile({
      sleep_goal_hours: goalHours,
      sleep_time_minutes: sleepTime,
      wake_time_minutes: wakeTime,
    });
    setSaved(ok);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Ajustes de sueño" showBack color={Colors.sleep} />
      <View style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>Meta de sueño díario</Text>
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
                  accessibilityState={{ selected: active }}
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
                  accessibilityState={{ selected: active }}
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
                  accessibilityState={{ selected: active }}
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
          <Text style={styles.summaryText}>Ventana actual: {sleepWindow} horas</Text>
          <Text style={styles.summaryHint}>Objetivo recomendado: 7.5h a 8.5h por noche.</Text>
        </Card>

        <Button
          label={isLoading ? 'Guardando...' : 'Guardar ajustes'}
          onPress={save}
          disabled={isLoading}
          color={Colors.sleep}
        />
        {saved ? <Text style={styles.saved}>Ajustes guardados correctamente.</Text> : null}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
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
  saved: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.success,
    textAlign: 'center',
  },
});

