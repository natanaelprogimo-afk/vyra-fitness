// ============================================================
// VYRA FITNESS — useFasting Hook
// Ayuno intermitente con fases metabólicas, timer en vivo,
// notificaciones de fase, coins por completar
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { addCoins, addXP } from '@/services/supabase/profiles';
import { captureError } from '@/lib/sentry';
import { trackLogCreated } from '@/lib/analytics';
import { todayISO } from '@/utils/dates';
import { decryptSensitiveText } from '@/lib/sensitive-crypto';
import { resolveFemalePhaseFromRecord } from '@/lib/female-phase';

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
  { id: 'digestion',      hours: 0,  emoji: '\u{1F37D}\uFE0F', label: 'Post-comida',    description: 'Digiriendo. Insulina elevada.',                 color: '#FF6B6B' },
  { id: 'glycolysis',     hours: 4,  emoji: '\u23F3', label: 'Ayuno activo',    description: 'Glucogeno empezando a consumirse.',             color: '#FFB347' },
  { id: 'early_ketosis',  hours: 12, emoji: '\u{1F525}', label: 'Cetosis inicial', description: 'El cuerpo empieza a quemar grasa.',             color: '#FFD700' },
  { id: 'autophagy',      hours: 16, emoji: '\u267B\uFE0F', label: 'Autofagia',      description: 'Reciclaje celular activo. Beneficios maximos.', color: '#7BC67E' },
  { id: 'active_ketosis', hours: 18, emoji: '\u{1F9EC}', label: 'Ayuno profundo', description: 'Uso de grasa mas estable y adaptacion alta.',   color: '#4FC3F7' },
  { id: 'ampk_mtor',      hours: 24, emoji: '\u26A1', label: 'Ayuno extendido', description: 'Ventana avanzada. No conviene forzarla siempre.', color: '#CE93D8' },
];

export const PROTOCOLS: Record<string, { label: string; targetHours: number; windowHours: number; description: string }> = {
  '12:12': { label: '12:12', targetHours: 12, windowHours: 12, description: 'Entrada suave para dias de baja recuperacion' },
  '14:10': { label: '14:10', targetHours: 14, windowHours: 10, description: 'Paso intermedio para sostener adherencia' },
  '16:8':  { label: '16:8',  targetHours: 16, windowHours: 8,  description: '16h ayuno, 8h para comer - el mas popular' },
  '18:6':  { label: '18:6',  targetHours: 18, windowHours: 6,  description: '18h ayuno, 6h ventana' },
  '20:4':  { label: '20:4',  targetHours: 20, windowHours: 4,  description: 'Warrior Diet' },
  OMAD:    { label: 'OMAD',  targetHours: 23, windowHours: 1,  description: 'Una comida al dia' },
  '24h':   { label: '24h',   targetHours: 24, windowHours: 0,  description: 'Ayuno de 24 horas' },
  '5:2':   { label: '5:2',   targetHours: 24, windowHours: 0,  description: '5 dias normal + 2 dias con restriccion' },
  custom:  { label: 'Custom',targetHours: 16, windowHours: 8,  description: 'Personalizado' },
};

function normalizeFastingProtocol(value: string | null | undefined): string {
  const normalized = (value ?? '').trim();
  if (!normalized) return '16:8';

  const aliases: Record<string, string> = {
    '16_8': '16:8',
    '18_6': '18:6',
    '20_4': '20:4',
    '5_2': '5:2',
    omad: 'OMAD',
    '23:1': 'OMAD',
  };

  return aliases[normalized] ?? normalized;
}

export const FASTING_TIMER_TASK = 'FASTING_TIMER_TASK';

interface FastingWeightCorrelation {
  postFastAvgDeltaKg: number | null;
  nonFastAvgDeltaKg: number | null;
  samplePostFast: number;
  sampleNonFast: number;
  insight: string | null;
}

interface FastingProtocolSuggestion {
  suggestedProtocol: string | null;
  reason: string | null;
  confidence: 'low' | 'medium' | 'high';
}

type FemaleCyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

interface DailyAdaptiveSuggestion {
  suggestedProtocol: string;
  message: string;
  confidence: 'low' | 'medium' | 'high';
}

function isoDay(value: string): string {
  return value.split('T')[0] ?? value;
}

function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().split('T')[0] ?? day;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

