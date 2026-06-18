import {
  DEFAULT_ACTIVE_MODULES,
  MODULES,
  type ModuleId,
} from '@/constants/modules';
import { getProfileContextMemory } from '@/lib/profile-context';
import type { UserProfile } from '@/types/user';

const ALL_MODULE_IDS: ModuleId[] = MODULES.map((module) => module.id as ModuleId);
const MODULE_SET = new Set<string>(ALL_MODULE_IDS);

function sanitizeModules(input: unknown): ModuleId[] {
  if (!Array.isArray(input)) return [];
  const unique = new Set<ModuleId>();
  const ordered: ModuleId[] = [];

  input.forEach((value) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!MODULE_SET.has(trimmed)) return;
    const moduleId = trimmed as ModuleId;
    if (unique.has(moduleId)) return;
    unique.add(moduleId);
    ordered.push(moduleId);
  });

  return ordered;
}

export function getActiveModules(profile: UserProfile | null | undefined): ModuleId[] {
  if (!profile) return DEFAULT_ACTIVE_MODULES;

  const direct = sanitizeModules((profile as unknown as Record<string, unknown>).active_modules);
  if (direct.length >= 1) return direct;

  const memory = getProfileContextMemory(profile);
  const fromMemory = sanitizeModules(memory.active_modules);
  if (fromMemory.length >= 1) return fromMemory;

  return DEFAULT_ACTIVE_MODULES;
}

export function buildProfileContextWithActiveModules(
  profile: UserProfile | null | undefined,
  modules: ModuleId[],
): Record<string, unknown> {
  const existing = getProfileContextMemory(profile);

  const sanitized = sanitizeModules(modules);

  return {
    ...existing,
    active_modules: sanitized.length >= 1 ? sanitized : DEFAULT_ACTIVE_MODULES,
  };
}

export const ALL_ACTIVE_MODULES = ALL_MODULE_IDS;
