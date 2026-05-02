// ============================================================
// VYRA FITNESS — useFasting Hook
// Ayuno intermitente con fases metabólicas, timer en vivo
// y notificaciones de fase.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { supabase } from '@/lib/supabase';
import type {
  FastingSession,
  StartFastPayload,
  StartFastOptions,
  FastingSessionStatus,
  FiveTwoWeekSummary,
} from '@/lib/fasting-types';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { trackLogCreated } from '@/lib/analytics';
import { todayISO } from '@/utils/dates';
import { decryptSensitiveText } from '@/lib/sensitive-crypto';
import { resolveFemalePhaseFromRecord } from '@/lib/female-phase';
import { loadFastingSettings, type FastingSettings } from '@/lib/fasting-settings';

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
  '12:12': { label: '12:12', targetHours: 12, windowHours: 12, description: 'Entrada suave para días de baja recuperación' },
  '14:10': { label: '14:10', targetHours: 14, windowHours: 10, description: 'Paso intermedio para sostener adherencia' },
  '16:8':  { label: '16:8',  targetHours: 16, windowHours: 8,  description: '16h ayuno, 8h para comer — el más popular' },
  '18:6':  { label: '18:6',  targetHours: 18, windowHours: 6,  description: '18h ayuno, 6h ventana' },
  '20:4':  { label: '20:4',  targetHours: 20, windowHours: 4,  description: 'Warrior Diet' },
  '23:1':  { label: '23:1',  targetHours: 23, windowHours: 1,  description: 'OMAD — una comida al día' },
  // Support alternative keys used in the UI (OMAD, 24h, 5:2)
  OMAD:    { label: 'OMAD',   targetHours: 23, windowHours: 1,  description: 'Una comida al día (OMAD)' },
  '24h':   { label: '24h',    targetHours: 24, windowHours: 0,  description: 'Ayuno completo de 24 horas.' },
  '5:2':   { label: '5:2',    targetHours: 24, windowHours: 0,  description: 'Día de restricción (5:2 protocol)' },
  'custom':{ label: 'Custom', targetHours: 16, windowHours: 8,  description: 'Personalizado' },
};

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

interface WeightCorrelationRow {
  logged_at: string;
  weight_kg: number;
}

interface RemoteWeightRow {
  logged_at: string;
  weight_kg: number | null;
  weight_kg_encrypted: string | null;
}

interface FastingHistoryRow {
  id?: string;
  status?: FastingSessionStatus | 'normal' | null;
  completed?: boolean;
  abandoned?: boolean; // legacy, kept for backward compatibility
  total_hours?: number | null;
  end_time?: string | null;
  start_time?: string | null;
  protocol?: string | null;
  phases_timestamps_json?: string | null;
  notes?: string | null;
}

// Removed legacy `FastingLogRecord` alias — use `FastingHistoryRow` or
// the new `FastingSession` types from `lib/fasting-types` instead.

const FASTING_REQUEST_TIMEOUT_MS = 8000;

