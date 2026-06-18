export const Routes = {
  auth: {
    welcome: '/(auth)/welcome',
    login: '/(auth)/login',
    register: '/(auth)/register',
    forgotPassword: '/(auth)/forgot-password',
    resetPassword: '/reset-password',
    google: '/(auth)/google',
    apple: '/(auth)/apple',
    onboarding: {
      transition: '/(auth)/onboarding/setup-transition',
      setupMode: '/(auth)/onboarding/setup-mode',
      sex: '/(auth)/onboarding/step-sex',
      name: '/(auth)/onboarding/step-name',
      goal: '/(auth)/onboarding/step-goal',
      age: '/(auth)/onboarding/step-age',
      height: '/(auth)/onboarding/step-height',
      weight: '/(auth)/onboarding/step-weight',
      activity: '/(auth)/onboarding/step-activity',
      composition: '/(auth)/onboarding/step-composition',
      nutrition: '/(auth)/onboarding/step-nutrition',
      water: '/(auth)/onboarding/step-water',
      equipment: '/(auth)/onboarding/step-equipment',
      equipmentInventory: '/(auth)/onboarding/step-equipment-inventory',
      modules: '/(auth)/onboarding/step-modules',
      fasting: '/(auth)/onboarding/step-fasting',
      sleep: '/(auth)/onboarding/step-sleep',
      steps: '/(auth)/onboarding/step-steps',
      female: '/(auth)/onboarding/step-female',
      ready: '/(auth)/onboarding/step-ready',
      expressGoal: '/(auth)/onboarding/express-goal',
      expressWeight: '/(auth)/onboarding/express-weight',
      expressReady: '/(auth)/onboarding/express-ready',
      base: '/(auth)/onboarding/setup-transition',
      finish: '/(auth)/onboarding/step-ready',
    },
  },

  tabs: {
    home: '/(tabs)',
    explore: '/(tabs)/explore',
    progress: '/(tabs)/progress',
    profile: '/profile/sheet',
  },

  readiness: '/readiness',

  progress: {
    index: '/(tabs)/progress',
    history: '/modules/progress/history',
    insights: '/modules/progress/insights',
  },

  water: {
    index: '/modules/water',
    history: '/modules/water/history',
    settings: '/modules/water/settings',
  },

  steps: {
    index: '/modules/steps',
    week: '/modules/steps/week',
    settings: '/modules/steps/settings',
  },

  fasting: {
    index: '/modules/fasting',
    protocols: '/modules/fasting/protocols',
    analysis: '/modules/fasting/analysis',
    settings: '/modules/fasting/settings',
  },

  sleep: {
    index: '/modules/sleep',
    log: '/modules/sleep/log',
    insights: '/modules/sleep/insights',
    history: '/modules/sleep/history',
    settings: '/modules/sleep/settings',
  },

  nutrition: {
    index: '/modules/nutrition',
    log: '/modules/nutrition/log',
    barcode: '/modules/nutrition/barcode-scan',
    history: '/modules/nutrition/history',
    settings: '/modules/nutrition/settings',
  },

  workout: {
    index: '/modules/workout',
    preview: '/modules/workout/session-preview',
    session: '/modules/workout/session',
    sessionDetail: '/modules/workout/session-detail',
    programs: '/modules/workout/programs',
    exercises: '/modules/workout/exercise-create',
    exerciseDetail: '/modules/workout/exercise-detail',
    routines: '/modules/workout/routines',
    routineEditor: '/modules/workout/routine-editor',
    planner: '/modules/workout/planner',
    summary: '/modules/workout/summary',
    done: '/modules/workout/done',
    settings: '/modules/workout/settings',
  },

  supplements: {
    index: '/modules/supplements',
    history: '/modules/supplements/history',
    settings: '/modules/supplements/settings',
  },

  female: {
    index: '/modules/female',
    settings: '/modules/female/settings',
  },

  profile: {
    sheet: '/profile/sheet',
    edit: '/profile/edit',
    claimAccount: '/profile/claim-account',
    femaleHealth: '/profile/female-health',
    changePassword: '/profile/change-password',
    deleteAccount: '/profile/delete-account',
    support: '/profile/support',
    exportData: '/profile/export-data',
    referral: '/profile/referral',
  },

  legal: {
    terms: '/legal/terms',
    privacy: '/legal/privacy',
  },

  settings: {
    index: '/settings/',
    modules: '/settings/modules',
    notificationsSettings: '/settings/notifications-settings',
    appearance: '/settings/appearance',
    units: '/settings/appearance',
    privacy: '/settings/privacy',
    account: '/settings/account',
  },
} as const;
