export { ShellStrings } from './strings.shell.en';

export const ErrorMessages = {
  noInternet: 'You are offline. Keep logging and we will sync when the connection is back.',
  aiUnavailable: 'Context AI is unavailable right now. Try again in a few minutes.',
  saveFailed: 'I could not save right now. Your data stays safe and I will retry.',
  barcodeNotFound: 'I could not find that barcode. You can search the food or enter it manually.',
  paymentError: 'I could not complete this action. No changes were applied.',
  photoAIFailed: 'I could not read that meal clearly. Try another photo or enter it manually.',
  voiceLogFailed: 'I could not understand that voice entry. Try again or enter it manually.',
  loginFailed: 'I could not sign you in. Check your details and try again.',
  registerFailed: 'I could not create your account. Try again.',
  sessionExpired: 'Your session expired. Sign in again to continue.',
  premiumRequired: 'This feature is already available in your current access.',
  generic: 'Something went wrong. Try again in a moment.',
  loadFailed: 'I could not load the data. Pull to try again.',
  syncFailed: 'I could not sync. Your data is still safe locally.',
  permissionDenied: 'I need your permission to continue. You can change it in Settings.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Your fitness, clear from day one.',
    subtitle: 'Training, meals, water, sleep, and progress in one app.',
    cta: 'Create free account',
    login: 'Sign into my account',
    legal: 'By continuing, you accept our terms.',
  },
  login: {
    title: 'Welcome back',
    email: 'Email',
    password: 'Password',
    cta: 'Sign in',
    forgot: 'I forgot my password',
    noAccount: 'I do not have an account',
    register: 'Create account',
  },
  register: {
    title: 'Create account',
    name: 'Your name',
    email: 'Email',
    password: 'Password (minimum 8 characters)',
    cta: 'Create my account',
    haveAccount: 'I already have an account',
    login: 'Sign in',
    tosLabel: 'I accept the',
    tos: 'Terms of Service',
    and: 'and the',
    privacy: 'Privacy Policy',
    healthConsent: 'I consent to Vyra processing my health data to personalize my experience.',
    medicalDisclaimer:
      'I understand Vyra is not a medical device and does not replace professional evaluation.',
  },
  medicalModal: {
    title: 'Before you start',
    body:
      'Vyra is a wellness and fitness app. It is not a certified medical device and does not replace professional consultation, diagnosis, or treatment.',
    cta: 'Understood, continue',
  },
} as const;

export const OnboardingStrings = {
  step1: {
    title: 'What is your main goal?',
    subtitle: 'We use it to prepare a coherent starting experience.',
    goals: {
      lose_fat: 'Lose fat',
      gain_muscle: 'Gain muscle',
      general_health: 'General health',
      sport_performance: 'Sport performance',
      mental_wellbeing: 'General wellbeing',
    },
  },
  step2: {
    title: 'Where do you train?',
    subtitle: 'This lets us filter the right routine and exercise type.',
    gender: {
      label: 'Biological sex',
      male: 'Male',
      female: 'Female',
      non_binary: 'Non-binary',
      prefer_not_to_say: 'Prefer not to say',
    },
    age: 'Age',
    height: 'Height (cm)',
    weight: 'Current weight (kg)',
    goalWeight: 'Goal weight (kg, optional)',
  },
  step3: {
    title: 'What is your main focus?',
    subtitle: 'Choose the main module first and add support modules if you want.',
    levels: {
      0: 'Very low',
      1: 'Low',
      2: 'Moderate',
      3: 'Active',
      4: 'Very active',
      5: 'Athlete',
    },
    equipment: {
      label: 'Available equipment',
      gym: 'Full gym',
      home: 'Home with basic equipment',
      both: 'Both',
      outside: 'Outdoors',
      none: 'No equipment',
    },
  },
  step4: {
    title: 'All set',
    subtitle: 'We leave your first action ready for today.',
    wakeTime: 'Wake time',
    sleepTime: 'Sleep time',
    fasting: {
      label: 'Intermittent fasting',
      yes: 'Yes',
      no: 'No',
    },
    protocol: 'Protocol',
  },
  step5: {
    title: 'Open access',
    subtitle: 'Advanced functions ready from day one.',
    features: {
      aiCoach: 'Context AI',
      photoLog: 'Photo logging',
      voiceLog: 'Voice logging',
      unlimitedHistory: 'Extended history',
      correlations: 'More context and correlations',
      noAds: 'Open access from day one',
    },
    monthly: 'Open access',
    yearly: 'Everything ready',
    yearlyNote: 'No unlocks needed',
    trialCta: 'Enter Vyra',
    freeCta: 'Continue',
    freeNote: 'The product is already open and ready to use.',
  },
  next: 'Next',
  back: 'Back',
  skip: 'Skip',
  finish: 'Start',
  step: 'Step',
  of: 'of',
} as const;

export const DashboardStrings = {
  greeting: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  },
  dailyScore: 'Daily signal',
  streak: 'streak days',
  bestStreak: 'best streak',
  checkIn: 'Daily check-in',
  checkInDone: 'Check-in done',
  quickActions: 'Quick logs',
  todayMissions: 'This week',
  aiInsight: 'Today context:',
  noInsight: 'Complete your first entry to receive context.',
} as const;

