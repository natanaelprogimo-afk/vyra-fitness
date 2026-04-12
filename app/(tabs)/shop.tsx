import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function TabsShopRedirect() {
  return <Redirect href={Routes.store.shop as any} />;
}
