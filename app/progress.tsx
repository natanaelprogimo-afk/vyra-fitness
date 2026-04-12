import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function ProgressRoute() {
	return <Redirect href={Routes.log as any} />;
}
