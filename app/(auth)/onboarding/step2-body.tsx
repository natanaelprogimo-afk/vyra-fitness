import { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { OnboardingProgress } from './step1-goals';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { validateWeight } from '@/utils/validators';

export default function Step2Body() {
  const params = useLocalSearchParams<{ goal: string }>();
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const weightPreview = useMemo(() => {
    const parsed = parseFloat(weight);
    if (!Number.isFinite(parsed)) return null;
    const waterGoal = Math.round(parsed * 35);
    return {
      waterGoal,
      stepGoal: parsed >= 95 ? 8000 : 10000,
    };
  }, [weight]);

  const handleNext = () => {
    const parsed = parseFloat(weight);
    const validation = validateWeight(Number.isFinite(parsed) ? parsed : null);
    if (validation) {
      setError(validation);
      return;
    }

    setError(null);
    router.push({
      pathname: '/(auth)/onboarding/step3-activity',
      params: {
        ...params,
        weight,
      },
    } as any);
  };

  return (
    <SafeScreen scrollable>
      <OnboardingProgress step={2} total={4} />
      <Text style={styles.title}>Tu peso actual</Text>
      <Text style={styles.subtitle}>
        Con este dato calibramos hidratación, calorías y progresión del plan.
      </Text>

      <Input
        label="Peso actual"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        unit="kg"
        error={error ?? undefined}
        returnKeyType="done"
      />

      {weightPreview && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Así quedaría tu arranque</Text>
          <Text style={styles.previewItem}>💧 Meta de agua: {weightPreview.waterGoal} ml</Text>
          <Text style={styles.previewItem}>🚶 Meta de pasos: {weightPreview.stepGoal.toLocaleString('es-AR')}</Text>
        </View>
      )}

      <Button onPress={handleNext} variant="primary" fullWidth size="lg" style={styles.cta}>
        Siguiente →
      </Button>

      <Text style={styles.helper}>
        Datos avanzados como altura, sueño y ayuno los completás después en menos de 2 minutos.
      </Text>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    marginTop: Spacing[6],
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.5,
    marginBottom: Spacing[5],
  },
  preview: {
    marginTop: Spacing[4],
    marginBottom: Spacing[5],
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  previewTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  previewItem: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  cta: {
    marginTop: Spacing[2],
  },
  helper: {
    marginTop: Spacing[3],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.5,
  },
});
