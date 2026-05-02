import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FASTING_PHASES, PROTOCOLS } from '@/hooks/useFasting';

export type FastingTabKey = 'home' | 'protocols' | 'settings' | 'analysis';

export const FASTING_TABS: Array<{ key: FastingTabKey; label: string; route: string }> = [
  { key: 'home', label: 'Hoy', route: Routes.fasting.index },
  { key: 'protocols', label: 'Protocolos', route: Routes.fasting.protocols },
  { key: 'settings', label: 'Ajustes', route: Routes.fasting.settings },
  { key: 'analysis', label: 'Análisis', route: Routes.fasting.analysis },
];

export type FastingHistoryItem = {
  id: string;
  protocol?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  total_hours?: number | null;
  status?: string | null; // 'completed' | 'interrupted' | 'planned' | 'missed' | 'active' | 'normal'
  completed?: boolean;
  abandoned?: boolean; // legacy
  interrupted?: boolean; // legacy alias
  max_phase_reached?: string | null;
};

export function getFastingConfidenceLabel(confidence?: string | null) {
  switch (confidence) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    default:
      return 'Base';
  }
}

export function getFastingConfidenceColor(confidence?: string | null) {
  switch (confidence) {
    case 'high':
      return Colors.success;
    case 'medium':
      return Colors.warning;
    default:
      return Colors.textMuted;
  }
}

export function getFastingProtocolMeta(protocolId?: string | null) {
  const protocol = PROTOCOLS[protocolId ?? '16:8'] ?? PROTOCOLS['16:8'];
  const intensity =
    protocol.targetHours >= 24
      ?  'Avanzado'
      : protocol.targetHours >= 18
        ?  'Intermedio'
        : 'Base';
  return {
    id: protocolId ?? '16:8',
    ...protocol,
    intensity,
    isDemanding: protocol.targetHours >= 20,
  };
}

export function getFastingPhaseMeta(phaseId?: string | null) {
  return FASTING_PHASES.find((phase) => phase.id === phaseId) ?? FASTING_PHASES[0]!;
}

export function getFastingPhaseProgress(
  elapsedHours: number,
  currentPhaseId?: string | null,
  nextPhaseId?: string | null,
  targetHours = 16,
) {
  const current = getFastingPhaseMeta(currentPhaseId);
  const next = nextPhaseId ? getFastingPhaseMeta(nextPhaseId) : null;
  const phaseStart = current.hours;
  const phaseEnd = next?.hours ?? targetHours;
  const duration = Math.max(phaseEnd - phaseStart, 1);
  const raw = ((elapsedHours - phaseStart) / duration) * 100;
  return {
    current,
    next,
    progress: Math.max(0, Math.min(100, raw)),
    phaseStart,
    phaseEnd,
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

export function groupFastingHistoryByWeek(items: FastingHistoryItem[]) {
  const groups = new Map<string, { key: string; label: string; items: FastingHistoryItem[] }>();
  const sorted = [...items].sort((a, b) => {
    const left = new Date(b.end_time ?? b.start_time ?? 0).getTime();
    const right = new Date(a.end_time ?? a.start_time ?? 0).getTime();
    return left - right;
  });

  for (const item of sorted) {
    const source = item.end_time ?? item.start_time;
    if (!source) continue;
    const start = weekStart(new Date(source));
    const key = start.toISOString().split('T')[0] ?? source;
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatWeekLabel(start), items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  return [...groups.values()];
}

export function buildRecentFastingBars(items: FastingHistoryItem[], days = 7) {
  const bars: Array<{ key: string; label: string; hours: number; completed: boolean }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const iso = date.toISOString().split('T')[0] ?? '';
    const sameDay = items.filter((item) => {
      const source = item.end_time ?? item.start_time;
      return source?.startsWith(iso);
    });
    const winner = sameDay.sort((a, b) => Number(b.total_hours ?? 0) - Number(a.total_hours ?? 0))[0];
    bars.push({
      key: iso,
      label: date.toLocaleDateString('es-UY', { weekday: 'short' }).replace('.', ''),
      hours: Number(winner?.total_hours ?? 0),
      completed: Boolean((winner as unknown as { status?: string | null })?.status === 'completed' || winner?.completed),
    });
  }

  return bars;
}

export function formatFastingEntryDate(value?: string | null) {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: 'short',
  });
}
