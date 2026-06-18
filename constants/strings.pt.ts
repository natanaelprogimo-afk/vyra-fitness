export { ShellStrings } from './strings.shell.pt';

export const ErrorMessages = {
  noInternet: 'Voce esta sem conexao. Continue registrando e sincronizo quando a internet voltar.',
  aiUnavailable: 'A camada de IA nao esta disponivel agora. Tente novamente em alguns minutos.',
  saveFailed: 'Nao consegui salvar agora. Seus dados continuam seguros e vou tentar de novo.',
  barcodeNotFound: 'Nao encontrei esse codigo. Voce pode buscar o alimento ou inseri-lo manualmente.',
  paymentError: 'Nao consegui concluir esta acao. Nenhuma mudanca foi aplicada.',
  photoAIFailed: 'Nao consegui ler bem essa refeicao. Tente outra foto ou insira manualmente.',
  voiceLogFailed: 'Nao consegui entender esse registro por voz. Tente de novo ou insira manualmente.',
  loginFailed: 'Nao consegui entrar. Revise seus dados e tente novamente.',
  registerFailed: 'Nao consegui criar sua conta. Tente outra vez.',
  sessionExpired: 'Sua sessao expirou. Entre novamente para continuar.',
  premiumRequired: 'Esta funcao ja esta disponivel no seu acesso atual.',
  generic: 'Algo deu errado. Tente novamente em instantes.',
  loadFailed: 'Nao consegui carregar os dados. Puxe a tela para tentar de novo.',
  syncFailed: 'Nao consegui sincronizar. Seus dados continuam salvos localmente.',
  permissionDenied: 'Preciso da sua permissao para continuar. Voce pode mudar isso em Ajustes.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Seu fitness, claro desde o primeiro dia.',
    subtitle: 'Treino, refeicoes, agua, sono e progresso em um so app.',
    cta: 'Criar conta gratis',
    login: 'Entrar na minha conta',
    legal: 'Ao continuar, voce aceita nossos termos.',
  },
  login: {
    title: 'Bem-vindo de volta',
    email: 'Email',
    password: 'Senha',
    cta: 'Entrar',
    forgot: 'Esqueci minha senha',
    noAccount: 'Nao tenho conta',
    register: 'Criar conta',
  },
  register: {
    title: 'Criar conta',
    name: 'Seu nome',
    email: 'Email',
    password: 'Senha (minimo de 8 caracteres)',
    cta: 'Criar minha conta',
    haveAccount: 'Ja tenho conta',
    login: 'Entrar',
    tosLabel: 'Aceito os',
    tos: 'Termos de Servico',
    and: 'e a',
    privacy: 'Politica de Privacidade',
    healthConsent: 'Aceito que a Vyra processe meus dados de saude para personalizar minha experiencia.',
    medicalDisclaimer:
      'Entendo que a Vyra nao e um dispositivo medico e nao substitui avaliacao profissional.',
  },
  medicalModal: {
    title: 'Antes de comecar',
    body:
      'Vyra e um app de bem-estar e fitness. Nao e um dispositivo medico certificado e nao substitui consulta, diagnostico nem tratamento profissional.',
    cta: 'Entendi, continuar',
  },
} as const;

export const OnboardingStrings = {
  step1: {
    title: 'Qual e seu objetivo principal?',
    subtitle: 'Usamos isso para montar uma experiencia inicial coerente.',
    goals: {
      lose_fat: 'Perder gordura',
      gain_muscle: 'Ganhar musculo',
      general_health: 'Saude geral',
      sport_performance: 'Performance esportiva',
      mental_wellbeing: 'Bem-estar geral',
    },
  },
  step2: {
    title: 'Onde voce treina?',
    subtitle: 'Assim filtramos a rotina e o tipo de exercicio certos.',
    gender: {
      label: 'Sexo biologico',
      male: 'Masculino',
      female: 'Feminino',
      non_binary: 'Nao binario',
      prefer_not_to_say: 'Prefiro nao dizer',
    },
    age: 'Idade',
    height: 'Altura (cm)',
    weight: 'Peso atual (kg)',
    goalWeight: 'Peso alvo (kg, opcional)',
  },
  step3: {
    title: 'Qual e seu foco principal?',
    subtitle: 'Escolha primeiro o modulo principal e depois adicione apoios se quiser.',
    levels: {
      0: 'Muito baixo',
      1: 'Baixo',
      2: 'Moderado',
      3: 'Ativo',
      4: 'Muito ativo',
      5: 'Atleta',
    },
    equipment: {
      label: 'Equipamento disponivel',
      gym: 'Academia completa',
      home: 'Casa com material basico',
      both: 'Ambos',
      outside: 'Ao ar livre',
      none: 'Sem equipamento',
    },
  },
  step4: {
    title: 'Tudo pronto',
    subtitle: 'Deixamos sua primeira acao de hoje preparada.',
    wakeTime: 'Hora de acordar',
    sleepTime: 'Hora de dormir',
    fasting: {
      label: 'Jejum intermitente',
      yes: 'Sim',
      no: 'Nao',
    },
    protocol: 'Protocolo',
  },
  step5: {
    title: 'Acesso aberto',
    subtitle: 'Funcoes avancadas prontas desde o primeiro dia.',
    features: {
      aiCoach: 'IA contextual',
      photoLog: 'Registro por foto',
      voiceLog: 'Registro por voz',
      unlimitedHistory: 'Historico ampliado',
      correlations: 'Mais contexto e correlacoes',
      noAds: 'Acesso aberto desde o primeiro dia',
    },
    monthly: 'Acesso aberto',
    yearly: 'Tudo pronto',
    yearlyNote: 'Sem desbloqueios',
    trialCta: 'Entrar na Vyra',
    freeCta: 'Continuar',
    freeNote: 'O produto ja esta aberto e pronto para usar.',
  },
  next: 'Seguinte',
  back: 'Voltar',
  skip: 'Pular',
  finish: 'Comecar',
  step: 'Passo',
  of: 'de',
} as const;

