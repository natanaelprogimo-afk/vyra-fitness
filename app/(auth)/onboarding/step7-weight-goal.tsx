import React from 'react';
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function LegacyRedirect() {
  return <Redirect href={Routes.auth.onboarding.meta as any} />;
}
