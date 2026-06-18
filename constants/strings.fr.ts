export { ShellStrings } from './strings.shell.fr';

export const ErrorMessages = {
  noInternet: 'Pas de signal ici. Continuez l\'enregistrement et je vais synchroniser quand la connexion reviendra.',
  aiUnavailable: 'La couche IA n\'est pas disponible pour le moment. Réessayez dans quelques minutes.',
  saveFailed: 'Je n\'ai pas pu enregistrer maintenant. Vos données sont sûres et je réessayerai.',
  barcodeNotFound: 'Je n\'ai pas trouvé ce code. Vous pouvez rechercher l\'aliment ou l\'entrer manuellement.',
  paymentError: 'Je n\'ai pas pu terminer cette action. Aucun changement n\'a été appliqué.',
  photoAIFailed: 'Je n\'ai pas pu bien lire ce repas. Essayez une autre photo ou entrez-le manuellement.',
  voiceLogFailed: 'Je n\'ai pas pu comprendre cet enregistrement vocal. Réessayez ou entrez-le manuellement.',
  loginFailed: 'Je n\'ai pas pu me connecter. Vérifiez vos données et réessayez.',
  registerFailed: 'Je n\'ai pas pu créer votre compte. Réessayez.',
  sessionExpired: 'Votre session a expiré. Connectez-vous à nouveau pour continuer.',
  premiumRequired: 'Cette fonction n\'est pas disponible dans votre accès actuel.',
  generic: 'Quelque chose s\'est mal passé. Réessayez dans un moment.',
  loadFailed: 'Je n\'ai pas pu charger les données. Glissez pour réessayer.',
  syncFailed: 'Je n\'ai pas pu synchroniser. Vos données restent enregistrées localement.',
  permissionDenied: 'J\'ai besoin de votre permission pour continuer. Vous pouvez la changer dans Paramètres.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Votre forme physique, claire dès aujourd\'hui.',
    subtitle: 'Entraînement, repas, eau, sommeil et progrès en une seule application.',
    cta: 'Créer un compte gratuit',
    login: 'Entrer dans mon compte',
    legal: 'En continuant, vous acceptez nos conditions.',
  },
  login: {
    title: 'Bienvenue',
    subtitle: 'Connectez-vous pour continuer.',
    email: 'E-mail',
    password: 'Mot de passe',
    submit: 'Se connecter',
    forgotPassword: 'Mot de passe oublié?',
    noAccount: 'Pas de compte? Créer maintenant',
  },
  register: {
    title: 'Créer un compte',
    subtitle: 'Commencez votre parcours de forme physique.',
    email: 'E-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    submit: 'Créer un compte',
    agreeToTerms: 'J\'accepte les conditions.',
    alreadyHaveAccount: 'Vous avez déjà un compte? Se connecter',
  },
  resetPassword: {
    title: 'Réinitialiser le mot de passe',
    subtitle: 'Entrez votre adresse e-mail pour recevoir les instructions.',
    email: 'E-mail',
    submit: 'Envoyer les instructions',
    backToLogin: 'Retour à la connexion',
  },
} as const;

export const OnboardingStrings = {
  title: 'Bienvenue à Vyra Fitness',
  subtitle: 'Votre compagnon de santé personnel',
  slides: [
    {
      title: 'Suivi complet',
      description: 'Entraînement, nutrition, sommeil et bien-être en un seul endroit.',
    },
    {
      title: 'IA intelligente',
      description: 'Recevez des conseils personnalisés basés sur vos données.',
    },
    {
      title: 'Atteindre vos objectifs',
      description: 'Suivez votre progrès et célébrez chaque victoire.',
    },
  ],
  getStarted: 'Commencer',
  skip: 'Ignorer',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Bonjour',
    subtitle: 'Votre journée de santé commence ici.',
  },
  readiness: {
    title: 'Disponibilité',
    description: 'Êtes-vous prêt pour aujourd\'hui?',
    high: 'Très bien',
    moderate: 'Bien',
    low: 'Reposez-vous',
  },
  waterIntake: {
    title: 'Hydratation',
    goal: 'Objectif pour la journée',
    remaining: 'Restant',
  },
  sleep: {
    title: 'Sommeil',
    lastNight: 'Nuit dernière',
    quality: 'Qualité',
  },
  nutrition: {
    title: 'Nutrition',
    todayCalories: 'Calories d\'aujourd\'hui',
    goal: 'Objectif',
  },
} as const;

