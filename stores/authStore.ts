// ============================================================
// VYRA FITNESS — Auth Store (Zustand)
// Estado global de autenticación y perfil del usuario
// ============================================================

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';
import { supabase } from '@/lib/supabase';

const GOAL_VALUES = new Set([
  'lose_fat',
  'gain_muscle',
  'health',
  'general_health',
  'performance',
  'sport_performance',
  'mental',
  'mental_wellbeing',
]);

function normalizeGoal(value: unknown): UserProfile['goal'] {
  if (typeof value !== 'string') return 'general_health';
  return GOAL_VALUES.has(value) ? (value as UserProfile['goal']) : 'general_health';
}

function normalizeGender(value: unknown): UserProfile['gender'] {
  if (value === 'male' || value === 'female' || value === 'non_binary' || value === 'prefer_not_to_say') {
    return value;
  }
  return 'prefer_not_to_say';
}

function normalizeProfile(profile: UserProfile | null): UserProfile | null {
  if (!profile) return null;

  const raw = profile as unknown as Record<string, unknown>;
  const goal = normalizeGoal(raw.goal ?? raw.primary_goal);
  const primaryGoal = normalizeGoal(raw.primary_goal ?? raw.goal);
  const gender = normalizeGender(raw.gender ?? raw.biological_sex);
  const dob = typeof raw.dob === 'string' ? raw.dob : null;
  const birthYear =
    typeof raw.birth_year === 'number'
      ? raw.birth_year
      : dob && !Number.isNaN(new Date(dob).getTime())
        ? new Date(dob).getUTCFullYear()
        : undefined;

  const streak = Number(raw.streak ?? raw.current_streak ?? 0);
  const bestStreak = Number(raw.best_streak ?? raw.longest_streak ?? streak);
  const calorieGoal = Number(raw.calorie_goal ?? raw.tdee ?? 2000);

  const contextMemory =
    raw.context_memory_json && typeof raw.context_memory_json === 'object'
      ? (raw.context_memory_json as Record<string, unknown>)
      : raw.coach_memory_json && typeof raw.coach_memory_json === 'object'
        ? (raw.coach_memory_json as Record<string, unknown>)
      : null;
  const pushToken =
    typeof raw.push_token === 'string'
      ? raw.push_token
      : typeof contextMemory?.push_token === 'string'
        ? contextMemory.push_token
        : null;
  const streakFreezeCount =
    typeof raw.streak_freeze_count === 'number'
      ? raw.streak_freeze_count
      : typeof contextMemory?.streak_freeze_count === 'number'
        ? Number(contextMemory.streak_freeze_count)
        : 0;
  const streakFreezeLastUsedAt =
    typeof raw.streak_freeze_last_used_at === 'string'
      ? raw.streak_freeze_last_used_at
      : typeof contextMemory?.streak_freeze_last_used_at === 'string'
        ? contextMemory.streak_freeze_last_used_at
        : null;

  return {
    ...profile,
    email: typeof raw.email === 'string' ? raw.email : '',
    name: typeof raw.name === 'string' ? raw.name : 'Usuario',
    avatar_url: typeof raw.avatar_url === 'string' ? raw.avatar_url : null,
    height_cm: typeof raw.height_cm === 'number' ? raw.height_cm : null,
    weight_start_kg: typeof raw.weight_start_kg === 'number' ? raw.weight_start_kg : null,
    weight_current_kg: typeof raw.weight_current_kg === 'number' ? raw.weight_current_kg : null,
    weight_goal_kg: typeof raw.weight_goal_kg === 'number' ? raw.weight_goal_kg : null,
    body_fat_current_pct:
      typeof raw.body_fat_current_pct === 'number' ? raw.body_fat_current_pct : null,
    gender,
    biological_sex: normalizeGender(raw.biological_sex ?? gender),
    dob,
    birth_year: birthYear,
    goal,
    primary_goal: primaryGoal,
    activity_level: Number(raw.activity_level ?? 3) as UserProfile['activity_level'],
    calorie_goal: calorieGoal,
    tdee: Number(raw.tdee ?? calorieGoal),
    fasting_protocol:
      typeof raw.fasting_protocol === 'string' && raw.fasting_protocol.trim().length > 0
        ? raw.fasting_protocol
        : null,
    water_goal_ml: typeof raw.water_goal_ml === 'number' ? raw.water_goal_ml : 2000,
    step_goal: typeof raw.step_goal === 'number' ? raw.step_goal : 10000,
    sleep_goal_hours: typeof raw.sleep_goal_hours === 'number' ? raw.sleep_goal_hours : 8,
    wake_time_minutes: typeof raw.wake_time_minutes === 'number' ? raw.wake_time_minutes : 420,
    sleep_time_minutes: typeof raw.sleep_time_minutes === 'number' ? raw.sleep_time_minutes : 1380,
    paypal_subscription_id:
      typeof raw.paypal_subscription_id === 'string' ? raw.paypal_subscription_id : null,
    referral_code: typeof raw.referral_code === 'string' ? raw.referral_code : null,
    founding_member: Boolean(raw.founding_member),
    founding_member_rank:
      typeof raw.founding_member_rank === 'number' ? raw.founding_member_rank : null,
    streak,
    best_streak: bestStreak,
    current_streak: Number(raw.current_streak ?? streak),
    longest_streak: Number(raw.longest_streak ?? bestStreak),
    streak_freeze_count: Math.max(0, Number(streakFreezeCount ?? 0)),
    streak_freeze_last_used_at: streakFreezeLastUsedAt,
    push_token: pushToken,
    female_health_enabled: Boolean(raw.female_health_enabled),
    female_cycle_length:
      typeof raw.female_cycle_length === 'number' ? raw.female_cycle_length : null,
    female_last_period_date:
      typeof raw.female_last_period_date === 'string' ? raw.female_last_period_date : null,
    context_name_preference:
      typeof raw.context_name_preference === 'string'
        ? raw.context_name_preference
        : typeof raw.coach_name_preference === 'string'
          ? raw.coach_name_preference
          : null,
    context_memory_json: contextMemory,
    onboarding_completed: Boolean(raw.onboarding_completed),
    first_week_completed: Boolean(raw.first_week_completed),
    created_at:
      typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
    updated_at:
      typeof raw.updated_at === 'string' ? raw.updated_at : new Date().toISOString(),
  };
}

