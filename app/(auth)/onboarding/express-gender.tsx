import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { GENDER_OPTIONS, normalizeOnboardingGender } from '@/lib/onboarding-profile';
import { getFirstIncompleteOnboardingRoute } from '@/lib/onboarding-v2';
import type { OnboardingBinaryGender } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function ExpressGenderScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [gender, setGender] = useState<OnboardingBinaryGender | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      // ARREGLO: Validar que el usuario viene del express-goal
      // Si no hay draft con goal, redirigir al inicio del express flow
      if (!progress.data?.goal) {
        router.replace(Routes.auth.onboarding.expressGoal as never);
        return;
      }

      setDraft(progress.data ?? null);
      setGender(normalizeOnboardingGender(progress.data?.gender));
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (!gender || isProcessing) return;

    setIsProcessing(true);
    setSaveError(null);

    try {
      await saveOnboardingProgress(Routes.auth.onboarding.expressWeight, {
        ...(draft ?? {}),
        gender,
        // Initialize female_health_enabled as false (will be asked in full flow if needed)
        female_health_enabled: false,
      });

      router.push(Routes.auth.onboarding.expressWeight as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Express Gender] Failed to continue:', err);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.expressGender}
      eyebrow="Exprés • Paso 1b de 3"
      title="Tu sexo biológico"
      subtitle="Esto nos ayuda a personalizar tu experiencia."
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
            disabled={!gender || isProcessing}
            fullWidth
            size="md"
            haptic="medium"
            loading={isProcessing}
          >
            Siguiente
          </Button>
        </View>
      }
    >
      <View style={styles.genderOptions} accessibilityRole="radiogroup" accessibilityLabel="Sexo biológico">
        {GENDER_OPTIONS.map((option) => {
          const selected = gender === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setGender(option.id)}
              style={[styles.genderCard, selected && styles.genderCardActive]}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityHint={option.helper}
              accessibilityState={{ selected }}
            >
              <View style={[styles.genderDot, selected && styles.genderDotActive]} />
              <Text style={styles.genderTitle}>{option.label}</Text>
              <Text style={styles.genderHelper}>{option.helper}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.trustNote}>
        💡 Usamos esto para personalizar el seguimiento de ciclo y nutrición si aplica.
      </Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  genderOptions: {
    gap: Spacing[2],
  },
  genderCard: {
    minHeight: 100,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    gap: Spacing[1.5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCardActive: {
    borderColor: withOpacity(Colors.secondary, 0.34),
    backgroundColor: withOpacity(Colors.secondary, 0.1),
  },
  genderDot: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.white, 0.18),
  },
  genderDotActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  genderTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  genderHelper: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  trustNote: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing[2],
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
