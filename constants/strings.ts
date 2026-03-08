// ============================================================
// VYRA FITNESS — Strings centralizados
// TODOS los textos de la app viven aquí. Nunca hardcodear strings.
// ============================================================

// ─── Errores con voz de Vyra ─────────────────────────────────
export const ErrorMessages = {
  noInternet:      "Sin señal por aquí 📡 — seguí loggeando, lo sincronizo cuando vuelva la conexión.",
  aiUnavailable:   "Mi cerebro IA está tomando un descanso 😅 — volvé en unos minutos.",
  saveFailed:      "Algo falló al guardar. Lo tengo guardado localmente — lo subo automáticamente.",
  barcodeNotFound: "No encontré ese código. ¿Lo ingresás manualmente? Puedo buscar el nombre del producto.",
  paypalError:     "Hubo un problema con el pago. No se te cobró nada — podés intentarlo de nuevo.",
  photoAIFailed:   "Hmm, no logré identificar bien este plato. ¿Lo ingresás manualmente? Así aprendo mejor.",
  voiceLogFailed:  "No escuché bien eso. ¿Probamos de nuevo o lo ingresás manualmente?",
  loginFailed:     "No pude iniciar sesión. Revisá tus datos e intentá de nuevo.",
  registerFailed:  "Algo salió mal al crear tu cuenta. Intentá de nuevo.",
  sessionExpired:  "Tu sesión venció. Ingresá de nuevo para continuar.",
  premiumRequired: "Esta función es Premium. Activala con PayPal cuando quieras.",
  generic:         "Algo salió mal. Estoy en ello — intentá de nuevo en un momento.",
  loadFailed:      "No pude cargar los datos. Deslizá para intentar de nuevo.",
  syncFailed:      "No pude sincronizar. Tus datos están seguros localmente.",
  permissionDenied:"Necesito tu permiso para continuar. Podés cambiarlo en Configuración.",
} as const;

// ─── Pantallas de Auth ────────────────────────────────────────
export const AuthStrings = {
  welcome: {
    title:    "Tu mejor versión,\ncada día.",
    subtitle: "Agua, pasos, comida, sueño y mente — todo en un lugar que te entiende.",
    cta:      "Empezar ahora",
    login:    "Ya tengo cuenta",
  },
  login: {
    title:    "Bienvenido\nde vuelta",
    email:    "Email",
    password: "Contraseña",
    cta:      "Entrar",
    forgot:   "¿Olvidaste tu contraseña?",
    noAccount:"¿No tenés cuenta?",
    register: "Registrate gratis",
  },
  register: {
    title:      "Crear cuenta",
    name:       "Tu nombre",
    email:      "Email",
    password:   "Contraseña (mínimo 8 caracteres)",
    cta:        "Crear mi cuenta",
    haveAccount:"¿Ya tenés cuenta?",
    login:      "Ingresá",
    tosLabel:   "Acepto los",
    tos:        "Términos de Servicio",
    and:        "y la",
    privacy:    "Política de Privacidad",
    healthConsent: "Consiento que Vyra procese mis datos de salud para personalizar mi experiencia",
    medicalDisclaimer: "Entiendo que Vyra no es un dispositivo médico y no reemplaza el diagnóstico médico profesional",
  },
  medicalModal: {
    title:   "Antes de empezar",
    body:    "Vyra es una app de bienestar y fitness. No es un dispositivo médico certificado y no reemplaza la consulta, diagnóstico ni tratamiento de un profesional de la salud.\n\nSiempre consultá a tu médico ante cualquier duda sobre tu salud.",
    cta:     "Entendido, continuar",
  },
} as const;

