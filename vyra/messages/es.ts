export type VyraMessageContext =
  | 'celebration_pr'
  | 'streak_hit'
  | 'streak_lost'
  | 'streak_danger'
  | 'level_close'
  | 'inactive_nudge'
  | 'recovery_low'
  | 'good_morning'
  | 'general';

export const VYRA_MESSAGES_ES: Record<VyraMessageContext, string[]> = {
  celebration_pr: [
    'Nuevo récord. Eso es consistencia real.',
    'PR desbloqueado. Estás en modo imparable.',
    'Ese progreso se nota. Seguimos.',
  ],
  streak_hit: [
    'Otro día más. Tu racha sigue viva.',
    'Constancia activa. Buen trabajo hoy.',
    'Sumaste otro día a la racha. Orgullo total.',
  ],
  streak_lost: [
    'No pasa nada. Mañana empezamos de nuevo.',
    'Un día no define tu camino. Vamos de nuevo.',
    'Cerramos este día y seguimos. Tu ritmo vuelve.',
  ],
  streak_danger: [
    'Tu racha esta en riesgo. Vamos con una sesion corta y la sostenemos.',
    'Todavia llegamos. Un entreno hoy protege todo lo que ya construiste.',
    'No hace falta hacerlo perfecto. Hace falta hacerlo hoy.',
  ],
  level_close: [
    'Estas muy cerca del siguiente nivel. Un empujon mas y subes.',
    'Te faltan pocos XP. Cerremos algo hoy y lo desbloqueamos.',
    'Ese nivel ya esta a la vista. Vamos por el cierre.',
  ],
  inactive_nudge: [
    'Llevamos unos dias flojos. Volvamos con una accion simple.',
    'No hace falta recuperar todo hoy. Solo volver a mover el sistema.',
    'Retomar con algo pequeno sigue contando. Vamos.',
  ],
  recovery_low: [
    'Hoy toca criterio. Recupera bien y suma una victoria facil.',
    'Dia suave. Mejor cerrar agua, pasos o sueno antes de cargar fuerte.',
    'No fuerces. Ordena lo basico y mañana empujamos mejor.',
  ],
  good_morning: [
    'Buenos días. Hoy puede ser un gran día.',
    'Buen día. Te acompaño con el primer paso.',
    '¿Listo para hoy? Yo sí.',
  ],
  general: [
    'Vamos con un paso pequeño pero firme.',
    'Hoy cuenta. Lo hacemos simple.',
    'Constancia primero. El resto aparece.',
  ],
};
