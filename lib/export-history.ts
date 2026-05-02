import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPORT_HISTORY_KEY = 'vyra-export-history';
const EXPORT_HISTORY_LIMIT = 8;

export type ExportHistoryEntry = {
  id: string;
  format: 'json' | 'csv' | 'pdf';
  label: string;
  detail?: string | null;
  createdAt: string;
};

function isExportHistoryEntry(value: unknown): value is ExportHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.format === 'string' &&
    typeof record.label === 'string' &&
    typeof record.createdAt === 'string'
  );
}

export async function loadRecentExportHistory(): Promise<ExportHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(EXPORT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isExportHistoryEntry).slice(0, EXPORT_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export async function recordExportHistory(
  entry: Omit<ExportHistoryEntry, 'id' | 'createdAt'>,
): Promise<ExportHistoryEntry[]> {
  const nextEntry: ExportHistoryEntry = {
    id: `${entry.format}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };

  const current = await loadRecentExportHistory();
  const next = [nextEntry, ...current].slice(0, EXPORT_HISTORY_LIMIT);
  await AsyncStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(next));
  return next;
}
