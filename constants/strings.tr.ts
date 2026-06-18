export { ShellStrings } from './strings.shell.tr';

export const ErrorMessages = {
  noInternet: 'Burada sinyal yok. Kaydı devam edin ve bağlantı geri geldiğinde senkronize edeceğim.',
  aiUnavailable: 'AI katmanı şu anda kullanılamıyor. Birkaç dakika sonra tekrar deneyin.',
  saveFailed: 'Şimdi kaydedilemiyor. Verileriniz güvende ve tekrar deneyeceğim.',
  barcodeNotFound: 'Bu kodu bulamadım. Yiyeceği arayabilir veya el ile girebilirsiniz.',
  paymentError: 'Bu işlemi tamamlayamadım. Hiçbir değişiklik uygulanmadı.',
  photoAIFailed: 'O yemeği iyi okuyamadım. Başka bir fotoğraf deneyin veya el ile girin.',
  voiceLogFailed: 'Bu ses kaydını anlayamadım. Tekrar deneyin veya el ile girin.',
  loginFailed: 'Oturum açamadım. Verilerinizi kontrol edin ve tekrar deneyin.',
  registerFailed: 'Hesabınızı oluşturamadım. Tekrar deneyin.',
  sessionExpired: 'Oturumunuzun süresi doldu. Devam etmek için yeniden oturum açın.',
  premiumRequired: 'Bu özellik şu anki erişiminizde kullanılamaz.',
  generic: 'Bir şeyler yanlış oldu. Biraz sonra tekrar deneyin.',
  loadFailed: 'Veriler yüklenemedi. Tekrar denemek için sürükleyin.',
  syncFailed: 'Senkronize edilemiyor. Verileriniz yerel olarak kaydedilmiş olarak kalır.',
  permissionDenied: 'Devam etmek için izniniz gerekiyor. Bunu Ayarlarda değiştirebilirsiniz.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Fitnesiiniz, bugünden itibaren açık.',
    subtitle: 'Egzersiz, yemekler, su, uyku ve ilerleme tek bir uygulamada.',
    cta: 'Ücretsiz hesap oluştur',
    login: 'Hesabıma giriş yap',
    legal: 'Devam ederek şartlarımızı kabul etmiş olursunuz.',
  },
  login: {
    title: 'Hoş geldiniz',
    subtitle: 'Devam etmek için oturum açın.',
    email: 'E-posta',
    password: 'Şifre',
    submit: 'Oturum aç',
    forgotPassword: 'Şifrenizi mi unuttunuz?',
    noAccount: 'Hesabınız yok mu? Şimdi oluşturun',
  },
  register: {
    title: 'Hesap oluştur',
    subtitle: 'Fitness yolculuğunuza başlayın.',
    email: 'E-posta',
    password: 'Şifre',
    confirmPassword: 'Şifreyi onayla',
    submit: 'Hesap oluştur',
    agreeToTerms: 'Şartları kabul ediyorum.',
    alreadyHaveAccount: 'Zaten hesabınız var mı? Oturum açın',
  },
  resetPassword: {
    title: 'Şifre sıfırla',
    subtitle: 'Talimatları almak için e-posta adresinizi girin.',
    email: 'E-posta',
    submit: 'Talimatları gönder',
    backToLogin: 'Oturum açmaya geri dön',
  },
} as const;

export const OnboardingStrings = {
  title: 'Vyra Fitness\'e hoş geldiniz',
  subtitle: 'Kişisel sağlık ortağınız',
  slides: [
    {
      title: 'Kapsamlı izleme',
      description: 'Egzersiz, beslenme, uyku ve sağlık tek bir yerde.',
    },
    {
      title: 'Akıllı yapay zeka',
      description: 'Verilerinize göre kişiselleştirilmiş tavsiyeler alın.',
    },
    {
      title: 'Hedeflerinize ulaşın',
      description: 'İlerlemenizi takip edin ve her zaferini kutlayın.',
    },
  ],
  getStarted: 'Başla',
  skip: 'Atla',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Merhaba',
    subtitle: 'Sağlıklı gün buradan başlıyor.',
  },
  readiness: {
    title: 'Hazırlık',
    description: 'Bugün hazır mısınız?',
    high: 'Çok iyi',
    moderate: 'İyi',
    low: 'Din',
  },
  waterIntake: {
    title: 'Hidrasyon',
    goal: 'Günlük hedef',
    remaining: 'Kalan',
  },
  sleep: {
    title: 'Uyku',
    lastNight: 'Geçen gece',
    quality: 'Kalite',
  },
  nutrition: {
    title: 'Beslenme',
    todayCalories: 'Bugünün kalori',
    goal: 'Hedef',
  },
} as const;

