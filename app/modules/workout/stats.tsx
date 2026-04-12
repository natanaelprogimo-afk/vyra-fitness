import React from 'react';
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function StatsRedirect() {
  return <Redirect href={Routes.workout.history as any} />;
}
