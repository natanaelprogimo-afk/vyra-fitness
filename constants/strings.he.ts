export { ShellStrings } from './strings.shell.he';

export const ErrorMessages = {
  noInternet: 'אין אות כאן. המשך בהקלטה וסינכרון כאשר החיבור יחזור.',
  aiUnavailable: 'שכבת AI אינה זמינה כעת. נסה שוב בעוד כמה דקות.',
  saveFailed: 'לא יכול לשמור עכשיו. הנתונים שלך בטוחים ואנסה שוב.',
  barcodeNotFound: 'לא מצאתי קוד זה. אתה יכול לחפש את המזון או להזין אותו ידנית.',
  paymentError: 'לא יכול להשלים פעולה זו. לא חלו שינויים.',
  photoAIFailed: 'לא יכול לקרוא את הארוחה הזאת היטב. נסה תמונה אחרת או הזן אותה ידנית.',
  voiceLogFailed: 'לא יכול להבין הקלטת קול זו. נסה שוב או הזן ידנית.',
  loginFailed: 'לא יכול להיכנס. בדוק את הנתונים שלך ונסה שוב.',
  registerFailed: 'לא יכול ליצור את חשבונך. נסה שוב.',
  sessionExpired: 'ההפעלה שלך פקעה. אנא התחבר שוב כדי להמשיך.',
  premiumRequired: 'תכונה זו אינה זמינה בגישה הנוכחית שלך.',
  generic: 'משהו השתבש. נסה שוב בעוד רגע.',
  loadFailed: 'לא יכול לטעון נתונים. החלק כדי לנסות שוב.',
  syncFailed: 'לא יכול לסינכרן. הנתונים שלך נשארים שמורים באופן מקומי.',
  permissionDenied: 'אני צריך את הרשותך כדי להמשיך. אתה יכול לשנות זאת בהגדרות.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'הכושר הגופני שלך, ברור מהיום.',
    subtitle: 'אימון, ארוחות, מים, שינה ותקדמה באפליקציה אחת.',
    cta: 'צור חשבון בחינם',
    login: 'התחבר לחשבון שלי',
    legal: 'בהמשך, אתה מסכים לתנאים שלנו.',
  },
  login: {
    title: 'ברוכים הבאים חזרה',
    subtitle: 'התחבר כדי להמשיך.',
    email: 'דוא"ל',
    password: 'סיסמה',
    submit: 'התחברות',
    forgotPassword: 'שכחת סיסמה?',
    noAccount: 'אין לך חשבון? צור אחד עכשיו',
  },
  register: {
    title: 'צור חשבון',
    subtitle: 'התחל את הנסיעה לכושר הגופני שלך.',
    email: 'דוא"ל',
    password: 'סיסמה',
    confirmPassword: 'אשר סיסמה',
    submit: 'צור חשבון',
    agreeToTerms: 'אני מסכים לתנאים.',
    alreadyHaveAccount: 'כבר יש לך חשבון? התחבר',
  },
  resetPassword: {
    title: 'איפוס סיסמה',
    subtitle: 'הזן את כתובת הדוא"ל שלך כדי לקבל הוראות.',
    email: 'דוא"ל',
    submit: 'שלח הוראות',
    backToLogin: 'חזור להתחברות',
  },
} as const;

export const OnboardingStrings = {
  title: 'ברוכים הבאים ל- Vyra Fitness',
  subtitle: 'בן לוויה בריאות ישיר שלך',
  slides: [
    {
      title: 'עקיבה מקיפה',
      description: 'אימון, תזונה, שינה והיגיינה במקום אחד.',
    },
    {
      title: 'בינה מלאכותית חכמה',
      description: 'קבל עצות מיוחדות בהתאם לנתונים שלך.',
    },
    {
      title: 'הגע לשלך',
      description: 'עקוב אחר ההתקדמות שלך וחגוג כל ניצחון.',
    },
  ],
  getStarted: 'התחל',
  skip: 'דלג',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'שלום',
    subtitle: 'היום הבריא שלך מתחיל כאן.',
  },
  readiness: {
    title: 'כשירות',
    description: 'האם אתה מוכן ליום הזה?',
    high: 'מצוין',
    moderate: 'טוב',
    low: 'תנוח',
  },
  waterIntake: {
    title: 'הידרציה',
    goal: 'יעד יומי',
    remaining: 'נותר',
  },
  sleep: {
    title: 'שינה',
    lastNight: 'אתמול בלילה',
    quality: 'איכות',
  },
  nutrition: {
    title: 'תזונה',
    todayCalories: 'קלוריות היום',
    goal: 'יעד',
  },
} as const;

