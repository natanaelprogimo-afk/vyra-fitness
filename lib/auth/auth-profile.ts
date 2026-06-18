import type { OnboardingData } from '@/types/user';

export function normalizeOnboardingGoal(
  goal: OnboardingData['goal'],
): string | undefined {
  switch (goal) {
    case 'health':
      return 'general_health';
    case 'performance':
      return 'sport_performance';
    case 'mental':
      return 'mental_wellbeing';
    default:
      return goal;
  }
}

export function normalizeOnboardingGender(
  gender: OnboardingData['gender'],
): string | undefined {
  if (gender === 'other') return 'non_binary';
  return gender;
}

export function sanitizeActiveModules(modules: unknown): string[] {
  if (!Array.isArray(modules)) return [];
  return modules
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());
}
