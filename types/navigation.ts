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
  '(auth)/onboarding/step-sex':        undefined;
  '(auth)/onboarding/step-name':       undefined;
  '(auth)/onboarding/step-goal':       undefined;
  '(auth)/onboarding/step-age':        undefined;
  '(auth)/onboarding/step-height':     undefined;
  '(auth)/onboarding/step-weight':     undefined;
  '(auth)/onboarding/step-activity':   undefined;
  '(auth)/onboarding/step-composition':undefined;
  '(auth)/onboarding/step-equipment':  undefined;
  '(auth)/onboarding/step-equipment-inventory': undefined;
  '(auth)/onboarding/step-ready':      undefined;
  // Tabs
  '(tabs)/':        undefined;
  '(tabs)/progress':undefined;

  // Módulos
  'modules/water/index':      undefined;
  'modules/water/history':    undefined;
  'modules/water/settings':   undefined;
  'modules/steps/index':      undefined;
  'modules/fasting/index':    undefined;
  'modules/fasting/protocols':undefined;
  'modules/sleep/index':      undefined;
  'modules/sleep/log':        undefined;
  'modules/sleep/history':    undefined;
  'modules/nutrition/index':  undefined;
  'modules/nutrition/history':     undefined;
  'modules/workout/index':    undefined;
  'modules/workout/summary':  { sessionId: string };
  'modules/supplements/index':undefined;
  'modules/female/index':     undefined;

  // Premium
  'premium/paywall': { trigger?: PaywallTrigger };
  'premium/manage':  undefined;

  // Settings
  'settings/index':         undefined;
  'settings/notifications-settings': undefined;
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
