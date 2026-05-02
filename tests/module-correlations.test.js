const {
  buildDailyContextBrief,
  buildFastingWorkoutWeightInsight,
  buildFemaleReadinessInsight,
  buildSleepReadinessInsight,
  buildSupplementNutritionInsight,
  getPaywallContextCopy,
} = require('../lib/module-correlations');

describe('module correlations helpers', () => {
  test('flags fasting plus workout overload when fatigue is high', () => {
    expect(
      buildFastingWorkoutWeightInsight({
        sessionsThisWeek: 4,
        fatigueLevel: 'high',
        recommendRecoveryDay: true,
        currentProtocol: '16:8',
      }),
    ).toEqual(
      expect.objectContaining({
        tone: 'warning',
      }),
    );
  });

  test('adapts female guidance with readiness score', () => {
    expect(
      buildFemaleReadinessInsight({
        phaseName: 'Ovulacion',
        readinessScore: 84,
        trainingGuidance: 'Ventana de alta energia.',
        nutritionGuidance: 'Prioriza antioxidantes.',
        fatigueLevel: 'low',
      }),
    ).toEqual(
      expect.objectContaining({
        tone: 'positive',
      }),
    );
  });

  test('anchors supplements to meals when food timing is weak', () => {
    expect(
      buildSupplementNutritionInsight({
        supplementCount: 3,
        takenToday: 0,
        proteinGrams: 20,
        calories: 350,
        hasBreakfast: false,
        hasLunch: false,
        hasDinner: false,
        hasWarnings: false,
      }),
    ).toEqual(
      expect.objectContaining({
        tone: 'neutral',
      }),
    );
  });

  test('returns contextual included-access copy for progress trigger', () => {
    expect(getPaywallContextCopy('progress_trends')).toEqual(
      expect.objectContaining({
        eyebrow: 'Progreso cruzado',
      }),
    );
  });

  test('warns when sleep debt and readiness suggest recovery', () => {
    expect(
      buildSleepReadinessInsight({
        sleepDebtHours: 2.1,
        avgLast3Hours: 5.8,
        readinessScore: 54,
        workoutRecommendation: 'recovery',
        fatigueLevel: 'high',
        sleepStreakDays: 0,
      }),
    ).toEqual(
      expect.objectContaining({
        tone: 'warning',
      }),
    );
  });

  test('builds a strong context brief when recovery is solid', () => {
    expect(
      buildDailyContextBrief({
        readinessScore: 83,
        sleepHours: 7.9,
        calories: 1450,
        proteinGrams: 112,
        fatigueLevel: 'low',
        activeFast: false,
        mentalScore: 74,
      }),
    ).toEqual(
      expect.objectContaining({
        title: 'Buen contexto para rendir',
      }),
    );
  });
});
