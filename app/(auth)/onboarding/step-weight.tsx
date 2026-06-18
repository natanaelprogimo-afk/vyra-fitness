import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingWheelPicker from '@/components/onboarding/OnboardingWheelPicker';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { getAccessibleOnboardingRoute } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function StepWeightScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [weightKg, setWeightKg] = useState(70);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.weight,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.weight) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
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

  const values = useMemo(() => Array.from({ length: 226 }, (_, index) => index + 35), []);

  const handleContinue = async () => {
    if (processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      await saveOnboardingProgress(Routes.auth.onboarding.activity, {
        ...(draft ?? {}),
        weight_start_kg: weightKg,
      });

      // Success: navigate
      processingRef.current = false;
      router.push(Routes.auth.onboarding.activity as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Weight] Failed to continue:', err);
      setSaveError('No pudimos guardar tu peso. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.weight}
      eyebrow="Peso actual"
      title={<Text style={styles.title}>¿Con qué peso arrancás hoy?</Text>}
      subtitle="Nos sirve para agua, gasto, calorías y una base más realista desde el primer día."
      scrollable={false}
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
      <OnboardingWheelPicker value={weightKg} values={values} unit="kg" onChange={setWeightKg} />
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
