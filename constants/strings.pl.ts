export { ShellStrings } from './strings.shell.pl';

export const ErrorMessages = {
  noInternet: 'Brak sygnału tutaj. Kontynuuj rejestrowanie, a ja synchronizuję, gdy powróci połączenie.',
  aiUnavailable: 'Warstwa sztucznej inteligencji jest niedostępna. Spróbuj za kilka minut.',
  saveFailed: 'Nie mogę teraz zapisać. Twoje dane są bezpieczne i spróbuję ponownie.',
  barcodeNotFound: 'Nie znalazłem tego kodu. Możesz wyszukać artykuł spożywczy lub wprowadzić go ręcznie.',
  paymentError: 'Nie mogę dokończyć tej czynności. Żadne zmiany nie zostały zastosowane.',
  photoAIFailed: 'Nie mogę dobrze przeczytać tego posiłku. Spróbuj innego zdjęcia lub wprowadź ręcznie.',
  voiceLogFailed: 'Nie mogę zrozumieć tego nagrania głosowego. Spróbuj ponownie lub wprowadź ręcznie.',
  loginFailed: 'Nie mogę się zalogować. Sprawdź dane i spróbuj ponownie.',
  registerFailed: 'Nie mogę utworzyć Twojego konta. Spróbuj ponownie.',
  sessionExpired: 'Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować.',
  premiumRequired: 'Ta funkcja nie jest dostępna w Twoim obecnym dostępie.',
  generic: 'Coś poszło nie tak. Spróbuj ponownie za chwilę.',
  loadFailed: 'Nie mogę załadować danych. Przesuń, aby spróbować ponownie.',
  syncFailed: 'Nie mogę zsynchronizować. Twoje dane pozostają zapisane lokalnie.',
  permissionDenied: 'Potrzebuję Twojej zgody, aby kontynuować. Możesz to zmienić w Ustawieniach.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Twoja sprawność fizyczna, od dziś jasna.',
    subtitle: 'Trening, posiłki, woda, sen i postępy w jednej aplikacji.',
    cta: 'Utwórz bezpłatne konto',
    login: 'Zaloguj się na moje konto',
    legal: 'Kontynuując, akceptujesz nasze warunki.',
  },
  login: {
    title: 'Witaj ponownie',
    subtitle: 'Zaloguj się, aby kontynuować.',
    email: 'E-mail',
    password: 'Hasło',
    submit: 'Zaloguj się',
    forgotPassword: 'Zapomniałeś hasła?',
    noAccount: 'Nie masz konta? Utwórz teraz',
  },
  register: {
    title: 'Utwórz konto',
    subtitle: 'Rozpocznij swoją podróż fitness.',
    email: 'E-mail',
    password: 'Hasło',
    confirmPassword: 'Potwierdź hasło',
    submit: 'Utwórz konto',
    agreeToTerms: 'Zgadzam się na warunki.',
    alreadyHaveAccount: 'Masz już konto? Zaloguj się',
  },
  resetPassword: {
    title: 'Zresetuj hasło',
    subtitle: 'Podaj swój adres e-mail, aby otrzymać instrukcje.',
    email: 'E-mail',
    submit: 'Wyślij instrukcje',
    backToLogin: 'Wróć do logowania',
  },
} as const;

export const OnboardingStrings = {
  title: 'Witamy w Vyra Fitness',
  subtitle: 'Twój osobisty partner zdrowia',
  slides: [
    {
      title: 'Kompleksowe śledzenie',
      description: 'Trening, odżywianie, sen i samopoczucie w jednym miejscu.',
    },
    {
      title: 'Inteligentna sztuczna inteligencja',
      description: 'Otrzymuj spersonalizowane porady na podstawie swoich danych.',
    },
    {
      title: 'Osiągnij swoje cele',
      description: 'Śledź swój postęp i świętuj każde zwycięstwo.',
    },
  ],
  getStarted: 'Zacznij',
  skip: 'Pomiń',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Cześć',
    subtitle: 'Twój zdrowy dzień zaczyna się tutaj.',
  },
  readiness: {
    title: 'Gotowość',
    description: 'Czy jesteś gotowy na dzisiaj?',
    high: 'Bardzo dobrze',
    moderate: 'Dobrze',
    low: 'Odpoczynek',
  },
  waterIntake: {
    title: 'Nawodnienie',
    goal: 'Cel dzienny',
    remaining: 'Pozostało',
  },
  sleep: {
    title: 'Sen',
    lastNight: 'Ostatniej nocy',
    quality: 'Jakość',
  },
  nutrition: {
    title: 'Odżywianie',
    todayCalories: 'Kalorie dzisiaj',
    goal: 'Cel',
  },
} as const;

