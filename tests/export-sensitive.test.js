const mockSecureStore = new Map();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key) => Promise.resolve(mockSecureStore.has(key) ? mockSecureStore.get(key) : null)),
  setItemAsync: jest.fn((key, value) => {
    mockSecureStore.set(key, value);
    return Promise.resolve();
  }),
}));

const { encryptSensitiveStringArray, encryptSensitiveText } = require('../lib/sensitive-crypto');
const { hydrateSensitiveExportData } = require('../lib/export-sensitive');

describe('hydrateSensitiveExportData', () => {
  beforeEach(() => {
    mockSecureStore.clear();
    jest.clearAllMocks();
  });

  test('rehydrates strict-sensitive rows into readable export values', async () => {
    const encryptedWeight = await encryptSensitiveText('72.4');
    const encryptedBodyFat = await encryptSensitiveText('18.5');
    const encryptedWeightNote = await encryptSensitiveText('Subio despues del viaje');
    const encryptedMood = await encryptSensitiveText('4');
    const encryptedEnergy = await encryptSensitiveText('7');
    const encryptedStress = await encryptSensitiveText('3');
    const encryptedMotivation = await encryptSensitiveText('8');
    const encryptedMentalNote = await encryptSensitiveText('Semana estable');
    const encryptedPhase = await encryptSensitiveText('luteal');
    const encryptedSymptoms = await encryptSensitiveStringArray(['fatiga@@4', 'hinchazon@@2']);
    const encryptedFemaleNote = await encryptSensitiveText('Dormi peor de lo normal');
    const encryptedCycleLength = await encryptSensitiveText('29');
    const encryptedLastPeriodDate = await encryptSensitiveText('2026-04-10');

    const hydrated = await hydrateSensitiveExportData({
      profiles: [
        {
          id: 'user-1',
          female_cycle_length: null,
          female_last_period_date: null,
          female_cycle_length_encrypted: encryptedCycleLength,
          female_last_period_date_encrypted: encryptedLastPeriodDate,
        },
      ],
      weight_logs: [
        {
          id: 'weight-1',
          weight_kg: null,
          body_fat_pct: null,
          weight_kg_encrypted: encryptedWeight,
          body_fat_pct_encrypted: encryptedBodyFat,
          note: encryptedWeightNote,
        },
      ],
      mental_checkins: [
        {
          id: 'mental-1',
          mood: null,
          energy: null,
          stress: null,
          motivation: null,
          mood_encrypted: encryptedMood,
          energy_encrypted: encryptedEnergy,
          stress_encrypted: encryptedStress,
          motivation_encrypted: encryptedMotivation,
          notes: encryptedMentalNote,
        },
      ],
      female_health_logs: [
        {
          id: 'female-1',
          phase: null,
          phase_encrypted: encryptedPhase,
          symptoms: encryptedSymptoms,
          notes: encryptedFemaleNote,
        },
      ],
    });

    expect(hydrated.profiles[0]).toMatchObject({
      female_cycle_length: 29,
      female_last_period_date: '2026-04-10',
    });
    expect(hydrated.weight_logs[0]).toMatchObject({
      weight_kg: 72.4,
      body_fat_pct: 18.5,
      note: 'Subio despues del viaje',
    });
    expect(hydrated.mental_checkins[0]).toMatchObject({
      mood: 4,
      energy: 7,
      stress: 3,
      motivation: 8,
      notes: 'Semana estable',
    });
    expect(hydrated.female_health_logs[0]).toMatchObject({
      phase: 'luteal',
      symptoms: ['fatiga', 'hinchazon'],
      symptom_severity: {
        fatiga: 4,
        hinchazon: 2,
      },
      notes: 'Dormi peor de lo normal',
    });
  });

  test('keeps plain values when encrypted mirrors are absent', async () => {
    const hydrated = await hydrateSensitiveExportData({
      weight_logs: [
        {
          id: 'weight-plain',
          weight_kg: 80,
          body_fat_pct: 22,
          note: 'Dato ya visible',
        },
      ],
      female_health_logs: [
        {
          id: 'female-plain',
          phase: 'follicular',
          symptoms: [],
          notes: null,
        },
      ],
    });

    expect(hydrated.weight_logs[0]).toMatchObject({
      weight_kg: 80,
      body_fat_pct: 22,
      note: 'Dato ya visible',
    });
    expect(hydrated.female_health_logs[0]).toMatchObject({
      phase: 'follicular',
      symptoms: [],
      symptom_severity: null,
      notes: null,
    });
  });
});
