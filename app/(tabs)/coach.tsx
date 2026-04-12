import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function TabsCoachRedirect() {
  return <Redirect href={Routes.coach.index as any} />;
}
