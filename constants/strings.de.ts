export { ShellStrings } from './strings.shell.de';

export const ErrorMessages = {
  noInternet: 'Hier ist kein Signal. Machen Sie weiter und ich synchronisiere, wenn die Verbindung zurückkommt.',
  aiUnavailable: 'Die KI-Schicht ist im Moment nicht verfügbar. Versuchen Sie es in ein paar Minuten erneut.',
  saveFailed: 'Ich konnte nicht jetzt speichern. Ihre Daten sind sicher und ich werde es erneut versuchen.',
  barcodeNotFound: 'Ich habe diesen Code nicht gefunden. Sie können das Lebensmittel suchen oder manuell eingeben.',
  paymentError: 'Ich konnte diese Aktion nicht abschließen. Es wurden keine Änderungen vorgenommen.',
  photoAIFailed: 'Ich konnte diese Mahlzeit nicht gut lesen. Versuchen Sie ein anderes Foto oder geben Sie es manuell ein.',
  voiceLogFailed: 'Ich konnte diese Sprachaufnahme nicht verstehen. Versuchen Sie es erneut oder geben Sie es manuell ein.',
  loginFailed: 'Ich konnte mich nicht anmelden. Überprüfen Sie Ihre Daten und versuchen Sie es erneut.',
  registerFailed: 'Ich konnte Ihr Konto nicht erstellen. Versuchen Sie es erneut.',
  sessionExpired: 'Ihre Sitzung ist abgelaufen. Melden Sie sich erneut an, um fortzufahren.',
  premiumRequired: 'Diese Funktion ist in Ihrem aktuellen Zugriff nicht verfügbar.',
  generic: 'Etwas ist schief gelaufen. Versuchen Sie es in einem Moment erneut.',
  loadFailed: 'Ich konnte die Daten nicht laden. Ziehen Sie zum erneuten Versuch.',
  syncFailed: 'Ich konnte nicht synchronisieren. Ihre Daten bleiben lokal gespeichert.',
  permissionDenied: 'Ich benötige Ihre Berechtigung, um fortzufahren. Sie können dies in den Einstellungen ändern.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Ihre Fitness, ab heute klar.',
    subtitle: 'Training, Mahlzeiten, Wasser, Schlaf und Fortschritt in einer App.',
    cta: 'Kostenloses Konto erstellen',
    login: 'Bei meinem Konto anmelden',
    legal: 'Indem Sie fortfahren, akzeptieren Sie unsere Bedingungen.',
  },
  login: {
    title: 'Willkommen zurück',
    subtitle: 'Melden Sie sich an, um fortzufahren.',
    email: 'E-Mail',
    password: 'Passwort',
    submit: 'Anmelden',
    forgotPassword: 'Passwort vergessen?',
    noAccount: 'Kein Konto? Erstellen Sie jetzt eines',
  },
  register: {
    title: 'Konto erstellen',
    subtitle: 'Beginnen Sie Ihre Fitness-Reise.',
    email: 'E-Mail',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    submit: 'Konto erstellen',
    agreeToTerms: 'Ich stimme den Bedingungen zu.',
    alreadyHaveAccount: 'Haben Sie bereits ein Konto? Anmelden',
  },
  resetPassword: {
    title: 'Passwort zurücksetzen',
    subtitle: 'Geben Sie Ihre E-Mail-Adresse ein, um Anweisungen zu erhalten.',
    email: 'E-Mail',
    submit: 'Anweisungen senden',
    backToLogin: 'Zurück zur Anmeldung',
  },
} as const;

export const OnboardingStrings = {
  title: 'Willkommen bei Vyra Fitness',
  subtitle: 'Ihr persönlicher Gesundheitsbegleiter',
  slides: [
    {
      title: 'Vollständiges Tracking',
      description: 'Training, Ernährung, Schlaf und Wohlbefinden an einem Ort.',
    },
    {
      title: 'Intelligente KI',
      description: 'Erhalten Sie personalisierte Ratschläge basierend auf Ihren Daten.',
    },
    {
      title: 'Erreichen Sie Ihre Ziele',
      description: 'Verfolgen Sie Ihren Fortschritt und feiern Sie jeden Sieg.',
    },
  ],
  getStarted: 'Anfangen',
  skip: 'Überspringen',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Hallo',
    subtitle: 'Ihr Gesundheitstag beginnt hier.',
  },
  readiness: {
    title: 'Bereitschaft',
    description: 'Sind Sie heute bereit?',
    high: 'Sehr gut',
    moderate: 'Gut',
    low: 'Ausruhen',
  },
  waterIntake: {
    title: 'Hydration',
    goal: 'Tagesgoal',
    remaining: 'Verbleibend',
  },
  sleep: {
    title: 'Schlaf',
    lastNight: 'Letzte Nacht',
    quality: 'Qualität',
  },
  nutrition: {
    title: 'Ernährung',
    todayCalories: 'Kalorien heute',
    goal: 'Ziel',
  },
} as const;

