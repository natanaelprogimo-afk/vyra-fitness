type ProfileLike = { coach_memory_json?: unknown } | null | undefined;

export function getCoachMemory(profile: ProfileLike): Record<string, unknown> {
  if (profile?.coach_memory_json && typeof profile.coach_memory_json === 'object') {
    return profile.coach_memory_json as Record<string, unknown>;
  }
  return {};
}

export function isStrictSensitiveMode(profile: ProfileLike): boolean {
  return Boolean(getCoachMemory(profile).privacy_strict_sensitive_mode);
}
