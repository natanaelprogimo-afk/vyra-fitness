import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

export interface Supplement {
  id: string;
  name: string;
  dose: number;
  unit: 'mg' | 'g' | 'ml' | 'caps' | 'IU' | 'tablets' | 'scoops';
  frequency: 'daily' | 'weekly' | 'as_needed';
  reminder_times: string[];
  active: boolean;
}

export interface SupplementLog {
  supplement_id: string;
  supplement_name: string;
  taken_at: string;
  date: string;
}

interface SupplementInteractionWarning {
  id: string;
  message: string;
}

interface SupplementRow {
  id: string;
  name: string;
  dose: number | null;
  unit: Supplement['unit'];
  frequency: Supplement['frequency'];
  reminder_times_json: unknown;
  active: boolean | null;
}

interface SupplementTimeRow {
  supplement_id: string;
  taken_at: string;
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

// NEW: Dosage recommendations by supplement type (basic, adult average)
interface DosageRecommendation {
  dose: number;
  unit: Supplement['unit'];
  frequency: 'daily' | 'weekly' | 'as_needed';
  notes: string;
  cautions?: string;
}

function getSupplementDosageRecommendation(
  supplementName: string,
  bodyWeightKg?: number,
): DosageRecommendation | null {
  const name = supplementName.toLowerCase();
  const weight = bodyWeightKg ?? 70; // default 70kg adult

  const recommendations: Record<string, DosageRecommendation> = {
    'protein': { dose: 20, unit: 'g', frequency: 'daily', notes: 'Post-workout o con comidas' },
    'creatine': { dose: 5, unit: 'g', frequency: 'daily', notes: 'Load 20g/día × 5-7d, then 5g', cautions: 'Hidratate bien' },
    'd3': { dose: 2000, unit: 'IU', frequency: 'daily', notes: 'O 1000 IU si exposición solar' },
    'magnesium': { dose: 400, unit: 'mg', frequency: 'daily', notes: 'Before bed, aids sleep' },
    'omega3': { dose: 2, unit: 'g', frequency: 'daily', notes: 'Con comida grasa' },
    'zinc': { dose: 15, unit: 'mg', frequency: 'daily', notes: 'Lejos de calcio (2-3h)' },
    'iron': { dose: 18, unit: 'mg', frequency: 'daily', notes: 'Mujeres menstruantes, lejos de calcio' },
    'bcaa': { dose: 5, unit: 'g', frequency: 'daily', notes: 'Pre-workout o intra-entreno' },
    'beta-alanine': { dose: 3, unit: 'g', frequency: 'daily', notes: 'Load 3-5g × 2-4 sem' },
    'vitamin b-complex': { dose: 1, unit: 'tablets', frequency: 'daily', notes: 'Con desayuno' },
  };

  for (const [key, rec] of Object.entries(recommendations)) {
    if (name.includes(key)) return rec;
  }

  return null;
}

function getLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getDayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    key: getLocalDateKey(start),
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function parseReminderTimes(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((entry): entry is string => typeof entry === 'string')
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    } catch {
      // Historical rows may already store plain strings like "09:00" or "09:00,21:30".
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }

    return trimmed.includes(':') ? [trimmed] : [];
  }

  return [];
}

function buildInteractionWarnings(items: Supplement[]): SupplementInteractionWarning[] {
  const names = items.map((item) => item.name.toLowerCase());
  const hasIron = names.some((name) => name.includes('hierro') || name.includes('iron'));
  const hasCalcium = names.some((name) => name.includes('calcio') || name.includes('calcium'));
  const hasZinc = names.some((name) => name.includes('zinc'));

  const warnings: SupplementInteractionWarning[] = [];

  if (hasIron && hasCalcium) {
    warnings.push({
      id: 'iron_calcium',
      message:
        'Hierro + calcio juntos pueden reducir la absorción del hierro. Si aplica, separarlos 2-3 horas suele ser más ordenado.',
    });
  }

  if (hasCalcium && hasZinc) {
    warnings.push({
      id: 'calcium_zinc',
      message:
        'Calcio + zinc juntos pueden competir por absorción. Si tu profesional lo avala, separarlos 2 horas suele ser más claro.',
    });
  }

  return warnings;
}

