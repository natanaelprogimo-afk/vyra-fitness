import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  ACTIVITY_OPTIONS,
  cmToFeetInches,
  feetInchesToCm,
  GENDER_OPTIONS,
  kgToLb,
  lbToKg,
} from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';
import { calculateBMI } from '@/utils/calculations';
import { router } from 'expo-router';

function parseNumber(value: string) {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getBmiSummary(bmi: number | null) {
  if (bmi === null) {
    return {
      label: 'Pendiente',
      detail: 'Completá tu base para calibrar el score.',
      color: withOpacity(Colors.white, 0.18),
    };
  }

  if (bmi < 18.5) {
    return {
      label: 'Bajo peso',
      detail: 'Bajo peso · score base: 74 pts',
      color: Colors.info,
    };
  }

  if (bmi < 25) {
    return {
      label: 'Normal',
      detail: 'Normal · score base: 82 pts',
      color: Colors.recovery,
    };
  }

  if (bmi < 30) {
    return {
      label: 'Sobrepeso',
      detail: 'Sobrepeso · score base: 74 pts',
      color: '#F5C24B',
    };
  }

  if (bmi < 35) {
    return {
      label: 'Obesidad clase I',
      detail: 'Obesidad clase I · score base: 68 pts',
      color: Colors.fasting,
    };
  }

  return {
    label: 'Obesidad clase II+',
    detail: 'Obesidad clase II+ · score base: 60 pts',
    color: Colors.error,
  };
}

export default function StepBaseScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [age, setAge] = useState('25');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightValue, setWeightValue] = useState('70');
  const [heightValue, setHeightValue] = useState('170');
  const [feetValue, setFeetValue] = useState('5');
  const [inchesValue, setInchesValue] = useState('7');
  const [gender, setGender] = useState<'female' | 'male' | 'non_binary' | 'prefer_not_to_say'>('male');
  const [activityLevel, setActivityLevel] = useState<0 | 1 | 2 | 3 | 4 | 5>(2);

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      const data = progress.data ?? {};
      setDraft(data);
      const nextAge = typeof data.age === 'number' ? data.age : 25;
      const nextHeight = typeof data.height_cm === 'number' ? data.height_cm : 170;
      const nextWeight = typeof data.weight_start_kg === 'number' ? data.weight_start_kg : 70;
      const feetInches = cmToFeetInches(nextHeight);
      setAge(String(nextAge));
      setHeightValue(String(Math.round(nextHeight)));
      setWeightValue(String(Math.round(nextWeight)));
      setFeetValue(String(feetInches.feet));
      setInchesValue(String(feetInches.inches));
      const nextGender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' =
        data.gender === 'female'
          ? 'female'
          : data.gender === 'male'
            ? 'male'
            : data.gender === 'non_binary'
              ? 'non_binary'
              : 'prefer_not_to_say';
      setGender(nextGender);
      setActivityLevel(((data.activity_level as any) ?? 2) as 0 | 1 | 2 | 3 | 4 | 5);
    })();
    return () => {
      active = false;
    };
  }, []);

  const resolvedWeightKg = useMemo(() => {
    const numeric = parseNumber(weightValue);
    if (numeric === null) return null;
    return weightUnit === 'kg' ? numeric : lbToKg(numeric);
  }, [weightUnit, weightValue]);

  const resolvedHeightCm = useMemo(() => {
    if (heightUnit === 'cm') return parseNumber(heightValue);
    const feet = parseNumber(feetValue) ?? 0;
    const inches = parseNumber(inchesValue) ?? 0;
    if (feet <= 0) return null;
    return feetInchesToCm(feet, inches);
  }, [feetValue, heightUnit, heightValue, inchesValue]);

  const bmi = useMemo(() => {
    if (!resolvedWeightKg || !resolvedHeightCm) return null;
    return calculateBMI(resolvedWeightKg, resolvedHeightCm);
  }, [resolvedHeightCm, resolvedWeightKg]);
  const bmiSummary = useMemo(() => getBmiSummary(bmi), [bmi]);

  const canContinue = (() => {
    const ageValue = parseNumber(age);
    if (!ageValue || ageValue < 16 || ageValue > 80) return false;
    if (!resolvedHeightCm || resolvedHeightCm < 120 || resolvedHeightCm > 230) return false;
    if (!resolvedWeightKg || resolvedWeightKg < 30 || resolvedWeightKg > 300) return false;
    return true;
  })();

  const changeWeightUnit = (next: 'kg' | 'lb') => {
    if (next === weightUnit) return;
    const baseKg = resolvedWeightKg ?? draft?.weight_start_kg ?? 70;
    setWeightUnit(next);
    setWeightValue(next === 'kg' ? String(Math.round(baseKg)) : String(Math.round(kgToLb(baseKg))));
  };

  const changeHeightUnit = (next: 'cm' | 'ft') => {
    if (next === heightUnit) return;
    const baseCm = resolvedHeightCm ?? draft?.height_cm ?? 170;
    setHeightUnit(next);
    if (next === 'cm') {
      setHeightValue(String(Math.round(baseCm)));
      return;
    }
    const feetInches = cmToFeetInches(baseCm);
    setFeetValue(String(feetInches.feet));
    setInchesValue(String(feetInches.inches));
  };

  const handleContinue = async () => {
    if (!canContinue) return;
    const nextDraft: OnboardingDraft = {
      ...(draft ?? {}),
      age: Number(age),
      height_cm: Math.round(resolvedHeightCm ?? 170),
      weight_start_kg: Number((resolvedWeightKg ?? 70).toFixed(1)),
      gender,
      activity_level: activityLevel,
    };
    await saveOnboardingProgress(Routes.auth.onboarding.finish, nextDraft);
    router.push(Routes.auth.onboarding.finish as any);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.base}
      eyebrow="Tu punto de partida"
      title={
        <View>
          <Text style={styles.title}>Tu base</Text>
          <Text style={styles.title}>inicial.</Text>
        </View>
      }
      subtitle="Edad, agua, pasos y score."
      footer={
        <>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onPress={handleContinue}
            disabled={!canContinue}
            icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
            iconRight
          >
            Continuar
          </Button>
          <Text style={styles.helper}>Podés cambiarlo todo después desde Ajustes.</Text>
        </>
      }
    >
      <View style={styles.row}>
        <Input label="Edad" value={age} onChangeText={setAge} keyboardType="number-pad" style={styles.smallInput} />
        <Card style={styles.unitGroup} shadow={false}>
          <Text style={styles.unitLabel}>Altura</Text>
          <View style={styles.toggleRow}>
            {(['cm', 'ft'] as const).map((unit) => (
              <Pressable key={unit} onPress={() => changeHeightUnit(unit)} style={[styles.unitChip, heightUnit === unit && styles.unitChipActive]}>
                <Text style={[styles.unitChipText, heightUnit === unit && styles.unitChipTextActive]}>{unit}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </View>

      {heightUnit === 'cm' ? (
        <Input label="Altura" value={heightValue} onChangeText={setHeightValue} keyboardType="decimal-pad" unit="cm" />
      ) : (
        <View style={styles.row}>
          <Input label="Altura" value={feetValue} onChangeText={setFeetValue} keyboardType="number-pad" unit="ft" style={styles.smallInput} />
          <Input label="Pulgadas" value={inchesValue} onChangeText={setInchesValue} keyboardType="number-pad" unit="in" style={styles.smallInput} />
        </View>
      )}

      <Card style={styles.unitGroup} shadow={false}>
        <Text style={styles.unitLabel}>Peso</Text>
        <View style={styles.toggleRow}>
          {(['kg', 'lb'] as const).map((unit) => (
            <Pressable key={unit} onPress={() => changeWeightUnit(unit)} style={[styles.unitChip, weightUnit === unit && styles.unitChipActive]}>
              <Text style={[styles.unitChipText, weightUnit === unit && styles.unitChipTextActive]}>{unit}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Input label="Peso" value={weightValue} onChangeText={setWeightValue} keyboardType="decimal-pad" unit={weightUnit} />

      <Card style={styles.bmiCard} accentColor={bmiSummary.color} shadow={false}>
        <View style={styles.bmiTop}>
          <View
            style={[
              styles.bmiRing,
              {
                borderColor: withOpacity(bmiSummary.color, 0.9),
                backgroundColor: withOpacity(bmiSummary.color, 0.1),
              },
            ]}
          >
            <Text style={[styles.bmiValue, { color: bmiSummary.color }]}>{bmi ? bmi.toFixed(1) : '--'}</Text>
          </View>
          <View style={styles.bmiCopy}>
            <Text style={styles.bmiLabel}>{bmiSummary.label}</Text>
            <Text style={styles.bmiMeta}>{bmiSummary.detail}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.genderWrap}>
        {GENDER_OPTIONS.map((option) => (
          <Pressable key={option.id} onPress={() => setGender(option.id)} style={[styles.genderChip, gender === option.id && styles.genderChipActive]}>
            <Text style={[styles.genderChipText, gender === option.id && styles.genderChipTextActive]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.activityWrap}>
        <Text style={styles.sectionLabel}>Nivel de actividad</Text>
        <View style={styles.activityRow}>
          {ACTIVITY_OPTIONS.map((option) => (
            <Pressable key={option.id} onPress={() => setActivityLevel(option.id)} style={[styles.activityChip, activityLevel === option.id && styles.activityChipActive]}>
              <Text style={[styles.activityChipText, activityLevel === option.id && styles.activityChipTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
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
  row: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  smallInput: {
    flex: 1,
  },
  unitGroup: {
    flex: 1,
    padding: Spacing[3],
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.surface2, 0.92),
  },
  unitLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  unitChip: {
    flex: 1,
    minHeight: 34,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitChipActive: {
    borderColor: withOpacity(Colors.brand, 0.34),
    backgroundColor: withOpacity(Colors.brand, 0.16),
  },
  unitChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  unitChipTextActive: {
    color: Colors.brandLight,
  },
  bmiCard: {
    backgroundColor: withOpacity(Colors.surface1, 0.96),
  },
  bmiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  bmiRing: {
    width: 66,
    height: 66,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: withOpacity(Colors.recovery, 0.9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiCopy: {
    flex: 1,
    gap: 4,
  },
  bmiValue: {
    fontFamily: FontFamily.display,
    fontSize: 24,
  },
  bmiLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  bmiMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  genderWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  genderChip: {
    width: '48%',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[3],
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderChipActive: {
    borderColor: withOpacity(Colors.brand, 0.4),
    backgroundColor: withOpacity(Colors.brand, 0.14),
  },
  genderChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  genderChipTextActive: {
    color: Colors.brandLight,
  },
  activityWrap: {
    gap: Spacing[2],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  activityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  activityChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.white, 0.03),
    paddingHorizontal: Spacing[4],
    paddingVertical: 12,
  },
  activityChipActive: {
    borderColor: withOpacity(Colors.brand, 0.4),
    backgroundColor: withOpacity(Colors.brand, 0.18),
  },
  activityChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  activityChipTextActive: {
    color: Colors.brandLight,
  },
  helper: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
