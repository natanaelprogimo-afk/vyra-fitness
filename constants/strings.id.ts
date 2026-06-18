export { ShellStrings } from './strings.shell.id';

export const ErrorMessages = {
  noInternet: 'Tidak ada sinyal di sini. Lanjutkan pencatatan dan saya akan menyinkronkan saat koneksi kembali.',
  aiUnavailable: 'Lapisan AI tidak tersedia saat ini. Coba lagi dalam beberapa menit.',
  saveFailed: 'Saya tidak bisa menyimpan sekarang. Data Anda aman dan saya akan mencoba lagi.',
  barcodeNotFound: 'Saya tidak menemukan kode itu. Anda bisa mencari makanan atau memasukkannya secara manual.',
  paymentError: 'Saya tidak bisa menyelesaikan tindakan ini. Tidak ada perubahan yang diterapkan.',
  photoAIFailed: 'Saya tidak bisa membaca makanan itu dengan baik. Coba foto lain atau masukkan secara manual.',
  voiceLogFailed: 'Saya tidak bisa memahami pencatatan suara itu. Coba lagi atau masukkan secara manual.',
  loginFailed: 'Saya tidak bisa masuk. Periksa data Anda dan coba lagi.',
  registerFailed: 'Saya tidak bisa membuat akun Anda. Coba lagi.',
  sessionExpired: 'Sesi Anda telah berakhir. Masuk lagi untuk melanjutkan.',
  premiumRequired: 'Fitur ini tidak tersedia dalam akses Anda saat ini.',
  generic: 'Ada yang salah. Coba lagi dalam sebentar.',
  loadFailed: 'Saya tidak bisa memuat data. Geser untuk coba lagi.',
  syncFailed: 'Saya tidak bisa menyinkronkan. Data Anda tetap disimpan secara lokal.',
  permissionDenied: 'Saya membutuhkan izin Anda untuk melanjutkan. Anda bisa mengubahnya di Pengaturan.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Kebugaran Anda, jelas dari hari ini.',
    subtitle: 'Latihan, makanan, air, tidur dan kemajuan dalam satu aplikasi.',
    cta: 'Buat akun gratis',
    login: 'Masuk ke akun saya',
    legal: 'Dengan melanjutkan, Anda menerima persyaratan kami.',
  },
  login: {
    title: 'Selamat datang kembali',
    subtitle: 'Masuk untuk melanjutkan.',
    email: 'Email',
    password: 'Kata sandi',
    submit: 'Masuk',
    forgotPassword: 'Lupa kata sandi?',
    noAccount: 'Tidak punya akun? Buat sekarang',
  },
  register: {
    title: 'Buat akun',
    subtitle: 'Mulai perjalanan kebugaran Anda.',
    email: 'Email',
    password: 'Kata sandi',
    confirmPassword: 'Konfirmasi kata sandi',
    submit: 'Buat akun',
    agreeToTerms: 'Saya setuju dengan persyaratan.',
    alreadyHaveAccount: 'Sudah punya akun? Masuk',
  },
  resetPassword: {
    title: 'Atur ulang kata sandi',
    subtitle: 'Masukkan alamat email Anda untuk menerima instruksi.',
    email: 'Email',
    submit: 'Kirim instruksi',
    backToLogin: 'Kembali ke masuk',
  },
} as const;

export const OnboardingStrings = {
  title: 'Selamat datang di Vyra Fitness',
  subtitle: 'Mitra kesehatan pribadi Anda',
  slides: [
    {
      title: 'Pelacakan komprehensif',
      description: 'Latihan, nutrisi, tidur dan kesejahteraan di satu tempat.',
    },
    {
      title: 'AI cerdas',
      description: 'Dapatkan saran yang dipersonalisasi berdasarkan data Anda.',
    },
    {
      title: 'Capai tujuan Anda',
      description: 'Lacak kemajuan Anda dan rayakan setiap kemenangan.',
    },
  ],
  getStarted: 'Mulai',
  skip: 'Lewati',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Halo',
    subtitle: 'Hari kesehatan Anda dimulai di sini.',
  },
  readiness: {
    title: 'Kesiapan',
    description: 'Apakah Anda siap untuk hari ini?',
    high: 'Sangat baik',
    moderate: 'Baik',
    low: 'Istirahat',
  },
  waterIntake: {
    title: 'Hidrasi',
    goal: 'Tujuan harian',
    remaining: 'Tersisa',
  },
  sleep: {
    title: 'Tidur',
    lastNight: 'Malam terakhir',
    quality: 'Kualitas',
  },
  nutrition: {
    title: 'Nutrisi',
    todayCalories: 'Kalori hari ini',
    goal: 'Tujuan',
  },
} as const;

