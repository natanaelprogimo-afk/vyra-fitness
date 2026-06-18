export { ShellStrings } from './strings.shell.el';

export const ErrorMessages = {
  noInternet: 'Δεν υπάρχει σήμα εδώ. Συνεχίστε την εγγραφή και θα συγχρονίσω όταν επιστρέψει η σύνδεση.',
  aiUnavailable: 'Το στρώμα AI δεν είναι διαθέσιμο αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγα λεπτά.',
  saveFailed: 'Δεν μπορώ να αποθηκεύσω τώρα. Τα δεδομένα σας είναι ασφαλή και θα προσπαθήσω ξανά.',
  barcodeNotFound: 'Δεν βρήκα αυτόν τον κωδικό. Μπορείς να ψάξεις το τρόφιμο ή να το εισάγεις χειροκίνητα.',
  paymentError: 'Δεν μπορώ να ολοκληρώσω αυτήν την ενέργεια. Δεν εφαρμόστηκαν αλλαγές.',
  photoAIFailed: 'Δεν μπορώ να διαβάσω καλά αυτό το γεύμα. Δοκιμάστε μια άλλη φωτογραφία ή εισάγετε την χειροκίνητα.',
  voiceLogFailed: 'Δεν μπορώ να καταλάβω αυτήν την εγγραφή φωνής. Δοκιμάστε ξανά ή εισάγετε την χειροκίνητα.',
  loginFailed: 'Δεν μπορώ να συνδεθώ. Ελέγξτε τα δεδομένα σας και δοκιμάστε ξανά.',
  registerFailed: 'Δεν μπορώ να δημιουργήσω το λογαριασμό σας. Προσπαθήστε ξανά.',
  sessionExpired: 'Η σύνοδός σας έληξε. Συνδεθείτε ξανά για να συνεχίσετε.',
  premiumRequired: 'Αυτή η δυνατότητα δεν είναι διαθέσιμη στην τρέχουσα πρόσβασή σας.',
  generic: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά σε λίγο.',
  loadFailed: 'Δεν μπορώ να φορτώσω τα δεδομένα. Σύρετε για να δοκιμάσετε ξανά.',
  syncFailed: 'Δεν μπορώ να συγχρονίσω. Τα δεδομένα σας παραμένουν αποθηκευμένα τοπικά.',
  permissionDenied: 'Χρειάζομαι την άδειά σας για να συνεχίσω. Μπορείτε να το αλλάξετε στις Ρυθμίσεις.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Η φυσική σας κατάσταση, σαφή από σήμερα.',
    subtitle: 'Άσκηση, γεύματα, νερό, ύπνος και πρόοδος σε μια εφαρμογή.',
    cta: 'Δημιουργήστε δωρεάν λογαριασμό',
    login: 'Συνδεθείτε στο λογαριασμό μου',
    legal: 'Συνεχίζοντας, αποδέχεστε τους όρους μας.',
  },
  login: {
    title: 'Καλώς ήρθατε πίσω',
    subtitle: 'Συνδεθείτε για να συνεχίσετε.',
    email: 'Ηλεκτρονικό ταχυδρομείο',
    password: 'Κωδικός πρόσβασης',
    submit: 'Σύνδεση',
    forgotPassword: 'Ξεχάσατε τον κωδικό πρόσβασης;',
    noAccount: 'Δεν έχετε λογαριασμό; Δημιουργήστε ένα τώρα',
  },
  register: {
    title: 'Δημιουργήστε λογαριασμό',
    subtitle: 'Ξεκινήστε το ταξίδι φυσικής κατάστασης.',
    email: 'Ηλεκτρονικό ταχυδρομείο',
    password: 'Κωδικός πρόσβασης',
    confirmPassword: 'Επιβεβαίωση κωδικού πρόσβασης',
    submit: 'Δημιουργήστε λογαριασμό',
    agreeToTerms: 'Συμφωνώ με τους όρους.',
    alreadyHaveAccount: 'Έχετε ήδη λογαριασμό; Συνδεθείτε',
  },
  resetPassword: {
    title: 'Επαναφορά κωδικού πρόσβασης',
    subtitle: 'Εισάγετε τη διεύθυνση email σας για να λάβετε οδηγίες.',
    email: 'Ηλεκτρονικό ταχυδρομείο',
    submit: 'Αποστολή οδηγιών',
    backToLogin: 'Επιστροφή στη σύνδεση',
  },
} as const;

