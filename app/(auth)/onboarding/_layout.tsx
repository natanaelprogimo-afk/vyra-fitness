import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="step0-preview"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="step0-preview" />
      <Stack.Screen name="step1-conversation" />
      <Stack.Screen name="step1-goals" />
      <Stack.Screen name="step2-body" />
      <Stack.Screen name="step3-activity" />
      <Stack.Screen name="step4-schedule" />
      <Stack.Screen name="step5-premium" />
    </Stack>
  );
}
