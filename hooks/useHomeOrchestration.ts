/**
 * useHomeOrchestration Hook
 * 
 * Consolidates 10+ home hooks into a single orchestration layer
 * 
 * Replaces: useChecklist, useStreak, useTodayMetrics, useWaterToday, useSleepToday,
 *           useStepsToday, useMentalToday, useNutritionToday, useWorkoutToday, useFastingToday
 * 
 * Single source of truth for home page data
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { isGuestAuthUser } from '@/lib/guest-auth';
import { useAuthStore } from '@/stores/authStore';
import { useReadiness } from './useReadiness';
import { useSyncQueue } from './useSyncQueue';
import type { DailyScore } from '@/hooks/useReadiness';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_BACKEND_URL ??
  '';

/**
 * Daily module data
 */
export interface DailyModuleData {
  water: {
    logged_ml: number;
    goal_ml: number;
    percentage: number;
  };
  steps: {
    count: number;
    goal: number;
    percentage: number;
  };
  sleep: {
    hours: number;
    quality: number;
    goal_hours: number;
  };
  nutrition: {
    calories: number;
    goal: number;
    percentage: number;
  };
  workout: {
    completed: boolean;
    duration_minutes: number;
  };
  fasting: {
    active: boolean;
    hours_elapsed: number;
    next_phase: string;
  };
  mental: {
    mood: number; // 1-10
    energy: number; // 1-10
    stress: number; // 1-10
  };
}

/**
 * Checklist item
 */
export interface ChecklistItem {
  id: string;
  module: string;
  label: string;
  completed: boolean;
  icon: string;
}

/**
 * Streak data
 */
export interface StreakData {
  water: number;
  workout: number;
  sleep: number;
  current_day_complete: boolean;
}

/**
 * Home orchestration state
 */
export interface HomeOrchestrationState {
  // Loading states
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Data
  todayDate: string;
  score: DailyScore | null;
  dailyData: DailyModuleData | null;
  checklist: ChecklistItem[];
  streak: StreakData | null;

  // Metadata
  lastUpdated: string | null;
  hasLocalChanges: boolean;
}

/**
 * useHomeOrchestration Hook
 * 
 * @example
 * const home = useHomeOrchestration();
 * 
 * if (home.loading) return <Spinner />;
 * 
 * return (
 *   <ScrollView>
 *     <ScoreCard score={home.score} />
 *     <ChecklistCard checklist={home.checklist} />
 *     <MetricsCards data={home.dailyData} />
 *   </ScrollView>
 * );
 */
