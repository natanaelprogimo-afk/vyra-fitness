export { ShellStrings } from './strings.shell.ja';

export const ErrorMessages = {
  noInternet: 'ここに信号がありません。記録を続けると、接続が戻ったら同期します。',
  aiUnavailable: 'AI層は現在利用できません。数分後に再度お試しください。',
  saveFailed: '今は保存できませんでした。データは安全です。再度実行します。',
  barcodeNotFound: 'そのコードが見つかりませんでした。食品を検索するか、手動で入力できます。',
  paymentError: 'このアクションを完了できませんでした。変更は適用されていません。',
  photoAIFailed: 'その食事をよく読めませんでした。別の写真を試すか、手動で入力してください。',
  voiceLogFailed: '音声記録が理解できませんでした。もう一度試すか、手動で入力してください。',
  loginFailed: 'ログインできませんでした。データを確認して再度お試しください。',
  registerFailed: 'アカウントを作成できませんでした。再度お試しください。',
  sessionExpired: 'セッションの有効期限が切れました。続行するには再度ログインしてください。',
  premiumRequired: 'この機能は現在のアクセスで利用できません。',
  generic: '何か問題が発生しました。もう一度お試しください。',
  loadFailed: 'データが読み込めませんでした。スワイプして再度お試しください。',
  syncFailed: '同期できませんでした。データはローカルに保存されたままです。',
  permissionDenied: '続行するには許可が必要です。設定で変更できます。',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'あなたのフィットネス、今日から明確です。',
    subtitle: 'トレーニング、食事、水、睡眠、進歩、すべて1つのアプリで。',
    cta: '無料アカウントを作成',
    login: 'アカウントにログイン',
    legal: '続行することで、条件に同意します。',
  },
  login: {
    title: 'おかえりなさい',
    subtitle: 'ログインして続行してください。',
    email: 'メール',
    password: 'パスワード',
    submit: 'ログイン',
    forgotPassword: 'パスワードをお忘れですか？',
    noAccount: 'アカウントがありませんか？今すぐ作成してください',
  },
  register: {
    title: 'アカウントを作成',
    subtitle: 'フィットネスの旅を始めましょう。',
    email: 'メール',
    password: 'パスワード',
    confirmPassword: 'パスワードの確認',
    submit: 'アカウントを作成',
    agreeToTerms: '条件に同意します。',
    alreadyHaveAccount: 'すでにアカウントを持っていますか？ログイン',
  },
  resetPassword: {
    title: 'パスワードをリセット',
    subtitle: 'メールアドレスを入力して、指示を受け取ってください。',
    email: 'メール',
    submit: '指示を送信',
    backToLogin: 'ログインに戻る',
  },
} as const;

export const OnboardingStrings = {
  title: 'Vyra フィットネスへようこそ',
  subtitle: 'あなたの個人的な健康パートナー',
  slides: [
    {
      title: '包括的な追跡',
      description: 'トレーニング、栄養、睡眠、健康、すべて1つの場所で。',
    },
    {
      title: 'インテリジェント AI',
      description: 'データに基づいたパーソナライズされたアドバイスを取得します。',
    },
    {
      title: 'あなたの目標を達成する',
      description: '進度を追跡し、すべての勝利を祝ってください。',
    },
  ],
  getStarted: '始める',
  skip: 'スキップ',
} as const;

export const DashboardStrings = {
  header: {
    greeting: 'こんにちは',
    subtitle: 'あなたの健康の日はここから始まります。',
  },
  readiness: {
    title: '準備',
    description: '今日の準備はできていますか？',
    high: 'とても良い',
    moderate: 'いい',
    low: '休む',
  },
  waterIntake: {
    title: '水分補給',
    goal: '毎日の目標',
    remaining: '残り',
  },
  sleep: {
    title: '睡眠',
    lastNight: '昨夜',
    quality: '品質',
  },
  nutrition: {
    title: '栄養',
    todayCalories: '今日のカロリー',
    goal: '目標',
  },
} as const;

export const ModuleNames = {
  fasting: '断食',
  nutrition: '栄養',
  water: '水',
  workout: 'ワークアウト',
  sleep: '睡眠',
  female: 'サイクル',
  mental: 'メンタル',
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
  general: 'このアプリは専門の医学的アドバイスの代わりにはなりません。',
  health: '新しいプログラムを開始する前に医師に相談してください。',
  nutrition: '栄養データは情報提供のみを目的としています。',
} as const;

export const FastingLabels = {
  state: {
    fasting: '断食',
    fed: '食べた',
    breaking: '断食を終える',
  },
  goal: '断食の目標',
  window: '断食ウィンドウ',
  elapsed: '経過',
  remaining: '残り',
} as const;

export const FemaleHealthLabels = {
  title: 'サイクル追跡',
  phase: 'フェーズ',
  follicular: '卵胞',
  ovulation: '排卵',
  luteal: '黄体',
  menstrual: '月経',
  estimatedNextPeriod: '予定される次の期間',
} as const;

export const WorkoutLabels = {
  duration: '期間',
  sets: 'セット',
  reps: 'レップ',
  weight: '重さ',
  intensity: '強度',
  restDay: '休息日',
  scheduled: 'スケジュール済み',
} as const;

export const TabBarCopy = {
  home: 'ホーム',
  explore: '探索',
  progress: '進度',
  settings: '設定',
} as const;

export const BmiCategories = {
  underweight: '低体重',
  normal: '正常体重',
  overweight: '太り気味',
  obese: '肥満',
} as const;

