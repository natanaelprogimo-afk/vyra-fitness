import React, { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { trackScreenStateViewed } from '@/lib/analytics';

type AsyncViewState = 'loading' | 'error' | 'empty' | 'ready';

interface AsyncStateViewProps {
  loading: boolean;
  hasError?: boolean;
  hasEmpty?: boolean;
  loadingView: ReactNode;
  errorView: ReactNode;
  emptyView?: ReactNode;
  children: ReactNode;
  analyticsKey?: string;
}

export default function AsyncStateView({
  loading,
  hasError = false,
  hasEmpty = false,
  loadingView,
  errorView,
  emptyView = null,
  children,
  analyticsKey,
}: AsyncStateViewProps) {
  const lastTracked = useRef<string | null>(null);

  const state = useMemo<AsyncViewState>(() => {
    if (loading) return 'loading';
    if (hasError) return 'error';
    if (hasEmpty) return 'empty';
    return 'ready';
  }, [hasEmpty, hasError, loading]);

  useEffect(() => {
    if (!analyticsKey) return;
    const next = `${analyticsKey}:${state}`;
    if (lastTracked.current === next) return;
    trackScreenStateViewed(analyticsKey, state);
    lastTracked.current = next;
  }, [analyticsKey, state]);

  if (state === 'loading') return <>{loadingView}</>;
  if (state === 'error') return <>{errorView}</>;
  if (state === 'empty' && emptyView) return <>{emptyView}</>;
  return <>{children}</>;
}
