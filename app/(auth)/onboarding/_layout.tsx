import React from 'react';
import { Stack, useRouter } from 'expo-router';

export default function OnboardingLayout() {
  const router = useRouter();

  return (
    <Stack
      initialRouteName="setup-transition"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="setup-transition" />
      <Stack.Screen name="setup-mode" />
      <Stack.Screen name="step-goal" />
      <Stack.Screen name="step-age" />
      <Stack.Screen name="step-activity" />
      <Stack.Screen name="step-modules" />
      <Stack.Screen name="step-nutrition" />
      <Stack.Screen name="step-equipment" />
      <Stack.Screen name="step-equipment-inventory" />
      <Stack.Screen name="step-fasting" />
      <Stack.Screen name="step-sleep" />
      <Stack.Screen name="step-steps" />
      <Stack.Screen name="step-female" />
      <Stack.Screen name="step-ready" />
      <Stack.Screen name="express-goal" />
      <Stack.Screen name="express-weight" />
      <Stack.Screen name="express-ready" />
    </Stack>
  );
}
