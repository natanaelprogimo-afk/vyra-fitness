import { useState, useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { captureError } from '@/lib/sentry';

export interface BarcodeEvent {
  data: string;
  type: string;
  bounds?: { origin?: { x: number; y: number }; size?: { width: number; height: number } };
  cornerPoints?: Array<{ x: number; y: number }>;
}

export interface ScannedBarcode {
  data: string;
  type: string;
  timestamp: number;
}

export function useBarcodeScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [torch, setTorch] = useState(false);
  const [lastScanned, setLastScanned] = useState<ScannedBarcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasPermission = permission?.granted ?? false;

  const requestCameraPermission = useCallback(async () => {
    try {
      const result = await requestPermission();
      return result.granted;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      captureError(err instanceof Error ? err : new Error(errorMsg), { 
        action: "useBarcodeScan.requestPermission" 
      });
      return false;
    }
  }, [requestPermission]);

  const validateBarcode = useCallback((data: string, type: string): boolean => {
    if (!data || data.trim().length === 0) {
      setError('El código escaneado está vacío');
      return false;
    }
    if (!type) {
      setError('Tipo de código desconocido');
      return false;
    }
    return true;
  }, []);

  const handleBarcodeScanned = useCallback(
    async (
      event: BarcodeEvent,
      onSuccess: (barcode: string, type: string) => void,
      onError?: (error: string) => void,
    ) => {
      // Evitar múltiples escaneos simultáneos o muy seguidos
      if (scanned || isScanning) {
        return;
      }

      try {
        setIsScanning(true);
        setError(null);

        // Validar el código escaneado
        if (!validateBarcode(event.data, event.type)) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onError?.(error || 'Código inválido');
          return;
        }

        // Marcar como escaneado
        setScanned(true);
        setLastScanned({
          data: event.data,
          type: event.type,
          timestamp: Date.now(),
        });

        // Haptic feedback de éxito
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Llamar al callback con los datos
        onSuccess(event.data, event.type);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al procesar código';
        setError(errorMsg);
        captureError(err instanceof Error ? err : new Error(errorMsg), { 
          action: "useBarcodeScan.handleBarcodeScanned" 
        });
        onError?.(errorMsg);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } finally {
        setIsScanning(false);
      }
    },
    [scanned, isScanning, validateBarcode, error],
  );

  const resetScan = useCallback(() => {
    setScanned(false);
    setLastScanned(null);
    setError(null);
  }, []);

  const toggleTorch = useCallback(() => {
    setTorch((prev) => !prev);
  }, []);

  return {
    // Estado
    hasPermission,
    scanned,
    isScanning,
    torch,
    lastScanned,
    error,

    // Acciones
    requestPermission: requestCameraPermission,
    handleBarcodeScanned,
    resetScan,
    toggleTorch,
    setError,
    clearError: () => setError(null),
  };
}



