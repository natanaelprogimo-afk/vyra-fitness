export const ErrorMessages = {
  noInternet: 'Sin señal por aquí. Sigue registrando y sincronizo cuando vuelva la conexión.',
  aiUnavailable: 'La capa IA no está disponible ahora mismo. Intenta de nuevo en unos minutos.',
  saveFailed: 'No pude guardar ahora. Tus datos quedan seguros y volveré a intentar.',
  barcodeNotFound: 'No encontré ese código. Puedes buscar el alimento o ingresarlo manualmente.',
  paymentError: 'No pude completar esta accion. No se aplicaron cambios.',
  photoAIFailed: 'No pude leer bien esa comida. Prueba con otra foto o ingrésala manualmente.',
  voiceLogFailed: 'No pude entender ese registro de voz. Prueba otra vez o ingrésalo manualmente.',
  loginFailed: 'No pude iniciar sesión. Revisa tus datos e intenta de nuevo.',
  registerFailed: 'No pude crear tu cuenta. Intenta otra vez.',
  sessionExpired: 'Tu sesión venció. Inicia sesión otra vez para continuar.',
  premiumRequired: 'Esta funcion ya esta disponible en tu acceso actual.',
  generic: 'Algo salió mal. Intenta de nuevo en un momento.',
  loadFailed: 'No pude cargar los datos. Desliza para intentar de nuevo.',
  syncFailed: 'No pude sincronizar. Tus datos siguen guardados localmente.',
  permissionDenied: 'Necesito tu permiso para continuar. Puedes cambiarlo en Configuración.',
} as const;

export const AuthStrings = {
  welcome: {
    title: 'Entrena hoy.',
    subtitle: 'Sin excusas.',
    cta: 'Empezar gratis',
    login: 'Ya tengo cuenta',
    legal: 'Al continuar, aceptas nuestros términos.',
  },
  login: {
    title: 'Bienvenido de vuelta',
    email: 'Email',
    password: 'Contraseña',
    cta: 'Entrar',
    forgot: 'Olvidé mi contraseña',
    noAccount: 'No tengo cuenta',
    register: 'Crear cuenta',
  },
  register: {
    title: 'Crear cuenta',
    name: 'Tu nombre',
    email: 'Email',
    password: 'Contraseña (mínimo 8 caracteres)',
    cta: 'Crear mi cuenta',
    haveAccount: 'Ya tengo cuenta',
    login: 'Iniciar sesión',
    tosLabel: 'Acepto los',
    tos: 'Términos de Servicio',
    and: 'y la',
    privacy: 'Política de Privacidad',
    healthConsent: 'Consiento que Vyra procese mis datos de salud para personalizar mi experiencia.',
    medicalDisclaimer:
      'Entiendo que Vyra no es un dispositivo médico y no reemplaza la evaluación profesional.',
  },
  medicalModal: {
    title: 'Antes de empezar',
    body:
      'Vyra es una app de bienestar y fitness. No es un dispositivo médico certificado y no reemplaza la consulta, el diagnóstico ni el tratamiento profesional.',
    cta: 'Entendido, continuar',
  },
} as const;

export const OnboardingStrings = {
  step1: {
    title: '¿Cuál es tu objetivo principal?',
    subtitle: 'Lo usamos para preparar una experiencia inicial coherente.',
    goals: {
      lose_fat: 'Perder grasa',
      gain_muscle: 'Ganar músculo',
      general_health: 'Salud general',
      sport_performance: 'Rendimiento deportivo',
      mental_wellbeing: 'Bienestar general',
    },
  },
  step2: {
    title: '¿Dónde entrenas?',
    subtitle: 'Así filtramos el tipo de rutina y ejercicios.',
    gender: {
      label: 'Sexo biológico',
      male: 'Masculino',
      female: 'Femenino',
      non_binary: 'No binario',
      prefer_not_to_say: 'Prefiero no decirlo',
    },
    age: 'Edad',
    height: 'Altura (cm)',
    weight: 'Peso actual (kg)',
    goalWeight: 'Peso objetivo (kg, opcional)',
  },
  step3: {
    title: '¿Cuál es tu foco principal?',
    subtitle: 'Elige el módulo principal y luego añade apoyo si quieres.',
    levels: {
      0: 'Muy bajo',
      1: 'Bajo',
      2: 'Moderado',
      3: 'Activo',
      4: 'Muy activo',
      5: 'Atleta',
    },
    equipment: {
      label: 'Equipo disponible',
      gym: 'Gimnasio completo',
      home: 'Casa con material básico',
      both: 'Ambos',
      outside: 'Aire libre',
      none: 'Sin material',
    },
  },
  step4: {
    title: 'Todo listo',
    subtitle: 'Te dejamos la primera acción preparada para hoy.',
    wakeTime: 'Hora de despertar',
    sleepTime: 'Hora de sueño',
    fasting: {
      label: 'Ayuno intermitente',
      yes: 'Sí',
      no: 'No',
    },
    protocol: 'Protocolo',
  },
  step5: {
    title: 'Todo incluido',
    subtitle: 'Funciones avanzadas y acceso incluido desde el primer dia.',
    features: {
      aiCoach: 'IA contextual',
      photoLog: 'Registro por foto',
      voiceLog: 'Registro por voz',
      unlimitedHistory: 'Historial ampliado',
      correlations: 'Más contexto y correlaciones',
      noAds: 'Acceso abierto desde el primer dia',
    },
    monthly: 'Acceso inmediato',
    yearly: 'Todo abierto',
    yearlyNote: 'Sin desbloqueos',
    trialCta: 'Entrar a Vyra',
    freeCta: 'Continuar',
    freeNote: 'El producto ya esta abierto y listo para usar.',
  },
  next: 'Siguiente',
  back: 'Atrás',
  skip: 'Omitir',
  finish: 'Empezar',
  step: 'Paso',
  of: 'de',
} as const;