export const OnboardingStrings = {
  title: 'Καλώς ήρθατε στο Vyra Fitness',
  subtitle: 'Ο προσωπικός σας σύντροφος υγείας',
  slides: [
    {
      title: 'Ολοκληρωμένη παρακολούθηση',
      description: 'Άσκηση, διατροφή, ύπνος και ευεξία σε ένα μέρος.',
    },
    {
      title: 'Έξυπνη τεχνητή νοημοσύνη',
      description: 'Λάβετε προσωποποιημένες συμβουλές με βάση τα δεδομένα σας.',
    },
    {
      title: 'Φτάστε τους στόχους σας',
      description: 'Παρακολουθήστε την πρόοδό σας και γιορτάστε κάθε νίκη.',
    },
  ],
  getStarted: 'Ξεκινήστε',
  skip: 'Παράλειψη',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Γεια σας',
    subtitle: 'Η υγιής μέρα σας ξεκινά εδώ.',
  },
  readiness: {
    title: 'Ετοιμότητα',
    description: 'Είστε έτοιμοι για σήμερα;',
    high: 'Πολύ καλά',
    moderate: 'Καλά',
    low: 'Ξεκουράστε',
  },
  waterIntake: {
    title: 'Ενυδάτωση',
    goal: 'Ημερήσιος στόχος',
    remaining: 'Απομένει',
  },
  sleep: {
    title: 'Ύπνος',
    lastNight: 'Χθες το βράδυ',
    quality: 'Ποιότητα',
  },
  nutrition: {
    title: 'Διατροφή',
    todayCalories: 'Θερμίδες σήμερα',
    goal: 'Στόχος',
  },
} as const;

export const ModuleNames = {
  fasting: 'Νηστεία',
  nutrition: 'Διατροφή',
  water: 'Νερό',
  workout: 'Άσκηση',
  sleep: 'Ύπνος',
  female: 'Κύκλος',
  mental: 'Διανοητικά',
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
  general: 'Η εφαρμογή αυτή δεν αντικαθιστά την επαγγελματική ιατρική συμβουλή.',
  health: 'Συμβουλευτείτε τον γιατρό σας πριν ξεκινήσετε ένα νέο πρόγραμμα.',
  nutrition: 'Τα δεδομένα διατροφής είναι μόνο για ενημερωτικούς σκοπούς.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Νηστεία',
    fed: 'Τροφοδοτημένο',
    breaking: 'Σπάσιμο νηστείας',
  },
  goal: 'Στόχος νηστείας',
  window: 'Παράθυρο νηστείας',
  elapsed: 'Παρήλθε',
  remaining: 'Απομένει',
} as const;

export const FemaleHealthLabels = {
  title: 'Παρακολούθηση κύκλου',
  phase: 'Φάση',
  follicular: 'Follicular',
  ovulation: 'Ωοθηκών',
  luteal: 'Λουτεάλη',
  menstrual: 'Περιοδική',
  estimatedNextPeriod: 'Εκτιμώμενη επόμενη περίοδος',
} as const;

export const WorkoutLabels = {
  duration: 'Διάρκεια',
  sets: 'Σετ',
  reps: 'Επαναλήψεις',
  weight: 'Βάρος',
  intensity: 'Έντασης',
  restDay: 'Ημέρα ανάπαυσης',
  scheduled: 'Προγραμματισμένο',
} as const;

