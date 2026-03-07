// ============================================================
// VYRA FITNESS — useDashboard Hook
// Agrega datos del día: score, streaks, módulos, insights del coach
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { todayISO, daysAgoISO } from '@/utils/dates';

export function useDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const userId  = profile?.id;

  // ─── Daily Score ────────────────────────────────────────
  const { data: dailyScore, isLoading: scoreLoading } = useQuery({
    queryKey: ['daily_score', userId, todayISO()],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todayISO())
        .single();
      return data;
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

  // ─── Resumen del día (agua, pasos, ayuno activo, sueño anoche) ──
  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['today_summary', userId, todayISO()],
    queryFn: async () => {
      if (!userId) return null;
      const today     = todayISO();
      const yesterday = daysAgoISO(1);

      const [waterRes, stepsRes, fastingRes, sleepRes, mentalRes] = await Promise.all([
        supabase.from('water_logs').select('hydration_equivalent_ml').eq('user_id', userId).gte('logged_at', `${today}T00:00:00`),
        supabase.from('step_logs').select('steps, distance_m, calories').eq('user_id', userId).eq('logged_date', today).single(),
        supabase.from('fasting_logs').select('*').eq('user_id', userId).eq('completed', false).is('end_time', null).single(),
        supabase.from('sleep_logs').select('duration_min, quality_score').eq('user_id', userId).gte('end_time', `${yesterday}T18:00:00`).lte('end_time', `${today}T18:00:00`).order('end_time', { ascending: false }).limit(1),
        supabase.from('mental_checkins').select('id').eq('user_id', userId).eq('check_date', today).single(),
      ]);

      const totalWater = (waterRes.data ?? []).reduce((sum, r) => sum + (r.hydration_equivalent_ml ?? 0), 0);

      return {
        water:   { total: totalWater, goal: profile?.water_goal_ml ?? 2500 },
        steps:   stepsRes.data ?? { steps: 0, distance_m: 0, calories: 0 },
        fasting: fastingRes.data ?? null,
        sleep:   sleepRes.data?.[0] ?? null,
        mental:  mentalRes.data ?? null,
        stepGoal:profile?.step_goal ?? 10000,
      };
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // ─── 7-day trend ────────────────────────────────────────
  const { data: weekScores } = useQuery({
    queryKey: ['week_scores', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('daily_scores')
        .select('date, total_score')
        .eq('user_id', userId)
        .gte('date', daysAgoISO(6))
        .order('date');
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Mental check-in done hoy ───────────────────────────
  const mentalDoneToday = !!todayData?.mental;

  return {
    profile,
    dailyScore,
    todayData,
    weekScores: weekScores ?? [],
    mentalDoneToday,
    isLoading: scoreLoading || todayLoading,
  };
}
