import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { setupNotificationResponseListener } from '@/lib/notifications';

export default function NotificationsBootstrap() {
  useNotifications();

  useEffect(() => {
    const unsubscribe = setupNotificationResponseListener(() => {});
    return unsubscribe;
  }, []);

  return null;
}
