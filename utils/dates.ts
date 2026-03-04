// ============================================================
// VYRA FITNESS — Utilidades de fechas
// ============================================================

/** Fecha de hoy como ISO string "YYYY-MM-DD" */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]!;
}

/** Ayer como ISO string */
export function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0]!;
}

/** N días atrás como ISO string */
export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0]!;
}

/** Inicio de la semana actual (lunes) */
export function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;    // Lunes como inicio
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0]!;
}

/** Inicio del mes actual */
export function startOfMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Comparar dos fechas ISO — retorna true si son el mismo día */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? date1.split('T')[0] : date1.toISOString().split('T')[0];
  const d2 = typeof date2 === 'string' ? date2.split('T')[0] : date2.toISOString().split('T')[0];
  return d1 === d2;
}

/** Verificar si una fecha es hoy */
export function isToday(date: string | Date): boolean {
  return isSameDay(date, new Date());
}

/** Diferencia en días entre dos fechas */
export function daysDiff(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Obtener los últimos N días como array de ISO strings (de más reciente a más antiguo) */
export function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => daysAgoISO(i));
}

/** Verificar si el usuario está en su horario de sueño configurado */
export function isInSleepHours(wakeTimeMin: number, sleepTimeMin: number): boolean {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  if (sleepTimeMin > wakeTimeMin) {
    // El sueño empieza hoy y termina mañana (ej: 23pm a 7am)
    return currentMin >= sleepTimeMin || currentMin < wakeTimeMin;
  } else {
    // El sueño empieza y termina el mismo día (caso raro)
    return currentMin >= sleepTimeMin && currentMin < wakeTimeMin;
  }
}

/** Timestamp de ahora como ISO string */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Nombre del día de la semana en español */
export function dayNameES(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es', { weekday: 'long' });
}

/** Nombre corto del día (Lu, Ma, Mi, etc.) */
export function dayNameShortES(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es', { weekday: 'short' }).slice(0, 2);
}