export const ModuleNames = {
  water: 'Water',
  steps: 'Steps',
  fasting: 'Fasting',
  sleep: 'Sleep',
  nutrition: 'Nutrition',
  weight: 'Weight',
  workout: 'Workout',
  mental: 'Wellbeing',
  female: 'Female health',
  supplements: 'Supplements',
  recovery: 'Recovery',
} as const;

export const ModuleEmojis = {
  water: '💧',
  steps: '🚶',
  fasting: '⏳',
  sleep: '😴',
  nutrition: '🥗',
  weight: '⚖️',
  workout: '🏋️',
  mental: '🧠',
  female: '🌸',
  supplements: '💊',
  recovery: '🛌',
} as const;

export const Disclaimers = {
  context: 'Vyra context AI offers general guidance and does not replace professional care.',
  supplements:
    'Vyra does not recommend supplement doses or combinations. Consult a health professional.',
  bmi: 'BMI and body fat are estimates. They are not a medical diagnosis.',
  cycle: 'Cycle prediction is an estimate and must not be used as contraception.',
  fasting24h: 'Extended fasting is not right for everyone. Ask a professional if you have doubts.',
  deficitHigh:
    'An aggressive calorie deficit can be harmful long term. Consider professional nutrition advice.',
} as const;

export const NotificationStrings = {
  waterReminder: (ml: number, goal: number) => `You are at ${ml} ml of ${goal} ml. Add a glass?`,
  stepsReminder: (steps: number, goal: number) =>
    `You are at ${steps.toLocaleString()} of ${goal.toLocaleString()} steps.`,
  streakDanger: (days: number) =>
    `Your ${days}-day streak is at risk. One short action today keeps it alive.`,
  fastingPhase: (phase: string) => `You entered ${phase}. Your fast is still on track.`,
  goalReached: (goal: string) => `${goal} goal reached.`,
  prAchieved: (exercise: string, weight: number) => `New record: ${weight} kg on ${exercise}.`,
} as const;

export const General = {
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  back: 'Back',
  continue: 'Continue',
  retry: 'Try again',
  loading: 'Loading...',
  syncing: 'Syncing...',
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Week',
  month: 'Month',
  all: 'All',
  free: 'Free',
  premium: 'Included',
  upgrade: 'View access',
  history: 'History',
  settings: 'Settings',
  profile: 'Profile',
  logout: 'Sign out',
  or: 'or',
  and: 'and',
  of: 'of',
  for: 'for',
  done: 'Done',
  add: 'Add',
  remove: 'Remove',
  search: 'Search',
  noResults: 'No results',
  empty: 'Nothing here yet.',
  offline: 'Offline',
  online: 'Online',
} as const;

export const ValidationMessages = {
  emailInvalid: 'Email format is invalid.',
  passwordRequired: 'Password is required.',
  passwordTooShort: 'Password must be at least 8 characters.',
  ageTooYoung: 'You must be at least 13 years old to use Vyra.',
  ageInvalid: 'Age entered is invalid.',
  weightTooLow: 'Minimum weight is 20 kg.',
  weightInvalid: 'Weight entered is invalid.',
  heightTooLow: 'Minimum height is 50 cm.',
  heightInvalid: 'Height entered is invalid.',
  waterAmountTooHigh: 'Maximum amount is 5,000ml per entry.',
  waterGoalTooLow: 'Minimum goal is 500ml.',
  waterGoalTooHigh: 'Maximum goal is 10,000ml.',
  stepsGoalTooLow: 'Minimum goal is 1,000 steps.',
  stepsGoalTooHigh: 'Maximum goal is 100,000 steps.',
  foodAmountTooHigh: 'Maximum amount is 5,000g.',
  barcodeScanEmpty: 'Scanned code is empty.',
  barcodeTypeUnrecognized: 'Could not recognize code type.',
  barcodeProcessError: 'Error processing code.',
  emailAlreadyExists: 'This email is already registered. You can sign in with that account.',
  networkError: 'Could not connect to Vyra right now. Check your connection and try again.',
  tempSessionError: 'Could not open a temporary session right now. Try again.',
  emailSendError: 'Could not send email. Verify the address.',
  accountDeleteSuccess: 'Your request was processed and session closed. Final deletion follows our policy.',
} as const;

