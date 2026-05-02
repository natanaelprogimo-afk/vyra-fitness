import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useMental } from '@/hooks/useMental';
import { triggerImpactHaptic, triggerSelectionHaptic } from '@/lib/haptics';
import { captureError } from '@/lib/sentry';

interface CheckInState {
  mood: number;
  energy: number;
  stress: number;
  motivation: number;
}

const MOODS = [':(', ':/', ':|', ':)', ':D'];

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
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'MorningCheckIn.handleSave',
      });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>IA</Text>
        <View>
          <Text style={styles.title}>Check-in de hoy</Text>
          <Text style={styles.subtitle}>1 min - aporta al cierre del día</Text>
        </View>
      </View>

      <Text style={styles.dimensionLabel}>Como estás hoy?</Text>
      <View
        style={styles.moodRow}
        accessibilityRole="radiogroup"
        accessibilityLabel="Estado de animo de hoy"
      >
        {MOODS.map((emoji, index) => (
          <MoodButton
            key={emoji}
            emoji={emoji}
            index={index + 1}
            selected={values.mood === index + 1}
            onPress={() => setValues((prev) => ({ ...prev, mood: index + 1 }))}
          />
        ))}
      </View>

      <SliderRow
        label="Energía"
        value={values.energy}
        onChange={(nextValue) => setValues((prev) => ({ ...prev, energy: nextValue }))}
        lowLabel="Agotado"
        highLabel="Con pilas"
        color={Colors.fasting}
      />
      <SliderRow
        label="Estrés"
        value={values.stress}
        onChange={(nextValue) => setValues((prev) => ({ ...prev, stress: nextValue }))}
        lowLabel="Relajado"
        highLabel="Al limite"
        color={Colors.workout}
      />
      <SliderRow
        label="Motivacion"
        value={values.motivation}
        onChange={(nextValue) => setValues((prev) => ({ ...prev, motivation: nextValue }))}
        lowLabel="Ninguna"
        highLabel="Al máximo"
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
  index,
  selected,
  onPress,
}: {
  emoji: string;
  index: number;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12 }),
    );
    void triggerImpactHaptic('light');
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Estado de animo ${index} de 5`}
      accessibilityHint="Marca como te sientes hoy."
      hitSlop={10}
    >
      <Animated.Text style={[styles.moodEmoji, selected && styles.moodEmojiSelected, animatedStyle]}>
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
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
  color: string;
}) {
  const dots = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <View style={styles.sliderSection}>
      <View style={styles.sliderHeader}>
        <Text style={styles.dimensionLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color }]}>{value}/10</Text>
      </View>
      <View style={styles.dotsRow}>
        {dots.map((dot) => (
          <Pressable
            key={dot}
            onPress={() => {
              void triggerSelectionHaptic();
              onChange(dot);
            }}
            style={[styles.dot, { backgroundColor: dot <= value ? color : Colors.bgElevated }]}
            accessibilityRole="button"
            accessibilityState={{ selected: dot === value }}
            accessibilityLabel={`${label}: ${dot} de 10`}
            accessibilityHint={`Ajusta ${label.toLowerCase()} a ${dot} sobre 10.`}
            hitSlop={10}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  emoji: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.mental,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dimensionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  moodEmoji: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    opacity: 0.4,
    color: Colors.textPrimary,
  },
  moodEmojiSelected: {
    opacity: 1,
  },
  sliderSection: {
    marginBottom: Spacing[3],
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  sliderValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing[1],
  },
  sliderLabelText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textMuted,
  },
  cta: {
    marginTop: Spacing[4],
  },
});

export { MorningCheckIn };