export const ModuleNames = {
  fasting: 'Puasa',
  nutrition: 'Nutrisi',
  water: 'Air',
  workout: 'Latihan',
  sleep: 'Tidur',
  female: 'Siklus',
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
  general: 'Aplikasi ini bukan pengganti saran medis profesional.',
  health: 'Konsultasikan dengan dokter Anda sebelum memulai program baru.',
  nutrition: 'Data nutrisi hanya untuk tujuan informasi.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Puasa',
    fed: 'Diberi makan',
    breaking: 'Memecah puasa',
  },
  goal: 'Tujuan puasa',
  window: 'Jendela puasa',
  elapsed: 'Berlalu',
  remaining: 'Tersisa',
} as const;

export const FemaleHealthLabels = {
  title: 'Pelacakan siklus',
  phase: 'Fase',
  follicular: 'Folikel',
  ovulation: 'Ovulasi',
  luteal: 'Luteal',
  menstrual: 'Menstruasi',
  estimatedNextPeriod: 'Periode berikutnya yang diperkirakan',
} as const;

export const WorkoutLabels = {
  duration: 'Durasi',
  sets: 'Set',
  reps: 'Pengulangan',
  weight: 'Berat',
  intensity: 'Intensitas',
  restDay: 'Hari istirahat',
  scheduled: 'Dijadwalkan',
} as const;

export const TabBarCopy = {
  home: 'Beranda',
  explore: 'Jelajahi',
  progress: 'Kemajuan',
  settings: 'Pengaturan',
} as const;

export const BmiCategories = {
  underweight: 'Berat badan kurang',
  normal: 'Berat badan normal',
  overweight: 'Kelebihan berat badan',
  obese: 'Obesitas',
} as const;

export const ComponentMessages = {
  loading: 'Memuat...',
  noData: 'Tidak ada data tersedia',
  tryAgain: 'Coba lagi',
  confirm: 'Konfirmasi',
  cancel: 'Batal',
  delete: 'Hapus',
  edit: 'Edit',
  save: 'Simpan',
  close: 'Tutup',
} as const;

export const MentalLabels = {
  title: 'Kesejahteraan mental',
  mood: 'Suasana hati',
  stress: 'Stres',
  energy: 'Energi',
  sleep: 'Kualitas tidur',
} as const;

export const ReadinessLabels = {
  title: 'Indeks kesiapan',
  score: 'Skor',
  factors: 'Faktor',
} as const;

export const ReferralMessages = {
  title: 'Ajak teman',
  description: 'Dapatkan hadiah dengan berbagi Vyra.',
  copyLink: 'Salin tautan',
  share: 'Bagikan',
} as const;

export const NotificationMessages = {
  waterReminder: 'Jangan lupa minum air',
  mealReminder: 'Saatnya makan',
  sleepReminder: 'Bersiaplah untuk tidur',
  workoutReminder: 'Waktu latihan',
} as const;

export const PrivacyTexts = {
  title: 'Privasi dan data',
  description: 'Data Anda aman dan terenkripsi.',
  dataUsage: 'Kami menggunakan data Anda hanya untuk meningkatkan pengalaman Anda.',
} as const;

export const ExplorePageStrings = {
  title: 'Jelajahi',
  subtitle: 'Temukan tips dan artikel.',
  featured: 'Unggulan',
  categories: 'Kategori',
  viewMore: 'Lihat selengkapnya',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Ikhtisar harian',
  upcomingActivities: 'Aktivitas mendatang',
  recentActivity: 'Aktivitas terbaru',
  noActivity: 'Tidak ada aktivitas saat ini',
} as const;

