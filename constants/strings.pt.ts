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
    title: 'Treine hoje.',
    subtitle: 'Sem desculpas.',
    cta: 'Comecar gratis',
    login: 'Ja tenho conta',
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
    title: 'Tudo incluido',
    subtitle: 'Funcoes avancadas com acesso incluido desde o primeiro dia.',
    features: {
      aiCoach: 'IA contextual',
      photoLog: 'Registro por foto',
      voiceLog: 'Registro por voz',
      unlimitedHistory: 'Historico ampliado',
      correlations: 'Mais contexto e correlacoes',
      noAds: 'Acesso aberto desde o primeiro dia',
    },
    monthly: 'Acesso imediato',
    yearly: 'Tudo aberto',
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
