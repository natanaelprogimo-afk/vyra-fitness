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

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export type PlanType = 'monthly' | 'yearly';

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  plan: string | null;
  status: string | null;
  expiresAt: string | null;
  trialEndsAt: string | null;
  isInTrial: boolean;
  subscriptionId: string | null;
}

export async function createSubscription(
  plan: PlanType,
): Promise<{ approvalUrl: string; subscriptionId: string } | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/paypal/create-subscription`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    return {
      approvalUrl: payload.approval_url ?? payload.approvalUrl,
      subscriptionId: payload.subscription_id ?? payload.subscriptionId,
    };
  } catch (err) {
    console.error('[paypal.createSubscription]', err);
    return null;
  }
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  try {
    const headers = await getAuthHeaders();
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const res = await fetch(`${BACKEND_URL}/paypal/status/${userId}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    return {
      isActive: data.status === 'active',
      isPremium: data.is_premium === true,
      plan: data.plan ?? null,
      status: data.status ?? null,
      expiresAt: data.expires_at ?? null,
      trialEndsAt: data.trial_ends_at ?? null,
      isInTrial: data.status === 'trial',
      subscriptionId: data.subscription_id ?? null,
    };
  } catch (err) {
    console.error('[paypal.getSubscriptionStatus]', err);
    return null;
  }
}

export async function cancelSubscription(): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const url = `${BACKEND_URL}/paypal/cancel?user_id=${encodeURIComponent(userId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    return res.ok;
  } catch {
    return false;
  }
}
