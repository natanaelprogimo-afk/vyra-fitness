// ============================================================
// VYRA FITNESS — Tipos de navegación (Expo Router v3)
// ============================================================

// Parámetros de rutas con parámetros dinámicos
export type RootStackParamList = {
  // Auth
  '(auth)/welcome':                    undefined;
  '(auth)/login':                      undefined;
  '(auth)/register':                   undefined;
  '(auth)/onboarding/setup-transition':undefined;
  '(auth)/onboarding/step-goals':      undefined;
  // Tabs
  '(tabs)/':        undefined;
  '(tabs)/progress':undefined;

  // Módulos
  'modules/water/index':      undefined;
  'modules/water/history':    undefined;
  'modules/water/settings':   undefined;
  'modules/steps/index':      undefined;
  'modules/steps/history':    undefined;
  'modules/fasting/index':    undefined;
  'modules/fasting/protocols':undefined;
  'modules/fasting/history':  undefined;
  'modules/sleep/index':      undefined;
  'modules/sleep/log':        undefined;
  'modules/sleep/history':    undefined;
  'modules/nutrition/index':  undefined;
  'modules/nutrition/search': undefined;
  'modules/nutrition/food-detail': { foodId: string } | { mode: 'new' };
  'modules/nutrition/recipes':     undefined;
  'modules/nutrition/history':     undefined;
  'modules/workout/index':    undefined;
  'modules/workout/exercises':undefined;
  'modules/workout/routines': undefined;
  'modules/workout/insights': undefined;
  'modules/workout/summary':  { sessionId: string };
  'modules/supplements/index':undefined;
  'modules/female/index':     undefined;
  'modules/female/symptoms':  undefined;
  'modules/female/history':   undefined;

  // Premium
  'premium/paywall': { trigger?: PaywallTrigger };
  'premium/manage':  undefined;

  // Settings
  'settings/index':         undefined;
  'settings/notifications-settings': undefined;
  'settings/notifications-history': undefined;
  'settings/appearance':    undefined;
  'settings/privacy':       undefined;
  'settings/account':       undefined;
};

// Triggers del paywall — para analytics
export type PaywallTrigger =
  | 'feature_lock'
  | 'context_limit'
  | 'barcode_limit'
  | 'history_limit'
  | 'photo_ai'
  | 'voice_log'
  | 'fasting_premium'
  | 'sleep_phases'
  | 'weight_projection'
  | 'gps_cardio'
  | 'organic'
  | 'progress_trends'
  | 'mental_insights'
  | 'sleep_insights';

// Tab names
export type TabName = 'index' | 'progress';
