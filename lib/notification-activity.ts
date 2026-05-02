import { supabase } from '@/lib/supabase';

export type NotificationActivityRow = Record<string, unknown>;

function normalizeDispatchRow(row: NotificationActivityRow, index: number): NotificationActivityRow {
  const notificationType =
    typeof row.notification_type === 'string' && row.notification_type.trim()
      ? row.notification_type.trim()
      : typeof row.type === 'string' && row.type.trim()
        ? row.type.trim()
        : 'contexto';

  const status =
    typeof row.status === 'string' && row.status.trim()
      ? row.status.trim()
      : null;

  return {
    ...row,
    id: row.id ?? `dispatch_${index}`,
    type: row.type ?? notificationType,
    notification_type: notificationType,
    category: row.category ?? row.provider ?? 'expo',
    kind: row.kind ?? status ?? notificationType,
    title: row.title ?? `Notificacion ${notificationType}`,
    body: row.body ?? row.error_message ?? 'Actividad reciente de notificaciones.',
    scheduled_for: row.scheduled_for ?? row.created_at ?? null,
  };
}

export async function loadRecentNotificationActivity(
  userId: string,
  limit = 4,
): Promise<NotificationActivityRow[]> {
  const { data, error } = await supabase
    .from('scheduled_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: false })
    .limit(limit);

  if (!error && Array.isArray(data) && data.length > 0) {
    return data as NotificationActivityRow[];
  }

  const { data: dispatchData, error: dispatchError } = await supabase
    .from('notification_dispatch_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (dispatchError) {
    throw dispatchError;
  }

  return (dispatchData ?? []).map((row, index) => normalizeDispatchRow(row as NotificationActivityRow, index));
}
