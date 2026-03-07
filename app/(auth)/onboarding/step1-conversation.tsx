import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { useAuthStore } from '@/stores/authStore';
import type { ActivityLevel, PrimaryGoal } from '@/types/user';

type ConversationStep = 'name' | 'goal' | 'activity' | 'weight' | 'complete';
type Bubble = { role: 'assistant' | 'user'; text: string; typing?: boolean };

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

const GOAL_OPTIONS: Array<{ id: PrimaryGoal; emoji: string; label: string }> = [
  { id: 'lose_fat', emoji: '🔥', label: 'Perder grasa' },
  { id: 'gain_muscle', emoji: '💪', label: 'Ganar musculo' },
  { id: 'general_health', emoji: '❤️', label: 'Mejorar salud' },
  { id: 'sport_performance', emoji: '🏆', label: 'Rendimiento' },
];

const ACTIVITY_OPTIONS: Array<{ id: ActivityLevel; label: string }> = [
  { id: 1, label: 'Baja (1-2 dias/semana)' },
  { id: 2, label: 'Media (3 dias/semana)' },
  { id: 3, label: 'Alta (4-5 dias/semana)' },
  { id: 4, label: 'Muy alta (6+ dias/semana)' },
];

function nextStep(step: ConversationStep): ConversationStep {
  if (step === 'name') return 'goal';
  if (step === 'goal') return 'activity';
  if (step === 'activity') return 'weight';
  if (step === 'weight') return 'complete';
  return 'complete';
}

function fallbackCoachMessage(step: ConversationStep, context: { name?: string }): string {
  if (step === 'name') return 'Como queres que te llame en Vyra?';
  if (step === 'goal') return `${context.name?.trim() || 'Genial'}, cual es tu objetivo principal?`;
  if (step === 'activity') return 'Perfecto. Cual es tu nivel de actividad actual?';
  if (step === 'weight') return 'Ultimo dato: cual es tu peso actual en kg?';
  return 'Listo. Con esto ya puedo personalizar tu arranque en Vyra.';
}