export const FastingLabels = {
  activePhase: 'Active fasting',
  autophagy: 'Autophagy',
  deepFast: 'Deep fasting',
  extendedFast: 'Extended fasting',
  gentleEntry: 'Gentle entry for low recovery days',
  omad: 'OMAD — one meal a day',
  omadAlt: 'One meal a day (OMAD)',
  fastDay: 'Restriction day (5:2 protocol)',
  hungryPhaseWarning: 'This phase often increases hunger and fatigue. A shorter protocol this week is recommended.',
  consistencyTip: 'Your pattern suggests a slightly more flexible window can improve weekly consistency.',
  progressTip: 'You\'re consistently coming up short. An intermediate protocol can consolidate the habit.',
  readyProgress: 'You\'ve completed several 16:8 fasts with margin. You\'re ready to progress to 18:6.',
  autophagyCountdown: '45 mins left until autophagy. You\'ve come this far, hang in there.',
  fastingCancelled: 'Fasting cancelled. Next one will be better!',
  fast52Started: '5:2 fasting started according to your schedule.',
  stayConsistent: 'In this phase, maintaining a stable protocol matters more than chasing extra hours. 16:8 is a solid base today.',
  focusConsistency: 'Keep today\'s protocol. Focus on consistency and smart breaking-fast.',
  menstrualGuidance: 'Menstrual phase: use 12:12 or 14:10 if body needs lighter load. Recovery first.',
  lutealGuidance: 'Luteal phase: 14:10 or 16:8 usually works better with simpler breaking-fast.',
  ovulatoryGuidance: 'Ovulatory phase: good tolerance for standard protocols if sleep is solid.',
  cancelled: 'Fasting cancelled',
  // Phase descriptions
  fedPhase: 'Post-meal',
  fedPhaseDesc: 'Digesting. Insulin elevated.',
  activePhaseDesc: 'Glycogen starting to be consumed.',
  ketosisPhase: 'Early ketosis',
  ketosisPhaseDesc: 'Body starting to burn fat.',
  autophagyDesc: 'Active cellular recycling. Maximum benefits.',
  deepFastDesc: 'HGH rising. Intense cellular regeneration.',
  extendedFastDesc: 'Survival mode. Maximum cellular survival.',
  // Protocol descriptions
  protocol12_12Desc: 'Gentle entry for low recovery days',
  protocol14_10Desc: 'Intermediate step to maintain adherence',
  protocol16_8Desc: '16h fasting, 8h eating — the most popular',
  protocol18_6Desc: '18h fasting, 6h window',
  protocol20_4Desc: 'Warrior Diet',
  protocol23_1Desc: 'OMAD — one meal a day',
  protocolOMADDesc: 'One meal a day (OMAD)',
  protocol24hDesc: 'Complete 24-hour fast.',
  protocol5_2Desc: 'Restriction day (5:2 protocol)',
  protocolCustomDesc: 'Custom',
} as const;

export const FemaleHealthLabels = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
  weightVariations: 'Weight variations can be transitory based on cycle phase.',
  hydrationMenstrual: 'Extra hydration during menstruation.',
  fastingMenstrual: 'Gentle protocol (12:12 or 14:10).',
  sleepMenstrual: 'Prioritize restorative sleep.',
  trainingRecovery: 'Active recovery, mobility, or light strength.',
  fastingFollicular: 'Good tolerance for standard protocols (16:8).',
  nutritionFollicular: 'Increase protein and zinc for performance and recovery.',
  trainingOvulation: 'High-energy window: high intensity/strength.',
  fastingOvulation: 'Can sustain 16:8 or 18:6 with good recovery.',
  fastingLuteal: 'Luteal phase can be harder; shorten protocol if high hunger appears.',
  nutritionLuteal: 'Increase magnesium and complex carbs for stable energy.',
  nextOvulationNotice: 'Tomorrow you enter the ovulatory window: preparing high-intensity training.',
  menstruationNotice: 'Your menstruation starts soon. This week prioritize extra hydration and recovery.',
  cycleVariation: 'Your cycle varies more than 7 days between periods. Worth discussing with gynecology for evaluation.',
  needSupport: 'You need support',
  // Phase guidance (menstrual)
  menstrualTraining: 'Active recovery, mobility, or light strength work.',
  menstrualFasting: 'Prioritize shorter protocols (12-14h) or take a fast rest day.',
  menstrualNutrition: 'Reinforce iron, omega-3, and anti-inflammatory foods.',
  menstrualWeightContext: 'During menstrual/luteal phases it is normal to see 1-3kg swings from fluid retention.',
  // Phase guidance (follicular)
  follicularTraining: 'Good phase to progress load and volume.',
  follicularFasting: 'Better tolerance for standard protocols (16:8).',
  follicularNutrition: 'Raise protein and zinc for performance and recovery.',
  // Phase guidance (ovulation)
  ovulationTraining: 'High-energy window: strength and higher intensity.',
  ovulationFasting: '16:8 or 18:6 can work well if recovery is solid.',
  ovulationNutrition: 'Prioritize antioxidants and quality carbs.',
  // Phase guidance (luteal)
  lutealTraining: 'Keep consistency with moderate intensity.',
  lutealFasting: 'Luteal phase can feel harder; shorten the protocol if hunger rises.',
  lutealNutrition: 'Increase magnesium and complex carbs for steadier energy.',
  lutealWeightContext: 'In the luteal phase it is normal to retain fluids and see temporary scale increases.',
} as const;

export const WorkoutLabels = {
  freesession: 'Free session',
  base: 'Base',
  building: 'Building',
  consolidation: 'Consolidation',
  muscleGroupsFatigued: '${tired} muscle groups have high recent load.',
  lowerIntensity: 'Lower intensity or choose a technical session to keep adding without breaking the block.',
  controlledSession: 'Room to train, but a controlled session will give you better results.',
  recordSet: 'New record in ${exercise}: ${weight} kg',
} as const;

export const TabBarCopy = {
  quickLogHint: 'Open the panel to log water, weight, fasting, or sleep.',
} as const;

export const BmiCategories = {
  underweight: 'Underweight',
  normal: 'Normal weight',
  overweight: 'Overweight',
  obesity: 'Obesity',
} as const;

