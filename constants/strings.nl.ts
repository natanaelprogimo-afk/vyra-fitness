export { ShellStrings } from './strings.shell.nl';

export const ErrorMessages = {
  noInternet: 'Hier geen signaal. Ga door met opnemen en ik synchroniseer wanneer de verbinding terugkomt.',
  aiUnavailable: 'De AI-laag is momenteel niet beschikbaar. Probeer het over een paar minuten opnieuw.',
  saveFailed: 'Ik kan nu niet opslaan. Uw gegevens zijn veilig en ik zal het opnieuw proberen.',
  barcodeNotFound: 'Ik vond die code niet. U kunt het voedselproduct zoeken of handmatig invoeren.',
  paymentError: 'Ik kon deze actie niet voltooien. Er zijn geen wijzigingen aangebracht.',
  photoAIFailed: 'Ik kon die maaltijd niet goed lezen. Probeer een ander foto of voer het handmatig in.',
  voiceLogFailed: 'Ik kon die spraakopname niet verstaan. Probeer opnieuw of voer deze handmatig in.',
  loginFailed: 'Ik kon niet inloggen. Controleer uw gegevens en probeer opnieuw.',
  registerFailed: 'Ik kon uw account niet maken. Probeer opnieuw.',
  sessionExpired: 'Uw sessie is verlopen. Meld u opnieuw aan om door te gaan.',
  premiumRequired: 'Deze functie is niet beschikbaar in uw huidige toegang.',
  generic: 'Er ging iets fout. Probeer het over een moment opnieuw.',
  loadFailed: 'Ik kon de gegevens niet laden. Veeg om opnieuw te proberen.',
  syncFailed: 'Ik kon niet synchroniseren. Uw gegevens blijven lokaal opgeslagen.',
  permissionDenied: 'Ik heb uw toestemming nodig om door te gaan. U kunt dit in Instellingen wijzigen.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Uw fitness, vanaf vandaag duidelijk.',
    subtitle: 'Training, maaltijden, water, slaap en voortgang in één app.',
    cta: 'Gratis account maken',
    login: 'Meld u aan bij mijn account',
    legal: 'Door verder te gaan, gaat u akkoord met onze voorwaarden.',
  },
  login: {
    title: 'Welkom terug',
    subtitle: 'Meld u aan om door te gaan.',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    submit: 'Aanmelden',
    forgotPassword: 'Wachtwoord vergeten?',
    noAccount: 'Geen account? Maak er nu een aan',
  },
  register: {
    title: 'Account maken',
    subtitle: 'Begin uw fitnessreis.',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    confirmPassword: 'Bevestig wachtwoord',
    submit: 'Account maken',
    agreeToTerms: 'Ik ga akkoord met de voorwaarden.',
    alreadyHaveAccount: 'Hebt u al een account? Aanmelden',
  },
  resetPassword: {
    title: 'Wachtwoord herstellen',
    subtitle: 'Voer uw e-mailadres in om instructies te ontvangen.',
    email: 'E-mailadres',
    submit: 'Instructies verzenden',
    backToLogin: 'Terug naar aanmelden',
  },
} as const;

export const OnboardingStrings = {
  title: 'Welkom bij Vyra Fitness',
  subtitle: 'Uw persoonlijke gezondheidspartner',
  slides: [
    {
      title: 'Uitgebreide tracking',
      description: 'Training, voeding, slaap en welzijn op één plek.',
    },
    {
      title: 'Intelligente AI',
      description: 'Ontvang gepersonaliseerde adviezen op basis van uw gegevens.',
    },
    {
      title: 'Bereik uw doelen',
      description: 'Volg uw voortgang en vier elke overwinning.',
    },
  ],
  getStarted: 'Beginnen',
  skip: 'Overslaan',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Hallo',
    subtitle: 'Uw gezonde dag begint hier.',
  },
  readiness: {
    title: 'Gereedheid',
    description: 'Bent u klaar voor vandaag?',
    high: 'Zeer goed',
    moderate: 'Goed',
    low: 'Rust',
  },
  waterIntake: {
    title: 'Hydratatie',
    goal: 'Dagelijks doel',
    remaining: 'Resterend',
  },
  sleep: {
    title: 'Slaap',
    lastNight: 'Gisteren nacht',
    quality: 'Kwaliteit',
  },
  nutrition: {
    title: 'Voeding',
    todayCalories: 'Vandaag calorieën',
    goal: 'Doel',
  },
} as const;

