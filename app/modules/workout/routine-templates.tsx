import React from 'react';
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function RoutineTemplatesRedirect() {
  return <Redirect href={Routes.workout.routineEditor as any} />;
}
