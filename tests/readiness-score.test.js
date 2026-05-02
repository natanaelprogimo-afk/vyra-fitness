const {
  applyLocalWorkoutToDailyScore,
  buildScoreHistoryRow,
  normalizeDailyScorePayload,
  normalizeScoreBreakdown,
  upsertScoreHistoryRow,
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
    expect(payload.meta.hasWorkoutLog).toBe(false);
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

  test('injects local workout into the visible score when backend has not seen the session yet', () => {
    const score = applyLocalWorkoutToDailyScore(
      normalizeDailyScorePayload(
        {
          score: 54,
          date: '2026-04-26',
          breakdown: {
            hydration: 62,
            steps: 18,
            sleep: 70,
            nutrition: 56,
            mental: 68,
          },
          meta: {
            stressCapped: false,
            hasWorkoutLog: false,
          },
        },
        '2026-04-26',
      ),
      true,
    );

    expect(score.score).toBe(74);
    expect(score.breakdown.activity).toBe(100);
    expect(score.meta.hasWorkoutLog).toBe(true);
  });

  test('upserts the resolved score row into history for progress surfaces', () => {
    const score = applyLocalWorkoutToDailyScore(
      normalizeDailyScorePayload(
        {
          score: 60,
          date: '2026-04-26',
          breakdown: {
            hydration: 60,
            steps: 40,
            sleep: 70,
            nutrition: 55,
            mental: 65,
          },
          meta: {
            hasWorkoutLog: false,
          },
        },
        '2026-04-26',
      ),
      true,
    );

    const history = upsertScoreHistoryRow(
      [
        {
          date: '2026-04-25',
          total_score: 58,
          hydration_pct: 50,
          sleep_pct: 71,
          activity_pct: 35,
          nutrition_pct: 53,
          mental_pct: 60,
        },
      ],
      score,
    );

    expect(history).toEqual([
      {
        date: '2026-04-25',
        total_score: 58,
        hydration_pct: 50,
        sleep_pct: 71,
        activity_pct: 35,
        nutrition_pct: 53,
        mental_pct: 60,
      },
      buildScoreHistoryRow(score),
    ]);
  });
});
