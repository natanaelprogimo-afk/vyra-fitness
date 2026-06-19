import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  GOAL_OPTIONS,
  buildSuggestedActiveModules,
  getFirstIncompleteOnboardingRoute,
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
  lose_fat: 'Te configuraremos con nutrición en el centro y módulos esenciales activos.',
  gain_muscle: 'Entrenamientos y proteína van a guiar tu día. Configuración optimizada.',
  improve_health: 'Pasos, sueño y agua serán tus métricas principales.',
  improve_appearance: 'Nutrición y entrenamientos con foco visual.',
  eat_better: 'La nutrición domina tu setup. Base sólida sin presión.',
  recover_habit: 'Racha y módulos activos van al frente desde el inicio.',
  perform_better: 'Entrenamientos y recuperación guiarán tu día.',
  feel_better: 'Sueño, agua y bienestar general optimizados.',
};

const EQUIPMENT_BY_GOAL: Record<string, 'gym_full' | 'home_basic' | 'gym_and_home' | 'bodyweight'> = {
  lose_fat: 'gym_full',
  gain_muscle: 'gym_full',
  improve_health: 'bodyweight',
  improve_appearance: 'gym_full',
  eat_better: 'bodyweight',
  recover_habit: 'home_basic',
  perform_better: 'gym_full',
  feel_better: 'home_basic',
};

export default function ExpressGoalScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [goalDetail, setGoalDetail] = useState<OnboardingGoalDetailId | null>(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

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
    if (!goalDetail) return;

    const option = getGoalOption(goalDetail);
    if (!option) return;

    const equipment = EQUIPMENT_BY_GOAL[goalDetail] || 'gym_full';

    const suggestedModules = buildSuggestedActiveModules(goalDetail, 'male', false);

    // ARREGLO: Agregar validación de acceso
    if (!draft) {
      console.error('[Express Goal] Draft not initialized');
      return;
    }

    await saveOnboardingProgress(Routes.auth.onboarding.expressGender, {
      ...(draft ?? {}),
      goal: option.profileGoal,
      goal_detail: goalDetail,
      weight_start_kg: 70,
      weight_current_kg: 70,
      height_cm: 170,
      age: 25,
      // Don't set gender here - let express-gender ask for it
      // Don't override female_health_enabled - let step-female handle it
      equipment,
      active_modules: suggestedModules,
      nutrition_pattern: 'sin_restricciones',
      fasting_protocol: '16:8',
    });

    router.push(Routes.auth.onboarding.expressGender as never);
  };

  const displayedOptions = GOAL_OPTIONS.slice(0, 6);

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.expressGoal}
      eyebrow="Exprés • Paso 1 de 3"
      title="¿Qué querés conseguir primero?"
      subtitle="Selecciona tu objetivo principal."
      scrollable
      contentStyle={styles.content}
      footer={
        <Button onPress={handleContinue} disabled={!goalDetail} fullWidth size="md" haptic="medium">
          Siguiente
        </Button>
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
          <Text style={styles.contextText}>
            {GOAL_CONTEXT_COPY[goalDetail]}
          </Text>
        </Animated.View>
      )}
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
    gap: Spacing[2],
  },
  cardWrapper: {
    width: '48%',
    minHeight: 96,
  },
  contextText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.action,
    fontStyle: 'italic',
  },
});