export const ComponentMessages = {
  balanceCardNoData: 'VYRA Balance for today, not enough data yet',
  balanceNoData: 'Not enough data yet.',
  lastWeight: 'last weight',
  noSession: 'no session',
  seriesCount: 'sets today',
  isotonic: 'Isotonic',
  tea: 'Tea',
  coffee: 'Coffee',
  workoutLogged: 'Workout logged',
  syncSlowWarning: 'Initial load took too long. We opened a usable session and you can retry syncing without closing the app.',
  syncSlowWarning2: 'Initial load took longer than expected. You can enter safely and retry syncing from the app.',
  autoSessionRecovery: 'Could not recover your session automatically. You can retry without closing the app.',
  retrySyncPartial: 'Retry partial sync',
  retrySync: 'Retry',
  maintenanceMessage: 'If you were using water, sleep, weight, nutrition, or workout, your local data is still there. Just waiting for the system to come back and align the rest.',
  authCallbackError: 'Provider did not return valid session data.',
  invalidSession: 'No active session.',
  dailyLimitReached: 'Daily limit reached',
  aiBrainResting: 'My AI brain is taking a rest.',
  systemPrompt: 'Respond in English, briefly, practically and safely.',
} as const;

export const MentalLabels = {
  needSupport: 'You need support',
  emotionalTrend: 'We detected a downward emotional trend. Today prioritize recovery and a small action.',
} as const;

export const ReadinessLabels = {
  noConnection: 'No connection right now. Showing your last available state.',
  exceptional: 'Exceptional day',
  veryGood: 'Very good day',
} as const;

export const ReferralMessages = {
  noValidSession: 'You need a valid session to open your invitations.',
  serviceUnavailable: 'Invitations service is not available right now. Try again later.',
  notConfigured: 'Invitations backend is not configured in this build.',
  loadFailed: 'Could not load your invitations.',
  noData: 'Invitations responded without useful data. Try again in a few seconds.',
  networkFailed: 'Could not connect to invitations service.',
  notAvailable: 'Invitations not available in this build.',
  redeemFailed: 'Could not redeem.',
} as const;

export const NotificationMessages = {
  routineReady: 'Your routine for today is ready',
  movementBlockReady: 'Your movement block is ready',
  movementBlockCta: 'Open Vyra and get a short block done today. Keeping the rhythm matters more than doing it perfect.',
  routineStillOpen: 'Your routine is still open',
  routineStillOpenDesc: 'You left ${name} open. You can go back or log it quick from the notification.',
  recommendedRoutineReady: 'Your routine for today is ready',
  recommendedRoutineDesc: '${name} fits well today. Open it or log it without wasting time.',
  hydrationReminder: '💧 Time to hydrate',
  hydrationReminderDesc: '${name}, you can still get close to your goal today.',
  streakAtRisk: '🔥 Your streak is at risk',
  streakAtRiskDesc: '${name}, make 1 quick log today and keep it alive.',
  hydrationSmartReminder: '💧 Smart reminder',
  streakSmartReminder: '🔥 Streak at risk',
} as const;

export const PrivacyTexts = {
  dataExample: 'Water, steps, sleep, weight, meals, fasting, workouts, and daily summaries.',
  healthDataReduction: 'Reduce how much is stored in clear about weight, mental health, and female health.',
} as const;

export const ExplorePageStrings = {
  title: 'Plan',
  heroEyebrow: 'Active goal',
  heroBody: 'Plan no longer behaves like a second home: here you should see your path, your block, and the next useful move.',
  loseFat: 'Lose fat',
  gainMuscle: 'Gain muscle',
  performance: 'Performance',
  organizeHabits: 'Build habits',
  recovery: 'Recovery',
  yourCurrentPath: 'Your current path',
  fallbackCoaching: 'Holding one well-chosen decision this week moves the needle more than opening ten paths at once.',
  recommended: 'Recommended for you',
  coaching: 'Contextual coaching',
  weeklyPriority: 'This week priority',
  momentum: 'Challenges and momentum',
  streakLabel: 'streak',
  sessionThisWeek: 'sessions this week',
  usefulLibrary: 'Useful library',
  // Program section
  programTitle: 'Active program',
  noneSelected: 'No program selected yet',
  activeWeek: 'Week {{week}}. The block is already running and the next decision should come from here.',
  suggested: 'There is no active program yet, but there is already a suggested routine to start with direction.',
  chooseRoute: 'The best move now is to pick a guided route instead of browsing the full catalog.',
  nextAction: 'Next action',
  backToSession: 'Back to session',
  chooseProgram: 'Choose program',
  progress: 'Progress',
  thisWeek: '{{sessions}}/{{goal}} this week',
  continueProgram: 'Continue program',
  // Cards
  nextFocusEyebrow: 'Next adjustment',
  nextFocusBody: 'Today contextual read already found what is most worth pushing first.',
  workoutEyebrow: 'Workout',
  openCurrent: 'Open your current block',
  chooseGuided: 'Choose a guided program',
  workoutOpenBody: 'Review weeks, days, and load continuity without leaving your main path.',
  workoutChooseBody: 'Start from a clear route instead of browsing loose routines with no priority.',
  nutritionEyebrow: 'Nutrition',
  nutritionTitle: 'Simple nutrition reset',
  nutritionBody: 'One well-logged day matters more than a complex spreadsheet you never use.',
  recoveryEyebrow: 'Recovery',
  sleepTitle: 'Sleep better this week',
  sleepBody: 'Adjust recovery before asking your day for more force and more consistency.',
  waterTitle: 'Hydration routine',
  waterBody: 'A simple water base and daily rhythm make the rest of the system work better.',
  libraryEyebrow: 'Useful library',
  plannerTitle: 'Weekly plan',
  plannerBody: 'See the week and prepare the next block without opening extra modules.',
  mealTitle: 'Log a meal',
  mealBody: 'Go back to basics and make the day clearer in two steps.',
  sleepLibraryTitle: 'Review sleep',
  sleepLibraryBody: 'Read the latest night and adjust load with better judgment.',
  progressTitle: 'Read real progress',
  progressBody: 'If you want deeper context, here you see trend and not just isolated logs.',
  milestoneDone: 'The week is on track. Now it is about sustaining block quality instead of adding noise.',
  milestonePending: 'You still need {{count}} sessions to close your weekly target.',
} as const;

