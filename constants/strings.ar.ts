export { ShellStrings } from './strings.shell.ar';

export const ErrorMessages = {
  noInternet: 'لا توجد شبكة هنا. استمر في التسجيل وسأقوم بالمزامنة عند عودة الاتصال.',
  aiUnavailable: 'طبقة الذكاء الاصطناعي غير متاحة حالياً. حاول مرة أخرى في بضع دقائق.',
  saveFailed: 'لم أتمكن من الحفظ الآن. بيانتك آمنة وسأحاول مرة أخرى.',
  barcodeNotFound: 'لم أجد هذا الرمز. يمكنك البحث عن الطعام أو إدخاله يدويًا.',
  paymentError: 'لم أتمكن من إكمال هذا الإجراء. لم يتم تطبيق أي تغييرات.',
  photoAIFailed: 'لم أتمكن من قراءة تلك الوجبة بشكل جيد. حاول بصورة أخرى أو أدخلها يدويًا.',
  voiceLogFailed: 'لم أتمكن من فهم تسجيل الصوت هذا. حاول مرة أخرى أو أدخله يدويًا.',
  loginFailed: 'لم أتمكن من تسجيل الدخول. تحقق من بيانتك وحاول مرة أخرى.',
  registerFailed: 'لم أتمكن من إنشاء حسابك. حاول مرة أخرى.',
  sessionExpired: 'انتهت صلاحية جلستك. سجل الدخول مرة أخرى للمتابعة.',
  premiumRequired: 'هذه الميزة غير متاحة في وصولك الحالي.',
  generic: 'حدث خطأ ما. حاول مرة أخرى في لحظة.',
  loadFailed: 'لم أتمكن من تحميل البيانات. اسحب لتحاول مرة أخرى.',
  syncFailed: 'لم أتمكن من المزامنة. بيانتك تبقى محفوظة محليًا.',
  permissionDenied: 'أحتاج إلى إذنك للمتابعة. يمكنك تغيير هذا في الإعدادات.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'لياقتك البدنية واضحة من اليوم.',
    subtitle: 'التمارين والوجبات والماء والنوم والتقدم في تطبيق واحد.',
    cta: 'إنشاء حساب مجاني',
    login: 'الدخول إلى حسابي',
    legal: 'بالمتابعة، فإنك توافق على شروطنا.',
  },
  login: {
    title: 'أهلا وسهلا',
    subtitle: 'سجل دخولك للمتابعة.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    submit: 'دخول',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟ أنشئ واحدًا الآن',
  },
  register: {
    title: 'إنشاء حساب',
    subtitle: 'ابدأ رحلتك في اللياقة البدنية.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    submit: 'إنشاء حساب',
    agreeToTerms: 'أوافق على الشروط.',
    alreadyHaveAccount: 'هل لديك بالفعل حساب؟ تسجيل دخول',
  },
  resetPassword: {
    title: 'إعادة تعيين كلمة المرور',
    subtitle: 'أدخل عنوان بريدك الإلكتروني لتلقي التعليمات.',
    email: 'البريد الإلكتروني',
    submit: 'إرسال التعليمات',
    backToLogin: 'العودة إلى تسجيل الدخول',
  },
} as const;

export const OnboardingStrings = {
  title: 'مرحبًا بك في Vyra Fitness',
  subtitle: 'رفيقك الشخصي للصحة',
  slides: [
    {
      title: 'تتبع شامل',
      description: 'التمارين والتغذية والنوم والعافية في مكان واحد.',
    },
    {
      title: 'ذكاء اصطناعي ذكي',
      description: 'احصل على نصائح مخصصة بناءً على بيانتك.',
    },
    {
      title: 'تحقيق أهدافك',
      description: 'تتبع تقدمك واحتفل بكل انتصار.',
    },
  ],
  getStarted: 'البدء',
  skip: 'تخطي',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'مرحبا',
    subtitle: 'يبدأ يومك الصحي هنا.',
  },
  readiness: {
    title: 'الجاهزية',
    description: 'هل أنت مستعد لهذا اليوم؟',
    high: 'جيد جدا',
    moderate: 'جيد',
    low: 'استرح',
  },
  waterIntake: {
    title: 'الترطيب',
    goal: 'الهدف اليومي',
    remaining: 'المتبقي',
  },
  sleep: {
    title: 'النوم',
    lastNight: 'الليلة الماضية',
    quality: 'الجودة',
  },
  nutrition: {
    title: 'التغذية',
    todayCalories: 'السعرات الحرارية لهذا اليوم',
    goal: 'الهدف',
  },
} as const;

