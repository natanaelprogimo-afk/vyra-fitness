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
    'Nuevo record. Eso es progreso real.',
    'Nuevo PR. Se nota que vienes empujando bien.',
    'Eso fue mas fuerte que la ultima vez. Seguimos.',
  ],
  streak_hit: [
    'Otro dia dentro. La racha sigue viva.',
    'Sumaste otro dia de constancia.',
    'Buen cierre de hoy. La racha sigue.',
  ],
  streak_lost: [
    'No pasa nada. Mañana volvemos.',
    'Un dia no borra lo que construiste.',
    'Cerramos este dia y retomamos.',
  ],
  streak_danger: [
    'Tu racha esta en riesgo. Una accion corta hoy la sostiene.',
    'Todavia llegamos. Haz algo simple y protege lo que ya sumaste.',
    'No tiene que ser perfecto. Tiene que pasar hoy.',
  ],
  inactive_nudge: [
    'Llevamos unos dias flojos. Volvamos con algo facil.',
    'No hace falta recuperar todo hoy. Solo volver.',
    'Retomar con una accion pequeña ya cuenta.',
  ],
  recovery_low: [
    'Hoy toca control. Mejor una victoria simple.',
    'Dia suave. Prioriza sueño, agua y una sesion ligera.',
    'No fuerces. Ordena lo basico y mañana empujamos mejor.',
  ],
  good_morning: [
    'Buen dia. Vamos paso a paso.',
    'Buen dia. Hoy tambien cuenta.',
    'Listo para hoy. Vamos.',
  ],
  general: [
    'Hoy cuenta. Hazlo simple.',
    'Constancia primero. El resto aparece.',
    'Un paso pequeño sigue siendo avance.',
  ],
};
