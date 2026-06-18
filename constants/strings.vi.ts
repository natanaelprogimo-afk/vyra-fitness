export { ShellStrings } from './strings.shell.vi';

export const ErrorMessages = {
  noInternet: 'Không có tín hiệu ở đây. Tiếp tục ghi lại và tôi sẽ đồng bộ hóa khi kết nối trở lại.',
  aiUnavailable: 'Lớp AI hiện không có sẵn. Vui lòng thử lại trong vài phút.',
  saveFailed: 'Tôi không thể lưu bây giờ. Dữ liệu của bạn an toàn và tôi sẽ thử lại.',
  barcodeNotFound: 'Tôi không tìm thấy mã đó. Bạn có thể tìm kiếm thực phẩm hoặc nhập thủ công.',
  paymentError: 'Tôi không thể hoàn thành hành động này. Không có thay đổi nào được áp dụng.',
  photoAIFailed: 'Tôi không thể đọc bữa ăn đó tốt. Thử ảnh khác hoặc nhập thủ công.',
  voiceLogFailed: 'Tôi không thể hiểu bản ghi âm đó. Thử lại hoặc nhập thủ công.',
  loginFailed: 'Tôi không thể đăng nhập. Kiểm tra dữ liệu của bạn và thử lại.',
  registerFailed: 'Tôi không thể tạo tài khoản của bạn. Vui lòng thử lại.',
  sessionExpired: 'Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.',
  premiumRequired: 'Tính năng này không có sẵn trong quyền truy cập hiện tại của bạn.',
  generic: 'Có điều gì đó không ổn. Vui lòng thử lại sau.',
  loadFailed: 'Tôi không thể tải dữ liệu. Vuốt để thử lại.',
  syncFailed: 'Tôi không thể đồng bộ hóa. Dữ liệu của bạn vẫn được lưu cuctically.',
  permissionDenied: 'Tôi cần sự cho phép của bạn để tiếp tục. Bạn có thể thay đổi điều này trong Cài đặt.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Thể hình của bạn, rõ ràng từ ngày hôm nay.',
    subtitle: 'Tập luyện, bữa ăn, nước, giấc ngủ và tiến độ trong một ứng dụng.',
    cta: 'Tạo tài khoản miễn phí',
    login: 'Đăng nhập vào tài khoản của tôi',
    legal: 'Bằng cách tiếp tục, bạn chấp nhận các điều khoản của chúng tôi.',
  },
  login: {
    title: 'Chào mừng trở lại',
    subtitle: 'Đăng nhập để tiếp tục.',
    email: 'E-mail',
    password: 'Mật khẩu',
    submit: 'Đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    noAccount: 'Không có tài khoản? Tạo ngay',
  },
  register: {
    title: 'Tạo tài khoản',
    subtitle: 'Bắt đầu hành trình thể hình của bạn.',
    email: 'E-mail',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    submit: 'Tạo tài khoản',
    agreeToTerms: 'Tôi đồng ý với các điều khoản.',
    alreadyHaveAccount: 'Đã có tài khoản? Đăng nhập',
  },
  resetPassword: {
    title: 'Đặt lại mật khẩu',
    subtitle: 'Nhập địa chỉ email của bạn để nhận hướng dẫn.',
    email: 'E-mail',
    submit: 'Gửi hướng dẫn',
    backToLogin: 'Quay lại đăng nhập',
  },
} as const;

export const OnboardingStrings = {
  title: 'Chào mừng đến với Vyra Fitness',
  subtitle: 'Người đồng hành sức khỏe cá nhân của bạn',
  slides: [
    {
      title: 'Theo dõi toàn diện',
      description: 'Tập luyện, dinh dưỡng, giấc ngủ và sức khỏe ở một nơi.',
    },
    {
      title: 'AI thông minh',
      description: 'Nhận sự khuyên bảo được cá nhân hóa dựa trên dữ liệu của bạn.',
    },
    {
      title: 'Đạt được mục tiêu của bạn',
      description: 'Theo dõi tiến độ của bạn và ăn mừng mỗi chiến thắng.',
    },
  ],
  getStarted: 'Bắt đầu',
  skip: 'Bỏ qua',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'Xin chào',
    subtitle: 'Ngày sức khỏe của bạn bắt đầu ở đây.',
  },
  readiness: {
    title: 'Sự chuẩn bị',
    description: 'Bạn đã sẵn sàng cho hôm nay chưa?',
    high: 'Rất tốt',
    moderate: 'Tốt',
    low: 'Nghỉ ngơi',
  },
  waterIntake: {
    title: 'Cấp nước',
    goal: 'Mục tiêu hàng ngày',
    remaining: 'Còn lại',
  },
  sleep: {
    title: 'Giấc ngủ',
    lastNight: 'Tối hôm qua',
    quality: 'Chất lượng',
  },
  nutrition: {
    title: 'Dinh dưỡng',
    todayCalories: 'Calo hôm nay',
    goal: 'Mục tiêu',
  },
} as const;

