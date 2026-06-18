export { ShellStrings } from './strings.shell.th';

export const ErrorMessages = {
  noInternet: 'ไม่มีสัญญาณที่นี่ ดำเนินการบันทึกต่อไปและฉันจะซิงค์เมื่อการเชื่อมต่อกลับมา',
  aiUnavailable: 'เลเยอร์ AI ไม่พร้อมใช้งานในขณะนี้ โปรดลองใหม่ในสักครู่',
  saveFailed: 'ฉันไม่สามารถบันทึกได้ตอนนี้ ข้อมูลของคุณปลอดภัย และฉันจะลองใหม่',
  barcodeNotFound: 'ฉันไม่พบรหัสนั้น คุณสามารถค้นหาอาหารหรือป้อนด้วยตนเองได้',
  paymentError: 'ฉันไม่สามารถดำเนินการนี้ให้เสร็จได้ ไม่มีการเปลี่ยนแปลง',
  photoAIFailed: 'ฉันไม่สามารถอ่านมื้ออาหารนั้นได้ดี ลองภาพอื่นหรือป้อนด้วยตนเอง',
  voiceLogFailed: 'ฉันไม่สามารถเข้าใจบันทึกเสียงนั้นได้ ลองใหม่หรือป้อนด้วยตนเอง',
  loginFailed: 'ฉันไม่สามารถเข้าสู่ระบบได้ ตรวจสอบข้อมูลของคุณและลองใหม่',
  registerFailed: 'ฉันไม่สามารถสร้างบัญชีของคุณได้ โปรดลองใหม่',
  sessionExpired: 'เซสชันของคุณหมดอายุแล้ว โปรดเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ',
  premiumRequired: 'ฟีเจอร์นี้ไม่พร้อมใช้งานในการเข้าถึงปัจจุบันของคุณ',
  generic: 'เกิดข้อผิดพลาดบางอย่าง โปรดลองใหม่ในสักครู่',
  loadFailed: 'ฉันไม่สามารถโหลดข้อมูลได้ ปัดเพื่อลองใหม่',
  syncFailed: 'ฉันไม่สามารถซิงค์ได้ ข้อมูลของคุณยังคงบันทึกไว้ในพื้นที่',
  permissionDenied: 'ฉันต้องได้รับอนุญาตจากคุณเพื่อดำเนินการต่อ คุณสามารถเปลี่ยนสิ่งนี้ได้ในการตั้งค่า',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'ฟิตเนสของคุณชัดเจนตั้งแต่วันนี้',
    subtitle: 'การออกกำลังกาย อาหาร น้ำ นอน และความก้าวหน้าในแอปเดียว',
    cta: 'สร้างบัญชีฟรี',
    login: 'เข้าสู่บัญชีของฉัน',
    legal: 'ด้วยการดำเนินการต่อ คุณยอมรับเงื่อนไขของเรา',
  },
  login: {
    title: 'ยินดีต้อนรับกลับ',
    subtitle: 'เข้าสู่ระบบเพื่อดำเนินการต่อ',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    submit: 'เข้าสู่ระบบ',
    forgotPassword: 'ลืมรหัสผ่านหรือ',
    noAccount: 'ไม่มีบัญชี? สร้างตอนนี้',
  },
  register: {
    title: 'สร้างบัญชี',
    subtitle: 'เริ่มการเดินทางของคุณในฟิตเนส',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    submit: 'สร้างบัญชี',
    agreeToTerms: 'ฉันยอมรับข้อตกลง',
    alreadyHaveAccount: 'มีบัญชีแล้ว? เข้าสู่ระบบ',
  },
  resetPassword: {
    title: 'ตั้งค่ารหัสผ่านใหม่',
    subtitle: 'ใส่ที่อยู่อีเมลของคุณเพื่อรับคำแนะนำ',
    email: 'อีเมล',
    submit: 'ส่งคำแนะนำ',
    backToLogin: 'กลับไปที่การเข้าสู่ระบบ',
  },
} as const;

export const OnboardingStrings = {
  title: 'ยินดีต้อนรับสู่ Vyra Fitness',
  subtitle: 'พันธมิตรสุขภาพส่วนตัวของคุณ',
  slides: [
    {
      title: 'การติดตามอย่างครอบคลุม',
      description: 'ออกกำลังกาย โภคนาการ นอน และสุขภาพอนามัยในที่เดียว',
    },
    {
      title: 'ปัญญาประดิษฐ์ที่ชาญฉลาด',
      description: 'รับคำแนะนำแบบบุคคลดัดแปลงตามข้อมูลของคุณ',
    },
    {
      title: 'บรรลุเป้าหมายของคุณ',
      description: 'ติดตามความก้าวหน้าและเฉลิมฉลองทุกชัยชนะ',
    },
  ],
  getStarted: 'เริ่มต้น',
  skip: 'ข้าม',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'สวัสดี',
    subtitle: 'วันสุขภาพของคุณเริ่มต้นที่นี่',
  },
  readiness: {
    title: 'ความพร้อม',
    description: 'คุณพร้อมสำหรับวันนี้หรือไม่',
    high: 'ดีมาก',
    moderate: 'ดี',
    low: 'พัก',
  },
  waterIntake: {
    title: 'การให้น้ำ',
    goal: 'เป้าหมายรายวัน',
    remaining: 'เหลือ',
  },
  sleep: {
    title: 'นอน',
    lastNight: 'คืนนี้ที่แล้ว',
    quality: 'คุณภาพ',
  },
  nutrition: {
    title: 'โภคนาการ',
    todayCalories: 'แคลอรี่วันนี้',
    goal: 'เป้าหมาย',
  },
} as const;

