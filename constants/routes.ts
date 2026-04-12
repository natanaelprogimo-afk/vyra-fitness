// ============================================================

// VYRA FITNESS — Rutas de navegación

// Usar SIEMPRE estas constantes. Nunca hardcodear strings de rutas.

// ============================================================



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

      forgotPassword: '/(auth)/forgot-password',

      resetPassword: '/reset-password',

      google:     '/(auth)/google',

      onboarding: {

        transition: '/(auth)/onboarding/setup-transition',

        goals: '/(auth)/onboarding/step-goals',

        base: '/(auth)/onboarding/step-base',

        modules: '/(auth)/onboarding/step-modules',

        meta: '/(auth)/onboarding/step-goals-meta',

        permissions: '/(auth)/onboarding/step-permissions',

        legal: '/(auth)/onboarding/step-legal',

        finish: '/(auth)/onboarding/step-finish',

        step0: '/(auth)/onboarding/setup-transition',

        step1: '/(auth)/onboarding/step-goals',

        step2: '/(auth)/onboarding/step-base',

        step3: '/(auth)/onboarding/step-goals',

        step4: '/(auth)/onboarding/step-modules',

        activity: '/(auth)/onboarding/step-permissions',

        step5: '/(auth)/onboarding/step-modules',

        step6: '/(auth)/onboarding/step-goals-meta',

        premium: '/(auth)/onboarding/step-goals-meta',

        step7: '/(auth)/onboarding/step-permissions',

        step8: '/(auth)/onboarding/step-permissions',

        step9: '/(auth)/onboarding/step-finish',

      },

    },



    // ─── Tabs principales ─────────────────────────────────────

    tabs: {

      home:      '/(tabs)/',

      workout:   '/(tabs)/workout',

      nutrition: '/(tabs)/nutrition',

      progress:  '/(tabs)/progress',

      profile:   '/(tabs)/profile',

      coach:     '/modules/coach/',

    },



    progress: {

      index: '/(tabs)/progress',

      history: '/modules/progress/history',

      insights: '/modules/progress/insights',

    },



    log: '/log',



    // ─── Módulos ──────────────────────────────────────────────

    water: {

      index:    '/modules/water/',

      day:      '/modules/water/day',

      history:  '/modules/water/history',

      settings: '/modules/water/settings',

      custom:   '/modules/water/custom',

      drinkBuilder: '/modules/water/drink-builder',

      reminders: '/modules/water/reminders',

    },

    steps: {

      index:       '/modules/steps/',

      cardio:      '/modules/steps/cardio-active',

      map:         '/modules/steps/map',

      history:     '/modules/steps/history',

      week:        '/modules/steps/week',

      calibration: '/modules/steps/calibration',

      settings:    '/modules/steps/settings',

    },

    fasting: {

      index:     '/modules/fasting/',

      protocols: '/modules/fasting/protocols',

      history:   '/modules/fasting/history',

      analysis:  '/modules/fasting/analysis',

      settings:  '/modules/fasting/settings',

    },

    sleep: {

      index:    '/modules/sleep/',

      log:      '/modules/sleep/log',

      insights: '/modules/sleep/insights',

      history:  '/modules/sleep/history',

      settings: '/modules/sleep/settings',

    },

    nutrition: {

      index:   '/modules/nutrition/',

      log:     '/modules/nutrition/log',

      search:  '/modules/nutrition/search',

      food:    '/modules/nutrition/food-detail',

      barcode: '/modules/nutrition/barcode-scan',

      photo:   '/modules/nutrition/photo-log',

      voice:   '/modules/nutrition/voice-log',

      recipes: '/modules/nutrition/recipes',

      history: '/modules/nutrition/history',

      competition: '/modules/nutrition/competition-checkin',

      mode: '/modules/nutrition/mode',

      settings: '/modules/nutrition/settings',

    },

    weight: {

      index:   '/modules/weight/',

      log:     '/modules/weight/log',

      photos:  '/modules/weight/photos',

      history: '/modules/weight/history',

      settings: '/modules/weight/settings',

    },

    recovery: {

      index: '/modules/recovery/',

      history: '/modules/recovery/history',

      settings: '/modules/recovery/settings',

    },

    workout: {

      index:    '/modules/workout/',

      session:  '/modules/workout/session',

      sessionDetail: '/modules/workout/session-detail',

      active:   '/modules/workout/active',

      rest:     '/modules/workout/rest-timer',

      programs: '/modules/workout/programs',

      exercises:'/modules/workout/exercises',

      exerciseDetail: '/modules/workout/exercise-detail',

      exerciseCreate: '/modules/workout/exercise-create',

      routines: '/modules/workout/routines',

      routineBuilder: '/modules/workout/routine-builder',

      routineEditor:  '/modules/workout/routine-editor',

      routineTemplates: '/modules/workout/routine-templates',

      prs: '/modules/workout/prs',

      stats: '/modules/workout/stats',

      planner: '/modules/workout/planner',

      calories: '/modules/workout/calories',

      summary:  '/modules/workout/summary',

      history:  '/modules/workout/history',

      settings: '/modules/workout/settings',

    },

    mental: {

      index: '/modules/mental/',

      history: '/modules/mental/history',

      insights: '/modules/mental/insights',

      settings: '/modules/mental/settings',

    },

    coach: {

      index: '/modules/coach/',

      history: '/modules/coach/history',

      settings: '/modules/coach/settings',

    },

    supplements: {

      index: '/modules/supplements/',

      history: '/modules/supplements/history',

      settings: '/modules/supplements/settings',

    },

    female: {

      index:    '/modules/female/',

      symptoms: '/modules/female/symptoms',

      history:  '/modules/female/history',

      settings: '/modules/female/settings',

    },


    // Perfil

    profile: {

      edit: '/profile/edit',

      weightGoal: '/profile/weight-goal',

      femaleHealth: '/profile/female-health',

      changePassword: '/profile/change-password',

      deleteAccount: '/profile/delete-account',

      support: '/profile/support',

      exportData: '/profile/export-data',

    },


    // Legal

    legal: {

      terms: '/legal/terms',

      privacy: '/legal/privacy',

    },


    // Gamification

    gamification: {
      rank: '/gamification/rank',
      badges: '/gamification/badges',
      challenges: '/gamification/challenges',
    },


    // Experiencias / IA

    dailySummary: '/daily-summary',

    intelligence: {

      whyVyra: '/intelligence/why-vyra',

    },

    kora: '/kora',

    firstWeek: '/first-week',


    // ─── Premium ──────────────────────────────────────────────

    premium: {

      paywall: '/premium/paywall',

      manage:  '/premium/manage',

      value:   '/premium/value',

      pricing: '/premium/pricing',

      economy: '/premium/economy',

    },

    paywall: '/premium/paywall',


    // ─── Tienda ───────────────────────────────────────────────

    store: {

      shop:     '/store/shop',

      item:     '/store/item-detail',

      rewarded: '/store/rewarded',

    },


    // Growth / Viral

    growth: {

      invite:  '/growth/invite',

      friends: '/growth/friends',

      founding: '/growth/founding',

    },


    // ─── Settings ─────────────────────────────────────────────

    settings: {
      index:         '/settings/',
      sessions:      '/settings/sessions',
      modules:       '/settings/modules',
      notifications: '/settings/notifications',
      notificationsHistory: '/settings/notifications-history',

      notificationsSettings: '/settings/notifications-settings',
      appearance: '/settings/appearance',

      coach:         '/settings/coach',

      widgets:       '/settings/widgets',

      theme:         '/settings/theme',

      units:         '/settings/units',

      language:      '/settings/language',

      privacy:       '/settings/privacy',

      account:       '/settings/account',

      danger:        '/settings/danger',

    },

  } as const;

