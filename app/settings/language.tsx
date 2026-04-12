
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function SettingsLanguageRedirect() {
  return <Redirect href={Routes.settings.appearance as any} />;
}
