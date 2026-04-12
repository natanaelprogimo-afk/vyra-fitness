import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function NutritionModeRedirect() {
  return <Redirect href={Routes.nutrition.log as any} />;
}