const PHASE_TO_DB_PHASE: Record<string, string> = {
  fed: 'digestion',
  fasting: 'glycolysis',
  ketosis: 'early_ketosis',
  autophagy: 'autophagy',
  deep: 'active_ketosis',
  extended: 'ampk_mtor',
};

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

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race<T | null>([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function fetchLatestActiveFast(userId: string): Promise<FastingSession | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('fasting_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as FastingSession | null) ?? null;
}

function wouldOverlap(
  existingSessions: FastingSession[],
  newStart: Date,
  targetDuration: number,
): boolean {
  const newEnd = new Date(newStart.getTime() + targetDuration * 1000);
  return existingSessions.some((s) => {
    if (s.status !== 'active') return false;
    if (!s.start_time) return false;
    const sStart = new Date(s.start_time);
    const sEnd = new Date(sStart.getTime() + (s.target_duration ?? 0) * 1000);
    return newStart < sEnd && newEnd > sStart;
  });
}


function resolveStoredPhase(phaseId: string) {
  return PHASE_TO_DB_PHASE[phaseId] ?? 'digestion';
}

function normalizeFastingError(error: unknown, fallback: string) {
  const message = String((error as { message?: unknown })?.message ?? '').trim();
  if (!message) return fallback;
  if (message.toLowerCase().includes('timeout')) {
    return 'La solicitud tardo demasiado. Reintenta en unos segundos.';
  }
  return message;
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
      insight = `Tus días post-ayuno muestran una variacion de ${postFastAvg}kg vs ${nonFastAvg}kg en días sin ayuno.`;
    } else if (diff > 0.05) {
      insight = `No se ve baja post-ayuno por ahora (${postFastAvg}kg vs ${nonFastAvg}kg). Ajustemos protocolo y nutrición.`;
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
  return PROTOCOLS[protocol]?.targetHours ?? 16;
}

function computeProtocolSuggestion(
  history: Array<{ protocol?: string | null; completed?: boolean; abandoned?: boolean; total_hours?: number | null }>,
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

  const completed = recent.filter(
    (item) => (item as unknown as { status?: string | null }).status === 'completed' || item.completed === true,
  );
  const abandoned = recent.filter(
    (item) => (item as unknown as { status?: string | null }).status === 'interrupted' || item.abandoned === true,
  );
  const currentTarget = protocolTargetHours(currentProtocol);

  if ((cyclePhase === 'luteal' || cyclePhase === 'menstrual') && currentTarget > 16) {
    return {
      suggestedProtocol: '16:8',
      reason: 'En esta fase suele aumentar hambre y fatiga. Te conviene un protocolo más corto esta semana.',
      confidence: 'high',
    };
  }

  // Abandonos repetidos cerca de 2h antes de la meta => sugerir un paso más realista.
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
        reason: 'Tu patron sugiere que una ventana un poco más flexible puede mejorar continuidad semanal.',
        confidence: 'high',
      };
    }
    if (currentProtocol === '16:8') {
      return {
        suggestedProtocol: '14:10',
        reason: 'Estás quedándote corto de forma repetida. Un protocolo intermedio puede consolidar el hábito.',
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
        reason: 'Completaste varios 16:8 con margen. Ya estás listo para progresar a 18:6.',
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

  // Fasting settings (local): used to support 5:2 scheduled auto-start
  const [fastingSettings, setFastingSettings] = useState<FastingSettings | null>(null);
  const lastFiveTwoAutoRef = useRef<string | null>(null); // YYYY-MM-DD when we last attempted auto-start

  useEffect(() => {
    void ensureFastingTaskRegistered();
  }, []);

  // Load fasting settings from local storage
  useEffect(() => {
    let mounted = true;
    void loadFastingSettings().then((s) => {
      if (!mounted) return;
      setFastingSettings(s);
    }).catch((e) => {
      console.debug?.('[useFasting] loadFastingSettings failed', e);
      if (!mounted) return;
      setFastingSettings(null);
    });
    return () => { mounted = false; };
  }, []);

  // NOTE: auto-start effect for 5:2 is attached after `startFast` is defined below

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
    queryFn:  async () => fetchLatestActiveFast(userId),
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
            ?  Math.round((Number(sleepRes.data.duration_min) / 60) * 10) / 10
            : null,
        stress:
          decryptedStress !== null
            ?  Number(decryptedStress)
            : mentalRes.data?.stress !== undefined && mentalRes.data?.stress !== null
              ?  Number(mentalRes.data.stress)
              : null,
      };
    },
    enabled: !!userId && isOnline,
    staleTime: 30 * 60 * 1000,
  });

  const protocol = activeFast?.protocol ?? profile?.fasting_protocol ?? '16:8';
  const targetHours = PROTOCOLS[protocol]?.targetHours ?? 16;

  // Debug: ayuda a verificar en runtime qué protocolo y objetivo de horas se está usando.
  // El log es intencionalmente ligero y puede eliminarse tras la verificación en el emulador.
  useEffect(() => {
    try {
      console.debug?.('[useFasting] protocol:', protocol, 'targetHours:', targetHours, {
        activeFastProtocol: activeFast?.protocol ?? null,
        profileFastingProtocol: profile?.fasting_protocol ?? null,
      });
    } catch {
      // Log unexpected errors while attempting to debug-print runtime info
      // eslint-disable-next-line no-console
      console.debug?.('[useFasting] debug log failed');
    }
  }, [protocol, targetHours, activeFast?.protocol, profile?.fasting_protocol]);

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
    if (!phaseNotifiedRef.current.has(phase.id) && hours >= phase.hours && phase.id !== 'fed') {
      phaseNotifiedRef.current.add(phase.id);
      showToast(`${phase.emoji} ${phase.label}`, 'info');
    }

    if (!preAutophagyNotifiedRef.current && hours >= 15.25 && hours < 16) {
      preAutophagyNotifiedRef.current = true;
      showToast('Faltan 45 min para autofagia. Ya llegaste hasta aca, aguanta un poco más.', 'info');
    }
  };

  // ─── Métricas derivadas ──────────────────────────────────
  const elapsedHours   = elapsedSeconds / 3600;
  const progressPct    = Math.min(100, (elapsedHours / targetHours) * 100);
  const remainingMs    = Math.max(0, (targetHours * 3600 - elapsedSeconds) * 1000);
  const isComplete     = elapsedHours >= targetHours;

  // Tiempo para la siguiente fase
  const nextPhaseIn = nextPhase
    ?  Math.max(0, nextPhase.hours * 3600 - elapsedSeconds)
    : null;

  // ─── Iniciar ayuno ────────────────────────────────────────
  type StartFastVars = StartFastPayload;

  const { mutate: startFastMutate, isPending: isStarting } = useMutation<FastingSession, Error, StartFastVars>({
    mutationFn: async (input: StartFastVars) => {
      if (!userId) throw new Error('No user');

      const proto = input?.protocol ?? '16:8';
      const startTimeIso = input?.startTime
        ? (typeof input.startTime === 'string' ? new Date(input.startTime).toISOString() : new Date(input.startTime).toISOString())
        : new Date().toISOString();
      const targetHours = protocolTargetHours(proto);
      const targetDuration = targetHours * 3600;

      // Quick client-side check: fetch any active/planned sessions and detect obvious overlap
      try {
        const localRes = await supabase
          .from('fasting_sessions')
          .select('id, start_time, target_duration, status')
          .eq('user_id', userId)
          .in('status', ['active', 'planned']);
        const localSessions = (localRes.data ?? []) as FastingSession[];
        if (wouldOverlap(localSessions, new Date(startTimeIso), targetDuration)) {
          const overlapsActive = localSessions.some((s) => s.status === 'active');
          throw new Error(overlapsActive ? 'already_active' : 'overlap');
        }
      } catch (e) {
        // non-fatal local check failures should not block server-side guard, continue to RPC
        console.debug?.('[useFasting] local overlap check failed', e);
      }

      // RPC overlap check (server-side authoritative) with timeout
      try {
        type CheckRpc = { data?: boolean | null; error?: unknown };

        const rpcPromise = (async (): Promise<CheckRpc> => {
          const { data, error } = await supabase.rpc('check_no_overlapping_fast', {
            p_user_id: userId,
            p_start: startTimeIso,
            p_target: targetDuration,
          });
          return { data, error };
        })();

        const rpc = await withTimeout(rpcPromise, FASTING_REQUEST_TIMEOUT_MS);

        if (rpc === null) {
          // Timeout
          throw new Error('rpc_timeout');
        }

        if (rpc.error) throw rpc.error;
        const canStart = rpc.data ?? true;
        if (!canStart) throw new Error('overlap');
      } catch (e) {
        throw e instanceof Error ? e : new Error(String(e));
      }

      // If sessionId is present, activate a planned session
      if (input?.sessionId) {
        const { data, error } = await supabase
          .from('fasting_sessions')
          .update({ status: 'active', start_time: startTimeIso, updated_at: new Date().toISOString() })
          .eq('id', input.sessionId)
          .eq('status', 'planned')
          .select()
          .single();
        if (error) throw error;
        return data as FastingSession;
      }

      // Otherwise insert a new session
      const protocolType: 'daily' | 'weekly' = proto === '5:2' ? 'weekly' : 'daily';
      const scheduledDate = protocolType === 'weekly' ? startTimeIso.split('T')[0] : null;

      const insert = await supabase
        .from('fasting_sessions')
        .insert({
          user_id: userId,
          protocol: proto,
          protocol_type: protocolType,
          start_time: startTimeIso,
          target_duration: targetDuration,
          status: 'active',
          scheduled_date: scheduledDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insert.error) throw insert.error;
      return insert.data as FastingSession;
    },
    onSuccess: (row, vars) => {
      try {
        console.debug?.('[useFasting] startFast:onSuccess', { insertedRow: row ?? null, mutationVars: vars ?? null });
      } catch (e) {
        console.debug?.('[useFasting] startFast:onSuccess logging failed', e);
      }
      const protoLabel = vars?.protocol ?? 'ayuno';
      queryClient.setQueryData(['fasting_active', userId], row);
      queryClient.invalidateQueries({ queryKey: ['fasting_active'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['fasting_history'] });
      phaseNotifiedRef.current.clear();
      preAutophagyNotifiedRef.current = false;
      showToast(`Ayuno ${protoLabel} iniciado 💪`, 'success');
      trackLogCreated('fasting', 'manual', Date.now());
    },
    onError: (error) => {
      try { console.debug?.('[useFasting] startFast:onError', { error }); } catch (e) {
        console.warn('[useFasting] startFast:onError logging failed', e);
      }
      if ((error as Error).message === 'already_active') {
        showToast('Ya hay un ayuno en curso.', 'info');
        return;
      }
      if ((error as Error).message === 'overlap') {
        showToast('El horario se solapa con un ayuno previo.', 'warning');
        return;
      }
      showToast(normalizeFastingError(error, 'No se pudo iniciar el ayuno.'), 'error');
    },
  });

  // Wrapper to keep API stable: startFast(payload, opts?)
  const startFast = (payload: StartFastPayload, opts?: StartFastOptions) => {
    // useMutation's mutate accepts an options object with onSuccess/onError
    startFastMutate(payload, { onSuccess: opts?.onSuccess, onError: opts?.onError });
  };

  // ─── Completar ayuno ─────────────────────────────────────
  const { mutate: completeFast, isPending: isCompleting } = useMutation({
    mutationFn: async () => {
      if (!activeFast?.id || !userId) throw new Error('No active fast');
      const actualDuration = Math.floor(elapsedSeconds);
      const { error } = await supabase
        .from('fasting_sessions')
        .update({
          end_time:    new Date().toISOString(),
          status:      'completed',
          actual_duration: actualDuration,
          max_phase_reached: resolveStoredPhase(currentPhase.id),
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeFast.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.setQueryData(['fasting_active', userId], null);
      queryClient.invalidateQueries({ queryKey: ['fasting_active'] });
      queryClient.invalidateQueries({ queryKey: ['today_summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily_score'] });
      queryClient.invalidateQueries({ queryKey: ['fasting_history'] });

      showToast(
        isComplete
          ? `Ayuno completado: ${elapsedHours.toFixed(1)}h.`
          : `Ayuno de ${elapsedHours.toFixed(1)}h registrado.`,
        'success'
      );

      if (isOnline) void supabase.rpc('calculate_daily_score', { p_user_id: userId });
    },
    onError: (error) => showToast(normalizeFastingError(error, 'No se pudo completar el ayuno.'), 'error'),
  });

  // ─── Abandonar ayuno ─────────────────────────────────────
  const { mutate: abandonFastMutate } = useMutation<void, Error, string | undefined>({
    mutationFn: async (reason?: string) => {
      if (!activeFast?.id) throw new Error('No active fast');
      const normalizedReason = reason?.trim() || null;
      const actualDuration = Math.floor(elapsedSeconds);
        const { error } = await supabase
        .from('fasting_sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'interrupted',
          actual_duration: actualDuration,
          notes: normalizedReason ? `break_reason:${normalizedReason}` : activeFast.notes ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeFast.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasting_active'] });
      showToast('Ayuno cancelado. ¡El próximo va mejor!', 'info');
    },
  });

  // Wrapper so callers can invoke without arguments (`abandonFast()`) or with a reason string.
  const abandonFast = (reason?: string) => {
    return abandonFastMutate(reason as string | undefined);
  };

  // ─── Eliminar ayuno ─────────────────────────────────────
  const { mutate: deleteFastMutate, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('No user');
      if (!id) throw new Error('No id');
      // Prevent deleting an active fast
      const selRes = await supabase
        .from('fasting_sessions')
        .select('id, start_time, end_time, status')
        .eq('id', id)
        .maybeSingle();

      const row = selRes.data as FastingSession | null;
      const selError = selRes.error;

      if (selError) throw selError;

      if (row && row.status === 'active') {
        throw new Error('cannot_delete_active');
      }

      const { error } = await supabase.from('fasting_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasting_history'] });
      queryClient.invalidateQueries({ queryKey: ['fasting_active'] });
      showToast('Ayuno eliminado', 'info');
    },
    onError: (error) => {
      if ((error as Error).message === 'cannot_delete_active') {
        showToast('No se puede eliminar un ayuno activo.', 'error');
        return;
      }
      showToast(normalizeFastingError(error, 'No se pudo eliminar el ayuno.'), 'error');
    },
  });

  const deleteFast = (id: string) => deleteFastMutate(id);

  // Auto-start 5:2 logic: when enabled, check once a minute while app is active
  useEffect(() => {
    if (!fastingSettings || !fastingSettings.fiveTwoAutoStart) return undefined;
    if (!Array.isArray(fastingSettings.fiveTwoDays) || fastingSettings.fiveTwoDays.length === 0) return undefined;

    let mounted = true;
    const checkAndMaybeStart = () => {
      try {
        if (!mounted) return;
        const now = new Date();
        const today = now.getDay(); // 0=Sun..6=Sat
        if (!fastingSettings.fiveTwoDays.includes(today)) return;

        const startTime = fastingSettings.fiveTwoStartTime;
        if (!startTime) return;
        const parts = startTime.split(':');
        if (parts.length !== 2) return;
        const hour = Number(parts[0]);
        const minute = Number(parts[1]);
        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return;

        const scheduled = new Date(now);
        scheduled.setHours(hour, minute, 0, 0);

        const scheduledDay = scheduled.toISOString().split('T')[0];
        if (lastFiveTwoAutoRef.current === scheduledDay) return; // already attempted today

        // Allow a small window: start if now >= scheduled and within 30 minutes after
        const diffMs = now.getTime() - scheduled.getTime();
          if (diffMs >= 0 && diffMs <= 30 * 60 * 1000) {
          // Attempt to auto-start
          lastFiveTwoAutoRef.current = scheduledDay;
          showToast('Iniciando ayuno 5:2 programado...', 'info');
          try {
            startFast({ protocol: '5:2', startTime: scheduled.toISOString() } as StartFastPayload, {
              onSuccess: () => {
                showToast('Ayuno 5:2 iniciado según tu horario.', 'success');
              },
              onError: (err) => {
                console.debug?.('[useFasting] 5:2 auto-start error', err?.message ?? err);
              }
            });
          } catch (e) {
            console.debug?.('[useFasting] auto-start exception', e);
          }
        }
      } catch (e) {
        // Log failure to avoid silent swallow of errors during auto-start checks
        // eslint-disable-next-line no-console
        console.debug?.('[useFasting] checkAndMaybeStart failed', e);
      }
    };

    // Run immediately and then every minute
    checkAndMaybeStart();
    const id = setInterval(checkAndMaybeStart, 60 * 1000);
    return () => { mounted = false; clearInterval(id); };
  }, [fastingSettings, startFast, showToast]);

  // ─── Historial ────────────────────────────────────────────
  const { data: history = [] } = useQuery({
    queryKey: ['fasting_history', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return [];
      const { data } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(50);
      const rows = (data ?? []) as FastingSession[];
      // derive total_hours for compatibility
      return rows.map((r) => ({ ...r, total_hours: r.actual_duration ? (r.actual_duration / 3600) : null }));
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
        (rows as RemoteWeightRow[]).map(async (row) => {
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
  const completedFasts  = (history as unknown as Array<{ status?: string; total_hours?: number }>).filter(h => h.status === 'completed');
  const avgHours        = completedFasts.length
    ?  completedFasts.reduce((s, h) => s + (h.total_hours ?? 0), 0) / completedFasts.length
    : 0;
  const longestFast     = completedFasts.length
    ?  Math.max(...completedFasts.map(h => h.total_hours ?? 0))
    : 0;
  const fastingStreakDays = (() => {
    if (!history || !history.length) return 0;
    let streak = 0;
    let prevDay: string | null = null;
    for (const item of history as FastingSession[]) {
      if (item.status !== 'completed') continue;
      const day = isoDay(item.end_time ?? item.start_time ?? '');
      if (!day) continue;
      if (streak === 0) {
        streak = 1;
        prevDay = day;
      } else {
        const expected = addDays(prevDay!, -1);
        if (day === expected) {
          streak += 1;
          prevDay = day;
        } else {
          break;
        }
      }
    }
    return streak;
  })();
  const fastingHistoryRows = history as FastingHistoryRow[];
  const correlationRows = weightForCorrelation as WeightCorrelationRow[];
  const fastingWeightCorrelation = computeFastingWeightCorrelation(fastingHistoryRows, correlationRows);
  const protocolSuggestion = computeProtocolSuggestion(
    fastingHistoryRows,
    protocol,
    (femaleCyclePhase as FemaleCyclePhase | null) ?? null
  );
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
      if (sleepHours !== null && sleepHours < 5.7) reasonParts.push(`sueño muy bajo (${sleepHours}h)`);
      if (stress !== null && stress >= 8.5) reasonParts.push(`estrés muy alto (${stress}/10)`);
      return {
        suggestedProtocol: '12:12',
        confidence: 'high',
        message: `Hoy conviene 12:12 por ${reasonParts.join(' + ')}. El objetivo es sostener el hábito sin sumar carga extra.`,
      };
    }

    if ((femaleCyclePhase === 'luteal' && lowRecovery) || (inDemandingPhase && lowRecovery)) {
      const reasonParts: string[] = [];
      if (inDemandingPhase) reasonParts.push('fase con mayor demanda');
      if (sleepHours !== null && sleepHours < 6.3) reasonParts.push(`sueño bajo (${sleepHours}h)`);
      if (stress !== null && stress >= 7) reasonParts.push(`estrés alto (${stress}/10)`);
      return {
        suggestedProtocol: '14:10',
        confidence: 'high',
        message: `Hoy conviene 14:10 por ${reasonParts.join(' + ')}. Priorizamos adherencia y recuperación antes que exigencia.`,
      };
    }

    if (inDemandingPhase) {
      return {
        suggestedProtocol: '16:8',
        confidence: 'medium',
        message: 'En esta fase vale más sostener un protocolo estable que perseguir horas extra. 16:8 es una buena base hoy.',
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
      message: 'Mantené el protocolo actual hoy. Enfócate en consistencia y ruptura de ayuno inteligente.',
    };
  })();
  const cycleAwareNotice =
    femaleCyclePhase === 'menstrual'
      ? 'Fase menstrual: usa 12:12 o 14:10 si el cuerpo pide bajar carga. Recuperación primero.'
      : femaleCyclePhase === 'luteal'
        ? 'Fase lutea: suele funcionar mejor 14:10 o 16:8 con una ruptura de ayuno más simple.'
        : femaleCyclePhase === 'follicular'
          ? 'Fase folicular: buena ventana para sostener 16:8 o progresar a 18:6 si dormiste bien.'
      : femaleCyclePhase === 'ovulation'
        ? 'Fase ovulatoria: suele haber buena tolerancia a protocolos estándar si dormis bien.'
        : null;

  // Fetch planned 5:2 for today
  const { data: plannedToday } = useQuery({
    queryKey: ['fasting_planned_today', userId],
    queryFn: async () => {
      if (!userId || !isOnline) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('protocol_type', 'weekly')
        .eq('scheduled_date', today)
        .eq('status', 'planned')
        .maybeSingle();
      if (error) return null;
      return (data as FastingSession | null) ?? null;
    },
    enabled: !!userId && isOnline,
    staleTime: 60 * 1000,
  });

  const isFiveTwoDay = (() => {
    try {
      if (!fastingSettings || !Array.isArray(fastingSettings.fiveTwoDays)) return false;
      const today = new Date().getDay();
      return fastingSettings.fiveTwoDays.includes(today);
    } catch {
      return false;
    }
  })();

  const fiveTwoWeekSummary: FiveTwoWeekSummary | null = (() => {
    try {
      if (!history || !history.length) return null;
      const now = new Date();
      const week = (() => {
        // ISO week number
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return { weekNo, year: d.getUTCFullYear() };
      })();

      const weekly = (history as FastingSession[]).filter((s) => s.protocol_type === 'weekly' && s.week_number === week.weekNo && s.year === week.year);
      if (!weekly.length) return null;
      const daysMap = new Map<string, { status: FastingSessionStatus | 'normal' | null; hours: number | null }>();
      for (const s of weekly) {
        const day = s.scheduled_date ?? (s.start_time ? s.start_time.split('T')[0] : null);
        if (!day) continue;
        daysMap.set(day, { status: s.status, hours: s.actual_duration ? Math.round((s.actual_duration / 3600) * 100) / 100 : null });
      }
      const days = Array.from(daysMap.entries()).map(([date, info]) => ({ date, status: info.status ?? 'normal', hours: info.hours }));
      const completedDays = days.filter((d) => d.status === 'completed').length;
      return {
        weekNumber: week.weekNo,
        year: week.year,
        days,
        completedDays,
        targetDays: 2,
      };
    } catch {
      return null;
    }
  })();

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
    fastingStreakDays,
    fastingWeightCorrelation,
    protocolSuggestion,
    breakPlan: null,
    refuelPlan: null,
    dailyAdaptiveSuggestion,
    cycleAwareNotice,
    getCurrentPhase: () => currentPhase,
    endFast: () => completeFast(),
    getHistory: () => history,
    startFast,
    completeFast,
    abandonFast,
    deleteFast,
    isDeleting,
    refetch,
    plannedToday,
    isFiveTwoDay,
    fiveTwoWeekSummary,
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