export const ModuleNames = {
  fasting: 'Vasten',
  nutrition: 'Voeding',
  water: 'Water',
  workout: 'Training',
  sleep: 'Slaap',
  female: 'Cyclus',
  mental: 'Mentaal',
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
  general: 'Deze app vervangt geen professioneel medisch advies.',
  health: 'Raadpleeg uw arts voordat u een nieuw programma begint.',
  nutrition: 'Voedingsgegevens dienen alleen ter informatie.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Vasten',
    fed: 'Gevoerd',
    breaking: 'Breken van het vasten',
  },
  goal: 'Vastendoel',
  window: 'Vastvenster',
  elapsed: 'Verstreken',
  remaining: 'Resterend',
} as const;

export const FemaleHealthLabels = {
  title: 'Cyclus bijhouden',
  phase: 'Fase',
  follicular: 'Follikel',
  ovulation: 'Ovulatie',
  luteal: 'Luteal',
  menstrual: 'Menstrueel',
  estimatedNextPeriod: 'Geschatte volgende periode',
} as const;

export const WorkoutLabels = {
  duration: 'Duur',
  sets: 'Sets',
  reps: 'Herhalingen',
  weight: 'Gewicht',
  intensity: 'Intensiteit',
  restDay: 'Rustdag',
  scheduled: 'Gepland',
} as const;

export const TabBarCopy = {
  home: 'Home',
  explore: 'Verkennen',
  progress: 'Voortgang',
  settings: 'Instellingen',
} as const;

export const BmiCategories = {
  underweight: 'Ondergewicht',
  normal: 'Normaal gewicht',
  overweight: 'Overgewicht',
  obese: 'Zwaarlijvigheid',
} as const;

export const ComponentMessages = {
  loading: 'Laden...',
  noData: 'Geen gegevens beschikbaar',
  tryAgain: 'Probeer opnieuw',
  confirm: 'Bevestigen',
  cancel: 'Annuleren',
  delete: 'Verwijderen',
  edit: 'Bewerken',
  save: 'Opslaan',
  close: 'Sluiten',
} as const;

export const MentalLabels = {
  title: 'Mentale gezondheid',
  mood: 'Stemming',
  stress: 'Stress',
  energy: 'Energie',
  sleep: 'Slaapkwaliteit',
} as const;

export const ReadinessLabels = {
  title: 'Gereedheidsindex',
  score: 'Score',
  factors: 'Factoren',
} as const;

export const ReferralMessages = {
  title: 'Vrienden uitnodigen',
  description: 'Verdien beloningen door Vyra te delen.',
  copyLink: 'Link kopiëren',
  share: 'Delen',
} as const;

export const NotificationMessages = {
  waterReminder: 'Vergeet niet water te drinken',
  mealReminder: 'Het is tijd om te eten',
  sleepReminder: 'Bereid u voor op slaap',
  workoutReminder: 'Trainingstijd',
} as const;

export const PrivacyTexts = {
  title: 'Privacy en gegevens',
  description: 'Uw gegevens zijn veilig en versleuteld.',
  dataUsage: 'We gebruiken uw gegevens alleen om uw ervaring te verbeteren.',
} as const;

export const ExplorePageStrings = {
  title: 'Verkennen',
  subtitle: 'Ontdek tips en artikelen.',
  featured: 'Aanbevolen',
  categories: 'Categorieën',
  viewMore: 'Meer weergeven',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Dagelijks overzicht',
  upcomingActivities: 'Komende activiteiten',
  recentActivity: 'Recente activiteit',
  noActivity: 'Momenteel geen activiteit',
} as const;

