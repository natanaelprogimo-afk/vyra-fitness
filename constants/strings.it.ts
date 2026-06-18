export { ShellStrings } from './strings.shell.it';

export const ErrorMessages = {
  noInternet: 'Nessun segnale qui. Continua la registrazione e sincronizzerò quando la connessione tornerà.',
  aiUnavailable: 'Lo strato di IA non è disponibile al momento. Riprova tra pochi minuti.',
  saveFailed: 'Non ho potuto salvare ora. I tuoi dati sono al sicuro e riproverò.',
  barcodeNotFound: 'Non ho trovato quel codice. Puoi cercare l\'alimento o inserirlo manualmente.',
  paymentError: 'Non ho potuto completare questa azione. Nessun cambiamento è stato applicato.',
  photoAIFailed: 'Non ho potuto leggere bene quel pasto. Prova con un\'altra foto o inseriscilo manualmente.',
  voiceLogFailed: 'Non ho potuto capire quella registrazione vocale. Riprova o inseriscila manualmente.',
  loginFailed: 'Non ho potuto accedere. Controlla i tuoi dati e riprova.',
  registerFailed: 'Non ho potuto creare il tuo account. Riprova.',
  sessionExpired: 'La tua sessione è scaduta. Accedi di nuovo per continuare.',
  premiumRequired: 'Questa funzione non è disponibile nel tuo accesso attuale.',
  generic: 'Qualcosa è andato storto. Riprova tra un momento.',
  loadFailed: 'Non ho potuto caricare i dati. Scorri per riprovare.',
  syncFailed: 'Non ho potuto sincronizzare. I tuoi dati rimangono salvati localmente.',
  permissionDenied: 'Ho bisogno della tua autorizzazione per continuare. Puoi cambiarla in Impostazioni.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'La tua forma fisica, chiara da oggi.',
    subtitle: 'Allenamento, pasti, acqua, sonno e progressi in un\'unica app.',
    cta: 'Crea un account gratuito',
    login: 'Accedi al mio account',
    legal: 'Continuando, accetti i nostri termini.',
  },
  login: {
    title: 'Bentornato',
    subtitle: 'Accedi per continuare.',
    email: 'Email',
    password: 'Password',
    submit: 'Accedi',
    forgotPassword: 'Password dimenticata?',
    noAccount: 'Non hai un account? Creane uno ora',
  },
  register: {
    title: 'Crea un account',
    subtitle: 'Inizia il tuo viaggio di fitness.',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Conferma password',
    submit: 'Crea un account',
    agreeToTerms: 'Accetto i termini.',
    alreadyHaveAccount: 'Hai già un account? Accedi',
  },
  resetPassword: {
    title: 'Reimposta password',
    subtitle: 'Inserisci il tuo indirizzo email per ricevere le istruzioni.',
    email: 'Email',
    submit: 'Invia istruzioni',
    backToLogin: 'Torna all\'accesso',
  },
} as const;

export const OnboardingStrings = {
  title: 'Benvenuto a Vyra Fitness',
  subtitle: 'Il tuo compagno personale di salute',
  slides: [
    {
      title: 'Monitoraggio completo',
      description: 'Allenamento, nutrizione, sonno e benessere in un\'unica posizione.',
    },
    {
      title: 'IA intelligente',
      description: 'Ricevi consigli personalizzati basati sui tuoi dati.',
    },
    {
      title: 'Raggiungi i tuoi obiettivi',
      description: 'Traccia i tuoi progressi e celebra ogni vittoria.',
    },
  ],
  getStarted: 'Inizia',
  skip: 'Salta',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Ciao',
    subtitle: 'La tua giornata di salute inizia qui.',
  },
  readiness: {
    title: 'Prontezza',
    description: 'Sei pronto per oggi?',
    high: 'Molto bene',
    moderate: 'Bene',
    low: 'Riposati',
  },
  waterIntake: {
    title: 'Idratazione',
    goal: 'Obiettivo della giornata',
    remaining: 'Rimanente',
  },
  sleep: {
    title: 'Sonno',
    lastNight: 'Notte scorsa',
    quality: 'Qualità',
  },
  nutrition: {
    title: 'Nutrizione',
    todayCalories: 'Calorie di oggi',
    goal: 'Obiettivo',
  },
} as const;

