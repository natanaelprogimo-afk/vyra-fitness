export type VyraMessageContext =
  | 'celebration_pr'
  | 'streak_hit'
  | 'streak_lost'
  | 'streak_danger'
  | 'inactive_nudge'
  | 'recovery_low'
  | 'good_morning'
  | 'general';

export const VYRA_MESSAGES_ES: Record<VyraMessageContext, string[]> = {
  celebration_pr: [
    'Nuevo récord. Eso es progreso real.',
    'Nuevo PR. Se nota que vienes empujando bien.',
    'Eso fue más fuerte que la última vez. Seguimos.',
  ],
  streak_hit: [
    'Otro día dentro. La racha sigue viva.',
    'Sumaste otro día de constancia.',
    'Buen cierre de hoy. La racha sigue.',
  ],
  streak_lost: [
    'No pasa nada. Mañana volvemos.',
    'Un día no borra lo que construiste.',
    'Cerramos este día y retomamos.',
  ],
  streak_danger: [
    'Tu racha está en riesgo. Una acción corta hoy la sostiene.',
    'Todavía llegamos. Haz algo simple y protege lo que ya sumaste.',
    'No tiene que ser perfecto. Tiene que pasar hoy.',
  ],
  inactive_nudge: [
    'Llevamos unos días flojos. Volvamos con algo fácil.',
    'No hace falta recuperar todo hoy. Solo volver.',
    'Retomar con una acción pequeña ya cuenta.',
  ],
  recovery_low: [
    'Hoy toca control. Mejor una victoria simple.',
    'Día suave. Prioriza sueño, agua y una sesión ligera.',
    'No fuerces. Ordena lo básico y mañana empujamos mejor.',
  ],
  good_morning: [
    'Buen día. Vamos paso a paso.',
    'Buen día. Hoy también cuenta.',
    'Listo para hoy. Vamos.',
  ],
  general: [
    'Hoy cuenta. Hazlo simple.',
    'Constancia primero. El resto aparece.',
    'Un paso pequeño sigue siendo avance.',
  ],
};
