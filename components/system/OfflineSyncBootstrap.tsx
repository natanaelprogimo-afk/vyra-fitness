import { useEffect, useRef } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useUIStore } from '@/stores/uiStore';
import { assertRequiredTables } from '@/lib/watermelondb';
import { captureError } from '@/lib/sentry';

export default function OfflineSyncBootstrap() {
  const { status, error, pendingCount } = useOfflineSync();
  const showToast = useUIStore((s) => s.showToast);
  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      showToast('No se pudo sincronizar. Los datos quedan guardados localmente.', 'error');
    }
  }, [error, showToast]);

  useEffect(() => {
    const { ok, missing } = assertRequiredTables();
    if (!ok) {
      const message = `Faltan tablas offline: ${missing.join(', ')}`;
      showToast('Faltan tablas offline. Reinstala o actualiza la app.', 'error');
      captureError(new Error(message), { action: 'OfflineSyncBootstrap.assertRequiredTables' });
    }
  }, [showToast]);

  useEffect(() => {
    if (status === 'idle' && pendingCount === 0) {
      return;
    }
    if (status === 'pending' && lastStatusRef.current !== 'pending') {
      showToast('Datos pendientes por sincronizar.', 'info');
    }
    lastStatusRef.current = status;
  }, [pendingCount, showToast, status]);

  return null;
}