export const DashboardStrings = {
  greeting: {
    morning: 'Bom dia',
    afternoon: 'Boa tarde',
    evening: 'Boa noite',
  },
  dailyScore: 'Sinal do dia',
  streak: 'dias de sequencia',
  bestStreak: 'melhor sequencia',
  checkIn: 'Registro do dia',
  checkInDone: 'Registro feito',
  quickActions: 'Registros rapidos',
  todayMissions: 'Esta semana',
  aiInsight: 'Contexto de hoje:',
  noInsight: 'Complete seu primeiro registro para receber contexto.',
} as const;

export const ModuleNames = {
  water: 'Agua',
  steps: 'Passos',
  fasting: 'Jejum',
  sleep: 'Sono',
  nutrition: 'Nutricao',
  weight: 'Peso',
  workout: 'Treino',
  mental: 'Bem-estar',
  female: 'Saude feminina',
  supplements: 'Suplementos',
  recovery: 'Recuperacao',
} as const;

export const ModuleEmojis = {
  water: '💧',
  steps: '🚶',
  fasting: '⏳',
  sleep: '😴',
  nutrition: '🥗',
  weight: '⚖️',
  workout: '🏋️',
  mental: '🧠',
  female: '🌸',
  supplements: '💊',
  recovery: '🛌',
} as const;

export const Disclaimers = {
  context: 'A IA contextual da Vyra oferece orientacao geral e nao substitui cuidado profissional.',
  supplements:
    'A Vyra nao recomenda doses nem combinacoes de suplementos. Consulte um profissional de saude.',
  bmi: 'IMC e gordura corporal sao estimativas. Nao sao diagnostico medico.',
  cycle: 'A previsao do ciclo e estimativa e nao deve ser usada como metodo contraceptivo.',
  fasting24h:
    'Jejum prolongado nao e adequado para todas as pessoas. Consulte um profissional se tiver duvidas.',
  deficitHigh:
    'Um deficit calorico agressivo pode ser prejudicial no longo prazo. Considere orientacao nutricional profissional.',
} as const;

export const NotificationStrings = {
  waterReminder: (ml: number, goal: number) => `Voce esta em ${ml} ml de ${goal} ml. Vamos somar um copo?`,
  stepsReminder: (steps: number, goal: number) =>
    `Voce esta em ${steps.toLocaleString()} de ${goal.toLocaleString()} passos.`,
  streakDanger: (days: number) =>
    `Sua sequencia de ${days} dias esta em risco. Uma acao curta hoje a mantem viva.`,
  fastingPhase: (phase: string) => `Voce entrou em ${phase}. Seu jejum segue no caminho certo.`,
  goalReached: (goal: string) => `Meta de ${goal} atingida.`,
  prAchieved: (exercise: string, weight: number) => `Novo recorde: ${weight} kg em ${exercise}.`,
} as const;

export const General = {
  save: 'Salvar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  delete: 'Excluir',
  edit: 'Editar',
  close: 'Fechar',
  back: 'Voltar',
  continue: 'Continuar',
  retry: 'Tentar novamente',
  loading: 'Carregando...',
  syncing: 'Sincronizando...',
  today: 'Hoje',
  yesterday: 'Ontem',
  week: 'Semana',
  month: 'Mes',
  all: 'Tudo',
  free: 'Gratis',
  premium: 'Incluido',
  upgrade: 'Ver acesso',
  history: 'Historico',
  settings: 'Ajustes',
  profile: 'Perfil',
  logout: 'Sair',
  or: 'ou',
  and: 'e',
  of: 'de',
  for: 'para',
  done: 'Pronto',
  add: 'Adicionar',
  remove: 'Remover',
  search: 'Buscar',
  noResults: 'Sem resultados',
  empty: 'Ainda nao ha nada por aqui.',
  offline: 'Sem conexao',
  online: 'Conectado',
} as const;

export const ValidationMessages = {
  emailInvalid: 'O formato do email é inválido.',
  passwordRequired: 'A senha é obrigatória.',
  passwordTooShort: 'A senha deve ter pelo menos 8 caracteres.',
  ageTooYoung: 'Você deve ter pelo menos 13 anos para usar Vyra.',
  ageInvalid: 'A idade inserida é inválida.',
  weightTooLow: 'O peso mínimo é 20 kg.',
  weightInvalid: 'O peso inserido é inválido.',
  heightTooLow: 'A altura mínima é 50 cm.',
  heightInvalid: 'A altura inserida é inválida.',
  waterAmountTooHigh: 'A quantidade máxima é 5.000ml por registro.',
  waterGoalTooLow: 'A meta mínima é 500ml.',
  waterGoalTooHigh: 'A meta máxima é 10.000ml.',
  stepsGoalTooLow: 'A meta mínima é 1.000 passos.',
  stepsGoalTooHigh: 'A meta máxima é 100.000 passos.',
  foodAmountTooHigh: 'A quantidade máxima é 5.000g.',
  barcodeScanEmpty: 'O código escaneado está vazio.',
  barcodeTypeUnrecognized: 'Não conseguimos reconhecer o tipo de código.',
  barcodeProcessError: 'Erro ao processar o código.',
  emailAlreadyExists: 'Este email já está registrado. Você pode entrar com essa conta.',
  networkError: 'Não conseguimos conectar ao Vyra agora. Verifique sua conexão e tente novamente.',
  tempSessionError: 'Não conseguimos abrir uma sessão temporária agora. Tente novamente.',
  emailSendError: 'Não conseguimos enviar o email. Verifique o endereço.',
  accountDeleteSuccess: 'Sua solicitação foi processada e a sessão foi encerrada. A exclusão final segue nossa política.',
} as const;

