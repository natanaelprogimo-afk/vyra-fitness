import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingWheelPicker from '@/components/onboarding/OnboardingWheelPicker';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function ExpressWeightScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      // ARREGLO: Validar que vienen del express-gender
      if (!progress.data?.gender) {
        console.warn('[Express Weight] Gender not set, redirecting to express-gender');
        router.replace(Routes.auth.onboarding.expressGender as never);
        return;
      }

      setDraft(progress.data ?? null);
      setAge(
        typeof progress.data?.age === 'number' && progress.data.age >= 13
          ? progress.data.age
          : 25,
      );
      setHeightCm(
        typeof progress.data?.height_cm === 'number' && progress.data.height_cm >= 120
          ? progress.data.height_cm
          : 170,
      );
      setWeightKg(
        typeof progress.data?.weight_start_kg === 'number' && progress.data.weight_start_kg >= 35
          ? Math.round(progress.data.weight_start_kg)
          : 70,
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setSaveError(null);

    try {
      await saveOnboardingProgress(Routes.auth.onboarding.expressReady, {
        ...(draft ?? {}),
        age,
        height_cm: heightCm,
        weight_start_kg: weightKg,
        weight_current_kg: weightKg,
      });

      router.push(Routes.auth.onboarding.expressReady as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Express Weight] Failed to continue:', err);
      setSaveError('No pudimos guardar tus datos. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.expressWeight}
      eyebrow="Exprés • Paso 2 de 3"
      title="Tu base física"
      subtitle="Necesitamos estos datos para personalizar tu experiencia."
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
          <Button
            onPress={handleContinue}
            fullWidth
            size="md"
            haptic="medium"
            loading={isProcessing}
            disabled={isProcessing}
          >
            Siguiente
          </Button>
        </View>
      }
    >
      <View style={styles.steppersContainer}>
        <Text style={styles.label}>Edad</Text>
        <OnboardingWheelPicker
          value={age}
          values={Array.from({ length: 108 }, (_, i) => i + 13)}
          unit="años"
          onChange={setAge}
          a11yLabel="Age picker"
        />

        <Text style={styles.label}>Altura</Text>
        <OnboardingWheelPicker
          value={heightCm}
          values={Array.from({ length: 131 }, (_, i) => i + 120)}
          unit="cm"
          onChange={setHeightCm}
          a11yLabel="Height picker"
        />

        <Text style={styles.label}>Peso</Text>
        <OnboardingWheelPicker
          value={weightKg}
          values={Array.from({ length: 216 }, (_, i) => i + 35)}
          unit="kg"
          onChange={setWeightKg}
          a11yLabel="Weight picker"
        />
      </View>

      <Text style={styles.trustNote}>
        💡 Solo usamos esto para calcular tus calorías y macros personalizados.
      </Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[2],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  steppersContainer: {
    gap: Spacing[2],
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  trustNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 15,
    color: Colors.textSecondary,
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
