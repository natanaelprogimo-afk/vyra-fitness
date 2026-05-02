import { decryptSensitiveStringArray, decryptSensitiveText } from '@/lib/sensitive-crypto';

export type ExportDataMap = Record<string, unknown[]>;

type ExportRow = Record<string, unknown>;

function asRows(rows: unknown[] | undefined): ExportRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row): row is ExportRow => Boolean(row) && typeof row === 'object');
}

function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function decodeSymptomsWithSeverity(encoded: string[]) {
  const symptoms: string[] = [];
  const symptomSeverity: Record<string, number> = {};

  for (const item of encoded) {
    const [rawSymptom, rawSeverity] = item.split('@@');
    const symptom = rawSymptom?.trim();
    if (!symptom) continue;
    const severity = parseNumericValue(rawSeverity);
    symptoms.push(symptom);
    symptomSeverity[symptom] =
      severity !== null ? Math.max(1, Math.min(5, Math.round(severity))) : 3;
  }

  return { symptoms, symptomSeverity };
}

async function hydrateProfiles(rows: ExportRow[]) {
  return Promise.all(
    rows.map(async (row) => {
      const [cycleLengthRaw, lastPeriodDate] = await Promise.all([
        decryptSensitiveText(
          typeof row.female_cycle_length_encrypted === 'string'
            ? row.female_cycle_length_encrypted
            : null,
        ),
        decryptSensitiveText(
          typeof row.female_last_period_date_encrypted === 'string'
            ? row.female_last_period_date_encrypted
            : null,
        ),
      ]);

      const cycleLength =
        parseNumericValue(cycleLengthRaw) ?? parseNumericValue(row.female_cycle_length);

      return {
        ...row,
        female_cycle_length: cycleLength,
        female_last_period_date:
          lastPeriodDate ??
          (typeof row.female_last_period_date === 'string' ? row.female_last_period_date : null),
      };
    }),
  );
}

async function hydrateWeightLogs(rows: ExportRow[]) {
  return Promise.all(
    rows.map(async (row) => {
      const [note, weightRaw, bodyFatRaw] = await Promise.all([
        decryptSensitiveText(typeof row.note === 'string' ? row.note : null),
        decryptSensitiveText(
          typeof row.weight_kg_encrypted === 'string' ? row.weight_kg_encrypted : null,
        ),
        decryptSensitiveText(
          typeof row.body_fat_pct_encrypted === 'string' ? row.body_fat_pct_encrypted : null,
        ),
      ]);

      return {
        ...row,
        note: note ?? (typeof row.note === 'string' ? row.note : null),
        weight_kg: parseNumericValue(weightRaw) ?? parseNumericValue(row.weight_kg),
        body_fat_pct:
          parseNumericValue(bodyFatRaw) ?? parseNumericValue(row.body_fat_pct),
      };
    }),
  );
}

async function hydrateMentalCheckins(rows: ExportRow[]) {
  return Promise.all(
    rows.map(async (row) => {
      const [notes, moodRaw, energyRaw, stressRaw, motivationRaw] = await Promise.all([
        decryptSensitiveText(typeof row.notes === 'string' ? row.notes : null),
        decryptSensitiveText(typeof row.mood_encrypted === 'string' ? row.mood_encrypted : null),
        decryptSensitiveText(typeof row.energy_encrypted === 'string' ? row.energy_encrypted : null),
        decryptSensitiveText(typeof row.stress_encrypted === 'string' ? row.stress_encrypted : null),
        decryptSensitiveText(
          typeof row.motivation_encrypted === 'string' ? row.motivation_encrypted : null,
        ),
      ]);

      return {
        ...row,
        notes: notes ?? (typeof row.notes === 'string' ? row.notes : null),
        mood: parseNumericValue(moodRaw) ?? parseNumericValue(row.mood),
        energy: parseNumericValue(energyRaw) ?? parseNumericValue(row.energy),
        stress: parseNumericValue(stressRaw) ?? parseNumericValue(row.stress),
        motivation:
          parseNumericValue(motivationRaw) ?? parseNumericValue(row.motivation),
      };
    }),
  );
}

async function hydrateFemaleHealthLogs(rows: ExportRow[]) {
  return Promise.all(
    rows.map(async (row) => {
      const [phase, notes, symptomsRaw] = await Promise.all([
        decryptSensitiveText(typeof row.phase_encrypted === 'string' ? row.phase_encrypted : null),
        decryptSensitiveText(typeof row.notes === 'string' ? row.notes : null),
        decryptSensitiveStringArray(asStringArray(row.symptoms)),
      ]);

      const decodedSymptoms = decodeSymptomsWithSeverity(symptomsRaw);

      return {
        ...row,
        phase: phase ?? (typeof row.phase === 'string' ? row.phase : null),
        notes: notes ?? (typeof row.notes === 'string' ? row.notes : null),
        symptoms: decodedSymptoms.symptoms,
        symptom_severity:
          Object.keys(decodedSymptoms.symptomSeverity).length > 0
            ? decodedSymptoms.symptomSeverity
            : null,
      };
    }),
  );
}

export async function hydrateSensitiveExportData(
  exportData: ExportDataMap,
): Promise<ExportDataMap> {
  const next: ExportDataMap = { ...exportData };

  if (Array.isArray(exportData.profiles)) {
    next.profiles = await hydrateProfiles(asRows(exportData.profiles));
  }

  if (Array.isArray(exportData.weight_logs)) {
    next.weight_logs = await hydrateWeightLogs(asRows(exportData.weight_logs));
  }

  if (Array.isArray(exportData.mental_checkins)) {
    next.mental_checkins = await hydrateMentalCheckins(asRows(exportData.mental_checkins));
  }

  if (Array.isArray(exportData.female_health_logs)) {
    next.female_health_logs = await hydrateFemaleHealthLogs(
      asRows(exportData.female_health_logs),
    );
  }

  return next;
}

export default hydrateSensitiveExportData;