export const ProgressPageStrings = {
  title: 'Kemajuan',
  weeklyStats: 'Statistik mingguan',
  monthlyStats: 'Statistik bulanan',
  viewDetails: 'Lihat detail',
} as const;

export const WaterHydrationMessages = {
  goal: 'Tujuan hidrasi',
  daily: 'Harian',
  weekly: 'Mingguan',
  loggingWater: 'Mencatat air',
  waterLogged: 'Air tercatat',
} as const;

export const StepsProgressMessages = {
  goal: 'Tujuan langkah',
  daily: 'Hari ini',
  weekly: 'Minggu ini',
  stepsTaken: 'Langkah diambil',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Rutinitas pagi',
  eveningRoutine: 'Rutinitas malam',
  hydration: 'Hidrasi',
  nutrition: 'Nutrisi',
} as const;

export const ForgotPasswordStrings = {
  title: 'Lupa kata sandi',
  subtitle: 'Kami akan membantu Anda memulihkan akun Anda.',
  email: 'Email',
  submit: 'Kirim',
  backToLogin: 'Kembali ke masuk',
  checkEmail: 'Periksa email Anda untuk petunjuk.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Keadaan bermakanan',
  postAbsorptive: 'Pasca penyerapan',
  ketosis: 'Ketosis',
  deepKetosis: 'Ketosis dalam',
} as const;

export const BiometricLabels = {
  height: 'Tinggi',
  weight: 'Berat',
  bmi: 'BMI',
  bodyFat: 'Lemak tubuh',
  muscleMass: 'Massa otot',
  bloodPressure: 'Tekanan darah',
  heartRate: 'Detak jantung',
} as const;

export const FemaleSymptoms = {
  cramps: 'Kram',
  bloating: 'Kembung',
  mood: 'Perubahan suasana hati',
  headache: 'Sakit kepala',
  fatigue: 'Kelelahan',
} as const;

export const NutritionModule = {
  macros: 'Makronutrien',
  proteins: 'Protein',
  carbs: 'Karbohidrat',
  fats: 'Lemak',
  fiber: 'Serat',
  calories: 'Kalori',
  micronutrients: 'Mikronutrien',
} as const;

export const FemaleModule = {
  cycle: 'Siklus menstruasi',
  symptoms: 'Gejala',
  tracking: 'Pelacakan',
  predictions: 'Prediksi',
} as const;

export const FastingModule = {
  fastingPeriod: 'Periode puasa',
  breakingFast: 'Memecah puasa',
  metabolicState: 'Keadaan metabolik',
  benefits: 'Manfaat',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Pengaturan',
    title: 'Air',
  },
  dailyGoal: {
    title: 'Tujuan harian',
    description: 'Pilih basis yang realistis dan aplikasi akan menyesuaikan sesuai faktor.',
    presets: {
      low: 'Aktivitas rendah',
      moderate: 'Sedang',
      recommended: 'Disarankan',
      athlete: 'Atlet',
      hotClimate: 'Iklim panas',
    },
    customLabel: 'Tujuan kustom',
    customHint: 'Antara 500 ml dan 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Penyesuaian',
    body: 'Jika sangat panas, Anda berpuasa, atau hari Anda penuh, Vyra mungkin meningkatkan tujuan Anda.',
  },
  containers: {
    title: 'Akses cepat',
    description: 'Sesuaikan sekali jumlah di wadah aktual Anda.',
    resetLabel: 'Atur ulang',
    resetA11y: 'Pulihkan ukuran default',
    glass: 'Gelas',
    largeGlass: 'Gelas besar',
    bottle: 'Botol',
  },
  warningCard: {
    eyebrow: 'Peringatan',
    body: 'Pengingat berada dalam notifikasi biasa. Dari sini Anda hanya menyesuaikan bagian operasional.',
  },
  buttons: {
    openNotifications: 'Buka notifikasi',
    changeUnits: 'Ubah satuan',
  },
} as const;
