export const ShellStrings = {
  settingsIndex: {
    title: '设置',
    noticeTitle: '配置现在有更多实际控制',
    noticeBody:
      '可访问性、模块和通知保持可见。技术和高级功能停止与日常使用竞争。',
    indexEyebrow: '索引',
    indexTitle: '没有噪音的设置',
    indexSubtitle:
      '账户和安全、外观、模块、通知和隐私都在这里。个人资料保留身份层。',
    footer:
      '如果设置不能帮助更快地使用 VYRA,则不应该在第一级。',
    items: {
      account: {
        label: '账户和安全',
        helper: '电子邮件、密码、导出和账户控制。',
      },
      appearance: {
        label: '外观和单位',
        helper: '主题、对比度、文本大小、辅助阅读和单位。',
      },
      modules: {
        label: '活跃模块',
        helper: '激活或暂停模块而不进入个人资料,调整产品的实际焦点。',
      },
      notifications: {
        label: '通知',
        helper: '权限、强度、自适应计划和实际交付。',
      },
      privacy: {
        label: '隐私',
        helper: '敏感同意、导出和账户控制。',
      },
    },
  },
  profile: {
    closeProfile: '关闭个人资料',
    closeProfileHint: '返回上一个屏幕。',
    closeSessionError: '我们现在无法关闭会话。',
    sections: {
      activity: '活动',
      coreModules: '核心模块',
      contextualModules: '上下文模块',
      account: '账户和设置',
      preferences: '偏好',
      support: '支持',
      legal: '法律',
    },
    stats: {
      currentWeight: '当前体重',
      streak: '连胜',
      lastSession: '最后一场会话',
      noSessions: '没有会话',
      daysAgo: '{{days}} 天前',
      streakDays: '{{days}} 天',
    },
    modes: {
      gainMuscle: '增肌模式',
      loseFat: '减肥模式',
      performance: '性能模式',
      consistency: '一致性模式',
    },
    rows: {
      workout: {
        label: '锻炼和活跃块',
        value: '今天的例程、计划和会话',
      },
      progress: {
        label: '完整进度',
        value: '连胜、体重和最近的会话',
      },
      settings: {
        label: '设置',
        value: '外观、模块、通知和隐私',
      },
      editProfile: '编辑个人资料',
      security: '账户和安全',
      exportData: '导出数据',
      referral: {
        label: '邀请某人',
        value: '分享您的代码并将人员添加到您的网络',
      },
      support: '支持',
      terms: '使用条款',
      privacy: '隐私政策',
      deleteAccount: '删除账户',
      logout: '登出',
    },
    membership: {
      premium: '高级',
      free: '基础',
      founding: '创建',
      modulesSummary: '{{count}} 个活跃模块',
      emailFallback: '未加载电子邮件',
    },
    moduleDescriptions: {
      workout: '计划和会话',
      nutrition: '膳食和宏',
      water: '补水和目标',
      sleep: '最后一晚和日志',
      steps: '步骤和散步',
      fasting: '计时器和协议',
      female: '周期和症状',
      supplements: '堆栈和合规性',
    },
    logout: {
      title: '登出',
      body:
        '您将从此设备注销。您的账户和历史记录将在您下次登录时可用。',
      confirm: '登出',
      loading: '注销...',
      accessibilityHint: '从此设备注销。',
    },
  },
  explore: {
    title: '探索',
    activeGoalEyebrow: '活动目标',
    activeGoalFallback: '您当前的路径',
    activeGoalBody:
      '探索不再充当第二个主页:从这里您应该看到您的路径、您的块和下一个有用的步骤。',
    program: {
      title: '活跃程序',
      noneSelected: '还没有选择程序',
      activeWeek: '第 {{week}} 周。块已经在运行,下一个决定应该来自这里。',
      recommended:
        '您已经有一个建议的例程来开始该方向。',
      chooseRoute: '现在最好选择一条指导路线,而不是打开整个目录。',
      nextAction: '下一步行动',
      backToSession: '返回会话',
      chooseProgram: '选择程序',
      progress: '进度',
      thisWeek: '{{sessions}}/{{goal}} 本周',
      continueProgram: '继续程序',
    },
    sections: {
      recommended: '为您推荐',
      coaching: '背景教练',
      weeklyPriority: '本周优先事项',
      momentum: '挑战和动力',
      streak: '连胜',
      weeklySessions: '周会话',
      usefulLibrary: '有用的库',
    },
    goalLabels: {
      loseFat: '减肥',
      gainMuscle: '增肌',
      performance: '表现',
      health: '组织习惯',
      mental: '恢复',
      currentPath: '您当前的路径',
    },
    cards: {
      nextFocusEyebrow: '下一个调整',
      nextFocusBody: '今天的背景阅读已经找到了最值得先推的东西。',
      workoutOpenCurrent: '打开您当前的块',
      workoutChooseGuided: '选择指导程序',
      workoutOpenBody:
        '查看周、日和负荷连续性,不会偏离主路径。',
      workoutChooseBody:
        '以清晰的路径开始,而不是浏览无优先级的松散程序。',
      nutritionEyebrow: '营养',
      nutritionTitle: '简单的营养重置',
      nutritionBody:
        '一个记录良好的日子比您无法使用的复杂电子表格更有价值。',
      recoveryEyebrow: '恢复',
      sleepTitle: '本周睡眠更好',
      sleepBody:
        '在要求更多力量和更多一致性之前调整休息。',
      waterTitle: '补水程序',
      waterBody:
        '简单的水基础和每日节奏使系统的其余部分表现更好。',
      libraryEyebrow: '有用的库',
      plannerTitle: '每周计划',
      plannerBody:
        '可视化周并准备下一个块而不打开额外的模块。',
      mealTitle: '记录一餐',
      mealBody: '回到基础并在两个步骤中清楚地完成一天。',
      sleepLibraryTitle: '查看睡眠',
      sleepLibraryBody: '阅读最后一晚,并以更大的判断力降低或提高负荷。',
      progressTitle: '阅读真实进度',
      progressBody:
        '如果您想要更深层的背景,这里您会看到趋势,而不仅仅是单独的记录。',
    },
    milestone: {
      onTrack:
        '周进行中。现在是维持块的质量而不添加噪声的时候了。',
      remaining: '您缺少 {{count}} 个会话来关闭您的每周目标。',
    },
    accessibility: {
      quickAccessHint: '打开此推荐的目标。',
    },
  },
  progress: {
    title: '真实进度',
    subtitle: '仅支持您计划的内容。',
    exportAccessibility: '导出您的数据',
    hero: {
      eyebrow: '今天最重要的',
      streakDay: '连胜天',
      streakDays: '连胜天',
      touchedModules: '{{done}}/{{total}} 模块今天触摸',
      activeDay:
        '您已经移动了一天。一个小动作也支持大进度。',
      inactiveDay:
        '您仍然有时间用简单的动作拯救这一天并保持连续性活跃。',
      viewToday: '查看我今天的进度',
      saveStreak: '保存连胜',
      adjustModules: '编辑模块',
    },
    sections: {
      chosenModules: '您选择的模块',
      chosenModulesHint: '仅推动您的目标的内容。',
      trainedMuscles: '最近的肌肉地图',
      trainedMusclesHint: '基于过去 30 天的实际训练和负荷下降的位置。',
    },
    cards: {
      workoutWeekly: '每周锻炼',
      workoutMeta: '您的力量周',
      workoutNote:
        '开始一个会话,连胜已经从今天开始计数。',
      workoutProgramNote: '{{duration}} 大约 · {{count}} 程序会话',
      continueProgram: '继续程序',
      startWorkout: '开始锻炼',
      nutritionMeta: '{{protein}}g 蛋白质 · 连胜 {{days}} 天',
      nutritionNote: '{{days}}/7 天本周记录',
      openNutrition: '打开营养',
      waterMeta: '连胜 {{days}} 天',
      waterDone: '您已经今天完成补水。',
      waterPending: '一条记录可以保存连胜。',
      openWater: '打开水',
      stepsMeta: '{{days}}/7 天完成目标',
      stepsNote: '{{distance}} 今天走过',
      openSteps: '打开步骤',
      sleepMeta: '{{days}}/7 夜完成目标',
      openSleep: '打开睡眠',
      active: '活跃',
      moduleAvailable: '此模块仍可用于您的当前计划。',
      openModule: '打开模块',
    },
    goals: {
      loseFatRemaining: '{{remaining}} 千卡仍在计划中',
      loseFatOver: '{{over}} 千卡超过计划',
      loseFatBodyGood:
        '您今天带着 {{activity}} 活动和清晰的空间来完成一天。',
      loseFatBodyOver:
        '您需要轻松完成这一天,以免破坏您正在寻找的赤字。',
      loseFatNote: '营养 {{pct}}% · 连胜 {{days}} 天',
      gainMuscleRemaining: '{{remaining}} 千卡完成体积',
      gainMuscleDone: '热量计划覆盖',
      gainMuscleBodyRemaining:
        '您缺少有用的卡路里来更好地构建和从锻炼中恢复。',
      gainMuscleBodyDone:
        '您已经有足够的能量来构建并保持性能。',
      gainMuscleNote: '营养 {{pct}}% · 活动 {{activity}}',
      performanceTitle: '今天能量计划的 {{pct}}%',
      performanceBody:
        '活动 {{activity}}。这里重要的是带着能量来,而不仅仅是获得数字。',
      performanceNote: '目标 {{target}} · 连胜 {{days}} 天',
      defaultTitle: '每日计划覆盖的 {{pct}}%',
      defaultBody:
        '活动 {{activity}} 和 {{days}} 天连续记录膳食。',
      defaultNote: '目标 {{target}}',
    },
    weight: {
      noDataTitle: '还没有最近的体重',
      noDataBody:
        '当您记录真实体重时,您会在这里看到变化的方向,而不仅仅是单独的数字。',
      noDataNote: '记录您当前的体重,趋势在这里开始。',
      noTrend: '还没有每周趋势',
      weeklyDelta: '{{sign}}{{value}} 本周',
      toGoal: '{{value}} 对于您的目标',
      currentWeight: '当前体重 {{value}}',
      loseFatBody:
        '当前体重 {{current}}。现在重要的是维持趋势,而不是看单独的一天。',
      gainMuscleBody:
        '当前体重 {{current}}。一致性盈余比无控制的快速收益更有价值。',
      defaultBody:
        '好的读物不仅是你的体重,而是趋势是否支持你选择的目标。',
    },
    muscle: {
      empty:
        '当您完成更多会话时,您会快速看到您的实际工作是否下降到腿部、背部、核心或躯干。',
      focusSessions: '{{count}} 个焦点会话',
      noProgram: '还没有活跃的程序',
      lastWorkout: '最后一次锻炼: {{name}}',
      programProgress: '{{name}} · {{done}}/{{total}} 会话',
    },
  },
} as const;