export const ModuleNames = {
  fasting: 'Post',
  nutrition: 'Odżywianie',
  water: 'Woda',
  workout: 'Trening',
  sleep: 'Sen',
  female: 'Cykl',
  mental: 'Umysłowy',
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
  general: 'Ta aplikacja nie zastępuje profesjonalnej porady medycznej.',
  health: 'Konsultuj się z lekarzem przed rozpoczęciem nowego programu.',
  nutrition: 'Dane dotyczące odżywiania mają charakter wyłącznie informacyjny.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Post',
    fed: 'Pożywiony',
    breaking: 'Przerwanie postu',
  },
  goal: 'Cel postu',
  window: 'Okno postu',
  elapsed: 'Minęło',
  remaining: 'Pozostało',
} as const;

export const FemaleHealthLabels = {
  title: 'Śledzenie cyklu',
  phase: 'Faza',
  follicular: 'Pęcherzykowy',
  ovulation: 'Owulacja',
  luteal: 'Żółtakowy',
  menstrual: 'Miesiączkowy',
  estimatedNextPeriod: 'Szacowany następny okres',
} as const;

export const WorkoutLabels = {
  duration: 'Czas trwania',
  sets: 'Serie',
  reps: 'Powtórzenia',
  weight: 'Waga',
  intensity: 'Intensywność',
  restDay: 'Dzień odpoczynku',
  scheduled: 'Zaplanowane',
} as const;

export const TabBarCopy = {
  home: 'Strona główna',
  explore: 'Przeglądaj',
  progress: 'Postęp',
  settings: 'Ustawienia',
} as const;

export const BmiCategories = {
  underweight: 'Niedowaga',
  normal: 'Waga normalna',
  overweight: 'Nadwaga',
  obese: 'Otyłość',
} as const;

export const ComponentMessages = {
  loading: 'Ładowanie...',
  noData: 'Brak dostępnych danych',
  tryAgain: 'Spróbuj ponownie',
  confirm: 'Potwierdź',
  cancel: 'Anuluj',
  delete: 'Usuń',
  edit: 'Edytuj',
  save: 'Zapisz',
  close: 'Zamknij',
} as const;

export const MentalLabels = {
  title: 'Zdrowie psychiczne',
  mood: 'Nastrój',
  stress: 'Stres',
  energy: 'Energia',
  sleep: 'Jakość snu',
} as const;

export const ReadinessLabels = {
  title: 'Indeks gotowości',
  score: 'Wynik',
  factors: 'Czynniki',
} as const;

export const ReferralMessages = {
  title: 'Zaproś przyjaciół',
  description: 'Zdobądź nagrody, udostępniając Vyra.',
  copyLink: 'Skopiuj link',
  share: 'Udostępnij',
} as const;

export const NotificationMessages = {
  waterReminder: 'Nie zapomnij pić wody',
  mealReminder: 'Czas jeść',
  sleepReminder: 'Przygotuj się do snu',
  workoutReminder: 'Czas treningowy',
} as const;

export const PrivacyTexts = {
  title: 'Prywatność i dane',
  description: 'Twoje dane są bezpieczne i zaszyfrowane.',
  dataUsage: 'Używamy Twoich danych tylko w celu poprawy Twojego doświadczenia.',
} as const;

export const ExplorePageStrings = {
  title: 'Przeglądaj',
  subtitle: 'Odkryj porady i artykuły.',
  featured: 'Polecane',
  categories: 'Kategorie',
  viewMore: 'Pokaż więcej',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Przegląd dzisiejszego dnia',
  upcomingActivities: 'Nadchodzące czynności',
  recentActivity: 'Ostatnia czynność',
  noActivity: 'Brak czynności w tej chwili',
} as const;