export const ProgressPageStrings = {
  title: 'Voortgang',
  weeklyStats: 'Wekelijkse statistieken',
  monthlyStats: 'Maandelijkse statistieken',
  viewDetails: 'Details weergeven',
} as const;

export const WaterHydrationMessages = {
  goal: 'Hydratatie doel',
  daily: 'Dagelijks',
  weekly: 'Wekelijks',
  loggingWater: 'Water registreren',
  waterLogged: 'Water geregistreerd',
} as const;

export const StepsProgressMessages = {
  goal: 'Stappenoel',
  daily: 'Vandaag',
  weekly: 'Deze week',
  stepsTaken: 'Genomen stappen',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Ochtendroute',
  eveningRoutine: 'Avondroute',
  hydration: 'Hydratatie',
  nutrition: 'Voeding',
} as const;

export const ForgotPasswordStrings = {
  title: 'Wachtwoord vergeten',
  subtitle: 'We helpen u uw account terug te krijgen.',
  email: 'E-mailadres',
  submit: 'Verzenden',
  backToLogin: 'Terug naar aanmelden',
  checkEmail: 'Controleer uw e-mail voor instructies.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Voedingstoestand',
  postAbsorptive: 'Postabsorptief',
  ketosis: 'Ketose',
  deepKetosis: 'Diepe ketose',
} as const;

export const BiometricLabels = {
  height: 'Hoogte',
  weight: 'Gewicht',
  bmi: 'BMI',
  bodyFat: 'Lichaamsvet',
  muscleMass: 'Spiermassa',
  bloodPressure: 'Bloeddruk',
  heartRate: 'Hartslag',
} as const;

export const FemaleSymptoms = {
  cramps: 'Kramp',
  bloating: 'Opgeblazenheid',
  mood: 'Stemmingswisselingen',
  headache: 'Hoofdpijn',
  fatigue: 'Vermoeidheid',
} as const;

export const NutritionModule = {
  macros: 'Macronutriënten',
  proteins: 'Eiwitten',
  carbs: 'Koolhydraten',
  fats: 'Vetten',
  fiber: 'Vezels',
  calories: 'Calorieën',
  micronutrients: 'Micronutriënten',
} as const;

export const FemaleModule = {
  cycle: 'Menstruele cyclus',
  symptoms: 'Symptomen',
  tracking: 'Bijhouden',
  predictions: 'Voorspellingen',
} as const;

export const FastingModule = {
  fastingPeriod: 'Vastenperiode',
  breakingFast: 'Breken van het vasten',
  metabolicState: 'Metabolische toestand',
  benefits: 'Voordelen',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Instellingen',
    title: 'Water',
  },
  dailyGoal: {
    title: 'Dagelijks doel',
    description: 'Kies een realistische basis en de app zal zich aanpassen aan factoren.',
    presets: {
      low: 'Lage activiteit',
      moderate: 'Matig',
      recommended: 'Aanbevolen',
      athlete: 'Atleet',
      hotClimate: 'Warm klimaat',
    },
    customLabel: 'Aangepast doel',
    customHint: 'Tussen 500 ml en 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Aanpasssing',
    body: 'Als het erg warm is, u vast of uw dag vol activiteiten is, kan Vyra uw doel verhogen.',
  },
  containers: {
    title: 'Snelle toegang',
    description: 'Stel eenmaal de hoeveelheid in uw werkelijke containers in.',
    resetLabel: 'Resetten',
    resetA11y: 'Standaardgrootten herstellen',
    glass: 'Glas',
    largeGlass: 'Groot glas',
    bottle: 'Fles',
  },
  warningCard: {
    eyebrow: 'Waarschuwing',
    body: 'Herinneringen bevinden sich in reguliere meldingen. Hier past u alleen het operationele onderdeel aan.',
  },
  buttons: {
    openNotifications: 'Open meldingen',
    changeUnits: 'Wijzig eenheden',
  },
} as const;
