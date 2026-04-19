import React from 'react';
import MaintenanceView from '@/components/system/MaintenanceView';
import { useBackendHealth } from '@/hooks/useBackendHealth';

interface BackendHealthGateProps {
  children: React.ReactNode;
}

export default function BackendHealthGate({ children }: BackendHealthGateProps) {
  const { status, refresh, lastCheckedAt, error, isOnline } = useBackendHealth();

  if (!isOnline) return <>{children}</>;
  if (status === 'down') {
    return (
      <MaintenanceView
        onRetry={refresh}
        lastCheckedAt={lastCheckedAt}
        error={error}
      />
    );
  }

  return <>{children}</>;
}

