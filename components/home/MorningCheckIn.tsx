// ============================================================
// VYRA FITNESS — MorningCheckIn
// Card de check-in mental matutino con 4 dimensiones
// Se muestra hasta que el usuario hace el check-in del día
// ============================================================

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import { todayISO } from '@/utils/dates';
import { calculateMentalScore } from '@/utils/calculations';
import Button from '@/components/ui/Button';

interface CheckInState {
  mood:       number;  // 1-5
  energy:     number;  // 1-10
  stress:     number;  // 1-10
  motivation: number;  // 1-10
}

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

interface MorningCheckInProps {
  onComplete: () => void;
}

export default function MorningCheckIn({ onComplete }: MorningCheckInProps) {
  const userId    = useAuthStore((s) => s.profile?.id);
  const showToast = useUIStore((s) => s.showToast);

  const [values, setValues] = useState<CheckInState>({
    mood: 3, energy: 5, stress: 5, motivation: 5,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const score = calculateMentalScore(values.mood, values.energy, values.stress, values.motivation);

      const { error } = await supabase.from('mental_checkins').upsert({
        user_id:    userId,
        mood:       values.mood,
        energy:     values.energy,
        stress:     values.stress,
        motivation: values.motivation,
        check_date: todayISO(),
      }, { onConflict: 'user_id,check_date' });

      if (error) throw error;

      showToast(`Check-in guardado! Score mental: ${score}/100`, 'success');
      onComplete();
    } catch {
      showToast('No pude guardar el check-in. Intentá de nuevo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🧠</Text>
        <View>
          <Text style={styles.title}>Check-in de hoy</Text>
          <Text style={styles.subtitle}>1 min · contribuye al Daily Score</Text>
        </View>
      </View>

      {/* Mood */}
      <Text style={styles.dimensionLabel}>¿Cómo estás?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((emoji, i) => (
          <MoodButton
            key={i}
            emoji={emoji}
            selected={values.mood === i + 1}
            onPress={() => setValues(v => ({ ...v, mood: i + 1 }))}
          />
        ))}
      </View>

      {/* Sliders de 1-10 */}
      <SliderRow
        label="Energía"
        value={values.energy}
        onChange={(n) => setValues(v => ({ ...v, energy: n }))}
        lowLabel="Agotado"
        highLabel="Con pilas"
        color={Colors.fasting}
      />
      <SliderRow
        label="Estrés"
        value={values.stress}
        onChange={(n) => setValues(v => ({ ...v, stress: n }))}
        lowLabel="Relajado"
        highLabel="Al límite"
        color={Colors.workout}
        inverted
      />
      <SliderRow
        label="Motivación"
        value={values.motivation}
        onChange={(n) => setValues(v => ({ ...v, motivation: n }))}
        lowLabel="Ninguna"
        highLabel="Al máximo"
        color={Colors.brand}
      />

      <Button onPress={handleSave} variant="primary" fullWidth loading={saving} style={styles.cta}>
        Guardar check-in
      </Button>
    </View>
  );
}

function MoodButton({ emoji, selected, onPress }: { emoji: string; selected: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handle = () => {
    scale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 300 }),
      withSpring(1.0, { damping: 12 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable onPress={handle}>
      <Animated.Text style={[styles.moodEmoji, selected && styles.moodEmojiSelected, anim]}>
        {emoji}
      </Animated.Text>
    </Pressable>
  );
}

function SliderRow({ label, value, onChange, lowLabel, highLabel, color, inverted = false }:
  { label: string; value: number; onChange: (n: number) => void; lowLabel: string; highLabel: string; color: string; inverted?: boolean }) {
  const dots = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={styles.sliderSection}>
      <View style={styles.sliderHeader}>
        <Text style={styles.dimensionLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color }]}>{value}/10</Text>
      </View>
      <View style={styles.dotsRow}>
        {dots.map((d) => {
          const active = inverted ? d <= value : d <= value;
          return (
            <Pressable
              key={d}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); onChange(d); }}
              style={[styles.dot, { backgroundColor: active ? color : Colors.bgElevated }]}
            />
          );
        })}
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelText}>{lowLabel}</Text>
        <Text style={styles.sliderLabelText}>{highLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius:    Radius.xl,
    padding:         Spacing[4],
    borderWidth:     1,
    borderColor:     `${Colors.mental}44`,
  },
  header:      { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[4] },
  emoji:       { fontSize: 32 },
  title:       { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  subtitle:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  dimensionLabel:{ fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing[2] },
  moodRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[4] },
  moodEmoji:   { fontSize: 32, opacity: 0.4 },
  moodEmojiSelected:{ opacity: 1 },
  sliderSection:{ marginBottom: Spacing[3] },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2] },
  sliderValue:  { fontFamily: FontFamily.bold, fontSize: FontSize.base },
  dotsRow:      { flexDirection: 'row', gap: 6 },
  dot:          { flex: 1, height: 8, borderRadius: 4 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing[1] },
  sliderLabelText:{ fontFamily: FontFamily.regular, fontSize: 10, color: Colors.textMuted },
  cta:          { marginTop: Spacing[4] },
});

export { MorningCheckIn };