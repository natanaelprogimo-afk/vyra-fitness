import { useState, useCallback } from 'react';

export interface UseAIOptions {
  onError?: (error: Error) => void;
}

export const useAI = (options?: UseAIOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar lógica real de coach IA con Groq
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // JWT del usuario va aquí
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`AI Coach responded with ${response.status}`);
      }

      const data = await response.json();
      return data.reply || 'Mi cerebro IA está tomando un descanso 😅';
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const messages: string[] = []; // TODO: store conversation history
  const dailyMessagesLeft = 5; // TODO: fetch from user state
  const isLoading = loading;

  return {
    sendMessage,
    loading,
    error,
    clearError,
    messages,
    isLoading,
    dailyMessagesLeft,
  };
};

export default useAI;
