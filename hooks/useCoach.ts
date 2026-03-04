// ============================================================
// VYRA FITNESS — useCoach Hook
// Chat con Vyra (IA) via backend Render, historial Supabase,
// límite diario free (10 msg), contexto de hoy
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { captureError } from '@/lib/sentry';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const FREE_LIMIT  = 10;

export interface ChatMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  createdAt: string;
}

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Sin sesión');
  return session.access_token;
}

export function useCoach() {
  const queryClient  = useQueryClient();
  const profile      = useAuthStore(s => s.profile);
  const showToast    = useUIStore(s => s.showToast);
  const isPremium    = useAuthStore(s => s.isPremium());
  const userId       = profile?.id ?? '';

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isTyping,      setIsTyping]       = useState(false);
  const abortRef                           = useRef<AbortController | null>(null);

  // ─── Cargar historial al abrir ────────────────────────────
  const { isLoading: isLoadingHistory } = useQuery({
    queryKey: ['coach_history', userId],
    queryFn: async () => {
      if (!userId) return [];
      const token = await getAuthToken();
      const res   = await fetch(`${BACKEND_URL}/api/coach/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error cargando historial');
      const data = await res.json();
      const msgs: ChatMessage[] = (data.messages ?? []).map((m: any) => ({
        id:        m.id,
        role:      m.role,
        content:   m.content,
        createdAt: m.created_at,
      }));
      setLocalMessages(msgs);
      return msgs;
    },
    enabled:   !!userId && !!BACKEND_URL,
    staleTime: Infinity,  // Solo carga al abrir, luego se maneja local
    retry:     1,
  });

  // ─── Enviar mensaje ──────────────────────────────────────
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) throw new Error('Mensaje vacío');

      const token = await getAuthToken();

      // Agregar mensaje del usuario al estado local inmediatamente
      const userMsg: ChatMessage = {
        id:        `local_${Date.now()}`,
        role:      'user',
        content:   text.trim(),
        createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      // Cancelar request anterior si existe
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${BACKEND_URL}/api/coach/chat`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body:    JSON.stringify({ message: text.trim() }),
          signal:  abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
          if (res.status === 429) {
            throw new Error(`LIMIT_REACHED:${FREE_LIMIT}`);
          }
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
          message:       data.message       as string,
          remainingFree: data.remainingFree  as number,
          tokensUsed:    data.tokensUsed     as number,
        };
      } finally {
        setIsTyping(false);
      }
    },

    onSuccess: ({ message, remainingFree }) => {
      const assistantMsg: ChatMessage = {
        id:        `ai_${Date.now()}`,
        role:      'assistant',
        content:   message,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, assistantMsg]);

      // Avisar si quedan pocos mensajes
      if (!isPremium && remainingFree <= 2 && remainingFree > 0) {
        showToast(`Te quedan ${remainingFree} mensajes gratis hoy`, 'warning');
      }
    },

    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith('LIMIT_REACHED')) {
        showToast(`Alcanzaste el límite de ${FREE_LIMIT} mensajes diarios. ¡Upgrade a Premium!`, 'warning');
      } else if (msg !== 'AbortError') {
        showToast('No pude enviar el mensaje. Intentá de nuevo.', 'error');
        captureError(err instanceof Error ? err : new Error(msg), { action: 'sendMessage' });
      }
      // Quitar el mensaje del user si falló
      setLocalMessages(prev => prev.filter(m => !m.id.startsWith('local_')));
    },
  });

  // ─── Borrar historial ─────────────────────────────────────
  const clearHistory = useCallback(async () => {
    try {
      const token = await getAuthToken();
      await fetch(`${BACKEND_URL}/api/coach/history`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocalMessages([]);
      queryClient.removeQueries({ queryKey: ['coach_history'] });
      showToast('Conversación borrada', 'info');
    } catch {
      showToast('No se pudo borrar la conversación.', 'error');
    }
  }, []);

  // ─── Prompts sugeridos según contexto ────────────────────
  const coachName       = profile?.coach_name_preference ?? 'Vyra';
  const suggestedPrompts = [
    '¿Cómo estoy yendo esta semana?',
    '¿Qué debo comer hoy?',
    'Necesito motivación para hacer ejercicio',
    '¿Cuánta agua me falta tomar?',
    'Explicame cómo funciona el ayuno 16:8',
    `Dame consejos para mejorar mi sueño`,
  ];

  return {
    messages:         localMessages,
    isLoadingHistory,
    isSending,
    isTyping,
    isPremium,
    coachName,
    suggestedPrompts,
    sendMessage,
    clearHistory,
  };
}