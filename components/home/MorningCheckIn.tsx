import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useMental } from '@/hooks/useMental';

interface CheckInState {
  mood: number;
  energy: number;
  stress: number;
  motivation: number;
}

const MOODS = ['ðŸ˜ž', 'ðŸ˜•', 'ðŸ˜', 'ðŸ™‚', 'ðŸ˜„'];

interface MorningCheckInProps {
  onComplete: () => void;
}

export default function MorningCheckIn({ onComplete }: MorningCheckInProps) {
  const { saveCheckinAsync, isSaving } = useMental();
  const [values, setValues] = useState<CheckInState>({
    mood: 3,
    energy: 5,
    stress: 5,
    motivation: 5,
  });

  const handleSave = async () => {
    try {
      await saveCheckinAsync(values);
      onComplete();
    } catch {}
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>ðŸ§ </Text>
        <View>
          <Text style={styles.title}>Check-in de hoy</Text>
          <Text style={styles.subtitle}>1 min - aporta al cierre del dia</Text>
        </View>
      </View>

      <Text style={styles.dimensionLabel}>Como estas hoy?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((emoji, i) => (
          <MoodButton
            key={emoji}
            emoji={emoji}
            selected={values.mood === i + 1}
            onPress={() => setValues((prev) => ({ ...prev, mood: i + 1 }))}
          />
        ))}
      </View>

      <SliderRow
        label="Energia"
        value={values.energy}
        onChange={(n) => setValues((prev) => ({ ...prev, energy: n }))}
        lowLabel="Agotado"
        highLabel="Con pilas"
        color={Colors.fasting}
      />
      <SliderRow
        label="Estres"
        value={values.stress}
        onChange={(n) => setValues((prev) => ({ ...prev, stress: n }))}
        lowLabel="Relajado"
        highLabel="Al limite"
        color={Colors.workout}
      />
      <SliderRow
        label="Motivacion"
        value={values.motivation}
        onChange={(n) => setValues((prev) => ({ ...prev, motivation: n }))}
        lowLabel="Ninguna"
        highLabel="Al maximo"
        color={Colors.brand}
      />

      <Button onPress={handleSave} variant="primary" fullWidth loading={isSaving} style={styles.cta}>
        Guardar check-in
      </Button>
    </View>
  );
}

function MoodButton({
  emoji,
  selected,
  onPress,
}: {
  emoji: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handle = () => {
    scale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 300 }),
      withSpring(1.0, { damping: 12 }),
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

function SliderRow({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
  color,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  lowLabel: string;
  highLabel: string;
  color: string;
}) {
  const dots = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={styles.sliderSection}>
      <View style={styles.sliderHeader}>
        <Text style={styles.dimensionLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color }]}>{value}/10</Text>
      </View>
      <View style={styles.dotsRow}>
        {dots.map((d) => (
          <Pressable
            key={d}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(d);
            }}
            style={[styles.dot, { backgroundColor: d <= value ? color : Colors.bgElevated }]}
          />
        ))}
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
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: `${Colors.mental}44`,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[4] },
  emoji: { fontSize: 32 },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  subtitle: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  dimensionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[4] },
  moodEmoji: { fontSize: 32, opacity: 0.4 },
  moodEmojiSelected: { opacity: 1 },
  sliderSection: { marginBottom: Spacing[3] },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2] },
  sliderValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 8, borderRadius: 4 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing[1] },
  sliderLabelText: { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.textMuted },
  cta: { marginTop: Spacing[4] },
});

export { MorningCheckIn };
