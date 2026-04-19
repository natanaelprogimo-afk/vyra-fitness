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
      .catch(() => {
        client = null;
        return null;
      });

    return clientPromise;
  } catch {
    client = null;
    clientPromise = Promise.resolve(null);
    return clientPromise;
  }
}

function dispatch(action: (analytics: PostHogClient) => void) {
  const ready = client;
  if (ready) {
    action(ready);
    return;
  }

  void ensureAnalytics().then((analytics) => {
    if (analytics) action(analytics);
  });
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

export function trackOnboardingCompleted(plan: 'free' | 'premium' | 'trial') {
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
}

export function trackHabitLogged(module: string, source: string, ms?: number) {
  dispatch((analytics) => analytics.capture('habit_logged', { module, source, ms }));
}

export function trackPaywallViewed(trigger: string) {
  dispatch((analytics) => analytics.capture('premium_paywall_viewed', { trigger }));
}

export function trackPaywallConverted(plan: string) {
  dispatch((analytics) => analytics.capture('paywall_converted', { plan }));
}

export function trackPaypalCheckoutStarted(plan: string) {
  dispatch((analytics) => analytics.capture('paypal_checkout_started', { plan_selected: plan }));
}

export function trackPaypalCheckoutCompleted(plan: string) {
  dispatch((analytics) => analytics.capture('paypal_checkout_completed', { plan }));
}

export function trackSubscriptionCancelled(plan: string, tenureDays: number) {
  dispatch((analytics) =>
    analytics.capture('premium_subscription_cancelled', {
      plan,
      tenure_days: tenureDays,
    }),
  );
}

export function trackContextMessage(isPremium: boolean, countToday: number) {
  dispatch((analytics) =>
    analytics.capture('context_message_sent', {
      is_premium: isPremium,
      message_count_today: countToday,
    }),
  );
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

export function flushAnalytics() {
  dispatch((analytics) => analytics.flush());
}
