export { ShellStrings } from './strings.shell.ko';

export const ErrorMessages = {
  noInternet: '여기에 신호가 없습니다. 기록을 계속하면 연결이 돌아올 때 동기화합니다.',
  aiUnavailable: 'AI 레이어는 현재 사용할 수 없습니다. 몇 분 후 다시 시도하세요.',
  saveFailed: '지금 저장할 수 없습니다. 데이터는 안전하며 다시 시도하겠습니다.',
  barcodeNotFound: '해당 코드를 찾을 수 없습니다. 음식을 검색하거나 수동으로 입력할 수 있습니다.',
  paymentError: '이 작업을 완료할 수 없습니다. 변경사항이 적용되지 않았습니다.',
  photoAIFailed: '해당 식사를 잘 읽을 수 없습니다. 다른 사진을 시도하거나 수동으로 입력하세요.',
  voiceLogFailed: '음성 기록을 이해할 수 없습니다. 다시 시도하거나 수동으로 입력하세요.',
  loginFailed: '로그인할 수 없습니다. 데이터를 확인하고 다시 시도하세요.',
  registerFailed: '계정을 만들 수 없습니다. 다시 시도하세요.',
  sessionExpired: '세션이 만료되었습니다. 계속하려면 다시 로그인하세요.',
  premiumRequired: '이 기능은 현재 액세스에서 사용할 수 없습니다.',
  generic: '뭔가 잘못되었습니다. 잠시 후 다시 시도하세요.',
  loadFailed: '데이터를 로드할 수 없습니다. 스와이프하여 다시 시도하세요.',
  syncFailed: '동기화할 수 없습니다. 데이터는 로컬에 저장된 상태로 유지됩니다.',
  permissionDenied: '계속하려면 권한이 필요합니다. 설정에서 변경할 수 있습니다.',
} as const;

export const AuthStrings = {
  welcome: {
    title: '당신의 피트니스, 오늘부터 명확합니다.',
    subtitle: '운동, 식사, 물, 수면 및 진행 상황을 하나의 앱으로.',
    cta: '무료 계정 만들기',
    login: '내 계정에 로그인',
    legal: '계속하면 이용약관에 동의하는 것입니다.',
  },
  login: {
    title: '다시 오셨습니다',
    subtitle: '로그인하여 계속하세요.',
    email: '이메일',
    password: '비밀번호',
    submit: '로그인',
    forgotPassword: '비밀번호를 잊으셨습니까?',
    noAccount: '계정이 없으신가요? 지금 만들기',
  },
  register: {
    title: '계정 만들기',
    subtitle: '피트니스 여정을 시작하세요.',
    email: '이메일',
    password: '비밀번호',
    confirmPassword: '비밀번호 확인',
    submit: '계정 만들기',
    agreeToTerms: '약관에 동의합니다.',
    alreadyHaveAccount: '이미 계정이 있으신가요? 로그인',
  },
  resetPassword: {
    title: '비밀번호 재설정',
    subtitle: '이메일 주소를 입력하여 지침을 받으세요.',
    email: '이메일',
    submit: '지침 보내기',
    backToLogin: '로그인으로 돌아가기',
  },
} as const;

export const OnboardingStrings = {
  title: 'Vyra Fitness에 오신 것을 환영합니다',
  subtitle: '당신의 개인 건강 파트너',
  slides: [
    {
      title: '포괄적인 추적',
      description: '운동, 영양, 수면 및 웰빙을 한 곳에서.',
    },
    {
      title: '지능형 AI',
      description: '데이터 기반 개인화된 조언을 받으세요.',
    },
    {
      title: '목표 달성',
      description: '진행 상황을 추적하고 모든 승리를 축하하세요.',
    },
  ],
  getStarted: '시작하기',
  skip: '건너뛰기',
} as const;

export const DashboardStrings = {
  header: {
    greeting: '안녕하세요',
    subtitle: '당신의 건강한 하루가 여기서 시작됩니다.',
  },
  readiness: {
    title: '준비 상태',
    description: '오늘 준비가 되셨나요?',
    high: '매우 좋음',
    moderate: '좋음',
    low: '휴식',
  },
  waterIntake: {
    title: '수분 섭취',
    goal: '일일 목표',
    remaining: '남음',
  },
  sleep: {
    title: '수면',
    lastNight: '지난밤',
    quality: '품질',
  },
  nutrition: {
    title: '영양',
    todayCalories: '오늘의 칼로리',
    goal: '목표',
  },
} as const;

export const ModuleNames = {
  fasting: '금식',
  nutrition: '영양',
  water: '물',
  workout: '운동',
  sleep: '수면',
  female: '주기',
  mental: '정신',
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
  general: '이 앱은 전문적인 의료 조언을 대체하지 않습니다.',
  health: '새로운 프로그램을 시작하기 전에 의사와 상담하세요.',
  nutrition: '영양 데이터는 정보 제공 목적으로만 제공됩니다.',
} as const;

export const FastingLabels = {
  state: {
    fasting: '금식',
    fed: '식이',
    breaking: '금식 중단',
  },
  goal: '금식 목표',
  window: '금식 창',
  elapsed: '경과',
  remaining: '남음',
} as const;

export const FemaleHealthLabels = {
  title: '주기 추적',
  phase: '단계',
  follicular: '난포',
  ovulation: '배란',
  luteal: '황체',
  menstrual: '월경',
  estimatedNextPeriod: '예상 다음 생리',
} as const;

export const WorkoutLabels = {
  duration: '기간',
  sets: '세트',
  reps: '반복',
  weight: '무게',
  intensity: '강도',
  restDay: '휴식일',
  scheduled: '예약됨',
} as const;

