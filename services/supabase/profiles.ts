// ============================================================
// VYRA FITNESS — Profile Service
// CRUD de perfil, coins, XP, streak
// ============================================================

import { supabase } from '@/lib/supabase';
import type { UserProfile, UserProfileUpdate } from '@/types/user';
import type { XpResult } from '@/types/api';

function normalizeCoinType(type: string): string {
  const mapped: Record<string, string> = {
    earn_water: 'water_log',
    hydration_goal: 'water_goal',
    earn_steps: 'steps_goal',
    step_milestone: 'steps_goal',
    fasting_complete: 'fasting_complete',
    earn_fasting: 'fasting_complete',
    sleep_log: 'sleep_quality',
    earn_sleep: 'sleep_quality',
    nutrition_log: 'nutrition_log',
    earn_nutrition: 'nutrition_log',
    workout_complete: 'workout_complete',
    earn_workout: 'workout_complete',
    mental_checkin: 'mental_checkin',
    earn_mental: 'mental_checkin',
    earn_daily_score: 'daily_score_80',
    daily_score_80: 'daily_score_80',
    daily_score_90: 'daily_score_90',
    streak_milestone: 'streak_milestone',
    earn_streak_milestone: 'streak_milestone',
    badge_unlock: 'badge_unlocked',
    earn_badge: 'badge_unlocked',
    ad_reward: 'rewarded_ad',
    earn_ad_reward: 'rewarded_ad',
    challenge_complete: 'challenge_complete',
    referral: 'referral',
    birthday: 'birthday',
    onboarding: 'onboarding',
    earn_onboarding: 'onboarding',
    first_week: 'first_week',
    store_purchase: 'store_purchase',
    spend_store: 'store_purchase',
  };

  return mapped[type] ?? ([
    'water_log', 'water_goal', 'steps_goal', 'fasting_complete', 'sleep_quality',
    'nutrition_log', 'macros_goal', 'workout_complete', 'pr_achieved', 'mental_checkin',
    'daily_score_80', 'daily_score_90', 'streak_milestone', 'badge_unlocked', 'rewarded_ad',
    'challenge_complete', 'referral', 'birthday', 'onboarding', 'first_week', 'store_purchase', 'other',
  ].includes(type) ? type : 'other');
}

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
  const rpc = await supabase.rpc('increment_coins', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (!rpc.error) {
    const data = rpc.data;
    if (typeof data === 'number') return data;
    if (Array.isArray(data) && typeof data[0] === 'number') return data[0];
    if (data && typeof (data as any).new_balance === 'number') return Number((data as any).new_balance);
  }

  // Fallback for environments where RPC is outdated/broken.
  try {
    const [{ data: profile }, { data: rows }] = await Promise.all([
      supabase.from('profiles').select('coins').eq('id', userId).single(),
      supabase
        .from('coin_transactions')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`),
    ]);

    const currentCoins = Number(profile?.coins ?? 0);
    const earnedToday = (rows ?? []).reduce((sum, row) => {
      const value = Number((row as any).amount ?? 0);
      return value > 0 ? sum + value : sum;
    }, 0);
    const effectiveAmount =
      amount > 0 ? Math.max(0, Math.min(amount, 200 - earnedToday)) : amount;
    const newBalance = Math.max(0, currentCoins + effectiveAmount);

    if (effectiveAmount !== 0) {
      await supabase.from('coin_transactions').insert({
        user_id: userId,
        amount: effectiveAmount,
        type: normalizeCoinType(type),
        description: description ?? 'Coin transaction',
      });
    }

    await supabase
      .from('profiles')
      .update({ coins: newBalance, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return newBalance;
  } catch (fallbackError) {
    console.error(
      '[Coins] addCoins fallback failed:',
      fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
    );
    return null;
  }
}

/**
 * Sumar XP via función SQL. Retorna {new_xp, new_level, leveled_up}.
 */
export async function addXP(userId: string, xp: number): Promise<XpResult | null> {
  const { data, error } = await supabase
    .rpc('increment_xp', { p_user_id: userId, p_xp_amount: xp });
  if (error) { console.error('[XP] addXP:', error.message); return null; }
  const row = Array.isArray(data) ? data[0] : data;
  return (row as XpResult) ?? null;
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
