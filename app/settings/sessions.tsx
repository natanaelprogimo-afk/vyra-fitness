import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function SessionsRedirect() {
  return <Redirect href={Routes.settings.account as any} />;
}


