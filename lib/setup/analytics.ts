// ============================================================
// VYRA FITNESS - Analytics (PostHog)
// Wrapper tipado con inicializacion segura y sin ruido de storage legacy
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteMeta } from '@/constants/routeMeta';
import { getOnboardingStepMeta, type OnboardingStepMeta } from '@/constants/onboardingFlow';

type PostHogClient = {
  identify: (userId: string, props?: Record<string, unknown>) => void;
  reset: () => void;
  capture: (event: string, props?: Record<string, unknown>) => void;
  flush: () => void;
};

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

let client: PostHogClient | null = null;
let clientPromise: Promise<PostHogClient | null> | null = null;
const FIRST_ACTION_STORAGE_KEY = '@vyra:first_action_completed';

async function ensureAnalytics(): Promise<PostHogClient | null> {
  if (client) return client;
  if (clientPromise) return clientPromise;
  if (!POSTHOG_KEY) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PostHog } = require('posthog-react-native');

    clientPromise = PostHog.initAsync(POSTHOG_KEY, {
      apiHost: POSTHOG_HOST,
      persistence: 'file',
      customAsyncStorage: {
        getItem: AsyncStorage.getItem,
        setItem: AsyncStorage.setItem,
      },
    })
      .then((instance: PostHogClient) => {
        client = instance;
        return instance;
      })
      .catch((e) => {
        console.debug?.('[analytics] PostHog.initAsync failed', e);
        client = null;
        return null;
      });

    return clientPromise;
  } catch (e) {
    console.debug?.('[analytics] ensureAnalytics failed', e);
    client = null;
    clientPromise = Promise.resolve(null);
    return clientPromise;
  }
}

function runAnalyticsAction(
  analytics: PostHogClient,
  action: (client: PostHogClient) => void,
) {
  try {
    action(analytics);
  } catch {
    // Analytics nunca debe romper un flujo principal de producto.
  }
}

function dispatch(action: (analytics: PostHogClient) => void) {
  const ready = client;
  if (ready) {
    runAnalyticsAction(ready, action);
    return;
  }

  void ensureAnalytics().then((analytics) => {
    if (analytics) {
      runAnalyticsAction(analytics, action);
    }
  });
}

async function captureFirstActionOnce(
  actionKey: string,
  props?: Record<string, unknown>,
) {
  try {
    const alreadyCaptured = await AsyncStorage.getItem(FIRST_ACTION_STORAGE_KEY);
    if (alreadyCaptured === '1') return;

    await AsyncStorage.setItem(FIRST_ACTION_STORAGE_KEY, '1');
    dispatch((analytics) =>
      analytics.capture('first_action_completed', {
        action_key: actionKey,
        ...props,
      }),
    );
  } catch {
    // Best-effort only. Analytics never blocks product flows.
  }
}

export function getAnalytics(): PostHogClient | null {
  return client;
}

export function initAnalytics(): Promise<PostHogClient | null> {
  return ensureAnalytics();
}

export function identifyUser(userId: string, props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.identify(userId, props));
}

export function resetUser() {
  dispatch((analytics) => analytics.reset());
}

export function trackOnboardingStarted(step?: string | OnboardingStepMeta) {
  const meta = resolveOnboardingStep(step ?? 'onboarding_started');

  dispatch((analytics) =>
    analytics.capture('onboarding_started', {
      step_key: meta?.stepKey ?? null,
      step_title: meta?.title ?? null,
      step_number: meta?.order ?? null,
      step_total: meta?.totalSteps ?? null,
      block_key: meta?.blockKey ?? null,
      pathname: meta?.pathname ?? null,
    }),
  );
}

type OnboardingStepInput = number | string | OnboardingStepMeta;

function resolveOnboardingStep(input: OnboardingStepInput): OnboardingStepMeta | null {
  if (typeof input === 'number') return null;
  if (typeof input === 'string') return getOnboardingStepMeta(input);
  return input;
}

export function trackOnboardingStepViewed(step: string | OnboardingStepMeta) {
  const meta = resolveOnboardingStep(step);
  if (!meta) return;

  dispatch((analytics) =>
    analytics.capture('onboarding_step_viewed', {
      step_key: meta.stepKey,
      step_title: meta.title,
      step_number: meta.order,
      step_total: meta.totalSteps,
      block_key: meta.blockKey,
      block_label: meta.blockLabel,
      block_index: meta.blockIndex,
      step_in_block: meta.stepInBlock,
      steps_in_block: meta.stepsInBlock,
      is_upsell: meta.isUpsell ?? false,
      pathname: meta.pathname,
    }),
  );
}