export const FastingLabels = {
  activePhase: 'Jejum ativo',
  autophagy: 'Autofagia',
  deepFast: 'Jejum profundo',
  extendedFast: 'Jejum estendido',
  gentleEntry: 'Entrada suave para dias de baixa recuperação',
  omad: 'OMAD — uma refeição por dia',
  omadAlt: 'Uma refeição por dia (OMAD)',
  fastDay: 'Dia de restrição (protocolo 5:2)',
  hungryPhaseWarning: 'Nesta fase, a fome e fadiga geralmente aumentam. Um protocolo mais curto é recomendado esta semana.',
  consistencyTip: 'Seu padrão sugere que uma janela um pouco mais flexível pode melhorar a consistência semanal.',
  progressTip: 'Você está consistentemente aquém. Um protocolo intermediário pode consolidar o hábito.',
  readyProgress: 'Você completou vários jejuns 16:8 com margem. Você está pronto para progredir para 18:6.',
  autophagyCountdown: '45 minutos até autofagia. Você chegou até aqui, aguente firme.',
  fastingCancelled: 'Jejum cancelado. O próximo será melhor!',
  fast52Started: 'Jejum 5:2 iniciado de acordo com sua programação.',
  stayConsistent: 'Nesta fase, manter um protocolo estável é mais importante do que perseguir horas extras. 16:8 é uma boa base hoje.',
  focusConsistency: 'Mantenha o protocolo de hoje. Foque em consistência e quebra de jejum inteligente.',
  menstrualGuidance: 'Fase menstrual: use 12:12 ou 14:10 se o corpo pedir carga mais leve. Recuperação em primeiro lugar.',
  lutealGuidance: 'Fase lútea: 14:10 ou 16:8 geralmente funciona melhor com quebra de jejum mais simples.',
  ovulatoryGuidance: 'Fase ovulatória: boa tolerância para protocolos padrão se o sono for sólido.',
  cancelled: 'Jejum cancelado',
  // Phase descriptions
  fedPhase: 'Pós-refeição',
  fedPhaseDesc: 'Digerindo. Insulina elevada.',
  activePhaseDesc: 'Glicogênio começando a ser consumido.',
  ketosisPhase: 'Cetose inicial',
  ketosisPhaseDesc: 'Corpo começando a queimar gordura.',
  autophagyDesc: 'Reciclagem celular ativa. Benefícios máximos.',
  deepFastDesc: 'GH aumentando. Regeneração celular intensa.',
  extendedFastDesc: 'Modo de sobrevivência. Máxima sobrevivência celular.',
  // Protocol descriptions
  protocol12_12Desc: 'Entrada suave para dias de baixa recuperação',
  protocol14_10Desc: 'Passo intermediário para manter aderência',
  protocol16_8Desc: '16h jejum, 8h para comer — o mais popular',
  protocol18_6Desc: '18h jejum, 6h janela',
  protocol20_4Desc: 'Warrior Diet',
  protocol23_1Desc: 'OMAD — uma refeição por dia',
  protocolOMADDesc: 'Uma refeição por dia (OMAD)',
  protocol24hDesc: 'Jejum completo de 24 horas.',
  protocol5_2Desc: 'Dia de restrição (protocolo 5:2)',
  protocolCustomDesc: 'Personalizado',
} as const;

export const FemaleHealthLabels = {
  menstrual: 'Menstrual',
  follicular: 'Folicular',
  ovulation: 'Ovulação',
  luteal: 'Lútea',
  weightVariations: 'As variações de peso podem ser transitórias com base na fase do ciclo.',
  hydrationMenstrual: 'Hidratação extra durante a menstruação.',
  fastingMenstrual: 'Protocolo suave (12:12 ou 14:10).',
  sleepMenstrual: 'Priorize sono reparador.',
  trainingRecovery: 'Recuperação ativa, mobilidade ou força leve.',
  fastingFollicular: 'Boa tolerância para protocolos padrão (16:8).',
  nutritionFollicular: 'Aumente proteína e zinco para desempenho e recuperação.',
  trainingOvulation: 'Janela de alta energia: intensidade/força alta.',
  fastingOvulation: 'Pode sustentar 16:8 ou 18:6 com boa recuperação.',
  fastingLuteal: 'Fase lútea pode ser mais difícil; encurte o protocolo se aparecer fome alta.',
  nutritionLuteal: 'Aumente magnésio e carboidratos complexos para energia estável.',
  nextOvulationNotice: 'Amanhã você entra na janela ovulatória: preparando treinamento de alta intensidade.',
  menstruationNotice: 'Sua menstruação começa em breve. Esta semana priorize hidratação extra e recuperação.',
  cycleVariation: 'Seu ciclo varia mais de 7 dias entre períodos. Vale a pena discutir com ginecologista para avaliação.',
  needSupport: 'Você precisa de apoio',
  // Phase guidance (menstrual)
  menstrualTraining: 'Recuperação ativa, mobilidade ou força leve.',
  menstrualFasting: 'Priorize protocolos mais curtos (12-14h) ou tire um dia de descanso do jejum.',
  menstrualNutrition: 'Reforce ferro, ômega-3 e alimentos anti-inflamatórios.',
  menstrualWeightContext: 'Durante as fases menstrual/lútea é normal ver variações de 1-3kg pela retenção de líquidos.',
  // Phase guidance (follicular)
  follicularTraining: 'Boa fase para progredir carga e volume.',
  follicularFasting: 'Melhor tolerância para protocolos padrão (16:8).',
  follicularNutrition: 'Aumente proteína e zinco para desempenho e recuperação.',
  // Phase guidance (ovulation)
  ovulationTraining: 'Janela de alta energia: força e intensidade alta.',
  ovulationFasting: '16:8 ou 18:6 podem funcionar bem se a recuperação for sólida.',
  ovulationNutrition: 'Priorize antioxidantes e carboidratos de qualidade.',
  // Phase guidance (luteal)
  lutealTraining: 'Mantenha consistência com intensidade moderada.',
  lutealFasting: 'Fase lútea pode parecer mais difícil; encurte o protocolo se a fome aumentar.',
  lutealNutrition: 'Aumente magnésio e carboidratos complexos para energia mais estável.',
  lutealWeightContext: 'Na fase lútea é normal reter líquidos e ver aumentos temporários na balança.',
} as const;

export const WorkoutLabels = {
  freesession: 'Sessão livre',
  base: 'Base',
  building: 'Construção',
  consolidation: 'Consolidação',
  muscleGroupsFatigued: '${tired} grupos musculares têm carga alta recente.',
  lowerIntensity: 'Diminua a intensidade ou escolha uma sessão técnica para continuar adicionando sem quebrar o bloco.',
  controlledSession: 'Margem para treinar, mas uma sessão controlada renderá melhor.',
  recordSet: 'Novo recorde em ${exercise}: ${weight} kg',
} as const;

export const TabBarCopy = {
  quickLogHint: 'Abra o painel para registrar agua, peso, jejum ou sono.',
} as const;

export const BmiCategories = {
  underweight: 'Abaixo do peso',
  normal: 'Peso normal',
  overweight: 'Sobrepeso',
  obesity: 'Obesidade',
} as const;

