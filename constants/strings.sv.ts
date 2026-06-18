export { ShellStrings } from './strings.shell.sv';

export const ErrorMessages = {
  noInternet: 'Ingen signal här. Fortsätt spela in så synkroniserar jag när anslutningen kommer tillbaka.',
  aiUnavailable: 'AI-lagret är inte tillgängligt för närvarande. Försök igen om några minuter.',
  saveFailed: 'Jag kan inte spara nu. Dina data är säkra och jag försöker igen.',
  barcodeNotFound: 'Jag hittade inte den koden. Du kan söka efter maten eller ange den manuellt.',
  paymentError: 'Jag kunde inte slutföra denna åtgärd. Inga ändringar tillämpades.',
  photoAIFailed: 'Jag kunde inte läsa den måltiden väl. Prova ett annat foto eller ange det manuellt.',
  voiceLogFailed: 'Jag kunde inte förstå den röstinspelningen. Försök igen eller ange den manuellt.',
  loginFailed: 'Jag kunde inte logga in. Kontrollera dina uppgifter och försök igen.',
  registerFailed: 'Jag kunde inte skapa ditt konto. Försök igen.',
  sessionExpired: 'Din session har upphört. Logga in igen för att fortsätta.',
  premiumRequired: 'Den här funktionen är inte tillgänglig i din nuvarande åtkomst.',
  generic: 'Något gick fel. Försök igen om en stund.',
  loadFailed: 'Jag kunde inte läsa in data. Dra för att försöka igen.',
  syncFailed: 'Jag kunde inte synkronisera. Dina data förblir sparade lokalt.',
  permissionDenied: 'Jag behöver din tillåtelse för att fortsätta. Du kan ändra detta i Inställningar.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Din fitness, tydlig från idag.',
    subtitle: 'Träning, måltider, vatten, sömn och framsteg i en app.',
    cta: 'Skapa gratis konto',
    login: 'Logga in på mitt konto',
    legal: 'Genom att fortsätta accepterar du våra villkor.',
  },
  login: {
    title: 'Välkommen tillbaka',
    subtitle: 'Logga in för att fortsätta.',
    email: 'E-post',
    password: 'Lösenord',
    submit: 'Logga in',
    forgotPassword: 'Glömt lösenordet?',
    noAccount: 'Inget konto? Skapa en nu',
  },
  register: {
    title: 'Skapa konto',
    subtitle: 'Börja din fitnesresa.',
    email: 'E-post',
    password: 'Lösenord',
    confirmPassword: 'Bekräfta lösenord',
    submit: 'Skapa konto',
    agreeToTerms: 'Jag godtar villkoren.',
    alreadyHaveAccount: 'Har du redan ett konto? Logga in',
  },
  resetPassword: {
    title: 'Återställ lösenord',
    subtitle: 'Ange din e-postadress för att få instruktioner.',
    email: 'E-post',
    submit: 'Skicka instruktioner',
    backToLogin: 'Tillbaka till inloggning',
  },
} as const;

export const OnboardingStrings = {
  title: 'Välkommen till Vyra Fitness',
  subtitle: 'Din personliga hälsopartner',
  slides: [
    {
      title: 'Omfattande spårning',
      description: 'Träning, näring, sömn och välbefinnande på ett ställe.',
    },
    {
      title: 'Intelligent AI',
      description: 'Få personaliserade tips baserat på dina data.',
    },
    {
      title: 'Nå dina mål',
      description: 'Spåra din framgång och fira varje seger.',
    },
  ],
  getStarted: 'Börja',
  skip: 'Hoppa över',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Hallå',
    subtitle: 'Din hälsodag börjar här.',
  },
  readiness: {
    title: 'Beredskap',
    description: 'Är du redo för idag?',
    high: 'Mycket bra',
    moderate: 'Bra',
    low: 'Vila',
  },
  waterIntake: {
    title: 'Vätskeintag',
    goal: 'Dagligt mål',
    remaining: 'Återstår',
  },
  sleep: {
    title: 'Sömn',
    lastNight: 'I går kväll',
    quality: 'Kvalitet',
  },
  nutrition: {
    title: 'Näring',
    todayCalories: 'Kalorier idag',
    goal: 'Mål',
  },
} as const;

export const ModuleNames = {
  fasting: 'Fasta',
  nutrition: 'Näring',
  water: 'Vatten',
  workout: 'Träning',
  sleep: 'Sömn',
  female: 'Cykel',
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
  general: 'Den här appen ersätter inte professionell medicinsk rådgivning.',
  health: 'Rådgör med din läkare innan du påbörjar ett nytt program.',
  nutrition: 'Näringsvärde är endast för informationsändamål.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Fasta',
    fed: 'Född',
    breaking: 'Bryta fastan',
  },
  goal: 'Fastmål',
  window: 'Fastfönster',
  elapsed: 'Förfluten',
  remaining: 'Återstår',
} as const;

export const FemaleHealthLabels = {
  title: 'Cykluspårning',
  phase: 'Fas',
  follicular: 'Follikulär',
  ovulation: 'Ovulation',
  luteal: 'Lutealt',
  menstrual: 'Menstruation',
  estimatedNextPeriod: 'Uppskattad nästa period',
} as const;

export const WorkoutLabels = {
  duration: 'Varaktighet',
  sets: 'Serier',
  reps: 'Repetitioner',
  weight: 'Vikt',
  intensity: 'Intensitet',
  restDay: 'Vilotag',
  scheduled: 'Schemalagd',
} as const;

export const TabBarCopy = {
  home: 'Hem',
  explore: 'Utforska',
  progress: 'Framsteg',
  settings: 'Inställningar',
} as const;

export const BmiCategories = {
  underweight: 'Undervikt',
  normal: 'Normal vikt',
  overweight: 'Övervikt',
  obese: 'Fetma',
} as const;