export const TabBarCopy = {
  home: 'Αρχική',
  explore: 'Εξερεύνηση',
  progress: 'Πρόοδος',
  settings: 'Ρυθμίσεις',
} as const;

export const BmiCategories = {
  underweight: 'Ανεπάρκεια βάρους',
  normal: 'Κανονικό βάρος',
  overweight: 'Υπέρβαρη',
  obese: 'Παχυσαρκία',
} as const;

export const ComponentMessages = {
  loading: 'Φόρτωση...',
  noData: 'Δεν υπάρχουν διαθέσιμα δεδομένα',
  tryAgain: 'Δοκιμάστε ξανά',
  confirm: 'Επιβεβαιώστε',
  cancel: 'Ακύρωση',
  delete: 'Διαγραφή',
  edit: 'Επεξεργασία',
  save: 'Αποθήκευση',
  close: 'Κλείσιμο',
} as const;

export const MentalLabels = {
  title: 'Ψυχική υγεία',
  mood: 'Διάθεση',
  stress: 'Στρες',
  energy: 'Ενέργεια',
  sleep: 'Ποιότητα ύπνου',
} as const;

export const ReadinessLabels = {
  title: 'Δείκτης ετοιμότητας',
  score: 'Σκορ',
  factors: 'Παράγοντες',
} as const;

export const ReferralMessages = {
  title: 'Προσκαλέστε φίλους',
  description: 'Κερδίστε ανταμοιβές κοινοποιώντας τη Vyra.',
  copyLink: 'Αντιγραφή συνδέσμου',
  share: 'Κοινοποίηση',
} as const;

export const NotificationMessages = {
  waterReminder: 'Μην ξεχάσετε να πιείτε νερό',
  mealReminder: 'Ώρα να φάτε',
  sleepReminder: 'Προετοιμαστείτε για ύπνο',
  workoutReminder: 'Ώρα άσκησης',
} as const;

export const PrivacyTexts = {
  title: 'Απόρρητο και δεδομένα',
  description: 'Τα δεδομένα σας είναι ασφαλή και κρυπτογραφημένα.',
  dataUsage: 'Χρησιμοποιούμε τα δεδομένα σας μόνο για τη βελτίωση της εμπειρίας σας.',
} as const;

export const ExplorePageStrings = {
  title: 'Εξερεύνηση',
  subtitle: 'Ανακαλύψτε συμβουλές και άρθρα.',
  featured: 'Χαρακτηριστικά',
  categories: 'Κατηγορίες',
  viewMore: 'Προβολή περισσότερων',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Ημερήσια επισκόπηση',
  upcomingActivities: 'Προσεχείς δραστηριότητες',
  recentActivity: 'Πρόσφατη δραστηριότητα',
  noActivity: 'Καμία δραστηριότητα αυτή τη στιγμή',
} as const;

export const ProgressPageStrings = {
  title: 'Πρόοδος',
  weeklyStats: 'Εβδομαδιαία στατιστικά',
  monthlyStats: 'Μηνιαία στατιστικά',
  viewDetails: 'Προβολή λεπτομερειών',
} as const;

export const WaterHydrationMessages = {
  goal: 'Στόχος ενυδάτωσης',
  daily: 'Ημερησίως',
  weekly: 'Εβδομαδιαίως',
  loggingWater: 'Καταγραφή νερού',
  waterLogged: 'Νερό καταγεγραμμένο',
} as const;

export const StepsProgressMessages = {
  goal: 'Στόχος βημάτων',
  daily: 'Σήμερα',
  weekly: 'Αυτή την εβδομάδα',
  stepsTaken: 'Βήματα που ληφθήκαν',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Πρωινή ρουτίνα',
  eveningRoutine: 'Βραδινή ρουτίνα',
  hydration: 'Ενυδάτωση',
  nutrition: 'Διατροφή',
} as const;

