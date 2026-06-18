import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSleep } from '@/hooks/useSleep';
import { trackQuickLogCompleted } from '@/lib/analytics';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

type SleepQuickLogState = 'closed' | 'picking-sleep' | 'picking-wake' | 'submitting' | 'done';

export interface SleepQuickLogCardProps {
  onLogged?: () => void;
}

export function SleepQuickLogCard({ onLogged }: SleepQuickLogCardProps) {
  const { logSleepAsync } = useSleep();
  const [state, setState] = useState<SleepQuickLogState>('closed');
  const [sleepTime, setSleepTime] = useState<string | null>(null);
  const [wakeTime, setWakeTime] = useState<string | null>(null);

  const isReady = state === 'picking-wake' && sleepTime && wakeTime;

  const handleOpenSleep = () => {
    setSleepTime(null);
    setWakeTime(null);
    setState('picking-sleep');
  };

  const handleSetSleepTime = (time: string) => {
    setSleepTime(time);
    setState('picking-wake');
  };

  const handleSetWakeTime = (time: string) => {
    setWakeTime(time);
  };

  const handleSubmit = async () => {
    if (!sleepTime || !wakeTime) return;
    
    setState('submitting');
    try {
      // Parse times
      const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);
      const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

      // Create yesterday date for sleep time (assuming sleep is at night)
      const sleepDate = new Date();
      sleepDate.setDate(sleepDate.getDate() - 1);
      sleepDate.setHours(sleepHour, sleepMin, 0, 0);

      // Create today date for wake time
      const wakeDate = new Date();
      wakeDate.setHours(wakeHour, wakeMin, 0, 0);

      // If wake time is before sleep time, assume it's next day
      if (wakeDate <= sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }

      const durationMs = wakeDate.getTime() - sleepDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      // Log sleep entry with calculated duration
      // For quick log, we estimate deep/REM based on standard distribution
      const deepSleep = durationHours * 0.13; // ~13% of sleep
      const remSleep = durationHours * 0.23;  // ~23% of sleep

      await logSleepAsync({
        bedtime: sleepDate,
        wakeTime: wakeDate,
        quality: 5, // Neutral quality (1-10 scale)
        deepSleep,
        remSleep,
      });
      trackQuickLogCompleted('sleep', {
        source: 'sleep_module_card',
        duration_hours: Number(durationHours.toFixed(2)),
        bedtime: sleepDate.toISOString(),
        wake_time: wakeDate.toISOString(),
      });

      setState('done');
      setTimeout(() => {
        setState('closed');
        onLogged?.();
      }, 3000);
    } catch (err) {
      console.error('Failed to log sleep:', err);
      setState('closed');
    }
  };

  const handleClose = () => {
    setState('closed');
    setSleepTime(null);
    setWakeTime(null);
  };

  if (state === 'closed') {
    return (
      <Pressable style={styles.container} onPress={handleOpenSleep}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="moon" size={20} color={Colors.sleep} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Registrar sueño de anoche</Text>
            <Text style={styles.detail}>Hora de dormir y despertar</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.sleep} />
        </View>
      </Pressable>
    );
  }

  if (state === 'done') {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.doneCard]}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Sueño registrado</Text>
            <Text style={styles.detail}>{sleepTime} → {wakeTime}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Picking state
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>
            {state === 'picking-sleep' ? '¿A qué hora te dormiste?' : '¿A qué hora despertaste?'}
          </Text>
          <Pressable onPress={handleClose}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.timePickerWrap}>
          <TimeQuickPicker
            value={state === 'picking-sleep' ? sleepTime : wakeTime}
            onSelect={state === 'picking-sleep' ? handleSetSleepTime : handleSetWakeTime}
          />
        </View>

        {(state === 'picking-wake' || state === 'submitting') && (
          <Pressable
            style={[styles.submitBtn, !isReady && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isReady || state !== 'picking-wake'}
          >
            <Text style={styles.submitBtnLabel}>
              {state !== 'picking-wake' ? 'Guardando...' : 'Guardar'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

interface TimeQuickPickerProps {
  value: string | null;
  onSelect: (time: string) => void;
}

function TimeQuickPicker({ value, onSelect }: TimeQuickPickerProps) {
  const times = useMemo(() => {
    const result: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = String(h).padStart(2, '0');
        const min = String(m).padStart(2, '0');
        result.push(`${hour}:${min}`);
      }
    }
    return result;
  }, []);

  return (
    <View style={styles.timeGrid}>
      {times.map((time) => (
        <Pressable
          key={time}
          style={[styles.timeBtn, value === time && styles.timeBtnSelected]}
          onPress={() => onSelect(time)}
        >
          <Text style={[styles.timeBtnLabel, value === time && styles.timeBtnLabelSelected]}>
            {time}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[3],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.2),
  },
  doneCard: {
    borderColor: withOpacity(Colors.success, 0.3),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: withOpacity(Colors.sleep, 0.12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  headerLabel: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    marginHorizontal: Spacing[4],
  },
  label: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.textPrimary,
  },
  detail: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing[2],
  },
  timePickerWrap: {
    marginVertical: Spacing[4],
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  timeBtn: {
    width: '23%',
    paddingVertical: Spacing[3],
    borderRadius: Radius.md,
    backgroundColor: withOpacity(Colors.sleep, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBtnSelected: {
    backgroundColor: Colors.sleep,
  },
  timeBtnLabel: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: Colors.sleep,
  },
  timeBtnLabelSelected: {
    color: Colors.surface,
  },
  submitBtn: {
    paddingVertical: Spacing[4],
    borderRadius: Radius.md,
    backgroundColor: Colors.sleep,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[4],
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnLabel: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.surface,
  },
});