export const ModuleNames = {
  fasting: 'การถือศีลเทศ',
  nutrition: 'โภคนาการ',
  water: 'น้ำ',
  workout: 'การออกกำลังกาย',
  sleep: 'นอน',
  female: 'วัฏจักร',
  mental: 'จิตใจ',
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
  general: 'แอปนี้ไม่ใช่การแทนที่คำแนะนำทางการแพทย์ที่มืออาชีพ',
  health: 'ปรึกษาแพทย์ของคุณก่อนเริ่มโปรแกรมใหม่',
  nutrition: 'ข้อมูลโภคนาการเพื่อวัตถุประสงค์ข้อมูลเท่านั้น',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'การถือศีลเทศ',
    fed: 'ให้อาหาร',
    breaking: 'หยุดการถือศีลเทศ',
  },
  goal: 'เป้าหมายการถือศีลเทศ',
  window: 'หน้าต่างการถือศีลเทศ',
  elapsed: 'ผ่านไป',
  remaining: 'เหลือ',
} as const;

export const FemaleHealthLabels = {
  title: 'การติดตามวัฏจักร',
  phase: 'ระยะ',
  follicular: 'Follicular',
  ovulation: 'การปล่อยไข่',
  luteal: 'ลูเทียล',
  menstrual: 'ประจำเดือน',
  estimatedNextPeriod: 'ประมาณการระยะเวลาถัดไป',
} as const;

export const WorkoutLabels = {
  duration: 'ระยะเวลา',
  sets: 'ชุด',
  reps: 'ซ้ำ',
  weight: 'น้ำหนัก',
  intensity: 'ความเข้มข้น',
  restDay: 'วันพัก',
  scheduled: 'กำหนดการ',
} as const;

export const TabBarCopy = {
  home: 'หน้าแรก',
  explore: 'สำรวจ',
  progress: 'ความก้าวหน้า',
  settings: 'การตั้งค่า',
} as const;

export const BmiCategories = {
  underweight: 'ขาดน้ำหนัก',
  normal: 'น้ำหนักปกติ',
  overweight: 'น้ำหนักเกิน',
  obese: 'อ้วน',
} as const;

export const ComponentMessages = {
  loading: 'กำลังโหลด...',
  noData: 'ไม่มีข้อมูล',
  tryAgain: 'ลองอีกครั้ง',
  confirm: 'ยืนยัน',
  cancel: 'ยกเลิก',
  delete: 'ลบ',
  edit: 'แก้ไข',
  save: 'บันทึก',
  close: 'ปิด',
} as const;

export const MentalLabels = {
  title: 'สุขภาพจิตใจ',
  mood: 'อารมณ์',
  stress: 'ความเครียด',
  energy: 'พลังงาน',
  sleep: 'คุณภาพนอน',
} as const;

export const ReadinessLabels = {
  title: 'ดัชนีความพร้อม',
  score: 'คะแนน',
  factors: 'ปัจจัย',
} as const;

export const ReferralMessages = {
  title: 'เชิญเพื่อน',
  description: 'ได้รับรางวัลโดยแบ่งปัน Vyra',
  copyLink: 'คัดลอกลิงก์',
  share: 'แบ่งปัน',
} as const;

export const NotificationMessages = {
  waterReminder: 'อย่าลืมดื่มน้ำ',
  mealReminder: 'ถึงเวลากินข้าว',
  sleepReminder: 'เตรียมตัวสำหรับการนอน',
  workoutReminder: 'เวลาออกกำลังกาย',
} as const;

export const PrivacyTexts = {
  title: 'ความเป็นส่วนตัวและข้อมูล',
  description: 'ข้อมูลของคุณปลอดภัยและเข้ารหัส',
  dataUsage: 'เราใช้ข้อมูลของคุณเพื่อปรับปรุงประสบการณ์ของคุณ',
} as const;

export const ExplorePageStrings = {
  title: 'สำรวจ',
  subtitle: 'ค้นพบเคล็ดลับและบทความ',
  featured: 'นำเสนอ',
  categories: 'หมวดหมู่',
  viewMore: 'ดูเพิ่มเติม',
} as const;

export const HomePageStrings = {
  dailyOverview: 'ภาพรวมรายวัน',
  upcomingActivities: 'กิจกรรมที่กำลังจะมาถึง',
  recentActivity: 'กิจกรรมล่าสุด',
  noActivity: 'ไม่มีกิจกรรมในขณะนี้',
} as const;

