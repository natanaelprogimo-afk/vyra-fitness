// ============================================================
// VYRA FITNESS — Analytics (PostHog)
// Wrapper tipado con todos los eventos de la app
// ============================================================

// PostHog not installed - analytics disabled
type PostHog = any;

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = 'https://app.posthog.com';

// Singleton — inicializar una sola vez
let _client: PostHog | null = null;

export function getAnalytics(): PostHog | null {
  // Analytics disabled - PostHog module not available
  return null;
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