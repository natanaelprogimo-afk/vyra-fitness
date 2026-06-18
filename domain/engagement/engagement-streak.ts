import { daysAgoISO, todayISO } from '@/utils/dates';

export interface EngagementWeekDot {
  key: string;
  dayNumber: number;
  done: boolean;
  isToday: boolean;
}

export function normalizeEngagementDate(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 10);
}

export function createActiveDateSet(
  groups: Array<Iterable<string | null | undefined>>,
): Set<string> {
  const next = new Set<string>();

  for (const group of groups) {
    for (const value of group) {
      const normalized = normalizeEngagementDate(value);
      if (normalized) next.add(normalized);
    }
  }

  return next;
}

export function calculateEngagementStreak(
  activeDates: Iterable<string>,
  endDate: string = todayISO(),
  maxDays: number = 90,
): number {
  const normalized = createActiveDateSet([activeDates]);
  let streak = 0;
  const anchor = new Date(`${endDate}T12:00:00`);

  for (let offset = 0; offset < maxDays; offset += 1) {
    const date = offset === 0
      ? endDate
      : new Date(anchor.getTime() - offset * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
    if (!normalized.has(date)) break;
    streak += 1;
  }

  return streak;
}

export function buildEngagementWeekDots(
  activeDates: Iterable<string>,
  totalDays: number = 7,
): EngagementWeekDot[] {
  const normalized = createActiveDateSet([activeDates]);

  return Array.from({ length: totalDays }, (_, index) => {
    const dayOffset = totalDays - 1 - index;
    const iso = daysAgoISO(dayOffset);
    return {
      key: iso,
      dayNumber: Number(iso.slice(8, 10)),
      done: normalized.has(iso),
      isToday: dayOffset === 0,
    };
  });
}
