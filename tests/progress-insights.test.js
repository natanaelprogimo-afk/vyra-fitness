const {
  buildWeightTrendEvents,
  buildWeightTrendPoints,
  getWeightPeriodComparison,
} = require('../lib/progress-insights');

const NOW = new Date('2026-04-15T12:00:00Z');

describe('progress insights helpers', () => {
  const logs = [
    { logged_at: '2026-03-20T08:00:00Z', weight_kg: 82.6, note: null },
    { logged_at: '2026-04-01T08:00:00Z', weight_kg: 81.9, note: 'Semana dura' },
    { logged_at: '2026-04-08T08:00:00Z', weight_kg: 81.1, note: null },
    { logged_at: '2026-04-14T08:00:00Z', weight_kg: 80.4, note: null },
  ];

  test('builds chart points for the selected period', () => {
    expect(buildWeightTrendPoints(logs, '14d', NOW)).toEqual([
      { date: '01/04', isoDate: '2026-04-01', weight: 81.9 },
      { date: '08/04', isoDate: '2026-04-08', weight: 81.1 },
      { date: '14/04', isoDate: '2026-04-14', weight: 80.4 },
    ]);
  });

  test('extracts notable weight events', () => {
    expect(buildWeightTrendEvents(logs, '30d', 80.5, NOW)).toEqual([
      { isoDate: '2026-04-08', label: 'Nuevo mínimo', tone: 'milestone' },
      { isoDate: '2026-04-08', label: 'Semana más ligera', tone: 'context' },
      { isoDate: '2026-04-14', label: 'Nuevo mínimo', tone: 'milestone' },
      { isoDate: '2026-04-14', label: 'Meta cerca', tone: 'goal' },
    ]);
  });

  test('compares current period vs previous one', () => {
    expect(getWeightPeriodComparison(logs, '14d', NOW)).toEqual({
      currentAverage: 81.13333333333334,
      previousAverage: 82.6,
      delta: -1.5,
      entries: 3,
    });
  });
});
