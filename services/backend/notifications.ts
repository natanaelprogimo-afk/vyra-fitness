import { asRecord, getAuthHeaders, getBackendUrl, requestJson } from '@/services/backend/client';

export interface NotificationAdaptivePlan {
  deliveryMode?: 'local' | 'remote';
  remoteReady?: boolean;
  timezoneOffsetMinutes?: number | null;
  water?: { hour?: number; minute?: number };
  sleep?: { hour?: number; minute?: number };
  mental?: { hour?: number; minute?: number };
  summary?: { hour?: number; minute?: number };
  streak?: { hour?: number; minute?: number };
  copy?: {
    waterTitle?: string;
    waterBody?: string;
    streakTitle?: string;
    streakBody?: string;
  };
}

export interface NotificationTodayCount {
  date: string;
  scheduled: number;
  opened: number;
  actioned: number;
}

export async function getNotificationAdaptivePlan(): Promise<NotificationAdaptivePlan | null> {
  if (!getBackendUrl()) return null;

  try {
    const headers = await getAuthHeaders();
    const response = await requestJson('/api/notifications/adaptive-plan', {
      method: 'GET',
      headers,
    });

    if (!response.ok) return null;
    return (asRecord(response.data) ?? null) as NotificationAdaptivePlan | null;
  } catch {
    return null;
  }
}

export async function getNotificationTodayCount(): Promise<NotificationTodayCount | null> {
  if (!getBackendUrl()) return null;

  try {
    const headers = await getAuthHeaders();
    const response = await requestJson('/api/notifications/engagement/today-count', {
      method: 'GET',
      headers,
    });

    if (!response.ok) return null;
    return (asRecord(response.data) ?? null) as NotificationTodayCount | null;
  } catch {
    return null;
  }
}

export async function getNotificationLowHours(type: string): Promise<number[]> {
  if (!getBackendUrl()) return [];

  try {
    const headers = await getAuthHeaders();
    const response = await requestJson(
      `/api/notifications/engagement/low-hours?type=${encodeURIComponent(type)}`,
      {
        method: 'GET',
        headers,
      },
    );

    if (!response.ok) return [];
    const payload = asRecord(response.data);
    return Array.isArray(payload?.hours)
      ? payload.hours.map((item) => Number(item)).filter((value) => Number.isFinite(value))
      : [];
  } catch {
    return [];
  }
}

