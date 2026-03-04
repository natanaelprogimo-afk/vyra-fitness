import { supabase } from '@/lib/supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type PlanType = 'monthly' | 'yearly';

export interface SubscriptionStatus {
  isActive:      boolean;
  isPremium:     boolean;
  plan:          string | null;
  status:        string | null;
  expiresAt:     string | null;
  trialEndsAt:   string | null;
  isInTrial:     boolean;
  subscriptionId: string | null;
}

// Crear suscripción → retorna la approval URL de PayPal
export async function createSubscription(
  plan: PlanType,
): Promise<{ approvalUrl: string; subscriptionId: string } | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/api/subscription/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[paypal.createSubscription]', err);
    return null;
  }
}

// Verificar estado de la suscripción del usuario
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/api/subscription/status`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[paypal.getSubscriptionStatus]', err);
    return null;
  }
}

// Cancelar suscripción activa
export async function cancelSubscription(): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/api/subscription/cancel`, {
      method: 'POST',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}