import { useMemo } from 'react';
import { useFemaleHealth, type FemaleSymptomPrediction } from './useFemaleHealth';

export interface FemalePredictionAlertPlan {
  id: string;
  symptom: string;
  label: string;
  title: string;
  body: string;
  notifyAt: Date;
  windowStart: Date;
  windowEnd: Date;
  prediction: FemaleSymptomPrediction;
}

function asLocalDate(isoDate: string, hour: number, minute: number): Date {
  const [yearRaw, monthRaw, dayRaw] = isoDate.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    const fallback = new Date();
    fallback.setHours(hour, minute, 0, 0);
    return fallback;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function startOfLeadWindow(
  prediction: FemaleSymptomPrediction,
  preferredHour: number,
  preferredMinute: number,
): Date | null {
  const now = new Date();
  const nextWindowStart = asLocalDate(prediction.nextDateStart, preferredHour, preferredMinute);
  const twoDaysBefore = new Date(nextWindowStart);
  twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

  if (twoDaysBefore.getTime() > now.getTime() + 5 * 60 * 1000) {
    return twoDaysBefore;
  }

  if (nextWindowStart.getTime() > now.getTime() + 5 * 60 * 1000) {
    return nextWindowStart;
  }

  return null;
}

function buildAlertCopy(prediction: FemaleSymptomPrediction): { title: string; body: string } {
  const confidenceLabel = prediction.confidence === 'alta' ? 'alta' : 'media';
  return {
    title: `${prediction.label} cerca`,
    body:
      `VYRA ve una probabilidad ${confidenceLabel} de ${prediction.label.toLowerCase()} ` +
      `entre el ${prediction.startDay} y ${prediction.endDay} del ciclo. ${prediction.trainingHint}`,
  };
}

export function useFemaleSymptomPrediction(input?: {
  preferredHour?: number;
  preferredMinute?: number;
  limit?: number;
}) {
  const preferredHour = input?.preferredHour ?? 10;
  const preferredMinute = input?.preferredMinute ?? 15;
  const limit = input?.limit ?? 2;
  const female = useFemaleHealth();

  const upcomingAlerts = useMemo(() => {
    return female.symptomPredictions
      .map((prediction) => {
        const notifyAt = startOfLeadWindow(prediction, preferredHour, preferredMinute);
        if (!notifyAt) return null;

        const { title, body } = buildAlertCopy(prediction);
        const windowStart = asLocalDate(prediction.nextDateStart, preferredHour, preferredMinute);
        const windowEnd = asLocalDate(prediction.nextDateEnd, preferredHour, preferredMinute);
        const safeToken = `${prediction.symptom}_${prediction.nextDateStart}`.replace(/[^a-zA-Z0-9_-]+/g, '_');

        return {
          id: `female_prediction_${safeToken}`,
          symptom: prediction.symptom,
          label: prediction.label,
          title,
          body,
          notifyAt,
          windowStart,
          windowEnd,
          prediction,
        } satisfies FemalePredictionAlertPlan;
      })
      .filter((item): item is FemalePredictionAlertPlan => Boolean(item))
      .sort((left, right) => left.notifyAt.getTime() - right.notifyAt.getTime())
      .slice(0, limit);
  }, [female.symptomPredictions, limit, preferredHour, preferredMinute]);

  return {
    ...female,
    upcomingAlerts,
    topUpcomingAlert: upcomingAlerts[0] ?? null,
  };
}
