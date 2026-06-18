import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import OnboardingHelper, { type HelperResult } from '@/components/onboarding/OnboardingHelper';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import {
  getAccessibleOnboardingRoute,
  getFirstIncompleteOnboardingRoute,
} from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';

const PATTERN_OPTIONS = [
  {
    id: 'sin_restricciones',
    label: 'Sin restricciones',
    subtitle: 'Base por defecto si no sigues un patron concreto.',
    emoji: '🥗',
  },
  {
    id: 'vegetariano',
    label: 'Vegetariano',
    subtitle: 'Sin carnes, con foco en fuentes vegetales.',
    emoji: '🥬',
  },
  {
    id: 'vegano',
    label: 'Vegano',
    subtitle: '100% vegetal, con ajustes de proteina y hierro.',
    emoji: '🌱',
  },
  {
    id: 'sin_gluten',
    label: 'Sin gluten',
    subtitle: 'Evita gluten en la seleccion diaria.',
    emoji: '🌾',
  },
  {
    id: 'keto_bajo_carbs',
    label: 'Keto / bajo en carbs',
    subtitle: 'Prioriza grasas y limita carbohidratos.',
    emoji: '🥑',
  },
  {
    id: 'otro',
    label: 'Otro',
    subtitle: 'Lo ajustas después desde Nutrición.',
    emoji: '✏️',
  },
] as const;

const CONTEXT_BY_PATTERN: Record<string, string> = {
  'sin_restricciones': '✓ Ajustaremos % proteína y carbohidratos según tu objetivo',
  'vegetariano': '✓ Priorizaremos legumbres, huevos y lácteos como fuentes de proteína',
  'vegano': '✓ Usaremos proteína vegetal con suplementación de B12 y hierro',
  'sin_gluten': '✓ Evitaremos trigo, cebada y centeno en las recomendaciones',
  'keto_bajo_carbs': '✓ Reducirémos carbohidratos a ~20-50g/día y aumentaremos grasas',
  'otro': '✓ Configúralo desde Nutrición después del onboarding',
};

export default function StepNutritionScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [pattern, setPattern] = useState<string>('sin_restricciones');
  const [helperVisible, setHelperVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.nutrition,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.nutrition) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setPattern(
        typeof progress.data?.nutrition_pattern === 'string' &&
          progress.data.nutrition_pattern.trim().length > 0
          ? progress.data.nutrition_pattern.trim()
          : 'sin_restricciones',
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const selectedOption = useMemo(
    () => PATTERN_OPTIONS.find((option) => option.id === pattern) ?? PATTERN_OPTIONS[0],
    [pattern],
  );

  const handleContinue = async () => {
    if (processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        nutrition_pattern: pattern,
      });

      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        nutrition_pattern: pattern,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Nutrition] Failed to continue:', err);
      setSaveError('No pudimos guardar tu patrón. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleHelperSelect = (result: HelperResult) => {
    if (result.mode === 'nutrition') {
      setPattern(result.recommendation);
      setHelperVisible(false);
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.nutrition}
      eyebrow="Nutrición"
      title="¿Seguís algún patrón alimentario?"
      subtitle="Esto ajusta las sugerencias y la base que te recomiendo."
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
          <Button onPress={handleContinue} fullWidth size="md" haptic="medium" loading={isProcessing} disabled={isProcessing}>
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.optionsContainer}>
        {PATTERN_OPTIONS.map((option) => {
          const selected = option.id === pattern;

          return (
            <View key={option.id} style={styles.optionWrapper}>
              <OnboardingOptionCard
                id={option.id}
                label={option.label}
                subtitle={option.subtitle}
                icon={option.emoji}
                isSelected={selected}
                onPress={() => setPattern(option.id)}
                accentColor={Colors.nutrition}
              />
            </View>
          );
        })}
      </View>

      {/* Current Selection */}
      <View style={styles.contextBox}>
        <Text style={styles.contextLabel}>{selectedOption.label}</Text>
        <Text style={styles.contextBody}>{CONTEXT_BY_PATTERN[pattern]}</Text>
      </View>

      {/* Helper button */}
      <Button
        onPress={() => setHelperVisible(true)}
        variant="secondary"
        fullWidth
        size="sm"
        haptic="light"
      >
        ¿Ayudame a elegir?
      </Button>

      <OnboardingHelper
        visible={helperVisible}
        mode="nutrition"
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
    paddingBottom: Spacing[2],
  },
  optionsContainer: {
    gap: Spacing[2],
  },
  optionWrapper: {
    width: '100%',
  },
  contextBox: {
    backgroundColor: 'rgba(130, 201, 30, 0.08)',
    borderRadius: 12,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: Colors.nutrition,
  },
  contextLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: Spacing[0.5],
  },
  contextBody: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
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
    fontSize: 12,
    lineHeight: 18,
    color: Colors.error,
  },
});