export const ModuleNames = {
  fasting: 'Fasten',
  nutrition: 'Ernährung',
  water: 'Wasser',
  workout: 'Training',
  sleep: 'Schlaf',
  female: 'Zyklus',
  mental: 'Mental',
} as const;

export const ModuleEmojis = {
  fasting: '⏱️',
  nutrition: '🍎',
  water: '💧',
  workout: '💪',
  sleep: '😴',
  female: '🌸',
  mental: '🧠',
} as const;

export const Disclaimers = {
  general: 'Diese App ersetzt keinen professionellen medizinischen Rat.',
  health: 'Konsultieren Sie Ihren Arzt, bevor Sie ein neues Programm beginnen.',
  nutrition: 'Nährstoffdaten dienen nur zu Informationszwecken.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Fasten',
    fed: 'Gefüttert',
    breaking: 'Fasten brechen',
  },
  goal: 'Fastenziel',
  window: 'Fastenfenster',
  elapsed: 'Verstrichen',
  remaining: 'Verbleibend',
} as const;

export const FemaleHealthLabels = {
  title: 'Zyklus-Tracking',
  phase: 'Phase',
  follicular: 'Follikulär',
  ovulation: 'Eisprung',
  luteal: 'Luteal',
  menstrual: 'Menstruell',
  estimatedNextPeriod: 'Geschätzter nächster Zeitraum',
} as const;

export const WorkoutLabels = {
  duration: 'Dauer',
  sets: 'Sätze',
  reps: 'Wiederholungen',
  weight: 'Gewicht',
  intensity: 'Intensität',
  restDay: 'Ruhetag',
  scheduled: 'Geplant',
} as const;

export const TabBarCopy = {
  home: 'Startseite',
  explore: 'Erkunden',
  progress: 'Fortschritt',
  settings: 'Einstellungen',
} as const;

export const BmiCategories = {
  underweight: 'Untergewicht',
  normal: 'Normalgewicht',
  overweight: 'Übergewicht',
  obese: 'Fettleibig',
} as const;

export const ComponentMessages = {
  loading: 'Wird geladen...',
  noData: 'Keine Daten verfügbar',
  tryAgain: 'Erneut versuchen',
  confirm: 'Bestätigen',
  cancel: 'Abbrechen',
  delete: 'Löschen',
  edit: 'Bearbeiten',
  save: 'Speichern',
  close: 'Schließen',
} as const;

export const MentalLabels = {
  title: 'Mentales Wohlbefinden',
  mood: 'Stimmung',
  stress: 'Stress',
  energy: 'Energie',
  sleep: 'Schlafqualität',
} as const;

export const ReadinessLabels = {
  title: 'Bereitschaftsindex',
  score: 'Punktzahl',
  factors: 'Faktoren',
} as const;

export const ReferralMessages = {
  title: 'Freunde einladen',
  description: 'Erhalten Sie Belohnungen durch das Teilen von Vyra.',
  copyLink: 'Link kopieren',
  share: 'Teilen',
} as const;

export const NotificationMessages = {
  waterReminder: 'Vergessen Sie nicht, Wasser zu trinken',
  mealReminder: 'Es ist Zeit zu essen',
  sleepReminder: 'Bereiten Sie sich auf das Schlafengehen vor',
  workoutReminder: 'Trainingszeit',
} as const;

export const PrivacyTexts = {
  title: 'Datenschutz und Daten',
  description: 'Ihre Daten sind sicher und verschlüsselt.',
  dataUsage: 'Wir verwenden Ihre Daten nur, um Ihr Erlebnis zu verbessern.',
} as const;

