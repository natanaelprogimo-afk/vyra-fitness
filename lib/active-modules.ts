import { MODULES, type ModuleId } from '@/constants/modules';
import type { UserProfile } from '@/types/user';

const ALL_MODULE_IDS: ModuleId[] = MODULES.map((module) => module.id as ModuleId);
const MODULE_SET = new Set<string>(ALL_MODULE_IDS);

function sanitizeModules(input: unknown): ModuleId[] {
  if (!Array.isArray(input)) return [];
  const unique = new Set<ModuleId>();

  input.forEach((value) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!MODULE_SET.has(trimmed)) return;
    unique.add(trimmed as ModuleId);
  });

  return [...unique];
}

export function getActiveModules(profile: UserProfile | null | undefined): ModuleId[] {
  if (!profile) return ALL_MODULE_IDS;

  const direct = sanitizeModules((profile as unknown as Record<string, unknown>).active_modules);
  if (direct.length > 0) return direct;

  const memory =
    profile.coach_memory_json && typeof profile.coach_memory_json === 'object'
      ? (profile.coach_memory_json as Record<string, unknown>)
      : null;

  const fromMemory = sanitizeModules(memory?.active_modules);
  if (fromMemory.length > 0) return fromMemory;

  return ALL_MODULE_IDS;
}

export function buildCoachMemoryWithActiveModules(
  profile: UserProfile | null | undefined,
  modules: ModuleId[],
): Record<string, unknown> {
  const existing =
    profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
      ? (profile.coach_memory_json as Record<string, unknown>)
      : {};

  const sanitized = sanitizeModules(modules);

  return {
    ...existing,
    active_modules: sanitized.length > 0 ? sanitized : ALL_MODULE_IDS,
  };
}

export const ALL_ACTIVE_MODULES = ALL_MODULE_IDS;
