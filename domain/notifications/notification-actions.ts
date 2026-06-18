import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { isRecoverableOfflineError } from '@/lib/offline-errors';
import { queryClient } from '@/lib/query-client';
import { queueOfflineWaterLog } from '@/lib/water-offline';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutSummaryData } from '@/lib/workout-types';
import { calculateHydrationEquivalent } from '@/utils/calculations';
import { todayISO } from '@/utils/dates';

function getSignedInUserId() {
  return useAuthStore.getState().profile?.id ?? '';
}

export async function quickLogWaterFromNotification(amountMl = 250): Promise<boolean> {
  const userId = getSignedInUserId();
  const showToast = useUIStore.getState().showToast;
  const isOnline = useUIStore.getState().isOnline;

  if (!userId) {
    showToast('Primero necesitamos una sesión activa para guardar tu agua.', 'warning');
    return false;
  }

  const safeAmount = Math.max(100, Math.min(1000, Math.round(amountMl)));
  const hydrationEquivalent = calculateHydrationEquivalent(safeAmount, 'water');
  const loggedAtIso = new Date().toISOString();

  try {
    let savedOffline = !isOnline;

    if (isOnline) {
      const { error } = await supabase.from('water_logs').insert({
        user_id: userId,
        amount_ml: safeAmount,
        drink_type: 'water',
        hydration_equivalent_ml: hydrationEquivalent,
        logged_at: loggedAtIso,
      });

      if (!error) {
        void supabase.rpc('calculate_daily_score', { p_user_id: userId });
      } else if (!isRecoverableOfflineError(error)) {
        throw error;
      } else {
        savedOffline = true;
      }
    }

    if (savedOffline) {
      await queueOfflineWaterLog(userId, {
        amount_ml: safeAmount,
        drink_type: 'water',
        hydration_equivalent_ml: hydrationEquivalent,
        logged_at: loggedAtIso,
        logged_date: todayISO(),
      });
    }

    await queryClient.invalidateQueries({ queryKey: ['water_logs'] });
    await queryClient.invalidateQueries({ queryKey: ['water_history'] });
    await queryClient.invalidateQueries({ queryKey: ['today_summary'] });
    await queryClient.invalidateQueries({ queryKey: ['daily_score'] });

    showToast(`+${safeAmount}ml guardados desde la notificacion.`, 'success');
    return true;
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      action: 'notificationActions.quickLogWater',
    });
    showToast('No pudimos guardar tu agua desde la notificacion.', 'error');
    return false;
  }
}

export async function completeWorkoutFromNotification(): Promise<WorkoutSummaryData | null> {
  const workoutStore = useWorkoutStore.getState();
  const showToast = useUIStore.getState().showToast;

  if (!workoutStore.activeSession) {
    showToast('No hay una rutina activa para marcar ahora mismo.', 'info');
    return null;
  }

  try {
    const summary = await workoutStore.finishSession();
    if (!summary) {
      showToast('No pudimos cerrar tu rutina desde la notificacion.', 'warning');
      return null;
    }

    showToast('Rutina marcada desde la notificacion.', 'success');
    return summary;
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      action: 'notificationActions.completeWorkout',
    });
    showToast('No pudimos marcar la rutina desde la notificacion.', 'error');
    return null;
  }
}
