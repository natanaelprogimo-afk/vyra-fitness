import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import type { FemaleHealthEntry } from '@/hooks/useFemaleHealth';
import type { FemalePhase } from '@/lib/female-phase';

export type FemaleTabKey = 'cycle' | 'symptoms' | 'history' | 'settings';

export const FEMALE_PHASE_META: Record<
  FemalePhase,
  {
    label: string;
    short: string;
    accent: string;
    ringAccent: string;
    icon: string;
  }
> = {
  menstrual: {
    label: 'Menstruacion',
    short: 'Menstrual',
    accent: '#F06A6A',
    ringAccent: '#FF7D73',
    icon: 'water',
  },
  follicular: {
    label: 'Folicular',
    short: 'Folicular',
    accent: '#2CC08A',
    ringAccent: '#22AA78',
    icon: 'leaf',
  },
  ovulation: {
    label: 'Ovulacion',
    short: 'Ovulacion',
    accent: '#E9A83F',
    ringAccent: '#F0B24C',
    icon: 'sunny',
  },
  luteal: {
    label: 'Lutea',
    short: 'Lutea',
    accent: '#9B84FF',
    ringAccent: '#8A72FF',
    icon: 'moon',
  },
};

export const FEMALE_TABS = [
  { key: 'cycle' as const, label: 'Ciclo', route: Routes.female.index },
  { key: 'symptoms' as const, label: 'Sintomas', route: Routes.female.symptoms },
  { key: 'history' as const, label: 'Historial', route: Routes.female.history },
  { key: 'settings' as const, label: 'Ajustes', route: Routes.female.settings },
] as const;

export const BLEEDING_OPTIONS = [
  { key: 'sangrado_ligero', label: 'Ligero', severity: 1 },
  { key: 'sangrado_moderado', label: 'Moderado', severity: 2 },
  { key: 'sangrado_abundante', label: 'Abundante', severity: 4 },
  { key: 'sangrado_muy_abundante', label: 'Muy abundante', severity: 5 },
] as const;

export const FEMALE_SYMPTOMS_BY_PHASE: Record<
  FemalePhase,
  { primary: string[]; secondary: string[] }
> = {
  menstrual: {
    primary: ['colicos', 'fatiga', 'hinchazon', 'migranas'],
    secondary: ['cambios de humor', 'sensibilidad mamaria', 'flujo vaginal', 'acne', 'libido baja', 'energia alta'],
  },
  follicular: {
    primary: ['energia alta', 'flujo vaginal', 'libido baja'],
    secondary: ['fatiga', 'hinchazon', 'acne', 'cambios de humor', 'migranas'],
  },
  ovulation: {
    primary: ['energia alta', 'flujo vaginal', 'libido baja'],
    secondary: ['hinchazon', 'migranas', 'acne', 'fatiga', 'cambios de humor'],
  },
  luteal: {
    primary: ['cambios de humor', 'sensibilidad mamaria', 'hinchazon', 'fatiga'],
    secondary: ['acne', 'migranas', 'colicos', 'libido baja', 'flujo vaginal', 'energia alta'],
  },
};

export function getPhaseProgress(currentPhase: FemalePhase, cycleDayZeroBased: number, cycleLength: number, bleedDays = 5) {
  const safeCycleLength = Math.max(21, Math.min(35, Math.round(cycleLength || 28)));
  const safeBleedDays = Math.max(3, Math.min(8, Math.round(bleedDays || 5)));
  const ovulationStart = 13;
  const ovulationEnd = 16;
  const follicularStart = safeBleedDays;
  const follicularEnd = ovulationStart;
  const lutealStart = ovulationEnd;

  let phaseDay = 1;
  let phaseLength = safeBleedDays;

  if (currentPhase === 'menstrual') {
    phaseDay = Math.max(1, Math.min(safeBleedDays, cycleDayZeroBased + 1));
    phaseLength = safeBleedDays;
  } else if (currentPhase === 'follicular') {
    phaseDay = Math.max(1, cycleDayZeroBased - follicularStart + 1);
    phaseLength = Math.max(1, follicularEnd - follicularStart);
  } else if (currentPhase === 'ovulation') {
    phaseDay = Math.max(1, cycleDayZeroBased - ovulationStart + 1);
    phaseLength = Math.max(1, ovulationEnd - ovulationStart);
  } else {
    phaseDay = Math.max(1, cycleDayZeroBased - lutealStart + 1);
    phaseLength = Math.max(1, safeCycleLength - lutealStart);
  }

  const progress = Math.max(0, Math.min(100, Math.round((phaseDay / phaseLength) * 100)));
  return { phaseDay, phaseLength, progress };
}

