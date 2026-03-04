// ============================================================
// VYRA FITNESS — useFasting Hook
// Ayuno intermitente con fases metabólicas, timer en vivo,
// notificaciones de fase, coins por completar
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { addCoins, addXP } from '@/services/supabase/profiles';
import { captureError } from '@/lib/sentry';
import { trackLogCreated } from '@/lib/analytics';
import { todayISO } from '@/utils/dates';

// ─── Fases metabólicas del ayuno ─────────────────────────
export interface FastingPhase {
  id:          string;
  hours:       number;   // hora de inicio de la fase
  emoji:       string;
  label:       string;
  description: string;
  color:       string;
}

export const FASTING_PHASES: FastingPhase[] = [
  { id: 'fed',       hours: 0,   emoji: '🍽️', label: 'Post-comida',        description: 'Digiriendo. Insulina elevada.',                     color: '#FF6B6B' },
  { id: 'fasting',   hours: 4,   emoji: '⏳', label: 'Ayuno activo',        description: 'Glucógeno empezando a consumirse.',                 color: '#FFB347' },
  { id: 'ketosis',   hours: 12,  emoji: '🔥', label: 'Cetosis inicial',      description: 'El cuerpo empieza a quemar grasa.',                 color: '#FFD700' },
  { id: 'autophagy', hours: 16,  emoji: '♻️', label: 'Autofagia',           description: 'Reciclaje celular activo. Beneficios máximos.',      color: '#7BC67E' },
  { id: 'deep',      hours: 18,  emoji: '🧬', label: 'Ayuno profundo',      description: 'HGH aumentando. Regeneración celular intensa.',      color: '#4FC3F7' },
  { id: 'extended',  hours: 24,  emoji: '⚡', label: 'Ayuno extendido',     description: 'Modo de supervivencia. Supervivencia celular máxima.',color: '#CE93D8' },
];

export const PROTOCOLS: Record<string, { label: string; targetHours: number; windowHours: number; description: string }> = {
  '16:8':  { label: '16:8',  targetHours: 16, windowHours: 8,  description: '16h ayuno, 8h para comer — el más popular' },
  '18:6':  { label: '18:6',  targetHours: 18, windowHours: 6,  description: '18h ayuno, 6h ventana' },
  '20:4':  { label: '20:4',  targetHours: 20, windowHours: 4,  description: 'Warrior Diet' },
  '23:1':  { label: '23:1',  targetHours: 23, windowHours: 1,  description: 'OMAD — una comida al día' },
  'custom':{ label: 'Custom',targetHours: 16, windowHours: 8,  description: 'Personalizado' },
};

