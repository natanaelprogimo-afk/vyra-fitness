import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import {
  getAccessibleOnboardingRoute,
  getFirstIncompleteOnboardingRoute,
} from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';

const FASTING_OPTIONS = [
  { id: '16:8', label: '16:8', emoji: '⏱️', subtitle: 'Ayunas 16h, comes en 8h. El más popular.' },
  { id: '18:6', label: '18:6', emoji: '⏰', subtitle: 'Ayunas 18h, comes en 6h.' },
  { id: '20:4', label: '20:4', emoji: '🔔', subtitle: 'Más apretado, para usuarios con experiencia.' },
  { id: '5:2', label: '5:2', emoji: '📅', subtitle: '5 días normal, 2 días con restricción calórica.' },
  { id: 'custom', label: 'Personalizado', emoji: '✏️', subtitle: 'Tu ventana exacta, a tu ritmo.' },
] as const;

export default function StepFastingScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [protocol, setProtocol] = useState<string>('16:8');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.fasting,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.fasting) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setProtocol(
        typeof progress.data?.fasting_protocol === 'string' &&
          progress.data.fasting_protocol.trim().length > 0
          ? progress.data.fasting_protocol.trim()
          : '16:8',
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const selectedOption = useMemo(
    () => FASTING_OPTIONS.find((option) => option.id === protocol) ?? FASTING_OPTIONS[0],
    [protocol],
  );

  const handleContinue = async () => {
    if (processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        fasting_protocol: protocol,
      });

      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        fasting_protocol: protocol,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      console.error('[Step Fasting] Failed to continue:', err);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.fasting}
      eyebrow="Ayuno"
      title={<Text style={styles.title}>Que ventana de ayuno queres usar de base?</Text>}
      subtitle="Podras cambiarla mas adelante desde el modulo de Ayuno."
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
          <Button onPress={handleContinue} disabled={isProcessing} fullWidth size="md" haptic="medium" loading={isProcessing}>
            Continuar
          </Button>
        </View>
      }
    >
      <View style={styles.stack} accessibilityRole="radiogroup" accessibilityLabel="Protocolo de ayuno">
        {FASTING_OPTIONS.map((option) => {
          const active = option.id === protocol;
          return (
            <OnboardingOptionCard
              key={option.id}
              id={option.id}
              label={option.label}
              subtitle={option.subtitle}
              icon={option.emoji}
              isSelected={active}
              onPress={() => setProtocol(option.id)}
              accentColor={Colors.fasting}
            />
          );
        })}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Seleccion actual</Text>
        <Text style={styles.noteBody}>{selectedOption.label}</Text>
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
  stack: {
    gap: Spacing[1.25],
  },
  card: {
    minHeight: 64,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[2.75],
    paddingVertical: Spacing[1.75],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2.5],
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  cardBody: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.white, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.fasting,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.fasting,
  },
  noteBox: {
    gap: 4,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
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
