import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomWaterDrinkPreset {
  id: string;
  name: string;
  hydrationFactor: number;
  createdAt: string;
  lastUsedAt: string;
}

export interface CustomWaterLogMeta {
  name: string;
  hydrationFactor: number;
  presetId?: string | null;
  savedAt: string;
}

type WaterLogLike = {
  drink_type: string;
  amount_ml: number;
  hydration_equivalent_ml: number;
  logged_at: string;
};

const MAX_CUSTOM_DRINKS = 8;
const MAX_LOG_META = 400;

function presetsKey(userId: string) {
  return `@vyra/water/custom-presets/${userId}`;
}

function logMetaKey(userId: string) {
  return `@vyra/water/custom-log-meta/${userId}`;
}

function clampHydrationFactor(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0, Math.min(1.2, Math.round(value * 100) / 100));
}

function normalizePreset(raw: unknown): CustomWaterDrinkPreset | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === 'string' ? item.id.trim() : '';
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  if (!id || !name) return null;

  return {
    id,
    name,
    hydrationFactor: clampHydrationFactor(Number(item.hydrationFactor)),
    createdAt:
      typeof item.createdAt === 'string' && item.createdAt.trim()
        ? item.createdAt
        : new Date().toISOString(),
    lastUsedAt:
      typeof item.lastUsedAt === 'string' && item.lastUsedAt.trim()
        ? item.lastUsedAt
        : new Date().toISOString(),
  };
}

function normalizeMeta(raw: unknown): CustomWaterLogMeta | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  if (!name) return null;

  return {
    name,
    hydrationFactor: clampHydrationFactor(Number(item.hydrationFactor)),
    presetId: typeof item.presetId === 'string' && item.presetId.trim() ? item.presetId : null,
    savedAt:
      typeof item.savedAt === 'string' && item.savedAt.trim()
        ? item.savedAt
        : new Date().toISOString(),
  };
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function buildCustomWaterLogMetaKey(log: WaterLogLike) {
  return [
    log.drink_type || 'water',
    Math.round(Number(log.amount_ml ?? 0)),
    Math.round(Number(log.hydration_equivalent_ml ?? 0)),
    new Date(log.logged_at).toISOString(),
  ].join('|');
}

export async function listCustomWaterDrinks(userId: string): Promise<CustomWaterDrinkPreset[]> {
  const parsed = await readJson<unknown[]>(presetsKey(userId), []);
  return parsed
    .map(normalizePreset)
    .filter((item): item is CustomWaterDrinkPreset => Boolean(item))
    .sort((left, right) => right.lastUsedAt.localeCompare(left.lastUsedAt))
    .slice(0, MAX_CUSTOM_DRINKS);
}

export async function saveCustomWaterDrinkPreset(
  userId: string,
  input: { id?: string | null; name: string; hydrationFactor: number },
): Promise<CustomWaterDrinkPreset> {
  const current = await listCustomWaterDrinks(userId);
  const normalizedName = input.name.trim();
  const now = new Date().toISOString();
  const existing =
    current.find((item) => item.id === input.id) ??
    current.find((item) => item.name.toLowerCase() === normalizedName.toLowerCase());

  const nextPreset: CustomWaterDrinkPreset = {
    id:
      existing?.id ??
      input.id?.trim() ??
      `drink_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: normalizedName,
    hydrationFactor: clampHydrationFactor(input.hydrationFactor),
    createdAt: existing?.createdAt ?? now,
    lastUsedAt: now,
  };

  const next = [
    nextPreset,
    ...current.filter((item) => item.id !== nextPreset.id),
  ].slice(0, MAX_CUSTOM_DRINKS);

  await writeJson(presetsKey(userId), next);
  return nextPreset;
}

export async function listCustomWaterLogMeta(userId: string): Promise<Record<string, CustomWaterLogMeta>> {
  const parsed = await readJson<Record<string, unknown>>(logMetaKey(userId), {});
  const next: Record<string, CustomWaterLogMeta> = {};

  for (const [key, value] of Object.entries(parsed)) {
    const normalized = normalizeMeta(value);
    if (normalized) {
      next[key] = normalized;
    }
  }

  return next;
}

export async function saveCustomWaterLogMeta(
  userId: string,
  key: string,
  meta: { name: string; hydrationFactor: number; presetId?: string | null },
): Promise<void> {
  const current = await listCustomWaterLogMeta(userId);
  const next: Record<string, CustomWaterLogMeta> = {
    ...current,
    [key]: {
      name: meta.name.trim(),
      hydrationFactor: clampHydrationFactor(meta.hydrationFactor),
      presetId: meta.presetId?.trim() || null,
      savedAt: new Date().toISOString(),
    },
  };

  const orderedEntries = Object.entries(next)
    .sort((left, right) => right[1].savedAt.localeCompare(left[1].savedAt))
    .slice(0, MAX_LOG_META);

  await writeJson(logMetaKey(userId), Object.fromEntries(orderedEntries));
}
