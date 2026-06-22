// REDESIGNED: 2026-05-21 - name step feels more personal immediately
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { sanitizeName } from '@/lib/onboarding-profile';
import { getAccessibleOnboardingRoute, getFirstIncompleteOnboardingRoute } from '@/lib/onboarding-v2';
import { isGuestAuthUser, MANAGED_GUEST_NAME, normalizeManagedGuestName } from '@/lib/guest-auth';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';
import { useAuthStore } from '@/stores/authStore';

export default function StepNameScreen() {
  const user = useAuthStore((state) => state.user);
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextRoute = getAccessibleOnboardingRoute(
        Routes.auth.onboarding.name,
        progress.data ?? null,
      );
      if (nextRoute !== Routes.auth.onboarding.name) {
        router.replace(nextRoute as never);
        return;
      }

      const fallbackName =
        typeof user?.user_metadata?.name === 'string'
          ? user.user_metadata.name
          : typeof user?.email === 'string'
            ? user.email.split('@')[0] ?? ''
            : '';
      const guestFallback = isGuestAuthUser(user) ? MANAGED_GUEST_NAME : '';

      setDraft(progress.data ?? null);
      setName(sanitizeName(progress.data?.name) || sanitizeName(normalizeManagedGuestName(guestFallback || fallbackName)));
    })();

    return () => {
      active = false;
    };
  }, [user?.email, user?.user_metadata?.name]);

  const canContinue = name.trim().length >= 2;
  const previewName = name.trim() || 'vos';

  const handleContinue = async () => {
    if (!canContinue || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setSaveError(null);

    try {
      const trimmedName = name.trim();
      const nextRoute = getFirstIncompleteOnboardingRoute({
        ...(draft ?? {}),
        name: trimmedName,
        context_display_name: trimmedName,
      });
      await saveOnboardingProgress(nextRoute, {
        ...(draft ?? {}),
        name: trimmedName,
        context_display_name: trimmedName,
      });

      processingRef.current = false;
      router.push(nextRoute as never);
    } catch (err) {
      console.error('[Step Name] Failed to continue:', err);
      setSaveError('No pudimos guardar tu nombre. Verifica tu conexión e intenta de nuevo.');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.name}
      eyebrow="Nombre"
      title={<Text style={styles.title}>Como te llamamos?</Text>}
      subtitle="Lo usamos desde el inicio para que VYRA se sienta tuya."
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
          <Button onPress={handleContinue} disabled={!canContinue || isProcessing} fullWidth size="md" haptic="medium" loading={isProcessing}>
            Continuar
          </Button>
        </View>
      }
    >
      <Input
        label="Tu nombre"
        value={name}
        size="md"
        onChangeText={setName}
        placeholder="Tu nombre"
        autoFocus
        autoCapitalize="words"
        autoComplete="name"
      />

      <Card style={styles.previewCard} shadow={false}>
        <Text style={styles.previewEyebrow}>Asi se va a sentir</Text>
        <Text style={styles.previewTitle}>Hola, {previewName}</Text>
        <Text style={styles.previewBody}>En el siguiente paso ya te hablamos con este nombre.</Text>
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[3],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  previewCard: {
    borderColor: withOpacity(Colors.secondary, 0.18),
    backgroundColor: withOpacity(Colors.secondary, 0.08),
    gap: Spacing[1.5],
  },
  previewEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  previewTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    lineHeight: 30,
    color: Colors.textPrimary,
  },
  previewBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
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
