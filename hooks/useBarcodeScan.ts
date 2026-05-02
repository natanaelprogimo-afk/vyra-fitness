import { useState, useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { captureError } from '@/lib/sentry';
import { triggerNotificationHaptic } from '@/lib/haptics';

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
        action: 'useBarcodeScan.requestPermission',
      });
      return false;
    }
  }, [requestPermission]);

  const validateBarcode = useCallback((data: string, type: string): string | null => {
    if (!data || data.trim().length === 0) {
      return 'El código escaneado está vacío.';
    }
    if (!type) {
      return 'No pudimos reconocer el tipo de código.';
    }
    return null;
  }, []);

  const handleBarcodeScanned = useCallback(
    async (
      event: BarcodeEvent,
      onSuccess: (barcode: string, type: string) => void,
      onError?: (message: string) => void,
    ) => {
      if (scanned || isScanning) return;

      try {
        setIsScanning(true);
        setError(null);

        const validationError = validateBarcode(event.data, event.type);
        if (validationError) {
          setError(validationError);
          await triggerNotificationHaptic('warning');
          onError?.(validationError);
          return;
        }

        setScanned(true);
        setLastScanned({
          data: event.data,
          type: event.type,
          timestamp: Date.now(),
        });

        await triggerNotificationHaptic('success');
        onSuccess(event.data, event.type);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al procesar el código.';
        setError(errorMsg);
        captureError(err instanceof Error ? err : new Error(errorMsg), {
          action: 'useBarcodeScan.handleBarcodeScanned',
        });
        onError?.(errorMsg);
        await triggerNotificationHaptic('warning');
      } finally {
        setIsScanning(false);
      }
    },
    [error, isScanning, scanned, validateBarcode],
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
    hasPermission,
    scanned,
    isScanning,
    torch,
    lastScanned,
    error,
    requestPermission: requestCameraPermission,
    handleBarcodeScanned,
    resetScan,
    toggleTorch,
    setError,
    clearError: () => setError(null),
  };
}
