import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function ProfileNotificationsRedirect() {
  return <Redirect href={Routes.settings.notificationsSettings as any} />;
}


