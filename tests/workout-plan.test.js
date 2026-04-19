const { getWorkoutPlanSnapshot } = require('../lib/workout-plan');

describe('workout plan helper', () => {
  const routines = [
    {
      id: 'r1',
      name: 'Upper',
      schedule_day: 'Lunes',
      estimated_duration_min: 55,
      exercises: [{ exercise_id: 'e1' }],
    },
    {
      id: 'r2',
      name: 'Lower',
      schedule_day: 'Miercoles',
      estimated_duration_min: 60,
      exercises: [{ exercise_id: 'e2' }],
    },
    {
      id: 'r3',
      name: 'Pump',
      schedule_day: 'Viernes',
      estimated_duration_min: 40,
      exercises: [{ exercise_id: 'e3' }],
    },
  ];

  const activeProgram = {
    id: 'p1',
    name: 'Base 3 dias',
    routine_ids: ['r1', 'r2', 'r3'],
  };

  test('returns the routine scheduled for today when one matches weekday', () => {
    const plan = getWorkoutPlanSnapshot({
      date: new Date('2026-04-13T12:00:00Z'),
      routines,
      history: [],
      activeProgram,
      fallbackRoutine: null,
    });

    expect(plan.dayLabel).toBe('Lunes');
    expect(plan.todayRoutine?.name).toBe('Upper');
    expect(plan.isRestDay).toBe(false);
    expect(plan.source).toBe('scheduled');
  });

  test('marks rest day and points to next scheduled routine when today has no match', () => {
    const plan = getWorkoutPlanSnapshot({
      date: new Date('2026-04-14T12:00:00Z'),
      routines,
      history: [],
      activeProgram,
      fallbackRoutine: null,
    });

    expect(plan.dayLabel).toBe('Martes');
    expect(plan.todayRoutine).toBeNull();
    expect(plan.nextRoutine?.name).toBe('Lower');
    expect(plan.isRestDay).toBe(true);
    expect(plan.source).toBe('recovery');
  });
});