export const ModuleNames = {
  fasting: 'צום',
  nutrition: 'תזונה',
  water: 'מים',
  workout: 'אימון',
  sleep: 'שינה',
  female: 'מחזור',
  mental: 'נפשי',
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
  general: 'אפליקציה זו אינה מחליפה עצה רפואית מקצועית.',
  health: 'התייעץ עם הרופא שלך לפני תחילת תוכנית חדשה.',
  nutrition: 'נתוני התזונה למטרות מידע בלבד.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'צום',
    fed: 'מזין',
    breaking: 'שבירת הצום',
  },
  goal: 'יעד הצום',
  window: 'חלון הצום',
  elapsed: 'חלף',
  remaining: 'נותר',
} as const;

export const FemaleHealthLabels = {
  title: 'מעקב מחזור',
  phase: 'שלב',
  follicular: 'פוליקולרי',
  ovulation: 'ביוץ',
  luteal: 'לוטאלי',
  menstrual: 'וסת',
  estimatedNextPeriod: 'התקופה הבאה משוערת',
} as const;

export const WorkoutLabels = {
  duration: 'משך הזמן',
  sets: 'סטים',
  reps: 'חזרות',
  weight: 'משקל',
  intensity: 'עוצמה',
  restDay: 'יום מנוחה',
  scheduled: 'מתוזמן',
} as const;

export const TabBarCopy = {
  home: 'בית',
  explore: 'חקור',
  progress: 'התקדמות',
  settings: 'הגדרות',
} as const;

export const BmiCategories = {
  underweight: 'תת משקל',
  normal: 'משקל נורמלי',
  overweight: 'עודף משקל',
  obese: 'השמנת יתר',
} as const;

export const ComponentMessages = {
  loading: 'טוען...',
  noData: 'אין נתונים זמינים',
  tryAgain: 'נסה שוב',
  confirm: 'אשר',
  cancel: 'בטל',
  delete: 'מחק',
  edit: 'ערוך',
  save: 'שמור',
  close: 'סגור',
} as const;

export const MentalLabels = {
  title: 'בריאות נפשית',
  mood: 'מצב רוח',
  stress: 'לחץ',
  energy: 'אנרגיה',
  sleep: 'איכות השינה',
} as const;

export const ReadinessLabels = {
  title: 'אינדקס כשירות',
  score: 'ניקוד',
  factors: 'גורמים',
} as const;

export const ReferralMessages = {
  title: 'הזמן חברים',
  description: 'זכה בפרסים על ידי שיתוף Vyra.',
  copyLink: 'העתק קישור',
  share: 'שתף',
} as const;

export const NotificationMessages = {
  waterReminder: 'אל תשכח לשתות מים',
  mealReminder: 'זה הזמן לאכול',
  sleepReminder: 'התכונן לשינה',
  workoutReminder: 'זמן אימון',
} as const;

export const PrivacyTexts = {
  title: 'פרטיות ונתונים',
  description: 'הנתונים שלך בטוחים ומוצפנים.',
  dataUsage: 'אנו משתמשים בנתונים שלך רק כדי לשפר את החוויה שלך.',
} as const;

export const ExplorePageStrings = {
  title: 'חקור',
  subtitle: 'גלה טיפים ומאמרים.',
  featured: 'מודגש',
  categories: 'קטגוריות',
  viewMore: 'ראה עוד',
} as const;

export const HomePageStrings = {
  dailyOverview: 'סקירה יומית',
  upcomingActivities: 'פעילויות קרובות',
  recentActivity: 'פעילות אחרונה',
  noActivity: 'אין פעילות כרגע',
} as const;