export function useHomeOrchestration(): HomeOrchestrationState & {
  refresh: () => Promise<void>;
  markChecklistItem: (id: string, completed: boolean) => Promise<void>;
} {
  const { session } = useAuthStore();
  const isGuest = isGuestAuthUser(session?.user ?? null);
  const { score, loading: scoreLoading, refresh: refreshScore } = useReadiness();
  const { add: queueAdd } = useSyncQueue();

  const [state, setState] = useState<HomeOrchestrationState>({
    loading: true,
    refreshing: false,
    error: null,
    todayDate: new Date().toISOString().split('T')[0],
    score: null,
    dailyData: null,
    checklist: [],
    streak: null,
    lastUpdated: null,
    hasLocalChanges: false,
  });

  /**
   * Fetch today's metrics from API
   */
  const fetchDailyMetrics = useCallback(async () => {
    if (!session?.access_token || isGuest) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/home/metrics`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setState((prev) => ({ ...prev, dailyData: null }));
          return;
        }

        throw new Error(`HTTP ${res.status}`);
      }

      const { data } = await res.json();

      setState((prev) => ({
        ...prev,
        dailyData: {
          water: {
            logged_ml: data.water_ml || 0,
            goal_ml: data.water_goal_ml || 2000,
            percentage: Math.min(
              100,
              ((data.water_ml || 0) / (data.water_goal_ml || 2000)) * 100
            ),
          },
          steps: {
            count: data.steps || 0,
            goal: data.steps_goal || 10000,
            percentage: Math.min(
              100,
              ((data.steps || 0) / (data.steps_goal || 10000)) * 100
            ),
          },
          sleep: {
            hours: data.sleep_hours || 0,
            quality: data.sleep_quality || 0,
            goal_hours: 8,
          },
          nutrition: {
            calories: data.calories || 0,
            goal: data.calorie_goal || 2000,
            percentage: Math.min(
              100,
              ((data.calories || 0) / (data.calorie_goal || 2000)) * 100
            ),
          },
          workout: {
            completed: data.workout_completed || false,
            duration_minutes: data.workout_minutes || 0,
          },
          fasting: {
            active: data.fasting_active || false,
            hours_elapsed: data.fasting_hours || 0,
            next_phase: data.fasting_phase || 'digestion',
          },
          mental: {
            mood: data.mood || 5,
            energy: data.energy || 5,
            stress: data.stress || 5,
          },
        },
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/401|403/.test(message)) {
        setState((prev) => ({ ...prev, dailyData: null }));
        return;
      }

      console.error('Failed to fetch daily metrics:', error);
      setState((prev) => ({
        ...prev,
        error: 'No pudimos cargar tus métricas',
      }));
    }
  }, [isGuest, session?.access_token]);

  /**
   * Fetch checklist
   */
  const fetchChecklist = useCallback(async () => {
    if (!session?.access_token || isGuest) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/home/checklist`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setState((prev) => ({ ...prev, checklist: [] }));
          return;
        }

        throw new Error(`HTTP ${res.status}`);
      }

      const { data } = await res.json();

      setState((prev) => ({
        ...prev,
        checklist: data || [],
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/401|403/.test(message)) {
        setState((prev) => ({ ...prev, checklist: [] }));
        return;
      }

      console.error('Failed to fetch checklist:', error);
    }
  }, [isGuest, session?.access_token]);

  /**
   * Fetch streak data
   */
  const fetchStreak = useCallback(async () => {
    if (!session?.access_token || isGuest) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/home/streak`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setState((prev) => ({ ...prev, streak: null }));
          return;
        }

        throw new Error(`HTTP ${res.status}`);
      }

      const { data } = await res.json();

      setState((prev) => ({
        ...prev,
        streak: data,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/401|403/.test(message)) {
        setState((prev) => ({ ...prev, streak: null }));
        return;
      }

      console.error('Failed to fetch streak:', error);
    }
  }, [isGuest, session?.access_token]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (!session?.access_token) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'No autenticado',
      }));
      return;
    }

    if (isGuest) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        dailyData: null,
        checklist: [],
        streak: null,
      }));
      return;
    }

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        await Promise.all([
          fetchDailyMetrics(),
          fetchChecklist(),
          fetchStreak(),
          refreshScore(),
        ]);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    void load();
  }, [isGuest, session?.access_token, fetchDailyMetrics, fetchChecklist, fetchStreak, refreshScore]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    try {
      await Promise.all([
        fetchDailyMetrics(),
        fetchChecklist(),
        fetchStreak(),
        refreshScore(),
      ]);
    } finally {
      setState((prev) => ({ ...prev, refreshing: false }));
    }
  }, [fetchDailyMetrics, fetchChecklist, fetchStreak, refreshScore]);

  /**
   * Mark checklist item as complete
   */
  const markChecklistItem = useCallback(
    async (id: string, completed: boolean) => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/home/checklist/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ completed }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Update local state
        setState((prev) => ({
          ...prev,
          checklist: prev.checklist.map((item) =>
            item.id === id ? { ...item, completed } : item
          ),
        }));

        // Queue for sync if offline
        await queueAdd({
          module: 'home',
          action: 'UPDATE',
          table: 'checklist',
          payload: { id, completed },
        });
      } catch (error) {
        console.error('Failed to update checklist:', error);
      }
    },
    [session?.access_token, queueAdd]
  );

  // Merge readiness score into state
  const stateWithScore = useMemo(
    () => ({
      ...state,
      score,
      loading: state.loading || scoreLoading,
    }),
    [state, score, scoreLoading]
  );

  return {
    ...stateWithScore,
    refresh,
    markChecklistItem,
  };
}
