import { useMemo, useCallback } from 'react';
import { useWater } from './useWater';
import { useSteps } from './useSteps';

export interface HydrationInsight {
  type: 'optimal' | 'good' | 'fair' | 'low' | 'critical';
  title: string;
  description: string;
  actionTitle: string;
  actionDescription: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  icon: string;
}

export interface HydrationMetrics {
  dailyProgress: number; // 0-100
  remainingMl: number;
  hoursActive: number;
  daysStreak: number;
  hydrationStatus: 'on-track' | 'behind' | 'ahead' | 'critical';
}

/**
 * Provides intelligent hydration insights based on daily progress,
 * activity levels, and drinking patterns.
 */
export function useHydrationInsights() {
  const { totalHydro, goal, remaining, hydrationStreak, hourlyDistribution } = useWater();
  const { progressPct: activityPct } = useSteps();

  const dailyProgress = Math.round((totalHydro / goal) * 100);

  // Calculate hours since start of day
  const hoursActive = useMemo(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }, []);

  // Expected progress based on time of day
  const expectedProgress = useMemo(() => {
    // Assume goal should be distributed fairly evenly (8am-8pm = 12 hours)
    const activeHours = Math.max(0, Math.min(12, hoursActive - 8)); // 8am to 8pm
    return Math.round((activeHours / 12) * 100);
  }, [hoursActive]);

  // Hydration status
  const hydrationStatus = useMemo(() => {
    if (dailyProgress >= 100) return 'ahead' as const;
    if (dailyProgress >= expectedProgress - 10) return 'on-track' as const;
    if (dailyProgress >= 25) return 'behind' as const;
    return 'critical' as const;
  }, [dailyProgress, expectedProgress]);

  // Main insight
  const insight = useMemo((): HydrationInsight => {
    // Optimal: met goal early or on perfect track
    if (dailyProgress >= 100) {
      return {
        type: 'optimal',
        title: 'Meta alcanzada 🎉',
        description: `Tomaste ${totalHydro}ml de agua hoy. Excelente hidratación.`,
        actionTitle: 'Mantén el momentum',
        actionDescription: 'Considera un poco más si el día es caluroso o activo.',
        severity: 'success',
        icon: '✨',
      };
    }

    // Good: on track with expected consumption
    if (dailyProgress >= expectedProgress - 10 && dailyProgress >= 50) {
      return {
        type: 'good',
        title: 'Buen ritmo',
        description: `${dailyProgress}% del objetivo. Vas bien para el momento del día.`,
        actionTitle: 'Sigue adelante',
        actionDescription: 'Toma agua regularmente. Podrías alcanzar tu meta hoy.',
        severity: 'success',
        icon: '✓',
      };
    }

    // Fair: behind but recoverable
    if (dailyProgress >= 25) {
      const gap = Math.round(((expectedProgress - dailyProgress) / expectedProgress) * 100);
      return {
        type: 'fair',
        title: 'Ligero atraso',
        description: `${dailyProgress}% completado. Vas ${gap}% atrás del ideal para esta hora.`,
        actionTitle: 'Recupera ritmo',
        actionDescription: `Toma ${Math.round(remaining / 2)}ml en la próxima hora para ponerte al día.`,
        severity: 'info',
        icon: '⏱️',
      };
    }

    // Low: significantly behind
    if (dailyProgress > 0) {
      return {
        type: 'low',
        title: 'Necesitas hidratarte',
        description: `Solo ${totalHydro}ml hasta ahora. Te falta bastante para tu meta de ${goal}ml.`,
        actionTitle: 'Bebe ahora',
        actionDescription: `Necesitas ${Math.round(remaining)}ml más hoy. Divide en varios tragos.`,
        severity: 'warning',
        icon: '💧',
      };
    }

    // Critical: nothing consumed
    return {
      type: 'critical',
      title: 'Urgente: bebe agua',
      description: 'No has bebido nada hoy. La hidratación es crucial para tu salud.',
      actionTitle: 'Comienza ahora',
      actionDescription: `Tu meta es ${goal}ml hoy. Comienza con 250ml de agua en los próximos 15 minutos.`,
      severity: 'critical',
      icon: '⚠️',
    };
  }, [dailyProgress, expectedProgress, totalHydro, goal, remaining]);

  // Recommendations
  const recommendations = useCallback(() => {
    const recs: string[] = [];

    // Activity-based
    if (activityPct >= 80) {
      recs.push(`Alta actividad hoy (${Math.round(activityPct)}% de pasos). Aumenta ingesta a ${Math.round(goal * 1.2)}ml.`);
    } else if (activityPct >= 50) {
      recs.push('Actividad moderada. Mantén tu meta actual de agua.');
    }

    // Timing-based
    if (hoursActive < 10 && dailyProgress < 30) {
      recs.push('Todavía es temprano. Asegúrate de beber regularmente durante el día.');
    } else if (hoursActive > 16 && dailyProgress < 75) {
      recs.push(`Es tarde y aún te falta ${remaining}ml. Intenta tomarlo antes de las 8pm.`);
    }

    // Streak-based
    if (hydrationStreak.streakDays >= 7) {
      recs.push(`¡Llevas ${hydrationStreak.streakDays} días consecutivos! Mantén la racha.`);
    } else if (hydrationStreak.metToday) {
      recs.push('Estás en racha. Un día más y anotarás dos consecutivos.');
    }

    // Pattern-based
    if (hourlyDistribution && hourlyDistribution.valley) {
      const valleyLabel = hourlyDistribution.valley.label;
      recs.push(`Usualmente bebes menos alrededor de ${valleyLabel}. Establece recordatorio.`);
    }

    // Default if empty
    if (recs.length === 0) {
      recs.push('Bebe agua regularmente a lo largo del día para mantenerte hidratado.');
    }

    return recs;
  }, [activityPct, goal, hoursActive, dailyProgress, remaining, hydrationStreak, hourlyDistribution]);

  const metrics: HydrationMetrics = {
    dailyProgress,
    remainingMl: Math.max(0, remaining),
    hoursActive: Math.round(hoursActive * 10) / 10,
    daysStreak: hydrationStreak?.streakDays ?? 0,
    hydrationStatus,
  };

  return {
    insight,
    metrics,
    recommendations: recommendations(),
    hydrationScore: dailyProgress, // 0-100
    isOptimal: dailyProgress >= 100,
    isOnTrack: hydrationStatus === 'on-track' || hydrationStatus === 'ahead',
  };
}
