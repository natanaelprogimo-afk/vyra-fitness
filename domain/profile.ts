export const PROFILE_CONTEXT_MEMORY_SELECT = 'context_memory_json, coach_memory_json';
export const PROFILE_CONTEXT_NAME_SELECT = 'context_name_preference, coach_name_preference';
export const PROFILE_CONTEXT_SELECT = `${PROFILE_CONTEXT_NAME_SELECT}, ${PROFILE_CONTEXT_MEMORY_SELECT}`;

type ProfileLike =
  | {
      context_memory_json?: unknown;
      coach_memory_json?: unknown;
      context_name_preference?: unknown;
      coach_name_preference?: unknown;
    }
  | null
  | undefined;

export function getProfileContextMemory(profile: ProfileLike): Record<string, unknown> {
  if (profile?.context_memory_json && typeof profile.context_memory_json === 'object') {
    return profile.context_memory_json as Record<string, unknown>;
  }

  if (profile?.coach_memory_json && typeof profile.coach_memory_json === 'object') {
    return profile.coach_memory_json as Record<string, unknown>;
  }

  return {};
}

export function getProfileContextName(
  profile: ProfileLike,
  fallback: string | null = null,
): string | null {
  const candidates = [
    profile?.context_name_preference,
    profile?.coach_name_preference,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return fallback;
}

export function buildProfileContextUpdate(input: {
  memory?: Record<string, unknown> | null;
  name?: string | null;
}): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  if (Object.prototype.hasOwnProperty.call(input, 'memory')) {
    const nextMemory =
      input.memory && typeof input.memory === 'object'
        ? input.memory
        : {};
    updates.context_memory_json = nextMemory;
    updates.coach_memory_json = nextMemory;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'name')) {
    const nextName =
      typeof input.name === 'string' && input.name.trim().length > 0
        ? input.name.trim()
        : null;
    updates.context_name_preference = nextName;
    updates.coach_name_preference = nextName;
  }

  return updates;
}

export function buildLegacyProfileContextUpdate(input: {
  memory?: Record<string, unknown> | null;
  name?: string | null;
}): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  if (Object.prototype.hasOwnProperty.call(input, 'memory')) {
    const nextMemory =
      input.memory && typeof input.memory === 'object'
        ? input.memory
        : {};
    updates.coach_memory_json = nextMemory;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'name')) {
    const nextName =
      typeof input.name === 'string' && input.name.trim().length > 0
        ? input.name.trim()
        : null;
    updates.coach_name_preference = nextName;
  }

  return updates;
}

export function shouldFallbackToLegacyProfileContext(error: unknown): boolean {
  const message =
    typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : error instanceof Error
        ? error.message
        : '';

  const normalized = message.toLowerCase();

  return (
    normalized.includes('context_memory_json') ||
    normalized.includes('context_name_preference') ||
    normalized.includes("column 'context_") ||
    normalized.includes('column "context_')
  );
}
