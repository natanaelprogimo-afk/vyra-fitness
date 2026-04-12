import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function CoachRoute() {
  return <Redirect href={Routes.coach.index as any} />;
}