export const DashboardStrings = {
  greeting: {
    morning: 'Buenos días',
    afternoon: 'Buenas tardes',
    evening: 'Buenas noches',
  },
  dailyScore: 'Señal del día',
  streak: 'días de racha',
  bestStreak: 'mejor racha',
  checkIn: 'Registro del día',
  checkInDone: 'Registro hecho',
  quickActions: 'Registros rápidos',
  todayMissions: 'Esta semana',
  aiInsight: 'Contexto de hoy:',
  noInsight: 'Completa tu primer registro para recibir contexto.',
} as const;

export const ModuleNames = {
  water: 'Agua',
  steps: 'Pasos',
  fasting: 'Ayuno',
  sleep: 'Sueño',
  nutrition: 'Nutrición',
  weight: 'Peso',
  workout: 'Entrenamiento',
  mental: 'Bienestar',
  female: 'Salud femenina',
  supplements: 'Suplementos',
  recovery: 'Recuperación',
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
  context: 'La IA contextual de Vyra ofrece orientación general y no reemplaza la atención profesional.',
  supplements:
    'Vyra no recomienda dosis ni combinaciones de suplementos. Consulta con un profesional de salud.',
  bmi: 'IMC y grasa corporal son estimaciones. No son diagnóstico médico.',
  cycle: 'La predicción del ciclo es estimativa. No debe usarse como método anticonceptivo.',
  fasting24h:
    'El ayuno prolongado no es apto para todas las personas. Consulta con un profesional si tienes dudas.',
  deficitHigh:
    'Un déficit calórico agresivo puede ser perjudicial a largo plazo. Consulta con un nutricionista.',
} as const;

export const NotificationStrings = {
  waterReminder: (ml: number, goal: number) => `Llevas ${ml} ml de ${goal} ml. ¿Sumamos un vaso?`,
  stepsReminder: (steps: number, goal: number) =>
    `Llevas ${steps.toLocaleString()} de ${goal.toLocaleString()} pasos.`,
  streakDanger: (days: number) =>
    `Tu racha de ${days} días está en riesgo. Una acción corta hoy la mantiene viva.`,
  fastingPhase: (phase: string) => `Entraste en ${phase}. Tu ayuno sigue bien.`,
  goalReached: (goal: string) => `Meta de ${goal} alcanzada.`,
  prAchieved: (exercise: string, weight: number) => `Nuevo récord: ${weight} kg en ${exercise}.`,
} as const;

export const General = {
  save: 'Guardar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  delete: 'Eliminar',
  edit: 'Editar',
  close: 'Cerrar',
  back: 'Volver',
  continue: 'Continuar',
  retry: 'Intentar de nuevo',
  loading: 'Cargando...',
  syncing: 'Sincronizando...',
  today: 'Hoy',
  yesterday: 'Ayer',
  week: 'Semana',
  month: 'Mes',
  all: 'Todo',
  free: 'Gratis',
  premium: 'Incluido',
  upgrade: 'Ver acceso',
  history: 'Historial',
  settings: 'Configuración',
  profile: 'Perfil',
  logout: 'Cerrar sesión',
  or: 'o',
  and: 'y',
  of: 'de',
  for: 'para',
  done: 'Listo',
  add: 'Agregar',
  remove: 'Quitar',
  search: 'Buscar',
  noResults: 'Sin resultados',
  empty: 'Todavía no hay nada por aquí.',
  offline: 'Sin conexión',
  online: 'Conectado',
} as const;
