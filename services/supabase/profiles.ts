// ============================================================
// VYRA FITNESS — Profile Service
// CRUD de perfil, coins, XP, streak
// ============================================================

import { supabase } from '@/lib/supabase';
import type { UserProfile, UserProfileUpdate } from '@/types/user';
import type { XpResult } from '@/types/api';

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) { console.error('[Profile] fetchProfile:', error.message); return null; }
  return data;
}

export async function updateProfile(userId: string, updates: UserProfileUpdate): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) { console.error('[Profile] updateProfile:', error.message); return false; }
  return true;
}

/**
 * Sumar VyraCoins via función SQL atómica (respeta tope de 200/día).
 * Retorna el nuevo balance o null si falla.
 */
export async function addCoins(
  userId: string,
  amount: number,
  type:   string,
  description?: string
): Promise<number | null> {
  const { data, error } = await supabase
    .rpc('increment_coins', { p_user_id: userId, p_amount: amount, p_type: type, p_description: description ?? '' });
  if (error) { console.error('[Coins] addCoins:', error.message); return null; }
  return data as number;
}

/**
 * Sumar XP via función SQL. Retorna {new_xp, new_level, leveled_up}.
 */
export async function addXP(userId: string, xp: number): Promise<XpResult | null> {
  const { data, error } = await supabase
    .rpc('increment_xp', { p_user_id: userId, p_xp: xp });
  if (error) { console.error('[XP] addXP:', error.message); return null; }
  return data as XpResult;
}

/**
 * Calcular y guardar el Daily Score para hoy.
 * Llama a la función SQL calculate_daily_score().
 */
export async function recalculateDailyScore(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .rpc('calculate_daily_score', { p_user_id: userId, p_date: new Date().toISOString().split('T')[0] });
  if (error) { console.error('[Score] recalculate:', error.message); return null; }
  return data as number;
}

/**
 * Calcular la racha actual del usuario.
 */
export async function calculateStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('calculate_user_streak', { p_user_id: userId });
  if (error) { console.error('[Streak] calculate:', error.message); return 0; }
  return (data as number) ?? 0;
}