function parseEncryptedNumeric(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeFastingWeightCorrelation(
  fastingHistory: Array<{ completed?: boolean; end_time?: string | null }>,
  weightRows: Array<{ logged_at: string; weight_kg: number }>,
): FastingWeightCorrelation {
  if (weightRows.length < 4) {
    return {
      postFastAvgDeltaKg: null,
      nonFastAvgDeltaKg: null,
      samplePostFast: 0,
      sampleNonFast: 0,
      insight: null,
    };
  }

  const postFastDays = new Set<string>();
  for (const fast of fastingHistory) {
    if (!fast.completed || !fast.end_time) continue;
    const endDay = isoDay(fast.end_time);
    postFastDays.add(addDays(endDay, 1));
  }

  const sortedWeights = [...weightRows].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
  );

  const postFastDeltas: number[] = [];
  const nonFastDeltas: number[] = [];

  for (let i = 1; i < sortedWeights.length; i += 1) {
    const prev = sortedWeights[i - 1];
    const cur = sortedWeights[i];
    const prevDay = isoDay(prev.logged_at);
    const curDay = isoDay(cur.logged_at);
    const isConsecutive = addDays(prevDay, 1) === curDay;
    if (!isConsecutive) continue;

    const delta = Math.round((cur.weight_kg - prev.weight_kg) * 100) / 100;
    if (postFastDays.has(curDay)) {
      postFastDeltas.push(delta);
    } else {
      nonFastDeltas.push(delta);
    }
  }

  const avg = (items: number[]): number | null => {
    if (!items.length) return null;
    return Math.round((items.reduce((sum, item) => sum + item, 0) / items.length) * 100) / 100;
  };

  const postFastAvg = avg(postFastDeltas);
  const nonFastAvg = avg(nonFastDeltas);
  let insight: string | null = null;

  if (postFastAvg !== null && nonFastAvg !== null && postFastDeltas.length >= 2 && nonFastDeltas.length >= 2) {
    const diff = Math.round((postFastAvg - nonFastAvg) * 100) / 100;
    if (diff < -0.05) {
      insight = `Tus dias post-ayuno muestran una variacion de ${postFastAvg}kg vs ${nonFastAvg}kg en dias sin ayuno.`;
    } else if (diff > 0.05) {
      insight = `No se ve baja post-ayuno por ahora (${postFastAvg}kg vs ${nonFastAvg}kg). Ajustemos protocolo y nutricion.`;
    } else {
      insight = `Tu variacion post-ayuno y sin ayuno es similar (${postFastAvg}kg vs ${nonFastAvg}kg).`;
    }
  }

  return {
    postFastAvgDeltaKg: postFastAvg,
    nonFastAvgDeltaKg: nonFastAvg,
    samplePostFast: postFastDeltas.length,
    sampleNonFast: nonFastDeltas.length,
    insight,
  };
}

function protocolTargetHours(protocol: string): number {
  return PROTOCOLS[normalizeFastingProtocol(protocol)]?.targetHours ?? 16;
}

