import React from 'react';
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function PrsRedirect() {
  return <Redirect href={Routes.workout.history as any} />;
}
