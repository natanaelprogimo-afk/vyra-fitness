import React from 'react';
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function WaterRemindersRedirect() {
  return <Redirect href={Routes.water.settings as any} />;
}
