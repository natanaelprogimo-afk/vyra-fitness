const {
  normalizeOnboardingGender,
  normalizeOnboardingGoal,
  sanitizeActiveModules,
} = require('../lib/auth-profile');

describe('auth profile helpers', () => {
  test('maps onboarding goals to backend values', () => {
    expect(normalizeOnboardingGoal('health')).toBe('general_health');
    expect(normalizeOnboardingGoal('performance')).toBe('sport_performance');
    expect(normalizeOnboardingGoal('mental')).toBe('mental_wellbeing');
  });

  test('normalizes gender while preserving supported values', () => {
    expect(normalizeOnboardingGender('other')).toBe('non_binary');
    expect(normalizeOnboardingGender('female')).toBe('female');
    expect(normalizeOnboardingGender(undefined)).toBeUndefined();
  });

  test('sanitizes active modules by trimming and dropping blanks', () => {
    expect(
      sanitizeActiveModules([' sleep ', '', 'nutrition', 42, null]),
    ).toEqual(['sleep', 'nutrition']);
    expect(sanitizeActiveModules(null)).toEqual([]);
  });
});
