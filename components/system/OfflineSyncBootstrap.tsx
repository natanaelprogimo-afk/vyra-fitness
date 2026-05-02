import { useEffect, useRef } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useUIStore } from '@/stores/uiStore';
import { assertRequiredTables } from '@/lib/watermelondb';
import { captureError } from '@/lib/sentry';

export default function OfflineSyncBootstrap() {
  const { status, error, pendingCount, queueEnabled } = useOfflineSync();
  const showToast = useUIStore((s) => s.showToast);
  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      showToast(
        queueEnabled
          ? 'No se pudo sincronizar. Los datos pendientes siguen esperando sync.'
          : 'No se pudo revisar la sync parcial. Algunos modulos siguen guardando localmente.',
        'error',
      );
    }
  }, [error, queueEnabled, showToast]);

  useEffect(() => {
    if (!queueEnabled) {
      return;
    }
    const { ok, missing } = assertRequiredTables();
    if (!ok) {
      const message = `Faltan tablas offline: ${missing.join(', ')}`;
      showToast('Faltan tablas offline. Reinstala o actualiza la app.', 'error');
      captureError(new Error(message), { action: 'OfflineSyncBootstrap.assertRequiredTables' });
    }
  }, [queueEnabled, showToast]);

  useEffect(() => {
    if (!queueEnabled) {
      return;
    }
    if (status === 'idle' && pendingCount === 0) {
      return;
    }
    if (status === 'pending' && lastStatusRef.current !== 'pending') {
      showToast('Datos pendientes por sincronizar.', 'info');
    }
    lastStatusRef.current = status;
  }, [pendingCount, queueEnabled, showToast, status]);

  return null;
}
