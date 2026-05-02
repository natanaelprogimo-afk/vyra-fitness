import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, getSuggestedStepGoal } from '@/lib/onboarding-v2';
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingDraft,
} from '@/lib/onboarding-storage';
import { useAuthStore } from '@/stores/authStore';
import { calculateWaterGoal } from '@/utils/calculations';

const GOAL_VISUALS: Partial<
  Record<NonNullable<OnboardingDraft['goal']>, { description: string; accent: string }>
> = {
  lose_fat: {
    description: 'Quemo grasa y construyo habitos sostenibles.',
    accent: Colors.action,
  },
  gain_muscle: {
    description: 'Subo fuerza y masa con progresion clara.',
    accent: Colors.workout,
  },
  general_health: {
    description: 'Quiero energia diaria, salud y constancia simple.',
    accent: Colors.steps,
  },
  sport_performance: {
    description: 'Recupero ritmo y vuelvo a entrenar seguido.',
    accent: Colors.nutrition,
  },
};

function getGoalVisual(goalId: NonNullable<OnboardingDraft['goal']>) {
  return (
    GOAL_VISUALS[goalId] ?? {
      description: 'Definimos un foco simple para empezar con claridad.',
      accent: Colors.action,
    }
  );
}

function sanitizeName(raw: string | null | undefined) {
  return raw?.trim() ?? '';
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function StepGoalsScreen() {
  const user = useAuthStore((state) => state.user);
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<NonNullable<OnboardingDraft['goal']> | ''>('');
  const [age, setAge] = useState('25');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [goalWeightKg, setGoalWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<0 | 1 | 2 | 3 | 4 | 5>(1);

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
      setAge(String(nextDraft?.age ?? 25));
      setHeightCm(String(nextDraft?.height_cm ?? 170));
      setWeightKg(String(nextDraft?.weight_start_kg ?? 70));
      setGoalWeightKg(nextDraft?.weight_goal_kg ? String(nextDraft.weight_goal_kg) : '');
      setActivityLevel((nextDraft?.activity_level as 0 | 1 | 2 | 3 | 4 | 5) ?? 1);
    })();

    return () => {
      active = false;
    };
  }, [user?.email, user?.user_metadata?.name]);

  const parsedAge = parsePositiveInt(age, 0);
  const parsedHeight = parsePositiveInt(heightCm, 0);
  const parsedWeight = parsePositiveInt(weightKg, 0);
  const parsedGoalWeight = goalWeightKg.trim() ? parsePositiveInt(goalWeightKg, 0) : null;
  const canContinue =
    name.trim().length >= 2 &&
    goal !== '' &&
    parsedAge >= 13 &&
    parsedHeight >= 120 &&
    parsedWeight >= 35;

  const handleContinue = async () => {
    if (!canContinue || !goal) return;

    await saveOnboardingProgress(Routes.auth.onboarding.equipment, {
      ...(draft ?? {}),
      name: name.trim(),
      goal,
      age: parsedAge,
      height_cm: parsedHeight,
      weight_start_kg: parsedWeight,
      weight_goal_kg: parsedGoalWeight && parsedGoalWeight >= 35 ? parsedGoalWeight : undefined,
      activity_level: activityLevel,
      water_goal_ml: draft?.water_goal_ml ?? calculateWaterGoal(parsedWeight),
      step_goal: draft?.step_goal ?? getSuggestedStepGoal(activityLevel),
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
          <Text style={styles.title}>Te dejamos bien calibrado desde el inicio.</Text>
        </View>
      }
      subtitle="Nombre, objetivo, peso, altura y actividad. Con eso la app deja de adivinar."
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
        <Text style={styles.sectionLabel}>Que quieres lograr</Text>
        <View
          style={styles.goalGrid}
          accessibilityRole="radiogroup"
          accessibilityLabel="Objetivo principal"
        >
          {GOAL_OPTIONS.map((item) => {
            const selected = item.id === goal;
            const visual = getGoalVisual(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => setGoal(item.id)}
                style={[styles.goalCard, selected && styles.goalCardActive]}
                accessibilityRole="radio"
                accessibilityLabel={item.label}
                accessibilityHint={visual.description}
                accessibilityState={{ selected }}
                hitSlop={8}
              >
                <View
                  style={[
                    styles.goalIconWrap,
                    { backgroundColor: withOpacity(visual.accent, 0.12) },
                  ]}
                >
                  <Text style={styles.goalEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.goalTitle}>{item.label}</Text>
                <Text style={styles.goalSubtitle}>{visual.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Input
            label="Edad"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="25"
          />
        </View>
        <View style={styles.metricItem}>
          <Input
            label="Altura"
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="numeric"
            unit="cm"
            placeholder="170"
          />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Input
            label="Peso actual"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="numeric"
            unit="kg"
            placeholder="70"
          />
        </View>
        <View style={styles.metricItem}>
          <Input
            label="Peso objetivo"
            value={goalWeightKg}
            onChangeText={setGoalWeightKg}
            keyboardType="numeric"
            unit="kg"
            placeholder="Opcional"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tu nivel de actividad real</Text>
        <View style={styles.activityStack}>
          {ACTIVITY_OPTIONS.map((option) => {
            const selected = option.id === activityLevel;
            return (
              <Pressable
                key={option.id}
                onPress={() => setActivityLevel(option.id)}
                style={[styles.activityCard, selected && styles.activityCardActive]}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityHint={option.subtitle}
                accessibilityState={{ selected }}
              >
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{option.label}</Text>
                  <Text style={styles.activitySubtitle}>{option.subtitle}</Text>
                </View>
                <View style={[styles.activityIndicator, selected && styles.activityIndicatorActive]} />
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
    minHeight: 162,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.bgElevated,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  goalCardActive: {
    borderColor: Colors.action,
    backgroundColor: withOpacity(Colors.action, 0.1),
  },
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  goalSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  metricItem: {
    flex: 1,
  },
  activityStack: {
    gap: Spacing[2],
  },
  activityCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.06),
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  activityCardActive: {
    borderColor: withOpacity(Colors.action, 0.4),
    backgroundColor: withOpacity(Colors.action, 0.1),
  },
  activityCopy: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  activitySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  activityIndicator: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
  },
  activityIndicatorActive: {
    borderColor: Colors.action,
    backgroundColor: Colors.action,
  },
});
