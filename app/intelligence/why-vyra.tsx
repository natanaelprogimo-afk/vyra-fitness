import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function IntelligenceWhyVyraRedirect() {
  return <Redirect href={Routes.tabs.home as any} />;
}