export const ModuleNames = {
  fasting: 'الصيام',
  nutrition: 'التغذية',
  water: 'الماء',
  workout: 'التمرين',
  sleep: 'النوم',
  female: 'الدورة',
  mental: 'عقلي',
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
  general: 'هذا التطبيق لا يحل محل المشورة الطبية المهنية.',
  health: 'استشر طبيبك قبل بدء برنامج جديد.',
  nutrition: 'بيانات التغذية لأغراض إعلامية فقط.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'الصيام',
    fed: 'التغذية',
    breaking: 'كسر الصيام',
  },
  goal: 'هدف الصيام',
  window: 'نافذة الصيام',
  elapsed: 'المنقضية',
  remaining: 'المتبقي',
} as const;

export const FemaleHealthLabels = {
  title: 'تتبع الدورة',
  phase: 'المرحلة',
  follicular: 'الجريبي',
  ovulation: 'الإباضة',
  luteal: 'الحثل',
  menstrual: 'الحيض',
  estimatedNextPeriod: 'الدورة التالية المتوقعة',
} as const;

export const WorkoutLabels = {
  duration: 'المدة',
  sets: 'مجموعات',
  reps: 'التكرارات',
  weight: 'الوزن',
  intensity: 'الشدة',
  restDay: 'يوم الراحة',
  scheduled: 'مجدولة',
} as const;

export const TabBarCopy = {
  home: 'الصفحة الرئيسية',
  explore: 'استكشاف',
  progress: 'التقدم',
  settings: 'الإعدادات',
} as const;

export const BmiCategories = {
  underweight: 'نقص الوزن',
  normal: 'الوزن الطبيعي',
  overweight: 'زيادة الوزن',
  obese: 'السمنة',
} as const;

export const ComponentMessages = {
  loading: 'جاري التحميل...',
  noData: 'لا توجد بيانات متاحة',
  tryAgain: 'حاول مرة أخرى',
  confirm: 'تأكيد',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تحرير',
  save: 'حفظ',
  close: 'إغلاق',
} as const;

export const MentalLabels = {
  title: 'الصحة العقلية',
  mood: 'المزاج',
  stress: 'الإجهاد',
  energy: 'الطاقة',
  sleep: 'جودة النوم',
} as const;

export const ReadinessLabels = {
  title: 'مؤشر الجاهزية',
  score: 'النقاط',
  factors: 'العوامل',
} as const;

export const ReferralMessages = {
  title: 'دعوة الأصدقاء',
  description: 'احصل على مكافآت عند مشاركة Vyra.',
  copyLink: 'نسخ الرابط',
  share: 'مشاركة',
} as const;

export const NotificationMessages = {
  waterReminder: 'لا تنس شرب الماء',
  mealReminder: 'حان وقت الأكل',
  sleepReminder: 'تحضر للنوم',
  workoutReminder: 'وقت التمرين',
} as const;

export const PrivacyTexts = {
  title: 'الخصوصية والبيانات',
  description: 'بيانتك آمنة ومشفرة.',
  dataUsage: 'نستخدم بيانتك فقط لتحسين تجربتك.',
} as const;

export const ExplorePageStrings = {
  title: 'استكشاف',
  subtitle: 'اكتشف النصائح والمقالات.',
  featured: 'مميز',
  categories: 'الفئات',
  viewMore: 'عرض المزيد',
} as const;

export const HomePageStrings = {
  dailyOverview: 'النظرة العامة اليومية',
  upcomingActivities: 'الأنشطة القادمة',
  recentActivity: 'النشاط الأخير',
  noActivity: 'لا توجد أنشطة في الوقت الحالي',
} as const;

export const ProgressPageStrings = {
  title: 'التقدم',
  weeklyStats: 'إحصائيات أسبوعية',
  monthlyStats: 'إحصائيات شهرية',
  viewDetails: 'عرض التفاصيل',
} as const;

