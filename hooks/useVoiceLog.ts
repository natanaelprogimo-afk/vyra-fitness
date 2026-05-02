import { useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { useAuthStore } from '@/stores/authStore';
import { captureError } from '@/lib/sentry';

export interface VoiceLogResult {
  transcription: string;
  duration: number;
  confidence: number;
  timestamps: Array<{ text: string; time: number }>;
}

export function useVoiceLog() {
  const { session } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const backendUrl =
    process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Permiso de micrófono denegado');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setRecordingUri(null);
      setResults([]);
      setError(null);
      setIsRecording(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar grabación');
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useVoiceLog.start',
      });
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      setRecordingUri(uri ?? null);
      setResults([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al detener grabación');
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useVoiceLog.stop',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeLog = async (
    type: 'meal' | 'workout' | 'thought',
  ): Promise<boolean> => {
    if (!recordingUri || !session?.access_token) return false;

    if (type !== 'meal') {
      setError('El registro por voz disponible ahora solo procesa comidas.');
      return false;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append(
        'audio',
        {
          uri: recordingUri,
          name: 'voice-log.m4a',
          type: 'audio/m4a',
        } as unknown as Blob,
      );

      const response = await fetch(
        `${backendUrl}/api/ai/nutrition/transcribe-audio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        },
      );

      const payload = (await response.json().catch((e) => {
        console.debug?.('[useVoiceLog] transcription response.json failed', e);
        return {};
      })) as {
        error?: string;
        transcription?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Error procesando audio');
      }

      const transcription =
        typeof payload.transcription === 'string'
          ? payload.transcription.trim()
          : '';

      if (!transcription) {
        throw new Error('No se obtuvo una transcripción útil.');
      }

      setResults([transcription]);
      return true;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useVoiceLog.transcribe',
      });
      setError(
        err instanceof Error ? err.message : 'Error procesando audio',
      );
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setRecordingUri(null);
    setError(null);
  };

  return {
    isRecording,
    isProcessing,
    error,
    results,
    startRecording,
    stopRecording,
    transcribeLog,
    clearResults,
  };
}
