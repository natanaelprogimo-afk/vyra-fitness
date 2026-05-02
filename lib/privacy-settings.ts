import { getProfileContextMemory } from '@/lib/profile-context';

type ProfileLike = {
  context_memory_json?: unknown;
} | null | undefined;

export function getContextMemory(profile: ProfileLike): Record<string, unknown> {
  return getProfileContextMemory(profile);
}

export function isStrictSensitiveMode(profile: ProfileLike): boolean {
  return Boolean(getContextMemory(profile).privacy_strict_sensitive_mode);
}