export const TabBarCopy = {
  home: '홈',
  explore: '탐색',
  progress: '진행 상황',
  settings: '설정',
} as const;

export const BmiCategories = {
  underweight: '저체중',
  normal: '정상 체중',
  overweight: '과체중',
  obese: '비만',
} as const;

export const ComponentMessages = {
  loading: '로드 중...',
  noData: '사용 가능한 데이터 없음',
  tryAgain: '다시 시도',
  confirm: '확인',
  cancel: '취소',
  delete: '삭제',
  edit: '편집',
  save: '저장',
  close: '닫기',
} as const;

export const MentalLabels = {
  title: '정신 건강',
  mood: '기분',
  stress: '스트레스',
  energy: '에너지',
  sleep: '수면의 질',
} as const;

export const ReadinessLabels = {
  title: '준비 지수',
  score: '점수',
  factors: '요소',
} as const;

export const ReferralMessages = {
  title: '친구 초대',
  description: 'Vyra를 공유하여 보상을 받으세요.',
  copyLink: '링크 복사',
  share: '공유',
} as const;

export const NotificationMessages = {
  waterReminder: '물 마시는 것을 잊지 마세요',
  mealReminder: '식사 시간입니다',
  sleepReminder: '수면을 준비하세요',
  workoutReminder: '운동 시간',
} as const;

export const PrivacyTexts = {
  title: '개인정보 보호 및 데이터',
  description: '귀하의 데이터는 안전하고 암호화됩니다.',
  dataUsage: '귀하의 데이터를 귀하의 경험을 개선하기 위해서만 사용합니다.',
} as const;

export const ExplorePageStrings = {
  title: '탐색',
  subtitle: '팁과 기사를 발견하세요.',
  featured: '추천',
  categories: '카테고리',
  viewMore: '더보기',
} as const;

export const HomePageStrings = {
  dailyOverview: '일일 개요',
  upcomingActivities: '예정된 활동',
  recentActivity: '최근 활동',
  noActivity: '현재 활동 없음',
} as const;

export const ProgressPageStrings = {
  title: '진행 상황',
  weeklyStats: '주간 통계',
  monthlyStats: '월간 통계',
  viewDetails: '상세 보기',
} as const;

export const WaterHydrationMessages = {
  goal: '수분 공급 목표',
  daily: '일일',
  weekly: '주간',
  loggingWater: '물 기록',
  waterLogged: '물 기록됨',
} as const;

export const StepsProgressMessages = {
  goal: '걸음 목표',
  daily: '오늘',
  weekly: '이번 주',
  stepsTaken: '걸음 수',
} as const;

export const HomeDetailStrings = {
  morningRoutine: '아침 루틴',
  eveningRoutine: '저녁 루틴',
  hydration: '수분 공급',
  nutrition: '영양',
} as const;

export const ForgotPasswordStrings = {
  title: '비밀번호 잊음',
  subtitle: '계정을 복구하는 데 도움을 드리겠습니다.',
  email: '이메일',
  submit: '보내기',
  backToLogin: '로그인으로 돌아가기',
  checkEmail: '지침에 대해 이메일을 확인하세요.',
} as const;

export const FastingMetabolicZones = {
  fed: '영양 상태',
  postAbsorptive: '식후',
  ketosis: '케톤증',
  deepKetosis: '깊은 케톤증',
} as const;

export const BiometricLabels = {
  height: '키',
  weight: '체중',
  bmi: 'BMI',
  bodyFat: '체지방',
  muscleMass: '근육량',
  bloodPressure: '혈압',
  heartRate: '심박수',
} as const;

export const FemaleSymptoms = {
  cramps: '경련',
  bloating: '팽만감',
  mood: '기분 변화',
  headache: '두통',
  fatigue: '피로',
} as const;

export const NutritionModule = {
  macros: '다량 영양소',
  proteins: '단백질',
  carbs: '탄수화물',
  fats: '지방',
  fiber: '섬유',
  calories: '칼로리',
  micronutrients: '미량 영양소',
} as const;

export const FemaleModule = {
  cycle: '월경 주기',
  symptoms: '증상',
  tracking: '추적',
  predictions: '예측',
} as const;

export const FastingModule = {
  fastingPeriod: '금식 기간',
  breakingFast: '금식 중단',
  metabolicState: '대사 상태',
  benefits: '이점',
} as const;

export const WaterModule = {
  header: {
    eyebrow: '설정',
    title: '물',
  },
  dailyGoal: {
    title: '일일 목표',
    description: '현실적인 기준을 선택하면 앱이 요소에 맞게 조정됩니다.',
    presets: {
      low: '낮은 활동',
      moderate: '중간',
      recommended: '권장',
      athlete: '운동 선수',
      hotClimate: '더운 기후',
    },
    customLabel: '사용자 정의 목표',
    customHint: '500ml ~ 10000ml 사이.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: '조정',
    body: '날씨가 매우 덥거나 금식 중이거나 하루가 바쁜 경우 Vyra가 목표를 높일 수 있습니다.',
  },
  containers: {
    title: '빠른 액세스',
    description: '실제 용기의 양을 한 번 조정합니다.',
    resetLabel: '재설정',
    resetA11y: '기본 크기 복원',
    glass: '잔',
    largeGlass: '큰 잔',
    bottle: '병',
  },
  warningCard: {
    eyebrow: '경고',
    body: '알림은 정상 알림에 있습니다. 여기서는 운영 부분만 조정합니다.',
  },
  buttons: {
    openNotifications: '알림 열기',
    changeUnits: '단위 변경',
  },
} as const;
