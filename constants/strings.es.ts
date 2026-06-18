export { ShellStrings } from './strings.shell.es';

export const ErrorMessages = {
  noInternet: 'Sin señal por aquí. Sigue registrando y sincronizo cuando vuelva la conexión.',
  aiUnavailable: 'La capa IA no está disponible ahora mismo. Intenta de nuevo en unos minutos.',
  saveFailed: 'No pude guardar ahora. Tus datos quedan seguros y volveré a intentar.',
  barcodeNotFound: 'No encontré ese código. Puedes buscar el alimento o ingresarlo manualmente.',
  paymentError: 'No pude completar esta acción. No se aplicaron cambios.',
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
    title: 'Tu fitness, claro desde hoy.',
    subtitle: 'Entreno, comidas, agua, sueño y progreso en una sola app.',
    cta: 'Crear cuenta gratis',
    login: 'Entrar a mi cuenta',
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
    title: 'Acceso abierto',
    subtitle: 'Funciones avanzadas listas desde el primer día.',
    features: {
      aiCoach: 'IA contextual',
      photoLog: 'Registro por foto',
      voiceLog: 'Registro por voz',
      unlimitedHistory: 'Historial ampliado',
      correlations: 'Más contexto y correlaciones',
      noAds: 'Acceso abierto desde el primer día',
    },
    monthly: 'Acceso abierto',
    yearly: 'Todo listo',
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
  streak: (days: number) => `${days} ${days === 1 ? 'día' : 'días'} de racha`,
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

export const ValidationMessages = {
  emailInvalid: 'El email no tiene un formato válido.',
  passwordRequired: 'La contraseña es obligatoria.',
  passwordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
  ageTooYoung: 'Debés tener al menos 13 años para usar Vyra.',
  ageInvalid: 'La edad ingresada no es válida.',
  weightTooLow: 'El peso mínimo es 20 kg.',
  weightInvalid: 'El peso ingresado no es válido.',
  heightTooLow: 'La altura mínima es 50 cm.',
  heightInvalid: 'La altura ingresada no es válida.',
  waterAmountTooHigh: 'La cantidad máxima es 5.000ml por registro.',
  waterGoalTooLow: 'La meta mínima es 500ml.',
  waterGoalTooHigh: 'La meta máxima es 10.000ml.',
  stepsGoalTooLow: 'La meta mínima es 1.000 pasos.',
  stepsGoalTooHigh: 'La meta máxima es 100.000 pasos.',
  foodAmountTooHigh: 'La cantidad máxima es 5.000g.',
  barcodeScanEmpty: 'El código escaneado está vacío.',
  barcodeTypeUnrecognized: 'No pudimos reconocer el tipo de código.',
  barcodeProcessError: 'Error al procesar el código.',
  emailAlreadyExists: 'Este email ya está registrado. Puedes iniciar sesión con esa cuenta.',
  networkError: 'No pudimos conectar con Vyra ahora mismo. Revisa tu conexión e intenta otra vez.',
  tempSessionError: 'No pudimos abrir una sesión temporal ahora mismo. Intenta otra vez.',
  emailSendError: 'No pudimos enviar el email. Verifica la dirección.',
  accountDeleteSuccess: 'Tu solicitud se procesó y cerramos la sesión. El borrado final sigue la política vigente.',
} as const;

export const FastingLabels = {
  activePhase: 'Ayuno activo',
  autophagy: 'Autofagia',
  deepFast: 'Ayuno profundo',
  extendedFast: 'Ayuno extendido',
  gentleEntry: 'Entrada suave para días de baja recuperación',
  omad: 'OMAD — una comida al día',
  omadAlt: 'Una comida al día (OMAD)',
  fastDay: 'Día de restricción (5:2 protocol)',
  hungryPhaseWarning: 'En esta fase suele aumentar hambre y fatiga. Te conviene un protocolo más corto esta semana.',
  consistencyTip: 'Tu patron sugiere que una ventana un poco más flexible puede mejorar continuidad semanal.',
  progressTip: 'Estás quedándote corto de forma repetida. Un protocolo intermedio puede consolidar el hábito.',
  readyProgress: 'Completaste varios 16:8 con margen. Ya estás listo para progresar a 18:6.',
  autophagyCountdown: 'Faltan 45 min para autofagia. Ya llegaste hasta aca, aguanta un poco más.',
  fastingCancelled: 'Ayuno cancelado. ¡El próximo va mejor!',
  fast52Started: 'Ayuno 5:2 iniciado según tu horario.',
  stayConsistent: 'En esta fase vale más sostener un protocolo estable que perseguir horas extra. 16:8 es una buena base hoy.',
  focusConsistency: 'Mantené el protocolo actual hoy. Enfócate en consistencia y ruptura de ayuno inteligente.',
  menstrualGuidance: 'Fase menstrual: usa 12:12 o 14:10 si el cuerpo pide bajar carga. Recuperación primero.',
  lutealGuidance: 'Fase lutea: suele funcionar mejor 14:10 o 16:8 con una ruptura de ayuno más simple.',
  ovulatoryGuidance: 'Fase ovulatoria: suele haber buena tolerancia a protocolos estándar si dormis bien.',
  cancelled: 'Ayuno cancelado',
  // Phase descriptions
  fedPhase: 'Post-comida',
  fedPhaseDesc: 'Digiriendo. Insulina elevada.',
  activePhaseDesc: 'Glucógeno empezando a consumirse.',
  ketosisPhase: 'Cetosis inicial',
  ketosisPhaseDesc: 'El cuerpo empieza a quemar grasa.',
  autophagyDesc: 'Reciclaje celular activo. Beneficios máximos.',
  deepFastDesc: 'HGH aumentando. Regeneración celular intensa.',
  extendedFastDesc: 'Modo de supervivencia. Supervivencia celular máxima.',
  // Protocol descriptions
  protocol12_12Desc: 'Entrada suave para días de baja recuperación',
  protocol14_10Desc: 'Paso intermedio para sostener adherencia',
  protocol16_8Desc: '16h ayuno, 8h para comer — el más popular',
  protocol18_6Desc: '18h ayuno, 6h ventana',
  protocol20_4Desc: 'Warrior Diet',
  protocol23_1Desc: 'OMAD — una comida al día',
  protocolOMADDesc: 'Una comida al día (OMAD)',
  protocol24hDesc: 'Ayuno completo de 24 horas.',
  protocol5_2Desc: 'Día de restricción (5:2 protocol)',
  protocolCustomDesc: 'Personalizado',
} as const;

export const FemaleHealthLabels = {
  menstrual: 'Menstrual',
  follicular: 'Folicular',
  ovulation: 'Ovulacion',
  luteal: 'Lutea',
  weightVariations: 'Las variaciones de peso pueden ser transitorias según la fase.',
  hydrationMenstrual: 'Hidratación extra durante menstruación.',
  fastingMenstrual: 'Protocolo suave (12:12 o 14:10).',
  sleepMenstrual: 'Prioriza sueño reparador.',
  trainingRecovery: 'Recuperación activa, movilidad o fuerza liviana.',
  fastingFollicular: 'Mayor tolerancia a protocolos estándar (16:8).',
  nutritionFollicular: 'Sube proteína y zinc para rendimiento y recuperación.',
  trainingOvulation: 'Ventana de alta energía: fuerza/intensidad alta.',
  fastingOvulation: 'Puede sostenerse 16:8 o 18:6 si hay buena recuperación.',
  fastingLuteal: 'En lutea puede costar más; acorta protocolo si aparece hambre alta.',
  nutritionLuteal: 'Aumenta magnesio y carbos complejos para energía estable.',
  nextOvulationNotice: 'Mañana entrás en ventana ovulatoria: preparamos entrenamiento de intensidad alta.',
  menstruationNotice: 'Tu menstruacion empieza pronto. Está semana prioriza hidratación extra y recuperación.',
  cycleVariation: 'Tu ciclo viene variando más de 7 días entre periodos. Conviene comentarlo con ginecologia para evaluacion.',
  needSupport: 'Necesitás apoyo',
  // Phase guidance (menstrual)
  menstrualTraining: 'Recuperación activa, movilidad o fuerza liviana.',
  menstrualFasting: 'Prioriza protocolos cortos (12-14h) o descanso de ayuno.',
  menstrualNutrition: 'Refuerza hierro, omega-3 y alimentos antiinflamatorios.',
  menstrualWeightContext: 'En fase menstrual/lutea puede haber variaciones de 1-3kg por liquidos.',
  // Phase guidance (follicular)
  follicularTraining: 'Buena fase para progresar carga y volumen.',
  follicularFasting: 'Mayor tolerancia a protocolos estándar (16:8).',
  follicularNutrition: 'Sube proteína y zinc para rendimiento y recuperación.',
  // Phase guidance (ovulation)
  ovulationTraining: 'Ventana de alta energía: fuerza/intensidad alta.',
  ovulationFasting: 'Puede sostenerse 16:8 o 18:6 si hay buena recuperación.',
  ovulationNutrition: 'Prioriza antioxidantes y carbos de calidad.',
  // Phase guidance (luteal)
  lutealTraining: 'Mantener consistencia con intensidad moderada.',
  lutealFasting: 'En lutea puede costar más; acorta protocolo si aparece hambre alta.',
  lutealNutrition: 'Aumenta magnesio y carbos complejos para energía estable.',
  lutealWeightContext: 'En fase lutea es normal retener liquidos y ver subidas transitorias.',
} as const;

export const WorkoutLabels = {
  freesession: 'Sesión libre',
  base: 'Base',
  building: 'Construcción',
  consolidation: 'Consolidación',
  muscleGroupsFatigued: 'Hay ${tired} grupos musculares con carga alta reciente.',
  lowerIntensity: 'Conviene bajar intensidad o elegir una sesión técnica para seguir sumando sin romper el bloque.',
  controlledSession: 'Hay margen para entrenar, pero con una sesión controlada te va a rendir más.',
  recordSet: 'Nuevo récord en ${exercise}: ${weight} kg',
} as const;

export const TabBarCopy = {
  quickLogHint: 'Abre el panel para registrar agua, peso, ayuno o sueño.',
} as const;

export const BmiCategories = {
  underweight: 'Bajo peso',
  normal: 'Peso normal',
  overweight: 'Sobrepeso',
  obesity: 'Obesidad',
} as const;

export const ComponentMessages = {
  balanceCardNoData: 'VYRA Balance de hoy, sin datos suficientes todavia',
  balanceNoData: 'Sin datos suficientes todavía.',
  lastWeight: 'último peso',
  noSession: 'sin sesión',
  seriesCount: 'series hoy',
  isotonic: 'Isotónica',
  tea: 'Té',
  coffee: 'Café',
  workoutLogged: 'Sesión registrada',
  syncSlowWarning: 'La carga inicial tardó demasiado. Abrimos una sesión usable y puedes reintentar la sincronización sin cerrar la app.',
  syncSlowWarning2: 'La carga inicial tardó más de lo esperado. Puedes entrar de forma segura y reintentar la sincronización desde la app.',
  autoSessionRecovery: 'No pudimos recuperar tu sesión automáticamente. Puedes reintentar sin cerrar la app.',
  retrySyncPartial: 'Reintentar sincronizacion parcial',
  retrySync: 'Reintentar',
  maintenanceMessage: 'Si estabas usando agua, sueño, peso, nutrición o workout, lo local sigue ahí. Solo falta que el sistema vuelva y termine de alinear el resto.',
  authCallbackError: 'El proveedor no devolvió datos de sesión válidos.',
  invalidSession: 'No hay sesión activa.',
  dailyLimitReached: 'Limite diario alcanzado',
  aiBrainResting: 'Mi cerebro IA está tomando un descanso.',
  systemPrompt: 'Responder en español, de forma breve, práctica y segura.',
} as const;

export const MentalLabels = {
  needSupport: 'Necesitás apoyo',
  emotionalTrend: 'Detectamos una tendencia emocional descendente. Hoy priorizá recuperación y una acción pequeña.',
} as const;

export const ReadinessLabels = {
  noConnection: 'Sin conexión por ahora. Mostramos tu último estado disponible.',
  exceptional: 'Día excepcional',
  veryGood: 'Muy buen día',
} as const;

export const ReferralMessages = {
  noValidSession: 'Necesitas una sesion valida para abrir tus invitaciones.',
  serviceUnavailable: 'El servicio de invitaciones no esta disponible ahora mismo. Reintenta mas tarde.',
  notConfigured: 'El backend de invitaciones no esta configurado en este build.',
  loadFailed: 'No pudimos cargar tus invitaciones.',
  noData: 'Invitaciones respondio sin datos utiles. Reintenta en unos segundos.',
  networkFailed: 'No pudimos conectarnos al servicio de invitaciones.',
  notAvailable: 'Invitaciones no esta disponible en este build.',
  redeemFailed: 'No se pudo canjear.',
} as const;

export const NotificationMessages = {
  routineReady: 'Tu rutina de hoy está lista',
  movementBlockReady: 'Tu bloque de movimiento está listo',
  movementBlockCta: 'Abre Vyra y deja un bloque corto hecho hoy. Mantener el ritmo vale más que hacerlo perfecto.',
  routineStillOpen: 'Tu rutina sigue abierta',
  routineStillOpenDesc: 'Te quedó ${name}. Puedes volver o marcarla rápido desde la notificacion.',
  recommendedRoutineReady: 'Tu rutina de hoy está lista',
  recommendedRoutineDesc: '${name} encaja bien hoy. La abres o la marcas sin perder tiempo.',
  hydrationReminder: '💧 Hora de hidratarte',
  hydrationReminderDesc: '${name}, hoy todavía podés acercarte a tu meta.',
  streakAtRisk: '🔥 Tu racha está en peligro',
  streakAtRiskDesc: '${name}, hacé 1 log rápido hoy y la mantenés viva.',
  hydrationSmartReminder: '💧 Recordatorio inteligente',
  streakSmartReminder: '🔥 Racha en riesgo',
} as const;

export const PrivacyTexts = {
  dataExample: 'Agua, pasos, sueño, peso, comidas, ayuno, entrenos y resúmenes diarios.',
  healthDataReduction: 'Reduce cuánto se conserva en claro sobre peso, salud mental y salud femenina.',
} as const;

export const ExplorePageStrings = {
  title: 'Plan',
  heroEyebrow: 'Objetivo activo',
  heroBody: 'El plan ya no actúa como una segunda home: desde aquí deberías ver tu camino, tu bloque y el siguiente paso útil.',
  loseFat: 'Perder grasa',
  gainMuscle: 'Ganar músculo',
  performance: 'Rendimiento',
  organizeHabits: 'Ordenar hábitos',
  recovery: 'Recuperación',
  yourCurrentPath: 'Tu camino actual',
  fallbackCoaching: 'Sostener una sola decisión bien elegida esta semana mueve más la aguja que abrir diez caminos a la vez.',
  recommended: 'Recomendados para ti',
  coaching: 'Coaching contextual',
  weeklyPriority: 'Prioridad de esta semana',
  momentum: 'Challenges y momentum',
  streakLabel: 'racha',
  sessionThisWeek: 'sesiones semana',
  usefulLibrary: 'Biblioteca útil',
  // Program section
  programTitle: 'Programa activo',
  noneSelected: 'Todavía no hay un programa elegido',
  activeWeek: 'Semana {{week}}. El bloque ya está corriendo y la siguiente decisión debería salir de aquí.',
  suggested: 'No hay un programa activo, pero ya hay una rutina sugerida para empezar con dirección.',
  chooseRoute: 'Lo mejor ahora es elegir una ruta guiada en vez de navegar el catálogo completo.',
  nextAction: 'Siguiente acción',
  backToSession: 'Volver a sesión',
  chooseProgram: 'Elegir programa',
  progress: 'Progreso',
  thisWeek: '{{sessions}}/{{goal}} esta semana',
  continueProgram: 'Seguir programa',
  // Cards
  nextFocusEyebrow: 'Siguiente ajuste',
  nextFocusBody: 'La lectura contextual de hoy ya encontró lo que más conviene empujar primero.',
  workoutEyebrow: 'Entrenamiento',
  openCurrent: 'Abrir tu bloque actual',
  chooseGuided: 'Elegir un programa guiado',
  workoutOpenBody: 'Revisa semanas, días y continuidad de carga sin salirte del camino principal.',
  workoutChooseBody: 'Empieza con una ruta clara en vez de navegar rutinas sueltas sin prioridad.',
  nutritionEyebrow: 'Nutrición',
  nutritionTitle: 'Reset nutricional simple',
  nutritionBody: 'Un día bien registrado vale más que una planilla compleja que no llegas a usar.',
  recoveryEyebrow: 'Recuperación',
  sleepTitle: 'Dormir mejor esta semana',
  sleepBody: 'Ajusta descanso antes de pedirle más fuerza y más constancia al día.',
  waterTitle: 'Rutina de hidratación',
  waterBody: 'Una base simple de agua y ritmo diario hace que el resto del sistema rinda mejor.',
  libraryEyebrow: 'Biblioteca útil',
  plannerTitle: 'Plan semanal',
  plannerBody: 'Visualiza la semana y prepara el siguiente bloque sin abrir módulos de más.',
  mealTitle: 'Registrar una comida',
  mealBody: 'Vuelve a lo básico y deja el día más claro en dos pasos.',
  sleepLibraryTitle: 'Ver descanso',
  sleepLibraryBody: 'Lee la última noche y baja o sube carga con más criterio.',
  progressTitle: 'Leer progreso real',
  progressBody: 'Si quieres contexto más profundo, aquí ves tendencia y no solo registros sueltos.',
  milestoneDone: 'Semana encaminada. Ahora toca sostener la calidad del bloque y no sumar ruido.',
  milestonePending: 'Te faltan {{count}} sesiones para cerrar tu objetivo semanal.',
} as const;

export const HomePageStrings = {
  locale: 'es-UY',
  guestName: 'Usuario',
  quickActionHint: 'Abre este atajo rapido.',
  secondaryModuleHint: 'Abre este modulo secundario.',
  notificationFallbackTitle: 'Notificacion Vyra',
  notificationFallbackBody: 'Actividad reciente disponible.',
  greeting: 'Hola, {{name}}',
  streakPillLabel: (days: number) => `Racha actual: ${days} ${days === 1 ? 'día' : 'días'}`,
  streakPillHint: 'Abre progreso para ver tu consistencia.',
  openNotifications: 'Abrir notificaciones recientes',
  openNotificationsHint: 'Muestra los controles de entrega y los avisos mas recientes.',
  openQuickLog: 'Abrir registro rapido',
  openQuickLogHint: 'Abre una hoja para registrar agua, sueño, peso o ayuno sin salir de inicio.',
  openProfile: 'Abrir perfil',
  openProfileHint: 'Abre tu cuenta, módulos y ajustes.',
  activeWorkoutAccessibility: 'Sesion activa, {{name}}, {{count}} ejercicios en curso',
  activeWorkoutEyebrow: 'Sesion activa',
  activeWorkoutFallbackTitle: 'Entrenamiento en curso',
  activeWorkoutMeta: '{{count}} ejercicios en curso en este dispositivo.',
  activeWorkoutCta: 'Volver al entreno',
  nextStepEyebrow: 'Siguiente paso',
  nextStepHint: 'Elige el frente que más mueve tu día y resuélvelo desde aquí.',
  planEyebrow: 'Hoy',
  planTitle: 'Plan del día',
  planSummary: '{{done}} de {{total}} frentes ya quedaron cubiertos.',
  planExpand: 'Ver plan completo',
  planCollapse: 'Mostrar menos',
  momentumEyebrow: 'Consistencia',
  streakEyebrow: 'Racha',
  streakStartToday: 'Empieza tu racha hoy',
  streakRunning: (days: number) => `${days} ${days === 1 ? 'día' : 'días'} en racha`,
  streakDoneBody: 'Hoy ya cuenta. Mantener una acción pequeña sostiene tu continuidad.',
  streakPendingBody: 'Te basta con agua, pasos, nutrición o entreno para salvar el día.',
  streakView: 'Ver racha y progreso',
  streakSave: 'Salvar mi racha ahora',
  sectionsQuickActions: 'Acciones rapidas',
  sectionsThisWeek: 'Esta semana',
  weekDone: '{{day}}: día completado de esta semana',
  weekTodayPending: '{{day}}: hoy aun pendiente',
  weekPending: '{{day}}: sin completar',
  weekSummary: '{{count}} de 7 dias esta semana',
  pauseBody: 'Llevas {{days}} dias sin registrar. Retoma hoy con algo pequeno.',
  pauseCta: 'Retomar ahora',
  pauseHint: 'Abre la acción sugerida para volver a registrar actividad.',
  aiEyebrow: 'VYRA sugiere',
  notificationsTitle: 'Ultimas notificaciones',
  notificationsEmpty: 'Todavia no hay actividad reciente para mostrar aqui.',
  notificationsViewAll: 'Ver todas',
  notificationsAccessibility: 'Ver todas las notificaciones',
  notificationsHint: 'Abre los controles de entrega de notificaciones y las horas de silencio.',
} as const;

export const ProgressPageStrings = {
  sectionEnergy: 'Energia y peso',
  sectionEnergyHint: 'Lo importante cambia según el objetivo que elegiste.',
  workoutSessions: 'sesiones',
  sleepRecovered: 'Base solida para sostener una carga normal hoy.',
  sleepRecovering: 'Dormiste menos de lo ideal. Conviene modular intensidad.',
  muscleChest: 'Pecho',
  muscleBack: 'Espalda',
  muscleShoulders: 'Hombros',
  muscleArms: 'Brazos',
  muscleCore: 'Core',
  muscleLegs: 'Piernas',
  caloriesEyebrow: 'Calorias de hoy',
  weightEyebrow: 'Peso y direccion',
  viewPrograms: 'Ver programas',
  backHome: 'Volver a inicio',
} as const;

export const WaterHydrationMessages = {
  goalReached: 'Meta cerrada. Mantener este patron simple es lo que sostiene el modulo.',
  behindAndAfternoon: 'Ya pasó buena parte del día. Dos registros seguidos ahora cambian por completo el cierre.',
  lowProgress: 'Todavia hay margen para recuperar el ritmo sin meter complejidad.',
  onTrack: 'Vas bien. Sostener pequenos vasos espaciados vale mas que apilar todo al final.',
} as const;

export const StepsProgressMessages = {
  goalMet: 'Superaste o alcanzaste tu meta. {{totalSteps}} pasos hoy.',
  almostThere: 'Casi. Te quedan {{remaining}} pasos para la meta.',
  goodProgress: 'Vas bien. Ya tomaste ritmo para cerrar el día mejor.',
  justStarted: 'Buen comienzo. Sigue sumando.',
} as const;

export const HomeDetailStrings = {
  hero: {
    readiness: {
      eyebrow: 'Readiness',
      pending: 'Base de hoy',
      awaiting: 'Lectura en construccion',
      support: 'Con sueño, agua, comida y movimiento este score se vuelve más preciso.',
      noData: 'Todavia estamos armando tu lectura diaria. Cada registro util le da mas contexto.',
      weeklyAverage: 'Promedio',
      projected: 'Cierre posible',
      stability: 'Estabilidad',
      focus: 'Foco ahora',
      cta: 'Ver detalles',
    },
    fasting: {
      eyebrow: 'Ayuno activo',
      protocol: 'Protocolo {{protocol}}',
      eatingWindowOpen: 'Ventana de comer abierta',
      accumulated: '{{hours}}h {{minutes}}m acumuladas.',
      close: 'Cerrar ayuno',
      complete: 'Completar ayuno',
    },
    female: {
      eyebrow: 'Ciclo',
      phaseDay: 'Fase {{phase}} · Día {{day}}',
      prioritizeRecovery: 'Prioriza recuperacion y regularidad',
      trainStrong: 'Buen día para entrenar fuerte',
      registerToday: 'Registrar hoy',
    },
    nutrition: {
      eyebrow: 'Nutrición',
      percentCalories: '{{pct}}% de calorias hoy',
      caloriesOf: '{{current}} de {{target}} kcal',
      cta: 'Registrar comida',
    },
    steps: {
      eyebrow: 'Pasos',
      title: 'Objetivo de hoy',
      ofSteps: 'de {{goal}} pasos',
      estimatedCalories: '{{kcal}} kcal estimadas.',
      cta: 'Ver detalles',
    },
    sleep: {
      eyebrow: 'Sueño',
      recovered: 'Base solida para sostener una carga normal hoy.',
      recovering: 'Dormiste menos de lo ideal. Conviene modular intensidad.',
      view: 'Ver sueño',
      log: 'Registrar sueño',
    },
    workoutRest: {
      eyebrow: 'Hoy · descanso',
      fallbackTitle: 'Recuperacion activa',
      body: 'Hoy conviene bajar carga. Puedes revisar la siguiente sesion del bloque sin apurarte.',
      cta: 'Ver manana',
    },
    workout: {
      eyebrow: 'Hoy',
      activeFallback: 'Sesion en curso',
      idleFallback: 'Entrena hoy',
      prYesterday: 'PR ayer',
      activeMeta: '{{count}} ejercicios · sesion abierta',
      routineMeta: '{{count}} ejercicios · ~{{minutes}} min',
      emptyMeta: 'Todavia no hay una rutina lista para hoy.',
      resume: 'Volver al entreno',
      trainNow: 'Entrenar ahora',
    },
  },
  workoutProgram: {
    week: 'Semana {{week}} · {{day}}',
    progress: '{{pct}}% del bloque',
    todayRoutine: '{{day}} · rutina del día',
    nextSuggestion: '{{day}} · siguiente sugerencia',
    active: 'Sesion activa',
    exercises: '{{count}} ejercicios',
  },
  metrics: {
    waterGoal: '{{pct}}% de la meta',
    sleepBelowGoal: 'Por debajo de la meta',
    steps: '{{pct}}% · {{kcal}} kcal',
    noTrend: 'Tendencia aun corta',
    weeklyTrend: '{{sign}}{{value}} esta semana',
  },
  quickActions: {
    logMeal: 'Registrar comida',
    addWater: 'Agregar agua',
    resumeWorkout: 'Volver al entreno',
    trainNow: 'Entrenar ahora',
    logSleep: 'Registrar sueño',
    openQuickLog: 'Abrir registro rapido',
  },
} as const;

export const ForgotPasswordStrings = {
  title: 'Recupera tu acceso',
  subtitle: 'Ingresa tu email y te mandamos las instrucciones.',
  send: 'Enviar instrucciones',
  sendFailed: 'No pudimos enviar el email. Verifica la direccion e intenta otra vez.',
  successTitle: 'Revisa tu bandeja de entrada',
  successBody: 'Tambien revisa spam si no lo ves.',
  resend: 'Reenviar',
  resendIn: (seconds: number) => `Reenviar en ${seconds}s`,
  resendA11y: (seconds: number) =>
    seconds > 0 ? `Reenviar en ${seconds} segundos` : 'Reenviar email',
  resendHint: 'Vuelve a mandar el correo de recuperacion.',
} as const;

export const FastingMetabolicZones = {
  fed: {
    label: 'Saciado',
    description: 'Digiriendo y con energía todavía cerca de la última comida.',
  },
  early: {
    label: 'Adaptando',
    description: 'Empieza a bajar la energía fácil y el cuerpo cambia de fuente.',
  },
  fat: {
    label: 'Fat burn',
    description: 'Se vuelve más fácil usar grasa como combustible principal.',
  },
  ketosis: {
    label: 'Ketosis',
    description: 'La señal de cetosis ya aparece con bastante claridad.',
  },
  autophagy: {
    label: 'Autofagia',
    description: 'Ventana avanzada. Aquí vale más el contexto y la recuperación.',
  },
} as const;

export const BiometricLabels = {
  promptMessage: 'Desbloquear Vyra',
  cancelLabel: 'Cancelar',
  fallbackLabel: 'Usar bloqueo del dispositivo',
  unlockButton: 'Desbloquear',
  verifyingButton: 'Verificando...',
  logoutHint: 'Cierra la sesion actual sin desbloquear la app.',
  accessibilityLabel: 'Desbloquear Vyra',
} as const;

export const FemaleSymptoms = {
  colicos: 'Colicos',
  hinchazon: 'Hinchazon',
  fatiga: 'Fatiga',
  migrana: 'Migrana',
  cambios_humor: 'Humor cambiante',
  energia_alta: 'Energia alta',
} as const;

export const NutritionModule = {
  headerEditPrefix: 'Editar',
  headerAddPrefix: 'Agregar a',
  editingMode: {
    title: 'Editando registro',
    description: 'Ajusta nombre, gramos o macros y guarda el cambio sin borrar el registro original.',
  },
  logModes: {
    search: 'Buscar',
    photo: 'Foto',
    barcode: 'Código',
    manual: 'Manual',
  },
  library: {
    title: 'Biblioteca rápida',
    description: 'Abre algo frecuente o recupera un registro reciente antes de buscar.',
    tabs: {
      frequent: 'Frecuentes',
      recent: 'Recientes',
    },
    itemA11y: (food: string) => `Usar ${food}`,
    itemHint: 'Carga esta comida para confirmar cantidad y macros.',
    emptyFrequent: 'Tus alimentos favoritos aparecerán aquí.',
    emptyRecent: 'Tus últimas comidas aparecerán aquí.',
  },
  search: {
    label: 'Buscar alimento',
    placeholder: 'Ej: arroz, yogur, pollo...',
    searching: 'Buscando alimentos...',
    libraryMatches: 'Ya en tu biblioteca',
    libraryDescription: 'Antes de abrir una lista larga, te muestro primero coincidencias que ya usaste.',
    recentLabel: (timestamp: string) => `${timestamp}`,
    generalResults: 'Resultados generales',
    resultsCount: (count: number) => {
      if (count >= 30) return `Mostrando los primeros ${count} resultados. Si no aparece lo que buscas, abre mas resultados o usa carga manual.`;
      return `Encontramos ${count} coincidencia${count === 1 ? '' : 's'} para esta busqueda.`;
    },
    noResults: (query: string) => `No encontre alimentos para "${query}". Puedes volver a intentar o cargarlo manualmente.`,
    noResultsLibrary: (query: string) => `No encontre resultados generales para "${query}". Si ya lo usaste antes, tienes coincidencias arriba o puedes cargarlo manualmente.`,
    loadManual: 'Cargar manualmente',
    moreResults: 'Ver mas resultados',
  },
  preview: {
    title: 'Confirmación',
    hint: 'Confirma macros y cantidad antes de agregar.',
    macros: {
      kcal: 'Kcal',
      protein: 'Prot',
      carbs: 'Carb',
      fat: 'Grasa',
      fiber: 'Fibra',
    },
    quantityLabel: 'Cantidad',
    portionHint: '1 porción se estima como 100g para está confirmación.',
    addButton: (meal: string) => `Agregar a ${meal}`,
  },
  photo: {
    title: 'Foto IA',
    description: 'Saca una foto, revisa lo que VYRA detecta y ajusta porciones antes de confirmar.',
    takePhoto: 'Tomar foto',
    chooseGallery: 'Elegir de galería',
    detection: 'Esto detectó la IA',
    confidence: (percent: number) => `confianza ${Math.round(percent * 100)}%`,
    lowConfidence: 'La deteccion tiene baja confianza. Conviene revisar o pasar a busqueda manual.',
    itemsSelected: (count: number) => `${count} item${count > 1 ? 's' : ''} marcado${count > 1 ? 's' : ''}.`,
    selectAtLeast: 'Marca al menos un item para confirmar.',
    confirmDetection: 'Confirmar deteccion',
    manualSearch: 'Buscar manualmente',
    togglePortions: {
      show: 'Ajustar porciones',
      hide: 'Ocultar ajuste de porciones',
    },
    estimated: (grams: number) => `${Math.round(grams)} g estimados`,
    noQuantity: 'Sin cantidad estimada',
    componentIncludeA11y: (name: string) => `Incluir ${name}`,
    cameraMissingPermission: 'Hace falta permiso de cámara.',
    galleryMissingPermission: 'Hace falta permiso de galería.',
  },
  manual: {
    title: 'Carga manual',
    nameLabel: 'Nombre',
    namePlaceholder: 'Ej: arroz con pollo',
    quantityLabel: 'Cantidad',
    quantityUnit: 'g',
    proteinLabel: 'Proteína',
    proteinUnit: 'g',
    carbsLabel: 'Carbos',
    carbsUnit: 'g',
    fatLabel: 'Grasas',
    fatUnit: 'g',
    fiberLabel: 'Fibra',
    fiberUnit: 'g',
    submitEdit: 'Guardar cambios',
    submitAdd: (meal: string) => `Agregar a ${meal}`,
  },
  errors: {
    loadingFood: 'Cargando alimento...',
  },
  modeA11y: (mode: string) => `Modo ${mode === 'search' ? 'buscar' : mode === 'photo' ? 'foto' : mode === 'barcode' ? 'codigo' : 'manual'}`,
  unitA11y: (unit: string) => `Unidad ${unit}`,
  quickAmountA11y: (value: number) => `Cantidad rápida ${value} gramos`,
  portionAdjustmentNote: 'Ajustamos porciones según los items que dejaste marcados antes de confirmar.',
} as const;

export const FemaleModule = {
  header: {
    title: 'Ajustes del ciclo',
    subtitle: 'Modulo, privacidad y continuidad del seguimiento.',
  },
  disclaimer: {
    title: 'Disclaimer medico pendiente',
    body: 'Conviene confirmarlo antes de usar el modulo como referencia diaria.',
    confirm: 'Confirmar disclaimer',
  },
  errorCard: {
    title: 'No pudimos guardar este cambio',
  },
  moduleSection: {
    eyebrow: 'Modulo',
    title: 'Seguimiento sensible y opcional',
    subtitle: 'Si lo activas, VYRA puede ajustar contexto de entreno, nutrición y recuperación según tu fase.',
    toggleLabel: 'Modulo activo',
    toggleDescription: 'Activa o pausa la lectura del ciclo sin salir de tus ajustes.',
  },
  cycleData: {
    eyebrow: 'Datos base',
    title: 'Resumen del ciclo',
    subtitle: 'La lectura principal vive aqui en filas claras y la edicion queda en una pantalla dedicada.',
    lastPeriod: 'Ultimo periodo',
    unconfigured: 'Sin configurar',
    cycleDuration: 'Duracion del ciclo',
    daysLabel: 'días',
    periodDuration: 'Duracion menstrual',
    nextPeriod: 'Proximo periodo',
    editLink: 'Editar datos del ciclo',
    editDescription: 'Abre la configuracion base del modulo para registrar fechas, duracion y contexto.',
  },
  errors: {
    saveFailed: 'No se pudo guardar este ajuste ahora mismo. Intenta de nuevo en unos segundos.',
    configSaveFailed: 'No se pudo guardar la configuracion del ciclo.',
  },
} as const;

export const FastingModule = {
  header: {
    title: 'Ayuno intermitente',
  },
  controls: {
    adjustTime: '⏱  Ajustar hora de inicio',
    cancelAdjust: '✕  Cancelar ajuste',
    adjustHint: 'Se usará la hora actual al cancelar',
    adjustSubHint: 'Si ya empezaste antes o vas a empezar después',
    adjustTitle: '¿A qué hora empezaste (o empezás)?',
    reduceOffset: 'Restar 15 minutos',
    increaseOffset: 'Sumar 15 minutos',
    offsetHint: 'Cada toque mueve 15 minutos · hasta 12h atrás o 4h adelante',
    now: 'Ahora',
  },
  timer: {
    remaining: 'restantes',
    elapsedPct: (elapsed: string, pct: number) => `${elapsed} completadas · ${Math.round(pct)}%`,
    backgroundActive: 'El temporizador sigue activo en segundo plano.',
    endPredictionSameDay: (time: string) => `Termina a las ${time}`,
    endPredictionDiffDay: (time: string, date: string) => `Termina a las ${time} · ${date}`,
    zones: 'Zonas metabólicas',
  },
  states: {
    activeBadge: 'Ayuno activo',
    completeBadge: 'Ayuno completado',
    completeEmoji: '🎉',
    completeTitle: '¡Lo lograste!',
    completeMeta: (protocol: string, elapsed: string) => `${protocol} · ${elapsed} completadas`,
  },
  suggestion: {
    title: 'Hoy conviene esto',
  },
  buttons: {
    startFast: (protocol: string, timeLabel?: string) => 
      timeLabel ? `Iniciar ${protocol} · ${timeLabel}` : `Iniciar ${protocol}`,
    completeFast: 'Completar ayuno',
    finishAndClose: 'Registrar y cerrar',
    earlyFinish: 'Terminar anticipadamente',
    continueEarlyFinish: 'Seguir ayunando',
    partialFinish: 'Terminar parcial',
  },
  stats: {
    completedLabel: 'Completados',
    avgLabel: 'Promedio',
    longestLabel: 'Más largo',
    completedMeta: (avg: number, longest: number) => `Promedio ${avg.toFixed(1)}h · mejor ${longest.toFixed(1)}h`,
    noFasts: 'Aún no hay ayunos completados.',
  },
  history: {
    title: 'Últimos ayunos',
    missed: 'Perdido',
    pending: 'Pendiente',
    completed: '✓',
    deleteBtn: 'Eliminar',
    deleteA11y: (protocol: string) => `Eliminar ayuno ${protocol}`,
    emptyEmoji: '🌙',
    emptyTitle: 'Todavía no hay ayunos registrados.',
    emptyHint: 'Completá tu primer ayuno para ver el historial acá.',
  },
  fiveTwo: {
    header: '📅 Hoy es tu día 5:2',
    status: 'Pendiente',
    desc: (protocol: string, hours: number, time?: string) => 
      time ? `Protocolo: ${protocol} · Objetivo: ${hours}h · Hora programada: ${time}` : `Protocolo: ${protocol} · Objetivo: ${hours}h`,
    button: 'Iniciar ayuno 5:2 de hoy',
    week: 'Esta semana · 5:2',
    weekMeta: (completed: number, target: number) => `${completed}/${target} días completados`,
  },
  modals: {
    zoneDetail: {
      startHint: (hours: number) => `Esta zona comienza a las ${hours}h de ayuno.`,
      close: 'Cerrar',
    },
    deleteConfirm: {
      title: 'Eliminar ayuno',
      body: '¿Eliminar este ayuno? Esta acción no se puede deshacer.',
      confirm: 'Eliminar',
    },
    earlyFinish: {
      title: '¿Terminar antes?',
      percentComplete: (pct: number) => `${Math.round(pct)}%`,
      label: 'completado',
      context: (elapsed: string) => `Vas ${elapsed} del objetivo. Se va a registrar como parcial.`,
    },
  },
  contextCard: {
    female: 'Contexto femenino',
  },
  offsetLabel: {
    now: (time: string) => `Ahora · ${time}`,
    past: (duration: string, time: string, dayLabel?: string) => `Hace ${duration}${dayLabel ? ` · ${dayLabel}` : ''} · ${time}`,
    future: (duration: string, time: string) => `En ${duration} · ${time}`,
  },
} as const;

export const WaterModule = {
  header: {
    eyebrow: 'Ajustes',
    title: 'Agua',
  },
  dailyGoal: {
    title: 'Meta diaria',
    description: 'Elige una base realista y deja que la app la ajuste según el contexto.',
    presets: {
      low: 'Actividad baja',
      moderate: 'Moderada',
      recommended: 'Recomendada',
      athlete: 'Atletas',
      hotClimate: 'Clima caluroso',
    },
    customLabel: 'Meta personalizada',
    customHint: 'Entre 500ml y 10.000ml.',
    unit: 'ml',
  },
  infoCard: {
    eyebrow: 'Ajuste',
    body: 'VYRA puede subir tu meta si hace calor, si estás en ayuno o si el día viene con mucha actividad.',
  },
  containers: {
    title: 'Objetos rápidos',
    description: 'Ajusta una vez cuánto hay en tus recipientes reales.',
    resetLabel: 'Restablecer',
    resetA11y: 'Restaurar tamaños por defecto',
    glass: 'Un vaso',
    largeGlass: 'Vaso grande',
    bottle: 'Botella',
  },
  warningCard: {
    eyebrow: 'Aviso',
    body: 'Los recordatorios viven en notificaciones generales. Desde aquí solo dejas afinada la parte operativa.',
  },
  buttons: {
    openNotifications: 'Abrir notificaciones',
    changeUnits: 'Cambiar unidades',
    save: 'Guardar ajustes',
  },
} as const;

export const FemaleMoods = {
  '1': 'Bajo',
  '2': 'Serio',
  '3': 'Estable',
  '4': 'Bien',
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
  as_needed: 'Según necesidad',
} as const;

export const SupplementTimeSlots = {
  unscheduled: 'Sin horario asignado',
  morning: 'Manana',
  afternoon: 'Tarde',
  evening: 'Noche',
} as const;

export const WorkoutDifficultyLevels = {
  high: 'Alto',
  medium: 'Medio',
  base: 'Base',
} as const;