export const HomePageStrings = {
  locale: 'en-US',
  guestName: 'User',
  quickActionHint: 'Opens this quick action.',
  secondaryModuleHint: 'Opens this secondary module.',
  notificationFallbackTitle: 'Vyra notification',
  notificationFallbackBody: 'Recent activity is available.',
  greeting: 'Hi, {{name}}',
  streakPillLabel: 'Current streak: {{days}} days',
  streakPillHint: 'Opens progress so you can review your consistency.',
  openNotifications: 'Open recent notifications',
  openNotificationsHint: 'Shows delivery controls and the latest alerts.',
  openQuickLog: 'Open quick log',
  openQuickLogHint: 'Opens a sheet to log water, sleep, weight, or fasting without leaving home.',
  openProfile: 'Open profile',
  openProfileHint: 'Opens your account, modules, and settings.',
  activeWorkoutAccessibility: 'Active session, {{name}}, {{count}} exercises in progress',
  activeWorkoutEyebrow: 'Active session',
  activeWorkoutFallbackTitle: 'Workout in progress',
  activeWorkoutMeta: '{{count}} exercises in progress on this device.',
  activeWorkoutCta: 'Back to workout',
  nextStepEyebrow: 'Next step',
  nextStepHint: 'Pick the move that changes your day the most and solve it from here.',
  planEyebrow: 'Today',
  planTitle: 'Today plan',
  planSummary: '{{done}} of {{total}} fronts are already covered.',
  planExpand: 'View full plan',
  planCollapse: 'Show less',
  momentumEyebrow: 'Consistency',
  streakEyebrow: 'Streak',
  streakStartToday: 'Start your streak today',
  streakRunning: '{{days}} day streak',
  streakDoneBody: 'Today already counts. One small action keeps continuity alive.',
  streakPendingBody: 'Water, steps, nutrition, or workout is enough to save the day.',
  streakView: 'View streak and progress',
  streakSave: 'Save my streak now',
  sectionsQuickActions: 'Quick actions',
  sectionsThisWeek: 'This week',
  weekDone: '{{day}}: completed this week',
  weekTodayPending: '{{day}}: today still pending',
  weekPending: '{{day}}: not completed',
  weekSummary: '{{count}} of 7 days this week',
  pauseBody: 'You have gone {{days}} days without logging. Pick up something small today.',
  pauseCta: 'Resume now',
  pauseHint: 'Opens the suggested action so you can log activity again.',
  aiEyebrow: 'VYRA suggests',
  notificationsTitle: 'Latest notifications',
  notificationsEmpty: 'There is no recent activity to show here yet.',
  notificationsViewAll: 'View all',
  notificationsAccessibility: 'View all notifications',
  notificationsHint: 'Opens notification delivery controls and quiet hours.',
} as const;

export const ProgressPageStrings = {
  sectionEnergy: 'Energy and weight',
  sectionEnergyHint: 'What matters changes based on the goal you chose.',
  workoutSessions: 'sessions',
  sleepRecovered: 'Solid base to handle normal load today.',
  sleepRecovering: 'You slept less than ideal. Best to moderate intensity.',
  muscleChest: 'Chest',
  muscleBack: 'Back',
  muscleShoulders: 'Shoulders',
  muscleArms: 'Arms',
  muscleCore: 'Core',
  muscleLegs: 'Legs',
  caloriesEyebrow: 'Today calories',
  weightEyebrow: 'Weight and direction',
  viewPrograms: 'View programs',
  backHome: 'Back to home',
} as const;

export const WaterHydrationMessages = {
  goalReached: 'Goal closed. Maintaining this simple pattern is what sustains the module.',
  behindAndAfternoon: 'Already a good part of the day has passed. Two consecutive logs now change the entire close.',
  lowProgress: 'There is still room to recover the rhythm without adding complexity.',
  onTrack: 'You are doing well. Maintaining small glasses spaced out is worth more than stacking everything at the end.',
} as const;

export const StepsProgressMessages = {
  goalMet: 'You reached or exceeded your goal. {{totalSteps}} steps today.',
  almostThere: 'Almost there. You need {{remaining}} more steps to reach your goal.',
  goodProgress: 'You are doing well. You have already built momentum to close the day better.',
  justStarted: 'Good start. Keep adding.',
} as const;

