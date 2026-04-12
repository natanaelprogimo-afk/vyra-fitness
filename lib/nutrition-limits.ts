import { supabase } from '@/lib/supabase';

export type NutritionLimitedSource = 'photo_ai' | 'voice' | 'barcode';

function todayISO(): string {
  return new Date().toISOString().split('T')[0]!;
}

export async function checkDailyMealSourceLimit(params: {
  userId: string;
  source: NutritionLimitedSource;
  limit: number;
  isPremium: boolean;
}) {
  const { userId, source, limit, isPremium } = params;

  if (!userId) {
   return { allowed: false, remaining: 0, limit };
  }

  if (isPremium) {
   return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  const { count, error } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', source)
    .gte('logged_at', `${todayISO()}T00:00:00`)
    .lte('logged_at', `${todayISO()}T23:59:59`);

  if (error) {
   return { allowed: true, remaining: limit, limit };
  }

  const used = (count ?? 0) as number;
  const remaining = Math.max(0, limit - used);
  return {
    allowed: remaining > 0,
    remaining,
    limit,
  };
}
