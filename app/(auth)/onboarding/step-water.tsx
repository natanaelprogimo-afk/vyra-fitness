import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import {
  getAccessibleOnboardingRoute,
  getFirstIncompleteOnboardingRoute,
} from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

const WATER_GOAL_PRESETS = [
  {
    value: 1500,
    label: '1.5 litros',
    emoji: '💧',
    subtitle: 'Meta mínima de hidratación',
  },
  {
    value: 2000,
    label: '2 litros',
    emoji: '💦',
    subtitle: 'Recomendación clásica',
  },
  {
    value: 2500,
    label: '2.5 litros',
    emoji: '🌊',
    subtitle: 'Activo o clima cálido',
  },
  {
    value: 3000,
    label: '3 litros',
    emoji: '🚰',
    subtitle: 'Muy activo o deportista',
  },
] as const;

function formatWaterMl(ml: number) {
  const liters = ml / 1000;
  return liters.toFixed(1) + 'L';
}

export default function StepWaterScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [goal, setGoal] = useState(2000);
  const [customGoal, setCustomGoal] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.water,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.water) {
        router.replace(nextRoute as never);
        return;
      }

      const savedGoal =
        typeof progress.data?.water_goal_ml === 'number' && progress.data.water_goal_ml >= 500
          ? Math.round(progress.data.water_goal_ml)
          : 2000;

      setDraft(progress.data ?? null);
      setGoal(savedGoal);
      setIsCustom(!WATER_GOAL_PRESETS.some((option) => option.value === savedGoal));
      setCustomGoal(
        !WATER_GOAL_PRESETS.some((option) => option.value === savedGoal) ? String(savedGoal) : '',
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const customGoalNumber = Number(customGoal);
  const isCustomGoalValid =
    customGoal.trim().length > 0 &&
    Number.isFinite(customGoalNumber) &&
    customGoalNumber >= 500 &&
    customGoalNumber <= 4000;
  const canContinue = isCustom ? isCustomGoalValid : goal >= 500;

  const handlePresetSelect = (value: number) => {
    setGoal(value);
    setIsCustom(false);
  };

  const handleCustomChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setCustomGoal(sanitized);
    setIsCustom(true);

    const parsed = Number(sanitized);
    if (Number.isFinite(parsed) && parsed >= 500 && parsed <= 4000) {
      setGoal(Math.round(parsed));
    }
  };

  const handleContinue = async () => {
    if (!canContinue || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const nextGoal = isCustom && isCustomGoalValid ? Math.round(customGoalNumber) : goal;
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        water_goal_ml: nextGoal,
      });

      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        water_goal_ml: nextGoal,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Water] Failed to continue:', err);
      setSaveError('No pudimos guardar tu meta. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.water}
      eyebrow="Hidratación"
      title={<Text style={styles.title}>Cuanta agua diaria apuntas?</Text>}
      subtitle="La hidratación es base para todo. Podes ajustarla después."
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
            disabled={!canContinue || isProcessing}
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
      <View style={styles.summaryPill}>
        <Text style={styles.summaryPillEmoji}>
          {!isCustom ? WATER_GOAL_PRESETS.find((p) => p.value === goal)?.emoji : '✅'}
        </Text>
        <Text style={styles.summaryPillText}>{formatWaterMl(goal)} diarios</Text>
      </View>

      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Meta de agua">
        {WATER_GOAL_PRESETS.map((option) => {
          const selected = !isCustom && goal === option.value;

          return (
            <View key={option.value} style={styles.cardWrapper}>
              <OnboardingOptionCard
                id={String(option.value)}
                label={option.label}
                subtitle={option.subtitle}
                icon={option.emoji}
                isSelected={selected}
                onPress={() => handlePresetSelect(option.value)}
                accentColor={Colors.water}
              />
            </View>
          );
        })}
      </View>

      <View style={[styles.customCard, isCustom ? styles.customCardActive : null]}>
        <View style={styles.customHeader}>
          <View style={styles.customHeaderText}>
            <Text style={styles.customTitle}>Defino yo</Text>
            <Text style={styles.customSubtitle}>Entre 500ml y 4L</Text>
          </View>
        </View>

        <Input
          placeholder="2000"
          value={customGoal}
          onChangeText={handleCustomChange}
          keyboardType="number-pad"
          maxLength={4}
          editable={isProcessing === false}
          accessibilityLabel="Meta personalizada de agua en mililitros"
        />

        {isCustomGoalValid && (
          <Text style={styles.customFeedback}>✓ {formatWaterMl(customGoalNumber)}</Text>
        )}
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
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 24,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.water, 0.1),
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2.5],
    borderRadius: Radius[2],
    alignSelf: 'flex-start',
  },
  summaryPillEmoji: {
    fontSize: 24,
  },
  summaryPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  grid: {
    gap: Spacing[2],
  },
  cardWrapper: {
    width: '100%',
  },
  customCard: {
    backgroundColor: withOpacity(Colors.water, 0.05),
    borderRadius: Radius[2],
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[2],
    borderWidth: 1,
    borderColor: withOpacity(Colors.water, 0.2),
    gap: Spacing[1.5],
  },
  customCardActive: {
    backgroundColor: withOpacity(Colors.water, 0.1),
    borderColor: Colors.water,
    borderWidth: 2,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customHeaderText: {
    flex: 1,
  },
  customTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: Spacing[0.5],
  },
  customSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  customFeedback: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.water,
    marginTop: Spacing[1],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: withOpacity(Colors.error, 0.1),
    borderLeftColor: Colors.error,
    borderLeftWidth: 4,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius[1],
    marginBottom: Spacing[2],
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
});