export const ProgressPageStrings = {
  title: 'ความก้าวหน้า',
  weeklyStats: 'สถิติรายสัปดาห์',
  monthlyStats: 'สถิติรายเดือน',
  viewDetails: 'ดูรายละเอียด',
} as const;

export const WaterHydrationMessages = {
  goal: 'เป้าหมายการให้น้ำ',
  daily: 'รายวัน',
  weekly: 'รายสัปดาห์',
  loggingWater: 'บันทึกน้ำ',
  waterLogged: 'บันทึกน้ำแล้ว',
} as const;

export const StepsProgressMessages = {
  goal: 'เป้าหมายขั้นตอน',
  daily: 'วันนี้',
  weekly: 'สัปดาห์นี้',
  stepsTaken: 'ขั้นตอนที่ทำ',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'รูทีนเช้า',
  eveningRoutine: 'รูทีนเย็น',
  hydration: 'การให้น้ำ',
  nutrition: 'โภคนาการ',
} as const;

export const ForgotPasswordStrings = {
  title: 'ลืมรหัสผ่าน',
  subtitle: 'เราจะช่วยคุณกู้คืนบัญชี',
  email: 'อีเมล',
  submit: 'ส่ง',
  backToLogin: 'กลับไปที่การเข้าสู่ระบบ',
  checkEmail: 'ตรวจสอบอีเมลของคุณเพื่อดูคำแนะนำ',
} as const;

export const FastingMetabolicZones = {
  fed: 'สถานะการให้อาหาร',
  postAbsorptive: 'หลังดูดซึม',
  ketosis: 'ภาวะ ketosis',
  deepKetosis: 'Ketosis ลึก',
} as const;

export const BiometricLabels = {
  height: 'ความสูง',
  weight: 'น้ำหนัก',
  bmi: 'ดัชนีมวลกาย',
  bodyFat: '脂肪',
  muscleMass: 'มวลกล้ามเนื้อ',
  bloodPressure: 'ความดันโลหิต',
  heartRate: 'อัตราการเต้นของหัวใจ',
} as const;

export const FemaleSymptoms = {
  cramps: 'ชัก',
  bloating: 'การป่องพอง',
  mood: 'การเปลี่ยนแปลงอารมณ์',
  headache: 'ปวดศีรษะ',
  fatigue: 'ความเหนื่อยล้า',
} as const;

export const NutritionModule = {
  macros: 'โภคนาการ',
  proteins: 'โปรตีน',
  carbs: 'คาร์โบไฮเดรต',
  fats: 'ไขมัน',
  fiber: 'เส้นใย',
  calories: 'แคลอรี่',
  micronutrients: 'สารอาหารจำเป็น',
} as const;

export const FemaleModule = {
  cycle: 'วัฏจักรประจำเดือน',
  symptoms: 'อาการ',
  tracking: 'การติดตาม',
  predictions: 'การคาดการณ์',
} as const;

export const FastingModule = {
  fastingPeriod: 'ระยะเวลาการถือศีลเทศ',
  breakingFast: 'หยุดการถือศีลเทศ',
  metabolicState: 'สถานะการเผาผลาญ',
  benefits: 'ประโยชน์',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'การตั้งค่า',
    title: 'น้ำ',
  },
  dailyGoal: {
    title: 'เป้าหมายรายวัน',
    description: 'เลือกพื้นฐานที่สมจริงและแอปจะปรับให้เหมาะกับปัจจัยต่างๆ',
    presets: {
      low: 'กิจกรรมต่ำ',
      moderate: 'ปานกลาง',
      recommended: 'แนะนำ',
      athlete: 'นักกีฬา',
      hotClimate: 'สภาพอากาศร้อน',
    },
    customLabel: 'เป้าหมายที่กำหนดเอง',
    customHint: 'ระหว่าง 500 มิลลิลิตรถึง 10000 มิลลิลิตร',
    unit: 'มิลลิลิตร',
  },
  infoCard: {
    eyebrow: 'ปรับปรุง',
    body: 'หากอากาศร้อนมาก คุณถือศีลเทศ หรือวันของคุณเต็มไปด้วยกิจกรรม Vyra อาจเพิ่มเป้าหมายของคุณ',
  },
  containers: {
    title: 'การเข้าถึงอย่างรวดเร็ว',
    description: 'ปรับปรุงปริมาณในภาชนะจริงของคุณครั้งเดียว',
    resetLabel: 'ตั้งค่าใหม่',
    resetA11y: 'คืนค่าขนาดเริ่มต้น',
    glass: 'แก้ว',
    largeGlass: 'แก้วใหญ่',
    bottle: 'ขวด',
  },
  warningCard: {
    eyebrow: 'คำเตือน',
    body: 'การเตือนอยู่ในการแจ้งเตือนปกติ จากที่นี่คุณจะปรับเฉพาะส่วนที่ใช้งาน',
  },
  buttons: {
    openNotifications: 'เปิดการแจ้งเตือน',
    changeUnits: 'เปลี่ยนหน่วย',
  },
} as const;
