import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { setWidgetData } from '@bittingz/expo-widgets';
import { captureError } from '@/lib/sentry';

export interface HomeWidgetSnapshot {
  score: number | null;
  weeklyAverage: number | null;
  streak: number;
  qualityStreak: number;
  pendingAction: string;
  comparison: string;
  phaseName: string | null;
  phaseTone: 'neutral' | 'recovery' | 'push';
  phaseContext: string | null;
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
