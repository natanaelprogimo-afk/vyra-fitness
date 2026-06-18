import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import {
  decryptSensitiveStringArray,
  decryptSensitiveText,
  encryptSensitiveStringArray,
  encryptSensitiveText,
} from '@/lib/sensitive-crypto';
import { resolveFemalePhaseFromRecord, type FemalePhase } from '@/lib/female-phase';
import { resolveSupportedLanguage, type SupportedLanguage } from '@/lib/language';
import { isStrictSensitiveMode } from '@/lib/privacy-settings';
import { FemaleHealthLabels, FemaleSymptoms } from '@/constants/strings';

export interface FemaleHealthEntry {
  id: string;
  user_id: string;
  phase: FemalePhase;
  symptoms?: string[];
  symptomSeverity?: Record<string, number>;
  mood?: number | null;
  notes?: string;
  logged_at: string;
}

interface FemalePhaseGuidance {
  training: string;
  fasting: string;
  nutrition: string;
  hydrationBoostMl: number;
  weightContext: string | null;
}

interface CycleIrregularity {
  isIrregular: boolean;
  message: string | null;
}

export interface FemaleSymptomPrediction {
  symptom: string;
  label: string;
  startDay: number;
  endDay: number;
  occurrenceCount: number;
  avgSeverity: number;
  confidence: 'media' | 'alta';
  daysUntilWindow: number;
  nextDateStart: string;
  nextDateEnd: string;
  insight: string;
  trainingHint: string;
}

interface FemaleHealthLogRow {
  id: string;
  user_id: string;
  phase?: FemalePhase | null;
  symptoms?: string[] | null;
  notes?: string | null;
  logged_at: string;
  [key: string]: unknown;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : String(message ?? '');
  }
  return String(error ?? '');
}

function encodeSymptomsWithSeverity(
  symptoms: string[],
  severityMap?: Record<string, number>,
): string[] {
  return symptoms.map((symptom) => {
    const severityRaw = severityMap?.[symptom];
    const severity = Number.isFinite(severityRaw) ? Math.max(1, Math.min(5, Math.round(severityRaw as number))) : 3;
    return `${symptom}@@${severity}`;
  });
}

function decodeSymptomsWithSeverity(encoded: string[]): {
  symptoms: string[];
  symptomSeverity: Record<string, number>;
} {
  const symptoms: string[] = [];
  const symptomSeverity: Record<string, number> = {};

  for (const item of encoded) {
    if (typeof item !== 'string' || item.trim().length === 0) continue;
    const [rawSymptom, rawSeverity] = item.split('@@');
    const symptom = rawSymptom?.trim();
    if (!symptom) continue;
    const severity = Number(rawSeverity);
    symptoms.push(symptom);
    symptomSeverity[symptom] = Number.isFinite(severity) ? Math.max(1, Math.min(5, Math.round(severity))) : 3;
  }

  return { symptoms, symptomSeverity };
}

function clampMood(value: number | null | undefined): number | null {
  if (!Number.isFinite(value)) return null;
  return Math.max(1, Math.min(5, Math.round(value as number)));
}

function buildSymptomTrainingHint(symptom: string): string {
  if (symptom === 'fatiga' || symptom === 'migrana') {
    return 'Conviene bajar intensidad, acortar la sesión o priorizar movilidad si este patrón vuelve a aparecer.';
  }
  if (symptom === 'colicos' || symptom === 'hinchazon') {
    return 'Te puede rendir mejor una sesión corta, respiración, caminata o trabajo técnico sin apilar carga.';
  }
  if (symptom === 'cambios_humor') {
    return 'Ese día suele servir más sostener continuidad con una rutina simple que exigir un pico de rendimiento.';
  }
  if (symptom === 'energia_alta') {
    return 'Si el resto del contexto acompaña, suele ser una buena ventana para meter la sesión más fuerte de la semana.';
  }
  return 'Vale la pena ajustar entrenamiento, hidratación y recuperación cuando este patrón se acerque.';
}

function buildFemaleStoredNotes(
  notes: string | null | undefined,
  mood: number | null | undefined,
): string | null {
  const safeMood = clampMood(mood);
  const safeNotes = typeof notes === 'string' ? notes.trim() : '';
  if (safeMood === null && !safeNotes) return null;
  if (safeMood === null) return safeNotes;
  const prefix = `[[mood:${safeMood}]]`;
  return safeNotes ? `${prefix}\n${safeNotes}` : prefix;
}