export const ComponentMessages = {
  balanceCardNoData: 'VYRA Balance para hoje, dados insuficientes ainda',
  balanceNoData: 'Dados insuficientes ainda.',
  lastWeight: 'ultimo peso',
  noSession: 'sem sessao',
  seriesCount: 'series hoje',
  isotonic: 'Isotonica',
  tea: 'Cha',
  coffee: 'Cafe',
  workoutLogged: 'Sessao registrada',
  syncSlowWarning: 'Carregamento inicial demorou muito. Abrimos uma sessão utilizável e você pode repetir a sincronização sem fechar o app.',
  syncSlowWarning2: 'O carregamento inicial demorou mais que o esperado. Você pode entrar com segurança e repetir a sincronização pelo app.',
  autoSessionRecovery: 'Não conseguimos recuperar sua sessão automaticamente. Você pode tentar novamente sem fechar o app.',
  retrySyncPartial: 'Repetir sincronização parcial',
  retrySync: 'Repetir',
  maintenanceMessage: 'Se você estava usando agua, sono, peso, nutrição ou treino, seus dados locais ainda estao lá. Apenas aguardando o sistema voltar e alinhar o resto.',
  authCallbackError: 'O provedor não retornou dados de sessão válidos.',
  invalidSession: 'Nenhuma sessão ativa.',
  dailyLimitReached: 'Limite diário atingido',
  aiBrainResting: 'Meu cérebro IA está descansando.',
  systemPrompt: 'Responda em português, brevemente, praticamente e com segurança.',
} as const;

export const MentalLabels = {
  needSupport: 'Você precisa de apoio',
  emotionalTrend: 'Detectamos uma tendência emocional descendente. Hoje priorize recuperação e uma ação pequena.',
} as const;

export const ReadinessLabels = {
  noConnection: 'Sem conexão agora. Mostrando seu último estado disponível.',
  exceptional: 'Dia excepcional',
  veryGood: 'Muito bom dia',
} as const;

export const ReferralMessages = {
  noValidSession: 'Você precisa de uma sessão válida para abrir seus convites.',
  serviceUnavailable: 'Serviço de convites não está disponível agora. Tente novamente mais tarde.',
  notConfigured: 'Backend de convites não está configurado neste build.',
  loadFailed: 'Não conseguimos carregar seus convites.',
  noData: 'Convites respondeu sem dados úteis. Tente novamente em alguns segundos.',
  networkFailed: 'Não conseguimos nos conectar ao serviço de convites.',
  notAvailable: 'Convites não disponível neste build.',
  redeemFailed: 'Não conseguimos resgatar.',
} as const;

export const NotificationMessages = {
  routineReady: 'Sua rotina para hoje está pronta',
  movementBlockReady: 'Seu bloco de movimento está pronto',
  movementBlockCta: 'Abra Vyra e conclua um bloco curto hoje. Manter o ritmo é mais importante do que fazer perfeitamente.',
  routineStillOpen: 'Sua rotina ainda está aberta',
  routineStillOpenDesc: 'Você deixou ${name} aberta. Você pode voltar ou registrá-la rapidamente pela notificação.',
  recommendedRoutineReady: 'Sua rotina para hoje está pronta',
  recommendedRoutineDesc: '${name} se encaixa bem hoje. Abra-a ou registre-a sem desperdiçar tempo.',
  hydrationReminder: '💧 Hora de se hidratar',
  hydrationReminderDesc: '${name}, você ainda pode chegar perto de sua meta hoje.',
  streakAtRisk: '🔥 Sua sequência está em risco',
  streakAtRiskDesc: '${name}, faça 1 registro rápido hoje e mantenha-a viva.',
  hydrationSmartReminder: '💧 Lembrete inteligente',
  streakSmartReminder: '🔥 Sequência em risco',
} as const;

export const PrivacyTexts = {
  dataExample: 'Agua, passos, sono, peso, refeições, jejum, treinos e resumos diários.',
  healthDataReduction: 'Reduza o quanto é armazenado em claro sobre peso, saúde mental e saúde feminina.',
} as const;

export const ExplorePageStrings = {
  title: 'Plano',
  heroEyebrow: 'Objetivo ativo',
  heroBody: 'O plano já não funciona como uma segunda home: aqui você deveria ver seu caminho, seu bloco e o próximo passo útil.',
  loseFat: 'Perder gordura',
  gainMuscle: 'Ganhar músculo',
  performance: 'Desempenho',
  organizeHabits: 'Organizar hábitos',
  recovery: 'Recuperação',
  yourCurrentPath: 'Seu caminho atual',
  fallbackCoaching: 'Sustentar uma decisão bem escolhida nesta semana move mais a agulha do que abrir dez caminhos ao mesmo tempo.',
  recommended: 'Recomendados para você',
  coaching: 'Coaching contextual',
  weeklyPriority: 'Prioridade da semana',
  momentum: 'Desafios e momentum',
  streakLabel: 'sequência',
  sessionThisWeek: 'sessões na semana',
  usefulLibrary: 'Biblioteca útil',
  // Program section
  programTitle: 'Programa ativo',
  noneSelected: 'Ainda não há um programa escolhido',
  activeWeek: 'Semana {{week}}. O bloco já está rodando e a próxima decisão deveria sair daqui.',
  suggested: 'Não há um programa ativo, mas já existe uma rotina sugerida para começar com direção.',
  chooseRoute: 'O melhor agora é escolher uma rota guiada em vez de navegar o catálogo completo.',
  nextAction: 'Próxima ação',
  backToSession: 'Voltar à sessão',
  chooseProgram: 'Escolher programa',
  progress: 'Progresso',
  thisWeek: '{{sessions}}/{{goal}} esta semana',
  continueProgram: 'Seguir programa',
  // Cards
  nextFocusEyebrow: 'Próximo ajuste',
  nextFocusBody: 'A leitura contextual de hoje já encontrou o que mais vale empurrar primeiro.',
  workoutEyebrow: 'Treino',
  openCurrent: 'Abrir seu bloco atual',
  chooseGuided: 'Escolher um programa guiado',
  workoutOpenBody: 'Revise semanas, dias e continuidade de carga sem sair do caminho principal.',
  workoutChooseBody: 'Comece com uma rota clara em vez de navegar rotinas soltas sem prioridade.',
  nutritionEyebrow: 'Nutrição',
  nutritionTitle: 'Reset nutricional simples',
  nutritionBody: 'Um dia bem registrado vale mais do que uma planilha complexa que você não usa.',
  recoveryEyebrow: 'Recuperação',
  sleepTitle: 'Dormir melhor esta semana',
  sleepBody: 'Ajuste o descanso antes de pedir mais força e mais constância ao dia.',
  waterTitle: 'Rotina de hidratação',
  waterBody: 'Uma base simples de água e ritmo diário faz o resto do sistema render melhor.',
  libraryEyebrow: 'Biblioteca útil',
  plannerTitle: 'Plano semanal',
  plannerBody: 'Visualize a semana e prepare o próximo bloco sem abrir módulos demais.',
  mealTitle: 'Registrar uma refeição',
  mealBody: 'Volte ao básico e deixe o dia mais claro em dois passos.',
  sleepLibraryTitle: 'Ver descanso',
  sleepLibraryBody: 'Leia a última noite e ajuste a carga com mais critério.',
  progressTitle: 'Ler progresso real',
  progressBody: 'Se quiser mais contexto, aqui você vê tendência e não só registros soltos.',
  milestoneDone: 'A semana está bem encaminhada. Agora é sustentar a qualidade do bloco e não somar ruído.',
  milestonePending: 'Faltam {{count}} sessões para fechar sua meta semanal.',
} as const;