interface AuthState {
  // Estado
  session:        Session | null;
  user:           User | null;
  profile:        UserProfile | null;
  isLoading:      boolean;
  isInitialized:  boolean;
  hasResolvedProfile: boolean;

  // Acciones
  setSession:    (session: Session | null) => void;
  setUser:       (user: User | null) => void;
  setProfile:    (profile: UserProfile | null) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setLoading:    (loading: boolean) => void;
  setInitialized:(initialized: boolean) => void;
  setHasResolvedProfile: (resolved: boolean) => void;
  reset:         () => void;
  signOut:       () => Promise<void>;
  logout:        () => Promise<void>;

  // Computed helpers
  isAuthenticated:  () => boolean;
  isOnboarded:      () => boolean;
}

const initialState = {
  session:       null,
  user:          null,
  profile:       null,
  isLoading:     true,
  isInitialized: false,
  hasResolvedProfile: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setSession: (session) => set({ session }),

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile: normalizeProfile(profile) }),

  updateProfile: (partial) => {
    const current = get().profile;
    if (!current) return;
    set({ profile: normalizeProfile({ ...current, ...partial }) });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  setHasResolvedProfile: (hasResolvedProfile) => set({ hasResolvedProfile }),

  reset: () => set({ ...initialState, isLoading: false, isInitialized: true }),

  signOut: async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } finally {
      set({ ...initialState, isLoading: false, isInitialized: true, hasResolvedProfile: true });
    }
  },

  logout: async () => {
    await get().signOut();
  },

  // Computed: retorna función para que siempre lea el estado actual
  isAuthenticated: () => get().session !== null && get().user !== null,

  isOnboarded: () => get().profile?.onboarding_completed ?? false,
}));