export const ModuleNames = {
  fasting: 'Jeûne',
  nutrition: 'Nutrition',
  water: 'Hydratation',
  workout: 'Entraînement',
  sleep: 'Sommeil',
  female: 'Cycle',
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
  general: 'Cette application ne remplace pas un avis médical professionnel.',
  health: 'Consultez votre médecin avant de commencer un nouveau programme.',
  nutrition: 'Les données nutritionnelles sont à titre informatif uniquement.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'En jeûne',
    fed: 'Nourri',
    breaking: 'Rupture du jeûne',
  },
  goal: 'Objectif de jeûne',
  window: 'Fenêtre de jeûne',
  elapsed: 'Écoulé',
  remaining: 'Restant',
} as const;

export const FemaleHealthLabels = {
  title: 'Suivi du cycle',
  phase: 'Phase',
  follicular: 'Folliculaire',
  ovulation: 'Ovulation',
  luteal: 'Lutéale',
  menstrual: 'Menstruel',
  estimatedNextPeriod: 'Prochaines règles estimées',
} as const;

export const WorkoutLabels = {
  duration: 'Durée',
  sets: 'Séries',
  reps: 'Répétitions',
  weight: 'Poids',
  intensity: 'Intensité',
  restDay: 'Jour de repos',
  scheduled: 'Planifié',
} as const;

export const TabBarCopy = {
  home: 'Accueil',
  explore: 'Explorer',
  progress: 'Progrès',
  settings: 'Paramètres',
} as const;

export const BmiCategories = {
  underweight: 'Poids insuffisant',
  normal: 'Poids normal',
  overweight: 'Surpoids',
  obese: 'Obésité',
} as const;

export const ComponentMessages = {
  loading: 'Chargement...',
  noData: 'Aucune donnée disponible',
  tryAgain: 'Réessayer',
  confirm: 'Confirmer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  save: 'Enregistrer',
  close: 'Fermer',
} as const;

export const MentalLabels = {
  title: 'Bien-être mental',
  mood: 'Humeur',
  stress: 'Stress',
  energy: 'Énergie',
  sleep: 'Qualité du sommeil',
} as const;

export const ReadinessLabels = {
  title: 'Indice de disponibilité',
  score: 'Score',
  factors: 'Facteurs',
} as const;

export const ReferralMessages = {
  title: 'Invitez des amis',
  description: 'Gagnez des récompenses en partageant Vyra.',
  copyLink: 'Copier le lien',
  share: 'Partager',
} as const;

export const NotificationMessages = {
  waterReminder: 'N\'oubliez pas de boire de l\'eau',
  mealReminder: 'C\'est l\'heure de manger',
  sleepReminder: 'Préparez-vous à vous coucher',
  workoutReminder: 'Temps d\'entraînement',
} as const;

export const PrivacyTexts = {
  title: 'Confidentialité et données',
  description: 'Vos données sont sécurisées et chiffrées.',
  dataUsage: 'Nous utilisons vos données uniquement pour améliorer votre expérience.',
} as const;

export const ExplorePageStrings = {
  title: 'Explorer',
  subtitle: 'Découvrez des conseils et des articles.',
  featured: 'En vedette',
  categories: 'Catégories',
  viewMore: 'Voir plus',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Aperçu de la journée',
  upcomingActivities: 'Activités à venir',
  recentActivity: 'Activité récente',
  noActivity: 'Aucune activité pour le moment',
} as const;

