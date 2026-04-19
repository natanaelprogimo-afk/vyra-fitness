import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { EQUIPMENT_OPTIONS } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';

function stepGoalFromGoal(goal: OnboardingDraft['goal']) {
  switch (goal) {
    case 'lose_fat':
      return 7500;
    case 'gain_muscle':
      return 8000;
    case 'sport_performance':
      return 9000;
    default:
      return 6500;
  }
}

export default function StepEquipmentScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [equipment, setEquipment] = useState<string>('');

  useEffect(() => {
    let active = true;

    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      setDraft(progress.data ?? null);
      setEquipment(progress.data?.equipment ?? '');
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    if (!equipment) return;

    await saveOnboardingProgress(Routes.auth.onboarding.modules, {
      ...(draft ?? {}),
      equipment,
      step_goal: typeof draft?.step_goal === 'number' ? draft.step_goal : stepGoalFromGoal(draft?.goal),
      water_goal_ml: typeof draft?.water_goal_ml === 'number' ? draft.water_goal_ml : 2400,
    });

    router.push(Routes.auth.onboarding.modules as never);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.equipment}
      eyebrow="Paso 2 de 4"
      title={
        <View>
          <Text style={styles.title}>Donde entrenas?</Text>
        </View>
      }
      subtitle="Esto decide si tu primera rutina sale pensada para barras, material basico o solo peso corporal."
      footer={
        <Button onPress={handleContinue} disabled={!equipment} fullWidth size="lg" haptic="medium">
          Continuar
        </Button>
      }
    >
      <View style={styles.stack}>
        {EQUIPMENT_OPTIONS.map((option) => {
          const selected = option.id === equipment;
          return (
            <Pressable
              key={option.id}
              onPress={() => setEquipment(option.id)}
              style={[styles.option, selected && styles.optionActive]}
            >
              <View style={[styles.optionAccent, selected && styles.optionAccentActive]} />
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{option.label}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}
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
  stack: {
    gap: Spacing[3],
  },
  option: {
    minHeight: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
    overflow: 'hidden',
  },
  optionActive: {
    borderColor: Colors.actionBorder,
    backgroundColor: withOpacity(Colors.action, 0.1),
  },
  optionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'transparent',
  },
  optionAccentActive: {
    backgroundColor: Colors.action,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
