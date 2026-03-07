import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

export interface Supplement {
  id: string;
  name: string;
  dose: number;
  unit: 'mg' | 'g' | 'ml' | 'caps' | 'IU';
  frequency: 'daily' | 'weekly' | 'as_needed';
  reminder_times: string[]; // ['08:00', '20:00']
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

export function useSupplements() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyAdherenceStreak, setDailyAdherenceStreak] = useState(0);
  const [interactionWarnings, setInteractionWarnings] = useState<SupplementInteractionWarning[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchSupplements = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('name');

      if (error) throw error;

      const mapped: Supplement[] = (data ?? []).map((s: any) => ({
        id: s.id,
        name: s.name,
        dose: s.dose,
        unit: s.unit,
        frequency: s.frequency,
        reminder_times: s.reminder_times_json
          ? JSON.parse(s.reminder_times_json)
          : [],
        active: s.active,
      }));

      setSupplements(mapped);

      const names = mapped.map((item) => item.name.toLowerCase());
      const hasIron = names.some((name) => name.includes('hierro') || name.includes('iron'));
      const hasCalcium = names.some((name) => name.includes('calcio') || name.includes('calcium'));

      const warnings: SupplementInteractionWarning[] = [];
      if (hasIron && hasCalcium) {
        warnings.push({
          id: 'iron_calcium',
          message:
            'Hierro + calcio juntos pueden reducir absorcion de hierro. Considera separarlos 2-3 horas (consulta profesional).',
        });
      }
      setInteractionWarnings(warnings);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.fetch" });
    }
  }, [userId]);

  const fetchAdherenceStreak = useCallback(async () => {
    if (!userId) return;
    try {
      const dailySupps = supplements.filter((supplement) => supplement.frequency === 'daily');
      if (!dailySupps.length) {
        setDailyAdherenceStreak(0);
        return;
      }

      const ids = dailySupps.map((item) => item.id);
      const from = new Date();
      from.setDate(from.getDate() - 59);

      const { data, error } = await supabase
        .from('supplement_logs')
        .select('supplement_id, date')
        .eq('user_id', userId)
        .in('supplement_id', ids)
        .gte('date', from.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      const byDate = new Map<string, Set<string>>();
      for (const row of data ?? []) {
        const key = row.date;
        const set = byDate.get(key) ?? new Set<string>();
        set.add(row.supplement_id);
        byDate.set(key, set);
      }

      let streak = 0;
      let cursor = new Date();
      for (let i = 0; i < 60; i += 1) {
        const day = cursor.toISOString().split('T')[0];
        const taken = byDate.get(day);
        const completed = ids.every((id) => taken?.has(id));
        if (!completed) break;
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      setDailyAdherenceStreak(streak);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.fetchAdherenceStreak" });
    }
  }, [supplements, userId]);

  const fetchTodayLogs = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('supplement_logs')
        .select('supplement_id, taken_at, date, supplements(name)')
        .eq('user_id', userId)
        .eq('date', todayStr);

      if (error) throw error;

      const mapped: SupplementLog[] = (data ?? []).map((l: any) => ({
        supplement_id: l.supplement_id,
        supplement_name: l.supplements?.name ?? '—',
        taken_at: l.taken_at,
        date: l.date,
      }));

      setTodayLogs(mapped);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.fetchLogs" });
    } finally {
      setLoading(false);
    }
  }, [userId, todayStr]);

  const markTaken = useCallback(
    async (supplementId: string) => {
      if (!userId) return;
      // Verificar que no esté ya marcado hoy
      const alreadyTaken = todayLogs.some((l) => l.supplement_id === supplementId);
      if (alreadyTaken) return;

      try {
        const { error } = await supabase.from('supplement_logs').insert({
          user_id: userId,
          supplement_id: supplementId,
          taken_at: new Date().toISOString(),
          date: todayStr,
        });
        if (error) throw error;
        await fetchTodayLogs();
        await fetchAdherenceStreak();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.markTaken" });
      }
    },
    [userId, todayLogs, todayStr, fetchTodayLogs, fetchAdherenceStreak],
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
          .eq('date', todayStr);

        if (error) throw error;
        await fetchTodayLogs();
        await fetchAdherenceStreak();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.unmarkTaken" });
      }
    },
    [userId, todayStr, fetchTodayLogs, fetchAdherenceStreak],
  );

  const addSupplement = useCallback(
    async (
      name: string,
      dose: number,
      unit: Supplement['unit'],
      frequency: Supplement['frequency'],
      reminderTimes: string[] = [],
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
          reminder_times_json: JSON.stringify(reminderTimes),
          active: true,
        });
        if (error) throw error;
        await fetchSupplements();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.add" });
      } finally {
        setSaving(false);
      }
    },
    [userId, fetchSupplements],
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
        await fetchSupplements();
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.deactivate" });
      }
    },
    [userId, fetchSupplements],
  );

  // Adherencia de los últimos 30 días por suplemento
  const getAdherence = useCallback(
    async (supplementId: string): Promise<number> => {
      if (!userId) return 0;
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('supplement_logs')
          .select('date')
          .eq('user_id', userId)
          .eq('supplement_id', supplementId)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

        if (error) throw error;
        return Math.round(((data?.length ?? 0) / 30) * 100);
      } catch {
        return 0;
      }
    },
    [userId],
  );

  const isTakenToday = useCallback(
    (supplementId: string) =>
      todayLogs.some((l) => l.supplement_id === supplementId),
    [todayLogs],
  );

  useEffect(() => {
    Promise.all([fetchSupplements(), fetchTodayLogs()]);
  }, []);

  useEffect(() => {
    void fetchAdherenceStreak();
  }, [fetchAdherenceStreak]);

  return {
    supplements,
    todayLogs,
    loading,
    saving,
    dailyAdherenceStreak,
    interactionWarnings,
    getActive: () => supplements.filter((s) => s.active),
    logTaken: markTaken,
    markTaken,
    unmarkTaken,
    addSupplement,
    deactivateSupplement,
    getAdherence,
    isTakenToday,
    refresh: () => Promise.all([fetchSupplements(), fetchTodayLogs()]),
  };
}
