import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import {
  getBodyFatPresets,
  getNearestBodyFatValue,
  normalizeOnboardingGender,
  type OnboardingGender,
} from '@/lib/onboarding-profile';
import { getAccessibleOnboardingRoute } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

export default function StepCompositionScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [gender, setGender] = useState<OnboardingGender | null>(null);
  const [bodyFatValue, setBodyFatValue] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.composition,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.composition) {
        router.replace(nextRoute as never);
        return;
      }

      const nextGender = normalizeOnboardingGender(progress.data?.gender);
      if (!nextGender) {
        router.replace(Routes.auth.onboarding.age as never);
        return;
      }

      setDraft(progress.data ?? null);
      setGender(nextGender);
      setBodyFatValue(
        typeof progress.data?.body_fat_current_pct === 'number'
          ? getNearestBodyFatValue(nextGender, progress.data.body_fat_current_pct)
          : null,
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const presets = useMemo(() => (gender ? getBodyFatPresets(gender) : []), [gender]);

  const handleContinue = async () => {
    if (bodyFatValue === null || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      await saveOnboardingProgress(Routes.auth.onboarding.equipment, {
        ...(draft ?? {}),
        body_fat_current_pct: bodyFatValue,
      });

      processingRef.current = false;
      router.push(Routes.auth.onboarding.equipment as never);
    } catch (err) {
      console.error('[Step Composition] Failed to continue:', err);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.composition}
      eyebrow="Composición aproximada"
      title={<Text style={styles.title}>Elegí la referencia que más se parece a hoy.</Text>}
      subtitle="No hace falta que sea exacta. Solo queremos un arranque más realista que un número vacío."
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
          <Button
            onPress={handleContinue}
            disabled={bodyFatValue === null || isProcessing}
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
      <View style={styles.grid}>
        {presets.map((preset, index) => {
          const selected = bodyFatValue === preset.value;
          const isLastOdd = index === presets.length - 1 && presets.length % 2 === 1;

          return (
            <Pressable
              key={`${preset.rangeLabel}-${preset.value}`}
              onPress={() => setBodyFatValue(preset.value)}
              style={[
                styles.card,
                isLastOdd && styles.cardFull,
                selected && styles.cardActive,
              ]}
              accessibilityRole="radio"
              accessibilityLabel={`${preset.rangeLabel}, ${preset.title}`}
              accessibilityHint={preset.body}
              accessibilityState={{ selected }}
            >
              <Text style={styles.range}>{preset.rangeLabel}</Text>
              <Text style={styles.cardTitle}>{preset.title}</Text>
              <Text style={styles.cardBody}>{preset.body}</Text>
            </Pressable>
          );
        })}
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
    fontSize: 21,
    lineHeight: 25,
    color: Colors.textPrimary,
    letterSpacing: -0.45,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1.5],
  },
  card: {
    width: '48%',
    minHeight: 82,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[2.25],
    paddingVertical: Spacing[2],
    gap: 4,
  },
  cardFull: {
    width: '100%',
  },
  cardActive: {
    borderColor: withOpacity(Colors.secondary, 0.34),
    backgroundColor: withOpacity(Colors.secondary, 0.1),
  },
  range: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  cardBody: {
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