export function buildCycleCalendar(entries: FemaleHealthEntry[], currentMonth = new Date()) {
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 12, 0, 0);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const entryMap = new Map(
    entries.map((entry) => [entry.logged_at?.split('T')[0] ?? '', entry]),
  );

  const cells: Array<{ day: number | null; iso: string | null; entry: FemaleHealthEntry | null }> = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ day: null, iso: null, entry: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12, 0, 0);
    const iso = date.toISOString().split('T')[0] ?? null;
    cells.push({
      day,
      iso,
      entry: iso ? entryMap.get(iso) ?? null : null,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, iso: null, entry: null });
  }

  return cells;
}

function buildMenstrualRuns(entries: FemaleHealthEntry[]) {
  const menstrualDays = entries
    .filter((entry) => entry.phase === 'menstrual')
    .map((entry) => entry.logged_at?.split('T')[0] ?? '')
    .filter(Boolean)
    .sort();

  if (!menstrualDays.length) return [] as Array<{ start: string; length: number }>;

  const runs: Array<{ start: string; length: number }> = [];
  let currentStart = menstrualDays[0];
  let currentLength = 1;

  for (let index = 1; index < menstrualDays.length; index += 1) {
    const previous = new Date(`${menstrualDays[index - 1]}T12:00:00`).getTime();
    const current = new Date(`${menstrualDays[index]}T12:00:00`).getTime();
    const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentLength += 1;
    } else {
      runs.push({ start: currentStart, length: currentLength });
      currentStart = menstrualDays[index];
      currentLength = 1;
    }
  }

  runs.push({ start: currentStart, length: currentLength });
  return runs;
}

export function buildCycleComparison(entries: FemaleHealthEntry[]) {
  const runs = buildMenstrualRuns(entries);
  if (runs.length < 2) return null;

  const intervals: number[] = [];
  for (let index = 1; index < runs.length; index += 1) {
    const previous = new Date(`${runs[index - 1].start}T12:00:00`).getTime();
    const current = new Date(`${runs[index].start}T12:00:00`).getTime();
    intervals.push(Math.round((current - previous) / (1000 * 60 * 60 * 24)));
  }

  if (!intervals.length) return null;

  const averageCycle = Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length);
  const averageBleed = Math.round(runs.reduce((sum, run) => sum + run.length, 0) / runs.length);
  const variance = Math.max(...intervals) - Math.min(...intervals);
  const symptomCounts = new Map<string, number>();

  for (const entry of entries) {
    for (const symptom of entry.symptoms ?? []) {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1);
    }
  }

  const symptomPeak = [...symptomCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([symptom, count]) => ({ symptom, count }));

  return {
    cyclesTracked: runs.length,
    averageCycle,
    averageBleed,
    varianceLabel: variance <= 3 ? 'Regular' : variance <= 6 ? 'Variable' : 'Inestable',
    symptomPeak,
  };
}

export function getSymptomLabel(symptom: string) {
  const labels: Record<string, string> = {
    colicos: 'Colicos',
    hinchazon: 'Hinchazon',
    fatiga: 'Fatiga',
    migranas: 'Migranas',
    sensibilidad_mamaria: 'Sensib. mamaria',
    'sensibilidad mamaria': 'Sensib. mamaria',
    cambios_de_humor: 'Cambios de humor',
    'cambios de humor': 'Cambios de humor',
    acne: 'Acne',
    flujo_vaginal: 'Flujo vaginal',
    'flujo vaginal': 'Flujo vaginal',
    libido_baja: 'Libido baja',
    'libido baja': 'Libido baja',
    energia_alta: 'Energia alta',
    'energia alta': 'Energia alta',
    sangrado_ligero: 'Sangrado ligero',
    sangrado_moderado: 'Sangrado moderado',
    sangrado_abundante: 'Sangrado abundante',
    sangrado_muy_abundante: 'Sangrado muy abundante',
  };
  return labels[symptom] ?? symptom;
}

export function getPhaseDisclaimer() {
  return 'Este modulo es informativo. No reemplaza seguimiento ni consejo medico.';
}

export function buildNextPeriodLabel(nextPeriodDate: string | null) {
  if (!nextPeriodDate) {
    return {
      title: '--',
      subtitle: 'Configura el ciclo para calcularlo.',
    };
  }

  const target = new Date(`${nextPeriodDate}T00:00:00`).getTime();
  const diffDays = Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));
  return {
    title: `En ${diffDays} dias`,
    subtitle: new Date(`${nextPeriodDate}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
  };
}

export function getFemaleModuleAccent(phase: FemalePhase) {
  return FEMALE_PHASE_META[phase]?.accent ?? Colors.female;
}
