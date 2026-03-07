import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { supabase } from '@/lib/supabase';
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
  scheduleNotif,
  type NotifType,
} from '@/lib/notifications';
import { captureError } from '@/lib/sentry';

export interface NotifPreferences {
  water: boolean;
  sleep: boolean;
  mental: boolean;
  dailySummary: boolean;
  streakAtRisk: boolean;
  supplements: boolean;
  workout: boolean;
}

const GLOBAL_MAX_NOTIFS_PER_DAY = 3;

function parseIsoDay(value: string): string {
  return value.split('T')[0] ?? value;
}

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function isWithinSleepWindow(minutes: number, sleepStart: number, wake: number): boolean {
  if (sleepStart === wake) return false;
  if (sleepStart < wake) {
    return minutes >= sleepStart && minutes <= wake;
  }
  return minutes >= sleepStart || minutes <= wake;
}

function clampHour(hour: number, fallback = 11): number {
  if (!Number.isFinite(hour)) return fallback;
  return Math.max(8, Math.min(21, Math.round(hour)));
}

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(1);
}

export function useNotifications() {
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const settings = useSettingsStore();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smartNotifsSentToday, setSmartNotifsSentToday] = useState(0);
  const [smartNotifsDate, setSmartNotifsDate] = useState(parseIsoDay(new Date().toISOString()));
  const [prefs, setPrefs] = useState<NotifPreferences>({
    water: true,
    sleep: true,
    mental: true,
    dailySummary: true,
    streakAtRisk: true,
    supplements: true,
    workout: false,
  });

  const isWorkoutActive =
    pathname.includes('/modules/workout/session') ||
    pathname.includes('/modules/workout/active');
  const isFastingActive = pathname.includes('/modules/fasting');
  const isMentalCheckin = pathname.includes('/modules/mental');

  const requestPermissions = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
    return granted;
  }, []);

  useEffect(() => {
    void requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    if (profile?.id && permissionGranted) {
      void registerPushToken(profile.id);
    }
  }, [profile?.id, permissionGranted]);

  const getPreferredWaterReminderHour = useCallback(async (): Promise<number> => {
    if (!profile?.id) return 11;

    const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('water_logs')
      .select('logged_at')
      .eq('user_id', profile.id)
      .gte('logged_at', from)
      .order('logged_at', { ascending: false })
      .limit(120);

    if (error || !data?.length) return 11;

    const histogram = new Map<number, number>();
    for (const row of data) {
      const hour = new Date(row.logged_at).getHours();
      if (hour < 8 || hour > 21) continue;
      histogram.set(hour, (histogram.get(hour) ?? 0) + 1);
    }

    if (!histogram.size) return 11;
    const [bestHour] = [...histogram.entries()].sort((a, b) => b[1] - a[1])[0]!;
    return clampHour(bestHour);
  }, [profile?.id]);

  const getReminderCopy = useCallback(async () => {
    const displayName = profile?.name?.trim() || 'Tu racha';
    const waterGoal = profile?.water_goal_ml ?? 2200;

    if (!profile?.id) {
      return {
        waterTitle: '💧 Hora de hidratarte',
        waterBody: `${displayName}, hoy todavía podés acercarte a tu meta.`,
        streakTitle: '🔥 Tu racha está en peligro',
        streakBody: `${displayName}, hacé 1 log rápido hoy y la mantenés viva.`,
      };
    }

    const today = parseIsoDay(new Date().toISOString());
    const start = `${today}T00:00:00.000Z`;

    const [waterRes, logsRes] = await Promise.all([
      supabase
        .from('water_logs')
        .select('hydration_equivalent_ml, logged_at')
        .eq('user_id', profile.id)
        .gte('logged_at', start)
        .order('logged_at', { ascending: false })
        .limit(50),
      Promise.all([
        supabase.from('water_logs').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).gte('logged_at', start),
        supabase.from('step_logs').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('logged_date', today),
        supabase.from('meals').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).gte('logged_at', start),
        supabase.from('sleep_logs').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).gte('end_time', start),
        supabase.from('mental_checkins').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('check_date', today),
      ]),
    ]);

    const waterRows = waterRes.data ?? [];
    const totalMl = waterRows.reduce((sum, row) => sum + (row.hydration_equivalent_ml ?? 0), 0);
    const lastWaterAt = waterRows[0]?.logged_at ? new Date(waterRows[0].logged_at) : null;
    const hoursSinceWater = lastWaterAt
      ? Math.max(1, Math.round((Date.now() - lastWaterAt.getTime()) / (1000 * 60 * 60)))
      : null;

    const logsToday = logsRes.reduce((sum, result) => sum + (result.count ?? 0), 0);
    const hasNoLogsToday = logsToday === 0;

    const waterBody = hoursSinceWater
      ? `${displayName}, llevás ${hoursSinceWater}h desde tu último registro y hoy vas ${formatLiters(totalMl)}L/${formatLiters(waterGoal)}L.`
      : `${displayName}, hoy vas ${formatLiters(totalMl)}L de ${formatLiters(waterGoal)}L. Un vaso más ya cuenta.`;

    const streak = Math.max(0, profile?.streak ?? profile?.current_streak ?? 0);
    const streakBody = hasNoLogsToday
      ? `${displayName}, tu racha de ${streak} días termina hoy. Un log de 10 segundos la salva.`
      : `${displayName}, te falta un último empujón para cerrar tu día y proteger la racha de ${streak} días.`;

    return {
      waterTitle: '💧 Recordatorio inteligente',
      waterBody,
      streakTitle: '🔥 Racha en riesgo',
      streakBody,
    };
  }, [profile?.current_streak, profile?.id, profile?.name, profile?.streak, profile?.water_goal_ml]);

  const setupAllNotifications = useCallback(async () => {
    if (!permissionGranted || !settings.notificationsEnabled) {
      await cancelAllNotifs();
      return;
    }

    setLoading(true);
    try {
      await cancelAllNotifs();

      const cap = Math.max(
        1,
        Math.min(settings.maxNotifsPerDay ?? GLOBAL_MAX_NOTIFS_PER_DAY, GLOBAL_MAX_NOTIFS_PER_DAY),
      );

      const wakeMinutes = profile?.wake_time_minutes ?? 420;
      const sleepMinutes = profile?.sleep_time_minutes ?? 1380;
      const wakeHour = Math.max(6, Math.min(10, Math.floor(wakeMinutes / 60)));
      const wakeMinute = wakeMinutes % 60;
      const waterHour = await getPreferredWaterReminderHour();
      const copy = await getReminderCopy();

      const plans: Array<() => Promise<void>> = [];

      if (prefs.streakAtRisk) {
        plans.push(() => scheduleStreakAtRisk({ title: copy.streakTitle, body: copy.streakBody, hour: 21, minute: 0 }));
      } else {
        plans.push(() => cancelNotifsByType('streak_at_risk'));
      }

      if (prefs.sleep) {
        const sleepHour = Math.floor(sleepMinutes / 60);
        const sleepMinute = sleepMinutes % 60;
        plans.push(() => scheduleSleepReminder(sleepHour, sleepMinute));
      } else {
        plans.push(() => cancelNotifsByType('sleep_bedtime'));
      }

      if (prefs.dailySummary) {
        plans.push(() => scheduleDailySummaryReminder(21, 0));
      } else {
        plans.push(() => cancelNotifsByType('daily_summary'));
      }

      if (prefs.water) {
        plans.push(() => scheduleWaterReminders(
          [{ hour: waterHour, minute: 0 }],
          { title: copy.waterTitle, body: copy.waterBody },
        ));
      } else {
        plans.push(() => cancelNotifsByType('water_reminder'));
      }

      if (prefs.mental) {
        plans.push(() => scheduleMentalCheckinReminder(wakeHour, wakeMinute));
      } else {
        plans.push(() => cancelNotifsByType('mental_checkin'));
      }

      const selected = plans.slice(0, cap);
      await Promise.all(selected.map((run) => run()));
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useNotifications.setupAll',
      });
    } finally {
      setLoading(false);
    }
  }, [
    getReminderCopy,
    getPreferredWaterReminderHour,
    permissionGranted,
    prefs.dailySummary,
    prefs.mental,
    prefs.sleep,
    prefs.streakAtRisk,
    prefs.water,
    profile?.sleep_time_minutes,
    profile?.wake_time_minutes,
    settings.maxNotifsPerDay,
    settings.notificationsEnabled,
  ]);

  const scheduleSmartNotification = useCallback(
    async (input: {
      type: NotifType;
      title: string;
      body: string;
      date: Date;
      id?: string;
    }) => {
      if (!permissionGranted || !settings.notificationsEnabled) return false;
      if (isWorkoutActive || isFastingActive || isMentalCheckin) return false;

      const today = parseIsoDay(new Date().toISOString());
      if (today !== smartNotifsDate) {
        setSmartNotifsDate(today);
        setSmartNotifsSentToday(0);
      }

      const cap = Math.max(
        1,
        Math.min(settings.maxNotifsPerDay ?? GLOBAL_MAX_NOTIFS_PER_DAY, GLOBAL_MAX_NOTIFS_PER_DAY),
      );
      if (smartNotifsSentToday >= cap) return false;

      const sleepStart = profile?.sleep_time_minutes ?? 1320; // default 22:00
      const wake = profile?.wake_time_minutes ?? 420;         // default 7:00
      const targetMinutes = toMinutes(input.date);
      if (isWithinSleepWindow(targetMinutes, sleepStart, wake)) return false;

      const id = input.id ?? `${input.type}_${Date.now()}`;
      const result = await scheduleNotif({
        id,
        type: input.type,
        title: input.title,
        body: input.body,
        trigger: { date: input.date } as any,
      });

      if (!result) return false;
      setSmartNotifsSentToday((prev) => prev + 1);
      return true;
    },
    [
      isFastingActive,
      isMentalCheckin,
      isWorkoutActive,
      permissionGranted,
      profile?.sleep_time_minutes,
      profile?.wake_time_minutes,
      settings.maxNotifsPerDay,
      settings.notificationsEnabled,
      smartNotifsDate,
      smartNotifsSentToday,
    ],
  );

  useEffect(() => {
    void setupAllNotifications();
  }, [setupAllNotifications]);

  const updatePref = useCallback((key: keyof NotifPreferences, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

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
    disableAll,
    requestPermissions,
    setupAllNotifications,
    scheduleSmartNotification,
    smartNotifsSentToday,
  };
}
