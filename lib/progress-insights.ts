export type ProgressWeightPeriod = '14d' | '30d' | '90d' | 'all';

export interface WeightLogInsightSource {
  weight_kg: number;
  logged_at: string;
  note?: string | null;
}

export interface WeightTrendPoint {
  date: string;
  isoDate: string;
  weight: number;
}

export interface WeightTrendEvent {
  isoDate: string;
  label: string;
  tone: 'milestone' | 'goal' | 'context';
}

export const PROGRESS_WEIGHT_PERIODS: Array<{
  id: ProgressWeightPeriod;
  label: string;
  days: number | null;
}> = [
  { id: '14d', label: '2 sem', days: 14 },
  { id: '30d', label: '1 mes', days: 30 },
  { id: '90d', label: '3 meses', days: 90 },
  { id: 'all', label: 'Inicio', days: null },
];

function sortByDateAsc<T extends WeightLogInsightSource>(logs: T[]) {
  return [...logs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
  );
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatShortDate(iso: string) {
  const date = new Date(iso);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function filterWeightLogsByPeriod<T extends WeightLogInsightSource>(
  logs: T[],
  period: ProgressWeightPeriod,
  now = new Date(),
) {
  const sorted = sortByDateAsc(logs);
  const config = PROGRESS_WEIGHT_PERIODS.find((item) => item.id === period);
  if (!config?.days) return sorted;

  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - config.days);
  cutoff.setHours(0, 0, 0, 0);

  return sorted.filter((log) => new Date(log.logged_at) >= cutoff);
}

export function buildWeightTrendPoints(
  logs: WeightLogInsightSource[],
  period: ProgressWeightPeriod,
  now = new Date(),
): WeightTrendPoint[] {
  return filterWeightLogsByPeriod(logs, period, now).map((log) => ({
    date: formatShortDate(log.logged_at),
    isoDate: log.logged_at.split('T')[0] ?? log.logged_at,
    weight: log.weight_kg,
  }));
}

export function buildWeightTrendEvents(
  logs: WeightLogInsightSource[],
  period: ProgressWeightPeriod,
  goalWeightKg?: number | null,
  now = new Date(),
): WeightTrendEvent[] {
  const filtered = filterWeightLogsByPeriod(logs, period, now);
  if (!filtered.length) return [];

  const events: WeightTrendEvent[] = [];
  const first = filtered[0];
  if (first) {
    events.push({
      isoDate: first.logged_at.split('T')[0] ?? first.logged_at,
      label: 'Inicio',
      tone: 'milestone',
    });
  }

  let minWeight = Number.POSITIVE_INFINITY;
  let biggestPositiveShiftDate: string | null = null;
  let biggestPositiveShiftDelta: number | null = null;
  let biggestNegativeShiftDate: string | null = null;
  let biggestNegativeShiftDelta: number | null = null;

  filtered.forEach((log, index) => {
    if (index === 0) return;
    const previous = filtered[index - 1];
    if (!previous) return;
    const delta = Math.round((log.weight_kg - previous.weight_kg) * 10) / 10;
    const isoDate = log.logged_at.split('T')[0] ?? log.logged_at;

    if (delta > 0.5 && (biggestPositiveShiftDelta === null || delta > biggestPositiveShiftDelta)) {
      biggestPositiveShiftDate = isoDate;
      biggestPositiveShiftDelta = delta;
    }
    if (delta < -0.5 && (biggestNegativeShiftDelta === null || delta < biggestNegativeShiftDelta)) {
      biggestNegativeShiftDate = isoDate;
      biggestNegativeShiftDelta = delta;
    }
  });

  filtered.forEach((log) => {
    if (log.weight_kg < minWeight - 0.05) {
      minWeight = log.weight_kg;
      events.push({
        isoDate: log.logged_at.split('T')[0] ?? log.logged_at,
        label: 'Nuevo minimo',
        tone: 'milestone',
      });
    }

    if (goalWeightKg != null && Math.abs(log.weight_kg - goalWeightKg) <= 0.3) {
      events.push({
        isoDate: log.logged_at.split('T')[0] ?? log.logged_at,
        label: 'Meta cerca',
        tone: 'goal',
      });
    }
  });

  if (biggestNegativeShiftDate) {
    events.push({
      isoDate: biggestNegativeShiftDate,
      label: 'Semana mas ligera',
      tone: 'context',
    });
  }

  if (biggestPositiveShiftDate) {
    events.push({
      isoDate: biggestPositiveShiftDate,
      label: 'Rebote',
      tone: 'context',
    });
  }

  const deduped = new Map<string, WeightTrendEvent>();
  events.forEach((event) => {
    deduped.set(`${event.isoDate}:${event.label}`, event);
  });

  return [...deduped.values()]
    .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime())
    .slice(0, 4)
    .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());
}

export function getWeightPeriodComparison(
  logs: WeightLogInsightSource[],
  period: ProgressWeightPeriod,
  now = new Date(),
) {
  const sorted = sortByDateAsc(logs);
  if (!sorted.length) {
    return {
      currentAverage: null,
      previousAverage: null,
      delta: null,
      entries: 0,
    };
  }

  const config = PROGRESS_WEIGHT_PERIODS.find((item) => item.id === period);
  if (!config?.days) {
    const midpoint = Math.floor(sorted.length / 2) || 1;
    const previous = sorted.slice(0, midpoint);
    const current = sorted.slice(midpoint);
    const currentAverage = average(current.map((item) => item.weight_kg));
    const previousAverage = average(previous.map((item) => item.weight_kg));
    return {
      currentAverage,
      previousAverage,
      delta:
        currentAverage !== null && previousAverage !== null
          ?  Math.round((currentAverage - previousAverage) * 10) / 10
          : null,
      entries: current.length,
    };
  }

  const currentCutoff = new Date(now);
  currentCutoff.setDate(currentCutoff.getDate() - config.days);
  currentCutoff.setHours(0, 0, 0, 0);

  const previousCutoff = new Date(currentCutoff);
  previousCutoff.setDate(previousCutoff.getDate() - config.days);

  const current = sorted.filter((log) => new Date(log.logged_at) >= currentCutoff);
  const previous = sorted.filter((log) => {
    const date = new Date(log.logged_at);
    return date >= previousCutoff && date < currentCutoff;
  });

  const currentAverage = average(current.map((item) => item.weight_kg));
  const previousAverage = average(previous.map((item) => item.weight_kg));

  return {
    currentAverage,
    previousAverage,
    delta:
      currentAverage !== null && previousAverage !== null
        ?  Math.round((currentAverage - previousAverage) * 10) / 10
        : null,
    entries: current.length,
  };
}
