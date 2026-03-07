// ============================================================
// VYRA FITNESS — Tipos de navegación (Expo Router v3)
// ============================================================

// Parámetros de rutas con parámetros dinámicos
export type RootStackParamList = {
  // Auth
  '(auth)/welcome':                    undefined;
  '(auth)/login':                      undefined;
  '(auth)/register':                   undefined;
  '(auth)/onboarding/step1-goals':     undefined;
  '(auth)/onboarding/step2-body':      undefined;
  '(auth)/onboarding/step3-activity':  undefined;
  '(auth)/onboarding/step4-schedule':  undefined;
  '(auth)/onboarding/step5-premium':   undefined;

  // Tabs
  '(tabs)/':        undefined;
  '(tabs)/log':     undefined;
  '(tabs)/progress':undefined;
  '(tabs)/coach':   undefined;
  '(tabs)/profile': undefined;

  // Módulos
  'modules/water/index':      undefined;
  'modules/water/history':    undefined;
  'modules/water/settings':   undefined;
  'modules/steps/index':      undefined;
  'modules/steps/cardio-active': undefined;
  'modules/steps/map':        undefined;
  'modules/steps/history':    undefined;
  'modules/steps/calibration':undefined;
  'modules/fasting/index':    undefined;
  'modules/fasting/protocols':undefined;
  'modules/fasting/history':  undefined;
  'modules/sleep/index':      undefined;
  'modules/sleep/log':        undefined;
  'modules/sleep/history':    undefined;
  'modules/nutrition/index':  undefined;
  'modules/nutrition/search': undefined;
  'modules/nutrition/food-detail': { foodId: string } | { mode: 'new' };
  'modules/nutrition/photo-log':   undefined;
  'modules/nutrition/voice-log':   undefined;
  'modules/nutrition/recipes':     undefined;
  'modules/nutrition/history':     undefined;
  'modules/weight/index':     undefined;
  'modules/weight/log':       undefined;
  'modules/weight/photos':    undefined;
  'modules/weight/history':   undefined;
  'modules/workout/index':    undefined;
  'modules/workout/active':   { routineId?: string; routineName?: string };
  'modules/workout/rest-timer':{ seconds: number };
  'modules/workout/recovery': undefined;
  'modules/workout/exercises':undefined;
  'modules/workout/routines': undefined;
  'modules/workout/summary':  { sessionId: string };
  'modules/workout/history':  undefined;
  'modules/mental/history':   undefined;
  'modules/supplements/index':undefined;
  'modules/female/index':     undefined;
  'modules/female/symptoms':  undefined;
  'modules/female/history':   undefined;

  // Premium
  'premium/paywall': { trigger?: PaywallTrigger };
  'premium/manage':  undefined;

  // Store
  'store/shop':        undefined;
  'store/item-detail': { itemId: string };

  // Settings
  'settings/index':         undefined;
  'settings/notifications': undefined;
  'settings/coach':         undefined;
  'settings/theme':         undefined;
  'settings/units':         undefined;
  'settings/privacy':       undefined;
  'settings/account':       undefined;
  'settings/danger':        undefined;
};

// Triggers del paywall — para analytics
export type PaywallTrigger =
  | 'feature_lock'
  | 'coach_limit'
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
export type TabName = 'index' | 'log' | 'progress' | 'coach' | 'profile';
