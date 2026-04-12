import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function ProfileNotificationsHistoryRedirect() {
  return <Redirect href={Routes.settings.notificationsHistory as any} />;
}
