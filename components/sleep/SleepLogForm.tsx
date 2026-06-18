import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import SleepTimeField from '@/components/sleep/SleepTimeField';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { type SleepLogInput } from '@/hooks/useSleep';
import {
  getSleepDurationHours,
  SLEEP_INPUT_BG,
  SLEEP_QUALITY_OPTIONS,
} from '@/lib/sleep-module';

function buildDefaultTime(hour: number, minute = 0) {
  const value = new Date();
  value.setHours(hour, minute, 0, 0);
  return value;
}

interface SleepLogFormProps {
  goalHours: number;
  isLogging: boolean;
  onSubmit: (input: SleepLogInput) => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
  submitLabel?: string;
  getOptimalAlarmTimes: (bedtime: Date) => Date[];
  initialValues?: Partial<SleepLogInput> | null;
  compactMode?: boolean;
}

const REASON_OPTIONS = ['Estrés', 'Calor', 'Ruido', 'Alcohol', 'Enfermedad', 'Otro'] as const;

export default function SleepLogForm({
  goalHours,
  isLogging,
  onSubmit,
  onCancel,
  showCancel = false,
  submitLabel = 'Guardar sueño',
  getOptimalAlarmTimes,
  initialValues = null,
  compactMode = false,
}: SleepLogFormProps) {
  const [bedtime, setBedtime] = useState<Date | null>(initialValues?.bedtime ?? buildDefaultTime(23));
  const [wakeTime, setWakeTime] = useState<Date | null>(initialValues?.wakeTime ?? buildDefaultTime(7));
  const [quality, setQuality] = useState<number>(initialValues?.quality ?? 4);
  const [deepPct, setDeepPct] = useState(initialValues?.deepSleep ?? 20);
  const [remPct, setRemPct] = useState(initialValues?.remSleep ?? 25);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  useEffect(() => {
    setBedtime(initialValues?.bedtime ?? buildDefaultTime(23));
    setWakeTime(initialValues?.wakeTime ?? buildDefaultTime(7));
    setQuality(initialValues?.quality ?? 4);
    setDeepPct(initialValues?.deepSleep ?? 20);
    setRemPct(initialValues?.remSleep ?? 25);

    if (typeof initialValues?.notes === 'string' && initialValues.notes.startsWith('motivos:')) {
      setSelectedReasons(
        initialValues.notes
          .replace('motivos:', '')
          .split(',')
          .map((reason) => reason.trim())
          .filter(Boolean),
      );
      return;
    }

    setSelectedReasons([]);
  }, [initialValues]);

  const isRetroactive = new Date().getHours() >= 11;
  const durationHours = getSleepDurationHours(bedtime, wakeTime);
  const alarmTimes = useMemo(
    () => (bedtime ? getOptimalAlarmTimes(bedtime) : []),
    [bedtime, getOptimalAlarmTimes],
  );

  const isDurationInvalid =
    durationHours === null || durationHours < 1 || durationHours > 12;

  const handleSubmit = () => {
    if (!bedtime || !wakeTime || isDurationInvalid) return;
    const notes = selectedReasons.length ? `motivos:${selectedReasons.join(',')}` : undefined;
    void onSubmit({
      bedtime,
      wakeTime,
      quality,
      deepSleep: deepPct,
      remSleep: remPct,
      notes,
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        {compactMode
          ? 'Registrar anoche'
          : isRetroactive
            ? 'Registrar sueño de anoche'
            : 'Registrar sueño'}
      </Text>
      <Text style={styles.subtitle}>
        {compactMode
          ? 'Deja hora de dormir, despertar y una lectura rápida. El resto puede esperar.'
          : isRetroactive
            ? 'Si te acordaste más tarde, igual conviene cargarlo ahora.'
            : 'Registra la noche aquí y deja el hub para lectura y contexto.'}
      </Text>

      <SleepTimeField
        label={isRetroactive ? 'Me dormí aproximadamente a las' : 'Me dormí a las'}
        value={bedtime}
        placeholder="23:00"
        defaultHour={23}
        onChange={setBedtime}
      />

      <SleepTimeField
        label="Me desperté a las"
        value={wakeTime}
        placeholder="07:00"
        defaultHour={7}
        onChange={setWakeTime}
      />

      <View style={styles.durationCard}>
        <Text style={styles.durationLabel}>Duración estimada</Text>
        <Text
          style={[
            styles.durationValue,
            durationHours !== null &&
              !isDurationInvalid && {
                color: durationHours >= goalHours ? Colors.sleep : Colors.warning,
              },
          ]}
        >
          {durationHours !== null ? `${durationHours.toFixed(1)}h` : '--'}
        </Text>
        <Text style={styles.durationHint}>
          {isRetroactive ? 'Registro retroactivo.' : 'Meta actual:'} {goalHours}h por noche.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockLabel}>Cómo sentiste la noche</Text>
        <View style={styles.qualityRow}>
          {SLEEP_QUALITY_OPTIONS.map((option) => {
            const isActive = quality === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setQuality(option.value)}
                style={[styles.qualityChip, isActive && styles.qualityChipActive]}
                accessibilityRole="radio"
                accessibilityLabel={option.short}
                accessibilityState={{ selected: isActive }}
                hitSlop={8}
              >
                <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.qualityText,
                    isActive && styles.qualityTextActive,
                  ]}
                >
                  {option.short}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {quality <= 2 ? (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Si fue una noche difícil, ¿por qué?</Text>
          <View style={styles.reasonRow}>
            {REASON_OPTIONS.map((reason) => {
              const active = selectedReasons.includes(reason);
              return (
                <Pressable
                  key={reason}
                  onPress={() =>
                    setSelectedReasons((current) =>
                      current.includes(reason)
                        ? current.filter((item) => item !== reason)
                        : [...current, reason],
                    )
                  }
                  style={[styles.reasonChip, active && styles.reasonChipActive]}
                  accessibilityRole="checkbox"
                  accessibilityLabel={reason}
                  accessibilityState={{ checked: active }}
                  hitSlop={8}
                >
                  <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                    {reason}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {!compactMode ? (
        <>
          <SleepPhasePicker
            label="Sueño profundo"
            value={deepPct}
            onChange={setDeepPct}
            color="#4FC3F7"
            hint="Rango habitual: 15% a 25%"
          />

          <SleepPhasePicker
            label="Sueño REM"
            value={remPct}
            onChange={setRemPct}
            color="#CE93D8"
            hint="Rango habitual: 20% a 25%"
          />

          <View style={styles.block}>
            <Text style={styles.blockLabel}>Alarmas sugeridas</Text>
            <Text style={styles.blockHint}>
              Se calculan con ciclos de 90 minutos desde tu hora de dormir.
            </Text>
            <View style={styles.alarmRow}>
              {alarmTimes.map((alarm, index) => (
                <View
                  key={`${alarm.toISOString()}-${index}`}
                  style={[styles.alarmChip, index === 1 && styles.alarmChipRecommended]}
                >
                  {index === 1 ? <Text style={styles.alarmRecommended}>Recomendada</Text> : null}
                  <Text style={[styles.alarmTime, index === 1 && { color: Colors.sleep }]}>
                    {alarm.toLocaleTimeString('es-UY', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.alarmMeta}>{[6, 7.5, 9][index]}h</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : null}

      <Button
        onPress={handleSubmit}
        variant="primary"
        fullWidth
        size="lg"
        loading={isLogging}
        disabled={isDurationInvalid}
      >
        {submitLabel}
      </Button>

      {showCancel && onCancel ? (
        <Button onPress={onCancel} variant="ghost" fullWidth size="sm">
          Cancelar
        </Button>
      ) : null}
    </View>
  );
}

function SleepPhasePicker({
  label,
  value,
  onChange,
  color,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  hint: string;
}) {
  const options = [10, 15, 20, 25, 30, 35];

  return (
    <View style={styles.block}>
      <View style={styles.phaseHeader}>
        <Text style={styles.blockLabel}>{label}</Text>
        <Text style={[styles.phaseValue, { color }]}>{value}%</Text>
      </View>
      <View style={styles.phaseRow}>
        {options.map((option) => {
          const isActive = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[
                styles.phaseChip,
                isActive && { borderColor: color, backgroundColor: color },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={`${option}%`}
              accessibilityState={{ selected: isActive }}
              hitSlop={8}
            >
              <Text
                style={[
                  styles.phaseChipText,
                  isActive && { color: Colors.white },
                ]}
              >
                {option}%
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.blockHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  durationCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.14),
    backgroundColor: SLEEP_INPUT_BG,
    padding: Spacing[4],
    gap: Spacing[1],
  },
  durationLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  durationValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  durationHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  block: {
    gap: Spacing[2],
  },
  blockLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  blockHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: FontSize.xs * 1.5,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  qualityChip: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.12),
    backgroundColor: SLEEP_INPUT_BG,
    alignItems: 'center',
    paddingVertical: Spacing[2.5],
    gap: 4,
  },
  qualityChipActive: {
    borderColor: withOpacity(Colors.sleep, 0.34),
    backgroundColor: withOpacity(Colors.sleep, 0.16),
  },
  qualityEmoji: {
    fontSize: 16,
  },
  qualityText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  qualityTextActive: {
    color: Colors.sleep,
  },
  reasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  reasonChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.14),
    backgroundColor: SLEEP_INPUT_BG,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  reasonChipActive: {
    borderColor: withOpacity(Colors.sleep, 0.34),
    backgroundColor: withOpacity(Colors.sleep, 0.16),
  },
  reasonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  reasonTextActive: {
    color: Colors.sleep,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  phaseRow: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  phaseChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[1.75],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.14),
    backgroundColor: SLEEP_INPUT_BG,
  },
  phaseChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  alarmRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  alarmChip: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.sleep, 0.12),
    backgroundColor: SLEEP_INPUT_BG,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    gap: 2,
  },
  alarmChipRecommended: {
    borderColor: withOpacity(Colors.sleep, 0.34),
    backgroundColor: withOpacity(Colors.sleep, 0.14),
  },
  alarmRecommended: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.sleep,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  alarmTime: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  alarmMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
