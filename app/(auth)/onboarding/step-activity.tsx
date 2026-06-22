// REDESIGNED: 2026-06-11 - activity level with icons and TDEE preview
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import OnboardingTooltip from '@/components/onboarding/OnboardingTooltip';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { ACTIVITY_OPTIONS, getAccessibleOnboardingRoute, getFirstIncompleteOnboardingRoute } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';
import type { ActivityLevel } from '@/types/user';

// TDEE estimation multipliers (Harris-Benedict formula multiplier)
const TDEE_MULTIPLIERS = {
  0: 1.2,   // Very low - sedentary
  1: 1.375, // Light - light exercise
  2: 1.55,  // Medium - moderate exercise
  3: 1.725, // High - vigorous exercise
  4: 1.9,   // Very high - intense exercise
};

// Estimate TDEE based on weight, height, age, gender, activity level
function estimateTDEE(
  weight?: number | null,
  height?: number | null,
  age?: number | null,
  gender?: string | null,
  activity?: ActivityLevel | null,
): number | null {
  if (!weight || !height || !age || !gender || activity === null || activity === undefined) return null;

  // Simplified BMR calculation (Mifflin-St Jeor)
  const weightKg = weight;
  const heightCm = height;
  const ageyears = age;

  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageyears + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageyears - 161;
  }

  const multiplier = TDEE_MULTIPLIERS[activity as keyof typeof TDEE_MULTIPLIERS];
  return Math.round(bmr * multiplier);
}

export default function StepActivityScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [estimatedTDEE, setEstimatedTDEE] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.activity,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.activity) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setActivityLevel(
        typeof progress.data?.activity_level === 'number'
          ? (progress.data.activity_level as ActivityLevel)
          : 2, // Default to 'Media' (index 2)
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  // Calculate and animate TDEE estimate when activity level changes
  useEffect(() => {
    if (activityLevel !== null && draft) {
      const tdee = estimateTDEE(
        draft.weight_start_kg,
        draft.height_cm,
        draft.age,
        draft.gender,
        activityLevel,
      );
      setEstimatedTDEE(tdee);

      // Animate fade in
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [activityLevel, draft, fadeAnim]);

  const handleContinue = async () => {
    if (activityLevel === null || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      await saveOnboardingProgress(getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        activity_level: activityLevel,
      }), {
        ...(draft ?? {}),
        activity_level: activityLevel,
      });

      processingRef.current = false;
      router.push(getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        activity_level: activityLevel,
      }) as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Activity] Failed to continue:', err);
      setSaveError('No pudimos guardar tu nivel de actividad. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.activity}
      eyebrow="Actividad diaria"
      title="¿Cuánto te movés en una semana normal?"
      subtitle="No pensamos en tu mejor semana, sino en la más parecida a tu realidad de hoy."
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
            disabled={activityLevel === null || isProcessing}
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
      <View style={styles.optionsContainer}>
        {ACTIVITY_OPTIONS.map((option) => {
          const selected = option.id === activityLevel;

          return (
            <View key={option.id} style={styles.optionWrapper}>
              <OnboardingOptionCard
                id={String(option.id)}
                label={option.label}
                subtitle={option.subtitle}
                icon={option.emoji}
                isSelected={selected}
                onPress={() => setActivityLevel(option.id as ActivityLevel)}
                accentColor={Colors.action}
              />
            </View>
          );
        })}
      </View>

      {/* TDEE Estimate Preview */}
      {estimatedTDEE && activityLevel !== null && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.tdeeCard}>
            <View style={styles.tdeeHeader}>
              <Text style={styles.tdeeLabel}>Tu estimación de calorías</Text>
              <OnboardingTooltip 
                label="¿Qué es TDEE?"
                description="TDEE son las calorías que tu cuerpo gasta en un día con tu nivel de actividad actual. Es la base para calcular tus metas de déficit (perder peso) o ganancia (ganar músculo)."
              />
            </View>
            <View style={styles.tdeeRow}>
              <Text style={styles.tdeeValue}>{estimatedTDEE.toLocaleString('es-AR')}</Text>
              <Text style={styles.tdeeUnit}>kcal/día</Text>
            </View>
            <Text style={styles.tdeeHint}>
              💡 <Text style={{ fontFamily: FontFamily.semibold }}>Estimación del TDEE</Text> - calorías que tu cuerpo gasta en un día con tu actividad actual. Puede variar ±15% según tu metabolismo real.
            </Text>
            <Text style={[styles.tdeeHint, { marginTop: Spacing[1] }]}>
              ⚠️ Esta cifra es la base para calcular déficit (perder peso) o superávit (ganar músculo). La ajustaremos según tu progreso real en 2-4 semanas.
            </Text>
          </View>
        </Animated.View>
      )}
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
    gap: Spacing[1],
  },
  optionWrapper: {
    minHeight: 96,
  },
  tdeeCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.action,
    backgroundColor: withOpacity(Colors.action, 0.08),
    padding: Spacing[3],
    gap: Spacing[2],
  },
  tdeeLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tdeeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing[2],
  },
  tdeeValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.action,
    letterSpacing: -0.5,
  },
  tdeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[1.5],
  },
  tdeeUnit: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  tdeeHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
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
});
