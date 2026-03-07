// ============================================================
// VYRA FITNESS — Analytics (PostHog)
// Wrapper tipado con todos los eventos de la app
// ============================================================

// ============================================================
// VYRA FITNESS — Analytics (PostHog)
// Wrapper tipado con todos los eventos de la app
// ============================================================

type PostHogClient = any;

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

let _client: PostHogClient | null = null;

export function getAnalytics(): PostHogClient | null {
  if (_client) return _client;
  if (!POSTHOG_KEY) return null;

  try {
    // Dynamically require the native PostHog client so the module is optional
    // in non-native environments (web/tests).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PostHog } = require('posthog-react-native');
    _client = new PostHog(POSTHOG_KEY, { apiHost: POSTHOG_HOST });
    return _client;
  } catch (err) {
    // If the native module isn't available, gracefully disable analytics.
    _client = null;
    return null;
  }
}

export function initAnalytics(): PostHogClient | null {
  return getAnalytics();
}

// ─── Identificación de usuario ───────────────────────────────
export function identifyUser(userId: string, props?: Record<string, unknown>) {
  getAnalytics()?.identify(userId, props);
}

export function resetUser() {
  getAnalytics()?.reset();
}

// ─── Eventos tipados ─────────────────────────────────────────

// Onboarding
export function trackOnboardingStep(step: number, dropped: boolean = false) {
  getAnalytics()?.capture('onboarding_step_completed', {
    step_number: step,
    dropped_off:  dropped,
  });
}

export function trackOnboardingCompleted(plan: 'free' | 'premium' | 'trial') {
  getAnalytics()?.capture('onboarding_completed', { plan_selected: plan });
}

// Primera semana
export function trackMissionCompleted(day: number, missionType: string) {
  getAnalytics()?.capture('first_week_mission_completed', {
    day_number:   day,
    mission_type: missionType,
  });
}

// Módulos
export function trackModuleOpened(module: string, source: 'home' | 'notification' | 'direct') {
  getAnalytics()?.capture('module_opened', { module_name: module, source });
}

export function trackLogCreated(module: string, source: string, ms?: number) {
  getAnalytics()?.capture('log_created', { module, source, ms });
}

// Premium / PayPal
export function trackPaywallViewed(trigger: string) {
  getAnalytics()?.capture('premium_paywall_viewed', { trigger });
}

export function trackPaypalCheckoutStarted(plan: string) {
  getAnalytics()?.capture('paypal_checkout_started', { plan_selected: plan });
}

export function trackPaypalCheckoutCompleted(plan: string) {
  getAnalytics()?.capture('paypal_checkout_completed', { plan });
}

export function trackSubscriptionCancelled(plan: string, tenureDays: number) {
  getAnalytics()?.capture('premium_subscription_cancelled', {
    plan, tenure_days: tenureDays,
  });
}

// Unity Ads
export function trackAdRewarded(context: string, coinsEarned: number, adUnit: string) {
  getAnalytics()?.capture('unity_ad_rewarded_completed', {
    context, coins_earned: coinsEarned, ad_unit: adUnit,
  });
}

// Coach IA
export function trackCoachMessage(isPremium: boolean, countToday: number) {
  getAnalytics()?.capture('coach_message_sent', {
    is_premium:          isPremium,
    message_count_today: countToday,
  });
}

// Gamificación
export function trackStreakMilestone(days: number) {
  getAnalytics()?.capture('streak_milestone_reached', { streak_days: days });
}

export function trackBadgeUnlocked(badgeId: string, rarity: string) {
  getAnalytics()?.capture('badge_unlocked', { badge_id: badgeId, rarity });
}

export function trackStorePurchase(itemId: string, tier: string, coinsSpent: number) {
  getAnalytics()?.capture('store_purchase_completed', {
    item_id: itemId, tier, coins_spent: coinsSpent,
  });
}

// Flush manual (llamar al cerrar la app)
export function flushAnalytics() {
  getAnalytics()?.flush();
}