function parseFemaleStoredNotes(value: string | null): {
  mood: number | null;
  notes: string | null;
} {
  if (!value) {
    return { mood: null, notes: null };
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^\[\[mood:(\d)\]\]\s*/);
  if (!match) {
    return { mood: null, notes: trimmed || null };
  }

  const mood = clampMood(Number(match[1]));
  const notes = trimmed.slice(match[0].length).trim();
  return {
    mood,
    notes: notes.length ? notes : null,
  };
}

function getPhaseGuidance(
  phase: FemalePhase,
  _language: SupportedLanguage,
): FemalePhaseGuidance {
  // All guidance now comes from i18n labels
  if (phase === 'menstrual') {
    return {
      training: FemaleHealthLabels.menstrualTraining,
      fasting: FemaleHealthLabels.menstrualFasting,
      nutrition: FemaleHealthLabels.menstrualNutrition,
      hydrationBoostMl: 300,
      weightContext: FemaleHealthLabels.menstrualWeightContext,
    };
  }
  if (phase === 'follicular') {
    return {
      training: FemaleHealthLabels.follicularTraining,
      fasting: FemaleHealthLabels.follicularFasting,
      nutrition: FemaleHealthLabels.follicularNutrition,
      hydrationBoostMl: 0,
      weightContext: null,
    };
  }
  if (phase === 'ovulation') {
    return {
      training: FemaleHealthLabels.ovulationTraining,
      fasting: FemaleHealthLabels.ovulationFasting,
      nutrition: FemaleHealthLabels.ovulationNutrition,
      hydrationBoostMl: 150,
      weightContext: null,
    };
  }
  // Luteal phase (fallback)
  return {
    training: FemaleHealthLabels.lutealTraining,
    fasting: FemaleHealthLabels.lutealFasting,
    nutrition: FemaleHealthLabels.lutealNutrition,
    hydrationBoostMl: 250,
    weightContext: FemaleHealthLabels.lutealWeightContext,
  };
}