export const ComponentMessages = {
  loading: 'Laddar...',
  noData: 'Ingen data tillgänglig',
  tryAgain: 'Försök igen',
  confirm: 'Bekräfta',
  cancel: 'Avbryt',
  delete: 'Radera',
  edit: 'Redigera',
  save: 'Spara',
  close: 'Stänga',
} as const;

export const MentalLabels = {
  title: 'Psykisk hälsa',
  mood: 'Humör',
  stress: 'Stress',
  energy: 'Energi',
  sleep: 'Sömnkvalitet',
} as const;

export const ReadinessLabels = {
  title: 'Beredskapsindex',
  score: 'Poäng',
  factors: 'Faktorer',
} as const;

export const ReferralMessages = {
  title: 'Bjud in vänner',
  description: 'Tjäna belöningar genom att dela Vyra.',
  copyLink: 'Kopiera länk',
  share: 'Dela',
} as const;

export const NotificationMessages = {
  waterReminder: 'Glöm inte att dricka vatten',
  mealReminder: 'Det är dags att äta',
  sleepReminder: 'Förbered dig för sömn',
  workoutReminder: 'Träning tid',
} as const;

export const PrivacyTexts = {
  title: 'Integritet och data',
  description: 'Dina data är säkra och krypterade.',
  dataUsage: 'Vi använder dina data endast för att förbättra din upplevelse.',
} as const;

export const ExplorePageStrings = {
  title: 'Utforska',
  subtitle: 'Upptäck tips och artiklar.',
  featured: 'Aktuellt',
  categories: 'Kategorier',
  viewMore: 'Visa mer',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Daglig översikt',
  upcomingActivities: 'Kommande aktiviteter',
  recentActivity: 'Senaste aktivitet',
  noActivity: 'Ingen aktivitet för närvarande',
} as const;

export const ProgressPageStrings = {
  title: 'Framsteg',
  weeklyStats: 'Veckovisa statistik',
  monthlyStats: 'Månatlig statistik',
  viewDetails: 'Visa detaljer',
} as const;

export const WaterHydrationMessages = {
  goal: 'Vätskeintaksmål',
  daily: 'Dagligen',
  weekly: 'Veckovis',
  loggingWater: 'Loggning av vatten',
  waterLogged: 'Vatten inloggat',
} as const;

export const StepsProgressMessages = {
  goal: 'Stegmål',
  daily: 'Idag',
  weekly: 'Den här veckan',
  stepsTaken: 'Steg tagna',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Morningprogram',
  eveningRoutine: 'Kvällsprogram',
  hydration: 'Vätskeintag',
  nutrition: 'Näring',
} as const;

export const ForgotPasswordStrings = {
  title: 'Glömt lösenord',
  subtitle: 'Vi hjälper dig att återfå ditt konto.',
  email: 'E-post',
  submit: 'Skicka',
  backToLogin: 'Tillbaka till inloggning',
  checkEmail: 'Kontrollera din e-post för instruktioner.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Mätt tillstånd',
  postAbsorptive: 'Postabsorptiv',
  ketosis: 'Ketosis',
  deepKetosis: 'Djup ketosis',
} as const;

export const BiometricLabels = {
  height: 'Höjd',
  weight: 'Vikt',
  bmi: 'BMI',
  bodyFat: 'Kroppsfett',
  muscleMass: 'Muskelmassa',
  bloodPressure: 'Blodtryck',
  heartRate: 'Hjärtfrekvens',
} as const;

export const FemaleSymptoms = {
  cramps: 'Kramp',
  bloating: 'Uppsvälldhet',
  mood: 'Humörsvängningar',
  headache: 'Huvudvärk',
  fatigue: 'Trötthet',
} as const;

export const NutritionModule = {
  macros: 'Makronäringsämnen',
  proteins: 'Proteiner',
  carbs: 'Kolhydrater',
  fats: 'Fetter',
  fiber: 'Fiber',
  calories: 'Kalorier',
  micronutrients: 'Mikronäringsämnen',
} as const;

export const FemaleModule = {
  cycle: 'Menstruationscyclus',
  symptoms: 'Symptom',
  tracking: 'Spårning',
  predictions: 'Förutsägelser',
} as const;

export const FastingModule = {
  fastingPeriod: 'Fasttid',
  breakingFast: 'Bryta fastan',
  metabolicState: 'Metaboliskt tillstånd',
  benefits: 'Fördelar',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Inställningar',
    title: 'Vatten',
  },
  dailyGoal: {
    title: 'Dagligt mål',
    description: 'Välj en realistisk bas och appen kommer att anpassas efter faktorer.',
    presets: {
      low: 'Låg aktivitet',
      moderate: 'Måttlig',
      recommended: 'Rekommenderad',
      athlete: 'Idrottare',
      hotClimate: 'Varmt klimat',
    },
    customLabel: 'Anpassat mål',
    customHint: 'Mellan 500 ml och 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Justering',
    body: 'Om det är mycket varmt, du fastar eller din dag är full av aktiviteter kan Vyra öka ditt mål.',
  },
  containers: {
    title: 'Snabb åtkomst',
    description: 'Justera en gång mängden i dina faktiska behållare.',
    resetLabel: 'Återställ',
    resetA11y: 'Återställ standardstorlekar',
    glass: 'Glas',
    largeGlass: 'Stort glas',
    bottle: 'Flaska',
  },
  warningCard: {
    eyebrow: 'Varning',
    body: 'Påminnelser finns i vanliga aviseringar. Härifrån justerar du endast den operativa delen.',
  },
  buttons: {
    openNotifications: 'Öppna aviseringar',
    changeUnits: 'Ändra enheter',
  },
} as const;
