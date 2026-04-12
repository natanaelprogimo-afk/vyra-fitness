import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { STEP_GOAL_PRESETS } from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';
import { router } from 'expo-router';

function parseNumber(value: string) {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: Date | null) {
  if (!value) return 'Elegir';
  return value.toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function StepGoalsMetaScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number>(10000);
  const [customSteps, setCustomSteps] = useState('');
  const [weightGoal, setWeightGoal] = useState('');
  const [goalDate, setGoalDate] = useState<Date | null>(null);
  const [showIosPicker, setShowIosPicker] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      const data = progress.data ?? {};
      setDraft(data);
      const stepGoal = typeof data.step_goal === 'number' ? data.step_goal : 10000;
      if (STEP_GOAL_PRESETS.includes(stepGoal as any)) {
        setSelectedPreset(stepGoal);
      } else {
        setSelectedPreset(10000);
        setCustomSteps(String(stepGoal));
      }
      if (typeof data.weight_goal_kg === 'number') setWeightGoal(String(data.weight_goal_kg));
      if (typeof data.weight_goal_date === 'string' && data.weight_goal_date) setGoalDate(new Date(data.weight_goal_date));
    })();
    return () => {
      active = false;
    };
  }, []);

  const resolvedStepGoal = useMemo(() => {
    const custom = parseNumber(customSteps);
    if (custom && custom >= 3000) return Math.round(custom);
    return selectedPreset;
  }, [customSteps, selectedPreset]);

  const handleDateChange = (_event: DateTimePickerEvent, nextValue?: Date) => {
    if (nextValue) setGoalDate(nextValue);
    if (Platform.OS === 'ios') setShowIosPicker(false);
  };

  const openDatePicker = () => {
    const value = goalDate ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        onChange: handleDateChange,
      });
      return;
    }
    setShowIosPicker((current) => !current);
  };

  const handleContinue = async () => {
    const nextDraft: OnboardingDraft = {
      ...(draft ?? {}),
      step_goal: resolvedStepGoal,
      weight_goal_kg: parseNumber(weightGoal) ?? undefined,
      weight_goal_date: goalDate ? goalDate.toISOString().slice(0, 10) : null,
    };
    await saveOnboardingProgress(Routes.auth.onboarding.permissions, nextDraft);
    router.push(Routes.auth.onboarding.permissions as any);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.meta}
      eyebrow="Tus metas"
      title={
        <View>
          <Text style={styles.title}>Poné un</Text>
          <Text style={styles.title}>número.</Text>
        </View>
      }
      subtitle="Pasos ahora. Peso si te suma."
      footer={
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onPress={handleContinue}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          iconRight
        >
          Continuar
        </Button>
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Meta de pasos diarios</Text>
        <View style={styles.presetRow}>
          {STEP_GOAL_PRESETS.map((preset) => {
            const active = resolvedStepGoal === preset && !customSteps;
            const labels: Record<number, string> = { 5000: 'Suave', 10000: 'Estándar', 15000: 'Activo' };
            return (
              <Pressable key={preset} onPress={() => { setSelectedPreset(preset); setCustomSteps(''); }} style={[styles.presetCard, active && styles.presetCardActive]}>
                <Text style={[styles.presetValue, active && styles.presetValueActive]}>{Math.round(preset / 1000)}k</Text>
                <Text style={[styles.presetText, active && styles.presetTextActive]}>{labels[preset]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Input label="Ingresá tu meta" value={customSteps} onChangeText={setCustomSteps} keyboardType="number-pad" hint="10.000 pasos" />
      </View>

      <Card style={styles.goalCard} shadow={false}>
        <Text style={styles.sectionLabel}>Meta de peso (opcional)</Text>
        <Input label="Peso objetivo" value={weightGoal} onChangeText={setWeightGoal} keyboardType="decimal-pad" unit="kg" />
        <Pressable onPress={openDatePicker} style={styles.dateField}>
          <View>
            <Text style={styles.dateLabel}>Fecha objetivo</Text>
            <Text style={styles.dateValue}>{formatDate(goalDate)}</Text>
          </View>
          <Text style={styles.dateAction}>Elegir</Text>
        </Pressable>
        {Platform.OS === 'ios' && showIosPicker ? (
          <View style={styles.iosPickerWrap}>
            <DateTimePicker
              value={goalDate ?? new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              themeVariant="dark"
              textColor={Colors.textPrimary}
            />
          </View>
        ) : null}
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 38,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  section: {
    gap: Spacing[3],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  presetCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface1, 0.96),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  presetCardActive: {
    borderColor: withOpacity(Colors.brand, 0.44),
    backgroundColor: withOpacity(Colors.brand, 0.18),
  },
  presetValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  presetValueActive: {
    color: Colors.brandLight,
  },
  presetText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  presetTextActive: {
    color: Colors.brandLight,
  },
  goalCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface1, 0.96),
  },
  dateField: {
    minHeight: 56,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  dateLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  dateValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  dateAction: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.brandLight,
  },
  iosPickerWrap: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
  },
});