export const ForgotPasswordStrings = {
  title: 'Ξεχάσατε τον κωδικό πρόσβασης',
  subtitle: 'Θα σας βοηθήσουμε να ανακτήσετε το λογαριασμό σας.',
  email: 'Ηλεκτρονικό ταχυδρομείο',
  submit: 'Αποστολή',
  backToLogin: 'Επιστροφή στη σύνδεση',
  checkEmail: 'Ελέγξτε το ηλεκτρονικό σας ταχυδρομείο για οδηγίες.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Κατάσταση ταΐσματος',
  postAbsorptive: 'Μετά την απορρόφηση',
  ketosis: 'Κέτωση',
  deepKetosis: 'Βαθιά κέτωση',
} as const;

export const BiometricLabels = {
  height: 'Ύψος',
  weight: 'Βάρος',
  bmi: 'ΔΜΣ',
  bodyFat: 'Σωματικό λίπος',
  muscleMass: 'Μυϊκή μάζα',
  bloodPressure: 'Αρτηριακή πίεση',
  heartRate: 'Καρδιακή συχνότητα',
} as const;

export const FemaleSymptoms = {
  cramps: '경련',
  bloating: 'Φούσκωμα',
  mood: 'Αλλαγές διάθεσης',
  headache: 'Πονοκέφαλος',
  fatigue: 'Κούραση',
} as const;

export const NutritionModule = {
  macros: 'Μακροθρεπτικές ουσίες',
  proteins: 'Πρωτεΐνες',
  carbs: 'Υδατάνθρακες',
  fats: 'Λίπη',
  fiber: 'Ίνες',
  calories: 'Θερμίδες',
  micronutrients: 'Μικροθρεπτικές ουσίες',
} as const;

export const FemaleModule = {
  cycle: 'Εμμηνικός κύκλος',
  symptoms: 'Συμπτώματα',
  tracking: 'Παρακολούθηση',
  predictions: 'Προβλέψεις',
} as const;

export const FastingModule = {
  fastingPeriod: 'Περίοδος νηστείας',
  breakingFast: 'Σπάσιμο νηστείας',
  metabolicState: 'Μεταβολική κατάσταση',
  benefits: 'Οφέλη',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Ρυθμίσεις',
    title: 'Νερό',
  },
  dailyGoal: {
    title: 'Ημερήσιος στόχος',
    description: 'Επιλέξτε μια ρεαλιστική βάση και η εφαρμογή θα προσαρμοστεί σε παράγοντες.',
    presets: {
      low: 'Χαμηλή δραστηριότητα',
      moderate: 'Μέτρια',
      recommended: 'Συνιστάται',
      athlete: 'Αθλητής',
      hotClimate: 'Ζεστό κλίμα',
    },
    customLabel: 'Προσαρμοσμένος στόχος',
    customHint: 'Μεταξύ 500 ml και 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Προσαρμογή',
    body: 'Εάν κάνει πολύ ζέστη, νηστεύετε ή η μέρα σας είναι γεμάτη δραστηριότητες, η Vyra μπορεί να αυξήσει το στόχο σας.',
  },
  containers: {
    title: 'Γρήγορη πρόσβαση',
    description: 'Ρυθμίστε μία φορά την ποσότητα στις πραγματικές σας δοχεία.',
    resetLabel: 'Επαναφορά',
    resetA11y: 'Επαναφορά προεπιλεγμένων μεγεθών',
    glass: 'Ποτήρι',
    largeGlass: 'Μεγάλο ποτήρι',
    bottle: 'Μπουκάλι',
  },
  warningCard: {
    eyebrow: 'Προειδοποίηση',
    body: 'Οι υπενθυμίσεις βρίσκονται στις κανονικές ειδοποιήσεις. Από εδώ προσαρμόζετε μόνο το λειτουργικό μέρος.',
  },
  buttons: {
    openNotifications: 'Ανοίξτε ειδοποιήσεις',
    changeUnits: 'Αλλάξτε μονάδες',
  },
} as const;