export default function Step1Conversation() {
  const profile = useAuthStore((state) => state.profile);

  const [step, setStep] = useState<ConversationStep>('name');
  const [name, setName] = useState((profile?.name ?? '').trim() || 'Usuario');
  const [goal, setGoal] = useState<PrimaryGoal>('lose_fat');
  const [activity, setActivity] = useState<ActivityLevel>(2);
  const [weight, setWeight] = useState('70');
  const [coachByStep, setCoachByStep] = useState<Partial<Record<ConversationStep, string>>>({});
  const [coachTyping, setCoachTyping] = useState(false);
  const requestRef = useRef(0);
  const parsedWeight = Number(weight);
  const safeName = name.trim() || 'Usuario';

  useEffect(() => {
    if (coachByStep[step]) return;

    const requestId = ++requestRef.current;
    const controller = new AbortController();

    const fetchCoach = async () => {
      setCoachTyping(true);
      const fallback = fallbackCoachMessage(step, { name: safeName });

      try {
        if (!BACKEND_URL) {
          setCoachByStep((prev) => ({ ...prev, [step]: fallback }));
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setCoachByStep((prev) => ({ ...prev, [step]: fallback }));
          return;
        }

        const activityLabel = ACTIVITY_OPTIONS.find((item) => item.id === activity)?.label ?? String(activity);
        const response = await fetch(`${BACKEND_URL}/api/ai/onboarding-coach`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            step,
            context: {
              name: safeName,
              goal,
              activity: activityLabel,
              weight: weight.trim(),
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          setCoachByStep((prev) => ({ ...prev, [step]: fallback }));
          return;
        }

        const payload = await response.json().catch(() => ({} as any));
        const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
        setCoachByStep((prev) => ({
          ...prev,
          [step]: message || fallback,
        }));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          captureError(error instanceof Error ? error : new Error(String(error)), {
            action: 'onboarding.conversation.fetchCoachPrompt',
            step,
          });
          setCoachByStep((prev) => ({ ...prev, [step]: fallback }));
        }
      } finally {
        if (requestRef.current === requestId) {
          setCoachTyping(false);
        }
      }
    };

    void fetchCoach();

    return () => {
      controller.abort();
    };
  }, [activity, coachByStep, goal, safeName, step, weight]);

  const bubbles = useMemo(() => {
    const items: Bubble[] = [
      { role: 'assistant', text: 'Hola, soy tu Coach en Vyra. Te hago 4 preguntas y arrancamos.' },
      { role: 'assistant', text: coachByStep.name ?? fallbackCoachMessage('name', { name: safeName }) },
    ];

    if (name.trim().length > 0 && step !== 'name') {
      items.push({ role: 'user', text: name.trim() });
      items.push({
        role: 'assistant',
        text: coachByStep.goal ?? fallbackCoachMessage('goal', { name: safeName }),
      });
    }

    if (step === 'activity' || step === 'weight' || step === 'complete') {
      const selectedGoal = GOAL_OPTIONS.find((item) => item.id === goal);
      if (selectedGoal) {
        items.push({ role: 'user', text: `${selectedGoal.emoji} ${selectedGoal.label}` });
      }
      items.push({
        role: 'assistant',
        text: coachByStep.activity ?? fallbackCoachMessage('activity', { name: safeName }),
      });
    }

    if (step === 'weight' || step === 'complete') {
      const selectedActivity = ACTIVITY_OPTIONS.find((item) => item.id === activity);
      if (selectedActivity) {
        items.push({ role: 'user', text: selectedActivity.label });
      }
      items.push({
        role: 'assistant',
        text: coachByStep.weight ?? fallbackCoachMessage('weight', { name: safeName }),
      });
    }

    if (step === 'complete') {
      items.push({ role: 'user', text: `${weight} kg` });
      items.push({
        role: 'assistant',
        text: coachByStep.complete ?? fallbackCoachMessage('complete', { name: safeName }),
      });
    }

    if (coachTyping) {
      items.push({ role: 'assistant', text: 'Escribiendo...', typing: true });
    }

    return items;
  }, [activity, coachByStep, coachTyping, goal, name, safeName, step, weight]);

  const goNext = () => setStep((prev) => nextStep(prev));

  const continueToFinal = () => {
    const safeWeight = Number.isFinite(parsedWeight) && parsedWeight > 30 ? parsedWeight : 70;

    router.push({
      pathname: '/(auth)/onboarding/step3-activity',
      params: {
        name: safeName,
        goal,
        activity: String(activity),
        weight: String(safeWeight),
        source: 'conversation',
      },
    } as any);
  };

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Onboarding conversacional</Text>
        <Text style={styles.subtitle}>Rapido, humano y personalizado en menos de 1 minuto.</Text>

        <View style={styles.chat}>
          {bubbles.map((bubble, index) => (
            <View
              key={`${bubble.role}_${index}`}
              style={[
                styles.bubble,
                bubble.role === 'assistant' ? styles.bubbleAssistant : styles.bubbleUser,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  bubble.role === 'assistant' ? styles.bubbleTextAssistant : styles.bubbleTextUser,
                  bubble.typing ? styles.typingText : null,
                ]}
              >
                {bubble.text}
              </Text>
            </View>
          ))}
        </View>

        {step === 'name' && (
          <View style={styles.inputBlock}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              maxLength={32}
            />
            <Button variant="primary" fullWidth onPress={goNext} disabled={name.trim().length < 2}>
              Continuar
            </Button>
          </View>
        )}

        {step === 'goal' && (
          <View style={styles.inputBlock}>
            <View style={styles.optionsGrid}>
              {GOAL_OPTIONS.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setGoal(item.id)}
                  style={[styles.optionChip, goal === item.id && styles.optionChipActive]}
                >
                  <Text style={styles.optionEmoji}>{item.emoji}</Text>
                  <Text style={[styles.optionText, goal === item.id && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button variant="primary" fullWidth onPress={goNext}>
              Continuar
            </Button>
          </View>
        )}

        {step === 'activity' && (
          <View style={styles.inputBlock}>
            <View style={styles.optionsStack}>
              {ACTIVITY_OPTIONS.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setActivity(item.id)}
                  style={[styles.optionRow, activity === item.id && styles.optionRowActive]}
                >
                  <Text style={[styles.optionRowText, activity === item.id && styles.optionRowTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button variant="primary" fullWidth onPress={goNext}>
              Continuar
            </Button>
          </View>
        )}

        {step === 'weight' && (
          <View style={styles.inputBlock}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="Ej: 70"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button
              variant="primary"
              fullWidth
              onPress={goNext}
              disabled={!Number.isFinite(parsedWeight) || parsedWeight < 30 || parsedWeight > 300}
            >
              Continuar
            </Button>
          </View>
        )}

        {step === 'complete' && (
          <View style={styles.inputBlock}>
            <Button variant="primary" fullWidth onPress={continueToFinal}>
              Ir al ajuste final
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onPress={() => router.push('/(auth)/onboarding/step1-goals' as any)}
            >
              Cambiar a modo clasico
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  chat: {
    gap: Spacing[2],
  },
  bubble: {
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    maxWidth: '90%',
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: `${Colors.brand}22`,
    borderWidth: 1,
    borderColor: `${Colors.brand}55`,
  },
  bubbleText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 19,
  },
  bubbleTextAssistant: {
    color: Colors.textPrimary,
  },
  bubbleTextUser: {
    color: Colors.brand,
  },
  typingText: {
    opacity: 0.72,
    fontFamily: FontFamily.regular,
  },
  inputBlock: {
    gap: Spacing[3],
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    color: Colors.textPrimary,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  optionChip: {
    width: '48%',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2],
    alignItems: 'center',
    gap: Spacing[1],
  },
  optionChipActive: {
    borderColor: Colors.brand,
    backgroundColor: `${Colors.brand}15`,
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  optionTextActive: {
    color: Colors.brand,
  },
  optionsStack: {
    gap: Spacing[2],
  },
  optionRow: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    paddingVertical: Spacing[2.5],
    paddingHorizontal: Spacing[3],
  },
  optionRowActive: {
    borderColor: Colors.brand,
    backgroundColor: `${Colors.brand}15`,
  },
  optionRowText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  optionRowTextActive: {
    color: Colors.brand,
    fontFamily: FontFamily.semibold,
  },
});
