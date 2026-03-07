import { supabase } from '@/lib/supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

const PAYPAL_PLAN_IDS = {
  monthly:
    process.env.EXPO_PUBLIC_PAYPAL_PLAN_ID_MONTHLY ??
    'P-5F452549KJ970354TNGH5JSQ',
  yearly:
    process.env.EXPO_PUBLIC_PAYPAL_PLAN_ID_YEARLY ??
    'P-5VV52636WU610650PNGH5LGA',
} as const;

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

function normalizeSubscriptionStatus(raw: any): SubscriptionStatus | null {
  if (!raw || typeof raw !== 'object') return null;

  const payload = raw.subscription && typeof raw.subscription === 'object'
    ? {
        ...raw.subscription,
        is_premium: raw.is_premium ?? raw.subscription.is_premium,
      }
    : raw;

  const status = typeof payload.status === 'string' ? payload.status : null;
  const isPremium = payload.is_premium === true || payload.isPremium === true;
  const plan =
    typeof payload.plan === 'string'
      ? payload.plan
      : typeof payload.plan_type === 'string'
        ? payload.plan_type
        : null;

  const expiresAt =
    typeof payload.expires_at === 'string'
      ? payload.expires_at
      : typeof payload.expiresAt === 'string'
        ? payload.expiresAt
        : null;

  const trialEndsAt =
    typeof payload.trial_ends_at === 'string'
      ? payload.trial_ends_at
      : typeof payload.trialEndsAt === 'string'
        ? payload.trialEndsAt
        : null;

  const subscriptionId =
    typeof payload.subscription_id === 'string'
      ? payload.subscription_id
      : typeof payload.subscriptionId === 'string'
        ? payload.subscriptionId
        : null;

  const isInTrial = status === 'trial';
  const isActive = isPremium && (status === 'active' || isInTrial);

  return {
    isActive,
    isPremium,
    plan,
    status,
    expiresAt,
    trialEndsAt,
    isInTrial,
    subscriptionId,
  };
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

    const primary = await requestJson('/paypal/create-subscription', {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan }),
    });

    if (primary.ok) {
      const approvalUrl = primary.data?.approval_url ?? primary.data?.approvalUrl;
      const subscriptionId = primary.data?.subscription_id ?? primary.data?.subscriptionId;

      if (approvalUrl && subscriptionId) {
        return { approvalUrl, subscriptionId };
      }
    }

    if (primary.status === 404) {
      const legacy = await requestJson('/api/paypal/subscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId: PAYPAL_PLAN_IDS[plan] }),
      });

      if (legacy.ok) {
        const approvalUrl = legacy.data?.approvalUrl ?? legacy.data?.approval_url;
        const subscriptionId = legacy.data?.subscriptionId ?? legacy.data?.subscription_id;

        if (approvalUrl && subscriptionId) {
          return { approvalUrl, subscriptionId };
        }
      }

      console.error('[paypal.createSubscription.legacy]', legacy.status, legacy.text);
      return null;
    }

    console.error('[paypal.createSubscription]', primary.status, primary.text);
    return null;
  } catch (err) {
    console.error('[paypal.createSubscription.exception]', err);
    return null;
  }
}

export async function confirmSubscription(subscriptionId: string): Promise<SubscriptionStatus | null> {
  try {
    const headers = await getAuthHeaders();

    const primary = await requestJson(`/paypal/confirm/${encodeURIComponent(subscriptionId)}`, {
      method: 'GET',
      headers,
    });

    if (primary.ok) {
      return normalizeSubscriptionStatus(primary.data);
    }

    if (primary.status === 404) {
      const legacy = await requestJson(
        `/api/paypal/status?subscriptionId=${encodeURIComponent(subscriptionId)}`,
        {
          method: 'GET',
          headers,
        },
      );

      if (legacy.ok) {
        return normalizeSubscriptionStatus(legacy.data);
      }

      console.error('[paypal.confirmSubscription.legacy]', legacy.status, legacy.text);
      return null;
    }

    console.error('[paypal.confirmSubscription]', primary.status, primary.text);
    return null;
  } catch (err) {
    console.error('[paypal.confirmSubscription.exception]', err);
    return null;
  }
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  try {
    const headers = await getAuthHeaders();
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const primary = await requestJson(`/paypal/status/${userId}`, {
      method: 'GET',
      headers,
    });

    if (primary.ok) {
      return normalizeSubscriptionStatus(primary.data);
    }

    if (primary.status === 404) {
      const legacySubscription = await requestJson('/api/subscription/status', {
        method: 'GET',
        headers,
      });

      if (legacySubscription.ok) {
        return normalizeSubscriptionStatus(legacySubscription.data);
      }

      const legacyPaypal = await requestJson('/api/paypal/user/subscription', {
        method: 'GET',
        headers,
      });

      if (legacyPaypal.ok) {
        return normalizeSubscriptionStatus(legacyPaypal.data);
      }

      console.error('[paypal.getSubscriptionStatus.legacy]', legacySubscription.status, legacySubscription.text);
      console.error('[paypal.getSubscriptionStatus.legacyPaypal]', legacyPaypal.status, legacyPaypal.text);
      return null;
    }

    console.error('[paypal.getSubscriptionStatus]', primary.status, primary.text);
    return null;
  } catch (err) {
    console.error('[paypal.getSubscriptionStatus.exception]', err);
    return null;
  }
}

export async function cancelSubscription(subscriptionId?: string | null): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();

    const primary = await requestJson('/paypal/cancel-subscription', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...(subscriptionId ? { subscriptionId } : {}),
      }),
    });

    if (primary.ok) {
      return true;
    }

    if (primary.status === 404) {
      const legacySubscription = await requestJson('/api/subscription/cancel', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: 'Cancelado por el usuario desde la app.' }),
      });

      if (legacySubscription.ok) {
        return true;
      }

      const legacyPaypal = await requestJson('/api/paypal/cancel', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...(subscriptionId ? { subscriptionId } : {}),
        }),
      });

      if (legacyPaypal.ok) {
        return true;
      }

      console.error('[paypal.cancelSubscription.legacy]', legacySubscription.status, legacySubscription.text);
      console.error('[paypal.cancelSubscription.legacyPaypal]', legacyPaypal.status, legacyPaypal.text);
      return false;
    }

    console.error('[paypal.cancelSubscription]', primary.status, primary.text);
    return false;
  } catch (err) {
    console.error('[paypal.cancelSubscription.exception]', err);
    return false;
  }
}