export const ModuleNames = {
  fasting: 'Digiuno',
  nutrition: 'Nutrizione',
  water: 'Acqua',
  workout: 'Allenamento',
  sleep: 'Sonno',
  female: 'Ciclo',
  mental: 'Mentale',
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
  general: 'Questa app non sostituisce il consiglio medico professionale.',
  health: 'Consulta il tuo medico prima di iniziare un nuovo programma.',
  nutrition: 'I dati nutrizionali sono solo a scopo informativo.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Digiuno',
    fed: 'Alimentato',
    breaking: 'Interruzione del digiuno',
  },
  goal: 'Obiettivo di digiuno',
  window: 'Finestra di digiuno',
  elapsed: 'Trascorso',
  remaining: 'Rimanente',
} as const;

export const FemaleHealthLabels = {
  title: 'Monitoraggio del ciclo',
  phase: 'Fase',
  follicular: 'Follicolare',
  ovulation: 'Ovulazione',
  luteal: 'Luteale',
  menstrual: 'Mestruale',
  estimatedNextPeriod: 'Prossimo periodo stimato',
} as const;

export const WorkoutLabels = {
  duration: 'Durata',
  sets: 'Serie',
  reps: 'Ripetizioni',
  weight: 'Peso',
  intensity: 'Intensità',
  restDay: 'Giorno di riposo',
  scheduled: 'Programmato',
} as const;

export const TabBarCopy = {
  home: 'Home',
  explore: 'Esplora',
  progress: 'Progressi',
  settings: 'Impostazioni',
} as const;

export const BmiCategories = {
  underweight: 'Sottopeso',
  normal: 'Peso normale',
  overweight: 'Sovrappeso',
  obese: 'Obeso',
} as const;

export const ComponentMessages = {
  loading: 'Caricamento...',
  noData: 'Nessun dato disponibile',
  tryAgain: 'Riprova',
  confirm: 'Conferma',
  cancel: 'Annulla',
  delete: 'Elimina',
  edit: 'Modifica',
  save: 'Salva',
  close: 'Chiudi',
} as const;

export const MentalLabels = {
  title: 'Benessere mentale',
  mood: 'Umore',
  stress: 'Stress',
  energy: 'Energia',
  sleep: 'Qualità del sonno',
} as const;

export const ReadinessLabels = {
  title: 'Indice di prontezza',
  score: 'Punteggio',
  factors: 'Fattori',
} as const;

export const ReferralMessages = {
  title: 'Invita amici',
  description: 'Guadagna premi condividendo Vyra.',
  copyLink: 'Copia link',
  share: 'Condividi',
} as const;

export const NotificationMessages = {
  waterReminder: 'Non dimenticare di bere acqua',
  mealReminder: 'È ora di mangiare',
  sleepReminder: 'Preparati per il sonno',
  workoutReminder: 'Tempo di allenamento',
} as const;

export const PrivacyTexts = {
  title: 'Privacy e dati',
  description: 'I tuoi dati sono al sicuro e crittografati.',
  dataUsage: 'Usiamo i tuoi dati solo per migliorare la tua esperienza.',
} as const;

export const ExplorePageStrings = {
  title: 'Esplora',
  subtitle: 'Scopri consigli e articoli.',
  featured: 'In evidenza',
  categories: 'Categorie',
  viewMore: 'Visualizza altro',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Panoramica giornaliera',
  upcomingActivities: 'Attività in arrivo',
  recentActivity: 'Attività recente',
  noActivity: 'Nessuna attività al momento',
} as const;