// ─── Onboarding ───────────────────────────────────────────────
export const OnboardingStrings = {
  step1: {
    title:    "¿Cuál es tu objetivo principal?",
    subtitle: "Lo usamos para personalizar todo en Vyra.",
    goals: {
      lose_fat:          "Perder grasa",
      gain_muscle:       "Ganar músculo",
      general_health:    "Salud general",
      sport_performance: "Rendimiento deportivo",
      mental_wellbeing:  "Bienestar mental",
    },
  },
  step2: {
    title:    "Contanos un poco de vos",
    subtitle: "Calculamos tu TDEE y metas personalizadas.",
    gender: {
      label:            "Sexo biológico",
      male:             "Masculino",
      female:           "Femenino",
      non_binary:       "No binario",
      prefer_not_to_say:"Prefiero no decir",
    },
    age:       "Edad",
    height:    "Altura (cm)",
    weight:    "Peso actual (kg)",
    goalWeight:"Peso objetivo (kg, opcional)",
  },
  step3: {
    title:    "¿Cuánto te movés?",
    subtitle: "Esto calibra tus metas de pasos y calorías.",
    levels: {
      0: "Sedentario — casi sin actividad",
      1: "Muy poco activo — 1-2 días/semana",
      2: "Algo activo — 3 días/semana",
      3: "Moderadamente activo — 4-5 días/semana",
      4: "Muy activo — 6-7 días/semana",
      5: "Atleta — múltiples sesiones al día",
    },
    equipment: {
      label:    "¿Dónde entrenás?",
      gym:      "Gimnasio",
      home:     "En casa",
      both:     "Ambos",
      outside:  "Al aire libre",
      none:     "Por ahora no entreno",
    },
  },
  step4: {
    title:    "Tus horarios",
    subtitle: "Configuramos las notificaciones para que no te molesten.",
    wakeTime:  "¿A qué hora te levantás?",
    sleepTime: "¿A qué hora te dormís?",
    fasting: {
      label:    "¿Hacés ayuno intermitente?",
      yes:      "Sí, quiero probarlo",
      no:       "No por ahora",
    },
    protocol: "¿Qué protocolo preferís?",
  },
  step5: {
    title:    "Activá Premium\nsin esperas",
    subtitle: "Cobro inmediato al confirmar en PayPal. Cancelás la renovación cuando quieras.",
    features: {
      aiCoach:      "Coach IA con memoria real",
      photoLog:     "Barcode scanner ilimitado",
      voiceLog:     "Sin anuncios en Premium",
      unlimitedHistory: "Seguimiento y cuenta sincronizada",
      correlations: "Correlaciones sueño/peso/nutrición",
      noAds:        "Sin anuncios",
    },
    monthly:     "$12.99/mes",
    yearly:      "$99.99/año",
    yearlyNote:  "Ahorrás 36% (~$8.33/mes)",
    trialCta:    "Ir al checkout de PayPal",
    freeCta:     "Continuar gratis",
    freeNote:    "Con anuncios y funciones básicas",
  },
  next:   "Siguiente",
  back:   "Atrás",
  skip:   "Omitir",
  finish: "Empezar",
  step:   "Paso",
  of:     "de",
} as const;

// ─── Dashboard ────────────────────────────────────────────────
export const DashboardStrings = {
  greeting: {
    morning:   "Buenos días",
    afternoon: "Buenas tardes",
    evening:   "Buenas noches",
  },
  dailyScore:    "Score del día",
  streak:        "días de racha",
  bestStreak:    "mejor racha",
  checkIn:       "Check-in mental",
  checkInDone:   "Check-in hecho ✓",
  quickActions:  "Acceso rápido",
  todayMissions: "Misiones de hoy",
  aiInsight:     "Coach dice:",
  noInsight:     "Completá tu primer check-in para recibir insights.",
} as const;

// ─── Módulos ──────────────────────────────────────────────────
export const ModuleNames = {
  water:       "Hidratación",
  steps:       "Pasos",
  fasting:     "Ayuno",
  sleep:       "Sueño",
  nutrition:   "Nutrición",
  weight:      "Peso",
  workout:     "Entrenos",
  mental:      "Ánimo",
  female:      "Salud Femenina",
  supplements: "Suplementos",
  recovery:    "Recuperación",
} as const;