export const ModuleNames = {
  fasting: 'Nhịn ăn',
  nutrition: 'Dinh dưỡng',
  water: 'Nước',
  workout: 'Tập luyện',
  sleep: 'Giấc ngủ',
  female: 'Chu kỳ',
  mental: 'Tinh thần',
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
  general: 'Ứng dụng này không thay thế cho lời khuyên y tế chuyên nghiệp.',
  health: 'Hãy tham khảo ý kiến bác sĩ trước khi bắt đầu chương trình mới.',
  nutrition: 'Dữ liệu dinh dưỡng chỉ dành cho mục đích thông tin.',
} as const;

export const FastingLabels = {
  state: {
    fasting: 'Nhịn ăn',
    fed: 'Được cấp dưỡng',
    breaking: 'Phá vỡ nhịn ăn',
  },
  goal: 'Mục tiêu nhịn ăn',
  window: 'Cửa sổ nhịn ăn',
  elapsed: 'Đã trôi qua',
  remaining: 'Còn lại',
} as const;

export const FemaleHealthLabels = {
  title: 'Theo dõi chu kỳ',
  phase: 'Giai đoạn',
  follicular: 'Nang',
  ovulation: 'Rụng trứng',
  luteal: 'Hoàng thể',
  menstrual: 'Kinh nguyệt',
  estimatedNextPeriod: 'Kỳ kinh dự kiến tiếp theo',
} as const;

export const WorkoutLabels = {
  duration: 'Khoảng thời gian',
  sets: 'Bộ',
  reps: 'Lần lặp lại',
  weight: 'Cân nặng',
  intensity: 'Cường độ',
  restDay: 'Ngày nghỉ',
  scheduled: 'Được lên lịch',
} as const;

export const TabBarCopy = {
  home: 'Trang chủ',
  explore: 'Khám phá',
  progress: 'Tiến độ',
  settings: 'Cài đặt',
} as const;

export const BmiCategories = {
  underweight: 'Thiếu cân',
  normal: 'Cân nặng bình thường',
  overweight: 'Thừa cân',
  obese: 'Béo phì',
} as const;

export const ComponentMessages = {
  loading: 'Đang tải...',
  noData: 'Không có dữ liệu',
  tryAgain: 'Thử lại',
  confirm: 'Xác nhận',
  cancel: 'Hủy',
  delete: 'Xóa',
  edit: 'Chỉnh sửa',
  save: 'Lưu',
  close: 'Đóng',
} as const;

export const MentalLabels = {
  title: 'Sức khỏe tâm thần',
  mood: 'Tâm trạng',
  stress: 'Căng thẳng',
  energy: 'Năng lượng',
  sleep: 'Chất lượng giấc ngủ',
} as const;

export const ReadinessLabels = {
  title: 'Chỉ số sự chuẩn bị',
  score: 'Điểm',
  factors: 'Yếu tố',
} as const;

export const ReferralMessages = {
  title: 'Mời bạn bè',
  description: 'Nhận phần thưởng bằng cách chia sẻ Vyra.',
  copyLink: 'Sao chép liên kết',
  share: 'Chia sẻ',
} as const;

export const NotificationMessages = {
  waterReminder: 'Đừng quên uống nước',
  mealReminder: 'Đã đến giờ ăn cơm',
  sleepReminder: 'Chuẩn bị ngủ',
  workoutReminder: 'Thời gian tập luyện',
} as const;

export const PrivacyTexts = {
  title: 'Quyền riêng tư và dữ liệu',
  description: 'Dữ liệu của bạn an toàn và được mã hóa.',
  dataUsage: 'Chúng tôi sử dụng dữ liệu của bạn chỉ để cải thiện trải nghiệm của bạn.',
} as const;

export const ExplorePageStrings = {
  title: 'Khám phá',
  subtitle: 'Khám phá mẹo và bài viết.',
  featured: 'Nổi bật',
  categories: 'Danh mục',
  viewMore: 'Xem thêm',
} as const;

export const HomePageStrings = {
  dailyOverview: 'Tổng quan hàng ngày',
  upcomingActivities: 'Các hoạt động sắp tới',
  recentActivity: 'Hoạt động gần đây',
  noActivity: 'Không có hoạt động hiện tại',
} as const;

