import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackOnboardingStep } from '@/lib/analytics';
import type { OnboardingData } from '@/types/user';

// Helper: Convert minutes since midnight to hours
function calculateSleepDuration(sleepMinutes: number, wakeMinutes: number): number {
  if (typeof sleepMinutes !== 'number' || typeof wakeMinutes !== 'number') return 0;
  
  // Normalize wake time if it's next day (after sleep time)
  const normalizedWake = wakeMinutes <= sleepMinutes ? wakeMinutes + 1440 : wakeMinutes;
  const durationMinutes = normalizedWake - sleepMinutes;
  const durationHours = durationMinutes / 60;
  
  // Round to 0.1 decimal precision
  return Math.round((durationHours + Number.EPSILON) * 10) / 10;
}

// Calculate missing fields that should be derived from other data
function calculateMissingFields(data: OnboardingDraft): OnboardingDraft {
  const result = { ...data };

  // Calculate sleep_goal_hours from sleep/wake times if not set
  if (
    !result.sleep_goal_hours &&
    typeof result.sleep_time_minutes === 'number' &&
    typeof result.wake_time_minutes === 'number'
  ) {
    result.sleep_goal_hours = calculateSleepDuration(
      result.sleep_time_minutes,
      result.wake_time_minutes,
    );
  }

  // Set water_goal_ml default if missing (2L is recommended)
  if (!result.water_goal_ml) {
    result.water_goal_ml = 2000;
  }

  return result;
}

export type OnboardingDraft = Partial<OnboardingData> & {

  email?: string | null;

  avatar_url?: string | null;

  weight_goal_date?: string | null;

  female_health_enabled?: boolean;

  health_consent?: boolean;
  medical_disclaimer_accepted?: boolean;

  notifications_permission?: 'granted' | 'denied';
  notifications_permission_state?: 'granted' | 'denied' | 'skipped';

  activity_permission?: 'granted' | 'denied';

  health_connect_enabled?: boolean;

  health_connect_status?: string | null;

  referral_code?: string | null;
  context_display_name?: string | null;

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



// Validate structure of onboarding data
function validateOnboardingData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.data || typeof data.data !== 'object') return false;
  if (typeof data.updated_at !== 'string') return false;
  return true;
}

export async function loadOnboardingProgress(): Promise<OnboardingProgressState> {

  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) return EMPTY_ONBOARDING_PROGRESS;

  try {

    const parsed = JSON.parse(raw) as OnboardingProgressState;

    // Validate structure to detect corruption
    if (!validateOnboardingData(parsed)) {
      console.error('[Onboarding] Storage data corrupted, resetting');
      // TODO: trackOnboardingError('storage_load', 'CORRUPTED_DATA');
      return EMPTY_ONBOARDING_PROGRESS;
    }

    return parsed;

  } catch (err) {
    console.error('[Onboarding] Storage parse error:', err);
    // TODO: trackOnboardingError('storage_load', 'PARSE_ERROR');
    return EMPTY_ONBOARDING_PROGRESS;

  }

}



export async function saveOnboardingProgress(step: string, data: OnboardingDraft): Promise<void> {

  try {
    const existing = await loadOnboardingProgress();

    // Calculate missing fields before saving
    const enrichedData = calculateMissingFields({
      ...(existing?.data ?? {}),
      ...data,
    });

    const payload: OnboardingProgressState = {

      step,

      data: enrichedData,

      updated_at: new Date().toISOString(),

    };

    // Validate before saving
    if (!validateOnboardingData(payload)) {
      throw new Error('Invalid onboarding data structure');
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    trackOnboardingStep(step);
  } catch (err) {
    console.error('[Onboarding] Save failed:', err);
    // TODO: trackOnboardingError('storage_save', err instanceof Error ? err.message : 'UNKNOWN');
    throw err; // Don't silently fail
  }

}



export async function clearOnboardingProgress(): Promise<void> {

  await AsyncStorage.removeItem(STORAGE_KEY);

}

/**
 * Get the last completed step for "resume onboarding" feature
 * Shows user where they left off if they exit and return
 */
export async function getLastCompletedStep(): Promise<string | null> {
  try {
    const progress = await loadOnboardingProgress();
    return progress?.step || null;
  } catch (error) {
    console.error('[Onboarding] Error getting last step:', error);
    return null;
  }
}

/**
 * Check if onboarding is in progress (partially completed)
 * Used to show "resume" vs "start fresh" options
 */
export async function isOnboardingInProgress(): Promise<boolean> {
  try {
    const progress = await loadOnboardingProgress();
    return !!(progress?.data && Object.keys(progress.data).length > 0);
  } catch (error) {
    console.error('[Onboarding] Error checking progress:', error);
    return false;
  }
}

/**
 * Reset onboarding with confirmation
 * Clears ALL onboarding data but preserves user account
 * Called when user explicitly chooses "start fresh"
 */
export async function resetOnboardingInFlow(): Promise<void> {
  try {
    // Clear onboarding progress
    await clearOnboardingProgress();
    
    // Log reset event for analytics
    console.log('[Onboarding] User reset onboarding flow - starting fresh');
    // TODO: trackOnboardingEvent('onboarding_reset', { timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Onboarding] Error resetting onboarding:', error);
    throw error;
  }
}