export const ProgressPageStrings = {
  title: 'Progressi',
  weeklyStats: 'Statistiche settimanali',
  monthlyStats: 'Statistiche mensili',
  viewDetails: 'Visualizza dettagli',
} as const;

export const WaterHydrationMessages = {
  goal: 'Obiettivo di idratazione',
  daily: 'Giornaliero',
  weekly: 'Settimanale',
  loggingWater: 'Registrazione acqua',
  waterLogged: 'Acqua registrata',
} as const;

export const StepsProgressMessages = {
  goal: 'Obiettivo passi',
  daily: 'Oggi',
  weekly: 'Questa settimana',
  stepsTaken: 'Passi effettuati',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Routine mattutina',
  eveningRoutine: 'Routine serale',
  hydration: 'Idratazione',
  nutrition: 'Nutrizione',
} as const;

export const ForgotPasswordStrings = {
  title: 'Password dimenticata',
  subtitle: 'Ti aiuteremo a recuperare il tuo account.',
  email: 'Email',
  submit: 'Invia',
  backToLogin: 'Torna all\'accesso',
  checkEmail: 'Controlla la tua email per le istruzioni.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Stato alimentato',
  postAbsorptive: 'Post-assorbitivo',
  ketosis: 'Chetosi',
  deepKetosis: 'Chetosi profonda',
} as const;

export const BiometricLabels = {
  height: 'Altezza',
  weight: 'Peso',
  bmi: 'IMC',
  bodyFat: 'Grasso corporeo',
  muscleMass: 'Massa muscolare',
  bloodPressure: 'Pressione sanguigna',
  heartRate: 'Frequenza cardiaca',
} as const;

export const FemaleSymptoms = {
  cramps: 'Crampi',
  bloating: 'Gonfiore',
  mood: 'Sbalzi d\'umore',
  headache: 'Mal di testa',
  fatigue: 'Stanchezza',
} as const;

export const NutritionModule = {
  macros: 'Macronutrienti',
  proteins: 'Proteine',
  carbs: 'Carboidrati',
  fats: 'Grassi',
  fiber: 'Fibre',
  calories: 'Calorie',
  micronutrients: 'Micronutrienti',
} as const;

export const FemaleModule = {
  cycle: 'Ciclo mestruale',
  symptoms: 'Sintomi',
  tracking: 'Monitoraggio',
  predictions: 'Previsioni',
} as const;

export const FastingModule = {
  fastingPeriod: 'Periodo di digiuno',
  breakingFast: 'Interruzione del digiuno',
  metabolicState: 'Stato metabolico',
  benefits: 'Benefici',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Impostazioni',
    title: 'Acqua',
  },
  dailyGoal: {
    title: 'Obiettivo giornaliero',
    description: 'Scegli una base realistica e l\'app si adatterà ai fattori.',
    presets: {
      low: 'Attività bassa',
      moderate: 'Moderato',
      recommended: 'Consigliato',
      athlete: 'Atleta',
      hotClimate: 'Clima caldo',
    },
    customLabel: 'Obiettivo personalizzato',
    customHint: 'Tra 500 ml e 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Regolazione',
    body: 'Se fa molto caldo, stai digiunando o la tua giornata è piena, Vyra potrebbe aumentare il tuo obiettivo.',
  },
  containers: {
    title: 'Accessi rapidi',
    description: 'Regola una volta la quantità nei tuoi contenitori effettivi.',
    resetLabel: 'Ripristina',
    resetA11y: 'Ripristina le dimensioni predefinite',
    glass: 'Bicchiere',
    largeGlass: 'Bicchiere grande',
    bottle: 'Bottiglia',
  },
  warningCard: {
    eyebrow: 'Avvertenza',
    body: 'I promemoria si trovano nelle notifiche ordinarie. Da qui regoli solo la parte operativa.',
  },
  buttons: {
    openNotifications: 'Apri notifiche',
    changeUnits: 'Cambia unità',
  },
} as const;
