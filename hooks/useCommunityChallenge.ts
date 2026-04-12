import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { captureError } from '@/lib/sentry';

export interface CommunityLeaderboardEntry {
  userId: string;
  name: string;
  steps: number;
  rank: number;
  isYou: boolean;
  avatarUrl?: string | null;
}

export interface CommunityChallengeSnapshot {
  range: 'week' | 'month';
  startDate: string;
  endDate: string;
  totalSteps: number;
  targetSteps: number;
  userSteps: number;
  userRank: number | null;
  leaderboard: CommunityLeaderboardEntry[];
}

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

export function useCommunityChallenge() {
  const { session } = useAuthStore();
  const [week, setWeek] = useState<CommunityChallengeSnapshot | null>(null);
  const [month, setMonth] = useState<CommunityChallengeSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!session?.access_token) return {};
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };
  }, [session?.access_token]);

  const fetchRange = useCallback(async (range: 'week' | 'month') => {
    if (!session?.access_token || !BACKEND_URL) return null;
    const res = await fetch(`${BACKEND_URL}/api/challenges/community?range=${range}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as CommunityChallengeSnapshot;
  }, [getAuthHeaders, session?.access_token]);

  const refresh = useCallback(async () => {
    if (!session?.access_token || !BACKEND_URL) {
      setWeek(null);
      setMonth(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [weekData, monthData] = await Promise.all([
        fetchRange('week'),
        fetchRange('month'),
      ]);
      if (weekData) setWeek(weekData);
      if (monthData) setMonth(monthData);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useCommunityChallenge.refresh',
      });
      setError('No se pudo cargar el reto comunitario.');
    } finally {
      setLoading(false);
    }
  }, [fetchRange, session?.access_token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    week,
    month,
    loading,
    error,
    refresh,
  };
}

export default useCommunityChallenge;
