import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface UseAIOptions {
  onError?: (error: Error) => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export function buildSystemPrompt(profile: any) {
  const name = profile?.name ?? 'Usuario';
  const goal = profile?.primary_goal ?? profile?.goal ?? 'general_health';
  const waterGoal = profile?.water_goal_ml ?? 2000;
  const stepGoal = profile?.step_goal ?? 10000;
  const sleepGoal = profile?.sleep_goal_hours ?? 8;

  return [
    `Usuario: ${name}`,
    `Objetivo: ${goal}`,
    `Meta de agua: ${waterGoal}ml`,
    `Meta de pasos: ${stepGoal}`,
    `Meta de sueño: ${sleepGoal}h`,
    'Responder en español, de forma breve, práctica y segura.',
  ].join('\n');
}

export const useAI = (options?: UseAIOptions) => {
  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dailyMessagesLeft, setDailyMessagesLeft] = useState<number>(5);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

  const countUserMessages = useCallback((messages: unknown): number => {
    if (!Array.isArray(messages)) return 0;
    return messages.filter((entry) => {
      if (!entry || typeof entry !== 'object') return false;
      const role = (entry as any).role;
      const content = (entry as any).content;
      return role === 'user' && typeof content === 'string' && content.trim().length > 0;
    }).length;
  }, []);

  const refreshDailyLimit = useCallback(async () => {
    if (!profile?.id || profile?.is_premium) {
      setDailyMessagesLeft(999);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('ai_conversations')
      .select('messages_json')
      .eq('user_id', profile.id)
      .eq('session_date', today)
      .maybeSingle();

    const used = countUserMessages((data as any)?.messages_json);
    setDailyMessagesLeft(Math.max(0, 5 - used));
  }, [countUserMessages, profile?.id, profile?.is_premium]);

  useEffect(() => {
    void refreshDailyLimit();
  }, [refreshDailyLimit]);

  const sendMessage = useCallback(async (message: string) => {
    if (!session?.access_token) {
      const authError = new Error('No hay sesión activa.');
      setError(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);

    try {
      if (!profile?.is_premium && dailyMessagesLeft <= 0) {
        const limitError = new Error('Límite diario alcanzado');
        setError(limitError);
        throw limitError;
      }

      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message,
          conversationHistory: historyPayload,
          clientSystemPrompt: buildSystemPrompt(profile),
        }),
      });

      const payload = await response.json().catch(() => ({} as any));

      if (!response.ok) {
        if (response.status === 429) {
          setDailyMessagesLeft(0);
        }
        throw new Error(payload?.error ?? `AI Coach responded with ${response.status}`);
      }

      const reply = payload.reply ?? 'Mi cerebro IA está tomando un descanso 😅';

      setMessages((prev) => [
        ...prev,
        { role: 'user', content: message, createdAt: new Date().toISOString() },
        { role: 'assistant', content: reply, createdAt: new Date().toISOString() },
      ]);

      if (typeof payload.messagesLeft === 'number') {
        setDailyMessagesLeft(payload.messagesLeft);
      } else {
        await refreshDailyLimit();
      }

      return reply as string;
    } catch (err) {
      const castError = err instanceof Error ? err : new Error('Unknown error');
      setError(castError);
      options?.onError?.(castError);
      throw castError;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, dailyMessagesLeft, messages, options, profile, refreshDailyLimit, session?.access_token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isLoading = loading;

  return {
    sendMessage,
    loading,
    isLoading,
    error,
    clearError,
    messages,
    dailyMessagesLeft,
    buildSystemPrompt: () => buildSystemPrompt(profile),
    refreshDailyLimit,
  };
};

export default useAI;