export const ModuleEmojis = {
  water:       "💧",
  steps:       "🚶",
  fasting:     "⏳",
  sleep:       "😴",
  nutrition:   "🍎",
  weight:      "⚖️",
  workout:     "💪",
  mental:      "🧠",
  female:      "🌸",
  supplements: "💊",
  recovery:    "🧘",
} as const;

// ─── Gamificación ─────────────────────────────────────────────
export const GamificationStrings = {
  coins:        "VyraCoins",
  coinSymbol:   "🪙",
  xp:           "XP",
  level:        "Nivel",
  streak:       "Racha",
  days:         "días",
  badge:        "Logro",
  newRecord:    "¡Nuevo récord personal!",
  levelUp:      "¡Subiste al nivel",
  streakSaved:  "¡Racha salvada!",
  badgeUnlocked:"¡Logro desbloqueado!",
  watchAdFor:   "Ver anuncio para",
  earn:         "Ganás",
  watchAd:      "Ver anuncio",
  skipAd:       "Omitir",
} as const;

// ─── Disclaimer médicos ───────────────────────────────────────
export const Disclaimers = {
  coach:        "Vyra Coach es un asistente IA de bienestar. No reemplaza la consulta médica, nutricional ni psicológica.",
  supplements:  "Esta app no recomienda dosis ni combinaciones de suplementos. Consultá a un profesional de salud.",
  bmi:          "BMI y % grasa son estimaciones. Para diagnóstico médico consultá a tu médico.",
  cycle:        "La predicción es una estimación. No uses esta app como método anticonceptivo.",
  fasting24h:   "El ayuno prolongado no es apto para personas con diabetes, embarazadas o con historial de trastornos alimentarios. Consultá a tu médico antes de comenzar.",
  deficitHigh:  "Estás en un déficit calórico muy agresivo. Puede ser perjudicial a largo plazo. ¿Consultaste a un nutricionista?",
} as const;

// ─── Notificaciones ───────────────────────────────────────────
export const NotificationStrings = {
  waterReminder:    (ml: number, goal: number) => `Son las ${new Date().getHours()}hs. Llevás ${ml}ml de ${goal}ml. ¿Sumamos un vaso?`,
  stepsReminder:    (steps: number, goal: number) => `Tenés ${steps.toLocaleString()}/${goal.toLocaleString()} pasos. ¡Casi!`,
  streakDanger:     (days: number) => `Tu racha de ${days} días está en peligro. Tocá para loggear en 30s.`,
  fastingPhase:     (phase: string) => `¡Entraste en ${phase}! Seguís en racha 🔥`,
  goalReached:      (goal: string) => `¡Meta de ${goal} alcanzada! `,
  prAchieved:       (exercise: string, weight: number) => `🏆 ¡NUEVO RÉCORD! ${weight}kg en ${exercise}.`,
} as const;

// ─── General ──────────────────────────────────────────────────
export const General = {
  save:      "Guardar",
  cancel:    "Cancelar",
  confirm:   "Confirmar",
  delete:    "Eliminar",
  edit:      "Editar",
  close:     "Cerrar",
  back:      "Volver",
  continue:  "Continuar",
  retry:     "Intentar de nuevo",
  loading:   "Cargando...",
  syncing:   "Sincronizando...",
  today:     "Hoy",
  yesterday: "Ayer",
  week:      "Semana",
  month:     "Mes",
  all:       "Todo",
  free:      "Gratis",
  premium:   "Premium",
  upgrade:   "Mejorar a Premium",
  history:   "Historial",
  settings:  "Configuración",
  profile:   "Perfil",
  logout:    "Cerrar sesión",
  or:        "o",
  and:       "y",
  of:        "de",
  for:       "para",
  done:      "Listo",
  add:       "Agregar",
  remove:    "Quitar",
  search:    "Buscar",
  noResults: "Sin resultados",
  empty:     "Nada por aquí todavía.",
  offline:   "Sin conexión",
  online:    "Conectado",
} as const;