export const HomePageStrings = {
  locale: 'pt-BR',
  guestName: 'Usuario',
  quickActionHint: 'Abre este atalho rapido.',
  secondaryModuleHint: 'Abre este modulo secundario.',
  notificationFallbackTitle: 'Notificacao Vyra',
  notificationFallbackBody: 'Atividade recente disponivel.',
  greeting: 'Ola, {{name}}',
  streakPillLabel: 'Sequencia atual: {{days}} dias',
  streakPillHint: 'Abre progresso para ver sua constancia.',
  openNotifications: 'Abrir notificacoes recentes',
  openNotificationsHint: 'Mostra os controles de entrega e os avisos mais recentes.',
  openQuickLog: 'Abrir registro rapido',
  openQuickLogHint: 'Abre uma folha para registrar agua, sono, peso ou jejum sem sair do inicio.',
  openProfile: 'Abrir perfil',
  openProfileHint: 'Abre sua conta, modulos e ajustes.',
  activeWorkoutAccessibility: 'Sessao ativa, {{name}}, {{count}} exercicios em andamento',
  activeWorkoutEyebrow: 'Sessao ativa',
  activeWorkoutFallbackTitle: 'Treino em andamento',
  activeWorkoutMeta: '{{count}} exercicios em andamento neste dispositivo.',
  activeWorkoutCta: 'Voltar ao treino',
  nextStepEyebrow: 'Proximo passo',
  nextStepHint: 'Escolha o ajuste que mais move seu dia e resolva isso daqui.',
  planEyebrow: 'Hoje',
  planTitle: 'Plano do dia',
  planSummary: '{{done}} de {{total}} frentes ja estao cobertas.',
  planExpand: 'Ver plano completo',
  planCollapse: 'Mostrar menos',
  momentumEyebrow: 'Consistencia',
  streakEyebrow: 'Sequencia',
  streakStartToday: 'Comece sua sequencia hoje',
  streakRunning: '{{days}} dias em sequencia',
  streakDoneBody: 'Hoje ja conta. Uma acao pequena mantem sua continuidade viva.',
  streakPendingBody: 'Agua, passos, nutricao ou treino ja bastam para salvar o dia.',
  streakView: 'Ver sequencia e progresso',
  streakSave: 'Salvar minha sequencia agora',
  sectionsQuickActions: 'Acoes rapidas',
  sectionsThisWeek: 'Esta semana',
  weekDone: '{{day}}: dia concluido nesta semana',
  weekTodayPending: '{{day}}: hoje ainda pendente',
  weekPending: '{{day}}: sem concluir',
  weekSummary: '{{count}} de 7 dias nesta semana',
  pauseBody: 'Voce esta ha {{days}} dias sem registrar. Retome hoje com algo pequeno.',
  pauseCta: 'Retomar agora',
  pauseHint: 'Abre a acao sugerida para voltar a registrar atividade.',
  aiEyebrow: 'VYRA sugiere',
  notificationsTitle: 'Ultimas notificacoes',
  notificationsEmpty: 'Ainda nao ha atividade recente para mostrar aqui.',
  notificationsViewAll: 'Ver todas',
  notificationsAccessibility: 'Ver todas as notificacoes',
  notificationsHint: 'Abre os controles de entrega de notificacoes e as horas de silencio.',
} as const;

export const ProgressPageStrings = {
  sectionEnergy: 'Energia e peso',
  sectionEnergyHint: 'O que importa muda de acordo com o objetivo que você escolheu.',
  workoutSessions: 'sessões',
  sleepRecovered: 'Base sólida para sustentar carga normal hoje.',
  sleepRecovering: 'Você dormiu menos do ideal. Melhor modular intensidade.',
  muscleChest: 'Peito',
  muscleBack: 'Costas',
  muscleShoulders: 'Ombros',
  muscleArms: 'Braços',
  muscleCore: 'Core',
  muscleLegs: 'Pernas',
  caloriesEyebrow: 'Calorias de hoje',
  weightEyebrow: 'Peso e direção',
  viewPrograms: 'Ver programas',
  backHome: 'Voltar para home',
} as const;

export const WaterHydrationMessages = {
  goalReached: 'Meta encerrada. Manter este padrão simples é o que sustenta o módulo.',
  behindAndAfternoon: 'Já passou boa parte do dia. Dois registros seguidos agora mudam por completo o encerramento.',
  lowProgress: 'Ainda há margem para recuperar o ritmo sem adicionar complexidade.',
  onTrack: 'Você está indo bem. Manter pequenos copos espaçados é mais importante do que acumular tudo no final.',
} as const;

export const StepsProgressMessages = {
  goalMet: 'Você atingiu ou superou sua meta. {{totalSteps}} passos hoje.',
  almostThere: 'Quase lá. Você precisa de {{remaining}} passos a mais para atingir sua meta.',
  goodProgress: 'Você está indo bem. Já ganhou impulso para fechar o dia melhor.',
  justStarted: 'Bom começo. Continue somando.',
} as const;

