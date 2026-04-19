const {
  normalizeDailyScorePayload,
  normalizeScoreBreakdown,
} = require('../lib/readiness-score');

describe('readiness score normalization', () => {
  test('maps backend score payloads with steps and extra metrics into the canonical breakdown', () => {
    const payload = normalizeDailyScorePayload(
      {
        score: 58,
        date: '2026-04-15',
        breakdown: {
          hydration: 40,
          steps: 32,
          sleep: 71,
          nutrition: 50,
          workout: 84,
          recovery: 76,
          mental: 45,
        },
        meta: {
          hasWaterLog: true,
          steps: 4100,
        },
      },
      '2026-04-15',
    );

    expect(payload.breakdown).toEqual({
      hydration: 40,
      activity: 32,
      sleep: 71,
      nutrition: 50,
      mental: 45,
    });
    expect(Object.keys(payload.breakdown)).toEqual([
      'hydration',
      'activity',
      'sleep',
      'nutrition',
      'mental',
    ]);
    expect(payload.meta.steps).toBe(4100);
  });

  test('falls back to zeros when the score breakdown is sparse or invalid', () => {
    expect(
      normalizeScoreBreakdown({
        hydration_pct: '75',
        activity: null,
        sleep: undefined,
        mental: 'nope',
      }),
    ).toEqual({
      hydration: 75,
      activity: 0,
      sleep: 0,
      nutrition: 0,
      mental: 0,
    });
  });
});
