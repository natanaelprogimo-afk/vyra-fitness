const {
  calculateNutritionPreview,
  canSubmitManualNutrition,
  getNutritionQuickAmounts,
  getNutritionQuickSearches,
  normalizeNutritionAmount,
  parseNutritionNumber,
} = require('../lib/nutrition-log');

describe('nutrition log helpers', () => {
  test('scales nutrition values for arbitrary grams', () => {
    const preview = calculateNutritionPreview(
      {
        calories_per_100g: 250,
        protein_g: 10,
        carbs_g: 20,
        fat_g: 8,
        fiber_g: 5,
      },
      150,
    );

    expect(preview.calories).toBeCloseTo(375);
    expect(preview.protein).toBeCloseTo(15);
    expect(preview.carbs).toBeCloseTo(30);
    expect(preview.fat).toBeCloseTo(12);
    expect(preview.fiber).toBeCloseTo(7.5);
  });

  test('parses comma decimals and falls back to safe amounts', () => {
    expect(parseNutritionNumber('12,5')).toBeCloseTo(12.5);
    expect(parseNutritionNumber('abc')).toBeNull();
    expect(normalizeNutritionAmount('', 100)).toBe(100);
    expect(normalizeNutritionAmount('180', 100)).toBe(180);
  });

  test('manual nutrition entry requires name and calories', () => {
    expect(
      canSubmitManualNutrition({ name: 'Avena', calories: '120' }),
    ).toBe(true);
    expect(
      canSubmitManualNutrition({ name: '   ', calories: '120' }),
    ).toBe(false);
    expect(
      canSubmitManualNutrition({ name: 'Avena', calories: '' }),
    ).toBe(false);
  });

  test('returns quick defaults by meal type', () => {
    expect(getNutritionQuickAmounts('breakfast')).toEqual([40, 60, 100, 150]);
    expect(getNutritionQuickAmounts('dinner')).toEqual([100, 150, 200, 250]);
    expect(getNutritionQuickSearches('snack')).toEqual(['Banana', 'Barra proteica', 'Yogur']);
  });
});