export const HomeDetailStrings = {
  hero: {
    readiness: {
      eyebrow: 'Readiness',
      pending: 'Base de hoje',
      awaiting: 'Leitura em construcao',
      support: 'Sono, agua, comida e movimento deixam este score muito mais preciso.',
      noData: 'Ainda estamos montando sua leitura diaria. Registros uteis dao mais contexto.',
      weeklyAverage: 'Media',
      projected: 'Fechamento possivel',
      stability: 'Estabilidade',
      focus: 'Foco agora',
      cta: 'Ver detalhes',
    },
    fasting: {
      eyebrow: 'Jejum ativo',
      protocol: 'Protocolo {{protocol}}',
      eatingWindowOpen: 'Janela de comer aberta',
      accumulated: '{{hours}}h {{minutes}}m acumuladas.',
      close: 'Encerrar jejum',
      complete: 'Completar jejum',
    },
    female: {
      eyebrow: 'Ciclo',
      phaseDay: 'Fase {{phase}} · Dia {{day}}',
      prioritizeRecovery: 'Priorize recuperacao e regularidade',
      trainStrong: 'Bom dia para treinar forte',
      registerToday: 'Registrar hoje',
    },
    nutrition: {
      eyebrow: 'Nutricao',
      percentCalories: '{{pct}}% de calorias hoje',
      caloriesOf: '{{current}} de {{target}} kcal',
      cta: 'Registrar refeicao',
    },
    steps: {
      eyebrow: 'Passos',
      title: 'Meta de hoje',
      ofSteps: 'de {{goal}} passos',
      estimatedCalories: '{{kcal}} kcal estimadas.',
      cta: 'Ver detalhes',
    },
    sleep: {
      eyebrow: 'Sono',
      recovered: 'Base solida para sustentar uma carga normal hoje.',
      recovering: 'Voce dormiu menos do que o ideal. Vale modular a intensidade.',
      view: 'Ver sono',
      log: 'Registrar sono',
    },
    workoutRest: {
      eyebrow: 'Hoje · descanso',
      fallbackTitle: 'Recuperacao ativa',
      body: 'Hoje vale baixar a carga. Voce pode revisar a proxima sessao do bloco sem pressa.',
      cta: 'Ver amanha',
    },
    workout: {
      eyebrow: 'Hoje',
      activeFallback: 'Sessao em andamento',
      idleFallback: 'Treine hoje',
      prYesterday: 'PR ontem',
      activeMeta: '{{count}} exercicios · sessao aberta',
      routineMeta: '{{count}} exercicios · ~{{minutes}} min',
      emptyMeta: 'Ainda nao ha uma rotina pronta para hoje.',
      resume: 'Voltar ao treino',
      trainNow: 'Treinar agora',
    },
  },
  workoutProgram: {
    week: 'Semana {{week}} · {{day}}',
    progress: '{{pct}}% do bloco',
    todayRoutine: '{{day}} · rotina de hoje',
    nextSuggestion: '{{day}} · proxima sugestao',
    active: 'Sessao ativa',
    exercises: '{{count}} exercicios',
  },
  metrics: {
    waterGoal: '{{pct}}% da meta',
    sleepBelowGoal: 'Abaixo da meta',
    steps: '{{pct}}% · {{kcal}} kcal',
    noTrend: 'Tendencia ainda curta',
    weeklyTrend: '{{sign}}{{value}} esta semana',
  },
  quickActions: {
    logMeal: 'Registrar refeicao',
    addWater: 'Adicionar agua',
    resumeWorkout: 'Voltar ao treino',
    trainNow: 'Treinar agora',
    logSleep: 'Registrar sono',
    openQuickLog: 'Abrir registro rapido',
  },
} as const;
export const ForgotPasswordStrings = {
  title: 'Recupere seu acesso',
  subtitle: 'Digite seu email e enviaremos as instrucoes.',
  send: 'Enviar instrucoes',
  sendFailed: 'Nao conseguimos enviar o email. Verifique o endereco e tente novamente.',
  successTitle: 'Verifique sua caixa de entrada',
  successBody: 'Veja tambem o spam se nao aparecer.',
  resend: 'Reenviar',
  resendIn: (seconds: number) => `Reenviar em ${seconds}s`,
  resendA11y: (seconds: number) =>
    seconds > 0 ? `Reenviar em ${seconds} segundos` : 'Reenviar email',
  resendHint: 'Envie o email de recuperacao novamente.',
} as const;

export const FastingMetabolicZones = {
  fed: {
    label: 'Saciado',
    description: 'Digerindo e ainda com energia após sua última refeição.',
  },
  early: {
    label: 'Adaptando',
    description: 'A energia começa a cair e seu corpo muda de fonte de combustível.',
  },
  fat: {
    label: 'Queimador de gordura',
    description: 'Fica mais fácil usar gordura como seu combustível principal.',
  },
  ketosis: {
    label: 'Cetose',
    description: 'O sinal de cetose fica bem claro neste ponto.',
  },
  autophagy: {
    label: 'Autofagia',
    description: 'Janela avançada. Contexto e recuperação importam mais aqui.',
  },
} as const;

export const BiometricLabels = {
  promptMessage: 'Desbloquear Vyra',
  cancelLabel: 'Cancelar',
  fallbackLabel: 'Usar bloqueio do dispositivo',
  unlockButton: 'Desbloquear',
  verifyingButton: 'Verificando...',
  logoutHint: 'Fecha a sessao atual sem desbloquear o app.',
  accessibilityLabel: 'Desbloquear Vyra',
} as const;

export const FemaleSymptoms = {
  colicos: 'Colicas',
  hinchazon: 'Inchaço',
  fatiga: 'Fadiga',
  migrana: 'Enxaqueca',
  cambios_humor: 'Mudancas de humor',
  energia_alta: 'Energia alta',
} as const;

export const FemaleMoods = {
  '1': 'Baixo',
  '2': 'Serio',
  '3': 'Estavel',
  '4': 'Bom',
  '5': 'Excelente',
} as const;

export const SupplementUnitLabels = {
  mg: 'mg',
  g: 'g',
  ml: 'ml',
  caps: 'caps.',
  IU: 'UI',
  tablets: 'tabs.',
  scoops: 'scoops',
} as const;

