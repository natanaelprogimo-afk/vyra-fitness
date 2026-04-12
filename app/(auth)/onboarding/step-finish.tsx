import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { clearOnboardingProgress, loadOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

export default function StepFinishScreen() {
  const { saveOnboarding, isLoading } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      setDraft(progress.data ?? null);
    })();
    return () => {
      active = false;
    };
  }, []);

  const onboardingData = useMemo(() => {
    const data = draft ?? {};
    const activeModules = Array.isArray(data.active_modules) ? data.active_modules.filter(Boolean) : ['water', 'steps', 'sleep'];

    return {
      name: data.name?.trim() || 'Usuario',
      age: typeof data.age === 'number' ? data.age : 25,
      goal: (data.goal as any) ?? 'general_health',
      gender: (data.gender as any) ?? 'prefer_not_to_say',
      avatar_url: data.avatar_url ?? null,
      height_cm: typeof data.height_cm === 'number' ? data.height_cm : 170,
      weight_start_kg: typeof data.weight_start_kg === 'number' ? data.weight_start_kg : 70,
      weight_goal_kg: typeof data.weight_goal_kg === 'number' ? data.weight_goal_kg : undefined,
      weight_goal_date: data.weight_goal_date ?? null,
      activity_level: (typeof data.activity_level === 'number' ? data.activity_level : 2) as any,
      water_goal_ml: typeof data.water_goal_ml === 'number' ? data.water_goal_ml : 2400,
      step_goal: typeof data.step_goal === 'number' ? data.step_goal : 10000,
      sleep_goal_hours: 8,
      equipment: null as any,
      active_modules: activeModules,
      female_health_enabled: Boolean(data.female_health_enabled),
      wake_time_minutes: 420,
      sleep_time_minutes: 1380,
      fasting_protocol: null,
      terms_accepted: Boolean(data.terms_accepted),
      privacy_accepted: Boolean(data.privacy_accepted),
      health_consent: Boolean(data.health_consent),
      medical_disclaimer_accepted: Boolean(data.medical_disclaimer_accepted),
      notifications_permission: data.notifications_permission === 'granted' ? 'granted' : 'denied',
      activity_permission: data.activity_permission === 'granted' ? 'granted' : 'denied',
      health_connect_enabled: Boolean(data.health_connect_enabled),
      health_connect_status: data.health_connect_status ?? null,
      referral_code: data.referral_code ?? null,
    };
  }, [draft]);

  const summaryRows = [
    { label: 'Tu score inicial', value: '82 pts' },
    { label: 'Modulos activos', value: `${onboardingData.active_modules?.length ?? 0} listos` },
    { label: 'Meta de pasos', value: `${onboardingData.step_goal.toLocaleString('es-UY')} / dia` },
  ];

  const handleEnter = async () => {
    const ok = await saveOnboarding(onboardingData as any);
    if (!ok) return;
    await clearOnboardingProgress();
    router.replace(Routes.tabs.home as any);
  };

  return (
    <SafeScreen padBottom contentStyle={styles.content}>
      <View style={styles.heroCircle}>
        <Ionicons name="checkmark" size={44} color={Colors.brandLight} />
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Día 1 listo</Text>
        <Text style={styles.title}>Ya podés{`\n`}entrar.</Text>
        <Text style={styles.subtitle}>Tu espacio está calibrado y listo.</Text>
      </View>

      <Card style={styles.summaryCard} shadow={false}>
        <Text style={styles.summaryEyebrow}>Lo que te espera</Text>
        {summaryRows.map((row) => (
          <View key={row.label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{row.label}</Text>
            <Text style={styles.summaryValue}>{row.value}</Text>
          </View>
        ))}
      </Card>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        onPress={handleEnter}
        loading={isLoading}
        icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
        iconRight
      >
        Entrar a mi día
      </Button>

      <Text style={styles.note}>Podés ajustar todo después desde Ajustes.</Text>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing[5],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[8],
  },
  heroCircle: {
    width: 108,
    height: 108,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.42),
    backgroundColor: withOpacity(Colors.brand, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    color: Colors.brandLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 40,
    color: Colors.textPrimary,
    letterSpacing: -1.3,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  summaryCard: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface1, 0.96),
  },
  summaryEyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  summaryLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.brandLight,
  },
  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
