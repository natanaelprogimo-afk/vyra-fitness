const {
  buildEngagementWeekDots,
  calculateEngagementStreak,
  createActiveDateSet,
  normalizeEngagementDate,
} = require('../lib/engagement-streak');

describe('engagement streak helpers', () => {
  test('normalizes full timestamps to yyyy-mm-dd', () => {
    expect(normalizeEngagementDate('2026-04-30T10:15:00.000Z')).toBe('2026-04-30');
    expect(normalizeEngagementDate('2026-04-30')).toBe('2026-04-30');
    expect(normalizeEngagementDate('')).toBeNull();
  });

  test('counts streaks from any active date source', () => {
    const activeDates = createActiveDateSet([
      ['2026-04-30T08:00:00.000Z'],
      ['2026-04-29'],
      ['2026-04-28T22:00:00.000Z'],
    ]);

    expect(calculateEngagementStreak(activeDates, '2026-04-30', 10)).toBe(3);
    expect(calculateEngagementStreak(activeDates, '2026-05-01', 10)).toBe(0);
  });

  test('builds the weekly dots with completion state', () => {
    const activeDates = createActiveDateSet([
      ['2026-04-30', '2026-04-28', '2026-04-26'],
    ]);

    const dots = buildEngagementWeekDots(activeDates, 7);

    expect(dots).toHaveLength(7);
    expect(dots[dots.length - 1].isToday).toBe(true);
  });
});
