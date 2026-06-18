import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/constants/theme';

export type HelperMode = 'goal' | 'nutrition';
export type HelperResult = {
  mode: HelperMode;
  recommendation: string;
};

interface OnboardingHelperProps {
  visible: boolean;
  mode: HelperMode;
  onClose: () => void;
  onSelect: (result: HelperResult) => void;
}

const GOAL_QUESTIONS = {
  q1: {
    title: '¿Cuál es tu prioridad principal?',
    options: [
      { id: 'physical', label: 'Cambio físico', icon: '💪' },
      { id: 'habit', label: 'Cambio de hábito', icon: '🔄' },
    ],
  },
  q1_physical: {
    title: '¿Qué cambio buscas?',
    options: [
      { id: 'lose_fat', label: 'Perder grasa', icon: '🔥', recommendation: 'lose_fat' },
      { id: 'gain_muscle', label: 'Ganar músculo', icon: '💪', recommendation: 'gain_muscle' },
      { id: 'improve_appearance', label: 'Mejorar apariencia', icon: '✨', recommendation: 'improve_appearance' },
    ],
  },
  q1_habit: {
    title: '¿Qué hábito quieres mejorar?',
    options: [
      { id: 'health', label: 'Salud general', icon: '🏥', recommendation: 'improve_health' },
      { id: 'eating', label: 'Comer mejor', icon: '🥗', recommendation: 'eat_better' },
      { id: 'recovery', label: 'Recuperación', icon: '🧱', recommendation: 'recover_habit' },
    ],
  },
};

const NUTRITION_QUESTIONS = {
  q1: {
    title: '¿Por qué tienes restricciones?',
    options: [
      { id: 'health', label: 'Por salud', icon: '🏥' },
      { id: 'preference', label: 'Por preferencia', icon: '🌱' },
    ],
  },
  q1_health: {
    title: '¿Cuál es tu restricción?',
    options: [
      { id: 'gluten_free', label: 'Sin gluten', icon: '🌾', recommendation: 'sin_gluten' },
      { id: 'keto', label: 'Keto/Bajo carb', icon: '🥑', recommendation: 'keto_bajo_carbs' },
    ],
  },
  q1_preference: {
    title: '¿Cuál es tu preferencia?',
    options: [
      { id: 'vegetarian', label: 'Vegetariano', icon: '🥬', recommendation: 'vegetariano' },
      { id: 'vegan', label: 'Vegano', icon: '🌱', recommendation: 'vegano' },
      { id: 'other', label: 'Otra', icon: '✏️', recommendation: 'otro' },
    ],
  },
};

export default function OnboardingHelper({ visible, mode, onClose, onSelect }: OnboardingHelperProps) {
  const [step, setStep] = useState<'q1' | 'q2'>('q1');
  const [q1Selection, setQ1Selection] = useState<string | null>(null);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setStep('q1');
      setQ1Selection(null);
      modalOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    } else {
      modalOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
    }
  }, [visible]);

  const questions = mode === 'goal' ? GOAL_QUESTIONS : NUTRITION_QUESTIONS;
  const q1Options = questions.q1.options;
  
  let q2Title = '';
  let q2Options: Array<{ id: string; label: string; icon: string; recommendation?: string }> = [];
  
  if (step === 'q2' && q1Selection) {
    if (mode === 'goal') {
      const goalQuestions = GOAL_QUESTIONS as typeof GOAL_QUESTIONS;
      if (q1Selection === 'physical' && 'q1_physical' in goalQuestions) {
        q2Title = goalQuestions.q1_physical.title;
        q2Options = goalQuestions.q1_physical.options;
      } else if (q1Selection === 'habit' && 'q1_habit' in goalQuestions) {
        q2Title = goalQuestions.q1_habit.title;
        q2Options = goalQuestions.q1_habit.options;
      }
    } else {
      const nutritionQuestions = NUTRITION_QUESTIONS as typeof NUTRITION_QUESTIONS;
      if (q1Selection === 'health' && 'q1_health' in nutritionQuestions) {
        q2Title = nutritionQuestions.q1_health.title;
        q2Options = nutritionQuestions.q1_health.options;
      } else if (q1Selection === 'preference' && 'q1_preference' in nutritionQuestions) {
        q2Title = nutritionQuestions.q1_preference.title;
        q2Options = nutritionQuestions.q1_preference.options;
      }
    }
  }

  const handleQ1Select = (id: string) => {
    setQ1Selection(id);
    setStep('q2');
  };

  const handleQ2Select = (recommendation: string) => {
    onSelect({ mode, recommendation });
    setStep('q1');
    setQ1Selection(null);
  };

  const backdropOpacity = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const modalScaleStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.backdrop, backdropOpacity]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      
      <Animated.View style={[styles.modalContainer, modalScaleStyle]}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              {step === 'q1' ? questions.q1.title : q2Title}
            </Text>

            <View style={styles.optionsGrid}>
              {(step === 'q1' ? q1Options : q2Options).map((option: any) => (
                <Pressable
                  key={option.id}
                  style={styles.optionCard}
                  onPress={() =>
                    step === 'q1'
                      ? handleQ1Select(option.id)
                      : handleQ2Select(option.recommendation || option.id)
                  }
                  android_ripple={{ color: withOpacity(Colors.secondary, 0.1) }}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>

            {step === 'q2' && (
              <Pressable style={styles.backButton} onPress={() => setStep('q1')}>
                <Text style={styles.backButtonText}>← Volver</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withOpacity(Colors.textPrimary, 0.5),
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  modal: {
    width: '85%',
    maxWidth: 360,
    borderRadius: Radius['2xl'],
    backgroundColor: Colors.surface1,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing[2],
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: withOpacity(Colors.textPrimary, 0.08),
  },
  closeIcon: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    gap: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  optionsGrid: {
    gap: Spacing[2],
    marginVertical: Spacing[2],
  },
  optionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.secondary, 0.24),
    backgroundColor: withOpacity(Colors.secondary, 0.08),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  optionIcon: {
    fontSize: 24,
  },
  optionLabel: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  backButton: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.textPrimary, 0.12),
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1.5],
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  backButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