export const HomeDetailStrings = {
  hero: {
    readiness: {
      eyebrow: 'Readiness',
      pending: 'Today baseline',
      awaiting: 'Reading in progress',
      support: 'Sleep, water, food and movement make this score much more precise.',
      noData: 'We are still building your daily reading. Useful logs give it more context.',
      weeklyAverage: 'Average',
      projected: 'Possible close',
      stability: 'Stability',
      focus: 'Focus now',
      cta: 'View details',
    },
    fasting: {
      eyebrow: 'Fast active',
      protocol: 'Protocol {{protocol}}',
      eatingWindowOpen: 'Eating window open',
      accumulated: '{{hours}}h {{minutes}}m accumulated.',
      close: 'Close fast',
      complete: 'Complete fast',
    },
    female: {
      eyebrow: 'Cycle',
      phaseDay: 'Phase {{phase}} · Day {{day}}',
      prioritizeRecovery: 'Prioritize recovery and regularity',
      trainStrong: 'Good day to train hard',
      registerToday: 'Log today',
    },
    nutrition: {
      eyebrow: 'Nutrition',
      percentCalories: '{{pct}}% of calories today',
      caloriesOf: '{{current}} of {{target}} kcal',
      cta: 'Log meal',
    },
    steps: {
      eyebrow: 'Steps',
      title: 'Today goal',
      ofSteps: 'of {{goal}} steps',
      estimatedCalories: '{{kcal}} estimated kcal',
      cta: 'View details',
    },
    sleep: {
      eyebrow: 'Sleep',
      recovered: 'Solid base to sustain a normal load today.',
      recovering: 'You slept less than ideal. It makes sense to lower intensity.',
      view: 'View sleep',
      log: 'Log sleep',
    },
    workoutRest: {
      eyebrow: 'Today · rest',
      fallbackTitle: 'Active recovery',
      body: 'It makes sense to lower the load today. You can review the next block session without rushing.',
      cta: 'View tomorrow',
    },
    workout: {
      eyebrow: 'Today',
      activeFallback: 'Session in progress',
      idleFallback: 'Train today',
      prYesterday: 'PR yesterday',
      activeMeta: '{{count}} exercises · session open',
      routineMeta: '{{count}} exercises · ~{{minutes}} min',
      emptyMeta: 'There is no routine ready for today yet.',
      resume: 'Back to workout',
      trainNow: 'Train now',
    },
  },
  workoutProgram: {
    week: 'Week {{week}} · {{day}}',
    progress: '{{pct}}% of block',
    todayRoutine: '{{day}} · today routine',
    nextSuggestion: '{{day}} · next suggestion',
    active: 'Session active',
    exercises: '{{count}} exercises',
  },
  metrics: {
    waterGoal: '{{pct}}% of goal',
    sleepBelowGoal: 'Below goal',
    steps: '{{pct}}% · {{kcal}} kcal',
    noTrend: 'Trend still short',
    weeklyTrend: '{{sign}}{{value}} this week',
  },
  quickActions: {
    logMeal: 'Log meal',
    addWater: 'Add water',
    resumeWorkout: 'Back to workout',
    trainNow: 'Train now',
    logSleep: 'Log sleep',
    openQuickLog: 'Open quick log',
  },
} as const;
export const ForgotPasswordStrings = {
  title: 'Recover your access',
  subtitle: 'Enter your email and we will send you the instructions.',
  send: 'Send instructions',
  sendFailed: 'We could not send the email. Check the address and try again.',
  successTitle: 'Check your inbox',
  successBody: 'Also check spam if you do not see it.',
  resend: 'Resend',
  resendIn: (seconds: number) => `Resend in ${seconds}s`,
  resendA11y: (seconds: number) =>
    seconds > 0 ? `Resend in ${seconds} seconds` : 'Resend email',
  resendHint: 'Send the recovery email again.',
} as const;

export const FastingMetabolicZones = {
  fed: {
    label: 'Fed state',
    description: 'Digesting and still energized after your last meal.',
  },
  early: {
    label: 'Adjusting',
    description: 'Energy starts to dip and your body shifts fuel sources.',
  },
  fat: {
    label: 'Fat burn',
    description: 'It becomes easier to use fat as your primary fuel.',
  },
  ketosis: {
    label: 'Ketosis',
    description: 'Ketosis signal becomes quite clear at this point.',
  },
  autophagy: {
    label: 'Autophagy',
    description: 'Advanced window. Context and recovery matter more here.',
  },
} as const;

export const BiometricLabels = {
  promptMessage: 'Unlock Vyra',
  cancelLabel: 'Cancel',
  fallbackLabel: 'Use device lock',
  unlockButton: 'Unlock',
  verifyingButton: 'Verifying...',
  logoutHint: 'Close current session without unlocking the app.',
  accessibilityLabel: 'Unlock Vyra',
} as const;

export const FemaleSymptoms = {
  colicos: 'Cramps',
  hinchazon: 'Bloating',
  fatiga: 'Fatigue',
  migrana: 'Migraine',
  cambios_humor: 'Mood swings',
  energia_alta: 'High energy',
} as const;

export const FemaleMoods = {
  '1': 'Low',
  '2': 'Serious',
  '3': 'Stable',
  '4': 'Good',
  '5': 'Excellent',
} as const;

export const SupplementUnitLabels = {
  mg: 'mg',
  g: 'g',
  ml: 'ml',
  caps: 'caps.',
  IU: 'IU',
  tablets: 'tabs.',
  scoops: 'scoops',
} as const;

export const SupplementFrequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  as_needed: 'As needed',
} as const;

export const SupplementTimeSlots = {
  unscheduled: 'No schedule set',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
} as const;

export const WorkoutDifficultyLevels = {
  high: 'High',
  medium: 'Medium',
  base: 'Base',
} as const;

