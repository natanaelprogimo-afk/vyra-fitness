// ============================================================
// VYRA FITNESS — useMental Hook
// Check-in diario (mood/energy/stress/motivation), historial
// 30 días, tendencias, score semanal, coins por check-in
// ============================================================

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { addCoins, addXP } from '@/services/supabase/profiles';
import { captureError } from '@/lib/sentry';
import { trackLogCreated } from '@/lib/analytics';
import { todayISO, daysAgoISO } from '@/utils/dates';
import { calculateMentalScore } from '@/utils/calculations';

export interface MentalEntry {
  id:         string;
  mood:       number;   // 1-5
  energy:     number;   // 1-10
  stress:     number;   // 1-10
  motivation: number;   // 1-10
  notes:      string | null;
  check_date: string;   // YYYY-MM-DD
  created_at: string;
}

export interface MentalInput {
  mood:       number;
  energy:     number;
  stress:     number;
  motivation: number;
  notes?:     string;
}

// Labels y colores para score
export function getMentalScoreInfo(score: number): { label: string; color: string; emoji: string } {
  if (score >= 85) return { label: 'Excelente',   color: '#7BC67E', emoji: '🌟' };
  if (score >= 70) return { label: 'Bien',        color: '#82C91E', emoji: '😊' };
  if (score >= 55) return { label: 'Regular',     color: '#FFD43B', emoji: '😐' };
  if (score >= 40) return { label: 'Bajo',        color: '#FF922B', emoji: '😕' };
  return                  { label: 'Necesitás apoyo', color: '#FF6B6B', emoji: '😔' };
}

export function useMental() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const isOnline    = useUIStore((s) => s.isOnline);
  const userId      = profile?.id ?? '';

  // ─── Check-in de hoy ────────────────────────────────────
  const { data: todayEntry, isLoading: isLoadingToday } = useQuery<MentalEntry | null>({
    queryKey: ['mental_today', userId, todayISO()],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('mental_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('check_date', todayISO())
        .single();
      return data;
    },
    enabled:   !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const todayDone  = !!todayEntry;
  const todayScore = todayEntry
    ? calculateMentalScore(todayEntry.mood, todayEntry.energy, todayEntry.stress, todayEntry.motivation)
    : null;

  // ─── Historial 30 días ────────────────────────────────────
  const { data: history = [], isLoading: isLoadingHistory } = useQuery<MentalEntry[]>({
    queryKey: ['mental_history', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const { data } = await supabase
        .from('mental_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('check_date', daysAgoISO(29))
        .order('check_date', { ascending: true });
      return data ?? [];
    },
    enabled:   !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Estadísticas derivadas ───────────────────────────────
  const last7 = history.slice(-7);

  const weeklyAvgScore = last7.length
    ? Math.round(last7.reduce((s, e) =>
        s + calculateMentalScore(e.mood, e.energy, e.stress, e.motivation), 0) / last7.length)
    : 0;

  const avgMood   = history.length ? history.reduce((s, e) => s + e.mood, 0) / history.length : 0;
  const avgEnergy = history.length ? history.reduce((s, e) => s + e.energy, 0) / history.length : 0;
  const avgStress = history.length ? history.reduce((s, e) => s + e.stress, 0) / history.length : 0;

  // Días de check-in en los últimos 7
  const checkinStreak = (() => {
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const date = daysAgoISO(i);
      if (history.find(e => e.check_date === date)) streak++;
      else break;
    }
    return streak;
  })();

  // Tendencia de humor (últimos 7 días vs los 7 anteriores)
  const prev7 = history.slice(-14, -7);
  const moodTrend = last7.length && prev7.length
    ? (last7.reduce((s, e) => s + e.mood, 0) / last7.length) -
      (prev7.reduce((s, e) => s + e.mood, 0) / prev7.length)
    : 0;

  // ─── Guardar check-in (upsert) ────────────────────────────
  const { mutate: saveCheckin, isPending: isSaving } = useMutation({
    mutationFn: async (input: MentalInput) => {
      if (!userId) throw new Error('No user');

      const score = calculateMentalScore(input.mood, input.energy, input.stress, input.motivation);

      const { data, error } = await supabase
        .from('mental_checkins')
        .upsert({
          user_id:    userId,
          mood:       input.mood,
          energy:     input.energy,
          stress:     input.stress,
          motivation: input.motivation,
          notes:      input.notes ?? null,
          check_date: todayISO(),
        }, { onConflict: 'user_id,check_date' })
        .select('id')
        .single();

      if (error) throw error;
      return { id: data.id, score };
    },

    onSuccess: async ({ score }) => {
      // Coins solo si es check-in nuevo (no edición)
      if (!todayDone) {
        const coinsEarned = score >= 70 ? 5 : 2;
        await addCoins(userId, coinsEarned, 'mental_checkin', `Check-in mental: ${score}/100`);
        await addXP(userId, 30);
        showToast(`Check-in guardado — ${score}/100 +${coinsEarned} 🪙`, 'success');
      } else {
        showToast('Check-in actualizado', 'success');
      }

      queryClient.invalidateQueries({ queryKey: ['mental_today'] });
      queryClient.invalidateQueries({ queryKey: ['mental_history'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      trackLogCreated('mental', 'manual', Date.now());

      if (isOnline) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      }
    },

    onError: (err) => {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "'saveCheckin'" });
      showToast('No se pudo guardar el check-in.', 'error');
    },
  });

  // ─── Scores diarios para el gráfico ──────────────────────
  const dailyScores = history.map(e => ({
    date:  e.check_date,
    score: calculateMentalScore(e.mood, e.energy, e.stress, e.motivation),
    mood:  e.mood,
    energy:e.energy,
    stress:e.stress,
    motivation: e.motivation,
  }));

  // ─── Insights automáticos ────────────────────────────────
  const insights: string[] = [];
  if (avgStress > 7)    insights.push('⚠️ Tu estrés promedio está elevado. Considerá técnicas de respiración o meditación.');
  if (avgEnergy < 5)    insights.push('😴 Energía baja en promedio. Revisá tu sueño y nutrición.');
  if (moodTrend < -0.5) insights.push('📉 Tu humor bajó esta semana. ¿Hay algo que te esté pesando?');
  if (moodTrend > 0.5)  insights.push('📈 Tu humor mejoró esta semana. ¡Seguí así!');
  if (checkinStreak >= 7) insights.push('🔥 7 días consecutivos de check-in. ¡Racha perfecta!');
  if (avgMood >= 4)     insights.push('😊 Tu humor promedio es excelente esta semana.');

  return {
    todayEntry,
    todayDone,
    todayScore,
    history,
    dailyScores,
    weeklyAvgScore,
    avgMood,
    avgEnergy,
    avgStress,
    checkinStreak,
    moodTrend,
    insights,
    isLoading: isLoadingToday || isLoadingHistory,
    isSaving,
    saveCheckin,
  };
}
