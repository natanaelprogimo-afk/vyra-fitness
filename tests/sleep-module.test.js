const {
  buildSleepWeeklySummary,
  getSleepDurationHours,
} = require('../lib/sleep-module');

describe('sleep module helpers', () => {
  test('calculates duration correctly across midnight', () => {
    const bedtime = new Date('2026-04-12T23:15:00');
    const wakeTime = new Date('2026-04-12T06:45:00');

    expect(getSleepDurationHours(bedtime, wakeTime)).toBe(7.5);
  });

  test('builds a weekly summary from sleep history', () => {
    const summary = buildSleepWeeklySummary(
      [
        { duration_min: 420, quality_score: 70 },
        { duration_min: 480, quality_score: 85 },
        { duration_min: 450, quality_score: 75 },
      ],
      8,
    );

    expect(summary.nights).toBe(3);
    expect(summary.avgHours).toBe(7.5);
    expect(summary.avgScore).toBe(77);
    expect(summary.goalNights).toBe(1);
  });
});
