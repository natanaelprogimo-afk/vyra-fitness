// ============================================================
// VYRA FITNESS — Onboarding Step 1: Objetivo principal
// ============================================================

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { OnboardingStrings } from '@/constants/strings';
import type { PrimaryGoal } from '@/types/user';

const GOALS: { id: PrimaryGoal; emoji: string; label: string; desc: string; color: string }[] = [
  { id: 'lose_fat',          emoji: '🔥', label: 'Perder grasa',         desc: 'Déficit calórico inteligente',     color: Colors.workout    },
  { id: 'gain_muscle',       emoji: '💪', label: 'Ganar músculo',         desc: 'Volumen + proteína optimizada',    color: Colors.brand      },
  { id: 'general_health',    emoji: '❤️', label: 'Salud general',         desc: 'Balance entre todos los pilares', color: Colors.steps      },
  { id: 'sport_performance', emoji: '🏆', label: 'Rendimiento deportivo', desc: 'Performance + recuperación',      color: Colors.fasting    },
  { id: 'mental_wellbeing',  emoji: '🧠', label: 'Bienestar mental',      desc: 'Estrés, sueño y ánimo',          color: Colors.mental     },
];

export default function Step1Goals() {
  const [selected, setSelected] = useState<PrimaryGoal | null>(null);

  const handleSelect = (id: PrimaryGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelected(id);
  };

  const handleNext = () => {
    if (!selected) return;
    // Guardar en un context/store temporal de onboarding
    // Por ahora usamos params de navegación (en F4 completo se centraliza)
    router.push({ pathname: '/(auth)/onboarding/step2-body', params: { goal: selected } } as any);
  };

  return (
    <SafeScreen scrollable>
      {/* Progress */}
      <OnboardingProgress step={1} total={4} />

      <Text style={styles.title}>{OnboardingStrings.step1.title}</Text>
      <Text style={styles.subtitle}>{OnboardingStrings.step1.subtitle}</Text>

      <View style={styles.goals}>
        {GOALS.map((g) => (
          <GoalCard
            key={g.id}
            {...g}
            selected={selected === g.id}
            onPress={() => handleSelect(g.id)}
          />
        ))}
      </View>

      <Button
        onPress={handleNext}
        variant="primary"
        fullWidth
        size="lg"
        disabled={!selected}
        style={styles.cta}
      >
        {OnboardingStrings.next} →
      </Button>
    </SafeScreen>
  );
}

function GoalCard({ id, emoji, label, desc, color, selected, onPress }:
  { id: string; emoji: string; label: string; desc: string; color: string; selected: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => { scale.value = withSpring(0.97, {}, () => { scale.value = withSpring(1); }); onPress(); }}
    >
      <Animated.View style={[
        styles.goalCard,
        selected && { borderColor: color, backgroundColor: `${color}12` },
        anim,
      ]}>
        <Text style={styles.goalEmoji}>{emoji}</Text>
        <View style={styles.goalText}>
          <Text style={[styles.goalLabel, selected && { color }]}>{label}</Text>
          <Text style={styles.goalDesc}>{desc}</Text>
        </View>
        <View style={[styles.goalRadio, selected && { borderColor: color, backgroundColor: color }]}>
          {selected && <Text style={styles.goalCheck}>✓</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function OnboardingProgress({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>{OnboardingStrings.step} {step} {OnboardingStrings.of} {total}</Text>
      <View style={styles.progressBar}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i < step && styles.progressDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title:        { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginTop: Spacing[6], marginBottom: Spacing[2] },
  subtitle:     { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: FontSize.base * 1.5, marginBottom: Spacing[6] },
  goals:        { gap: Spacing[3], marginBottom: Spacing[6] },
  goalCard: {
    flexDirection:   'row', alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius.xl, padding: Spacing[4],
    borderWidth:     1.5, borderColor: Colors.border,
    gap:             Spacing[3],
  },
  goalEmoji:  { fontSize: 28 },
  goalText:   { flex: 1 },
  goalLabel:  { fontFamily: FontFamily.semibold, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: 2 },
  goalDesc:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textMuted },
  goalRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  goalCheck:  { color: Colors.white, fontSize: 12, fontFamily: FontFamily.bold },
  cta:        { marginBottom: Spacing[6] },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing[4] },
  progressText:      { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.textMuted },
  progressBar:       { flexDirection: 'row', gap: 6 },
  progressDot:       { width: 24, height: 4, borderRadius: 2, backgroundColor: Colors.bgElevated },
  progressDotActive: { backgroundColor: Colors.brand },
});
