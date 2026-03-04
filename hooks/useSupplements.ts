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

export function useSupplements() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.fetch" });
    }
  }, [userId]);

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
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.markTaken" });
      }
    },
    [userId, todayLogs, todayStr, fetchTodayLogs],
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
      } catch (err) {
        captureError(err instanceof Error ? err : new Error(String(err)), { action: "useSupplements.unmarkTaken" });
      }
    },
    [userId, todayStr, fetchTodayLogs],
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

  return {
    supplements,
    todayLogs,
    loading,
    saving,
    markTaken,
    unmarkTaken,
    addSupplement,
    deactivateSupplement,
    getAdherence,
    isTakenToday,
    refresh: () => Promise.all([fetchSupplements(), fetchTodayLogs()]),
  };
}


