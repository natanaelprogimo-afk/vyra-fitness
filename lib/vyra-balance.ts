import type { DailyScore, ScoreHistory } from '@/lib/readiness-score';

export type VyraBalanceKey = 'sleep' | 'activity' | 'nutrition' | 'hydration' | 'recovery';

export interface VyraBalanceContribution {
  key: VyraBalanceKey;
  label: string;
  max: number;
  score: number;
  pct: number;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function buildVyraBalanceContributions(
  score: DailyScore | null,
  stepsPct?: number,
): VyraBalanceContribution[] {
  if (!score) {
    return [
      { key: 'sleep', label: 'Sueño', max: 40, score: 0, pct: 0 },
      { key: 'activity', label: 'Entreno', max: 20, score: 0, pct: 0 },
      { key: 'nutrition', label: 'Nutri', max: 15, score: 0, pct: 0 },
      { key: 'hydration', label: 'Pasos + Agua', max: 15, score: 0, pct: 0 },
      { key: 'recovery', label: 'Resto', max: 10, score: 0, pct: 0 },
    ];
  }

  const hydrationBase = clamp(score.breakdown.hydration ?? 0);
  const stepsBase = clamp(stepsPct ?? score.breakdown.activity ?? 0);
  const blendedHydration = (hydrationBase + stepsBase) / 2;

  const entries: VyraBalanceContribution[] = [
    {
      key: 'sleep',
      label: 'Sueño',
      max: 40,
      score: round((clamp(score.breakdown.sleep ?? 0) / 100) * 40),
      pct: clamp(score.breakdown.sleep ?? 0),
    },
    {
      key: 'activity',
      label: 'Entreno',
      max: 20,
      score: round((clamp(score.breakdown.activity ?? 0) / 100) * 20),
      pct: clamp(score.breakdown.activity ?? 0),
    },
    {
      key: 'nutrition',
      label: 'Nutri',
      max: 15,
      score: round((clamp(score.breakdown.nutrition ?? 0) / 100) * 15),
      pct: clamp(score.breakdown.nutrition ?? 0),
    },
    {
      key: 'hydration',
      label: 'Pasos + Agua',
      max: 15,
      score: round((blendedHydration / 100) * 15),
      pct: round(blendedHydration),
    },
    {
      key: 'recovery',
      label: 'Resto',
      max: 10,
      score: round((clamp(score.breakdown.mental ?? 0) / 100) * 10),
      pct: clamp(score.breakdown.mental ?? 0),
    },
  ];

  return entries;
}

export function buildVyraBalanceTopContributions(
  score: DailyScore | null,
  stepsPct?: number,
  count = 3,
) {
  return buildVyraBalanceContributions(score, stepsPct)
    .sort((left, right) => right.score - left.score)
    .slice(0, count);
}

export function getVyraBalanceMessage(total: number) {
  if (total > 90) return 'Día excepcional para empujar fuerte.';
  if (total >= 80) return 'Día fuerte para entrenar.';
  if (total >= 65) return 'Buen equilibrio para seguir consistente.';
  if (total >= 45) return 'Conviene ordenar dos cosas antes de apretar.';
  return 'Baja la exigencia y vuelve a lo básico.';
}

export function getVyraBalanceCoachLine(total: number) {
  if (total > 90) return 'Estás en muy buena forma para entrenar hoy.';
  if (total >= 80) return 'Tienes margen para una sesión fuerte hoy.';
  if (total >= 65) return 'Buen día para sostener constancia sin forzar.';
  if (total >= 45) return 'Conviene ajustar carga y priorizar recuperación.';
  return 'Hoy rinde más hacer algo pequeño y recuperar base.';
}

export function averageVyraBalanceInputs(rows: ScoreHistory[]) {
  if (!rows.length) {
    return {
      score: 0,
      sleep: 0,
      activity: 0,
      nutrition: 0,
      hydration: 0,
      mental: 0,
    };
  }

  const total = rows.length;
  return {
    score: round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / total),
    sleep: round(rows.reduce((sum, row) => sum + Number(row.sleep_pct ?? 0), 0) / total),
    activity: round(rows.reduce((sum, row) => sum + Number(row.activity_pct ?? 0), 0) / total),
    nutrition: round(rows.reduce((sum, row) => sum + Number(row.nutrition_pct ?? 0), 0) / total),
    hydration: round(rows.reduce((sum, row) => sum + Number(row.hydration_pct ?? 0), 0) / total),
    mental: round(rows.reduce((sum, row) => sum + Number(row.mental_pct ?? 0), 0) / total),
  };
}
