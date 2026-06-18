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

const STEP_GOAL_PRESETS = [
  {
    value: 5000,
    label: '5.000 pasos',
    emoji: '🚶',
    subtitle: 'Empezando o actividad baja',
  },
  {
    value: 8000,
    label: '8.000 pasos',
    emoji: '🏃',
    subtitle: 'Activo moderado',
  },
  {
    value: 10000,
    label: '10.000 pasos',
    emoji: '🚴',
    subtitle: 'Meta clásica de salud',
  },
  {
    value: 12000,
    label: '12.000+ pasos',
    emoji: '⚡',
    subtitle: 'Muy activo',
  },
] as const;

function formatStepCount(value: number) {
  return value.toLocaleString('es-UY');
}

export default function StepStepsScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [goal, setGoal] = useState(8000);
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
        Routes.auth.onboarding.steps,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.steps) {
        router.replace(nextRoute as never);
        return;
      }

      const savedGoal =
        typeof progress.data?.step_goal === 'number' && progress.data.step_goal >= 1000
          ? Math.round(progress.data.step_goal)
          : 8000;

      setDraft(progress.data ?? null);
      setGoal(savedGoal);
      setIsCustom(!STEP_GOAL_PRESETS.some((option) => option.value === savedGoal));
      setCustomGoal(
        !STEP_GOAL_PRESETS.some((option) => option.value === savedGoal) ? String(savedGoal) : '',
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
    customGoalNumber >= 1000 &&
    customGoalNumber <= 50000;
  const canContinue = isCustom ? isCustomGoalValid : goal >= 1000;

  const handlePresetSelect = (value: number) => {
    setGoal(value);
    setIsCustom(false);
  };

  const handleCustomChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setCustomGoal(sanitized);
    setIsCustom(true);

    const parsed = Number(sanitized);
    if (Number.isFinite(parsed) && parsed >= 1000 && parsed <= 50000) {
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
        step_goal: nextGoal,
      });

      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        step_goal: nextGoal,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Step Steps] Failed to continue:', err);
      setSaveError('No pudimos guardar tu meta. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.steps}
      eyebrow="Pasos"
      title={<Text style={styles.title}>Cuantos pasos diarios queres apuntar?</Text>}
      subtitle="Podes empezar con una meta sencilla y luego ajustarla."
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
          <Button onPress={handleContinue} disabled={!canContinue || isProcessing} fullWidth size="md" haptic="medium" loading={isProcessing}>
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.summaryPill}>
        <Text style={styles.summaryPillEmoji}>{!isCustom ? STEP_GOAL_PRESETS.find(p => p.value === goal)?.emoji : '✅'}</Text>
        <Text style={styles.summaryPillText}>{formatStepCount(goal)} pasos diarios</Text>
      </View>

      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Meta de pasos">
        {STEP_GOAL_PRESETS.map((option) => {
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
                accentColor={Colors.secondary}
              />
            </View>
          );
        })}
      </View>

      <View style={[styles.customCard, isCustom ? styles.customCardActive : null]}>
        <View style={styles.customHeader}>
          <View style={styles.customHeaderText}>
            <Text style={styles.customTitle}>Defino yo</Text>
            <Text style={styles.customSubtitle}>
              Escribi una meta exacta si queres salirte de los presets.
            </Text>
          </View>
          {isCustom ? (
            <View style={styles.okBadge}>
              <Text style={styles.okBadgeText}>OK</Text>
            </View>
          ) : null}
        </View>

        <Input
          label="Meta personalizada"
          value={isCustom ? customGoal : ''}
          onFocus={() => setIsCustom(true)}
          onChangeText={handleCustomChange}
          keyboardType="number-pad"
          placeholder="ej: 11.000"
          unit="pasos"
          size="compact"
          hint="Se guarda tal como la escribas."
        />
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Referencia</Text>
        <Text style={styles.noteBody}>8.000 pasos es una meta equilibrada para empezar.</Text>
        <Text style={styles.noteBodySecondary}>
          Podes sincronizar con tu smartwatch o registrar manualmente.
        </Text>
      </View>
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
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 7,
    backgroundColor: withOpacity(Colors.secondary, 0.12),
  },
  summaryPillEmoji: {
    fontSize: 14,
  },
  summaryPillText: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardWrapper: {
    width: '48%',
    minHeight: 96,
  },
  card: {
    width: '48%',
    minHeight: 96,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    gap: Spacing[1],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[1],
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.secondary, 0.14),
  },
  emoji: {
    fontSize: 14,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeActive: {
    backgroundColor: Colors.secondary,
  },
  badgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: 9,
    color: Colors.textMuted,
  },
  badgeTextActive: {
    color: Colors.base,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    lineHeight: 14,
    color: Colors.textPrimary,
  },
  cardBody: {
    fontFamily: FontFamily.regular,
    fontSize: 9.5,
    lineHeight: 13,
    color: Colors.textSecondary,
  },
  customCard: {
    gap: Spacing[2],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    padding: Spacing[3],
  },
  customCardActive: {
    borderColor: withOpacity(Colors.secondary, 0.42),
    backgroundColor: withOpacity(Colors.secondary, 0.08),
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[1],
  },
  customHeaderText: {
    flex: 1,
    gap: 2,
  },
  customTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  customSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textSecondary,
  },
  okBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: Colors.secondary,
  },
  okBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: 9,
    color: Colors.base,
  },
  noteBox: {
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface2,
    padding: Spacing[3],
  },
  noteTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  noteBody: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  noteBodySecondary: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
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
    fontSize: 12,
    lineHeight: 18,
    color: Colors.error,
  },
});