export const NutritionModule = {
  headerEditPrefix: 'Edit',
  headerAddPrefix: 'Add to',
  editingMode: {
    title: 'Editing entry',
    description: 'Adjust name, grams or macros and save the change without removing the original entry.',
  },
  logModes: {
    search: 'Search',
    photo: 'Photo',
    barcode: 'Barcode',
    manual: 'Manual',
  },
  library: {
    title: 'Quick library',
    description: 'Open something frequent or recover a recent entry before searching.',
    tabs: {
      frequent: 'Frequent',
      recent: 'Recent',
    },
    itemA11y: (food: string) => `Use ${food}`,
    itemHint: 'Load this food to confirm amount and macros.',
    emptyFrequent: 'No frequent foods yet for this meal.',
    emptyRecent: 'No recent foods to show.',
  },
  search: {
    label: 'Search food',
    placeholder: 'Ex: rice, yogurt, chicken...',
    searching: 'Searching foods...',
    libraryMatches: 'Already in your library',
    libraryDescription: 'Before opening a long list, I show you matches you\'ve already used first.',
    recentLabel: (timestamp: string) => `${timestamp}`,
    generalResults: 'General results',
    resultsCount: (count: number) => {
      if (count >= 30) return `Showing first ${count} results. If what you're looking for doesn't appear, load more results or use manual entry.`;
      return `Found ${count} match${count === 1 ? '' : 'es'} for this search.`;
    },
    noResults: (query: string) => `Found no foods for "${query}". You can try again or load it manually.`,
    noResultsLibrary: (query: string) => `Found no general results for "${query}". If you've used it before, you have matches above or can load it manually.`,
    loadManual: 'Load manually',
    moreResults: 'See more results',
  },
  preview: {
    title: 'Confirmation',
    hint: 'Confirm macros and amount before adding.',
    macros: {
      kcal: 'Kcal',
      protein: 'Protein',
      carbs: 'Carbs',
      fat: 'Fat',
      fiber: 'Fiber',
    },
    quantityLabel: 'Amount',
    portionHint: '1 serving is estimated as 100g for this confirmation.',
    addButton: (meal: string) => `Add to ${meal}`,
  },
  photo: {
    title: 'AI Photo',
    description: 'Take a photo, review what VYRA detects and adjust portions before confirming.',
    takePhoto: 'Take photo',
    chooseGallery: 'Choose from gallery',
    detection: 'This is what AI detected',
    confidence: (percent: number) => `confidence ${Math.round(percent * 100)}%`,
    lowConfidence: 'Detection has low confidence. Review or switch to manual search.',
    itemsSelected: (count: number) => `${count} item${count > 1 ? 's' : ''} selected.`,
    selectAtLeast: 'Mark at least one item to confirm.',
    confirmDetection: 'Confirm detection',
    manualSearch: 'Search manually',
    togglePortions: {
      show: 'Adjust portions',
      hide: 'Hide portion adjustments',
    },
    estimated: (grams: number) => `${Math.round(grams)}g estimated`,
    noQuantity: 'No quantity estimated',
    componentIncludeA11y: (name: string) => `Include ${name}`,
    cameraMissingPermission: 'Camera permission required.',
    galleryMissingPermission: 'Gallery permission required.',
  },
  manual: {
    title: 'Manual entry',
    nameLabel: 'Name',
    namePlaceholder: 'Ex: rice with chicken',
    quantityLabel: 'Amount',
    quantityUnit: 'g',
    proteinLabel: 'Protein',
    proteinUnit: 'g',
    carbsLabel: 'Carbs',
    carbsUnit: 'g',
    fatLabel: 'Fats',
    fatUnit: 'g',
    fiberLabel: 'Fiber',
    fiberUnit: 'g',
    submitEdit: 'Save changes',
    submitAdd: (meal: string) => `Add to ${meal}`,
  },
  errors: {
    loadingFood: 'Loading food...',
  },
  modeA11y: (mode: string) => `Mode ${mode === 'search' ? 'search' : mode === 'photo' ? 'photo' : mode === 'barcode' ? 'barcode' : 'manual'}`,
  unitA11y: (unit: string) => `Unit ${unit}`,
  quickAmountA11y: (value: number) => `Quick amount ${value} grams`,
  portionAdjustmentNote: 'We adjusted portions based on the items you marked before confirming.',
} as const;

export const FemaleModule = {
  header: {
    title: 'Cycle settings',
    subtitle: 'Module, privacy and tracking continuity.',
  },
  disclaimer: {
    title: 'Medical disclaimer pending',
    body: 'It\'s good to confirm it before using the module as a daily reference.',
    confirm: 'Confirm disclaimer',
  },
  errorCard: {
    title: 'We couldn\'t save this change',
  },
  moduleSection: {
    eyebrow: 'Module',
    title: 'Sensitive and optional tracking',
    subtitle: 'If you enable it, VYRA can adjust training, nutrition and recovery context based on your phase.',
    toggleLabel: 'Module active',
    toggleDescription: 'Turn cycle reading on or off without leaving your settings.',
  },
  cycleData: {
    eyebrow: 'Base data',
    title: 'Cycle summary',
    subtitle: 'Main reading lives here in clear rows and editing happens on a dedicated screen.',
    lastPeriod: 'Last period',
    unconfigured: 'Not configured',
    cycleDuration: 'Cycle length',
    daysLabel: 'days',
    periodDuration: 'Period length',
    nextPeriod: 'Next period',
    editLink: 'Edit cycle data',
    editDescription: 'Open the module base configuration to register dates, duration and context.',
  },
  errors: {
    saveFailed: 'Couldn\'t save this setting right now. Try again in a few seconds.',
    configSaveFailed: 'Couldn\'t save cycle configuration.',
  },
} as const;

