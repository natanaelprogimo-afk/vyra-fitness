import AsyncStorage from '@react-native-async-storage/async-storage';

import type { OnboardingData } from '@/types/user';



export type OnboardingDraft = Partial<OnboardingData> & {

  email?: string | null;

  avatar_url?: string | null;

  weight_goal_date?: string | null;

  female_health_enabled?: boolean;

  health_consent?: boolean;
  medical_disclaimer_accepted?: boolean;

  notifications_permission?: 'granted' | 'denied';

  activity_permission?: 'granted' | 'denied';

  health_connect_enabled?: boolean;

  health_connect_status?: string | null;

  referral_code?: string | null;

};



export interface OnboardingProgressState {

  step: string;

  data: OnboardingDraft;

  updated_at: string;

}



const STORAGE_KEY = 'vyra_onboarding_progress_v1';

const EMPTY_ONBOARDING_PROGRESS: OnboardingProgressState = {

  step: '',

  data: {},

  updated_at: '',

};



export async function loadOnboardingProgress(): Promise<OnboardingProgressState> {

  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) return EMPTY_ONBOARDING_PROGRESS;

  try {

    const parsed = JSON.parse(raw) as OnboardingProgressState;

    if (!parsed || typeof parsed !== 'object') return EMPTY_ONBOARDING_PROGRESS;

    if (!parsed.data || typeof parsed.data !== 'object') return EMPTY_ONBOARDING_PROGRESS;

    return parsed;

  } catch {

    return EMPTY_ONBOARDING_PROGRESS;

  }

}



export async function saveOnboardingProgress(step: string, data: OnboardingDraft): Promise<void> {

  const existing = await loadOnboardingProgress();

  const payload: OnboardingProgressState = {

    step,

    data: {

      ...(existing?.data ?? {}),

      ...data,

    },

    updated_at: new Date().toISOString(),

  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

}



export async function clearOnboardingProgress(): Promise<void> {

  await AsyncStorage.removeItem(STORAGE_KEY);

}

