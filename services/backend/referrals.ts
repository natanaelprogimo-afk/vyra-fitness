import { supabase } from '@/lib/supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function requestJson(
  path: string,
  init: RequestInit,
): Promise<{ ok: boolean; status: number; data: any; text: string }> {
  const response = await fetch(`${BACKEND_URL}${path}`, init);
  const text = await response.text();

  let data: any = null;
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    text,
  };
}

export interface ReferralOverview {
  code: string;
  reward_days: number;
  referral_count: number;
  friend_count: number;
  redeemed: boolean;
  redeemed_at: string | null;
  referred_by: { id: string; name: string | null } | null;
  founding_member: boolean;
  founding_member_rank: number | null;
  premium_expires_at: string | null;
}

export async function getReferralOverview(): Promise<ReferralOverview | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await requestJson('/api/referrals/overview', {
      method: 'GET',
      headers,
    });
    if (!response.ok) return null;
    return response.data as ReferralOverview;
  } catch {
    return null;
  }
}

export async function redeemReferral(code: string): Promise<{
  ok: boolean;
  error?: string;
  reward_days?: number;
  referred_expires_at?: string | null;
  referrer?: { id: string; name: string | null };
}> {
  try {
    const headers = await getAuthHeaders();
    const response = await requestJson('/api/referrals/redeem', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      return { ok: false, error: response.data?.error ?? 'No se pudo canjear.' };
    }
    return { ok: true, ...response.data };
  } catch {
    return { ok: false, error: 'No se pudo canjear.' };
  }
}