function computeProtocolSuggestion(
  history: Array<{ protocol?: string; completed?: boolean; abandoned?: boolean; total_hours?: number | null }>,
  currentProtocol: string,
  cyclePhase: FemaleCyclePhase | null,
): FastingProtocolSuggestion {
  const recent = history.slice(0, 20);
  if (!recent.length) {
    return {
      suggestedProtocol: null,
      reason: null,
      confidence: 'low',
    };
  }

  const completed = recent.filter((item) => item.completed);
  const abandoned = recent.filter((item) => item.abandoned);
  const currentTarget = protocolTargetHours(currentProtocol);

  if ((cyclePhase === 'luteal' || cyclePhase === 'menstrual') && currentTarget > 16) {
    return {
      suggestedProtocol: '16:8',
      reason: 'En esta fase suele aumentar hambre y fatiga. Te conviene un protocolo mas corto esta semana.',
      confidence: 'high',
    };
  }

  // Abandonos repetidos cerca de 2h antes de la meta => sugerir un paso mas realista.
  const abandonNearLimit = abandoned.filter((item) => {
    const hours = item.total_hours ?? 0;
    return hours > 0 && hours >= currentTarget - 3 && hours <= currentTarget - 1;
  });

  if (abandonNearLimit.length >= 3) {
    if (currentProtocol === '20:4') {
      return {
        suggestedProtocol: '18:6',
        reason: 'Se repiten abandonos cerca del final. Bajemos una etapa para consolidar adherencia.',
        confidence: 'high',
      };
    }
    if (currentProtocol === '18:6') {
      return {
        suggestedProtocol: '16:8',
        reason: 'Tu patron sugiere que una ventana un poco mas flexible puede mejorar continuidad semanal.',
        confidence: 'high',
      };
    }
    if (currentProtocol === '16:8') {
      return {
        suggestedProtocol: '14:10',
        reason: 'Estas quedandote corto de forma repetida. Un protocolo intermedio puede consolidar el habito.',
        confidence: 'high',
      };
    }
  }

  // Si completa facil 16:8 multiples veces, subir intensidad.
  const completedCurrent = completed.filter((item) => item.protocol === currentProtocol);
  if (currentProtocol === '16:8' && completedCurrent.length >= 5) {
    const avgHours = average(completedCurrent.map((item) => item.total_hours ?? 0).filter((h) => h > 0));
    if (avgHours !== null && avgHours >= 16.5) {
      return {
        suggestedProtocol: '18:6',
        reason: 'Completaste varios 16:8 con margen. Ya estas listo para progresar a 18:6.',
        confidence: 'medium',
      };
    }
  }

  return {
    suggestedProtocol: null,
    reason: null,
    confidence: 'low',
  };
}

