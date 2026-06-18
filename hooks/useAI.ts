import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { ComponentMessages } from '@/constants/strings';
import type { UserProfile } from '@/types/user';

export interface UseAIOptions {
  onError?: (error: Error) => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AiConversationRow {
  messages_json?: unknown;
}

interface ContextChatResponse {
  reply?: string;
  messagesLeft?: number;
  error?: string;
}

const DAILY_CONTEXT_LIMIT = 2;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

export function buildSystemPrompt(profile: UserProfile | null | undefined) {
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
    ComponentMessages.systemPrompt,
    'Politica IA: responde en maximo 2 frases, con una accion concreta y sin motivacion generica. Si faltan datos, dilo y pide el registro minimo.',
  ].join('\n');
}

export const useAI = (options?: UseAIOptions) => {
  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dailyMessagesLeft, setDailyMessagesLeft] = useState<number>(DAILY_CONTEXT_LIMIT);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

  const countUserMessages = useCallback((conversation: unknown): number => {
    if (!Array.isArray(conversation)) return 0;
    return conversation.filter((entry) => {
      const record = asRecord(entry);
      if (!record) return false;
      const role = record.role;
      const content = record.content;
      return role === 'user' && typeof content === 'string' && content.trim().length > 0;
    }).length;
  }, []);

  const refreshDailyLimit = useCallback(async () => {
    if (!profile?.id) {
      setDailyMessagesLeft(DAILY_CONTEXT_LIMIT);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('ai_conversations')
      .select('messages_json')
      .eq('user_id', profile.id)
      .eq('session_date', today)
      .maybeSingle();

    const used = countUserMessages((data as AiConversationRow | null)?.messages_json);
    setDailyMessagesLeft(Math.max(0, DAILY_CONTEXT_LIMIT - used));
  }, [countUserMessages, profile?.id]);

  useEffect(() => {
    void refreshDailyLimit();
  }, [refreshDailyLimit]);

  const sendMessage = useCallback(async (message: string) => {
    if (!session?.access_token) {
      const authError = new Error(ComponentMessages.invalidSession);
      setError(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);

    try {
      if (dailyMessagesLeft <= 0) {
        const limitError = new Error(ComponentMessages.dailyLimitReached);
        setError(limitError);
        throw limitError;
      }

      const historyPayload = messages.map((entry) => ({ role: entry.role, content: entry.content }));

      const response = await fetch(`${apiUrl}/api/ai/context-chat`, {
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

      const payload = (await response.json().catch((e) => {
        console.debug?.('[useAI] context-chat response.json failed', e);
        return {};
      })) as ContextChatResponse;

      if (!response.ok) {
        if (response.status === 429) {
          setDailyMessagesLeft(0);
        }
        throw new Error(payload.error ?? `Vyra AI responded with ${response.status}`);
      }

      const reply = payload.reply ?? ComponentMessages.aiBrainResting;

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

      return reply;
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

  return {
    sendMessage,
    loading,
    isLoading: loading,
    error,
    clearError,
    messages,
    dailyMessagesLeft,
    buildSystemPrompt: () => buildSystemPrompt(profile),
    refreshDailyLimit,
  };
};

export default useAI;
