import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

export interface FemaleHealthEntry {
  id: string;
  user_id: string;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  symptoms?: string[];
  notes?: string;
  logged_at: string;
}

export function useFemaleHealth() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  const [cycleLength, setCycleLength]       = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<string | null>(null);
  const [history, setHistory]               = useState<FemaleHealthEntry[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isLogging, setIsLogging]           = useState(false);

  // Calcular fase actual basada en última menstruación
  const calculatePhase = useCallback((lastDate: string): {
    phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    daysInPhase: number;
    nextPeriodDate: string | null;
  } => {
    const lastDateObj = new Date(lastDate);
    const now = new Date();
    const daysSinceLastPeriod = Math.floor((now.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = daysSinceLastPeriod % cycleLength;

    let phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    if (dayInCycle < 5) {
      phase = 'menstrual';
    } else if (dayInCycle < 13) {
      phase = 'follicular';
    } else if (dayInCycle < 16) {
      phase = 'ovulation';
    } else {
      phase = 'luteal';
    }

    // Calcular próxima menstruación
    const nextPeriod = new Date(lastDateObj);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength - dayInCycle);

    return {
      phase,
      daysInPhase: dayInCycle,
      nextPeriodDate: nextPeriod.toISOString().split('T')[0],
    };
  }, [cycleLength]);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      // Obtener settings del perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('female_cycle_length, female_last_period_date')
        .eq('id', userId)
        .single();

      if (profile) {
        setCycleLength(profile.female_cycle_length ?? 28);
        setLastPeriodDate(profile.female_last_period_date ?? null);
      }

      // Obtener historial
      const { data: entries, error: entriesError } = await supabase
        .from('female_health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(30);

      if (entriesError) throw entriesError;
      setHistory(entries ?? []);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useFemaleHealth.fetchData" });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const log = useCallback(async (
    phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal',
    symptoms?: string[],
    notes?: string,
  ) => {
    if (!userId) return;
    setIsLogging(true);
    try {
      const { error } = await supabase
        .from('female_health_logs')
        .insert({
          user_id: userId,
          phase,
          symptoms: symptoms || [],
          notes: notes || null,
          logged_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchData();
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useFemaleHealth.log" });
    } finally {
      setIsLogging(false);
    }
  }, [userId, fetchData]);

  const updateSymptoms = useCallback(async (symptoms: string[]) => {
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('female_health_logs')
        .update({ symptoms })
        .eq('user_id', userId)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useFemaleHealth.updateSymptoms" });
    }
  }, [userId, fetchData]);

  useEffect(() => {
    fetchData();
  }, []);

  const { phase, daysInPhase, nextPeriodDate } = lastPeriodDate
    ? calculatePhase(lastPeriodDate)
    : { phase: 'follicular' as const, daysInPhase: 0, nextPeriodDate: null };

  return {
    cycleLength,
    lastPeriodDate,
    currentPhase: phase,
    daysInPhase,
    nextPeriodDate,
    history,
    isLoading,
    isLogging,
    log,
    updateSymptoms,
    isInCycle: !!lastPeriodDate,
  };
}



