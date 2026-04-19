const {
  adjustRepsValue,
  adjustWeightValue,
  formatWorkoutSessionTime,
  getWorkoutLoadSuggestion,
  getWorkoutPrHighlights,
  parseWorkoutSetInput,
} = require('../lib/workout-session');

describe('workout session helpers', () => {
  test('formats elapsed session time', () => {
    expect(formatWorkoutSessionTime(0)).toBe('00:00');
    expect(formatWorkoutSessionTime(65)).toBe('01:05');
    expect(formatWorkoutSessionTime(3723)).toBe('62:03');
  });

  test('parses reps and weight including comma decimals', () => {
    expect(parseWorkoutSetInput('10', '22,5')).toEqual({
      reps: 10,
      weight: 22.5,
      isValid: true,
    });

    expect(parseWorkoutSetInput('0', '-2')).toEqual({
      reps: 0,
      weight: -2,
      isValid: false,
    });
  });

  test('adjusters clamp to safe minimums', () => {
    expect(adjustRepsValue('1', -1)).toBe('1');
    expect(adjustRepsValue('8', 2)).toBe('10');
    expect(adjustWeightValue('0', -2.5)).toBe('0.0');
    expect(adjustWeightValue('20', 2.5)).toBe('22.5');
  });

  test('builds workout load suggestion from plan and PR', () => {
    expect(
      getWorkoutLoadSuggestion({
        plannedWeightKg: 40,
        repsTarget: 8,
        personalRecord: { maxWeight: 45, maxReps: 10, maxVolume: 360 },
      }),
    ).toEqual(
      expect.objectContaining({
        recommendedWeightKg: 40,
        progressionWeightKg: 42.5,
        strategy: 'progression',
      }),
    );
  });

  test('describes PR highlights for the completed set', () => {
    expect(
      getWorkoutPrHighlights(42.5, 8, {
        maxWeight: 40,
        maxReps: 7,
        maxVolume: 280,
      }),
    ).toEqual(['Peso 42.5 kg', 'Reps 8', 'Volumen 340 kg']);
  });
});
