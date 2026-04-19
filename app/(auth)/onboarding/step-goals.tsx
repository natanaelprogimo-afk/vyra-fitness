import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { GOAL_OPTIONS } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';
import { useAuthStore } from '@/stores/authStore';

function sanitizeName(raw: string | null | undefined) {
  return raw?.trim() ?? '';
}

export default function StepGoalsScreen() {
  const user = useAuthStore((state) => state.user);
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<NonNullable<OnboardingDraft['goal']> | ''>('');

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;

      const nextDraft = progress.data ?? null;
      const fallbackName =
        typeof user?.user_metadata?.name === 'string'
          ? user.user_metadata.name
          : typeof user?.email === 'string'
            ? user.email.split('@')[0] ?? ''
            : '';

      setDraft(nextDraft);
      setName(sanitizeName(nextDraft?.name) || sanitizeName(fallbackName));
      setGoal(nextDraft?.goal ?? '');
    })();

    return () => {
      active = false;
    };
  }, [user?.email, user?.user_metadata?.name]);

  const canContinue = name.trim().length >= 2 && goal !== '';

  const handleContinue = async () => {
    if (!canContinue || !goal) return;

    await saveOnboardingProgress(Routes.auth.onboarding.equipment, {
      ...(draft ?? {}),
      name: name.trim(),
      goal,
      context_display_name: name.trim(),
    });

    router.push(Routes.auth.onboarding.equipment as never);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.goals}
      eyebrow="Paso 1 de 4"
      title={
        <View>
          <Text style={styles.title}>Como te llamas?</Text>
        </View>
      }
      subtitle="Primero dejamos claro tu nombre y el objetivo principal."
      footer={
        <Button onPress={handleContinue} disabled={!canContinue} fullWidth size="lg" haptic="medium">
          Continuar
        </Button>
      }
    >
      <Input
        label="Tu nombre"
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        autoCapitalize="words"
        autoComplete="name"
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Que quieres lograr?</Text>
        <View style={styles.goalGrid}>
          {GOAL_OPTIONS.map((item) => {
            const selected = item.id === goal;
            return (
              <Pressable
                key={item.id}
                onPress={() => setGoal(item.id)}
                style={[styles.goalCard, selected && styles.goalCardActive]}
              >
                <Text style={styles.goalEmoji}>{item.emoji}</Text>
                <Text style={styles.goalTitle}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.textPrimary,
    letterSpacing: -1.5,
  },
  section: {
    gap: Spacing[3],
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  goalCard: {
    width: '47%',
    minHeight: 72,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  goalCardActive: {
    borderColor: Colors.action,
    backgroundColor: withOpacity(Colors.action, 0.1),
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
