import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Audio } from 'expo-av';
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
  const [results, setResults] = useState<any[]>([]);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Permiso de micrófono denegado');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setError(null);
      setResults([]);
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar grabación');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useVoiceLog.start' });
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
      if (uri) setResults([uri]);
    } catch (err: any) {
      setError(err.message ?? 'Error al detener grabación');
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useVoiceLog.stop' });
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeLog = async (type: 'meal' | 'workout' | 'thought'): Promise<boolean> => {
    if (!results.length || !session?.access_token) return false;
    try {
      const response = await fetch(`${BACKEND_URL}/api/voiceLog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          transcription: results[0],
          type,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Error processing voice log');
      return true;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useVoiceLog.transcribe' });
      setError('Error procesando audio');
      return false;
    }
  };

  const clearResults = () => {
    setResults([]);
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