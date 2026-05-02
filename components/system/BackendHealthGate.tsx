import React from 'react';
import MaintenanceView from '@/components/system/MaintenanceView';
import { useBackendHealth } from '@/hooks/useBackendHealth';

interface BackendHealthGateProps {
  children: React.ReactNode;
}

function shouldBlockPublicStack(error: string | null): boolean {
  if (!error) return true;

  const normalized = error.toLowerCase();

  if (
    normalized.includes('abort') ||
    normalized.includes('timeout') ||
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('socket') ||
    normalized.includes('unreachable') ||
    normalized.includes('econn')
  ) {
    return false;
  }

  return true;
}

export default function BackendHealthGate({ children }: BackendHealthGateProps) {
  const { status, refresh, lastCheckedAt, error, isOnline } = useBackendHealth();

  if (!isOnline) return <>{children}</>;
  if (status === 'down' && shouldBlockPublicStack(error)) {
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