export function useSupplements() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyAdherenceStreak, setDailyAdherenceStreak] = useState(0);
  const [interactionWarnings, setInteractionWarnings] = useState<SupplementInteractionWarning[]>([]);
  const supplementsRef = useRef<Supplement[]>([]);

  const todayBounds = useMemo(() => getDayBounds(), []);

  const fetchSupplements = useCallback(async () => {
    if (!userId) return [] as Supplement[];

    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('name');

      if (error) throw error;

      const mapped: Supplement[] = ((data ?? []) as SupplementRow[]).map((supplement) => ({
        id: supplement.id,
        name: supplement.name,
        dose: Number(supplement.dose ?? 0),
        unit: supplement.unit,
        frequency: supplement.frequency,
        reminder_times: parseReminderTimes(supplement.reminder_times_json),
        active: supplement.active !== false,
      }));

      supplementsRef.current = mapped;
      setSupplements(mapped);
      setInteractionWarnings(buildInteractionWarnings(mapped));
      return mapped;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useSupplements.fetch',
      });
      supplementsRef.current = [];
      setSupplements([]);
      setInteractionWarnings([]);
      return [];
    }
  }, [userId]);

  const fetchAdherenceStreak = useCallback(
    async (sourceSupplements?: Supplement[]) => {
      if (!userId) return;

      try {
        const items = sourceSupplements ?? supplementsRef.current;
        const dailySupplements = items.filter((supplement) => supplement.frequency === 'daily' && supplement.active);

        if (!dailySupplements.length) {
          setDailyAdherenceStreak(0);
          return;
        }

        const ids = dailySupplements.map((item) => item.id);
        const from = new Date();
        from.setDate(from.getDate() - 59);
        const fromBounds = getDayBounds(from);

        const { data, error } = await supabase
          .from('supplement_logs')
          .select('supplement_id, taken_at')
          .eq('user_id', userId)
          .in('supplement_id', ids)
          .gte('taken_at', fromBounds.startIso)
          .order('taken_at', { ascending: false });

        if (error) throw error;

        const byDate = new Map<string, Set<string>>();
        for (const row of (data ?? []) as SupplementTimeRow[]) {
          if (!row.supplement_id) continue;
          const key = getLocalDateKey(new Date(row.taken_at));
          const taken = byDate.get(key) ?? new Set<string>();
          taken.add(row.supplement_id);
          byDate.set(key, taken);
        }

        let streak = 0;
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);

        for (let i = 0; i < 60; i += 1) {
          const key = getLocalDateKey(cursor);
          const taken = byDate.get(key);
          const completed = ids.every((id) => taken?.has(id));
          if (!completed) break;
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        }

        setDailyAdherenceStreak(streak);
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useSupplements.fetchAdherenceStreak',
        });
      }
    },
    [userId]
  );

  const fetchTodayLogs = useCallback(async (sourceSupplements?: Supplement[]) => {
    if (!userId) return [] as SupplementLog[];

    try {
      const items = sourceSupplements ?? supplementsRef.current;
      const namesById = new Map(items.map((item) => [item.id, item.name]));
      const { data, error } = await supabase
        .from('supplement_logs')
        .select('supplement_id, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', todayBounds.startIso)
        .lt('taken_at', todayBounds.endIso);

      if (error) throw error;

      const mapped: SupplementLog[] = ((data ?? []) as SupplementTimeRow[]).map((log) => ({
        supplement_id: log.supplement_id,
        supplement_name: namesById.get(log.supplement_id) ?? '-',
        taken_at: log.taken_at,
        date: getLocalDateKey(new Date(log.taken_at)),
      }));

      setTodayLogs(mapped);
      return mapped;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useSupplements.fetchLogs',
      });
      setTodayLogs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [todayBounds.endIso, todayBounds.startIso, userId]);

  const refresh = useCallback(async () => {
    const nextSupplements = await fetchSupplements();
    setLoading(false);
    void fetchTodayLogs(nextSupplements);
    void fetchAdherenceStreak(nextSupplements);
  }, [fetchAdherenceStreak, fetchSupplements, fetchTodayLogs]);

  const markTaken = useCallback(
    async (supplementId: string) => {
      if (!userId) return;
      if (todayLogs.some((log) => log.supplement_id === supplementId)) return;

      try {
        const { error } = await supabase.from('supplement_logs').insert({
          user_id: userId,
          supplement_id: supplementId,
          taken_at: new Date().toISOString(),
        });

        if (error) throw error;

        await fetchTodayLogs();
        await fetchAdherenceStreak();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useSupplements.markTaken',
        });
      }
    },
    [fetchAdherenceStreak, fetchTodayLogs, todayLogs, userId]
  );

  const unmarkTaken = useCallback(
    async (supplementId: string) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from('supplement_logs')
          .delete()
          .eq('user_id', userId)
          .eq('supplement_id', supplementId)
          .gte('taken_at', todayBounds.startIso)
          .lt('taken_at', todayBounds.endIso);

        if (error) throw error;

        await fetchTodayLogs();
        await fetchAdherenceStreak();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useSupplements.unmarkTaken',
        });
      }
    },
    [fetchAdherenceStreak, fetchTodayLogs, todayBounds.endIso, todayBounds.startIso, userId]
  );

  const addSupplement = useCallback(
    async (
      name: string,
      dose: number,
      unit: Supplement['unit'],
      frequency: Supplement['frequency'],
      reminderTimes: string[] = []
    ) => {
      if (!userId) return;

      setSaving(true);
      try {
        const { error } = await supabase.from('supplements').insert({
          user_id: userId,
          name: name.trim(),
          dose,
          unit,
          frequency,
          reminder_times_json: reminderTimes,
          active: true,
        });

        if (error) throw error;

        await refresh();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useSupplements.add',
        });
      } finally {
        setSaving(false);
      }
    },
    [refresh, userId]
  );

  const deactivateSupplement = useCallback(
    async (supplementId: string) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from('supplements')
          .update({ active: false })
          .eq('id', supplementId)
          .eq('user_id', userId);

        if (error) throw error;

        await refresh();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), {
          action: 'useSupplements.deactivate',
        });
      }
    },
    [refresh, userId]
  );

  const getAdherence = useCallback(
    async (supplementId: string): Promise<number> => {
      if (!userId) return 0;

      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const fromBounds = getDayBounds(thirtyDaysAgo);

        const { data, error } = await supabase
          .from('supplement_logs')
          .select('taken_at')
          .eq('user_id', userId)
          .eq('supplement_id', supplementId)
          .gte('taken_at', fromBounds.startIso);

        if (error) throw error;

        const uniqueDays = new Set(
          ((data ?? []) as SupplementTimeRow[]).map((row) => getLocalDateKey(new Date(row.taken_at)))
        );

        return Math.round((uniqueDays.size / 30) * 100);
      } catch {
        return 0;
      }
    },
    [userId]
  );

  const getWeeklyHistory = useCallback(async (): Promise<Array<{ date: string; completed: boolean }>> => {
    if (!userId) return [];

    try {
      const days = 7;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const keys: string[] = [];
      for (let i = days - 1; i >= 0; i -= 1) {
        const current = new Date(today);
        current.setDate(today.getDate() - i);
        keys.push(getLocalDateKey(current));
      }

      const oldestDay = new Date(today);
      oldestDay.setDate(today.getDate() - (days - 1));
      const oldestBounds = getDayBounds(oldestDay);
      const nextDayBounds = getDayBounds(new Date(today));

      const { data, error } = await supabase
        .from('supplement_logs')
        .select('taken_at')
        .eq('user_id', userId)
        .gte('taken_at', oldestBounds.startIso)
        .lt('taken_at', nextDayBounds.endIso);

      if (error) throw error;

      const present = new Set(
        ((data ?? []) as SupplementTimeRow[]).map((row) => getLocalDateKey(new Date(row.taken_at)))
      );

      return keys.map((key) => ({
        date: key,
        completed: present.has(key),
      }));
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useSupplements.getWeeklyHistory',
      });
      return [];
    }
  }, [userId]);

  const isTakenToday = useCallback(
    (supplementId: string) => todayLogs.some((log) => log.supplement_id === supplementId),
    [todayLogs]
  );

  useEffect(() => {
    if (!userId) {
      supplementsRef.current = [];
      setSupplements([]);
      setTodayLogs([]);
      setDailyAdherenceStreak(0);
      setInteractionWarnings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const loadingGuard = setTimeout(() => {
      setLoading(false);
    }, 2500);
    void refresh();
    return () => {
      clearTimeout(loadingGuard);
    };
  }, [refresh, userId]);

  return {
    supplements,
    todayLogs,
    loading,
    saving,
    dailyAdherenceStreak,
    interactionWarnings,
    getWeeklyHistory,
    getActive: () => supplements.filter((supplement) => supplement.active),
    logTaken: markTaken,
    markTaken,
    unmarkTaken,
    addSupplement,
    deactivateSupplement,
    getAdherence,
    isTakenToday,
    refresh,
    getDosageRecommendation: getSupplementDosageRecommendation,
  };
}
