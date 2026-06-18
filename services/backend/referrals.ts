import {
  asRecord,
  getAuthHeaders,
  getBackendUrl,
  requestJson,
} from '@/services/backend/client';
import { ReferralMessages } from '@/constants/strings';

export interface ReferralOverview {
  code: string;
  referral_count: number;
  friend_count: number;
  redeemed: boolean;
  redeemed_at: string | null;
  referred_by: { id: string; name: string | null } | null;
  founding_member: boolean;
  founding_member_rank: number | null;
}

export type ReferralOverviewResult =
  | {
      ok: true;
      overview: ReferralOverview;
    }
  | {
      ok: false;
      error: string;
      status?: number;
      reason: 'missing_backend' | 'unauthorized' | 'unavailable' | 'network';
      retryable: boolean;
    };

function normalizeReferralOverview(value: Record<string, unknown>): ReferralOverview | null {
  if (
    typeof value.code !== 'string' ||
    typeof value.referral_count !== 'number' ||
    typeof value.friend_count !== 'number' ||
    typeof value.redeemed !== 'boolean' ||
    typeof value.founding_member !== 'boolean'
  ) {
    return null;
  }

  return value as unknown as ReferralOverview;
}

function normalizeReferralError(status: number, fallback: string): ReferralOverviewResult {
  if (status === 401 || status === 403) {
    return {
      ok: false,
      error: ReferralMessages.noValidSession,
      status,
      reason: 'unauthorized',
      retryable: false,
    };
  }

  if (status >= 500) {
    return {
      ok: false,
      error: ReferralMessages.serviceUnavailable,
      status,
      reason: 'unavailable',
      retryable: true,
    };
  }

  return {
    ok: false,
    error: fallback,
    status,
    reason: 'unavailable',
    retryable: true,
  };
}

export async function getReferralOverview(): Promise<ReferralOverviewResult> {
  if (!getBackendUrl()) {
    return {
      ok: false,
      error: ReferralMessages.notConfigured,
      reason: 'missing_backend',
      retryable: false,
    };
  }

  try {
    const headers = await getAuthHeaders();
    const response = await requestJson('/api/referrals/overview', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const payload = asRecord(response.data);
      return normalizeReferralError(
        response.status,
        typeof payload?.error === 'string' ? payload.error : ReferralMessages.loadFailed,
      );
    }

    const payload = asRecord(response.data);
    const overview = payload ? normalizeReferralOverview(payload) : null;
    if (!overview || overview.code.trim().length === 0) {
      return {
        ok: false,
        error: ReferralMessages.noData,
        status: response.status,
        reason: 'unavailable',
        retryable: true,
      };
    }

    return {
      ok: true,
      overview,
    };
  } catch {
    return {
      ok: false,
      error: ReferralMessages.networkFailed,
      reason: 'network',
      retryable: true,
    };
  }
}

export async function redeemReferral(code: string): Promise<{
  ok: boolean;
  error?: string;
  referrer?: { id: string; name: string | null };
}> {
  if (!getBackendUrl()) {
    return {
      ok: false,
      error: ReferralMessages.notAvailable,
    };
  }

  try {
    const headers = await getAuthHeaders();
    const response = await requestJson('/api/referrals/redeem', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      const payload = asRecord(response.data);
      return { ok: false, error: typeof payload?.error === 'string' ? payload.error : ReferralMessages.redeemFailed };
    }
    return { ok: true, ...(asRecord(response.data) ?? {}) };
  } catch {
    return { ok: false, error: 'No se pudo canjear.' };
  }
}
