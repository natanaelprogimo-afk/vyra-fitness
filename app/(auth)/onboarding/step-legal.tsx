import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';
import { usePreAuthOnboardingStore } from '@/stores/preAuthOnboardingStore';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

export default function StepLegalScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [healthAccepted, setHealthAccepted] = useState(false);
  const [medicalAccepted, setMedicalAccepted] = useState(false);
  const { register, isLoading } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const pendingName = usePreAuthOnboardingStore((s) => s.name);
  const pendingEmail = usePreAuthOnboardingStore((s) => s.email);
  const pendingPassword = usePreAuthOnboardingStore((s) => s.password);
  const pendingReferralCode = usePreAuthOnboardingStore((s) => s.referralCode);
  const clearCredentials = usePreAuthOnboardingStore((s) => s.clearCredentials);

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      const data = progress.data ?? {};
      setDraft(data);
      setTermsAccepted(Boolean(data.terms_accepted));
      setHealthAccepted(Boolean(data.health_consent));
      setMedicalAccepted(Boolean(data.medical_disclaimer_accepted));
    })();
    return () => {
      active = false;
    };
  }, []);

  const canContinue = termsAccepted && healthAccepted && medicalAccepted;

  const handleContinue = async () => {
    if (!canContinue) {
      showToast('Necesitas activar los tres toggles para continuar.', 'warning');
      return;
    }

    const onboardingSeed: OnboardingDraft = {
      ...(draft ?? {}),
      terms_accepted: true,
      privacy_accepted: true,
      health_consent: true,
      medical_disclaimer_accepted: true,
    };

    await saveOnboardingProgress(Routes.auth.onboarding.finish, onboardingSeed);

    if (session && user) {
      router.replace(Routes.auth.onboarding.finish as any);
      return;
    }

    const resolvedName = pendingName || draft?.name || '';
    const resolvedEmail = pendingEmail || draft?.email || '';
    const resolvedPassword = pendingPassword || '';

    if (!resolvedName || !resolvedEmail || !resolvedPassword) {
      showToast('Volvé a cuenta y confirmá tu acceso para crearla.', 'warning');
      router.replace(Routes.auth.register as any);
      return;
    }

    const ok = await register(resolvedEmail, resolvedPassword, resolvedName, {
      referralCode: pendingReferralCode || draft?.referral_code || undefined,
      onboardingSeed,
      nextRoute: Routes.auth.onboarding.finish,
    });

    if (ok) clearCredentials();
  };

  const rows = [
    {
      key: 'terms',
      icon: 'sparkles-outline',
      title: 'Términos de servicio',
      body: 'Acepto las condiciones base de VYRA.',
      value: termsAccepted,
      onToggle: () => setTermsAccepted((current) => !current),
      color: Colors.brand,
    },
    {
      key: 'health',
      icon: 'medical-outline',
      title: 'Datos de salud',
      body: 'VYRA puede usar tu contexto para personalizar la experiencia.',
      value: healthAccepted,
      onToggle: () => setHealthAccepted((current) => !current),
      color: Colors.coach,
    },
    {
      key: 'medical',
      icon: 'alert-circle-outline',
      title: 'No reemplaza al médico',
      body: 'VYRA te guía, no diagnostica.',
      value: medicalAccepted,
      onToggle: () => setMedicalAccepted((current) => !current),
      color: Colors.warning,
    },
  ] as const;

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.legal}
      eyebrow="Casi listo"
      title={
        <View>
          <Text style={styles.title}>Confirma</Text>
          <Text style={styles.title}>y entra.</Text>
        </View>
      }
      subtitle="Como firmaríamos la entrada."
      footer={
        <>
          <Button
            variant={canContinue ? 'primary' : 'ghost'}
            fullWidth
            size="lg"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!canContinue}
            icon={<Ionicons name="arrow-forward" size={18} color={canContinue ? Colors.white : Colors.textMuted} />}
            iconRight
          >
            Crear mi cuenta
          </Button>
          <Text style={styles.helper}>Sin sorpresas · Cancelás cuando querás</Text>
        </>
      }
    >
      {rows.map((row) => (
        <Card key={row.key} style={styles.toggleCard} shadow={false}>
          <View style={styles.toggleRow}>
            <View style={[styles.iconWrap, { backgroundColor: withOpacity(row.color, 0.14), borderColor: withOpacity(row.color, 0.24) }]}>
              <Ionicons name={row.icon as any} size={18} color={row.color} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>{row.title}</Text>
              <Text style={styles.cardBody}>{row.body}</Text>
            </View>
            <Pressable onPress={row.onToggle} style={[styles.switchTrack, row.value && styles.switchTrackActive]}>
              <View style={[styles.switchKnob, row.value && styles.switchKnobActive]} />
            </Pressable>
          </View>
        </Card>
      ))}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 38,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  toggleCard: {
    backgroundColor: withOpacity(Colors.surface1, 0.96),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  cardBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.1),
    backgroundColor: withOpacity(Colors.white, 0.04),
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    borderColor: withOpacity(Colors.brand, 0.32),
    backgroundColor: withOpacity(Colors.brand, 0.34),
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  switchKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.brandLight,
  },
  helper: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
