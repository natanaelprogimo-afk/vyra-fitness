import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="step-goals"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="setup-transition" />
      <Stack.Screen name="step-goals" />
      <Stack.Screen name="step-equipment" />
      <Stack.Screen name="step-modules" />
      <Stack.Screen name="step-ready" />
    </Stack>
  );
}
