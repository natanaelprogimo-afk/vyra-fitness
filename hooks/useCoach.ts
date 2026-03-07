import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const FREE_LIMIT = 5;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

function normalizeMessagesFromConversationRow(row: {
  id: string;
  session_date?: string;
  messages_json?: unknown;
}): ChatMessage[] {
  if (!Array.isArray(row.messages_json)) return [];

  return row.messages_json
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item, index) => {
      const role: ChatMessage['role'] = item.role === 'assistant' ? 'assistant' : 'user';
      return {
        id: `${row.id}_${index}`,
        role,
        content: typeof item.content === 'string' ? item.content : '',
        createdAt:
          typeof item.created_at === 'string' && item.created_at.trim().length > 0
            ? item.created_at
            : `${row.session_date ?? new Date().toISOString().split('T')[0]}T00:00:00.000Z`,
      };
    })
    .filter((msg) => msg.content.trim().length > 0);
}

function countUserMessages(messages: unknown): number {
  if (!Array.isArray(messages)) return 0;
  return messages.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const role = (item as any).role;
    const content = (item as any).content;
    return role === 'user' && typeof content === 'string' && content.trim().length > 0;
  }).length;
}

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Sin sesión');
  return session.access_token;
}

export function useCoach() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const isPremium = useAuthStore((s) => s.isPremium());
  const userId = profile?.id ?? '';

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [dailyMessagesLeft, setDailyMessagesLeft] = useState<number>(FREE_LIMIT);
  const abortRef = useRef<AbortController | null>(null);

  const refreshRemaining = useCallback(async () => {
    if (!userId || isPremium) {
      setDailyMessagesLeft(999);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('ai_conversations')
      .select('messages_json')
      .eq('user_id', userId)
      .eq('session_date', today)
      .maybeSingle();

    setDailyMessagesLeft(Math.max(0, FREE_LIMIT - countUserMessages((data as any)?.messages_json)));
  }, [isPremium, userId]);

  useEffect(() => {
    void refreshRemaining();
  }, [refreshRemaining]);

  const { isLoading: isLoadingHistory } = useQuery({
    queryKey: ['coach_history', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('ai_conversations')
        .select('id, session_date, messages_json')
        .eq('user_id', userId)
        .order('session_date', { ascending: true })
        .limit(30);

      if (error) throw error;

      const messages: ChatMessage[] = (data ?? [])
        .flatMap((row) =>
          normalizeMessagesFromConversationRow({
            id: row.id as string,
            session_date: row.session_date as string | undefined,
            messages_json: (row as any).messages_json,
          }),
        )
        .slice(-80);

      setLocalMessages(messages);
      return messages;
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) throw new Error('Mensaje vacío');
      const token = await getAuthToken();

      const userMessage: ChatMessage = {
        id: `local_${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: localMessages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortRef.current.signal,
        });

        const payload = await response.json().catch(() => ({} as any));

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(`LIMIT_REACHED:${FREE_LIMIT}`);
          }
          throw new Error(payload?.error ?? `HTTP ${response.status}`);
        }

        return {
          message: payload.reply as string,
          remainingFree: payload.messagesLeft as number | undefined,
        };
      } finally {
        setIsTyping(false);
      }
    },

    onSuccess: async ({ message, remainingFree }) => {
      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: message,
        createdAt: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, assistantMessage]);

      if (typeof remainingFree === 'number') {
        setDailyMessagesLeft(remainingFree);
      } else {
        await refreshRemaining();
      }

      if (!isPremium && (remainingFree ?? dailyMessagesLeft) <= 2) {
        showToast(`Te quedan ${(remainingFree ?? dailyMessagesLeft)} mensajes gratis hoy`, 'warning');
      }

      queryClient.invalidateQueries({ queryKey: ['coach_history', userId] });
    },

    onError: async (err) => {
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.startsWith('LIMIT_REACHED')) {
        setDailyMessagesLeft(0);
        showToast(`Alcanzaste el límite de ${FREE_LIMIT} mensajes diarios. ¡Upgrade a Premium!`, 'warning');
      } else if (msg !== 'AbortError') {
        showToast('No pude enviar el mensaje. Intentá de nuevo.', 'error');
        captureError(err instanceof Error ? err : new Error(msg), { action: 'useCoach.sendMessage' });
      }

      setLocalMessages((prev) => prev.filter((m) => !m.id.startsWith('local_')));
      await refreshRemaining();
    },
  });

  const clearHistory = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('user_id', userId);

    if (error) {
      showToast('No se pudo borrar la conversación.', 'error');
      return;
    }

    setLocalMessages([]);
    queryClient.removeQueries({ queryKey: ['coach_history', userId] });
    showToast('Conversación borrada', 'info');
  }, [queryClient, showToast, userId]);

  const coachName = profile?.coach_name_preference ?? 'Vyra';
  const suggestedPrompts = [
    '¿Cómo estoy yendo esta semana?',
    '¿Qué debo comer hoy?',
    'Necesito motivación para hacer ejercicio',
    '¿Cuánta agua me falta tomar?',
    'Explicame cómo funciona el ayuno 16:8',
    'Dame consejos para mejorar mi sueño',
  ];

  return {
    messages: localMessages,
    isLoading: isLoadingHistory || isSending,
    isSending,
    isTyping,
    isPremium,
    coachName,
    suggestedPrompts,
    sendMessage,
    clearHistory,
    dailyMessagesLeft,
  };
}