export const SupplementFrequencyLabels = {
  daily: 'Diario',
  weekly: 'Semanal',
  as_needed: 'Conforme necessário',
} as const;

export const SupplementTimeSlots = {
  unscheduled: 'Sem horario definido',
  morning: 'Manha',
  afternoon: 'Tarde',
  evening: 'Noite',
} as const;

export const WorkoutDifficultyLevels = {
  high: 'Alto',
  medium: 'Medio',
  base: 'Base',
} as const;

export const NutritionModule = {
  headerEditPrefix: 'Editar',
  headerAddPrefix: 'Adicionar a',
  editingMode: {
    title: 'Editando entrada',
    description: 'Ajuste nome, gramas ou macros e salve a mudança sem remover a entrada original.',
  },
  logModes: {
    search: 'Buscar',
    photo: 'Foto',
    barcode: 'Código de barras',
    manual: 'Manual',
  },
  library: {
    title: 'Biblioteca rápida',
    description: 'Abra algo frequente ou recupere uma entrada recente antes de pesquisar.',
    tabs: {
      frequent: 'Frequentes',
      recent: 'Recentes',
    },
    itemA11y: (food: string) => `Usar ${food}`,
    itemHint: 'Carregue este alimento para confirmar quantidade e macros.',
    emptyFrequent: 'Nenhum alimento frequente ainda para esta refeição.',
    emptyRecent: 'Nenhum alimento recente para mostrar.',
  },
  search: {
    label: 'Buscar alimento',
    placeholder: 'Ex: arroz, iogurte, frango...',
    searching: 'Buscando alimentos...',
    libraryMatches: 'Já na sua biblioteca',
    libraryDescription: 'Antes de abrir uma lista longa, mostro primeiro os resultados que você já usou.',
    recentLabel: (timestamp: string) => `${timestamp}`,
    generalResults: 'Resultados gerais',
    resultsCount: (count: number) => {
      if (count >= 30) return `Mostrando os primeiros ${count} resultados. Se não encontrar o que procura, abra mais resultados ou use entrada manual.`;
      return `Encontrados ${count} resultado${count === 1 ? '' : 's'} para esta busca.`;
    },
    noResults: (query: string) => `Nenhum alimento encontrado para "${query}". Você pode tentar novamente ou carregá-lo manualmente.`,
    noResultsLibrary: (query: string) => `Nenhum resultado geral encontrado para "${query}". Se você usou antes, tem correspondências acima ou pode carregá-lo manualmente.`,
    loadManual: 'Carregar manualmente',
    moreResults: 'Ver mais resultados',
  },
  preview: {
    title: 'Confirmação',
    hint: 'Confirme macros e quantidade antes de adicionar.',
    macros: {
      kcal: 'Kcal',
      protein: 'Proteína',
      carbs: 'Carbos',
      fat: 'Gordura',
      fiber: 'Fibra',
    },
    quantityLabel: 'Quantidade',
    portionHint: '1 porção é estimada como 100g para esta confirmação.',
    addButton: (meal: string) => `Adicionar a ${meal}`,
  },
  photo: {
    title: 'Foto IA',
    description: 'Tire uma foto, revise o que VYRA detectou e ajuste porções antes de confirmar.',
    takePhoto: 'Tirar foto',
    chooseGallery: 'Escolher da galeria',
    detection: 'Isto é o que a IA detectou',
    confidence: (percent: number) => `confiança ${Math.round(percent * 100)}%`,
    lowConfidence: 'Detecção com baixa confiança. Revise ou mude para busca manual.',
    itemsSelected: (count: number) => `${count} item${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}.`,
    selectAtLeast: 'Marque pelo menos um item para confirmar.',
    confirmDetection: 'Confirmar detecção',
    manualSearch: 'Buscar manualmente',
    togglePortions: {
      show: 'Ajustar porções',
      hide: 'Ocultar ajuste de porções',
    },
    estimated: (grams: number) => `${Math.round(grams)}g estimado`,
    noQuantity: 'Nenhuma quantidade estimada',
    componentIncludeA11y: (name: string) => `Incluir ${name}`,
    cameraMissingPermission: 'Permissão de câmera necessária.',
    galleryMissingPermission: 'Permissão de galeria necessária.',
  },
  manual: {
    title: 'Entrada manual',
    nameLabel: 'Nome',
    namePlaceholder: 'Ex: arroz com frango',
    quantityLabel: 'Quantidade',
    quantityUnit: 'g',
    proteinLabel: 'Proteína',
    proteinUnit: 'g',
    carbsLabel: 'Carbos',
    carbsUnit: 'g',
    fatLabel: 'Gorduras',
    fatUnit: 'g',
    fiberLabel: 'Fibra',
    fiberUnit: 'g',
    submitEdit: 'Salvar mudanças',
    submitAdd: (meal: string) => `Adicionar a ${meal}`,
  },
  errors: {
    loadingFood: 'Carregando alimento...',
  },
  modeA11y: (mode: string) => `Modo ${mode === 'search' ? 'pesquisa' : mode === 'photo' ? 'foto' : mode === 'barcode' ? 'código' : 'manual'}`,
  unitA11y: (unit: string) => `Unidade ${unit}`,
  quickAmountA11y: (value: number) => `Quantidade rápida ${value} gramas`,
  portionAdjustmentNote: 'Ajustamos as porções com base nos itens que você marcou antes de confirmar.',
} as const;

export const FemaleModule = {
  header: {
    title: 'Configurações do ciclo',
    subtitle: 'Módulo, privacidade e continuidade do rastreamento.',
  },
  disclaimer: {
    title: 'Aviso médico pendente',
    body: 'É bom confirmar antes de usar o módulo como referência diária.',
    confirm: 'Confirmar aviso',
  },
  errorCard: {
    title: 'Não conseguimos salvar essa mudança',
  },
  moduleSection: {
    eyebrow: 'Módulo',
    title: 'Rastreamento sensível e opcional',
    subtitle: 'Se você habilitar, VYRA pode ajustar o contexto de treinamento, nutrição e recuperação com base na sua fase.',
    toggleLabel: 'Módulo ativo',
    toggleDescription: 'Ative ou desative a leitura do ciclo sem sair das suas configurações.',
  },
  cycleData: {
    eyebrow: 'Dados base',
    title: 'Resumo do ciclo',
    subtitle: 'Leitura principal aqui em linhas claras e edição em tela dedicada.',
    lastPeriod: 'Último período',
    unconfigured: 'Não configurado',
    cycleDuration: 'Duração do ciclo',
    daysLabel: 'dias',
    periodDuration: 'Duração menstrual',
    nextPeriod: 'Próximo período',
    editLink: 'Editar dados do ciclo',
    editDescription: 'Abra a configuração base do módulo para registrar datas, duração e contexto.',
  },
  errors: {
    saveFailed: 'Não consegui salvar essa configuração agora. Tente novamente em alguns segundos.',
    configSaveFailed: 'Não consegui salvar a configuração do ciclo.',
  },
} as const;

