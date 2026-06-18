import type { UserProfile } from '@/types/user';
import { buildProfileContextUpdate } from '@/lib/profile-context';

let ignoreNextSignedOutEvent = false;
let qaBridgeRuntimeMode = false;

export type QaBridgePayload = {
  access_token?: string;
  refresh_token?: string;
  email?: string;
  password?: string;
  next?: string;
  hold?: string;
};

let qaBridgePayload: QaBridgePayload | null = null;

function normalizeQaBridgePath(url: URL) {
  return `${url.host || ''}${url.pathname || ''}`.replace(/^\/+|\/+$/g, '');
}

function isQaBridgePayloadKey(value: string): value is keyof QaBridgePayload {
  return ['access_token', 'refresh_token', 'email', 'password', 'next', 'hold'].includes(value);
}

function sanitizeQaBridgePayload(input: unknown): QaBridgePayload | null {
  if (!input || typeof input !== 'object') return null;

  const payload: QaBridgePayload = {};

  for (const [rawKey, rawValue] of Object.entries(input as Record<string, unknown>)) {
    if (!isQaBridgePayloadKey(rawKey) || typeof rawValue !== 'string') continue;

    const normalized = rawValue.trim();
    if (!normalized) continue;
    payload[rawKey] = normalized;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(`${normalized}${padding}`);
  }

  return null;
}

export function decodeQaBridgePayloadParam(value: string | null | undefined): QaBridgePayload | null {
  if (!value) return null;

  const normalized = value.trim();
  if (!normalized) return null;

  const candidates = [normalized];

  try {
    const decoded = decodeURIComponent(normalized);
    if (decoded && decoded !== normalized) {
      candidates.push(decoded);
    }
  } catch {
    // Ignore malformed URI sequences and keep trying with the raw value.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const payload = sanitizeQaBridgePayload(parsed);
      if (payload) return payload;
    } catch {
      // Try the next decoding strategy.
    }

    try {
      const base64Decoded = decodeBase64Url(candidate);
      if (!base64Decoded) continue;
      const parsed = JSON.parse(base64Decoded);
      const payload = sanitizeQaBridgePayload(parsed);
      if (payload) return payload;
    } catch {
      // Ignore invalid base64/json payloads.
    }
  }

  return null;
}

export function extractQaBridgePayload(url: string | null | undefined): QaBridgePayload | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (normalizeQaBridgePath(parsed) !== 'session-bridge') return null;

    const payloadParam = decodeQaBridgePayloadParam(parsed.searchParams.get('payload'));
    if (payloadParam) {
      return payloadParam;
    }

    const payload: QaBridgePayload = {};
    const keys: Array<keyof QaBridgePayload> = [
      'access_token',
      'refresh_token',
      'email',
      'password',
      'next',
      'hold',
    ];

    for (const key of keys) {
      const value = parsed.searchParams.get(key);
      if (!value) continue;

      const normalized = value.trim();
      if (!normalized) continue;
      payload[key] = normalized;
    }

    return payload;
  } catch {
    return null;
  }
}

export function armQaBridgeSignedOutBypass() {
  ignoreNextSignedOutEvent = true;
}

export function consumeQaBridgeSignedOutBypass() {
  if (!ignoreNextSignedOutEvent) return false;
  ignoreNextSignedOutEvent = false;
  return true;
}

export function armQaBridgeRuntimeMode() {
  qaBridgeRuntimeMode = true;
}

export function clearQaBridgeRuntimeMode() {
  qaBridgeRuntimeMode = false;
}

export function isQaBridgeRuntimeModeEnabled() {
  return qaBridgeRuntimeMode;
}

export function setQaBridgePayload(payload: QaBridgePayload | null) {
  qaBridgePayload = payload;
}

export function getQaBridgePayload() {
  return qaBridgePayload;
}

export function clearQaBridgePayload() {
  qaBridgePayload = null;
}

export function buildQaBridgeProfileSeed(params: {
  userId: string;
  email: string;
  name: string;
  nowIso?: string;
}): UserProfile {
  const { userId, email, name, nowIso = new Date().toISOString() } = params;

  return {
    id: userId,
    email,
    name,
    avatar_url: null,
    height_cm: null,
    weight_start_kg: null,
    weight_current_kg: null,
    weight_goal_kg: null,
    body_fat_current_pct: null,
    gender: 'prefer_not_to_say',
    dob: null,
    biological_sex: 'prefer_not_to_say',
    goal: 'general_health',
    primary_goal: 'general_health',
    activity_level: 3,
    calorie_goal: 2000,
    tdee: 2000,
    fasting_protocol: null,
    water_goal_ml: 2000,
    step_goal: 10000,
    sleep_goal_hours: 8,
    wake_time_minutes: 420,
    sleep_time_minutes: 1380,
    is_premium: false,
    premium_expires_at: null,
    paypal_subscription_id: null,
    referral_code: null,
    founding_member: false,
    founding_member_rank: null,
    streak: 0,
    best_streak: 0,
    current_streak: 0,
    longest_streak: 0,
    push_token: null,
    female_health_enabled: false,
    female_cycle_length: null,
    female_last_period_date: null,
    ...buildProfileContextUpdate({
      name: null,
      memory: {
        qa_bridge_seeded: true,
        onboarding_completed_at: nowIso,
      },
    }),
    onboarding_completed: true,
    first_week_completed: false,
    created_at: nowIso,
    updated_at: nowIso,
  };
}
