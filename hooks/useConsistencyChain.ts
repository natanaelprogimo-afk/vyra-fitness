import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { captureError } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { daysAgoISO } from '@/utils/dates';

export interface ConsistencyDay {
  date: string;
  completed: boolean;
  habits: number;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

export function useConsistencyChain(days: number = 14) {
  const { session } = useAuthStore();
  const userId = useAuthStore((state) => state.user?.id ?? state.profile?.id ?? null);
  const [timeline, setTimeline] = useState<ConsistencyDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChain = useCallback(async () => {
    if (!session?.access_token || !BACKEND_URL) {
      if (userId) {
        try {
          const fallback = await buildFallbackTimeline(userId, days);
          setTimeline(fallback);
        } catch (err) {
          captureError(err instanceof Error ? err : new Error(String(err)), {
            action: 'useConsistencyChain.fallback',
          });
          setTimeline([]);
        } finally {
          setLoading(false);
        }
        return;
      }
      setTimeline([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/scores/consistency?days=${days}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.status === 404) {
        if (userId) {
          const fallback = await buildFallbackTimeline(userId, days);
          setTimeline(fallback);
        } else {
          setTimeline([]);
        }
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const nextTimeline = Array.isArray(payload?.timeline) ? payload.timeline : [];
      setTimeline(nextTimeline as ConsistencyDay[]);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useConsistencyChain.fetch',
      });
      if (userId) {
        try {
          const fallback = await buildFallbackTimeline(userId, days);
          setTimeline(fallback);
        } catch {
          setTimeline([]);
        }
      } else {
        setTimeline([]);
      }
    } finally {
      setLoading(false);
    }
  }, [days, session?.access_token, userId]);

  useEffect(() => {
    void fetchChain();
  }, [fetchChain]);

  const currentStreak = useMemo(() => {
    if (!timeline.length) return 0;
    let streak = 0;
    for (let i = timeline.length - 1; i >= 0; i -= 1) {
      if (!timeline[i]?.completed) break;
      streak += 1;
    }
    return streak;
  }, [timeline]);

  return {
    timeline,
    loading,
    currentStreak,
    refresh: fetchChain,
  };
}

export default useConsistencyChain;

async function buildFallbackTimeline(userId: string, days: number): Promise<ConsistencyDay[]> {
  const startDate = daysAgoISO(Math.max(0, days - 1));
  const { data, error } = await supabase
    .from('daily_scores')
    .select('date, hydration_pct, sleep_pct, nutrition_pct, activity_pct, mental_pct')
    .eq('user_id', userId)
    .gte('date', startDate)
    .order('date', { ascending: true });

  if (error) throw error;

  const map = new Map<string, {
    hydration_pct?: number | null;
    sleep_pct?: number | null;
    nutrition_pct?: number | null;
    activity_pct?: number | null;
    mental_pct?: number | null;
  }>();

  (data ?? []).forEach((row: any) => {
    if (!row?.date) return;
    map.set(row.date, row);
  });

  const timeline: ConsistencyDay[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = daysAgoISO(i);
    const row = map.get(date) as any | undefined;
    const metrics = row
      ?  [
          row.hydration_pct ?? 0,
          row.sleep_pct ?? 0,
          row.nutrition_pct ?? 0,
          row.activity_pct ?? 0,
          row.mental_pct ?? 0,
        ]
      : [];
    const habits = metrics.filter((value) => Number(value) >= 70).length;
    timeline.push({
      date,
      habits,
      completed: habits >= 3,
    });
  }

  return timeline;
}