export const ProgressPageStrings = {
  title: 'Tiến độ',
  weeklyStats: 'Thống kê hàng tuần',
  monthlyStats: 'Thống kê hàng tháng',
  viewDetails: 'Xem chi tiết',
} as const;

export const WaterHydrationMessages = {
  goal: 'Mục tiêu cấp nước',
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  loggingWater: 'Ghi nhật ký nước',
  waterLogged: 'Nước đã được ghi lại',
} as const;

export const StepsProgressMessages = {
  goal: 'Mục tiêu bước',
  daily: 'Hôm nay',
  weekly: 'Tuần này',
  stepsTaken: 'Các bước được thực hiện',
} as const;

export const HomeDetailStrings = {
  morningRoutine: 'Thói quen buổi sáng',
  eveningRoutine: 'Thói quen buổi tối',
  hydration: 'Cấp nước',
  nutrition: 'Dinh dưỡng',
} as const;

export const ForgotPasswordStrings = {
  title: 'Quên mật khẩu',
  subtitle: 'Chúng tôi sẽ giúp bạn khôi phục tài khoản.',
  email: 'E-mail',
  submit: 'Gửi',
  backToLogin: 'Quay lại đăng nhập',
  checkEmail: 'Kiểm tra email của bạn để biết hướng dẫn.',
} as const;

export const FastingMetabolicZones = {
  fed: 'Trạng thái được cấp dưỡng',
  postAbsorptive: 'Sau hấp thụ',
  ketosis: 'Ketosis',
  deepKetosis: 'Ketosis sâu',
} as const;

export const BiometricLabels = {
  height: 'Chiều cao',
  weight: 'Cân nặng',
  bmi: 'BMI',
  bodyFat: 'Mỡ cơ thể',
  muscleMass: 'Khối lượng cơ',
  bloodPressure: 'Huyết áp',
  heartRate: 'Nhịp tim',
} as const;

export const FemaleSymptoms = {
  cramps: 'Chuột rút',
  bloating: 'Chướng bụng',
  mood: 'Thay đổi tâm trạng',
  headache: 'Nhức đầu',
  fatigue: 'Mệt mỏi',
} as const;

export const NutritionModule = {
  macros: 'Vĩ lượng chất dinh dưỡng',
  proteins: 'Protein',
  carbs: 'Carbohydrate',
  fats: 'Chất béo',
  fiber: 'Fiber',
  calories: 'Calo',
  micronutrients: 'Vi lượng chất dinh dưỡng',
} as const;

export const FemaleModule = {
  cycle: 'Chu kỳ kinh nguyệt',
  symptoms: 'Triệu chứng',
  tracking: 'Theo dõi',
  predictions: 'Dự đoán',
} as const;

export const FastingModule = {
  fastingPeriod: 'Giai đoạn nhịn ăn',
  breakingFast: 'Phá vỡ nhịn ăn',
  metabolicState: 'Trạng thái chuyển hóa',
  benefits: 'Lợi ích',
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Cài đặt',
    title: 'Nước',
  },
  dailyGoal: {
    title: 'Mục tiêu hàng ngày',
    description: 'Chọn một cơ sở thực tế và ứng dụng sẽ điều chỉnh theo các yếu tố.',
    presets: {
      low: 'Hoạt động thấp',
      moderate: 'Vừa phải',
      recommended: 'Được khuyến cáo',
      athlete: 'Vận động viên',
      hotClimate: 'Khí hậu nóng',
    },
    customLabel: 'Mục tiêu tùy chỉnh',
    customHint: 'Từ 500 ml đến 10000 ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Điều chỉnh',
    body: 'Nếu trời rất nóng, bạn đang nhịn ăn hoặc ngày của bạn đầy đủ hoạt động, Vyra có thể tăng mục tiêu của bạn.',
  },
  containers: {
    title: 'Truy cập nhanh',
    description: 'Điều chỉnh một lần lượng nước trong các bình chứa thực tế của bạn.',
    resetLabel: 'Đặt lại',
    resetA11y: 'Khôi phục kích thước mặc định',
    glass: 'Ly',
    largeGlass: 'Ly lớn',
    bottle: 'Chai',
  },
  warningCard: {
    eyebrow: 'Cảnh báo',
    body: 'Các lời nhắc nhở nằm trong thông báo thông thường. Từ đây bạn chỉ điều chỉnh phần hoạt động.',
  },
  buttons: {
    openNotifications: 'Mở thông báo',
    changeUnits: 'Thay đổi đơn vị',
  },
} as const;
