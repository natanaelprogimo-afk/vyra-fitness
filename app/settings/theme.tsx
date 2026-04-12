import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function SettingsThemeRedirect() {
  return <Redirect href={Routes.settings.appearance as any} />;
}