export const ExplorePageStrings = {
  title: 'Erkunden',
  subtitle: 'Entdecken Sie Tipps und Artikel.',
  featured: 'Empfohlen',
  categories: 'Kategorien',
  viewMore: 'Mehr anzeigen',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Tagesübersicht',
  upcomingActivities: 'Bevorstehende Aktivitäten',
  recentActivity: 'Kürzliche Aktivität',
  noActivity: 'Derzeit keine Aktivität',
} as const;

export const ProgressPageStrings = {
  title: 'Fortschritt',
  weeklyStats: 'Wöchentliche Statistiken',
  monthlyStats: 'Monatliche Statistiken',
  viewDetails: 'Details anzeigen',
} as const;

export const WaterHydrationMessages = {
  goal: 'Hydrationsziel',
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  loggingWater: 'Wasser protokollieren',
  waterLogged: 'Wasser protokolliert',
} as const;

export const StepsProgressMessages = {
  goal: 'Schritteziel',
  daily: 'Heute',
  weekly: 'Diese Woche',
  stepsTaken: 'Schritte unternommen',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Morgenroutine',
  eveningRoutine: 'Abendroutine',
  hydration: 'Hydration',
  nutrition: 'Ernährung',
} as const;

export const ForgotPasswordStrings = {
  title: 'Passwort vergessen',
  subtitle: 'Wir helfen Ihnen, Ihr Konto wiederherzustellen.',
  email: 'E-Mail',
  submit: 'Senden',
  backToLogin: 'Zurück zur Anmeldung',
  checkEmail: 'Überprüfen Sie Ihre E-Mail auf Anweisungen.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Ernährter Zustand',
  postAbsorptive: 'Postabsorptiv',
  ketosis: 'Ketose',
  deepKetosis: 'Tiefe Ketose',
} as const;

export const BiometricLabels = {
  height: 'Höhe',
  weight: 'Gewicht',
  bmi: 'BMI',
  bodyFat: 'Körperfett',
  muscleMass: 'Muskelmasse',
  bloodPressure: 'Blutdruck',
  heartRate: 'Herzfrequenz',
} as const;

export const FemaleSymptoms = {
  cramps: 'Krämpfe',
  bloating: 'Aufblähung',
  mood: 'Stimmungsschwankungen',
  headache: 'Kopfschmerz',
  fatigue: 'Müdigkeit',
} as const;

export const NutritionModule = {
  macros: 'Makronährstoffe',
  proteins: 'Proteine',
  carbs: 'Kohlenhydrate',
  fats: 'Fette',
  fiber: 'Ballaststoffe',
  calories: 'Kalorien',
  micronutrients: 'Mikronährstoffe',
} as const;

export const FemaleModule = {
  cycle: 'Menstruationszyklus',
  symptoms: 'Symptome',
  tracking: 'Verfolgung',
  predictions: 'Vorhersagen',
} as const;

export const FastingModule = {
  fastingPeriod: 'Fastenzeit',
  breakingFast: 'Fasten brechen',
  metabolicState: 'Metabolischer Zustand',
  benefits: 'Vorteile',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Einstellungen',
    title: 'Wasser',
  },
  dailyGoal: {
    title: 'Tägliches Ziel',
    description: 'Wählen Sie eine realistische Basis und die App passt sich an Faktoren an.',
    presets: {
      low: 'Geringe Aktivität',
      moderate: 'Moderat',
      recommended: 'Empfohlen',
      athlete: 'Athlet',
      hotClimate: 'Heißes Klima',
    },
    customLabel: 'Benutzerdefiniertes Ziel',
    customHint: 'Zwischen 500 ml und 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Anpassung',
    body: 'Wenn es sehr heiß ist, Sie fasten oder Ihr Tag voll ist, kann Vyra Ihr Ziel erhöhen.',
  },
  containers: {
    title: 'Schnellzugriffe',
    description: 'Stellen Sie einmal ein, wie viel in Ihren tatsächlichen Behältern ist.',
    resetLabel: 'Zurücksetzen',
    resetA11y: 'Standardgrößen wiederherstellen',
    glass: 'Glas',
    largeGlass: 'Großes Glas',
    bottle: 'Flasche',
  },
  warningCard: {
    eyebrow: 'Warnung',
    body: 'Erinnerungen befinden sich in regelmäßigen Benachrichtigungen. Hier passen Sie nur den operativen Teil an.',
  },
  buttons: {
    openNotifications: 'Benachrichtigungen öffnen',
    changeUnits: 'Einheiten ändern',
  },
} as const;