export function trackOnboardingStep(step: OnboardingStepInput, dropped = false) {
  const meta = resolveOnboardingStep(step);

  dispatch((analytics) =>
    analytics.capture('onboarding_step_completed', {
      step_number: meta?.order ?? (typeof step === 'number' ? step : null),
      step_total: meta?.totalSteps ?? null,
      step_key: meta?.stepKey ?? null,
      step_title: meta?.title ?? null,
      block_key: meta?.blockKey ?? null,
      block_label: meta?.blockLabel ?? null,
      block_index: meta?.blockIndex ?? null,
      step_in_block: meta?.stepInBlock ?? null,
      steps_in_block: meta?.stepsInBlock ?? null,
      is_upsell: meta?.isUpsell ?? false,
      pathname: meta?.pathname ?? null,
      dropped_off: dropped,
    }),
  );
}

/**
 * Track when user skips onboarding step
 * Used for funnel analysis and UX optimization
 */
export function trackOnboardingSkipped(
  meta: OnboardingStepMeta,
  reason?: string,
): void {
  dispatch((analytics) => {
    analytics.capture('onboarding_skipped', {
      step: meta.pathname,
      step_number: meta.order,
      step_title: meta.title,
      reason: reason ?? 'skip_button',
    });
  });
}

/**
 * Track when user goes back to previous step
 * Used for identifying problematic steps
 */
export function trackOnboardingBack(
  meta: OnboardingStepMeta,
): void {
  dispatch((analytics) => {
    analytics.capture('onboarding_back', {
      step: meta.pathname,
      step_number: meta.order,
      step_title: meta.title,
    });
  });
}

/**
 * Track onboarding errors
 * Used for reliability monitoring and debugging
 */
export function trackOnboardingStepError(
  stepPathname: string,
  errorCode: string,
  errorMessage?: string,
): void {
  dispatch((analytics) => {
    analytics.capture('onboarding_step_error', {
      step: stepPathname,
      error_code: errorCode,
      error_message: errorMessage,
    });
  });
}

export function trackOnboardingCompleted(plan: 'included') {
  dispatch((analytics) => analytics.capture('onboarding_completed', { plan_selected: plan }));
}

export function trackMissionCompleted(day: number, missionType: string) {
  dispatch((analytics) =>
    analytics.capture('first_week_mission_completed', {
      day_number: day,
      mission_type: missionType,
    }),
  );
}

export function trackModuleOpened(module: string, source: 'home' | 'notification' | 'direct') {
  dispatch((analytics) => analytics.capture('module_opened', { module_name: module, source }));
}

export function trackModuleEnabled(module: string, source: string = 'settings') {
  dispatch((analytics) =>
    analytics.capture('module_enabled', {
      module_name: module,
      source,
    }),
  );
}

export function trackModuleDisabled(module: string, source: string = 'settings') {
  dispatch((analytics) =>
    analytics.capture('module_disabled', {
      module_name: module,
      source,
    }),
  );
}

export function trackScreenViewed(meta: RouteMeta) {
  dispatch((analytics) =>
    analytics.capture('screen_viewed', {
      pathname: meta.pathname,
      screen_key: meta.screenKey,
      screen_title: meta.title,
      surface: meta.surface,
      module_name: meta.moduleId ?? null,
      tab_key: meta.tabKey ?? null,
      alias_of: meta.aliasOf ?? null,
    }),
  );
}

export function trackScreenStateViewed(
  screenKey: string,
  state: 'loading' | 'error' | 'empty' | 'ready',
) {
  dispatch((analytics) =>
    analytics.capture('screen_state_viewed', {
      screen_key: screenKey,
      state,
    }),
  );
}

export function trackAuthIntentSaved(route: string, trigger: 'auth_guard' | 'paywall') {
  dispatch((analytics) =>
    analytics.capture('auth_intent_saved', {
      route,
      trigger,
    }),
  );
}

export function trackAuthIntentConsumed(route: string) {
  dispatch((analytics) =>
    analytics.capture('auth_intent_consumed', {
      route,
    }),
  );
}

export function trackHomeViewed(props: {
  daily_score: number | null;
  top_priority: string | null;
  attention_count: number;
  streak_in_danger: boolean;
  module_count: number;
}) {
  dispatch((analytics) => analytics.capture('home_viewed', props));
}

export function trackHomePrimaryActionViewed(
  actionKey: string,
  destination: string,
  props?: Record<string, unknown>,
) {
  dispatch((analytics) =>
    analytics.capture('home_primary_action_viewed', {
      action_key: actionKey,
      destination,
      ...props,
    }),
  );
}

