export const Routes = {
  auth: {
    welcome: '/(auth)/welcome',
    login: '/(auth)/login',
    register: '/(auth)/register',
    forgotPassword: '/(auth)/forgot-password',
    resetPassword: '/reset-password',
    google: '/(auth)/google',
    onboarding: {
      transition: '/(auth)/onboarding/step-goals',
      goals: '/(auth)/onboarding/step-goals',
      equipment: '/(auth)/onboarding/step-equipment',
      modules: '/(auth)/onboarding/step-modules',
      ready: '/(auth)/onboarding/step-ready',
      base: '/(auth)/onboarding/step-equipment',
      finish: '/(auth)/onboarding/step-ready',
    },
  },

  tabs: {
    home: '/(tabs)/',
    progress: '/(tabs)/progress',
    profile: '/profile/sheet',
    context: '/(tabs)/',
  },

  progress: {
    index: '/(tabs)/progress',
    history: '/modules/progress/history',
    insights: '/modules/progress/insights',
  },

  log: '/(tabs)/',

  water: {
    index: '/modules/water/',
    day: '/modules/water/',
    history: '/modules/water/history',
    settings: '/modules/water/settings',
    custom: '/modules/water/',
    drinkBuilder: '/modules/water/',
    reminders: '/modules/water/settings',
  },

  steps: {
    index: '/modules/steps/',
    cardio: '/modules/steps/',
    map: '/modules/steps/',
    history: '/modules/steps/history',
    week: '/modules/steps/week',
    calibration: '/modules/steps/settings',
    settings: '/modules/steps/settings',
  },

  fasting: {
    index: '/modules/fasting/',
    protocols: '/modules/fasting/protocols',
    history: '/modules/fasting/history',
    analysis: '/modules/fasting/analysis',
    settings: '/modules/fasting/settings',
  },

  sleep: {
    index: '/modules/sleep/',
    log: '/modules/sleep/log',
    insights: '/modules/sleep/insights',
    history: '/modules/sleep/history',
    settings: '/modules/sleep/settings',
  },

  nutrition: {
    index: '/modules/nutrition/',
    log: '/modules/nutrition/log',
    search: '/modules/nutrition/search',
    food: '/modules/nutrition/food-detail',
    barcode: '/modules/nutrition/barcode-scan',
    recipes: '/modules/nutrition/recipes',
    history: '/modules/nutrition/history',
    mode: '/modules/nutrition/log',
    settings: '/modules/nutrition/settings',
  },

  weight: {
    index: '/(tabs)/progress',
    log: '/(tabs)/progress',
    photos: '/(tabs)/progress',
    history: '/modules/progress/history',
    settings: '/settings/account',
  },

  recovery: {
    index: '/modules/recovery/',
    history: '/modules/recovery/history',
    settings: '/modules/recovery/settings',
  },

  workout: {
    index: '/modules/workout/',
    preview: '/modules/workout/session-preview',
    session: '/modules/workout/session',
    sessionDetail: '/modules/workout/session-detail',
    programs: '/modules/workout/programs',
    exercises: '/modules/workout/exercises',
    exerciseDetail: '/modules/workout/exercise-detail',
    exerciseCreate: '/modules/workout/exercise-create',
    routines: '/modules/workout/routines',
    routineBuilder: '/modules/workout/routine-editor',
    routineEditor: '/modules/workout/routine-editor',
    routineTemplates: '/modules/workout/routine-editor',
    prs: '/modules/workout/insights?tab=prs',
    stats: '/modules/workout/insights?tab=stats',
    planner: '/modules/workout/planner',
    summary: '/modules/workout/summary',
    done: '/modules/workout/done',
    history: '/modules/workout/insights?tab=history',
    insights: '/modules/workout/insights',
    settings: '/modules/workout/settings',
  },

  mental: {
    index: '/(tabs)/progress',
    history: '/(tabs)/progress',
    insights: '/(tabs)/progress',
    settings: '/settings/notifications-settings',
  },

  context: {
    index: '/(tabs)/',
    history: '/settings/notifications-history',
    settings: '/settings/notifications-settings',
  },

  supplements: {
    index: '/modules/supplements/',
    history: '/modules/supplements/history',
    settings: '/modules/supplements/settings',
  },

  female: {
    index: '/modules/female/',
    symptoms: '/modules/female/symptoms',
    history: '/modules/female/history',
    settings: '/modules/female/settings',
  },

  profile: {
    index: '/profile/sheet',
    sheet: '/profile/sheet',
    edit: '/profile/edit',
    weightGoal: '/settings/account',
    femaleHealth: '/profile/female-health',
    changePassword: '/profile/change-password',
    deleteAccount: '/profile/delete-account',
    support: '/profile/support',
    exportData: '/profile/export-data',
  },

  legal: {
    terms: '/legal/terms',
    privacy: '/legal/privacy',
  },

  dailySummary: '/(tabs)/progress',

  intelligence: {
    whyVyra: '/(tabs)/',
  },

  kora: '/(tabs)/progress',

  premium: {
    paywall: '/premium/paywall',
    manage: '/premium/manage',
  },

  paywall: '/premium/paywall',

  growth: {
    invite: '/growth/invite',
  },

  settings: {
    index: '/settings/',
    sessions: '/settings/account',
    modules: '/settings/modules',
    notifications: '/settings/notifications-settings',
    notificationsHistory: '/settings/notifications-history',
    notificationsSettings: '/settings/notifications-settings',
    appearance: '/settings/appearance',
    context: '/settings/notifications-settings',
    coach: '/settings/notifications-settings',
    widgets: '/settings/widgets',
    theme: '/settings/appearance',
    units: '/settings/appearance',
    language: '/settings/appearance',
    privacy: '/settings/privacy',
    account: '/settings/account',
    danger: '/settings/account',
  },
} as const;
