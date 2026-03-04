// ============================================================
// VYRA FITNESS — Water Service
// Funciones de acceso a Supabase para módulo de hidratación
// ============================================================

import { supabase } from '@/lib/supabase';
import { todayISO, daysAgoISO } from '@/utils/dates';

export async function fetchTodayWaterTotal(userId: string): Promise<number> {
  const { data } = await supabase
    .from('water_logs')
    .select('hydration_equivalent_ml')
    .eq('user_id', userId)
    .gte('logged_at', `${todayISO()}T00:00:00`);

  return (data ?? []).reduce((s, r) => s + (r.hydration_equivalent_ml ?? 0), 0);
}

export async function fetchWeeklyWaterData(
  userId: string
): Promise<Array<{ date: string; total: number }>> {
  const { data } = await supabase
    .from('water_logs')
    .select('logged_at, hydration_equivalent_ml')
    .eq('user_id', userId)
    .gte('logged_at', `${daysAgoISO(6)}T00:00:00`)
    .order('logged_at');

  const map: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().split('T')[0]] = 0;
  }

  for (const row of data ?? []) {
    const date = row.logged_at.split('T')[0];
    if (date in map) map[date] = (map[date] ?? 0) + row.hydration_equivalent_ml;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

export async function logWaterEntry(
  userId:   string,
  amountMl: number,
  drinkType:string,
  hydrationEquivalentMl: number
): Promise<string> {
  const { data, error } = await supabase
    .from('water_logs')
    .insert({
      user_id:                 userId,
      amount_ml:               amountMl,
      drink_type:              drinkType,
      hydration_equivalent_ml: hydrationEquivalentMl,
      logged_at:               new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteWaterEntry(logId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('water_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) throw error;
}