export const ProgressPageStrings = {
  title: 'Postęp',
  weeklyStats: 'Statystyki tygodniowe',
  monthlyStats: 'Statystyki miesięczne',
  viewDetails: 'Pokaż szczegóły',
} as const;

export const WaterHydrationMessages = {
  goal: 'Cel nawodnienia',
  daily: 'Dzienny',
  weekly: 'Tygodniowy',
  loggingWater: 'Rejestrowanie wody',
  waterLogged: 'Woda zarejestrowana',
} as const;

export const StepsProgressMessages = {
  goal: 'Cel kroków',
  daily: 'Dzisiaj',
  weekly: 'Ten tydzień',
  stepsTaken: 'Zrobione kroki',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Rutyna poranna',
  eveningRoutine: 'Rutyna wieczorna',
  hydration: 'Nawodnienie',
  nutrition: 'Odżywianie',
} as const;

export const ForgotPasswordStrings = {
  title: 'Zapomniałeś hasła',
  subtitle: 'Pomożemy Ci odzyskać konto.',
  email: 'E-mail',
  submit: 'Wyślij',
  backToLogin: 'Wróć do logowania',
  checkEmail: 'Sprawdź swoją pocztę e-mail, aby uzyskać instrukcje.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Stan pożywienia',
  postAbsorptive: 'Pokarmowy',
  ketosis: 'Ketoza',
  deepKetosis: 'Głęboka ketoza',
} as const;

export const BiometricLabels = {
  height: 'Wysokość',
  weight: 'Waga',
  bmi: 'BMI',
  bodyFat: 'Tłuszcz ciała',
  muscleMass: 'Masa mięśniowa',
  bloodPressure: 'Ciśnienie krwi',
  heartRate: 'Tętno',
} as const;

export const FemaleSymptoms = {
  cramps: 'Skurcze',
  bloating: 'Wzdęcia',
  mood: 'Zmiany nastroju',
  headache: 'Ból głowy',
  fatigue: 'Zmęczenie',
} as const;

export const NutritionModule = {
  macros: 'Makroskładniki',
  proteins: 'Proteiny',
  carbs: 'Węglowodany',
  fats: 'Tłuszcze',
  fiber: 'Błonnik',
  calories: 'Kalorie',
  micronutrients: 'Mikroskładniki',
} as const;

export const FemaleModule = {
  cycle: 'Cykl menstruacyjny',
  symptoms: 'Objawy',
  tracking: 'Śledzenie',
  predictions: 'Prognozy',
} as const;

export const FastingModule = {
  fastingPeriod: 'Okres postu',
  breakingFast: 'Przerwanie postu',
  metabolicState: 'Stan metaboliczny',
  benefits: 'Korzyści',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Ustawienia',
    title: 'Woda',
  },
  dailyGoal: {
    title: 'Cel dzienny',
    description: 'Wybierz realistyczną podstawę, a aplikacja będzie się dostosować do czynników.',
    presets: {
      low: 'Niska aktywność',
      moderate: 'Umiarkowany',
      recommended: 'Zalecane',
      athlete: 'Sportowiec',
      hotClimate: 'Gorący klimat',
    },
    customLabel: 'Cel niestandardowy',
    customHint: 'Od 500 ml do 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Dostosowanie',
    body: 'Jeśli jest bardzo gorąco, poszczysz lub Twój dzień jest pełny aktywności, Vyra może zwiększyć Twój cel.',
  },
  containers: {
    title: 'Szybki dostęp',
    description: 'Ustaw raz ilość w swoich rzeczywistych pojemnikach.',
    resetLabel: 'Resetuj',
    resetA11y: 'Przywróć rozmiary domyślne',
    glass: 'Szklanka',
    largeGlass: 'Duża szklanka',
    bottle: 'Butelka',
  },
  warningCard: {
    eyebrow: 'Ostrzeżenie',
    body: 'Przypomnienia znajdują się w zwykłych powiadomieniach. Stąd dostosowujesz tylko część operacyjną.',
  },
  buttons: {
    openNotifications: 'Otwórz powiadomienia',
    changeUnits: 'Zmień jednostki',
  },
} as const;
