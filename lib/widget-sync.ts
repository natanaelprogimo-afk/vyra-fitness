import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { setWidgetData } from '@bittingz/expo-widgets';
import { captureError } from '@/lib/sentry';

export interface HomeWidgetSnapshot {
  widgetFocus?: string | null;
  score: number | null;
  weeklyAverage: number | null;
  streak: number;
  qualityStreak: number;
  pendingAction: string;
  pendingActionPath?: string | null;
  comparison: string;
  phaseName: string | null;
  phaseTone: 'neutral' | 'recovery' | 'push';
  phaseContext: string | null;
  koraName?: string | null;
  koraMood?: string | null;
  koraLine?: string | null;
  stepsCurrent?: number | null;
  stepsGoal?: number | null;
  waterCurrent?: number | null;
  waterGoal?: number | null;
  workoutWeeklySessions?: number | null;
  workoutProgramName?: string | null;
  workoutStatus?: string | null;
  sleepHours?: number | null;
  sleepGoalHours?: number | null;
  sleepScore?: number | null;
  recoveryScore?: number | null;
  recoveryStatus?: string | null;
  recoveryFocus?: string | null;
  nutritionCalories?: number | null;
  nutritionGoal?: number | null;
  nutritionProtein?: number | null;
  nutritionProteinGoal?: number | null;
  fastingHours?: number | null;
  fastingTargetHours?: number | null;
  fastingPhaseLabel?: string | null;
  weightCurrent?: number | null;
  weightDelta?: number | null;
  weightTrend?: string | null;
  weightUnit?: 'kg' | 'lb';
  volumeUnit?: 'ml' | 'oz';
  femalePhase?: string | null;
  femaleDaysRemaining?: number | null;
  femaleTip?: string | null;
  updatedAt: string;
}

function getAndroidPackageName(): string | null {
  const pkg = Constants.expoConfig?.android?.package;
  return typeof pkg === 'string' && pkg.trim().length > 0 ? pkg : null;
}

export function syncHomeWidgetSnapshot(snapshot: HomeWidgetSnapshot): boolean {
  if (Platform.OS !== 'android') return false;

  const packageName = getAndroidPackageName();
  if (!packageName) return false;

  try {
    setWidgetData(JSON.stringify(snapshot), packageName);
    return true;
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      action: 'widgetSync.syncHomeWidgetSnapshot',
    });
    return false;
  }
}
