import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { GOAL_OPTIONS } from '@/lib/onboarding-v2';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';
import { router } from 'expo-router';

export default function StepGoalsScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      setDraft(progress.data ?? null);
      if (progress.data?.goal) setSelected(progress.data.goal);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSelect = async (goal: string) => {
    setSelected(goal);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await saveOnboardingProgress(Routes.auth.onboarding.base, {
      ...(draft ?? {}),
      goal: goal as any,
    });
    setTimeout(() => {
      router.push(Routes.auth.onboarding.base as any);
    }, 90);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.goals}
      eyebrow="Tu dirección"
      title={
        <View>
          <Text style={styles.title}>¿Qué querés</Text>
          <Text style={styles.title}>lograr?</Text>
        </View>
      }
      subtitle="Elegí una meta. Afinamos después."
      footer={<Text style={styles.helper}>Elegí una para continuar.</Text>}
    >
      {GOAL_OPTIONS.map((goal) => {
        const active = selected === goal.id;
        return (
          <Card
            key={goal.id}
            onPress={() => handleSelect(goal.id)}
            accentColor={active ? goal.color : undefined}
            style={[
              styles.option,
              active && {
                borderColor: withOpacity(goal.color, 0.6),
                backgroundColor: withOpacity(goal.color, 0.14),
              },
            ]}
            shadow={false}
          >
            <View style={styles.optionRow}>
              <View style={[styles.iconWrap, { backgroundColor: withOpacity(goal.color, 0.14), borderColor: withOpacity(goal.color, 0.22) }]}>
                <Ionicons name={goal.icon as any} size={18} color={goal.color} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.optionTitle}>{goal.label}</Text>
                <Text style={styles.optionSubtitle}>{goal.subtitle}</Text>
              </View>
              <View style={[styles.radio, active && { borderColor: goal.color }]}>
                {active ? <View style={[styles.radioDot, { backgroundColor: goal.color }]} /> : null}
              </View>
            </View>
          </Card>
        );
      })}
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
  option: {
    padding: Spacing[4],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  helper: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
