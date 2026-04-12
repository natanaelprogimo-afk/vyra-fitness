import { useEffect, useState } from 'react';

export function useLoadingTimeout(isLoading: boolean, timeoutMs = 8000) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => {
      setHasTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timeout);
  }, [isLoading, timeoutMs]);

  return hasTimedOut;
}