export const ProgressPageStrings = {
  title: 'Progrès',
  weeklyStats: 'Statistiques hebdomadaires',
  monthlyStats: 'Statistiques mensuelles',
  viewDetails: 'Voir les détails',
} as const;

export const WaterHydrationMessages = {
  goal: 'Objectif d\'hydratation',
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  loggingWater: 'Enregistrement de l\'eau',
  waterLogged: 'Eau enregistrée',
} as const;

export const StepsProgressMessages = {
  goal: 'Objectif de pas',
  daily: 'Aujourd\'hui',
  weekly: 'Cette semaine',
  stepsTaken: 'Pas effectués',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Routine matinale',
  eveningRoutine: 'Routine du soir',
  hydration: 'Hydratation',
  nutrition: 'Nutrition',
} as const;

export const ForgotPasswordStrings = {
  title: 'Mot de passe oublié',
  subtitle: 'Nous vous aiderons à récupérer votre compte.',
  email: 'E-mail',
  submit: 'Envoyer',
  backToLogin: 'Retour à la connexion',
  checkEmail: 'Vérifiez votre e-mail pour les instructions.',
} as const;

export const FastingMetabolicZones = {
  fed: 'État nourri',
  postAbsorptive: 'Post-absorptif',
  ketosis: 'Cétose',
  deepKetosis: 'Cétose profonde',
} as const;

export const BiometricLabels = {
  height: 'Taille',
  weight: 'Poids',
  bmi: 'IMC',
  bodyFat: 'Graisse corporelle',
  muscleMass: 'Masse musculaire',
  bloodPressure: 'Tension artérielle',
  heartRate: 'Fréquence cardiaque',
} as const;

export const FemaleSymptoms = {
  cramps: 'Crampes',
  bloating: 'Ballonnements',
  mood: 'Changements d\'humeur',
  headache: 'Mal de tête',
  fatigue: 'Fatigue',
} as const;

export const NutritionModule = {
  macros: 'Macronutriments',
  proteins: 'Protéines',
  carbs: 'Glucides',
  fats: 'Graisses',
  fiber: 'Fibres',
  calories: 'Calories',
  micronutrients: 'Micronutriments',
} as const;

export const FemaleModule = {
  cycle: 'Cycle menstruel',
  symptoms: 'Symptômes',
  tracking: 'Suivi',
  predictions: 'Prédictions',
} as const;

export const FastingModule = {
  fastingPeriod: 'Période de jeûne',
  breakingFast: 'Rupture du jeûne',
  metabolicState: 'État métabolique',
  benefits: 'Avantages',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Paramètres',
    title: 'Eau',
  },
  dailyGoal: {
    title: 'Objectif quotidien',
    description: 'Choisissez une base réaliste et l\'application ajustera selon les facteurs.',
    presets: {
      low: 'Activité faible',
      moderate: 'Modéré',
      recommended: 'Recommandé',
      athlete: 'Athlète',
      hotClimate: 'Climat chaud',
    },
    customLabel: 'Objectif personnalisé',
    customHint: 'Entre 500 ml et 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Ajustement',
    body: 'S\'il fait très chaud, que vous jeûnez ou que votre journée est chargée, Vyra peut augmenter votre objectif.',
  },
  containers: {
    title: 'Raccourcis rapides',
    description: 'Réglez une fois la quantité de vos conteneurs réels.',
    resetLabel: 'Réinitialiser',
    resetA11y: 'Restaurer les tailles par défaut',
    glass: 'Verre',
    largeGlass: 'Grand verre',
    bottle: 'Bouteille',
  },
  warningCard: {
    eyebrow: 'Avertissement',
    body: 'Les rappels se trouvent dans les notifications habituelles. D\'ici, vous ajustez seulement la partie opérationnelle.',
  },
  buttons: {
    openNotifications: 'Ouvrir les notifications',
    changeUnits: 'Changer les unités',
  },
} as const;
