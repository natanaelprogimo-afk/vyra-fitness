import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function DailySummaryRedirect() {
  return <Redirect href={Routes.tabs.progress as never} />;
}