export const FastingModule = {
  header: {
    title: 'Intermittent fasting',
  },
  controls: {
    adjustTime: '⏱  Adjust start time',
    cancelAdjust: '✕  Cancel adjustment',
    adjustHint: 'Current time will be used if you cancel',
    adjustSubHint: 'If you started earlier or will start later',
    adjustTitle: 'What time did you start (or will you start)?',
    reduceOffset: 'Subtract 15 minutes',
    increaseOffset: 'Add 15 minutes',
    offsetHint: 'Each tap moves 15 minutes · up to 12h back or 4h ahead',
    now: 'Now',
  },
  timer: {
    remaining: 'remaining',
    elapsedPct: (elapsed: string, pct: number) => `${elapsed} complete · ${Math.round(pct)}%`,
    backgroundActive: 'The timer is still running in the background.',
    endPredictionSameDay: (time: string) => `Ends at ${time}`,
    endPredictionDiffDay: (time: string, date: string) => `Ends at ${time} · ${date}`,
    zones: 'Metabolic zones',
  },
  states: {
    activeBadge: 'Fast active',
    completeBadge: 'Fast complete',
    completeEmoji: '🎉',
    completeTitle: 'You made it!',
    completeMeta: (protocol: string, elapsed: string) => `${protocol} · ${elapsed} complete`,
  },
  suggestion: {
    title: 'Today suggests',
  },
  buttons: {
    startFast: (protocol: string, timeLabel?: string) => 
      timeLabel ? `Start ${protocol} · ${timeLabel}` : `Start ${protocol}`,
    completeFast: 'Complete fast',
    finishAndClose: 'Register and close',
    earlyFinish: 'Finish early',
    continueEarlyFinish: 'Keep fasting',
    partialFinish: 'Finish partial',
  },
  stats: {
    completedLabel: 'Completed',
    avgLabel: 'Average',
    longestLabel: 'Longest',
    completedMeta: (avg: number, longest: number) => `Average ${avg.toFixed(1)}h · best ${longest.toFixed(1)}h`,
    noFasts: 'No fasts completed yet.',
  },
  history: {
    title: 'Recent fasts',
    missed: 'Missed',
    pending: 'Pending',
    completed: '✓',
    deleteBtn: 'Delete',
    deleteA11y: (protocol: string) => `Delete fast ${protocol}`,
    emptyEmoji: '🌙',
    emptyTitle: 'No fasts logged yet.',
    emptyHint: 'Complete your first fast to see history here.',
  },
  fiveTwo: {
    header: '📅 Today is your 5:2 day',
    status: 'Pending',
    desc: (protocol: string, hours: number, time?: string) => 
      time ? `Protocol: ${protocol} · Goal: ${hours}h · Scheduled: ${time}` : `Protocol: ${protocol} · Goal: ${hours}h`,
    button: 'Start 5:2 fast today',
    week: 'This week · 5:2',
    weekMeta: (completed: number, target: number) => `${completed}/${target} days complete`,
  },
  modals: {
    zoneDetail: {
      startHint: (hours: number) => `This zone starts at ${hours}h of fasting.`,
      close: 'Close',
    },
    deleteConfirm: {
      title: 'Delete fast',
      body: 'Delete this fast? This action cannot be undone.',
      confirm: 'Delete',
    },
    earlyFinish: {
      title: 'Finish early?',
      percentComplete: (pct: number) => `${Math.round(pct)}%`,
      label: 'complete',
      context: (elapsed: string) => `You are ${elapsed} toward your goal. It will be logged as partial.`,
    },
  },
  contextCard: {
    female: 'Female context',
  },
  offsetLabel: {
    now: (time: string) => `Now · ${time}`,
    past: (duration: string, time: string, dayLabel?: string) => `${duration} ago${dayLabel ? ` · ${dayLabel}` : ''} · ${time}`,
    future: (duration: string, time: string) => `In ${duration} · ${time}`,
  },
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Settings',
    title: 'Water',
  },
  dailyGoal: {
    title: 'Daily goal',
    description: 'Choose a realistic base and let the app adjust it based on context.',
    presets: {
      low: 'Low activity',
      moderate: 'Moderate',
      recommended: 'Recommended',
      athlete: 'Athletes',
      hotClimate: 'Hot climate',
    },
    customLabel: 'Custom goal',
    customHint: 'Between 500ml and 10,000ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Adjustment',
    body: 'VYRA can increase your goal if it\'s hot, if you\'re fasting or if the day is very active.',
  },
  containers: {
    title: 'Quick objects',
    description: 'Set once how much is in your real containers.',
    resetLabel: 'Reset',
    resetA11y: 'Restore default sizes',
    glass: 'Glass',
    largeGlass: 'Large glass',
    bottle: 'Bottle',
  },
  warningCard: {
    eyebrow: 'Notice',
    body: 'Reminders live in general notifications. From here you only fine-tune the operational part.',
  },
  buttons: {
    openNotifications: 'Open notifications',
    changeUnits: 'Change units',
    save: 'Save settings',
  },
} as const;