export const WaterHydrationMessages = {
  goal: 'هدف الترطيب',
  daily: 'يومي',
  weekly: 'أسبوعي',
  loggingWater: 'تسجيل الماء',
  waterLogged: 'تم تسجيل الماء',
} as const;

export const StepsProgressMessages = {
  goal: 'هدف الخطوات',
  daily: 'اليوم',
  weekly: 'هذا الأسبوع',
  stepsTaken: 'خطوات اتخذت',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'روتين الصباح',
  eveningRoutine: 'روتين المساء',
  hydration: 'الترطيب',
  nutrition: 'التغذية',
} as const;

export const ForgotPasswordStrings = {
  title: 'نسيان كلمة المرور',
  subtitle: 'سنساعدك في استرجاع حسابك.',
  email: 'البريد الإلكتروني',
  submit: 'إرسال',
  backToLogin: 'العودة إلى تسجيل الدخول',
  checkEmail: 'تحقق من بريدك الإلكتروني للحصول على التعليمات.',
} as const;

export const FastingMetabolicZones = {
  fed: 'حالة التغذية',
  postAbsorptive: 'ما بعد الامتصاص',
  ketosis: 'الكيتوسيس',
  deepKetosis: 'الكيتوسيس العميق',
} as const;

export const BiometricLabels = {
  height: 'الارتفاع',
  weight: 'الوزن',
  bmi: 'مؤشر كتلة الجسم',
  bodyFat: 'دهون الجسم',
  muscleMass: 'كتلة العضلات',
  bloodPressure: 'ضغط الدم',
  heartRate: 'معدل ضربات القلب',
} as const;

export const FemaleSymptoms = {
  cramps: 'التشنجات',
  bloating: 'الانتفاخ',
  mood: 'تقلبات المزاج',
  headache: 'الصداع',
  fatigue: 'التعب',
} as const;

export const NutritionModule = {
  macros: 'العناصر الكبرى',
  proteins: 'البروتينات',
  carbs: 'الكربوهيدرات',
  fats: 'الدهون',
  fiber: 'الألياف',
  calories: 'السعرات الحرارية',
  micronutrients: 'المغذيات الدقيقة',
} as const;

export const FemaleModule = {
  cycle: 'الدورة الشهرية',
  symptoms: 'الأعراض',
  tracking: 'التتبع',
  predictions: 'التنبؤات',
} as const;

export const FastingModule = {
  fastingPeriod: 'فترة الصيام',
  breakingFast: 'كسر الصيام',
  metabolicState: 'الحالة الأيضية',
  benefits: 'الفوائد',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'الإعدادات',
    title: 'الماء',
  },
  dailyGoal: {
    title: 'الهدف اليومي',
    description: 'اختر أساسًا واقعيًا وستضبط التطبيق حسب العوامل.',
    presets: {
      low: 'نشاط منخفض',
      moderate: 'معتدل',
      recommended: 'موصى به',
      athlete: 'رياضي',
      hotClimate: 'مناخ حار',
    },
    customLabel: 'هدف مخصص',
    customHint: 'بين 500 مل و 10000 مل.',
    unit: 'مل',
  },
  infoCard: {
    eyebrow: 'التعديل',
    body: 'إذا كان الطقس حارًا جدًا أو تصوم أو يومك مليء بالنشاط، فقد تزيد Vyra من هدفك.',
  },
  containers: {
    title: 'اختصارات سريعة',
    description: 'ضبط مرة واحدة الكمية في الحاويات الفعلية الخاصة بك.',
    resetLabel: 'إعادة تعيين',
    resetA11y: 'استرجاع الأحجام الافتراضية',
    glass: 'زجاج',
    largeGlass: 'زجاج كبير',
    bottle: 'زجاجة',
  },
  warningCard: {
    eyebrow: 'تحذير',
    body: 'التذكيرات موجودة في الإخطارات العادية. من هنا تقوم بتعديل الجزء التشغيلي فقط.',
  },
  buttons: {
    openNotifications: 'فتح الإخطارات',
    changeUnits: 'تغيير الوحدات',
  },
} as const;