export const ModuleNames = {
  fasting: 'Oruç',
  nutrition: 'Beslenme',
  water: 'Su',
  workout: 'Antrenman',
  sleep: 'Uyku',
  female: 'Döngü',
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
  general: 'Bu uygulama profesyonel tıbbi tavsiyenin yerine geçmez.',
  health: 'Yeni bir programa başlamadan önce doktorunuza danışın.',
  nutrition: 'Beslenme verileri yalnızca bilgilendirme amaçlıdır.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Oruç',
    fed: 'Besli',
    breaking: 'Orucu kırma',
  },
  goal: 'Oruç hedefi',
  window: 'Oruç penceresi',
  elapsed: 'Geçen',
  remaining: 'Kalan',
} as const;

export const FemaleHealthLabels = {
  title: 'Döngü izleme',
  phase: 'Faz',
  follicular: 'Foliküler',
  ovulation: 'Ovulasyon',
  luteal: 'Luteal',
  menstrual: 'Menstrüel',
  estimatedNextPeriod: 'Tahmini sonraki dönem',
} as const;

export const WorkoutLabels = {
  duration: 'Süre',
  sets: 'Setler',
  reps: 'Tekrarlar',
  weight: 'Ağırlık',
  intensity: 'Yoğunluk',
  restDay: 'Dinlenme günü',
  scheduled: 'Planlandı',
} as const;

export const TabBarCopy = {
  home: 'Anasayfa',
  explore: 'Keşfet',
  progress: 'İlerleme',
  settings: 'Ayarlar',
} as const;

export const BmiCategories = {
  underweight: 'Zayıf',
  normal: 'Normal ağırlık',
  overweight: 'Fazla kilolu',
  obese: 'Obez',
} as const;

export const ComponentMessages = {
  loading: 'Yükleniyor...',
  noData: 'Veri yok',
  tryAgain: 'Tekrar dene',
  confirm: 'Onayla',
  cancel: 'İptal',
  delete: 'Sil',
  edit: 'Düzenle',
  save: 'Kaydet',
  close: 'Kapat',
} as const;

export const MentalLabels = {
  title: 'Mental sağlık',
  mood: 'Ruh hali',
  stress: 'Stres',
  energy: 'Enerji',
  sleep: 'Uyku kalitesi',
} as const;

export const ReadinessLabels = {
  title: 'Hazırlık endeksi',
  score: 'Puan',
  factors: 'Faktörler',
} as const;

export const ReferralMessages = {
  title: 'Arkadaş davet et',
  description: 'Vyra\'yı paylaşarak ödüller kazanın.',
  copyLink: 'Bağlantıyı kopyala',
  share: 'Paylaş',
} as const;

export const NotificationMessages = {
  waterReminder: 'Su içmeyi unutmayın',
  mealReminder: 'Yemek zamanı',
  sleepReminder: 'Uyumaya hazırlanın',
  workoutReminder: 'Antrenman zamanı',
} as const;

export const PrivacyTexts = {
  title: 'Gizlilik ve veriler',
  description: 'Verileriniz güvenli ve şifrelenmiş.',
  dataUsage: 'Verilerinizi yalnızca deneyiminizi iyileştirmek için kullanırız.',
} as const;

export const ExplorePageStrings = {
  title: 'Keşfet',
  subtitle: 'İpuçlarını ve makaleleri keşfedin.',
  featured: 'Öne çıkanlar',
  categories: 'Kategoriler',
  viewMore: 'Daha fazlasını gör',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Günlük genel bakış',
  upcomingActivities: 'Yaklaşan etkinlikler',
  recentActivity: 'Son etkinlik',
  noActivity: 'Şu anda etkinlik yok',
} as const;