export const FastingModule = {
  header: {
    title: 'Jejum intermitente',
  },
  controls: {
    adjustTime: '⏱  Ajustar hora de início',
    cancelAdjust: '✕  Cancelar ajuste',
    adjustHint: 'A hora atual será usada se você cancelar',
    adjustSubHint: 'Se você já começou antes ou vai começar depois',
    adjustTitle: 'Que horas você começou (ou vai começar)?',
    reduceOffset: 'Subtrair 15 minutos',
    increaseOffset: 'Adicionar 15 minutos',
    offsetHint: 'Cada toque move 15 minutos · até 12h para trás ou 4h adiante',
    now: 'Agora',
  },
  timer: {
    remaining: 'restantes',
    elapsedPct: (elapsed: string, pct: number) => `${elapsed} completas · ${Math.round(pct)}%`,
    backgroundActive: 'O cronômetro continua ativo em segundo plano.',
    endPredictionSameDay: (time: string) => `Termina às ${time}`,
    endPredictionDiffDay: (time: string, date: string) => `Termina às ${time} · ${date}`,
    zones: 'Zonas metabólicas',
  },
  states: {
    activeBadge: 'Jejum ativo',
    completeBadge: 'Jejum completo',
    completeEmoji: '🎉',
    completeTitle: 'Você conseguiu!',
    completeMeta: (protocol: string, elapsed: string) => `${protocol} · ${elapsed} completas`,
  },
  suggestion: {
    title: 'Hoje sugere',
  },
  buttons: {
    startFast: (protocol: string, timeLabel?: string) => 
      timeLabel ? `Iniciar ${protocol} · ${timeLabel}` : `Iniciar ${protocol}`,
    completeFast: 'Completar jejum',
    finishAndClose: 'Registrar e fechar',
    earlyFinish: 'Terminar cedo',
    continueEarlyFinish: 'Continuar jejuando',
    partialFinish: 'Terminar parcial',
  },
  stats: {
    completedLabel: 'Completos',
    avgLabel: 'Média',
    longestLabel: 'Mais longo',
    completedMeta: (avg: number, longest: number) => `Média ${avg.toFixed(1)}h · melhor ${longest.toFixed(1)}h`,
    noFasts: 'Ainda não há jejuns completos.',
  },
  history: {
    title: 'Jejuns recentes',
    missed: 'Perdido',
    pending: 'Pendente',
    completed: '✓',
    deleteBtn: 'Deletar',
    deleteA11y: (protocol: string) => `Deletar jejum ${protocol}`,
    emptyEmoji: '🌙',
    emptyTitle: 'Nenhum jejum registrado ainda.',
    emptyHint: 'Complete seu primeiro jejum para ver o histórico aqui.',
  },
  fiveTwo: {
    header: '📅 Hoje é seu dia 5:2',
    status: 'Pendente',
    desc: (protocol: string, hours: number, time?: string) => 
      time ? `Protocolo: ${protocol} · Objetivo: ${hours}h · Agendado: ${time}` : `Protocolo: ${protocol} · Objetivo: ${hours}h`,
    button: 'Iniciar jejum 5:2 hoje',
    week: 'Esta semana · 5:2',
    weekMeta: (completed: number, target: number) => `${completed}/${target} dias completos`,
  },
  modals: {
    zoneDetail: {
      startHint: (hours: number) => `Esta zona começa em ${hours}h de jejum.`,
      close: 'Fechar',
    },
    deleteConfirm: {
      title: 'Deletar jejum',
      body: 'Deletar este jejum? Esta ação não pode ser desfeita.',
      confirm: 'Deletar',
    },
    earlyFinish: {
      title: 'Terminar cedo?',
      percentComplete: (pct: number) => `${Math.round(pct)}%`,
      label: 'completo',
      context: (elapsed: string) => `Você está ${elapsed} do objetivo. Será registrado como parcial.`,
    },
  },
  contextCard: {
    female: 'Contexto feminino',
  },
  offsetLabel: {
    now: (time: string) => `Agora · ${time}`,
    past: (duration: string, time: string, dayLabel?: string) => `Há ${duration}${dayLabel ? ` · ${dayLabel}` : ''} · ${time}`,
    future: (duration: string, time: string) => `Em ${duration} · ${time}`,
  },
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Configurações',
    title: 'Água',
  },
  dailyGoal: {
    title: 'Meta diária',
    description: 'Escolha uma base realista e deixe o app ajustá-la de acordo com o contexto.',
    presets: {
      low: 'Atividade baixa',
      moderate: 'Moderada',
      recommended: 'Recomendada',
      athlete: 'Atletas',
      hotClimate: 'Clima quente',
    },
    customLabel: 'Meta personalizada',
    customHint: 'Entre 500ml e 10.000ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Ajuste',
    body: 'VYRA pode aumentar sua meta se fizer calor, se estiver jejuando ou se o dia for muito ativo.',
  },
  containers: {
    title: 'Objetos rápidos',
    description: 'Configure uma vez quanto há em seus recipientes reais.',
    resetLabel: 'Restaurar',
    resetA11y: 'Restaurar tamanhos padrão',
    glass: 'Um copo',
    largeGlass: 'Copo grande',
    bottle: 'Garrafa',
  },
  warningCard: {
    eyebrow: 'Aviso',
    body: 'Os lembretes vivem em notificações gerais. Daqui você só ajusta a parte operacional.',
  },
  buttons: {
    openNotifications: 'Abrir notificações',
    changeUnits: 'Alterar unidades',
    save: 'Salvar configurações',
  },
} as const;
