import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OnboardingOptionCard from '@/components/onboarding/OnboardingOptionCard';
import Button from '@/components/ui/Button';
import DatePickerField from '@/components/ui/DatePickerField';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import {
  getAccessibleOnboardingRoute,
  getFirstIncompleteOnboardingRoute,
} from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';

function parseDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

type CycleLengthChoice = 'lt25' | '25_30' | '31_35' | 'variable' | 'unknown';

const CYCLE_LENGTH_OPTIONS: Array<{
  id: CycleLengthChoice;
  label: string;
  emoji: string;
  subtitle: string;
  length: number | null;
  fullWidth?: boolean;
}> = [
  {
    id: 'lt25',
    label: 'Menos de 25',
    emoji: '⚡',
    subtitle: 'Ciclos más cortos de lo normal.',
    length: 24,
  },
  {
    id: '25_30',
    label: '25-30 días',
    emoji: '🔄',
    subtitle: 'Rango más común.',
    length: 28,
  },
  {
    id: '31_35',
    label: '31-35 días',
    emoji: '🌙',
    subtitle: 'Ciclos un poco más largos.',
    length: 33,
  },
  {
    id: 'variable',
    label: 'Variable',
    emoji: '❓',
    subtitle: 'Lo ajustas más adelante.',
    length: null,
  },
  {
    id: 'unknown',
    label: 'No sé / Prefiero no decir',
    emoji: '✏️',
    subtitle: 'Lo completas después.',
    length: null,
    fullWidth: true,
  },
] as const;

function lengthToChoice(length: number | null | undefined): CycleLengthChoice {
  if (typeof length !== 'number' || !Number.isFinite(length)) return 'unknown';
  if (length < 25) return 'lt25';
  if (length <= 30) return '25_30';
  if (length <= 35) return '31_35';
  return 'variable';
}

export default function StepFemaleScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>(new Date());
  const [cycleChoice, setCycleChoice] = useState<CycleLengthChoice>('25_30');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.female,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.female) {
        router.replace(nextRoute as never);
        return;
      }

      setDraft(progress.data ?? null);
      setLastPeriodDate(parseDate(progress.data?.female_last_period_date));
      setCycleChoice(lengthToChoice(progress.data?.female_cycle_length));
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        female_health_enabled: true,
        female_onboarding_completed: true,
        female_cycle_length:
          CYCLE_LENGTH_OPTIONS.find((option) => option.id === cycleChoice)?.length ?? null,
        female_last_period_date: toIsoDate(lastPeriodDate),
      });

      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        female_health_enabled: true,
        female_onboarding_completed: true,
        female_cycle_length:
          CYCLE_LENGTH_OPTIONS.find((option) => option.id === cycleChoice)?.length ?? null,
        female_last_period_date: toIsoDate(lastPeriodDate),
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      console.error('[Step Female] Failed to continue:', err);
      setSaveError('No pudimos guardar tu selección. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.female}
      eyebrow="Seguimiento femenino"
      title={<Text style={styles.title}>Una pregunta rapida para empezar.</Text>}
      subtitle="Esta informacion es completamente privada y nunca se comparte."
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
      <DatePickerField
        label="Ultimo periodo"
        value={lastPeriodDate}
        onChange={setLastPeriodDate}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Duracion habitual</Text>
        <Text style={styles.sectionSubtitle}>Si no lo sabes, elegi No se / Prefiero no decir.</Text>
      </View>

      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Duracion habitual del ciclo">
        {CYCLE_LENGTH_OPTIONS.map((option) => {
          const selected = cycleChoice === option.id;

          return (
            <OnboardingOptionCard
              key={option.id}
              id={option.id}
              label={option.label}
              subtitle={option.subtitle}
              icon={option.emoji}
              isSelected={selected}
              onPress={() => setCycleChoice(option.id)}
              accentColor={Colors.female}
            />
          );
        })}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Privacidad</Text>
        <Text style={styles.noteBody}>
          Tus datos de ciclo son completamente privados y no salen de tu dispositivo sin tu permiso.
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
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '48%',
    minHeight: 92,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: withOpacity(Colors.surface2, 0.92),
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
    gap: Spacing[1],
  },
  cardFullWidth: {
    width: '100%',
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
  },
  emoji: {
    fontSize: 14,
  },
  selectedBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  selectedBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: 9,
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
