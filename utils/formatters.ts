// ============================================================
// VYRA FITNESS — Formateadores
// Números, fechas, pesos, distancias, macros
// ============================================================

// ─── Números ─────────────────────────────────────────────────

export function formatNumber(n: number, decimals: number = 0): string {
  return n.toLocaleString('es', { maximumFractionDigits: decimals });
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.min(100, Math.round((value / total) * 100))}%`;
}

// ─── Fechas ───────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatDurationLong(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function formatRelativeDate(date: Date | string): string {
  const d     = typeof date === 'string' ? new Date(date) : date;
  const now   = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH  = diffMs / (1000 * 60 * 60);
  const diffD  = diffMs / (1000 * 60 * 60 * 24);

  if (diffH < 1)  return 'Hace unos minutos';
  if (diffH < 24) return `Hace ${Math.floor(diffH)}h`;
  if (diffD < 2)  return 'Ayer';
  if (diffD < 7)  return `Hace ${Math.floor(diffD)} días`;
  return formatDateShort(d);
}

/**
 * Convertir minutos desde medianoche a string "HH:MM"
 */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Convertir "HH:MM" a minutos desde medianoche
 */
export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

// ─── Pesos y distancias ───────────────────────────────────────

export function formatWeight(kg: number, unit: 'kg' | 'lb' = 'kg'): string {
  if (unit === 'lb') return `${Math.round(kg * 2.20462 * 10) / 10} lb`;
  return `${kg} kg`;
}

export function formatDistance(meters: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    const mi = meters / 1609.34;
    return mi < 0.1 ? `${Math.round(meters)} m` : `${mi.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return km < 0.1 ? `${Math.round(meters)} m` : `${km.toFixed(2)} km`;
}

export function formatVolume(ml: number, unit: 'ml' | 'oz' = 'ml'): string {
  if (unit === 'oz') return `${Math.round(ml * 0.033814 * 10) / 10} oz`;
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;
}

// ─── Macros y nutrición ───────────────────────────────────────

export function formatCalories(kcal: number): string {
  return `${Math.round(kcal)} kcal`;
}

export function formatMacro(grams: number): string {
  return `${Math.round(grams)}g`;
}

// ─── Pasos ────────────────────────────────────────────────────

export function formatSteps(steps: number): string {
  if (steps >= 1000) return `${(steps / 1000).toFixed(1)}k`;
  return steps.toString();
}

// ─── Monedas / XP ────────────────────────────────────────────

export function formatCoins(coins: number): string {
  if (coins >= 1000) return `${(coins / 1000).toFixed(1)}K 🪙`;
  return `${coins} 🪙`;
}

export function formatXP(xp: number): string {
  return `${formatNumber(xp)} XP`;
}

// ─── Fasting ─────────────────────────────────────────────────

export function formatFastingTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}