import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function ExploreAliasRoute() {
  return <Redirect href={Routes.tabs.explore as never} />;
}