export const ProgressPageStrings = {
  title: 'התקדמות',
  weeklyStats: 'סטטיסטיקה שבועית',
  monthlyStats: 'סטטיסטיקה חודשית',
  viewDetails: 'ראה פרטים',
} as const;

export const WaterHydrationMessages = {
  goal: 'יעד הידרציה',
  daily: 'יומי',
  weekly: 'שבועי',
  loggingWater: 'רישום מים',
  waterLogged: 'רישום מים',
} as const;

export const StepsProgressMessages = {
  goal: 'יעד צעדים',
  daily: 'היום',
  weekly: 'השבוע הזה',
  stepsTaken: 'צעדים שנתקבלו',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'שגרת בוקר',
  eveningRoutine: 'שגרת ערב',
  hydration: 'הידרציה',
  nutrition: 'תזונה',
} as const;

export const ForgotPasswordStrings = {
  title: 'שכחת את הסיסמה',
  subtitle: 'נעזור לך לשחזר את החשבון שלך.',
  email: 'דוא"ל',
  submit: 'שלח',
  backToLogin: 'חזור להתחברות',
  checkEmail: 'בדוק את הדוא"ל שלך להוראות.',
} as const;

export const FastingMetabolicZones = {
  fed: 'מצב הנזנה',
  postAbsorptive: 'לאחר ספיגה',
  ketosis: 'קטוזה',
  deepKetosis: 'קטוזה עמוקה',
} as const;

export const BiometricLabels = {
  height: 'גובה',
  weight: 'משקל',
  bmi: 'BMI',
  bodyFat: 'שומן גוף',
  muscleMass: 'מסת שרירים',
  bloodPressure: 'לחץ דם',
  heartRate: 'קצב הלב',
} as const;

export const FemaleSymptoms = {
  cramps: 'כיווצים',
  bloating: 'תפיחות',
  mood: 'שינויי מצב רוח',
  headache: 'כאב ראש',
  fatigue: 'עיפות',
} as const;

export const NutritionModule = {
  macros: 'מקרו ייחוסים',
  proteins: 'חלבונים',
  carbs: 'פחמימות',
  fats: 'שומנים',
  fiber: 'סיבים',
  calories: 'קלוריות',
  micronutrients: 'מיקרו ייחוסים',
} as const;

export const FemaleModule = {
  cycle: 'מחזור וסת',
  symptoms: 'סימפטומים',
  tracking: 'מעקב',
  predictions: 'חיזויים',
} as const;

export const FastingModule = {
  fastingPeriod: 'תקופת הצום',
  breakingFast: 'שבירת הצום',
  metabolicState: 'מצב מטבולי',
  benefits: 'הטבות',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'הגדרות',
    title: 'מים',
  },
  dailyGoal: {
    title: 'יעד יומי',
    description: 'בחר בסיס ריאלי ואפליקציה תסתגל לגורמים.',
    presets: {
      low: 'פעילות נמוכה',
      moderate: 'בינוני',
      recommended: 'מומלץ',
      athlete: 'ספורטאי',
      hotClimate: 'אקלים חם',
    },
    customLabel: 'יעד מותאם',
    customHint: 'בין 500 מ"ל ל -10000 מ"ל.',
    unit: 'מ"ל',
  },
  infoCard: {
    eyebrow: 'התאמה',
    body: 'אם חם מאוד, אתה צם או היום שלך מלא בפעילות, Vyra עלול להעלות את היעד שלך.',
  },
  containers: {
    title: 'גישה מהירה',
    description: 'התאם פעם אחת את הכמות בכלים הממשיים שלך.',
    resetLabel: 'איפוס',
    resetA11y: 'שחזר גדלים ברירת מחדל',
    glass: 'זכוכית',
    largeGlass: 'זכוכית גדולה',
    bottle: 'בקבוק',
  },
  warningCard: {
    eyebrow: 'אזהרה',
    body: 'תזכורות נמצאות בהודעות רגילות. מכאן אתה מתאים רק את החלק התפעולי.',
  },
  buttons: {
    openNotifications: 'פתח הודעות',
    changeUnits: 'שנה יחידות',
  },
} as const;
