import type { User } from '@supabase/supabase-js';
import { Routes } from '@/constants/routes';
import { resolveSupportedLanguage, type SupportedLanguage } from '@/lib/language';
import { clearOnboardingProgress, saveOnboardingProgress } from '@/lib/onboarding-storage';
import { buildProfileContextUpdate } from '@/lib/profile-context';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/user';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectLocale(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale && typeof locale === 'string') return locale;
  } catch {
    // ignore
  }
  return 'es';
}

function detectLanguage(locale: string): SupportedLanguage {
  return resolveSupportedLanguage(locale);
}

function detectPreferredUnits(locale: string): 'metric' | 'imperial' {
  const upper = locale.toUpperCase();
  return upper.includes('US') || upper.includes('LR') || upper.includes('MM')
    ? 'imperial'
    : 'metric';
}

export function getUserDisplayName(user: Pick<User, 'email' | 'user_metadata'>): string {
  const metadataName =
    typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim().length > 0
      ? user.user_metadata.name.trim()
      : typeof user.user_metadata?.full_name === 'string' &&
          user.user_metadata.full_name.trim().length > 0
        ? user.user_metadata.full_name.trim()
        : '';

  if (metadataName) return metadataName;
  if (user.email && user.email.includes('@')) {
    const localPart = user.email.split('@')[0]?.trim();
    if (localPart) return localPart;
  }
  return 'Usuario';
}

export function buildOfflineProfileSeed(
  user: Pick<User, 'id' | 'email' | 'user_metadata'>,
  overrides: Partial<UserProfile> = {},
): UserProfile {
  const locale = detectLocale();
  const nowIso = new Date().toISOString();

  return {
    id: user.id,
    email: user.email ?? '',
    name: getUserDisplayName(user),
    avatar_url: null,
    height_cm: null,
    weight_start_kg: null,
    weight_current_kg: null,
    weight_goal_kg: null,
    body_fat_current_pct: null,
    gender: 'prefer_not_to_say',
    biological_sex: 'prefer_not_to_say',
    dob: null,
    birth_year: undefined,
    goal: 'general_health',
    primary_goal: 'general_health',
    activity_level: 3,
    calorie_goal: 2000,
    tdee: 2000,
    water_goal_ml: 2500,
    step_goal: 10000,
    sleep_goal_hours: 8,
    fasting_protocol: null,
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
    streak_freeze_count: 0,
    streak_freeze_last_used_at: null,
    push_token: null,
    female_health_enabled: false,
    female_cycle_length: null,
    female_last_period_date: null,
    context_name_preference: null,
    context_memory_json: buildProfileContextUpdate({ memory: {} }).context_memory_json ?? null,
    onboarding_completed: true,
    first_week_completed: false,
    created_at: nowIso,
    updated_at: nowIso,
    preferred_units: detectPreferredUnits(locale),
    language: detectLanguage(locale),
    ...overrides,
  } as UserProfile;
}

export function parseAuthCallbackUrl(callbackUrl: string | null | undefined) {
  if (!callbackUrl) {
    return {
      code: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      errorDescription: null,
    };
  }

  const query = callbackUrl.includes('?') ? (callbackUrl.split('?')[1]?.split('#')[0] ?? '') : '';
  const fragment = callbackUrl.includes('#') ? (callbackUrl.split('#')[1] ?? '') : '';
  const params = new URLSearchParams([query, fragment].filter(Boolean).join('&'));

  return {
    code: params.get('code'),
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    error: params.get('error') ?? params.get('error_code'),
    errorDescription: params.get('error_description') ?? params.get('message'),
  };
}

export async function ensureProfileExists(user: User): Promise<UserProfile | null> {
  const existingProfileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfileResult.error) {
    throw existingProfileResult.error;
  }

  if (existingProfileResult.data) {
    return existingProfileResult.data as UserProfile;
  }

  const locale = detectLocale();
  const nowIso = new Date().toISOString();
  const seedProfile = {
    id: user.id,
    email: user.email ?? null,
    name: getUserDisplayName(user),
    goal: 'general_health',
    primary_goal: 'general_health',
    preferred_units: detectPreferredUnits(locale),
    language: detectLanguage(locale),
    onboarding_completed: false,
    ...buildProfileContextUpdate({ memory: {} }),
    updated_at: nowIso,
  };

  const insertResult = await supabase
    .from('profiles')
    .upsert(seedProfile, { onConflict: 'id' })
    .select('*')
    .maybeSingle();

  if (insertResult.error) {
    throw insertResult.error;
  }

  return (insertResult.data as UserProfile | null) ?? null;
}

export async function resolvePostAuthRouteFromCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No se pudo recuperar la cuenta autenticada.');
  }

  let profile: UserProfile | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const profileResult = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileResult.error) {
      throw profileResult.error;
    }

    profile = profileResult.data as UserProfile | null;
    if (profile) break;
    await sleep(250);
  }

  profile = profile ?? (await ensureProfileExists(user));

  if (profile?.onboarding_completed) {
    return {
      route: Routes.tabs.home,
      profile,
    };
  }

  await clearOnboardingProgress();
  await saveOnboardingProgress(Routes.auth.onboarding.goals, {
    name: getUserDisplayName(user),
    email: user.email ?? '',
  });

  return {
    route: Routes.auth.onboarding.goals,
    profile,
  };
}