export function useFasting() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const isOnline    = useUIStore((s) => s.isOnline);
  const userId      = profile?.id ?? '';

  // ─── Timer en vivo ───────────────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPhase,   setCurrentPhase]   = useState<FastingPhase>(FASTING_PHASES[0]);
  const [nextPhase,      setNextPhase]       = useState<FastingPhase | null>(FASTING_PHASES[1]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseNotifiedRef = useRef<Set<string>>(new Set());

  // ─── Ayuno activo desde Supabase ────────────────────────
  const { data: activeFast, isLoading, refetch } = useQuery({
    queryKey: ['fasting_active', userId],
    queryFn:  async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('fasting_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .eq('abandoned', false)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled:   !!userId,
    staleTime: 30 * 1000,
  });

  const protocol = activeFast?.protocol ?? profile?.fasting_protocol ?? '16:8';
  const targetHours = PROTOCOLS[protocol]?.targetHours ?? 16;

  // ─── Calcular elapsed al montar ──────────────────────────
  useEffect(() => {
    if (!activeFast?.start_time) return;
    const startMs = new Date(activeFast.start_time).getTime();
    const nowSec  = Math.floor((Date.now() - startMs) / 1000);
    setElapsedSeconds(Math.max(0, nowSec));
  }, [activeFast?.start_time]);

  // ─── Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeFast) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setElapsedSeconds(0);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        updatePhase(next);
        return next;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeFast?.id]);

  const updatePhase = (seconds: number) => {
    const hours = seconds / 3600;
    let phase   = FASTING_PHASES[0];
    let next: FastingPhase | null = null;

    for (let i = FASTING_PHASES.length - 1; i >= 0; i--) {
      if (hours >= FASTING_PHASES[i].hours) {
        phase = FASTING_PHASES[i];
        next  = FASTING_PHASES[i + 1] ?? null;
        break;
      }
    }

    setCurrentPhase(phase);
    setNextPhase(next);

    // Notificación de nueva fase
    if (!phaseNotifiedRef.current.has(phase.id) && hours >= phase.hours && phase.id !== 'fed') {
      phaseNotifiedRef.current.add(phase.id);
      showToast(`${phase.emoji} ${phase.label}`, 'info');
    }
  };

  // ─── Métricas derivadas ──────────────────────────────────
  const elapsedHours   = elapsedSeconds / 3600;
  const progressPct    = Math.min(100, (elapsedHours / targetHours) * 100);
  const remainingMs    = Math.max(0, (targetHours * 3600 - elapsedSeconds) * 1000);
  const isComplete     = elapsedHours >= targetHours;

  // Tiempo para la siguiente fase
  const nextPhaseIn = nextPhase
    ? Math.max(0, nextPhase.hours * 3600 - elapsedSeconds)
    : null;

  // ─── Iniciar ayuno ────────────────────────────────────────
  const { mutate: startFast, isPending: isStarting } = useMutation({
    mutationFn: async (proto: string) => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase
        .from('fasting_logs')
        .insert({
          user_id:    userId,
          protocol:   proto,
          start_time: new Date().toISOString(),
          completed:  false,
          abandoned:  false,
          phases_timestamps_json: JSON.stringify({}),
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (_, proto) => {
      queryClient.invalidateQueries({ queryKey: ['fasting_active'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      phaseNotifiedRef.current.clear();
      showToast(`Ayuno ${proto} iniciado 💪`, 'success');
      trackLogCreated('fasting', 'manual', Date.now());
    },
    onError: () => showToast('No se pudo iniciar el ayuno.', 'error'),
  });

  // ─── Completar ayuno ─────────────────────────────────────
  const { mutate: completeFast, isPending: isCompleting } = useMutation({
    mutationFn: async () => {
      if (!activeFast?.id || !userId) throw new Error('No active fast');
      const { error } = await supabase
        .from('fasting_logs')
        .update({
          end_time:    new Date().toISOString(),
          completed:   true,
          total_hours: elapsedHours,
          max_phase_reached: currentPhase.id,
        })
        .eq('id', activeFast.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      // Recompensas según duración
      const coinsEarned = isComplete ? 20 : 10;
      const xpEarned    = isComplete ? 200 : 100;
      await addCoins(userId, coinsEarned, 'fasting_complete', `Ayuno completado: ${elapsedHours.toFixed(1)}h`);
      await addXP(userId, xpEarned);

      queryClient.invalidateQueries({ queryKey: ['fasting_active'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily_score'] });

      showToast(
        isComplete
          ? `¡Ayuno completado! ${elapsedHours.toFixed(1)}h 🎉 +${coinsEarned} 🪙`
          : `Ayuno de ${elapsedHours.toFixed(1)}h registrado +${coinsEarned} 🪙`,
        'coins'
      );

      if (isOnline) void supabase.rpc('calculate_daily_score', { p_user_id: userId });
    },
    onError: () => showToast('No se pudo completar el ayuno.', 'error'),
  });

  // ─── Abandonar ayuno ─────────────────────────────────────
  const { mutate: abandonFast } = useMutation({
    mutationFn: async () => {
      if (!activeFast?.id) throw new Error('No active fast');
      const { error } = await supabase
        .from('fasting_logs')
        .update({ end_time: new Date().toISOString(), abandoned: true, total_hours: elapsedHours })
        .eq('id', activeFast.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasting_active'] });
      showToast('Ayuno cancelado. ¡El próximo va mejor!', 'info');
    },
  });

  // ─── Historial ────────────────────────────────────────────
  const { data: history = [] } = useQuery({
    queryKey: ['fasting_history', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const { data } = await supabase
        .from('fasting_logs')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled:   !!userId && isOnline,
    staleTime: 5 * 60 * 1000,
  });

  // Stats historial
  const completedFasts  = history.filter(h => h.completed);
  const avgHours        = completedFasts.length
    ? completedFasts.reduce((s, h) => s + (h.total_hours ?? 0), 0) / completedFasts.length
    : 0;
  const longestFast     = completedFasts.length
    ? Math.max(...completedFasts.map(h => h.total_hours ?? 0))
    : 0;

  return {
    activeFast,
    isActive:     !!activeFast,
    isComplete,
    protocol,
    targetHours,
    elapsedSeconds,
    elapsedHours,
    progressPct,
    remainingMs,
    currentPhase,
    nextPhase,
    nextPhaseIn,
    isLoading,
    isStarting,
    isCompleting,
    history,
    completedFasts: completedFasts.length,
    avgHours,
    longestFast,
    startFast,
    completeFast,
    abandonFast,
    refetch,
  };
}

// ─── Helpers de formato ──────────────────────────────────
export function formatFastingTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatFastingTimeShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}