export function trackHomePrimaryActionCompleted(
  actionKey: string,
  destination: string,
  props?: Record<string, unknown>,
) {
  dispatch((analytics) =>
    analytics.capture('home_primary_action_completed', {
      action_key: actionKey,
      destination,
      ...props,
    }),
  );
}

export function trackHomeActionTapped(
  actionKey: string,
  destination: string,
  props?: Record<string, unknown>,
) {
  dispatch((analytics) =>
    analytics.capture('home_action_tapped', {
      action_key: actionKey,
      destination,
      ...props,
    }),
  );
}

export function trackLogCreated(module: string, source: string, ms?: number) {
  dispatch((analytics) => analytics.capture('log_created', { module, source, ms }));
  dispatch((analytics) => analytics.capture('habit_logged', { module, source, ms }));
  void captureFirstActionOnce('log_created', { module, source, ms });
}

export function trackHabitLogged(module: string, source: string, ms?: number) {
  dispatch((analytics) => analytics.capture('habit_logged', { module, source, ms }));
}

export function trackQuickLogOpened(mode?: string, source: string = 'home') {
  dispatch((analytics) =>
    analytics.capture('quick_log_opened', {
      mode: mode ?? 'menu',
      source,
    }),
  );
}

export function trackQuickLogCompleted(module: string, props?: Record<string, unknown>) {
  dispatch((analytics) =>
    analytics.capture('quick_log_completed', {
      module,
      ...props,
    }),
  );
}

export function trackWorkoutStarted(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('workout_started', props ?? {}));
}

export function trackWorkoutSetLogged(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('workout_set_logged', props ?? {}));
}

export function trackWorkoutCompleted(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('workout_completed', props ?? {}));
  void captureFirstActionOnce('workout_completed', props);
}

export function trackNutritionSearchStarted(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('nutrition_search_started', props ?? {}));
}

export function trackNutritionFoodLogged(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('nutrition_food_logged', props ?? {}));
  void captureFirstActionOnce('nutrition_food_logged', props);
}

export function trackWaterLogged(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('water_logged', props ?? {}));
  void captureFirstActionOnce('water_logged', props);
}

export function trackSleepLogged(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('sleep_logged', props ?? {}));
  void captureFirstActionOnce('sleep_logged', props);
}

export function trackStepsSourceConnected(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('steps_source_connected', props ?? {}));
}

export function trackNotificationPermissionRequested(surface: string = 'settings') {
  dispatch((analytics) =>
    analytics.capture('notification_permission_requested', {
      surface,
    }),
  );
}

export function trackNotificationPermissionGranted(surface: string = 'settings') {
  dispatch((analytics) =>
    analytics.capture('notification_permission_granted', {
      surface,
    }),
  );
}

export function trackPaywallViewed(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('paywall_viewed', props ?? {}));
}

export function trackTrialStarted(props?: Record<string, unknown>) {
  dispatch((analytics) => analytics.capture('trial_started', props ?? {}));
}

export function trackStreakMilestone(days: number) {
  dispatch((analytics) => analytics.capture('streak_milestone_reached', { streak_days: days }));
}

export function trackStreakBroken(days: number) {
  dispatch((analytics) => analytics.capture('streak_broken', { streak_days: days }));
}

export function trackStepsGoalReached(goal: number, steps: number) {
  dispatch((analytics) => analytics.capture('steps_goal_reached', { goal, steps }));
}

type AdTelemetryProps = Record<string, unknown> & {
  provider?: string;
  placement_key?: string;
  placement_id?: string;
  ad_format?: string;
};

function captureAdTelemetry(action: string, props?: AdTelemetryProps) {
  const payload = {
    action,
    ...(props ?? {}),
  };

  dispatch((analytics) => analytics.capture('ad_event', payload));

  if (
    action === 'ad_open' ||
    action === 'ad_complete' ||
    action === 'ad_close' ||
    action === 'ad_click'
  ) {
    dispatch((analytics) => analytics.capture(action, props));
  }
}

export function trackAdEvent(action: string, props?: Record<string, unknown>) {
  captureAdTelemetry(action, props);
}

export function trackAdOpen(props?: AdTelemetryProps) {
  captureAdTelemetry('ad_open', props);
}

export function trackAdComplete(props?: AdTelemetryProps) {
  captureAdTelemetry('ad_complete', props);
}

export function trackAdClose(props?: AdTelemetryProps) {
  captureAdTelemetry('ad_close', props);
}

export function trackAdClick(props?: AdTelemetryProps) {
  captureAdTelemetry('ad_click', props);
}

export function flushAnalytics() {
  dispatch((analytics) => analytics.flush());
}