export const ComponentMessages = {
  loading: '読み込み中...',
  noData: '利用できるデータはありません',
  tryAgain: 'もう一度試す',
  confirm: '確認',
  cancel: 'キャンセル',
  delete: '削除',
  edit: '編集',
  save: '保存',
  close: '閉じる',
} as const;

export const MentalLabels = {
  title: 'メンタルウェルネス',
  mood: '気分',
  stress: 'ストレス',
  energy: 'エネルギー',
  sleep: '睡眠の質',
} as const;

export const ReadinessLabels = {
  title: 'レディネス指数',
  score: 'スコア',
  factors: 'ファクター',
} as const;

export const ReferralMessages = {
  title: '友人を招待',
  description: 'Vyraを共有して報酬を獲得してください。',
  copyLink: 'リンクをコピー',
  share: '共有',
} as const;

export const NotificationMessages = {
  waterReminder: '水を飲むのを忘れないでください',
  mealReminder: '食事の時間です',
  sleepReminder: '寝る準備をしてください',
  workoutReminder: 'ワークアウト時間',
} as const;

export const PrivacyTexts = {
  title: 'プライバシーとデータ',
  description: 'あなたのデータは安全で暗号化されています。',
  dataUsage: 'あなたのデータは体験を改善するためにのみ使用されます。',
} as const;

export const ExplorePageStrings = {
  title: '探索',
  subtitle: 'ヒントと記事を発見します。',
  featured: 'フィーチャー',
  categories: 'カテゴリ',
  viewMore: 'もっと見る',
} as const;

export const HomePageStrings = {
  dailyOverview: '毎日の概要',
  upcomingActivities: '今後のアクティビティ',
  recentActivity: '最近のアクティビティ',
  noActivity: '現在アクティビティはありません',
} as const;

export const ProgressPageStrings = {
  title: '進度',
  weeklyStats: '週単位の統計',
  monthlyStats: '月別統計',
  viewDetails: '詳細を表示',
} as const;

export const WaterHydrationMessages = {
  goal: '水分補給の目標',
  daily: '毎日',
  weekly: '週単位',
  loggingWater: '水分をログに記録',
  waterLogged: '水がログに記録されました',
} as const;

export const StepsProgressMessages = {
  goal: 'ステップ目標',
  daily: '今日',
  weekly: '今週',
  stepsTaken: 'ステップを実行',
} as const;

export const HomeDetailStrings = {
  morningRoutine: '朝のルーティン',
  eveningRoutine: '夜のルーティン',
  hydration: '水分補給',
  nutrition: '栄養',
} as const;

export const ForgotPasswordStrings = {
  title: 'パスワードをお忘れですか',
  subtitle: 'アカウントの復旧をお手伝いします。',
  email: 'メール',
  submit: '送信',
  backToLogin: 'ログインに戻る',
  checkEmail: '指示についてはメールを確認してください。',
} as const;

export const FastingMetabolicZones = {
  fed: '栄養状態',
  postAbsorptive: '食後',
  ketosis: 'ケトーシス',
  deepKetosis: '深いケトーシス',
} as const;

export const BiometricLabels = {
  height: '身長',
  weight: '体重',
  bmi: 'BMI',
  bodyFat: '体脂肪',
  muscleMass: '筋肉量',
  bloodPressure: '血圧',
  heartRate: '心拍数',
} as const;

export const FemaleSymptoms = {
  cramps: '痙攣',
  bloating: 'ブロー',
  mood: '気分のむら',
  headache: '頭痛',
  fatigue: '疲労',
} as const;

export const NutritionModule = {
  macros: 'マクロ栄養素',
  proteins: 'タンパク質',
  carbs: '炭水化物',
  fats: '脂肪',
  fiber: '繊維',
  calories: 'カロリー',
  micronutrients: 'ミクロ栄養素',
} as const;

export const FemaleModule = {
  cycle: '月経周期',
  symptoms: '症状',
  tracking: 'トラッキング',
  predictions: '予測',
} as const;

export const FastingModule = {
  fastingPeriod: '断食期間',
  breakingFast: '断食を終える',
  metabolicState: 'メタボリック状態',
  benefits: 'メリット',
} as const;

export const WaterModule = {
  header: {
    eyebrow: '設定',
    title: '水',
  },
  dailyGoal: {
    title: '毎日の目標',
    description: '現実的なベースを選択すると、アプリはファクターに合わせて調整されます。',
    presets: {
      low: '低活動',
      moderate: '中程度',
      recommended: '推奨',
      athlete: 'アスリート',
      hotClimate: '暑い気候',
    },
    customLabel: 'カスタム目標',
    customHint: '500 ml～10000 ml。',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: '調整',
    body: '非常に暑い、断食中、または日が満杯の場合、Vyraはあなたの目標を上げることができます。',
  },
  containers: {
    title: 'クイックアクセス',
    description: '実際のコンテナに含まれる量を1回調整します。',
    resetLabel: 'リセット',
    resetA11y: 'デフォルトサイズを復元',
    glass: 'グラス',
    largeGlass: '大きなグラス',
    bottle: 'ボトル',
  },
  warningCard: {
    eyebrow: '警告',
    body: 'リマインダーは通常の通知にあります。ここから操作部分のみを調整します。',
  },
  buttons: {
    openNotifications: '通知を開く',
    changeUnits: 'ユニットを変更',
  },
} as const;