export function useFemaleHealth() {
  const { i18n } = useTranslation();
  const { profile } = useAuthStore();
  const userId = profile?.id;
  const strictSensitiveMode = isStrictSensitiveMode(profile);
  const language = resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language);

  const [cycleLength, setCycleLength]       = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<string | null>(null);
  const [history, setHistory]               = useState<FemaleHealthEntry[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isLogging, setIsLogging]           = useState(false);
  const [isSavingSetup, setIsSavingSetup]   = useState(false);

  // Calcular fase actual basada en última menstruación
  const calculatePhase = useCallback((lastDate: string): {
    phase: FemalePhase;
    daysInPhase: number;
    nextPeriodDate: string | null;
  } => {
    const lastDateObj = new Date(lastDate);
    const now = new Date();
    const daysSinceLastPeriod = Math.floor((now.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = daysSinceLastPeriod % cycleLength;

    let phase: FemalePhase;
    if (dayInCycle < 5) {
      phase = 'menstrual';
    } else if (dayInCycle < 13) {
      phase = 'follicular';
    } else if (dayInCycle < 16) {
      phase = 'ovulation';
    } else {
      phase = 'luteal';
    }

    // Calcular próxima menstruación
    const nextPeriod = new Date(lastDateObj);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength - dayInCycle);

    return {
      phase,
      daysInPhase: dayInCycle,
      nextPeriodDate: nextPeriod.toISOString().split('T')[0],
    };
  }, [cycleLength]);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      // Obtener settings del perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const [encryptedCycleLength, encryptedLastPeriodDate] = await Promise.all([
          decryptSensitiveText(typeof profile.female_cycle_length_encrypted === 'string' ? profile.female_cycle_length_encrypted : null),
          decryptSensitiveText(
            typeof profile.female_last_period_date_encrypted === 'string' ? profile.female_last_period_date_encrypted : null,
          ),
        ]);

        const cycleLengthValue = Number(encryptedCycleLength ?? profile.female_cycle_length ?? 28);
        setCycleLength(Number.isFinite(cycleLengthValue) ? cycleLengthValue : 28);
        setLastPeriodDate(
          typeof encryptedLastPeriodDate === 'string'
            ?  encryptedLastPeriodDate
            : typeof profile.female_last_period_date === 'string'
              ?  profile.female_last_period_date
              : null,
        );
      }

      // Obtener historial
      const { data: entries, error: entriesError } = await supabase
        .from('female_health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(30);

      if (entriesError) throw entriesError;
      if (!entries?.length) {
        setHistory([]);
        return;
      }

      const decryptedEntries = await Promise.all(
        (entries as FemaleHealthLogRow[]).map(async (entry) => {
          const rawSymptoms = await decryptSensitiveStringArray(
            Array.isArray(entry.symptoms) ? entry.symptoms : [],
          );
          const decoded = decodeSymptomsWithSeverity(rawSymptoms);
          const phase = await resolveFemalePhaseFromRecord(entry as Record<string, unknown>);
          const parsedNotes = parseFemaleStoredNotes(
            await decryptSensitiveText(entry.notes ?? null),
          );
          return {
            ...entry,
            phase: phase ?? 'follicular',
            symptoms: decoded.symptoms,
            symptomSeverity: decoded.symptomSeverity,
            mood: parsedNotes.mood,
            notes: parsedNotes.notes ?? undefined,
          };
        }),
      );
      setHistory(decryptedEntries as FemaleHealthEntry[]);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useFemaleHealth.fetchData" });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const log = useCallback(async (
    phase: FemalePhase,
    symptoms?: string[],
    notes?: string,
    symptomSeverity?: Record<string, number>,
    mood?: number,
  ) => {
    if (!userId) return;
    setIsLogging(true);
    try {
      const normalizedSymptoms = encodeSymptomsWithSeverity(symptoms || [], symptomSeverity);
      const [encryptedSymptoms, encryptedNotes, encryptedPhase] = await Promise.all([
        encryptSensitiveStringArray(normalizedSymptoms),
        encryptSensitiveText(buildFemaleStoredNotes(notes || null, mood)),
        encryptSensitiveText(phase),
      ]);

      let { error } = await supabase
        .from('female_health_logs')
        .insert({
          user_id: userId,
          phase: strictSensitiveMode ? null : phase,
          phase_encrypted: encryptedPhase,
          symptoms: encryptedSymptoms,
          notes: encryptedNotes,
          logged_at: new Date().toISOString(),
        });

      if (error) {
        const message = getErrorMessage(error);
        const missingSecureColumn = message.includes('phase_encrypted');

        if (missingSecureColumn) {
          if (strictSensitiveMode) {
            throw new Error('El modo estricto requiere la columna phase_encrypted en female_health_logs.');
          }

          const fallback = await supabase
            .from('female_health_logs')
            .insert({
              user_id: userId,
              phase,
              symptoms: encryptedSymptoms,
              notes: encryptedNotes,
              logged_at: new Date().toISOString(),
            });

          error = fallback.error;
        }
      }

      if (error) throw error;
      await fetchData();
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useFemaleHealth.log" });
    } finally {
      setIsLogging(false);
    }
  }, [strictSensitiveMode, userId, fetchData]);

  const updateSymptoms = useCallback(async (symptoms: string[], symptomSeverity?: Record<string, number>) => {
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const normalizedSymptoms = encodeSymptomsWithSeverity(symptoms, symptomSeverity);
      const encryptedSymptoms = await encryptSensitiveStringArray(normalizedSymptoms);
      const { error } = await supabase
        .from('female_health_logs')
        .update({ symptoms: encryptedSymptoms })
        .eq('user_id', userId)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useFemaleHealth.updateSymptoms" });
    }
  }, [userId, fetchData]);

  const saveCycleSetup = useCallback(async (nextLastPeriodDate: string, nextCycleLength: number) => {
    if (!userId) return false;
    setIsSavingSetup(true);
    try {
      const [encryptedCycleLength, encryptedLastPeriodDate] = await Promise.all([
        encryptSensitiveText(String(nextCycleLength)),
        encryptSensitiveText(nextLastPeriodDate),
      ]);

      let { error } = await supabase
        .from('profiles')
        .update({
          female_cycle_length: strictSensitiveMode ? null : nextCycleLength,
          female_last_period_date: strictSensitiveMode ? null : nextLastPeriodDate,
          female_cycle_length_encrypted: encryptedCycleLength,
          female_last_period_date_encrypted: encryptedLastPeriodDate,
        })
        .eq('id', userId);

      if (error) {
        const message = getErrorMessage(error);
        const missingSecureColumns =
          message.includes('female_cycle_length_encrypted') ||
          message.includes('female_last_period_date_encrypted');

        if (missingSecureColumns) {
          if (strictSensitiveMode) {
            throw new Error('El modo estricto requiere columnas cifradas en profiles para el ciclo.');
          }

          const fallback = await supabase
            .from('profiles')
            .update({
              female_cycle_length: nextCycleLength,
              female_last_period_date: nextLastPeriodDate,
            })
            .eq('id', userId);

          error = fallback.error;
        }
      }

      if (error) throw error;

      setCycleLength(nextCycleLength);
      setLastPeriodDate(nextLastPeriodDate);
      return true;
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: 'useFemaleHealth.saveCycleSetup' });
      return false;
    } finally {
      setIsSavingSetup(false);
    }
  }, [strictSensitiveMode, userId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const { phase, daysInPhase, nextPeriodDate } = lastPeriodDate
    ?  calculatePhase(lastPeriodDate)
    : { phase: 'follicular' as const, daysInPhase: 0, nextPeriodDate: null };

  const phaseGuidance: FemalePhaseGuidance = getPhaseGuidance(phase, language);

  const imminentPhaseNotice = (() => {
    if (!lastPeriodDate) return null;

    const dayInCycle = daysInPhase;
    const daysToOvulation = dayInCycle <= 14 ? 14 - dayInCycle : cycleLength - dayInCycle + 14;
    const daysToPeriod = nextPeriodDate
      ?  Math.max(
          0,
          Math.ceil((new Date(`${nextPeriodDate}T00:00:00`).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        )
      : null;

    if (daysToOvulation === 1) {
      return 'Mañana entrás en ventana ovulatoria: preparamos entrenamiento de intensidad alta.';
    }
    if (daysToPeriod !== null && daysToPeriod <= 2) {
      return 'Tu menstruacion empieza pronto. Está semana prioriza hidratación extra y recuperación.';
    }
    return null;
  })();

  const cycleIrregularity: CycleIrregularity = (() => {
    const menstrualLogs = history
      .filter((entry) => entry.phase === 'menstrual')
      .map((entry) => entry.logged_at.split('T')[0])
      .sort();

    if (menstrualLogs.length < 3) {
      return { isIrregular: false, message: null };
    }

    const starts: string[] = [];
    for (const day of menstrualLogs) {
      if (!starts.length) {
        starts.push(day);
        continue;
      }
      const prev = starts[starts.length - 1];
      const diffDays = Math.round(
        (new Date(`${day}T00:00:00`).getTime() - new Date(`${prev}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays >= 10) {
        starts.push(day);
      }
    }

    if (starts.length < 3) {
      return { isIrregular: false, message: null };
    }

    const intervals: number[] = [];
    for (let i = 1; i < starts.length; i += 1) {
      const interval = Math.round(
        (new Date(`${starts[i]}T00:00:00`).getTime() - new Date(`${starts[i - 1]}T00:00:00`).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      intervals.push(interval);
    }

    if (!intervals.length) {
      return { isIrregular: false, message: null };
    }

    const max = Math.max(...intervals);
    const min = Math.min(...intervals);
    if (max - min > 7) {
      return {
        isIrregular: true,
        message:
          'Tu ciclo viene variando más de 7 días entre periodos. Conviene comentarlo con ginecologia para evaluacion.',
      };
    }

    return { isIrregular: false, message: null };
  })();

  const symptomPredictions: FemaleSymptomPrediction[] = (() => {
    if (!lastPeriodDate || history.length < 4) return [];

    const cycleBase = new Date(`${lastPeriodDate}T12:00:00`);
    const cycleBaseUtc = Date.UTC(
      cycleBase.getUTCFullYear(),
      cycleBase.getUTCMonth(),
      cycleBase.getUTCDate(),
    );
    const currentCycleDay = Math.max(1, Math.min(cycleLength, daysInPhase + 1));
    const symptomMap = new Map<string, { days: number[]; severities: number[] }>();

    for (const entry of history) {
      if (!entry.symptoms?.length) continue;

      const entryDate = new Date(entry.logged_at);
      const entryUtc = Date.UTC(
        entryDate.getUTCFullYear(),
        entryDate.getUTCMonth(),
        entryDate.getUTCDate(),
      );
      const diffDays = Math.floor((entryUtc - cycleBaseUtc) / (1000 * 60 * 60 * 24));
      const cycleDay = (((diffDays % cycleLength) + cycleLength) % cycleLength) + 1;

      for (const symptom of entry.symptoms) {
        const current = symptomMap.get(symptom) ?? { days: [], severities: [] };
        current.days.push(cycleDay);
        current.severities.push(Number(entry.symptomSeverity?.[symptom] ?? 3));
        symptomMap.set(symptom, current);
      }
    }

    return [...symptomMap.entries()]
      .map(([symptom, bucket]) => {
        if (bucket.days.length < 2) return null;

        const sortedDays = [...bucket.days].sort((left, right) => left - right);
        const averageDay = sortedDays.reduce((sum, value) => sum + value, 0) / sortedDays.length;
        const spread = (sortedDays[sortedDays.length - 1] ?? 0) - (sortedDays[0] ?? 0);
        if (spread > 9) return null;

        const padding = spread <= 2 ? 1 : 2;
        const centerDay = Math.max(1, Math.min(cycleLength, Math.round(averageDay)));
        const startDay = Math.max(1, centerDay - padding);
        const endDay = Math.min(cycleLength, centerDay + padding);
        const avgSeverity =
          bucket.severities.reduce((sum, value) => sum + value, 0) / Math.max(1, bucket.severities.length);
        let daysUntilWindow = startDay - currentCycleDay;
        if (daysUntilWindow < 0) daysUntilWindow += cycleLength;

        const nextDateStart = new Date();
        nextDateStart.setDate(nextDateStart.getDate() + daysUntilWindow);
        const nextDateEnd = new Date(nextDateStart);
        nextDateEnd.setDate(nextDateStart.getDate() + Math.max(0, endDay - startDay));

        const label = FemaleSymptoms[symptom] ?? symptom;
        const confidence =
          bucket.days.length >= 3 && spread <= 4 && avgSeverity >= 2.5
            ? 'alta'
            : 'media';

        return {
          symptom,
          label,
          startDay,
          endDay,
          occurrenceCount: bucket.days.length,
          avgSeverity: Math.round(avgSeverity * 10) / 10,
          confidence,
          daysUntilWindow,
          nextDateStart: nextDateStart.toISOString().split('T')[0] ?? nextDateStart.toISOString(),
          nextDateEnd: nextDateEnd.toISOString().split('T')[0] ?? nextDateEnd.toISOString(),
          insight:
            bucket.days.length >= 3
              ? `Este mes probablemente ${label.toLowerCase()} aparezca entre los días ${startDay}-${endDay} del ciclo.`
              : `${label} viene repitiéndose cerca de los días ${startDay}-${endDay} del ciclo.`,
          trainingHint: buildSymptomTrainingHint(symptom),
        } satisfies FemaleSymptomPrediction;
      })
      .filter((item): item is FemaleSymptomPrediction => Boolean(item))
      .sort((left, right) => {
        if (left.daysUntilWindow !== right.daysUntilWindow) {
          return left.daysUntilWindow - right.daysUntilWindow;
        }
        if (left.occurrenceCount !== right.occurrenceCount) {
          return right.occurrenceCount - left.occurrenceCount;
        }
        return right.avgSeverity - left.avgSeverity;
      })
      .slice(0, 3);
  })();

  // NEW: Support for irregular cycles and medications
  const [cycleLengthMin, setCycleLengthMin] = useState(21); // Irregular cycles can be 21-35 days
  const [cycleLengthMax, setCycleLengthMax] = useState(35);
  const [hormonalMedicationNotes, setHormonalMedicationNotes] = useState<string | null>(null);

  return {
    cycleLength,
    lastPeriodDate,
    currentPhase: phase,
    daysInPhase,
    nextPeriodDate,
    history,
    isLoading,
    isLogging,
    phaseGuidance,
    imminentPhaseNotice,
    cycleIrregularity,
    symptomPredictions,
    log,
    updateSymptoms,
    saveCycleSetup,
    isSavingSetup,
    isInCycle: !!lastPeriodDate,
    strictSensitiveMode,
    // NEW: Irregular cycle support
    cycleLengthMin,
    cycleLengthMax,
    setCycleLengthRange: (min: number, max: number) => {
      setCycleLengthMin(Math.max(20, Math.min(min, 42)));
      setCycleLengthMax(Math.max(min + 1, Math.min(max, 45)));
    },
    hormonalMedicationNotes,
    setHormonalMedicationNotes: (notes: string | null) => {
      setHormonalMedicationNotes(notes?.trim() || null);
    },
    hasHormonalMedication: !!hormonalMedicationNotes,
  };
}
