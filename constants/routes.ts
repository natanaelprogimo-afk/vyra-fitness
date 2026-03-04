// ============================================================
// VYRA FITNESS — Rutas de navegación
// Usar SIEMPRE estas constantes. Nunca hardcodear strings de rutas.
// ============================================================

export const Routes = {
  // ─── Auth ─────────────────────────────────────────────────
  auth: {
    welcome:    '/(auth)/welcome',
    login:      '/(auth)/login',
    register:   '/(auth)/register',
    onboarding: {
      step1: '/(auth)/onboarding/step1-goals',
      step2: '/(auth)/onboarding/step2-body',
      step3: '/(auth)/onboarding/step3-activity',
      step4: '/(auth)/onboarding/step4-schedule',
      step5: '/(auth)/onboarding/step5-premium',
    },
  },

  // ─── Tabs principales ─────────────────────────────────────
  tabs: {
    home:     '/(tabs)/',
    log:      '/(tabs)/log',
    progress: '/(tabs)/progress',
    coach:    '/(tabs)/coach',
    profile:  '/(tabs)/profile',
  },

  // ─── Módulos ──────────────────────────────────────────────
  water: {
    index:    '/modules/water/',
    history:  '/modules/water/history',
    settings: '/modules/water/settings',
  },
  steps: {
    index:       '/modules/steps/',
    cardio:      '/modules/steps/cardio-active',
    map:         '/modules/steps/map',
    history:     '/modules/steps/history',
    calibration: '/modules/steps/calibration',
  },
  fasting: {
    index:     '/modules/fasting/',
    protocols: '/modules/fasting/protocols',
    history:   '/modules/fasting/history',
  },
  sleep: {
    index:    '/modules/sleep/',
    log:      '/modules/sleep/log',
    history:  '/modules/sleep/history',
    settings: '/modules/sleep/settings',
  },
  nutrition: {
    index:   '/modules/nutrition/',
    search:  '/modules/nutrition/search',
    food:    '/modules/nutrition/food-detail',
    photo:   '/modules/nutrition/photo-log',
    voice:   '/modules/nutrition/voice-log',
    recipes: '/modules/nutrition/recipes',
    history: '/modules/nutrition/history',
  },
  weight: {
    index:   '/modules/weight/',
    log:     '/modules/weight/log',
    photos:  '/modules/weight/photos',
    history: '/modules/weight/history',
  },
  workout: {
    index:    '/modules/workout/',
    active:   '/modules/workout/active',
    rest:     '/modules/workout/rest-timer',
    recovery: '/modules/workout/recovery',
    exercises:'/modules/workout/exercises',
    routines: '/modules/workout/routines',
    summary:  '/modules/workout/summary',
    history:  '/modules/workout/history',
  },
  mental: {
    history: '/modules/mental/history',
  },
  supplements: {
    index: '/modules/supplements/',
  },
  female: {
    index:    '/modules/female/',
    symptoms: '/modules/female/symptoms',
    history:  '/modules/female/history',
  },

  // ─── Premium ──────────────────────────────────────────────
  premium: {
    paywall: '/premium/paywall',
    manage:  '/premium/manage',
  },

  // ─── Tienda ───────────────────────────────────────────────
  store: {
    shop:   '/store/shop',
    item:   '/store/item-detail',
  },

  // ─── Settings ─────────────────────────────────────────────
  settings: {
    index:         '/settings/',
    notifications: '/settings/notifications',
    theme:         '/settings/theme',
    units:         '/settings/units',
    privacy:       '/settings/privacy',
    account:       '/settings/account',
    danger:        '/settings/danger',
  },
} as const;