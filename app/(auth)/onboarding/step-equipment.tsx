import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import {
  EQUIPMENT_OPTIONS,
  getAccessibleOnboardingRoute,
  getFirstIncompleteOnboardingRoute,
  type OnboardingEquipmentType,
} from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function StepEquipmentScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [equipment, setEquipment] = useState<OnboardingEquipmentType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.equipment,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.equipment) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setEquipment(
        progress.data?.equipment === 'gym_full' ||
          progress.data?.equipment === 'home_basic' ||
          progress.data?.equipment === 'gym_and_home' ||
          progress.data?.equipment === 'bodyweight'
          ? progress.data.equipment
          : null,
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (!equipment || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        equipment,
      });

      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        equipment,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Equipment] Failed to continue:', err);
      setSaveError('No pudimos guardar tu equipo. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.equipment}
      eyebrow="Lugar de entreno"
      title="¿Dónde vas a entrenar la mayor parte del tiempo?"
      subtitle="Si entrenas en casa luego puedes afinar material desde Ajustes. Ahora no te frenamos con inventario."
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
          <Button onPress={handleContinue} disabled={!equipment || isProcessing} fullWidth size="md" haptic="medium" loading={isProcessing}>
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.optionsContainer}>
        {EQUIPMENT_OPTIONS.map((option) => {
          const selected = option.id === equipment;

          return (
            <View key={option.id} style={styles.optionWrapper}>
              <OnboardingOptionCard
                id={option.id}
                label={option.label}
                subtitle={option.subtitle}
                icon={option.emoji}
                isSelected={selected}
                onPress={() => setEquipment(option.id)}
                accentColor={Colors.action}
              />
            </View>
          );
        })}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: 0,
    paddingBottom: Spacing[2],
  },
  optionsContainer: {
    gap: Spacing[2],
  },
  optionWrapper: {
    minHeight: 96,
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
