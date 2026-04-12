import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import type { SleepEntry } from '@/hooks/useSleep';

export const SLEEP_PAGE_BG = '#0D0D14';
export const SLEEP_CARD_BG = '#161422';
export const SLEEP_INPUT_BG = '#1E1B2E';

export type SleepTabKey = 'home' | 'history' | 'log' | 'settings';

export const SLEEP_TABS: Array<{ key: SleepTabKey; label: string; route: string }> = [
  { key: 'home', label: 'Hoy', route: Routes.sleep.index },
  { key: 'history', label: 'Historial', route: Routes.sleep.history },
  { key: 'log', label: 'Registrar', route: Routes.sleep.log },
  { key: 'settings', label: 'Ajustes', route: Routes.sleep.settings },
];

export const SLEEP_QUALITY_OPTIONS = [
  { value: 1, emoji: '😵', label: 'Pesada', short: 'Pesada', accent: '#FF8E8E' },
  { value: 2, emoji: '😕', label: 'Cortada', short: 'Cortada', accent: '#FFB36B' },
  { value: 3, emoji: '😐', label: 'Regular', short: 'Regular', accent: '#9AA0B8' },
  { value: 4, emoji: '🙂', label: 'Buena', short: 'Buena', accent: '#8AA0FF' },
  { value: 5, emoji: '😄', label: 'Profunda', short: 'Profunda', accent: '#A79BFF' },
] as const;

export type SleepQualityValue = (typeof SLEEP_QUALITY_OPTIONS)[number]['value'];

export function getSleepQualityMeta(value?: number | null) {
  return SLEEP_QUALITY_OPTIONS.find((option) => option.value === value) ?? {
    value: 0,
    emoji: '🌙',
    label: 'Sin elegir',
    short: 'Sin elegir',
    accent: Colors.textMuted,
  };
}

export function formatSleepClock(value?: Date | string | null) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
}

export function getSleepDurationHours(bedtime: Date | null, wakeTime: Date | null) {
  if (!bedtime || !wakeTime) return null;
  const normalizedWake = new Date(wakeTime);
  if (normalizedWake <= bedtime) {
    normalizedWake.setDate(normalizedWake.getDate() + 1);
  }
  const hours = (normalizedWake.getTime() - bedtime.getTime()) / 3600000;
  if (hours <= 0) return null;
  return Math.round(hours * 10) / 10;
}

export function estimateSleepPhases(durationMin: number, quality?: number | null) {
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return {
      deepPct: 0,
      remPct: 0,
      deepMin: 0,
      remMin: 0,
      lightMin: 0,
      awakeMin: 0,
    };
  }

  const deepBase = { 1: 16, 2: 18, 3: 20, 4: 22, 5: 24 }[quality ?? 3] ?? 20;
  const remBase = { 1: 19, 2: 21, 3: 22, 4: 24, 5: 25 }[quality ?? 3] ?? 22;
  const awakeBase = { 1: 9, 2: 7, 3: 5, 4: 4, 5: 3 }[quality ?? 3] ?? 5;

  let deepPct = deepBase;
  let remPct = remBase;
  let awakePct = awakeBase;

  if (durationMin < 360) {
    deepPct -= 2;
    remPct -= 1;
  } else if (durationMin > 510) {
    deepPct += 1;
    remPct += 1;
  }

  deepPct = Math.max(14, Math.min(26, deepPct));
  remPct = Math.max(18, Math.min(27, remPct));
  awakePct = Math.max(2, Math.min(10, awakePct));

  const deepMin = Math.round(durationMin * (deepPct / 100));
  const remMin = Math.round(durationMin * (remPct / 100));
  const awakeMin = Math.round(durationMin * (awakePct / 100));
  const lightMin = Math.max(0, durationMin - deepMin - remMin - awakeMin);

  return { deepPct, remPct, deepMin, remMin, lightMin, awakeMin };
}

export function buildSleepHistoryBars(history: SleepEntry[], goalHours: number, days = 7) {
  const bars: Array<{
    key: string;
    label: string;
    hours: number;
    score: number;
    hasEntry: boolean;
    isGoal: boolean;
    color: string;
  }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const iso = date.toISOString().split('T')[0] ?? '';
    const entry = [...history]
      .filter((item) => String(item.end_time).startsWith(iso))
      .sort((left, right) => new Date(right.end_time).getTime() - new Date(left.end_time).getTime())[0];
    const hours = entry ? Math.round((entry.duration_min / 60) * 10) / 10 : 0;
    const score = entry?.quality_score ?? 0;
    const color = !entry
      ? '#2A2A3A'
      : score >= 80
        ? Colors.sleep
        : score >= 65
          ? '#8FA3FF'
          : '#6B7085';

    bars.push({
      key: iso,
      label: date.toLocaleDateString('es-UY', { weekday: 'short' }).replace('.', ''),
      hours,
      score,
      hasEntry: Boolean(entry),
      isGoal: hours >= goalHours,
      color,
    });
  }

  return bars;
}

export function buildSleepWeeklySummary(history: SleepEntry[], goalHours: number) {
  const recent = history.slice(-7);
  const nights = recent.length;
  const avgHours = nights ? recent.reduce((sum, entry) => sum + entry.duration_min / 60, 0) / nights : 0;
  const avgScore = nights ? recent.reduce((sum, entry) => sum + entry.quality_score, 0) / nights : 0;
  const goalNights = recent.filter((entry) => entry.duration_min / 60 >= goalHours).length;
  return {
    nights,
    avgHours: Math.round(avgHours * 10) / 10,
    avgScore: Math.round(avgScore),
    goalNights,
  };
}

function weekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + delta);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatWeekLabel(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startLabel = start.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
  const endLabel = end.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
  return `Semana ${startLabel} - ${endLabel}`;
}

export function groupSleepHistoryByWeek(items: SleepEntry[]) {
  const groups = new Map<string, { key: string; label: string; items: SleepEntry[] }>();
  const sorted = [...items].sort((left, right) => new Date(right.end_time).getTime() - new Date(left.end_time).getTime());

  for (const item of sorted) {
    const end = new Date(item.end_time);
    const start = weekStart(end);
    const key = start.toISOString().split('T')[0] ?? item.id;
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatWeekLabel(start), items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  return [...groups.values()];
}