export const ProgressPageStrings = {
  title: 'İlerleme',
  weeklyStats: 'Haftalık istatistikler',
  monthlyStats: 'Aylık istatistikler',
  viewDetails: 'Detayları gör',
} as const;

export const WaterHydrationMessages = {
  goal: 'Hidrasyon hedefi',
  daily: 'Günlük',
  weekly: 'Haftalık',
  loggingWater: 'Suyu günlüğe kaydetme',
  waterLogged: 'Su kaydedildi',
} as const;

export const StepsProgressMessages = {
  goal: 'Adım hedefi',
  daily: 'Bugün',
  weekly: 'Bu hafta',
  stepsTaken: 'Alınan adımlar',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Sabah rutini',
  eveningRoutine: 'Akşam rutini',
  hydration: 'Hidrasyon',
  nutrition: 'Beslenme',
} as const;

export const ForgotPasswordStrings = {
  title: 'Şifreyi unuttum',
  subtitle: 'Hesabınızı kurtarmanıza yardımcı olacağız.',
  email: 'E-posta',
  submit: 'Gönder',
  backToLogin: 'Oturum açmaya geri dön',
  checkEmail: 'Talimatlar için e-postanızı kontrol edin.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Beslenme durumu',
  postAbsorptive: 'Sindirim sonrası',
  ketosis: 'Ketoz',
  deepKetosis: 'Derin ketoz',
} as const;

export const BiometricLabels = {
  height: 'Yükseklik',
  weight: 'Ağırlık',
  bmi: 'BMI',
  bodyFat: 'Vücut yağı',
  muscleMass: 'Kas kütlesi',
  bloodPressure: 'Kan basıncı',
  heartRate: 'Kalp hızı',
} as const;

export const FemaleSymptoms = {
  cramps: 'Kramp',
  bloating: 'Şişkinlik',
  mood: 'Ruh hali değişiklikleri',
  headache: 'Baş ağrısı',
  fatigue: 'Yorgunluk',
} as const;

export const NutritionModule = {
  macros: 'Makro besinler',
  proteins: 'Proteinler',
  carbs: 'Karbonhidratlar',
  fats: 'Yağlar',
  fiber: 'Lif',
  calories: 'Kalori',
  micronutrients: 'Mikro besinler',
} as const;

export const FemaleModule = {
  cycle: 'Menstrüel döngü',
  symptoms: 'Semptomlar',
  tracking: 'İzleme',
  predictions: 'Tahminler',
} as const;

export const FastingModule = {
  fastingPeriod: 'Oruç dönemi',
  breakingFast: 'Orucu kırma',
  metabolicState: 'Metabolik durum',
  benefits: 'Faydalar',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Ayarlar',
    title: 'Su',
  },
  dailyGoal: {
    title: 'Günlük hedef',
    description: 'Gerçekçi bir temel seçin ve uygulama faktörlere göre ayarlanacak.',
    presets: {
      low: 'Düşük aktivite',
      moderate: 'Orta',
      recommended: 'Tavsiye edilen',
      athlete: 'Sporcu',
      hotClimate: 'Sıcak iklim',
    },
    customLabel: 'Özel hedef',
    customHint: '500 ml ile 10000 ml arasında.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Ayar',
    body: 'Çok sıcak ise, oruç tutuyorsanız veya gün doluysa, Vyra hedefinizi yükseltebilir.',
  },
  containers: {
    title: 'Hızlı erişim',
    description: 'Gerçek konteynırlarınızda bir kez miktarı ayarlayın.',
    resetLabel: 'Sıfırla',
    resetA11y: 'Varsayılan boyutları geri yükle',
    glass: 'Cam',
    largeGlass: 'Büyük cam',
    bottle: 'Şişe',
  },
  warningCard: {
    eyebrow: 'Uyarı',
    body: 'Anımsatıcılar normal bildirimlerdedir. Buradan yalnızca operasyonel kısmı ayarlarsınız.',
  },
  buttons: {
    openNotifications: 'Bildirimleri aç',
    changeUnits: 'Birimleri değiştir',
  },
} as const;
