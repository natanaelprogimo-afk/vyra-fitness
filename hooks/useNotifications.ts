import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  requestNotificationPermissions,
  registerPushToken,
  scheduleWaterReminders,
  scheduleSleepReminder,
  scheduleMentalCheckinReminder,
  scheduleDailySummaryReminder,
  scheduleStreakAtRisk,
  cancelAllNotifs,
  cancelNotifsByType,
} from '@/lib/notifications';
import { captureError } from '@/lib/sentry';

export interface NotifPreferences {
  water:         boolean;
  sleep:         boolean;
  mental:        boolean;
  dailySummary:  boolean;
  streakAtRisk:  boolean;
  supplements:   boolean;
  workout:       boolean;
}

export function useNotifications() {
  const { profile } = useAuthStore();
  const settings    = useSettingsStore();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading,           setLoading]            = useState(false);
  const [prefs,             setPrefs]              = useState<NotifPreferences>({
    water:        true,
    sleep:        true,
    mental:       true,
    dailySummary: true,
    streakAtRisk: true,
    supplements:  true,
    workout:      false,
  });

  // Solicitar permisos al montar
  useEffect(() => {
    requestNotificationPermissions().then(setPermissionGranted);
  }, []);

  // Registrar token push cuando hay perfil
  useEffect(() => {
    if (profile?.id && permissionGranted) {
      registerPushToken(profile.id);
    }
  }, [profile?.id, permissionGranted]);

  // ── Programar TODAS las notificaciones según preferencias del usuario ──
  const setupAllNotifications = useCallback(async () => {
    if (!permissionGranted || !settings.notificationsEnabled) {
      await cancelAllNotifs();
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        // Agua — 3 recordatorios base (9h, 13h, 17h)
        prefs.water
          ? scheduleWaterReminders([
              { hour: 9,  minute: 0 },
              { hour: 13, minute: 0 },
              { hour: 17, minute: 0 },
            ])
          : cancelNotifsByType('water_reminder'),

        // Sueño — default 23:00 o del perfil
        prefs.sleep
          ? scheduleSleepReminder(
              profile?.sleep_goal_hours ? 23 : 23,
              0,
            )
          : cancelNotifsByType('sleep_bedtime'),

        // Mental — 8:30
        prefs.mental
          ? scheduleMentalCheckinReminder(8, 30)
          : cancelNotifsByType('mental_checkin'),

        // Resumen — 21:00
        prefs.dailySummary
          ? scheduleDailySummaryReminder(21, 0)
          : cancelNotifsByType('daily_summary'),

        // Racha en peligro — 20:00
        prefs.streakAtRisk
          ? scheduleStreakAtRisk()
          : cancelNotifsByType('streak_at_risk'),
      ]);
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { action: "useNotifications.setupAll" });
    } finally {
      setLoading(false);
    }
  }, [permissionGranted, settings.notificationsEnabled, prefs, profile]);

  // Re-configurar cuando cambian preferencias globales
  useEffect(() => {
    setupAllNotifications();
  }, [settings.notificationsEnabled]);

  const updatePref = useCallback(
    async (key: keyof NotifPreferences, value: boolean) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
      // No llamamos setupAll aquí para no hacer muchos reschedules
      // El usuario debe presionar "Guardar" o hacemos debounce
    },
    [],
  );

  const savePrefs = useCallback(async () => {
    await setupAllNotifications();
  }, [setupAllNotifications]);

  const disableAll = useCallback(async () => {
    await cancelAllNotifs();
    settings.setNotificationsEnabled(false);
  }, [settings]);

  return {
    permissionGranted,
    loading,
    prefs,
    updatePref,
    savePrefs,
    setupAllNotifications,
    disableAll,
  };
}