if (!TaskManager.isTaskDefined(FASTING_TIMER_TASK)) {
  TaskManager.defineTask(FASTING_TIMER_TASK, async () => {
    try {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

async function ensureFastingTaskRegistered() {
  const registered = await TaskManager.isTaskRegisteredAsync(FASTING_TIMER_TASK);
  if (registered) return;

  await BackgroundFetch.registerTaskAsync(FASTING_TIMER_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export function useFasting() {
  const queryClient = useQueryClient();
  const profile     = useAuthStore((s) => s.profile);
  const showToast   = useUIStore((s) => s.showToast);
  const isOnline    = useUIStore((s) => s.isOnline);
  const userId      = profile?.id ?? '';

  useEffect(() => {
    void ensureFastingTaskRegistered();
  }, []);

  // ─── Timer en vivo ───────────────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPhase,   setCurrentPhase]   = useState<FastingPhase>(FASTING_PHASES[0]);
  const [nextPhase,      setNextPhase]       = useState<FastingPhase | null>(FASTING_PHASES[1]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseNotifiedRef = useRef<Set<string>>(new Set());
  const preAutophagyNotifiedRef = useRef(false);

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
        .maybeSingle();
      return data;
    },
    enabled:   !!userId,
    staleTime: 30 * 1000,
  });

  const { data: femaleCyclePhase } = useQuery({
    queryKey: ['fasting_cycle_phase', userId],
    queryFn: async () => {
      if (!userId || !isOnline || !profile?.female_health_enabled) return null;

      const { data } = await supabase
        .from('female_health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const phase = await resolveFemalePhaseFromRecord(data as Record<string, unknown> | null | undefined);
      if (phase === 'menstrual' || phase === 'follicular' || phase === 'ovulation' || phase === 'luteal') {
        return phase as FemaleCyclePhase;
      }
      return null;
    },
    enabled: !!userId && isOnline && Boolean(profile?.female_health_enabled),
    staleTime: 60 * 60 * 1000,
  });

  const { data: dailySignals } = useQuery({
    queryKey: ['fasting_daily_signals', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return null;
      const today = todayISO();
      const [sleepRes, mentalRes] = await Promise.all([
        supabase
          .from('sleep_logs')
          .select('duration_min')
          .eq('user_id', userId)
          .order('end_time', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('mental_checkins')
          .select('*')
          .eq('user_id', userId)
          .eq('check_date', today)
          .maybeSingle(),
      ]);

      const decryptedStress = await decryptSensitiveText(
        typeof mentalRes.data?.stress_encrypted === 'string' ? mentalRes.data.stress_encrypted : null,
      );

      return {
        sleepHours:
          sleepRes.data?.duration_min !== undefined && sleepRes.data?.duration_min !== null
            ? Math.round((Number(sleepRes.data.duration_min) / 60) * 10) / 10
            : null,
        stress:
          decryptedStress !== null
            ? Number(decryptedStress)
            : mentalRes.data?.stress !== undefined && mentalRes.data?.stress !== null
              ? Number(mentalRes.data.stress)
              : null,
      };
    },
    enabled: !!userId && isOnline,
    staleTime: 30 * 60 * 1000,
  });

  const protocol = normalizeFastingProtocol(activeFast?.protocol ?? profile?.fasting_protocol ?? '16:8');
  const targetHours = PROTOCOLS[protocol]?.targetHours ?? 16;

  // ─── Calcular elapsed al montar ──────────────────────────
  useEffect(() => {
    if (!activeFast?.start_time) return;
    const startMs = new Date(activeFast.start_time).getTime();
    const nowSec  = Math.floor((Date.now() - startMs) / 1000);
    setElapsedSeconds(Math.max(0, nowSec));
    updatePhase(Math.max(0, nowSec));
  }, [activeFast?.start_time]);

  // ─── Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeFast) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setElapsedSeconds(0);
      preAutophagyNotifiedRef.current = false;
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
    if (!phaseNotifiedRef.current.has(phase.id) && hours >= phase.hours && phase.hours > 0) {
      phaseNotifiedRef.current.add(phase.id);
      showToast(`${phase.emoji} ${phase.label}`, 'info');
    }

    if (!preAutophagyNotifiedRef.current && hours >= 15.25 && hours < 16) {
      preAutophagyNotifiedRef.current = true;
      showToast('Faltan 45 min para autofagia. Ya llegaste hasta aca, aguanta un poco mas.', 'info');
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
          protocol:   normalizeFastingProtocol(proto),
          start_time: new Date().toISOString(),
          completed:  false,
          abandoned:  false,
          phases_timestamps_json: {},
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
      preAutophagyNotifiedRef.current = false;
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
          total_hours: Math.round(elapsedHours * 100) / 100,
          max_phase_reached: currentPhase.id,
        })
        .eq('id', activeFast.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      // Recompensas según duración
      const coinsEarned = isComplete ? 20 : 10;
      const xpEarned    = isComplete ? 200 : 100;
      // Client-side guard: avoid redundant coin RPCs when already awarded today.
      async function hasTodayFastingCoins(): Promise<boolean> {
        try {
          if (!userId) return false;
          const today = todayISO();
          const { data, error } = await supabase
            .from('coin_transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'fasting_complete')
            .gt('amount', 0)
            .gte('created_at', `${today}T00:00:00Z`)
            .limit(1);
          if (error) return false;
          return (data?.length ?? 0) > 0;
        } catch {
          return false;
        }
      }

      const alreadyGotCoins = await hasTodayFastingCoins();
      if (!alreadyGotCoins && coinsEarned > 0) {
        await addCoins(userId, coinsEarned, 'fasting_complete', `Ayuno completado: ${elapsedHours.toFixed(1)}h`);
      }

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
    mutationFn: async (reason?: string) => {
      if (!activeFast?.id) throw new Error('No active fast');
      const normalizedReason = reason?.trim() || null;
      const { error } = await supabase
        .from('fasting_logs')
        .update({
          end_time: new Date().toISOString(),
          abandoned: true,
          total_hours: elapsedHours,
          notes: normalizedReason ? `break_reason:${normalizedReason}` : activeFast.notes ?? null,
        })
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

  const { data: weightForCorrelation = [] } = useQuery({
    queryKey: ['fasting_weight_correlation', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const from = new Date();
      from.setDate(from.getDate() - 90);
      const { data } = await supabase
        .from('weight_logs')
        .select('logged_at, weight_kg, weight_kg_encrypted')
        .eq('user_id', userId)
        .gte('logged_at', from.toISOString())
        .order('logged_at', { ascending: true });
      const rows = data ?? [];
      return Promise.all(
        rows.map(async (row: any) => {
          const decryptedWeight = parseEncryptedNumeric(
            await decryptSensitiveText(row.weight_kg_encrypted ?? null),
          );
          return {
            logged_at: row.logged_at,
            weight_kg: decryptedWeight ?? Number(row.weight_kg ?? 0),
          };
        }),
      );
    },
    enabled: !!userId && isOnline,
    staleTime: 10 * 60 * 1000,
  });

  // Stats historial
  const completedFasts  = history.filter(h => h.completed);
  const avgHours        = completedFasts.length
    ? completedFasts.reduce((s, h) => s + (h.total_hours ?? 0), 0) / completedFasts.length
    : 0;
  const longestFast     = completedFasts.length
    ? Math.max(...completedFasts.map(h => h.total_hours ?? 0))
    : 0;
  const fastingWeightCorrelation = computeFastingWeightCorrelation(history as any, weightForCorrelation as any);
  const protocolSuggestion = computeProtocolSuggestion(history as any, protocol, (femaleCyclePhase as FemaleCyclePhase | null) ?? null);
  const dailyAdaptiveSuggestion: DailyAdaptiveSuggestion = (() => {
    const sleepHours = dailySignals?.sleepHours ?? null;
    const stress = dailySignals?.stress ?? null;
    const inDemandingPhase = femaleCyclePhase === 'luteal' || femaleCyclePhase === 'menstrual';
    const lowRecovery = (sleepHours !== null && sleepHours < 6.3) || (stress !== null && stress >= 7);
    const veryLowRecovery = (sleepHours !== null && sleepHours < 5.7) || (stress !== null && stress >= 8.5);
    const highReadiness =
      (femaleCyclePhase === 'follicular' || femaleCyclePhase === 'ovulation') &&
      (sleepHours !== null && sleepHours >= 7.2) &&
      (stress === null || stress <= 5.5);

    if ((femaleCyclePhase === 'menstrual' && veryLowRecovery) || veryLowRecovery) {
      const reasonParts: string[] = [];
      if (femaleCyclePhase === 'menstrual') reasonParts.push('fase menstrual');
      if (sleepHours !== null && sleepHours < 5.7) reasonParts.push(`sueno muy bajo (${sleepHours}h)`);
      if (stress !== null && stress >= 8.5) reasonParts.push(`estres muy alto (${stress}/10)`);
      return {
        suggestedProtocol: '12:12',
        confidence: 'high',
        message: `Hoy conviene 12:12 por ${reasonParts.join(' + ')}. El objetivo es sostener el habito sin sumar carga extra.`,
      };
    }

    if ((femaleCyclePhase === 'luteal' && lowRecovery) || (inDemandingPhase && lowRecovery)) {
      const reasonParts: string[] = [];
      if (inDemandingPhase) reasonParts.push('fase con mayor demanda');
      if (sleepHours !== null && sleepHours < 6.3) reasonParts.push(`sueno bajo (${sleepHours}h)`);
      if (stress !== null && stress >= 7) reasonParts.push(`estres alto (${stress}/10)`);
      return {
        suggestedProtocol: '14:10',
        confidence: 'high',
        message: `Hoy conviene 14:10 por ${reasonParts.join(' + ')}. Priorizamos adherencia y recuperacion antes que exigencia.`,
      };
    }

    if (inDemandingPhase) {
      return {
        suggestedProtocol: '16:8',
        confidence: 'medium',
        message: 'En esta fase vale mas sostener un protocolo estable que perseguir horas extra. 16:8 es una buena base hoy.',
      };
    }

    if (highReadiness) {
      return {
        suggestedProtocol: '18:6',
        confidence: 'medium',
        message: 'Tu contexto de hoy permite empujar a 18:6 si te sentis bien durante la manana.',
      };
    }

    return {
      suggestedProtocol: protocol,
      confidence: 'low',
      message: 'Mantene el protocolo actual hoy. Enfocate en consistencia y ruptura de ayuno inteligente.',
    };
  })();
  const cycleAwareNotice =
    femaleCyclePhase === 'menstrual'
      ? 'Fase menstrual: usa 12:12 o 14:10 si el cuerpo pide bajar carga. Recuperacion primero.'
      : femaleCyclePhase === 'luteal'
        ? 'Fase lutea: suele funcionar mejor 14:10 o 16:8 con una ruptura de ayuno mas simple.'
        : femaleCyclePhase === 'follicular'
          ? 'Fase folicular: buena ventana para sostener 16:8 o progresar a 18:6 si dormiste bien.'
      : femaleCyclePhase === 'ovulation'
        ? 'Fase ovulatoria: suele haber buena tolerancia a protocolos estandar si dormis bien.'
        : null;

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
    fastingWeightCorrelation,
    protocolSuggestion,
    dailyAdaptiveSuggestion,
    cycleAwareNotice,
    getCurrentPhase: () => currentPhase,
    endFast: () => completeFast(),
    getHistory: () => history,
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
