import type { UserProfile } from '@/types/user';

export type CoachProactivityLevel = 'silent' | 'normal' | 'active';
export type CoachSpecialty =
  | 'general_wellbeing'
  | 'weight_loss'
  | 'sport_performance'
  | 'female_hormonal';

export const DEFAULT_COACH_PROACTIVITY_LEVEL: CoachProactivityLevel = 'normal';
export const DEFAULT_COACH_SPECIALTY: CoachSpecialty = 'general_wellbeing';

export function isCoachProactivityLevel(value: unknown): value is CoachProactivityLevel {
  return value === 'silent' || value === 'normal' || value === 'active';
}

export function isCoachSpecialty(value: unknown): value is CoachSpecialty {
  return (
    value === 'general_wellbeing' ||
    value === 'weight_loss' ||
    value === 'sport_performance' ||
    value === 'female_hormonal'
  );
}

export function getCoachMemory(profile: UserProfile | null): Record<string, unknown> {
  if (profile?.coach_memory_json && typeof profile.coach_memory_json === 'object') {
    return profile.coach_memory_json as Record<string, unknown>;
  }
  return {};
}

export function getCoachProactivityLevel(profile: UserProfile | null): CoachProactivityLevel {
  const memory = getCoachMemory(profile);
  const raw = typeof memory.coach_proactivity_level === 'string'
    ? memory.coach_proactivity_level.trim().toLowerCase()
    : '';
  return isCoachProactivityLevel(raw) ? raw : DEFAULT_COACH_PROACTIVITY_LEVEL;
}

export function getCoachSpecialty(profile: UserProfile | null): CoachSpecialty {
  const memory = getCoachMemory(profile);
  const raw = typeof memory.coach_specialty === 'string'
    ? memory.coach_specialty.trim().toLowerCase()
    : '';
  return isCoachSpecialty(raw) ? raw : DEFAULT_COACH_SPECIALTY;
}

export function withCoachProactivity(
  coachMemory: Record<string, unknown> | null | undefined,
  level: CoachProactivityLevel,
): Record<string, unknown> {
  return {
    ...(coachMemory ?? {}),
    coach_proactivity_level: level,
  };
}

export function withCoachSpecialty(
  coachMemory: Record<string, unknown> | null | undefined,
  specialty: CoachSpecialty,
): Record<string, unknown> {
  return {
    ...(coachMemory ?? {}),
    coach_specialty: specialty,
  };
}
