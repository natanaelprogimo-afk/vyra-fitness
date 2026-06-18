import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function HomeAliasRoute() {
  return <Redirect href={Routes.tabs.home as never} />;
}
