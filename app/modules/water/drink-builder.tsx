import React from 'react';
import { Redirect } from 'expo-router';
import { Routes } from '@/constants/routes';

export default function DrinkBuilderRedirect() {
  return <Redirect href={Routes.water.index as any} />;
}
