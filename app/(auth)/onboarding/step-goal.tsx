// REDESIGNED: 2026-06-11 - improved UX with reduced cognitive load and dynamic feedback
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import OnboardingHelper, { type HelperResult } from '@/components/onboarding/OnboardingHelper';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  GOAL_OPTIONS,
  getAccessibleOnboardingRoute,
  getGoalOption,
  type OnboardingGoalDetailId,
} from '@/lib/onboarding-v2';
import { getGoalVisual } from '@/lib/onboarding-profile';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

const GOAL_CONTEXT_COPY: Record<OnboardingGoalDetailId, string> = {
  lose_fat: 'La nutrición y el déficit calórico van a ser el centro de tu Home.',
  gain_muscle: 'El entrenamiento y la ingesta de proteína van a guiar tu día.',
  improve_health: 'Pasos, sueño y agua van a ser tus métricas principales.',
  improve_appearance: 'Nutrición y entrenamiento con foco visual van al centro.',
  eat_better: 'La nutrición domina tu Home. Sin presión, base a base.',
  recover_habit: 'Racha y módulos activos van a ser lo primero que veas.',
  perform_better: 'Entreno y recuperación van a guiar tu día.',
  feel_better: 'Sueño, agua y bienestar general van al frente.',
};

export default function StepGoalScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [goalDetail, setGoalDetail] = useState<OnboardingGoalDetailId | null>(null);
  const [helperVisible, setHelperVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.goal,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.goal) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      const nextGoal = progress.data?.goal_detail;
      setGoalDetail(
        typeof nextGoal === 'string' && getGoalOption(nextGoal as OnboardingGoalDetailId)
          ? (nextGoal as OnboardingGoalDetailId)
          : null,
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  // Animate footer text when goal changes
  useEffect(() => {
    if (goalDetail) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [goalDetail, fadeAnim]);

  const handleContinue = async () => {
    if (!goalDetail || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const option = getGoalOption(goalDetail);
      if (!option) {
        setSaveError('Error: opción de objetivo inválida');
        setIsProcessing(false);
        processingRef.current = false;
        return;
      }

      await saveOnboardingProgress(Routes.auth.onboarding.age, {
        ...(draft ?? {}),
        goal: option.profileGoal,
        goal_detail: goalDetail,
      });

      // Success: navigate
      processingRef.current = false;
      router.push(Routes.auth.onboarding.age as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Goal] Failed to continue:', errorMessage);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleHelperSelect = (result: HelperResult) => {
    if (result.mode === 'goal') {
      setGoalDetail(result.recommendation as OnboardingGoalDetailId);
      setHelperVisible(false);
    }
  };

  // Limit to 6 most common options to reduce cognitive load
  const displayedOptions = GOAL_OPTIONS.slice(0, 6);

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.goal}
      eyebrow="Objetivo principal"
      title="¿Qué querés conseguir primero?"
      subtitle="Elegimos una sola prioridad para arrancar con foco real, sin mezclar frentes."
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
            disabled={!goalDetail || isProcessing} 
            fullWidth 
            size="md" 
            haptic="medium"
            loading={isProcessing}
          >
            Continuar
          </Button>
        </View>
      }
    >
      <ScrollView
        scrollEnabled={false}
        style={styles.optionsContainer}
        accessibilityRole="radiogroup"
        accessibilityLabel="Objetivo principal"
      >
        <View style={styles.grid}>
          {displayedOptions.map((option) => {
            const selected = goalDetail === option.id;
            const visual = getGoalVisual(option.id);

            return (
              <View key={option.id} style={styles.cardWrapper}>
                <OnboardingOptionCard
                  id={option.id}
                  label={option.label}
                  subtitle={option.subtitle}
                  icon={option.emoji}
                  isSelected={selected}
                  onPress={() => setGoalDetail(option.id as OnboardingGoalDetailId)}
                  accentColor={visual.accent}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Dynamic contextual feedback */}
      {goalDetail && (
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Celebration animation */}
          <Animated.View 
            style={{
              transform: [{ scale: fadeAnim }],
              marginBottom: Spacing[2],
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 40 }}>✨</Text>
          </Animated.View>
          <Text style={styles.contextText}>
            {GOAL_CONTEXT_COPY[goalDetail]}
          </Text>
          <Text style={styles.changeHint}>
            💡 Podés cambiar tu objetivo en cualquier momento desde Perfil.
          </Text>
        </Animated.View>
      )}

      {/* Helper text when no selection */}
      {!goalDetail && (
        <View style={styles.helperSection}>
          <Text style={styles.helperText}>
            Elegí uno y seguimos con tu base física.
          </Text>
          <Button
            onPress={() => setHelperVisible(true)}
            variant="secondary"
            fullWidth
            size="sm"
            haptic="light"
          >
            ¿Ayudame a elegir?
          </Button>
        </View>
      )}

      <OnboardingHelper
        visible={helperVisible}
        mode="goal"
        onClose={() => setHelperVisible(false)}
        onSelect={handleHelperSelect}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: 0,
    paddingBottom: Spacing[1],
  },
  optionsContainer: {
    flexGrow: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],    justifyContent: 'flex-start',
  },
  gridCentered: {
    justifyContent: 'center',  },
  cardWrapper: {
    width: '48%',
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
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.error,
  },
  contextText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.action,
    fontStyle: 'italic',
  },
  changeHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginTop: Spacing[2],
  },
  helperText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  helperSection: {
    gap: Spacing[2],
  },
});
