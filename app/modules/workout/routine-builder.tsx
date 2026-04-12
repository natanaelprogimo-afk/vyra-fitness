import React from 'react';
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function RoutineBuilderRedirect() {
  return <Redirect href={Routes.workout.routineEditor as any} />;
}
