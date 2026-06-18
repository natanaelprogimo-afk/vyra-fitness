import { useMemo, useCallback } from 'react';
import { useSleep } from './useSleep';
import { useWorkout } from './useWorkout';
import { useSteps } from './useSteps';

export interface PerformanceMetrics {
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  activityLevel: 'high' | 'moderate' | 'low';
  workoutQuality: number | null;
  overallScore: number; // 0-100
}

export interface SleepCorrelationInsight {
  type: 'sleep-deprivation' | 'peak-performance' | 'recovery-needed' | 'balanced' | 'warning';
  title: string;
  description: string;
  actionTitle: string;
  actionDescription: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  icon: string;
}

/**
 * Correlates sleep metrics with performance indicators
 * to provide actionable insights.
 */
export function useSleepPerformanceCorrelation() {
  const { sleepDebt, lastScore, history, avgHours } = useSleep();
  const { history: workoutHistory } = useWorkout();
  const { progressPct } = useSteps();

  // Calculate 7-day averages for better correlation
  const sevenDaySleepAvg = useMemo(() => {
    if (!history || history.length === 0) return avgHours;
    const last7 = history.slice(0, 7);
    const total = last7.reduce((sum, r) => sum + (r.duration_min || 0) / 60, 0);
    return total / last7.length;
  }, [history, avgHours]);

  const sevenDayWorkoutAvg = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) return 3;
    const last7 = workoutHistory.slice(0, 7);
    // Estimate quality from volume and sets
    const totalQuality = last7.reduce((sum, w) => {
      const volume = w.total_volume_kg ?? 0;
      const sets = w.sets_count ?? 0;
      const estimated = Math.min(5, 2 + (volume + sets) / 500);
      return sum + estimated;
    }, 0);
    return totalQuality / last7.length;
  }, [workoutHistory]);

  // Build performance metrics
  const metrics = useMemo((): PerformanceMetrics => {
    // Sleep quality (7-day average)
    let sleepQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    if (sevenDaySleepAvg >= 7.5) sleepQuality = 'excellent';
    else if (sevenDaySleepAvg >= 7) sleepQuality = 'good';
    else if (sevenDaySleepAvg >= 6) sleepQuality = 'fair';
    else sleepQuality = 'poor';

    // Activity level
    let activityLevel: 'high' | 'moderate' | 'low' = 'moderate';
    if (progressPct >= 90) activityLevel = 'high';
    else if (progressPct >= 50) activityLevel = 'moderate';
    else activityLevel = 'low';

    // Calculate overall score (0-100)
    const sleepScore = Math.max(0, Math.min(100, sevenDaySleepAvg * 12.5)); // max 7.5h = 100
    const activityScore = progressPct;
    const workoutScore = sevenDayWorkoutAvg * 20; // max 5 = 100
    const overallScore = (sleepScore * 0.4 + activityScore * 0.35 + workoutScore * 0.25);

    return {
      sleepQuality,
      activityLevel,
      workoutQuality: sevenDayWorkoutAvg >= 3 ? Math.round(sevenDayWorkoutAvg) : null,
      overallScore: Math.round(overallScore),
    };
  }, [sevenDaySleepAvg, progressPct, sevenDayWorkoutAvg]);

  // Determine insight based on correlation
  const insight = useMemo((): SleepCorrelationInsight => {
    const sleepDebtHigh = sleepDebt > 3;
    const sleepDebtModerate = sleepDebt > 1;
    const activityHigh = progressPct >= 80;
    const activityLow = progressPct < 50;

    // Peak performance: good sleep + high activity
    if (!sleepDebtHigh && activityHigh) {
      return {
        type: 'peak-performance',
        title: 'En tu mejor momento',
        description: `Durmiendo ${sevenDaySleepAvg.toFixed(1)}h/noche en promedio con ${Math.round(progressPct)}% de actividad.`,
        actionTitle: 'Maximiza este pico',
        actionDescription: 'Planifica entrenamientos desafiantes para esta semana.',
        severity: 'success',
        icon: '⭐',
      };
    }

    // Sleep deprivation affecting activity
    if (sleepDebtHigh && activityLow) {
      return {
        type: 'sleep-deprivation',
        title: 'Necesitas descansar',
        description: `${sleepDebt.toFixed(1)}h de deuda de sueño está afectando tu movimiento.`,
        actionTitle: 'Prioriza el sueño',
        actionDescription: 'Apunta a dormir 8h hoy. Tu cuerpo lo necesita para recuperarse.',
        severity: 'critical',
        icon: '😴',
      };
    }

    // Pushing through: high sleep debt but maintaining activity
    if (sleepDebtHigh && activityHigh) {
      return {
        type: 'sleep-deprivation',
        title: 'Empujándote sin descanso',
        description: `${sleepDebt.toFixed(1)}h de deuda pero manteniéndote activo.`,
        actionTitle: 'Recuperación inmediata',
        actionDescription: 'Excelente disciplina, pero el sleep debt se acumula. Descansa bien hoy.',
        severity: 'warning',
        icon: '💪',
      };
    }

    // Recovery needed
    if (sleepDebtModerate && activityLow) {
      return {
        type: 'recovery-needed',
        title: 'Recuperándote',
        description: `Ligera deuda de sueño (${sleepDebt.toFixed(1)}h) con actividad reducida.`,
        actionTitle: 'Pausa activa',
        actionDescription: 'Camina ligero hoy, duerme bien. Mañana estarás mejor.',
        severity: 'info',
        icon: '👌',
      };
    }

    // Balanced state
    return {
      type: 'balanced',
      title: 'Buen balance',
      description: `Sueño y actividad están bien sincronizados.`,
      actionTitle: 'Mantén la rutina',
      actionDescription: 'Sigue con tu patrón actual. Funciona bien para ti.',
      severity: 'success',
      icon: '✅',
    };
  }, [sleepDebt, progressPct, sevenDaySleepAvg]);

  // Provide recommendations based on correlation
  const getRecommendations = useCallback(() => {
    const recs: string[] = [];

    if (sleepDebt > 2) {
      recs.push(`Acumulas ${sleepDebt.toFixed(1)}h de deuda. Intenta dormir 30 min extra durante 3 noches.`);
    }

    if (progressPct < 60 && sleepDebt < 2) {
      recs.push('Tu sueño es bueno pero necesitas más movimiento. Apunta a 8k+ pasos hoy.');
    }

    if (sevenDayWorkoutAvg < 3.5) {
      recs.push('Los entrenamientos recientes están siendo suaves. Intenta algo más desafiante.');
    }

    if (lastScore && lastScore < 6) {
      recs.push('La calidad de sueño última noche fue baja. Revisa factores de estrés y luz azul antes de dormir.');
    }

    if (recs.length === 0) {
      recs.push('Vas bien. Mantén la consistencia en sueño y actividad.');
    }

    return recs;
  }, [sleepDebt, progressPct, sevenDayWorkoutAvg, lastScore]);

  return {
    metrics,
    insight,
    recommendations: getRecommendations(),
    correlationScore: metrics.overallScore,
  };
}
