// ============================================================
// VYRA FITNESS — Onboarding Step 2: Datos corporales
// ============================================================

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { OnboardingProgress } from './step1-goals';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { validateAge, validateHeight, validateWeight } from '@/utils/validators';
import { calculateBMI, getBMICategory } from '@/utils/calculations';
import type { Gender } from '@/types/user';

const GENDERS: { id: Gender; label: string; emoji: string }[] = [
  { id: 'male',             label: 'Masculino',       emoji: '♂️' },
  { id: 'female',           label: 'Femenino',        emoji: '♀️' },
  { id: 'non_binary',       label: 'No binario',      emoji: '⚧️' },
  { id: 'prefer_not_to_say',label: 'Prefiero no decir',emoji: '🤐' },
];

export default function Step2Body() {
  const params = useLocalSearchParams<{ goal: string }>();
  const [gender,      setGender]      = useState<Gender | null>(null);
  const [age,         setAge]         = useState('');
  const [height,      setHeight]      = useState('');
  const [weight,      setWeight]      = useState('');
  const [goalWeight,  setGoalWeight]  = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const bmi = height && weight
    ? calculateBMI(parseFloat(weight), parseFloat(height))
    : null;
  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!gender) e.gender = 'Seleccioná tu sexo biológico.';
    const ageErr    = validateAge(age ? parseInt(age) : null);
    const heightErr = validateHeight(height ? parseFloat(height) : null);
    const weightErr = validateWeight(weight ? parseFloat(weight) : null);
    if (ageErr)    e.age    = ageErr;
    if (heightErr) e.height = heightErr;
    if (weightErr) e.weight = weightErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    router.push({
      pathname: '/(auth)/onboarding/step3-activity',
      params: {
        ...params,
        gender,
        age,
        height,
        weight,
        goalWeight: goalWeight || '',
      },
    } as any);
  };

  return (
    <SafeScreen scrollable>
      <OnboardingProgress step={2} total={5} />
      <Text style={styles.title}>Contanos un poco de vos</Text>
      <Text style={styles.subtitle}>Calculamos tu TDEE y metas personalizadas.</Text>

      {/* Género */}
      <Text style={styles.sectionLabel}>Sexo biológico</Text>
      {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
      <View style={styles.genderRow}>
        {GENDERS.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setGender(g.id); }}
            style={[styles.genderBtn, gender === g.id && styles.genderBtnActive]}
          >
            <Text style={styles.genderEmoji}>{g.emoji}</Text>
            <Text style={[styles.genderLabel, gender === g.id && styles.genderLabelActive]}>{g.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Métricas */}
      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <Input label="Edad" value={age} onChangeText={setAge} keyboardType="numeric" error={errors.age} unit="años" returnKeyType="next" />
        </View>
        <View style={styles.metricHalf}>
          <Input label="Altura" value={height} onChangeText={setHeight} keyboardType="numeric" error={errors.height} unit="cm" returnKeyType="next" />
        </View>
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <Input label="Peso actual" value={weight} onChangeText={setWeight} keyboardType="numeric" error={errors.weight} unit="kg" returnKeyType="next" />
        </View>
        <View style={styles.metricHalf}>
          <Input label="Peso objetivo" value={goalWeight} onChangeText={setGoalWeight} keyboardType="numeric" unit="kg" hint="Opcional" returnKeyType="done" />
        </View>
      </View>

      {/* BMI Preview */}
      {bmi && bmiInfo && (
        <View style={[styles.bmiCard, { borderColor: bmiInfo.color + '44', backgroundColor: bmiInfo.color + '11' }]}>
          <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>BMI {bmi}</Text>
          <Text style={[styles.bmiLabel, { color: bmiInfo.color }]}>{bmiInfo.label}</Text>
          <Text style={styles.bmiDisclaimer}>Estimación. No reemplaza diagnóstico médico.</Text>
        </View>
      )}

      <Button onPress={handleNext} variant="primary" fullWidth size="lg" style={styles.cta}>
        Siguiente →
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  title:          { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginTop: Spacing[6], marginBottom: Spacing[2] },
  subtitle:       { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing[5] },
  sectionLabel:   { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2] },
  error:          { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.error, marginBottom: Spacing[2] },
  genderRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[4] },
  genderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5],
    paddingVertical: Spacing[2], paddingHorizontal: Spacing[3],
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  genderBtnActive: { borderColor: Colors.brand, backgroundColor: Colors.brand + '15' },
  genderEmoji:     { fontSize: 14 },
  genderLabel:     { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textSecondary },
  genderLabelActive:{ color: Colors.brand },
  metricsRow:     { flexDirection: 'row', gap: Spacing[3] },
  metricHalf:     { flex: 1 },
  bmiCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    padding: Spacing[4], borderRadius: Radius.xl, borderWidth: 1,
    marginBottom: Spacing[4],
  },
  bmiValue:       { fontFamily: FontFamily.bold, fontSize: FontSize.xl },
  bmiLabel:       { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, flex: 1 },
  bmiDisclaimer:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, flexShrink: 1 },
  cta:            { marginBottom: Spacing[6] },
});